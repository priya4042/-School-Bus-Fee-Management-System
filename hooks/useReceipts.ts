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
  const monthsCoveredRows = Math.ceil(monthsCovered.length / 2);
  const monthsSectionHeight = 20 + (monthsCoveredRows * 9);

  // Header background
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 210, 45, 'F');
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 37, 210, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('School Bus WayPro', 20, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Bus Fee Payment Receipt', 20, 32);

  // Receipt number badge
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);
  doc.roundedRect(135, 10, 65, 25, 4, 4, 'F');
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT NO.', 140, 20);
  doc.setFontSize(11);
  doc.text(receiptNo, 140, 30);

  // Divider
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 55, 190, 55);

  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(52, 211, 153);
  doc.roundedRect(136, 58, 54, 9, 2, 2, 'FD');
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PAID - VERIFIED', 141, 64.2);

  // Section: Receipt Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('PAYMENT DETAILS', 20, 66);

  const rows: [string, string][] = [
    ['Receipt No', receiptNo],
    ['Transaction ID', txnId],
    ['Payment Date & Time', paidDateTime],
    ['Payment Method', paymentMethod],
    ['Billing Period', due.billing_period_label || `${MONTHS[(due.month || 1) - 1]} ${due.year}`],
    ['Months Covered', String(monthsCovered.length)],
    ['Due Date', formatDateOnly(due.due_date)],
    ['Fine Cutoff Date', formatDateOnly(due.last_date)],
    ['Payment Status', 'PAID ✓'],
  ];

  let y = 76;
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(String(value), 90, y);
    y += 11;
  });

  // Divider
  doc.line(20, y + 3, 190, y + 3);
  y += 12;

  // Section: Student Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, y - 4, 170, 58, 4, 4, 'FD');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('STUDENT DETAILS', 28, y + 4);
  y += 14;

  const studentRows: [string, string][] = [
    ['Full Name', student.full_name || 'N/A'],
    ['Admission Number', student.admission_number || due.admission_number || 'N/A'],
    ['Class', String(grade)],
    ['Section', String(section)],
    ['Bus Number', String(busNumber)],
  ];

  studentRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(label, 28, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(String(value), 98, y);
    y += 11;
  });

  y += 3;

  // Divider
  doc.line(20, y + 3, 190, y + 3);
  y += 12;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, y, 170, monthsSectionHeight, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.text('MONTHS COVERED', 30, y + 12);

  let monthsY = y + 22;
  monthsCovered.forEach((item: any, index: number) => {
    const labelX = index % 2 === 0 ? 30 : 112;
    const amountX = index % 2 === 0 ? 104 : 186;
    if (index > 0 && index % 2 === 0) {
      monthsY += 9;
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(`• ${String(item.label)}`, labelX, monthsY);

    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${Number(item.amount || 0).toLocaleString('en-IN')}`, amountX, monthsY, { align: 'right' });
  });

  y += monthsSectionHeight + 12;

  // Prevent clipped content at the bottom for larger receipts.
  if (y + 92 > 287) {
    doc.addPage();
    y = 20;
  }

  // Fee Breakdown box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, y, 170, 68, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.text('FEE BREAKDOWN', 30, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text('Base Fee', 30, y + 25);
  doc.text(`Rs. ${baseFee.toLocaleString('en-IN')}`, 160, y + 25, { align: 'right' });

  doc.text('Late Fee', 30, y + 37);
  doc.text(`Rs. ${lateFee.toLocaleString('en-IN')}`, 160, y + 37, { align: 'right' });

  doc.text('Discount', 30, y + 49);
  doc.text(`Rs. ${discount.toLocaleString('en-IN')}`, 160, y + 49, { align: 'right' });

  // Total
  doc.setFillColor(30, 64, 175);
  doc.rect(20, y + 55, 170, 13, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('TOTAL PAID', 30, y + 64);
  doc.text(`Rs. ${totalPaid.toLocaleString('en-IN')}`, 160, y + 64, { align: 'right' });

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const footerStartY = Math.min(283, y + 82);
  doc.text('This is a computer-generated receipt and does not require a physical signature.', 20, footerStartY);
  doc.text('For queries, contact Bus Administration.', 20, footerStartY + 7);
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 20, footerStartY + 14);
  doc.text(`System Reference: ${due.id || 'N/A'}`, 20, footerStartY + 21);

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
