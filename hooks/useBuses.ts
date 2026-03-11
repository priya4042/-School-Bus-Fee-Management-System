
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useBuses = () => {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('buses').select('*').order('bus_number');
      if (error) throw error;
      setBuses(data || []);
    } catch (err) {
      console.error('Failed to fetch buses:', err);
    } finally {
      setLoading(false);
    }
  };

  const registerBus = async (busData: any) => {
    try {
      const { error } = await supabase.from('buses').insert(busData);
      if (error) throw error;
      await fetchBuses();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateBus = async (id: string, busData: any) => {
    try {
      const { error } = await supabase.from('buses').update(busData).eq('id', id);
      if (error) throw error;
      await fetchBuses();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteBus = async (id: string) => {
    try {
      const { error } = await supabase.from('buses').delete().eq('id', id);
      if (error) throw error;
      await fetchBuses();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  return { buses, loading, registerBus, updateBus, deleteBus, fetchBuses };
};
