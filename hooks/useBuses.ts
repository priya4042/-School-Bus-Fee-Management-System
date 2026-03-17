
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const toUiStatus = (dbStatus: string) => {
  const raw = String(dbStatus || '').toUpperCase();
  if (raw === 'ON_ROUTE' || raw === 'ACTIVE') return 'active';
  if (raw === 'MAINTENANCE') return 'maintenance';
  return 'idle';
};

const toDbStatus = (uiStatus: string) => {
  const raw = String(uiStatus || '').toLowerCase();
  if (raw === 'active' || raw === 'on_route') return 'ON_ROUTE';
  if (raw === 'maintenance') return 'MAINTENANCE';
  return 'IDLE';
};

const mapDbBusToUi = (bus: any) => {
  const routeRelation = Array.isArray(bus?.route)
    ? bus.route[0]
    : Array.isArray(bus?.routes)
      ? bus.routes[0]
      : bus?.route || bus?.routes || null;

  return {
  ...bus,
  plate: bus?.vehicle_number || bus?.plate || '',
  vehicle_number: bus?.vehicle_number || bus?.plate || '',
  route_id: bus?.route_id || bus?.routeId || '',
  routes: routeRelation,
  route: routeRelation,
  status: toUiStatus(bus?.status),
  };
};

const mapUiBusToDb = (busData: any) => ({
  bus_number: String(busData?.bus_number || '').trim(),
  vehicle_number: String(busData?.plate || busData?.vehicle_number || '').trim(),
  model: String(busData?.model || '').trim() || null,
  capacity: Number(busData?.capacity || 0) || 40,
  driver_name: String(busData?.driver_name || '').trim() || null,
  driver_phone: String(busData?.driver_phone || '').trim() || null,
  route_id: busData?.route_id || busData?.routeId ? String(busData?.route_id || busData?.routeId) : null,
  status: toDbStatus(busData?.status),
});

export const useBuses = () => {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*, route:routes!buses_route_id_fkey(id, route_name)')
        .order('bus_number');
      if (error) throw error;
      setBuses((data || []).map(mapDbBusToUi));
    } catch (err) {
      console.error('Failed to fetch buses:', err);
    } finally {
      setLoading(false);
    }
  };

  const registerBus = async (busData: any) => {
    try {
      const payload = mapUiBusToDb(busData);
      const { error } = await supabase.from('buses').insert(payload);
      if (error) throw error;
      await fetchBuses();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to register bus' };
    }
  };

  const updateBus = async (id: string, busData: any) => {
    try {
      const payload = mapUiBusToDb(busData);
      const { error } = await supabase.from('buses').update(payload).eq('id', id);
      if (error) throw error;
      await fetchBuses();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update bus' };
    }
  };

  const deleteBus = async (id: string) => {
    try {
      const { error } = await supabase.from('buses').delete().eq('id', id);
      if (error) throw error;
      await fetchBuses();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  return { buses, loading, registerBus, updateBus, deleteBus, fetchBuses };
};
