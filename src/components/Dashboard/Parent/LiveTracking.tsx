import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { 
  Bus as BusIcon, 
  MapPin, 
  Navigation, 
  Clock, 
  AlertCircle,
  Loader2,
  Maximize2,
  RefreshCw,
  Compass
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LiveTrackingProps {
  student: any;
  isDarkMode: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

export default function LiveTracking({ student, isDarkMode }: LiveTrackingProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [busLocation, setBusLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const fetchBusLocation = useCallback(async () => {
    if (!student.bus_id) return;
    try {
      const response = await fetch(`/api/parent/bus-location/${student.bus_id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setBusLocation(data);
        setError(null);
        
        // Mock ETA and Distance calculation for demo
        // In a real app, use Google Maps Distance Matrix API
        setEta('12 mins');
        setDistance('3.4 km');
      } else {
        setError(data.error || 'Bus location not available');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  }, [student.bus_id]);

  useEffect(() => {
    fetchBusLocation();
    const interval = setInterval(fetchBusLocation, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [fetchBusLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const darkMapOptions = {
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }]
      }
    ]
  };

  if (!isLoaded) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold">Loading Google Maps...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Status Bar */}
      <div className={`p-6 rounded-3xl border flex flex-wrap items-center justify-between gap-6 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <BusIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Bus Number</p>
              <p className="font-bold">{student.buses?.bus_number || 'N/A'}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-zinc-100 dark:bg-zinc-800 hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Estimated Arrival</p>
              <p className="font-bold">{eta || '--'}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-zinc-100 dark:bg-zinc-800 hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <Navigation size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Distance</p>
              <p className="font-bold">{distance || '--'}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={fetchBusLocation}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-sm font-bold active:scale-95"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Map Container */}
      <div className={`flex-1 rounded-3xl border overflow-hidden relative ${isDarkMode ? 'border-zinc-800' : 'border-zinc-100 shadow-lg'}`}>
        {error && (
          <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 text-center">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl max-w-sm">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Tracking Unavailable</h3>
              <p className="text-zinc-500 mb-6">{error}</p>
              <button 
                onClick={fetchBusLocation}
                className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={busLocation ? { lat: Number(busLocation.latitude), lng: Number(busLocation.longitude) } : defaultCenter}
          zoom={15}
          onLoad={setMap}
          onUnmount={onUnmount}
          options={isDarkMode ? darkMapOptions : {}}
        >
          {busLocation && (
            <>
              <Marker
                position={{ lat: Number(busLocation.latitude), lng: Number(busLocation.longitude) }}
                icon={{
                  url: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Bus icon
                  scaledSize: new google.maps.Size(40, 40)
                }}
                title={`Bus ${student.buses?.bus_number}`}
              />
              
              {/* Boarding Point Marker (Mocked location for demo) */}
              <Marker
                position={{ lat: Number(busLocation.latitude) + 0.005, lng: Number(busLocation.longitude) + 0.005 }}
                icon={{
                  url: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Home icon
                  scaledSize: new google.maps.Size(32, 32)
                }}
                title="Your Boarding Point"
              />

              {/* Mock Route Polyline */}
              <Polyline
                path={[
                  { lat: Number(busLocation.latitude), lng: Number(busLocation.longitude) },
                  { lat: Number(busLocation.latitude) + 0.002, lng: Number(busLocation.longitude) + 0.003 },
                  { lat: Number(busLocation.latitude) + 0.005, lng: Number(busLocation.longitude) + 0.005 }
                ]}
                options={{
                  strokeColor: '#4f46e5',
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  geodesic: true
                }}
              />
            </>
          )}
        </GoogleMap>

        {/* Map Controls Overlay */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
          <button className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:scale-105 transition-all">
            <Maximize2 size={20} />
          </button>
          <button className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:scale-105 transition-all">
            <Compass size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
