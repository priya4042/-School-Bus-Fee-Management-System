import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { showAlert } from '../lib/swal';
import jsPDF from 'jspdf';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const RECEIPT_FETCH_TIMEOUT_MS = 1500;

const pickFirst = (...values: any[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text && text.toLowerCase() !== 'null' && text.toLowerCase() !== 'undefined') {
      return value;
    }
  }
  return '';
};

const normalizeStudentInfo = (due: any) => {
  const rawStudent = Array.isArray(due?.students) ? due.students[0] : due?.students;
  const student = rawStudent || due?.student || {};
  const nestedBus = Array.isArray(student?.buses) ? student.buses[0] : student?.buses;

  const fullName = pickFirst(student?.full_name, due?.student_name, due?.studentName, 'Student');
  const admissionNumber = pickFirst(student?.admission_number, due?.admission_number, due?.admissionNumber, 'N/A');
  const grade = pickFirst(student?.grade, student?.class, student?.class_name, due?.grade, due?.class, due?.class_name, 'N/A');
  const section = pickFirst(student?.section, due?.section, due?.division, 'N/A');
  const busNumber = pickFirst(
    due?.bus_number,
    student?.bus_number,
    student?.bus_no,
    nestedBus?.bus_number,
    nestedBus?.plate,
    due?.bus_no,
    'N/A'
  );

  return {
    student: {
      ...student,
      full_name: String(fullName || 'Student'),
      admission_number: String(admissionNumber || 'N/A'),
      grade: String(grade || 'N/A'),
      section: String(section || 'N/A'),
      bus_number: String(busNumber || 'N/A'),
    },
    busNumber: String(busNumber || 'N/A'),
  };
};

const formatDateTime = (value?: string) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateOnly = (value?: string) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getMonthLabel = (month?: number, year?: number) => {
  const monthIndex = Math.max(0, Number(month || 1) - 1);
  return `${MONTHS[monthIndex] || 'Month'} ${year || ''}`.trim();
};

const getPeriodValue = (due: any) => Number(due?.year || 0) * 12 + Number(due?.month || 0);

const extractReceiptMonths = (due: any) => {
  if (Array.isArray(due?.payment_months) && due.payment_months.length > 0) {
    return due.payment_months.map((item: any) => ({
      label: String(item?.label || getMonthLabel(item?.month, item?.year)),
      amount: Number(item?.amount || item?.total || 0),
      baseAmount: Number(item?.baseAmount || item?.base_amount || 0),
      lateFee: Number(item?.lateFee || item?.late_fee || 0),
    }));
  }

  return [{
    label: getMonthLabel(due?.month, due?.year),
    amount: Number(due?.total_due || due?.amount || 0),
    baseAmount: Number(due?.amount || due?.base_fee || due?.total_due || 0),
    lateFee: Number(due?.late_fee || 0),
  }];
};

const buildReceiptAggregate = (rows: any[], paymentId: string | number, txnId?: string) => {
  const orderedRows = [...(rows || [])].sort((left, right) => getPeriodValue(left) - getPeriodValue(right));
  const primary = orderedRows[0] || { id: paymentId, transaction_id: txnId };
  const normalized = normalizeStudentInfo(primary);
  const paymentMonths = orderedRows.map((row) => ({
    label: getMonthLabel(row.month, row.year),
    month: Number(row.month || 0),
    year: Number(row.year || 0),
    amount: Number(row.total_due || row.amount || 0),
    baseAmount: Number(row.amount || row.base_fee || row.total_due || 0),
    lateFee: Number(row.late_fee || 0),
  }));

  const firstMonth = paymentMonths[0]?.label || getMonthLabel(primary.month, primary.year);
  const lastMonth = paymentMonths[paymentMonths.length - 1]?.label || firstMonth;

  return {
    ...primary,
    id: primary.id || paymentId,
    transaction_id: primary.transaction_id || txnId || primary.id || paymentId,
    total_due: paymentMonths.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    amount: paymentMonths.reduce((sum, item) => sum + Number(item.baseAmount || 0), 0),
    late_fee: paymentMonths.reduce((sum, item) => sum + Number(item.lateFee || 0), 0),
    discount: Number(primary.discount || 0),
    due_date: primary.due_date,
    last_date: primary.last_date,
    payment_method: primary.payment_method || primary.method || 'ONLINE',
    month: Number(primary.month || new Date().getMonth() + 1),
    year: Number(primary.year || new Date().getFullYear()),
    paid_at: primary.paid_at || primary.date || primary.payment_date || new Date().toISOString(),
    students: normalized.student,
    bus_number: normalized.busNumber,
    payment_months: paymentMonths,
    billing_period_label: paymentMonths.length > 1 ? `${firstMonth} to ${lastMonth}` : firstMonth,
  };
};

