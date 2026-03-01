import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  RefreshCw, 
  AlertCircle,
  Loader2,
  Shield,
  Eye,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ParentCamera({ isDarkMode }: { isDarkMode: boolean }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Live Bus Interior</h2>
          <p className="text-zinc-500 text-sm">Real-time surveillance for your child's safety</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Lock size={14} />
            Secure Encrypted Stream
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className={`aspect-video rounded-[2.5rem] border-8 overflow-hidden relative group transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-2xl shadow-black/50' : 'bg-white border-white shadow-2xl shadow-zinc-200'}`}>
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 z-10">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
              <p className="text-zinc-500 font-medium tracking-wide">Connecting to Bus Camera...</p>
            </div>
          ) : (
            <>
              <img 
                src="https://picsum.photos/seed/bus-interior/1280/720" 
                alt="Bus Interior" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay Controls */}
              <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Live Stream
                </div>
                <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                  Bus 101 • Interior Cam 01
                </div>
              </div>

              <div className="absolute bottom-8 right-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-black/60 transition-all">
                  <RefreshCw size={20} />
                </button>
                <button className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-black/60 transition-all">
                  <Video size={20} />
                </button>
              </div>

              {/* Timestamp */}
              <div className="absolute bottom-8 left-8 text-white/60 font-mono text-[10px] tracking-widest bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                {new Date().toLocaleString()}
              </div>
            </>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 mb-4">
              <Shield size={28} />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Privacy Protected</h4>
            <p className="text-xs text-zinc-500">Only authorized parents can access this live stream.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-4">
              <Video size={28} />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-1">HD Quality</h4>
            <p className="text-xs text-zinc-500">Crystal clear 1080p stream for better visibility.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 mb-4">
              <Eye size={28} />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Smart Monitoring</h4>
            <p className="text-xs text-zinc-500">AI-powered motion detection alerts for safety.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
