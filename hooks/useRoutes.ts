
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Route } from '../types';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/routes/');
      setRoutes(data);
    } catch (err) {
      console.error('Fetch Routes Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRoute = async (routeData: any) => {
    try {
      // Ensure the payload matches the expected schema exactly
      const payload = {
        name: String(routeData.name).trim(),
        code: String(routeData.code).trim().toUpperCase(),
        distance_km: Number(routeData.distance_km),
        base_fee: Number(routeData.base_fee)
      };

      const response = await api.post('/routes/', payload);
      console.log('Route added successfully:', response.data);
      await fetchRoutes();
      return { success: true };
    } catch (err: any) {
      let errorMessage = 'Unknown error occurred';
      
      if (err.response) {
        // Handle FastAPI detail array (422 Validation errors)
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else {
          errorMessage = `Server Error (${err.response.status}): ${err.response.statusText}`;
        }
      } else if (err.request) {
        errorMessage = 'Network Error: Cannot reach the backend server. Please ensure the API is running.';
      } else {
        errorMessage = err.message;
      }

      console.error('Add Route API Error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateRoute = async (id: string, routeData: any) => {
    try {
      await api.put(`/routes/${id}/`, routeData);
      await fetchRoutes();
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      await api.delete(`/routes/${id}/`);
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
