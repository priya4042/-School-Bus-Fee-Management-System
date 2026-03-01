import React, { useState, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Maximize2, 
  RefreshCw, 
  Shield, 
  AlertCircle,
  Loader2,
  Info,
  Bus as BusIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CameraMonitoringProps {
  student: any;
  isDarkMode: boolean;
}

export default function CameraMonitoring({ student, isDarkMode }: CameraMonitoringProps) {
  const [cameraConfig, setCameraConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchCameraConfig = async () => {
    if (!student.bus_id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/parent/camera-config/${student.bus_id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCameraConfig(data);
        setError(null);
      } else {
        setError(data.error || 'Camera feed not available');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameraConfig();
  }, [student.bus_id]);

  const toggleFullscreen = () => {
    const elem = document.getElementById('camera-feed');
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className={`p-8 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-600/10">
            <Video size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Bus Surveillance</h3>
            <p className="text-zinc-500 text-sm">Live camera feed from Bus {student.buses?.bus_number}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${cameraConfig?.is_active ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-100 text-red-600 dark:bg-red-900/20'}`}>
            <div className={`w-2 h-2 rounded-full ${cameraConfig?.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {cameraConfig?.is_active ? 'Live Stream Online' : 'Stream Offline'}
          </div>
          <button 
            onClick={fetchCameraConfig}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-95"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Camera Feed Container */}
      <div className="flex-1 min-h-[400px] relative rounded-[40px] border-4 border-zinc-200 dark:border-zinc-800 bg-black overflow-hidden shadow-2xl group">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-bold">Connecting to camera...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500 mb-6">
              <VideoOff size={40} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">Feed Unavailable</h4>
            <p className="text-zinc-500 max-w-md mb-8">{error}</p>
            <button 
              onClick={fetchCameraConfig}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-2xl font-bold transition-all active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            <div id="camera-feed" className="w-full h-full">
              {/* RTSP streams usually need a proxy or specific player. 
                  For this demo, we'll use an iframe pointing to the streaming_url 
                  or a placeholder if not available. */}
              {cameraConfig.streaming_url ? (
                <iframe 
                  src={cameraConfig.streaming_url} 
                  className="w-full h-full border-0"
                  allowFullScreen
                  title="Bus Camera Feed"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <img 
                    src={`https://picsum.photos/seed/${student.bus_id}/1280/720?blur=2`} 
                    alt="Camera Feed Placeholder" 
                    className="w-full h-full object-cover opacity-40"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                    <Video size={64} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">Encrypted RTSP Stream</p>
                    <p className="text-[10px] opacity-60 mt-2">Bus ID: {student.bus_id}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Overlay Controls */}
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={toggleFullscreen}
                className="p-3 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-2xl text-white transition-all active:scale-95"
              >
                <Maximize2 size={24} />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-white text-xs font-bold">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE • {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-white text-xs font-bold">
                <BusIcon size={14} />
                BUS {student.buses?.bus_number}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Safety Info */}
      <div className={`p-6 rounded-3xl border flex items-start gap-4 ${isDarkMode ? 'bg-indigo-900/10 border-indigo-900/20' : 'bg-indigo-50 border-indigo-100'}`}>
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
          <Shield size={20} />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Secure Surveillance</h4>
          <p className="text-sm text-indigo-700 dark:text-indigo-400/80 mt-1">
            This camera feed is encrypted and only accessible to verified parents of students assigned to this bus. 
            Recording or sharing this feed is strictly prohibited for child safety.
          </p>
        </div>
      </div>
    </div>
  );
}
