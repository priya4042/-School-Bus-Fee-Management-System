
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Route } from '../types';
import { DEFAULT_ROUTES } from '../constants';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  const getStoredRoutes = () => {
    const stored = localStorage.getItem('fleet_routes');
    return stored ? JSON.parse(stored) : DEFAULT_ROUTES;
  };

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      // Relative path: 'routes' (No leading slash)
      const { data } = await api.get('routes');
      setRoutes(data.length > 0 ? data : getStoredRoutes());
    } catch (err) {
      console.warn('API Offline: Loading Kangra routes from Local Vault');
      setRoutes(getStoredRoutes());
    } finally {
      setLoading(false);
    }
  };

  // Fix: Explicitly return an error property to satisfy the consumer in Routes.tsx
  const addRoute = async (routeData: any): Promise<{ success: boolean; error?: string }> => {
    const payload = {
      ...routeData,
      id: `r-${Math.random().toString(36).substr(2, 5)}`,
      code: routeData.code.toUpperCase(),
      is_active: true
    };

    try {
      await api.post('routes', payload);
      await fetchRoutes();
      return { success: true };
    } catch (err: any) {
      try {
        // Fallback CRUD: Save to localStorage if API fails
        const current = getStoredRoutes();
        const updated = [...current, payload];
        localStorage.setItem('fleet_routes', JSON.stringify(updated));
        setRoutes(updated);
        return { success: true }; 
      } catch (localErr: any) {
        // If both the API and the fallback fail, return success: false with an error message
        return { 
          success: false, 
          error: localErr.message || 'The system encountered an error saving the route locally.' 
        };
      }
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      await api.delete(`routes/${id}`);
      await fetchRoutes();
      return true;
    } catch (err) {
      const updated = getStoredRoutes().filter((r: Route) => r.id !== id);
      localStorage.setItem('fleet_routes', JSON.stringify(updated));
      setRoutes(updated);
      return true;
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return { routes, loading, addRoute, deleteRoute, fetchRoutes };
};
