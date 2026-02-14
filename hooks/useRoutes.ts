
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Route } from '../types';
import { DEFAULT_ROUTES } from '../constants';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('routes');
      setRoutes(data);
    } catch (err) {
      setRoutes(DEFAULT_ROUTES);
    } finally {
      setLoading(false);
    }
  };

  const addRoute = async (routeData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data } = await api.post('routes', routeData);
      setRoutes(prev => [...prev, data]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: "Database Synchronization Failed" };
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      await api.delete(`routes/${id}`);
      setRoutes(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return { routes, loading, addRoute, deleteRoute, fetchRoutes };
};
