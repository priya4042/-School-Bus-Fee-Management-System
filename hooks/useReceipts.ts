import { useState } from 'react';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { showAlert } from '../lib/swal';
import jsPDF from 'jspdf';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const generateReceiptPDF = (due: any) => {
  const doc = new jsPDF();
  const student = due.students || {};
  const txnId = due.transaction_id || due.id;
  const paidDate = due.paid_at
    ? new Date(due.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

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
  doc.text(`RCP-${txnId.toString().slice(-8).toUpperCase()}`, 140, 30);

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
    ['Transaction ID', txnId],
    ['Payment Date', paidDate],
    ['Billing Period', `${MONTHS[(due.month || 1) - 1]} ${due.year}`],
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
    ['Class & Section', student.grade ? `Grade ${student.grade} – Section ${student.section}` : 'N/A'],
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
  doc.roundedRect(20, y, 170, 55, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.text('FEE BREAKDOWN', 30, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text('Base Fee', 30, y + 25);
  doc.text(`Rs. ${Number(due.amount || 0).toLocaleString('en-IN')}`, 160, y + 25, { align: 'right' });

  doc.text('Late Fee', 30, y + 37);
  doc.text(`Rs. ${Number(due.late_fee || 0).toLocaleString('en-IN')}`, 160, y + 37, { align: 'right' });

  // Total
  doc.setFillColor(30, 64, 175);
  doc.rect(20, y + 42, 170, 13, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('TOTAL PAID', 30, y + 52);
  doc.text(`Rs. ${Number(due.total_due || 0).toLocaleString('en-IN')}`, 160, y + 52, { align: 'right' });

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('This is a computer-generated receipt and does not require a physical signature.', 20, 270);
  doc.text('For queries, contact Bus Administration.', 20, 277);
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 20, 284);

  doc.save(`Receipt_${txnId}.pdf`);
};

export const useReceipts = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadReceipt = async (paymentId: string | number, txnId?: string) => {
    setDownloading(String(paymentId));
    try {
      // 1. Try backend PDF endpoint first
      try {
        const response = await api.get(`/receipts/${paymentId}/download`, { responseType: 'blob' });
        const blob = response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: 'application/pdf' });
        if (blob.size > 100) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Receipt_${txnId || paymentId}.pdf`);
          document.body.appendChild(link);
          link.click();
          setTimeout(() => { link.remove(); window.URL.revokeObjectURL(url); }, 100);
          return;
        }
      } catch {
        // Backend failed, fall through to local generation
      }

      // 2. Generate PDF locally using Supabase data
      const { data: due, error } = await supabase
        .from('monthly_dues')
        .select('*, students(full_name, admission_number, grade, section)')
        .eq('id', String(paymentId))
        .single();

      if (error || !due) throw new Error('Receipt data not found. Please contact admin.');

      generateReceiptPDF(due);
    } catch (err: any) {
      console.error('Receipt download failed:', err);
      showAlert('Receipt Error', err?.message || 'Could not generate receipt. Please try again.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  return { downloadReceipt, downloading };
};
