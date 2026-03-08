
import React, { useState, useEffect } from 'react';
import { Camera, Shield, AlertCircle, RefreshCw, Maximize2, Settings, User } from 'lucide-react';
import { User as UserType } from '../../types';

const BusCamera: React.FC<{ user: UserType }> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCamera, setActiveCamera] = useState(1);

  useEffect(() => {
    // Simulate camera connection delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const cameras = [
    { id: 1, name: 'Front View', description: 'Driver & Road View' },
    { id: 2, name: 'Cabin View', description: 'Student Seating Area' },
    { id: 3, name: 'Rear View', description: 'Back Entrance & Road' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Live Fleet Vision</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Secure Real-time Visual Monitoring</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Encrypted Stream Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-950 rounded-[3rem] aspect-video relative overflow-hidden shadow-2xl border-8 border-white/5 group">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                <RefreshCw size={48} className="animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Establishing Secure Uplink...</p>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-8 text-center">
                <AlertCircle size={48} className="mb-4" />
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">Connection Interrupted</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 max-w-xs">{error}</p>
                <button onClick={() => setLoading(true)} className="mt-6 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Retry Connection</button>
              </div>
            ) : (
              <>
                <img 
                  src={`https://picsum.photos/seed/bus-cam-${activeCamera}/1280/720?blur=1`} 
                  alt="Live Bus Stream" 
                  className="w-full h-full object-cover opacity-60 grayscale"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
                
                {/* Overlay UI */}
                <div className="absolute top-8 left-8 flex items-center gap-4">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">REC</span>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md text-white/80 px-4 py-2 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest">
                    CAM {activeCamera} • {cameras.find(c => c.id === activeCamera)?.name}
                  </div>
                </div>

                <div className="absolute top-8 right-8 flex items-center gap-3">
                  <button className="w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all">
                    <Maximize2 size={18} />
                  </button>
                  <button className="w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all">
                    <Settings size={18} />
                  </button>
                </div>

                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Vehicle ID</p>
                      <p className="text-sm font-black text-white tracking-tight uppercase">HP-68-1234</p>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div>
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Current Speed</p>
                      <p className="text-sm font-black text-white tracking-tight uppercase">42 KM/H</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Timestamp</p>
                    <p className="text-sm font-black text-white tracking-tight uppercase">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {cameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setActiveCamera(cam.id)}
                className={`p-6 rounded-[2rem] text-left transition-all border ${
                  activeCamera === cam.id 
                    ? 'bg-white border-primary shadow-xl shadow-primary/5' 
                    : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  activeCamera === cam.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  <Camera size={20} />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-tight text-slate-800 mb-1">{cam.name}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cam.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Privacy Guard</h3>
            </div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-loose mb-8 relative z-10">
              Visual streams are end-to-end encrypted and accessible only to verified parents during active transit hours.
            </p>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black uppercase tracking-widest">Face Blur</span>
                <div className="w-8 h-4 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black uppercase tracking-widest">Low Latency</span>
                <div className="w-8 h-4 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Active Viewers</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                    <User size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-200 w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusCamera;
