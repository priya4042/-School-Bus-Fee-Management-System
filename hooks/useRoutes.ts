
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
      // Explicitly calling the /routes endpoint relative to the v1 base
      const response = await api.post('/routes/', routeData);
      console.log('Route added successfully:', response.data);
      await fetchRoutes();
      return true;
    } catch (err: any) {
      console.error('Add Route API Error:', err.response?.data || err.message);
      return false;
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
