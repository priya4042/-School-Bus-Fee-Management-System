import { useState, useEffect } from 'react';

export const useTracking = (busId?: string) => {
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    if (!busId) return;

    const interval = setInterval(() => {
      setLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [busId]);

  return { location, hasArrived };
};
