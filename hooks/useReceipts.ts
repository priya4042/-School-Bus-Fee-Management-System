import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { showAlert, showToast } from '../lib/swal';
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
    nestedBus?.plate,
    student?.plate,
    due?.bus_number,
    student?.bus_number,
    student?.bus_no,
    nestedBus?.bus_number,
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

const drawLogo = (doc: any, x: number, y: number, size: number) => {
  // Rounded square background (like the app icon)
  doc.setFillColor(30, 64, 175);
  doc.roundedRect(x, y, size, size, size * 0.22, size * 0.22, 'F');
  // Bus body
  doc.setFillColor(255, 255, 255);
  const bx = x + size * 0.15;
  const by = y + size * 0.2;
  const bw = size * 0.7;
  const bh = size * 0.42;
  doc.roundedRect(bx, by, bw, bh, size * 0.06, size * 0.06, 'F');
  // Windshield
  doc.setFillColor(200, 220, 255);
  doc.rect(bx + bw * 0.08, by + bh * 0.1, bw * 0.84, bh * 0.4, 'F');
  // Bus stripe
  doc.setFillColor(245, 158, 11);
  doc.rect(bx, by + bh * 0.55, bw, bh * 0.15, 'F');
  // Wheels
  doc.setFillColor(30, 41, 59);
  doc.circle(bx + bw * 0.25, by + bh + size * 0.03, size * 0.06, 'F');
  doc.circle(bx + bw * 0.75, by + bh + size * 0.03, size * 0.06, 'F');
  // SBW text at bottom
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size * 0.22);
  doc.text('SBW', x + size / 2, y + size * 0.88, { align: 'center' });
};

