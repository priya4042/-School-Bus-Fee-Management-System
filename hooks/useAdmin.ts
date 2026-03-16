
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
      // Create the auth user (keeps current session intact if email confirmation required)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: {
            full_name: adminData.fullName,
            role: adminData.role || 'ADMIN',
          },
        },
      });

      if (signUpError) throw signUpError;

      const userId = signUpData?.user?.id;

      if (userId) {
        // Upsert profile with admin role
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: userId,
          full_name: adminData.fullName,
          email: adminData.email,
          role: adminData.role || 'ADMIN',
          is_active: true,
        }, { onConflict: 'id' });

        if (profileError) {
          console.error('Failed to upsert admin profile:', profileError);
        }
      }

      await fetchAdmins();
      return true;
    } catch (err: any) {
      console.error('Failed to create admin:', err);
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
