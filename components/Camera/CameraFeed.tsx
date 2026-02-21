import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { X, Maximize2, Camera, MapPin, Clock, Zap } from 'lucide-react';

interface CameraFeedProps {
  streamUrl: string;
  cameraName: string;
  busName: string;
  speed?: number;
  location?: [number, number];
  onClose: () => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ streamUrl, cameraName, busName, speed = 45, location = [32.2190, 76.3234], onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (videoRef.current) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
          src: streamUrl,
          type: 'application/x-mpegURL' // HLS
        }]
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [streamUrl]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
        <div className="p-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Camera size={24} />
            </div>
            <div>
              <h2 className="text-white font-black tracking-tight">{busName} - {cameraName}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Live Stream</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="relative flex-1 bg-black group">
          <video ref={videoRef} className="video-js vjs-big-play-centered w-full h-full" />
          
          {/* Overlays */}
          <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
              <MapPin size={14} className="text-primary-light" />
              <span className="text-white text-xs font-mono">{location[0].toFixed(4)}, {location[1].toFixed(4)}</span>
            </div>
            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
              <Zap size={14} className="text-warning" />
              <span className="text-white text-xs font-mono">{speed} km/h</span>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
              <Clock size={14} className="text-slate-400" />
              <span className="text-white text-xs font-mono">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors">
              <Camera size={18} />
              Snapshot
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors">
              <Maximize2 size={18} />
              Fullscreen
            </button>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Encrypted End-to-End</p>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;
