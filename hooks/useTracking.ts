import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TELEMETRY_EVENT, ARRIVAL_EVENT } from '../lib/telemetry';

export const useTracking = (busId?: string) => {
  const [location, setLocation] = useState<{ lat: number; lng: number; speed: number } | null>(null);
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    if (!busId) return;

    // 1. Load last known position from Supabase
    const fetchLastLocation = async () => {
      const { data, error } = await supabase
        .from('bus_locations')
        .select('*')
        .eq('bus_id', busId)
        .maybeSingle();

      if (error) {
        console.warn('Unable to load last bus location:', error);
        return;
      }
      
      if (data) {
        setLocation({ lat: data.latitude, lng: data.longitude, speed: data.speed });
      }
    };
    fetchLastLocation();

    // 2. Subscribe to Realtime Updates (only if valid supabase URL)
    let channel: any = null;
    const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL;
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');
    
    if (!isPlaceholder) {
      channel = supabase
        .channel(`bus-tracking-${busId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bus_locations',
            filter: `bus_id=eq.${busId}`
          },
          (payload) => {
            const data = payload.new as any;
            if (data) {
              setLocation({ lat: data.latitude, lng: data.longitude, speed: data.speed });
              setHasArrived(false);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Realtime channel error - likely due to invalid credentials or network');
          }
        });
    }

    // 3. Keep local event listeners for in-app broadcasts (like arrival)
    const handleArrival = (e: any) => {
      if (e.detail.busId === busId) {
        setHasArrived(true);
      }
    };

    window.addEventListener(ARRIVAL_EVENT, handleArrival);
    
    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener(ARRIVAL_EVENT, handleArrival);
    };
  }, [busId]);

  return { location, hasArrived };
};
