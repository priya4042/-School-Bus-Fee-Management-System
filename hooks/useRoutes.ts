
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Route } from '../types';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('routes').select('*').order('route_name');
      if (error) throw error;
      setRoutes(data || []);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const addRoute = async (routeData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from('routes').insert(routeData);
      if (error) throw error;
      await fetchRoutes();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateRoute = async (id: string, routeData: any) => {
    try {
      const { error } = await supabase.from('routes').update(routeData).eq('id', id);
      if (error) throw error;
      await fetchRoutes();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      const { error } = await supabase.from('routes').delete().eq('id', id);
      if (error) throw error;
      await fetchRoutes();
      return true;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return { routes, loading, addRoute, updateRoute, deleteRoute, fetchRoutes };
};
