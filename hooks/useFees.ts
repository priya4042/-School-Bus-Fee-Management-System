import { useState, useEffect } from 'react';
import api, { PaymentTelemetry } from '../lib/api';
import { MonthlyDue, Defaulter, PaymentStatus } from '../types';

export const useFees = () => {
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('fees/dues');
      setDues(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dues');
    } finally {
      setLoading(false);
    }
  };

  const recordManualPayment = async (dueId: string | number, amount: number, studentName: string, monthYear: string, method: string, reference?: string) => {
    try {
      // 1. Update Due Status
      await api.put(`fees/edit/${dueId}`, { status: PaymentStatus.PAID });

      // 2. Create Receipt Entry
      const txnId = reference || 'CASH-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const paymentDate = new Date().toISOString().split('T')[0];

      const newReceipt = {
        transaction_id: txnId,
        amount: amount,
        student_name: studentName,
        month_year: monthYear,
        payment_date: paymentDate,
        method: method,
        status: 'SUCCESS'
      };
      await api.post('receipts', newReceipt);

      // 3. Notify Admin/System
      PaymentTelemetry.notifyPayment(studentName, amount, txnId);

      await fetchDues();
      return true;
    } catch (err) {
      console.error("Manual payment recording failed", err);
      return false;
    }
  };

  const fetchDefaulters = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('fees/defaulters');
      setDefaulters(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch defaulters');
    } finally {
      setLoading(false);
    }
  };

  const createFee = async (feeData: Partial<MonthlyDue>) => {
    try {
      const { data } = await api.post('fees/add', feeData);
      setDues(prev => [...prev, data]);
      return true;
    } catch (err) {
      return false;
    }
  };

  const updateFee = async (id: string, feeData: Partial<MonthlyDue>) => {
    try {
      const { data } = await api.put(`fees/edit/${id}`, feeData);
      setDues(prev => prev.map(d => d.id === id ? data : d));
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteFee = async (id: string) => {
    try {
      await api.delete(`fees/delete/${id}`);
      setDues(prev => prev.filter(d => d.id !== id));
      return true;
    } catch (err) {
      return false;
    }
  };

  const generateMonthlyBills = async () => {
    setLoading(true);
    try {
      await api.post('fees/generate-monthly');
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
      await api.post(`fees/waive/${dueId}`);
      await fetchDues();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to waive fee');
      return false;
    }
  };

  const recordPayment = async (dueId: string | number, paymentData: { amount: number, studentName: string, monthYear: string, method: string }) => {
    try {
      await api.put(`fees/edit/${dueId}`, { status: 'PAID' });
      
      const txnId = (paymentData.method === 'Cash' ? 'CASH-' : 'TXN-') + Math.random().toString(36).substr(2, 9).toUpperCase();
      const newReceipt = {
          transaction_id: txnId,
          amount: paymentData.amount,
          student_name: paymentData.studentName,
          month_year: paymentData.monthYear,
          payment_date: new Date().toISOString().split('T')[0],
          method: paymentData.method,
          status: 'SUCCESS'
      };
      await api.post('receipts', newReceipt);
      
      await fetchDues();
      return txnId;
    } catch (err) {
      console.error("Failed to record payment", err);
      return null;
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
    recordManualPayment
  };
};
