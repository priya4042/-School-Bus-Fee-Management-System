
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Route } from '../types';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      // Relative path matches baseURL/routes
      const { data } = await api.get('routes');
      setRoutes(data);
    } catch (err) {
      console.error('Fetch Routes Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRoute = async (routeData: any) => {
    try {
      const payload = {
        name: String(routeData.name).trim(),
        code: String(routeData.code).trim().toUpperCase(),
        distance_km: Number(routeData.distance_km),
        base_fee: Number(routeData.base_fee)
      };

      const response = await api.post('routes', payload);
      await fetchRoutes();
      return { success: true };
    } catch (err: any) {
      let errorMessage = 'Route provision failed';
      
      if (err.response) {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map(d => d.msg).join(', ');
        } else {
          errorMessage = detail || `Error ${err.response.status}`;
        }
      } else {
        errorMessage = "Network error: API unreachable.";
      }

      return { success: false, error: errorMessage };
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      await api.delete(`routes/${id}`);
      await fetchRoutes();
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
