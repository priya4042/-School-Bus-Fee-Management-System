import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  RefreshCw, 
  Maximize2, 
  Settings, 
  AlertCircle,
  Loader2,
  Activity,
  Shield,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function CameraMonitoring({ isDarkMode }: { isDarkMode: boolean }) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeCamera, setActiveCamera] = useState<any>(null);
  const [cameras, setCameras] = useState<any[]>([]);

  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/cameras', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCameras(data);
        if (data.length > 0) setActiveCamera(data[0]);
      }
    } catch (err) {
      toast.error('Failed to fetch cameras');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Live Camera Monitoring</h2>
          <p className="text-zinc-500 text-sm">Real-time interior surveillance of active buses</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCameras}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh Streams
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm hover:opacity-90 transition-all">
            <Settings size={16} />
            Config
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stream View */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`aspect-video rounded-3xl border overflow-hidden relative group ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 z-10">
                <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
                <p className="text-zinc-500 font-medium">Connecting to RTSP Stream...</p>
              </div>
            ) : activeCamera?.status === 'Offline' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 z-10">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <p className="text-zinc-900 dark:text-white font-bold text-xl">Camera Offline</p>
                <p className="text-zinc-500 text-sm mt-2">Check power and network connection</p>
                <button 
                  onClick={fetchCameras}
                  className="mt-6 px-6 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <>
                {activeCamera?.streaming_url ? (
                  <iframe 
                    src={activeCamera.streaming_url} 
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    title="Camera Stream"
                  />
                ) : (
                  <img 
                    src={`https://picsum.photos/seed/${activeCamera?.id || 'cam1'}/1280/720`} 
                    alt="Live Stream" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {/* Overlay Controls */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Live
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
                    {activeCamera?.buses?.bus_number || 'Bus 101'}
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-all">
                    <Maximize2 size={20} />
                  </button>
                  <button className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-all">
                    <Video size={20} />
                  </button>
                </div>
              </>
            )}
          </div>

          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Stream Information</h3>
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                <Activity size={16} />
                Stable Connection
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Resolution</p>
                <p className="font-bold text-zinc-900 dark:text-white">1080p HD</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Bitrate</p>
                <p className="font-bold text-zinc-900 dark:text-white">4.2 Mbps</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">FPS</p>
                <p className="font-bold text-zinc-900 dark:text-white">30 FPS</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Encryption</p>
                <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Shield size={14} className="text-emerald-500" />
                  AES-256
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Camera List */}
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
            <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
              <Eye size={20} className="text-emerald-500" />
              All Cameras
            </h3>
            
            <div className="space-y-4">
              {cameras.map((cam) => (
                <button 
                  key={cam.id}
                  onClick={() => setActiveCamera(cam)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all group ${
                    activeCamera?.id === cam.id 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{cam.buses?.bus_number || 'Unknown Bus'}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${cam.status === 'Online' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {cam.status || 'Online'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Camera size={14} />
                      <span>{cam.camera_type || 'Interior'}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">{cam.lastUpdate || 'Live'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20">
            <h4 className="font-bold mb-2">Cloud Storage</h4>
            <p className="text-emerald-100 text-xs mb-4">Your surveillance data is being backed up to secure cloud storage.</p>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Used: 124 GB</span>
              <span>Total: 1 TB</span>
            </div>
            <div className="h-1.5 bg-emerald-500/30 rounded-full mt-2 overflow-hidden">
              <div className="h-full w-[12%] bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
