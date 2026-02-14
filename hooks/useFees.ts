
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { MonthlyDue } from '../types';

export const useFees = () => {
  const [dues, setDues] = useState<MonthlyDue[]>([]);
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

  useEffect(() => {
    fetchDues();
  }, []);

  return { dues, loading, error, fetchDues, generateMonthlyBills, waiveLateFee };
};
