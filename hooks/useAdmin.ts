
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAdmin = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['ADMIN', 'SUPER_ADMIN'])
        .order('full_name');
      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (adminData: any) => {
    try {
      setAdmins(prev => [...prev, { ...adminData, id: Math.random(), is_active: true }]);
      return true;
    } catch (err) {
      return false;
    }
  };

  const toggleAdminStatus = async (id: string, status: boolean) => {
    try {
      const { error } = await supabase.from('profiles').update({ is_active: status }).eq('id', id);
      if (error) throw error;
      setAdmins(prev => prev.map(a => a.id === id ? { ...a, is_active: status } : a));
      return true;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return { admins, loading, createAdmin, toggleAdminStatus, fetchAdmins };
};
