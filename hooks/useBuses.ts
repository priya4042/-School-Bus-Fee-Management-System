
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
      const { data } = await api.post('/buses', busData);
      setBuses(prev => [...prev, data]);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updateBus = async (id: string, busData: any) => {
    try {
      const { data } = await api.put(`/buses/${id}`, busData);
      setBuses(prev => prev.map(b => b.id === id ? data : b));
      return true;
    } catch (err) {
      console.error('Failed to update bus', err);
      return false;
    }
  };

  const deleteBus = async (id: string) => {
    try {
      await api.delete(`/buses/${id}`);
      setBuses(prev => prev.filter(b => b.id !== id));
      return true;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  return { buses, loading, registerBus, updateBus, deleteBus, fetchBuses };
};