const generateReceiptPDF = async (due: any) => {
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
  drawLogo(doc, margin, 4, 12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('School Bus WayPro', margin + 15, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Bus Fee Payment Invoice', margin + 15, 19);

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

  await savePDF(doc, `Invoice_${txnId}.pdf`);
};

const generateCompactReceipt = async (due: any) => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: [80, 200] });
  const normalized = normalizeStudentInfo(due);
  const student = normalized.student || {};
  const txnId = due.transaction_id || due.id;
  const paidDateTime = formatDateTime(due.paid_at || new Date().toISOString());
  const receiptNo = `RCP-${String(txnId).slice(-8).toUpperCase()}`;
  const totalPaid = Number(due.total_due || due.amount || 0);
  const monthsCovered = extractReceiptMonths(due);
  const w = 80;
  const m = 6;

  // Header
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, w, 20, 'F');
  drawLogo(doc, w / 2 - 4, 2, 8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('School Bus WayPro', w / 2, 14, { align: 'center' });
  doc.setFontSize(5);
  doc.text('PAYMENT RECEIPT', w / 2, 18, { align: 'center' });

  let y = 24;
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Receipt: ${receiptNo}`, m, y);
  doc.text(`Date: ${paidDateTime}`, m, y + 4);

  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(m, y, w - m, y);
  y += 5;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(String(student.full_name || 'Student'), m, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Adm: ${student.admission_number || 'N/A'} | Class: ${student.grade || 'N/A'}-${student.section || 'N/A'}`, m, y + 4);

  y += 12;
  doc.line(m, y, w - m, y);
  y += 5;

  // Line items
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('ITEM', m, y);
  doc.text('AMT', w - m, y, { align: 'right' });
  y += 4;

  doc.setFont('helvetica', 'normal');
  monthsCovered.forEach((item: any) => {
    doc.text(`Bus Fee - ${item.label}`, m, y);
    doc.text(`Rs.${Number(item.amount || 0).toLocaleString('en-IN')}`, w - m, y, { align: 'right' });
    y += 4;
  });

  y += 2;
  doc.line(m, y, w - m, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL PAID', m, y);
  doc.text(`Rs.${totalPaid.toLocaleString('en-IN')}`, w - m, y, { align: 'right' });

  y += 8;
  doc.setFillColor(34, 197, 94);
  doc.roundedRect(m, y, w - m * 2, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('PAID - VERIFIED', w / 2, y + 5.5, { align: 'center' });

  y += 14;
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text('Computer generated receipt.', w / 2, y, { align: 'center' });
  doc.text('No signature required.', w / 2, y + 3.5, { align: 'center' });

  await savePDF(doc, `Receipt_${txnId}.pdf`);
};

const generateDetailedInvoice = async (due: any) => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const normalized = normalizeStudentInfo(due);
  const student = normalized.student || {};
  const txnId = due.transaction_id || due.id;
  const paidDateTime = formatDateTime(due.paid_at || new Date().toISOString());
  const receiptNo = `INV-${String(txnId).slice(-8).toUpperCase()}`;
  const paymentMethod = String(due.payment_method || due.method || 'ONLINE').toUpperCase();
  const baseFee = Number(due.amount || 0);
  const lateFee = Number(due.late_fee || 0);
  const discount = Number(due.discount || 0);
  const totalPaid = Number(due.total_due || due.amount || 0);
  const monthsCovered = extractReceiptMonths(due);
  const billingPeriod = due.billing_period_label || `${MONTHS[(due.month || 1) - 1]} ${due.year}`;
  const margin = 14;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;

  // Elegant header with double line
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 36, 'F');
  drawLogo(doc, margin, 6, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Tax Invoice', margin + 18, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('School Bus WayPro — Transport Fee Invoice', margin + 18, 23);
  doc.setFontSize(8);
  doc.text(`Invoice No: ${receiptNo}`, pageWidth - margin, 16, { align: 'right' });
  doc.text(`Date: ${paidDateTime}`, pageWidth - margin, 22, { align: 'right' });
  doc.text(`Method: ${paymentMethod}`, pageWidth - margin, 28, { align: 'right' });

  // Bill To & Ship To
  let y = 46;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth / 2 - 4, 36, 2, 2, 'F');
  doc.roundedRect(margin + contentWidth / 2 + 4, y, contentWidth / 2 - 4, 36, 2, 2, 'F');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('BILL TO', margin + 4, y + 6);
  doc.text('TRANSPORT DETAILS', margin + contentWidth / 2 + 8, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(String(student.full_name || 'Student'), margin + 4, y + 13);
  doc.text(`Admission: ${student.admission_number || 'N/A'}`, margin + 4, y + 19);
  doc.text(`Class: ${student.grade || 'N/A'} | Section: ${student.section || 'N/A'}`, margin + 4, y + 25);

  doc.text(`Bus: ${normalized.busNumber || 'N/A'}`, margin + contentWidth / 2 + 8, y + 13);
  doc.text(`Billing Period: ${billingPeriod}`, margin + contentWidth / 2 + 8, y + 19);
  doc.text(`Months: ${monthsCovered.length}`, margin + contentWidth / 2 + 8, y + 25);

  // Table
  y = 90;
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('SL', margin + 4, y + 6);
  doc.text('DESCRIPTION', margin + 16, y + 6);
  doc.text('PERIOD', margin + 100, y + 6);
  doc.text('AMOUNT (Rs.)', pageWidth - margin - 4, y + 6, { align: 'right' });

  y += 9;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  monthsCovered.forEach((item: any, idx: number) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 7, 'F');
    }
    doc.text(String(idx + 1), margin + 4, y + 5);
    doc.text('School Bus Transport Fee', margin + 16, y + 5);
    doc.text(String(item.label), margin + 100, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(Number(item.amount || 0).toLocaleString('en-IN'), pageWidth - margin - 4, y + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 7;
  });

  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, 90, contentWidth, y - 90);

  // Summary
  y += 6;
  const sumX = pageWidth - margin - 80;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const summaryLines: [string, string][] = [
    ['Subtotal (Base Fee)', `Rs. ${baseFee.toLocaleString('en-IN')}`],
    ['Late Fee', `Rs. ${lateFee.toLocaleString('en-IN')}`],
    ['Discount', `- Rs. ${discount.toLocaleString('en-IN')}`],
  ];
  summaryLines.forEach(([label, val]) => {
    doc.setTextColor(100, 116, 139);
    doc.text(label, sumX, y);
    doc.setTextColor(15, 23, 42);
    doc.text(val, pageWidth - margin - 4, y, { align: 'right' });
    y += 6;
  });

  y += 2;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(sumX - 4, y, pageWidth - margin - sumX + 8, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL PAID', sumX, y + 8);
  doc.text(`Rs. ${totalPaid.toLocaleString('en-IN')}`, pageWidth - margin - 4, y + 8, { align: 'right' });

  // Footer
  y += 24;
  doc.setFillColor(34, 197, 94);
  doc.roundedRect(margin, y, 50, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('PAYMENT VERIFIED', margin + 25, y + 5.5, { align: 'center' });

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('This is a computer-generated tax invoice and does not require a physical signature.', margin, 280);
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')} | Txn: ${txnId}`, margin, 285);

  await savePDF(doc, `Invoice_${txnId}.pdf`);
};

const savePDF = async (doc: any, fileName: string) => {
  const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();

  if (!isCapacitor) {
    doc.save(fileName);
    return;
  }

  // Capacitor mobile: use Filesystem plugin to save, then Share plugin to open
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const base64Data = doc.output('datauristring').split(',')[1];
    showToast('Downloading receipt...', 'info');

    const result = await Filesystem.writeFile({
      path: `Download/${fileName}`,
      data: base64Data,
      directory: Directory.ExternalStorage,
      recursive: true,
    });

    // Try to share/open the file
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: fileName,
        url: result.uri,
        dialogTitle: 'Open Receipt',
      });
    } catch {
      showAlert('Receipt Saved', `${fileName} saved to Downloads folder. Open it from your file manager.`, 'success');
    }
  } catch {
    // Filesystem plugin not available or permission denied — fallback methods
    try {
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Try download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        try { document.body.removeChild(link); } catch {}
        URL.revokeObjectURL(blobUrl);
      }, 5000);

      showAlert('Receipt Generated', `${fileName} has been downloaded. Check your Downloads folder.`, 'success');
    } catch {
      try { doc.save(fileName); } catch {}
    }
  }
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

  const getGenerator = (format: 'pdf' | 'invoice' | 'receipt') => {
    if (format === 'receipt') return generateCompactReceipt;
    if (format === 'invoice') return generateDetailedInvoice;
    return generateReceiptPDF;
  };

  const downloadReceipt = async (paymentId: string | number, txnId?: string, dueSnapshot?: any, format: 'pdf' | 'invoice' | 'receipt' = 'pdf') => {
    setDownloading(String(paymentId));
    const generate = getGenerator(format);
    try {
      const immediateDue = normalizeDueShape(dueSnapshot, paymentId, txnId);
      if (immediateDue && hasCoreStudentFields(immediateDue)) {
        await generate(immediateDue);
        return;
      }

      const result = await fetchDueWithTimeout(paymentId, txnId);
      const due = (result as any)?.data;
      const error = (result as any)?.error;
      if (error || !due) {
        const minimalDue = normalizeDueShape({ id: paymentId, transaction_id: txnId }, paymentId, txnId);
        await generate(minimalDue);
        return;
      }

      const normalizedDue = Array.isArray(due)
        ? buildReceiptAggregate(due, paymentId, txnId)
        : normalizeDueShape(due, paymentId, txnId);
      await generate(normalizedDue || immediateDue);
    } catch (err: any) {
      try {
        const minimalDue = normalizeDueShape({ id: paymentId, transaction_id: txnId }, paymentId, txnId);
        await generate(minimalDue);
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
