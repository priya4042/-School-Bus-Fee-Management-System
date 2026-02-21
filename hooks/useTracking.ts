import { useState, useEffect } from 'react';
import { TELEMETRY_EVENT, ARRIVAL_EVENT } from '../lib/api';

export const useTracking = (busId: string = 'b1') => {
  const [location, setLocation] = useState<{ lat: number; lng: number; speed: number } | null>(null);
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    // Load last known position
    const cached = localStorage.getItem(`live_pos_${busId}`);
    if (cached) {
      setLocation(JSON.parse(cached));
    }

    const handleUpdate = (e: any) => {
      const data = e.detail;
      if (data.busId === busId) {
        setLocation({ lat: data.lat, lng: data.lng, speed: data.speed });
        setHasArrived(false);
      }
    };

    const handleArrival = (e: any) => {
      if (e.detail.busId === busId) {
        setHasArrived(true);
      }
    };

    window.addEventListener(TELEMETRY_EVENT, handleUpdate);
    window.addEventListener(ARRIVAL_EVENT, handleArrival);
    
    return () => {
      window.removeEventListener(TELEMETRY_EVENT, handleUpdate);
      window.removeEventListener(ARRIVAL_EVENT, handleArrival);
    };
  }, [busId]);

  return { location, hasArrived };
};