const generateReceiptPDF = (due: any) => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const normalized = normalizeStudentInfo(due);
  const student = normalized.student || {};
  const txnId = due.transaction_id || due.id;
  const paidDateTime = formatDateTime(due.paid_at || new Date().toISOString());
  const receiptNo = `RCP-${String(txnId).slice(-8).toUpperCase()}`;
  const paymentMethod = String(due.payment_method || due.method || 'ONLINE').toUpperCase();
  const busNumber = normalized.busNumber;
  const grade = student.grade || 'N/A';
  const section = student.section || 'N/A';
  const baseFee = Number(due.amount || 0);
  const lateFee = Number(due.late_fee || 0);
  const discount = Number(due.discount || 0);
  const totalPaid = Number(due.total_due || due.amount || 0);
  const monthsCovered = extractReceiptMonths(due);
  const billingPeriod = due.billing_period_label || `${MONTHS[(due.month || 1) - 1]} ${due.year}`;
  const margin = 14;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;

  // Header band (invoice style)
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('School Bus WayPro', margin, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Bus Fee Payment Invoice', margin, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INVOICE', pageWidth - margin, 13, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Invoice No: ${receiptNo}`, pageWidth - margin, 20, { align: 'right' });

  // Summary cards
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 36, 88, 40, 2.5, 2.5, 'FD');
  doc.roundedRect(pageWidth - margin - 88, 36, 88, 40, 2.5, 2.5, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BILL TO', margin + 4, 42);
  doc.text('PAYMENT DETAILS', pageWidth - margin - 84, 42);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const billToRows = [
    String(student.full_name || 'Student'),
    `Admission: ${String(student.admission_number || due.admission_number || 'N/A')}`,
    `Class: ${String(grade)}   Section: ${String(section)}`,
    `Bus: ${String(busNumber)}`,
  ];
  billToRows.forEach((line, index) => doc.text(line, margin + 4, 49 + index * 6));

  const paymentRows = [
    `Txn: ${String(txnId)}`,
    `Date: ${paidDateTime}`,
    `Method: ${paymentMethod}`,
    `Status: PAID - VERIFIED`,
  ];
  paymentRows.forEach((line, index) => doc.text(line, pageWidth - margin - 84, 49 + index * 6));

  // Line-items table
  let y = 84;
  doc.setFillColor(30, 64, 175);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('#', margin + 3, y + 5.2);
  doc.text('DESCRIPTION', margin + 12, y + 5.2);
  doc.text('PERIOD', margin + 88, y + 5.2);
  doc.text('AMOUNT', pageWidth - margin - 3, y + 5.2, { align: 'right' });

  y += 8;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const rowHeight = 6;
  monthsCovered.forEach((item: any, index: number) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    doc.text(String(index + 1), margin + 3, y + 4.3);
    doc.text('School Bus Fee', margin + 12, y + 4.3);
    doc.text(String(item.label), margin + 88, y + 4.3);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${Number(item.amount || 0).toLocaleString('en-IN')}`, pageWidth - margin - 3, y + 4.3, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += rowHeight;
  });

  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, 84, contentWidth, y - 84);

  // Summary box
  y += 6;
  const summaryX = pageWidth - margin - 84;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX, y, 84, 38, 2.5, 2.5, 'FD');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('INVOICE SUMMARY', summaryX + 4, y + 6);

  const summaryRows: Array<[string, number]> = [
    ['Base Fee', baseFee],
    ['Late Fee', lateFee],
    ['Discount', discount],
  ];
  let summaryY = y + 12;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  summaryRows.forEach(([label, value]) => {
    doc.text(label, summaryX + 4, summaryY);
    doc.text(`Rs. ${Number(value || 0).toLocaleString('en-IN')}`, summaryX + 80, summaryY, { align: 'right' });
    summaryY += 6.2;
  });

  doc.setFillColor(30, 64, 175);
  doc.rect(summaryX, y + 26, 84, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('TOTAL PAID', summaryX + 4, y + 33.5);
  doc.text(`Rs. ${totalPaid.toLocaleString('en-IN')}`, summaryX + 80, y + 33.5, { align: 'right' });

  // Billing period and footer note
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Billing Period: ${billingPeriod} (${monthsCovered.length} month${monthsCovered.length > 1 ? 's' : ''})`, margin, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('This is a computer-generated invoice and does not require a physical signature.', margin, 285);
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')} | Reference: ${due.id || 'N/A'}`, margin, 289);

  doc.save(`Receipt_${txnId}.pdf`);
};

