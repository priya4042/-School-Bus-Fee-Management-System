import React, { useEffect, useRef, useState } from 'react';
import { ENV } from '../config/env';

interface GoogleMapProps {
  location: { lat: number; lng: number } | null;
  busId?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ location, busId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ENV.GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API Key is missing. Please configure GOOGLE_MAPS_API_KEY in env.js');
      return;
    }

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${ENV.GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => setError('Failed to load Google Maps API. Check your API key and network.');
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current || !window.google) return;

      try {
        const initialLocation = location || { lat: 32.0900, lng: 76.2600 };
        const gMap = new window.google.maps.Map(mapRef.current, {
          center: initialLocation,
          zoom: 15,
          disableDefaultUI: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        const gMarker = new window.google.maps.Marker({
          position: initialLocation,
          map: gMap,
          title: busId ? `Bus ${busId}` : 'Bus Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#1e40af',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          }
        });

        setMap(gMap);
        setMarker(gMarker);
      } catch (err: any) {
        if (err.message?.includes('ApiNotActivatedMapError')) {
          setError('Google Maps API is not activated. Please enable it in Google Cloud Console.');
        } else {
          setError('Error initializing Google Maps: ' + err.message);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (map && marker && location && window.google) {
      const newPos = new window.google.maps.LatLng(location.lat, location.lng);
      marker.setPosition(newPos);
      map.panTo(newPos);
    }
  }, [location, map, marker]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-6 text-center">
        <i className="fas fa-map-marked-alt text-4xl text-slate-300 mb-4"></i>
        <p className="text-sm font-bold text-slate-600 mb-2">Map Unavailable</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-danger">{error}</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full rounded-[2rem]" />;
};

export default GoogleMap;
