
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Route } from '../types';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/routes');
      setRoutes(data);
    } catch (err) {
      console.error('Fetch Routes Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRoute = async (routeData: any) => {
    try {
      const response = await api.post('/routes/', routeData);
      console.log('Route added successfully:', response.data);
      await fetchRoutes();
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Unknown network error';
      console.error('Add Route API Error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateRoute = async (id: string, routeData: any) => {
    try {
      await api.put(`/routes/${id}`, routeData);
      await fetchRoutes();
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      await api.delete(`/routes/${id}`);
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
