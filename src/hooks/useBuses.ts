
import { useState, useEffect } from 'react';
import api from '../lib/api';

export const useBuses = () => {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/buses');
      setBuses(data);
    } catch (err) {
      console.error('Failed to fetch buses', err);
    } finally {
      setLoading(false);
    }
  };

  const registerBus = async (busData: any) => {
    try {
      await api.post('/buses', busData);
      await fetchBuses();
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const updateBus = async (id: string, busData: any) => {
    try {
      await api.put(`/buses/${id}`, busData);
      await fetchBuses();
      return { success: true };
    } catch (err: any) {
      console.error('Failed to update bus', err);
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const deleteBus = async (id: string) => {
    try {
      await api.delete(`/buses/${id}`);
      await fetchBuses();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  return { buses, loading, registerBus, updateBus, deleteBus, fetchBuses };
};
