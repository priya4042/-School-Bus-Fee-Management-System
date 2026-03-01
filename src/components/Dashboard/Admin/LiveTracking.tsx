import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, 
  Navigation, 
  Bus as BusIcon, 
  Zap, 
  Activity,
  Maximize2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 18.5204,
  lng: 73.8567
};

export default function LiveTracking({ isDarkMode }: { isDarkMode: boolean }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeBus, setActiveBus] = useState<any>(null);
  const [buses, setBuses] = useState<any[]>([]);

  const fetchBuses = async () => {
    try {
      const response = await fetch('/api/admin/buses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Mocking some locations for demo if not present
        const busesWithLoc = data.map((b: any, i: number) => ({
          ...b,
          lat: b.last_latitude || 18.5204 + (i * 0.005),
          lng: b.last_longitude || 73.8567 + (i * 0.005),
          speed: '42 km/h',
          lastUpdate: '2s ago'
        }));
        setBuses(busesWithLoc);
      }
    } catch (err) {
      console.error('Failed to fetch buses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Fleet Live Tracking</h2>
          <p className="text-zinc-500 text-sm">Real-time GPS monitoring of all active buses</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchBuses} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Map Area */}
        <div className={`flex-1 rounded-3xl border overflow-hidden relative ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
          {!isLoaded || isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 z-10">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
              <p className="text-zinc-500 font-medium">Initializing Google Maps...</p>
            </div>
          ) : null}
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={activeBus ? { lat: activeBus.lat, lng: activeBus.lng } : center}
              zoom={13}
              options={{
                styles: isDarkMode ? [
                  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                ] : []
              }}
            >
              {buses.map((bus) => (
                <Marker
                  key={bus.id}
                  position={{ lat: bus.lat, lng: bus.lng }}
                  onClick={() => setActiveBus(bus)}
                  icon={{
                    url: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
                    scaledSize: new window.google.maps.Size(40, 40)
                  }}
                />
              ))}

              {activeBus && (
                <InfoWindow
                  position={{ lat: activeBus.lat, lng: activeBus.lng }}
                  onCloseClick={() => setActiveBus(null)}
                >
                  <div className="p-2">
                    <h4 className="font-bold text-zinc-900">{activeBus.bus_number}</h4>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="w-80 flex flex-col gap-6 shrink-0">
          <div className={`p-6 rounded-3xl border flex-1 overflow-y-auto ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
            <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" />
              Active Fleet
            </h3>
            
            <div className="space-y-4">
              {buses.map((bus) => (
                <button 
                  key={bus.id}
                  onClick={() => setActiveBus(bus)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    activeBus?.id === bus.id 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{bus.bus_number}</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{bus.lastUpdate}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Zap size={14} />
                      <span>{bus.speed}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {activeBus && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}
            >
              <h4 className="font-bold text-zinc-900 dark:text-white mb-4">Bus Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Status</span>
                  <span className="font-bold text-emerald-500">{activeBus.status || 'Active'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Coordinates</span>
                  <span className="font-mono text-xs">{activeBus.lat.toFixed(4)}, {activeBus.lng.toFixed(4)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
