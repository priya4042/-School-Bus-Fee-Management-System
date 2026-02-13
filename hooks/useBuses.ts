
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const registerBus = async (busData: any) => {
    try {
      await api.post('/buses', busData);
      await fetchBuses();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  return { buses, loading, registerBus, fetchBuses };
};
