
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PaymentTelemetry } from '../lib/telemetry';
import { MonthlyDue, Defaulter, PaymentStatus } from '../types';

export const useFees = () => {
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('monthly_dues')
        .select('*, students(full_name, admission_number, grade, section)')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      if (error) throw error;
      setDues(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dues');
    } finally {
      setLoading(false);
    }
  };

  const recordManualPayment = async (dueId: string | number, amount: number, studentName: string, _monthYear: string, method: string, reference?: string) => {
    try {
      const txnId = reference || (method === 'Cash' ? 'CASH-' : 'TXN-') + Math.random().toString(36).substring(2, 11).toUpperCase();
      const { error } = await supabase
        .from('monthly_dues')
        .update({
          status: PaymentStatus.PAID,
          transaction_id: txnId,
          paid_at: new Date().toISOString(),
          payment_method: method,
        })
        .eq('id', String(dueId));
      if (error) throw error;
      PaymentTelemetry.notifyPayment(studentName, amount, txnId);
      await fetchDues();
      return true;
    } catch (err) {
      console.error('Manual payment recording failed', err);
      return false;
    }
  };

  const fetchDefaulters = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const { data, error } = await supabase
        .from('monthly_dues')
        .select('*, students(full_name, admission_number, grade, section)')
        .eq('status', 'PENDING')
        .or(`year.lt.${currentYear},and(year.eq.${currentYear},month.lt.${currentMonth})`)
        .order('year', { ascending: true })
        .order('month', { ascending: true });
      if (error) throw error;
      setDefaulters(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch defaulters');
    } finally {
      setLoading(false);
    }
  };

  const createFee = async (feeData: Partial<MonthlyDue>) => {
    try {
      const { error } = await supabase.from('monthly_dues').insert(feeData);
      if (error) throw error;
      await fetchDues();
      return true;
    } catch (err) {
      return false;
    }
  };

  const updateFee = async (id: string, feeData: Partial<MonthlyDue>) => {
    try {
      const { error } = await supabase.from('monthly_dues').update(feeData).eq('id', id);
      if (error) throw error;
      await fetchDues();
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteFee = async (id: string) => {
    try {
      const { error } = await supabase.from('monthly_dues').delete().eq('id', id);
      if (error) throw error;
      await fetchDues();
      return true;
    } catch (err) {
      return false;
    }
  };

  const generateMonthlyBills = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const { data: students, error: sErr } = await supabase
        .from('students')
        .select('id, monthly_fee, base_fee')
        .eq('status', 'active');
      if (sErr) throw sErr;

      const { data: existing } = await supabase
        .from('monthly_dues')
        .select('student_id')
        .eq('month', month)
        .eq('year', year);
      const existingIds = new Set((existing || []).map((d: any) => d.student_id));

      const newDues = (students || [])
        .filter(s => !existingIds.has(s.id))
        .map(s => {
          const base = s.monthly_fee || s.base_fee || 0;
          return { student_id: s.id, month, year, amount: base, total_due: base, status: 'PENDING', late_fee: 0 };
        });

      if (newDues.length > 0) {
        const { error } = await supabase.from('monthly_dues').insert(newDues);
        if (error) throw error;
      }

      await fetchDues();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to generate bills');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const waiveLateFee = async (dueId: string | number) => {
    try {
      const { data: due } = await supabase
        .from('monthly_dues')
        .select('amount')
        .eq('id', String(dueId))
        .single();
      const { error } = await supabase
        .from('monthly_dues')
        .update({ late_fee: 0, total_due: due?.amount || 0 })
        .eq('id', String(dueId));
      if (error) throw error;
      await fetchDues();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to waive fee');
      return false;
    }
  };

  const recordPayment = async (dueId: string | number, paymentData: { amount: number, studentName: string, monthYear: string, method: string }) => {
    try {
      const txnId = (paymentData.method === 'Cash' ? 'CASH-' : 'TXN-') + Math.random().toString(36).substring(2, 11).toUpperCase();
      const { error } = await supabase
        .from('monthly_dues')
        .update({ status: 'PAID', transaction_id: txnId, paid_at: new Date().toISOString(), payment_method: paymentData.method })
        .eq('id', String(dueId));
      if (error) throw error;
      await fetchDues();
      return txnId;
    } catch (err) {
      console.error('Failed to record payment', err);
      return null;
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      const txnId = 'CASH-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const { error } = await supabase
        .from('monthly_dues')
        .update({ status: 'PAID', paid_at: new Date().toISOString(), transaction_id: txnId })
        .eq('id', id);
      if (error) throw error;
      await fetchDues();
      return true;
    } catch (err) {
      return false;
    }
  };

  const sendNotification = async (id: string) => {
    try {
      const { data: due } = await supabase
        .from('monthly_dues')
        .select('*, students(full_name, parent_id)')
        .eq('id', id)
        .single();
      if (due?.students?.parent_id) {
        await supabase.from('notifications').insert({
          user_id: due.students.parent_id,
          title: 'Fee Reminder',
          message: `Your bus fee of ₹${due.total_due} for ${due.students.full_name} is due. Please pay before the due date to avoid late charges.`,
          type: 'WARNING',
          is_read: false,
        });
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    fetchDues();
  }, []);

  return {
    dues,
    defaulters,
    loading,
    error,
    fetchDues,
    fetchDefaulters,
    generateMonthlyBills,
    waiveLateFee,
    createFee,
    updateFee,
    deleteFee,
    recordManualPayment,
    markAsPaid,
    sendNotification,
    recordPayment,
  };
};
