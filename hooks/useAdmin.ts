
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { UserRole } from '../types';

export const useAdmin = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      // Mocking for demo
      const mockAdmins = [
        { id: 1, fullName: 'Super Admin', email: 'super@school.com', role: UserRole.SUPER_ADMIN, is_active: true },
        { id: 2, fullName: 'Finance Officer', email: 'finance@school.com', role: UserRole.ACCOUNTANT, is_active: true },
        { id: 3, fullName: 'Standard Admin', email: 'admin@school.com', role: UserRole.ADMIN, is_active: true },
      ];
      setAdmins(mockAdmins);
      
      // In prod: 
      // const { data } = await api.get('/users?role_types=ADMIN,SUPER_ADMIN,ACCOUNTANT');
      // setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (adminData: any) => {
    try {
      // await api.post('/users/admin', adminData);
      setAdmins(prev => [...prev, { ...adminData, id: Math.random(), is_active: true }]);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const toggleAdminStatus = async (id: number, status: boolean) => {
    try {
      // await api.put(`/users/${id}/status`, { is_active: status });
      setAdmins(prev => prev.map(a => a.id === id ? { ...a, is_active: status } : a));
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
