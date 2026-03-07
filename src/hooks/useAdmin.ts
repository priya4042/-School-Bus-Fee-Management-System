
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { UserRole } from '../types';

export const useAdmin = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users?role_types=ADMIN,SUPER_ADMIN');
      setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (adminData: any) => {
    try {
      await api.post('/auth/register', { ...adminData, role: UserRole.ADMIN });
      await fetchAdmins();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const toggleAdminStatus = async (id: number, status: boolean) => {
    try {
      await api.put(`/users/${id}/status`, { is_active: status });
      await fetchAdmins();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return { admins, loading, createAdmin, toggleAdminStatus, fetchAdmins };
};