export const useReceipts = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const normalizeDueShape = (raw: any, paymentId: string | number, txnId?: string) => {
    if (!raw) return null;
    if (Array.isArray(raw.payment_months) && raw.payment_months.length > 0) {
      return buildReceiptAggregate([raw], paymentId, txnId);
    }

    const normalized = normalizeStudentInfo(raw);
    return {
      ...raw,
      id: raw.id || paymentId,
      transaction_id: raw.transaction_id || txnId || raw.id || paymentId,
      total_due: Number(raw.total_due || raw.amount_paid || raw.amount || 0),
      amount: Number(raw.amount || raw.base_fee || raw.total_due || raw.amount_paid || 0),
      late_fee: Number(raw.late_fee || 0),
      discount: Number(raw.discount || 0),
      due_date: raw.due_date,
      last_date: raw.last_date,
      payment_method: raw.payment_method || raw.method || 'ONLINE',
      month: Number(raw.month || new Date().getMonth() + 1),
      year: Number(raw.year || new Date().getFullYear()),
      paid_at: raw.paid_at || raw.date || raw.payment_date || new Date().toISOString(),
      students: normalized.student,
      bus_number: normalized.busNumber,
      payment_months: Array.isArray(raw.payment_months) ? raw.payment_months : undefined,
      billing_period_label: raw.billing_period_label,
    };
  };

  const hasCoreStudentFields = (due: any) => {
    const student = Array.isArray(due?.students) ? due.students[0] : due?.students;
    const fullName = String(student?.full_name || due?.student_name || due?.studentName || '').trim();
    const admission = String(student?.admission_number || due?.admission_number || '').trim();
    return Boolean(fullName && fullName.toLowerCase() !== 'student' && admission && admission.toLowerCase() !== 'n/a');
  };

  const fetchDueWithTimeout = async (paymentId: string | number, txnId?: string) => {
    const fetchPromise = (async () => {
      if (txnId) {
        const multiResult = await supabase
          .from('monthly_dues')
          .select('*, students(full_name, admission_number, grade, section, buses(bus_number, plate))')
          .eq('transaction_id', String(txnId))
          .order('year', { ascending: true })
          .order('month', { ascending: true });

        if (!multiResult.error && Array.isArray(multiResult.data) && multiResult.data.length > 0) {
          return multiResult;
        }
      }

      return supabase
        .from('monthly_dues')
        .select('*, students(full_name, admission_number, grade, section, buses(bus_number, plate))')
        .eq('id', String(paymentId))
        .single();
    })();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Receipt fetch timeout')), RECEIPT_FETCH_TIMEOUT_MS);
    });

    return Promise.race([fetchPromise, timeoutPromise]) as Promise<any>;
  };

  const downloadReceipt = async (paymentId: string | number, txnId?: string, dueSnapshot?: any) => {
    setDownloading(String(paymentId));
    try {
      // Generate immediately only when snapshot already has core student details.
      const immediateDue = normalizeDueShape(dueSnapshot, paymentId, txnId);
      if (immediateDue && hasCoreStudentFields(immediateDue)) {
        generateReceiptPDF(immediateDue);
        return;
      }

      // Fallback: short timed fetch for missing details.
      const result = await fetchDueWithTimeout(paymentId, txnId);
      const due = (result as any)?.data;
      const error = (result as any)?.error;
      if (error || !due) {
        const minimalDue = normalizeDueShape({ id: paymentId, transaction_id: txnId }, paymentId, txnId);
        generateReceiptPDF(minimalDue);
        return;
      }

      const normalizedDue = Array.isArray(due)
        ? buildReceiptAggregate(due, paymentId, txnId)
        : normalizeDueShape(due, paymentId, txnId);
      generateReceiptPDF(normalizedDue || immediateDue);
    } catch (err: any) {
      // Last-resort fallback still generates a receipt skeleton instantly.
      try {
        const minimalDue = normalizeDueShape({ id: paymentId, transaction_id: txnId }, paymentId, txnId);
        generateReceiptPDF(minimalDue);
      } catch (fallbackErr) {
        console.error('Receipt download failed:', err, fallbackErr);
        showAlert('Receipt Error', err?.message || 'Could not generate receipt. Please try again.', 'error');
      }
    } finally {
      setDownloading(null);
    }
  };

  return { downloadReceipt, downloading };
};
