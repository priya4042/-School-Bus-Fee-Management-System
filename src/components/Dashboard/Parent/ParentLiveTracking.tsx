import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, 
  Navigation, 
  Bus as BusIcon, 
  Clock, 
  MapPin,
  RefreshCw,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ParentLiveTracking({ isDarkMode }: { isDarkMode: boolean }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Track Child's Bus</h2>
          <p className="text-zinc-500 text-sm">Real-time location of Bus 101</p>
        </div>
        <button className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 transition-all">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className={`lg:col-span-2 aspect-video lg:aspect-auto lg:h-[600px] rounded-3xl border overflow-hidden relative ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 z-10">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
              <p className="text-zinc-500 font-medium">Connecting to GPS...</p>
            </div>
          ) : (
            <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <div className="text-center opacity-50">
                <MapIcon size={80} className="mx-auto mb-4 text-zinc-400" />
                <p className="text-zinc-500 font-bold text-xl uppercase tracking-widest">Map View Unavailable</p>
                <p className="text-zinc-400 text-sm mt-2">Google Maps API Key Required</p>
              </div>
              
              {/* Bus Marker */}
              <motion.div 
                animate={{ 
                  x: [0, 20, 0],
                  y: [0, -10, 0]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-600/40 border-2 border-white dark:border-zinc-900">
                    <BusIcon size={24} />
                  </div>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-800 whitespace-nowrap">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">Bus 101 • 42 km/h</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock size={20} className="text-emerald-500" />
              Arrival Estimates
            </h3>
            
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-800">
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border-4 border-white dark:border-zinc-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Current Stop</p>
                <h4 className="font-bold text-zinc-900 dark:text-white">City Center Mall</h4>
                <p className="text-xs text-zinc-500">Passed at 08:12 AM</p>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 border-4 border-white dark:border-zinc-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Next Stop</p>
                <h4 className="font-bold text-zinc-900 dark:text-white">Green Valley Park</h4>
                <p className="text-xs text-zinc-500">ETA: 08:25 AM (8 mins)</p>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Your Stop</p>
                <h4 className="font-bold text-zinc-900 dark:text-white">Oakwood Apartments</h4>
                <p className="text-xs text-zinc-500">ETA: 08:32 AM (15 mins)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
