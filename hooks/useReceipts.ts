import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { showAlert } from '../lib/swal';
import jsPDF from 'jspdf';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const RECEIPT_FETCH_TIMEOUT_MS = 1500;

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

const generateReceiptPDF = (due: any) => {
  const doc = new jsPDF();
  const student = due.students || {};
  const txnId = due.transaction_id || due.id;
  const paidDateTime = formatDateTime(due.paid_at || new Date().toISOString());
  const receiptNo = `RCP-${String(txnId).slice(-8).toUpperCase()}`;
  const paymentMethod = String(due.payment_method || due.method || 'ONLINE').toUpperCase();
  const busNumber = student.bus_number || student.bus_no || student?.buses?.bus_number || student?.buses?.plate || 'N/A';
  const grade = student.grade || due.grade || 'N/A';
  const section = student.section || due.section || 'N/A';
  const baseFee = Number(due.amount || 0);
  const lateFee = Number(due.late_fee || 0);
  const discount = Number(due.discount || 0);
  const totalPaid = Number(due.total_due || due.amount || 0);

  // Header background
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 210, 45, 'F');
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

  // Section: Receipt Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('PAYMENT DETAILS', 20, 65);

  const rows: [string, string][] = [
    ['Receipt No', receiptNo],
    ['Transaction ID', txnId],
    ['Payment Date & Time', paidDateTime],
    ['Payment Method', paymentMethod],
    ['Billing Period', `${MONTHS[(due.month || 1) - 1]} ${due.year}`],
    ['Due Date', formatDateOnly(due.due_date)],
    ['Fine Cutoff Date', formatDateOnly(due.last_date)],
    ['Payment Status', 'PAID ✓'],
  ];

  let y = 75;
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
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('STUDENT DETAILS', 20, y);
  y += 10;

  const studentRows: [string, string][] = [
    ['Full Name', student.full_name || due.student_name || 'N/A'],
    ['Admission Number', student.admission_number || due.admission_number || 'N/A'],
    ['Class', String(grade)],
    ['Section', String(section)],
    ['Bus Number', String(busNumber)],
  ];

  studentRows.forEach(([label, value]) => {
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
  doc.text('This is a computer-generated receipt and does not require a physical signature.', 20, 262);
  doc.text('For queries, contact Bus Administration.', 20, 269);
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 20, 276);
  doc.text(`System Reference: ${due.id || 'N/A'}`, 20, 283);

  doc.save(`Receipt_${txnId}.pdf`);
};

export const useReceipts = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const normalizeDueShape = (raw: any, paymentId: string | number, txnId?: string) => {
    if (!raw) return null;
    const students = Array.isArray(raw.students) ? raw.students[0] : raw.students;
    const nestedBus = Array.isArray(students?.buses) ? students?.buses[0] : students?.buses;
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
      students: students || {
        full_name: raw.student_name || raw.studentName || 'Student',
        admission_number: raw.admission_number || 'N/A',
        grade: raw.grade || '',
        section: raw.section || '',
      },
      bus_number: raw.bus_number || students?.bus_number || nestedBus?.bus_number || nestedBus?.plate || 'N/A',
    };
  };

  const fetchDueWithTimeout = async (paymentId: string | number) => {
    const fetchPromise = supabase
      .from('monthly_dues')
      .select('*, students(full_name, admission_number, grade, section, buses(bus_number, plate))')
      .eq('id', String(paymentId))
      .single();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Receipt fetch timeout')), RECEIPT_FETCH_TIMEOUT_MS);
    });

    return Promise.race([fetchPromise, timeoutPromise]) as Promise<any>;
  };

  const downloadReceipt = async (paymentId: string | number, txnId?: string, dueSnapshot?: any) => {
    setDownloading(String(paymentId));
    try {
      // Generate immediately if caller already has due/receipt details.
      const immediateDue = normalizeDueShape(dueSnapshot, paymentId, txnId);
      if (immediateDue) {
        generateReceiptPDF(immediateDue);
        return;
      }

      // Fallback: short timed fetch for missing details.
      const result = await fetchDueWithTimeout(paymentId);
      const due = (result as any)?.data;
      const error = (result as any)?.error;
      if (error || !due) {
        const minimalDue = normalizeDueShape({ id: paymentId, transaction_id: txnId }, paymentId, txnId);
        generateReceiptPDF(minimalDue);
        return;
      }

      const normalizedDue = normalizeDueShape(due, paymentId, txnId);
      generateReceiptPDF(normalizedDue);
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
