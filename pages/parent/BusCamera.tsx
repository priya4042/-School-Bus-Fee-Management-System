import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Clock, Zap, AlertCircle, ShieldCheck } from 'lucide-react';
import CameraFeed from '../../components/Camera/CameraFeed';
import axios from 'axios';
import { User } from '../../types';

const BusCamera: React.FC<{ user: User }> = ({ user }) => {
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<any>(null);
  const [busInfo, setBusInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCameraData();
  }, []);

  const fetchCameraData = async () => {
    try {
      // In a real app, we'd find the bus the child is currently on
      const res = await axios.get('/api/v1/tracking/parent/bus-cameras');
      setCameras(res.data.cameras || []);
      setBusInfo(res.data.bus || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Live Bus Monitor</h1>
          <p className="text-slate-500 font-medium mt-2">Real-time safety monitoring for your child's journey</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl border border-emerald-100">
          <ShieldCheck size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Secure Feed</span>
        </div>
      </div>

      {!busInfo ? (
        <div className="py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
            <Camera size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Active Bus Session</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">Live monitoring is only available when your child's bus is on route.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100 overflow-hidden relative">
              <div className="aspect-video bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700 overflow-hidden relative group">
                {selectedCamera ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <p className="text-white font-black text-xl mb-4">Click to Start Stream</p>
                    <button 
                      onClick={() => setSelectedCamera(selectedCamera)}
                      className="bg-primary text-white p-6 rounded-full shadow-2xl shadow-primary/40 hover:scale-110 transition-transform"
                    >
                      <Zap size={32} fill="currentColor" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-bold opacity-40">Select a camera to view live feed</p>
                  </div>
                )}
                
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10">
                    {busInfo.plate}
                  </span>
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-emerald-400">
                    Live
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Available Cameras</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cameras.map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setSelectedCamera(cam)}
                    className={`p-6 rounded-3xl border transition-all text-left flex flex-col gap-4 ${
                      selectedCamera?.id === cam.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Camera size={24} />
                    <div>
                      <p className="font-bold text-sm">{cam.camera_name}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${selectedCamera?.id === cam.id ? 'text-white/60' : 'text-slate-400'}`}>
                        {cam.camera_type}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Bus Status</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Location</p>
                    <p className="font-bold text-slate-900">Near Kangra Fort</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                    <Zap size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Speed</p>
                    <p className="font-bold text-slate-900">42 km/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Update</p>
                    <p className="font-bold text-slate-900">Just now</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <AlertCircle size={32} className="mb-6 text-warning" />
              <h3 className="text-xl font-black tracking-tight mb-2">Privacy Notice</h3>
              <p className="text-slate-400 text-sm font-medium mb-6">Camera access is strictly for safety monitoring. Recording or sharing these feeds is prohibited.</p>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                Audit Log Active
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCamera && (
        <CameraFeed 
          streamUrl={selectedCamera.stream_url}
          cameraName={selectedCamera.camera_name}
          busName={busInfo?.plate || 'Bus'}
          onClose={() => setSelectedCamera(null)}
        />
      )}
    </div>
  );
};

export default BusCamera;
