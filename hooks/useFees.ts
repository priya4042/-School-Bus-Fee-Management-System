import { useState, useEffect } from 'react';
import api from '../lib/api';
import { MonthlyDue, Defaulter } from '../types';

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
    deleteFee
  };
};