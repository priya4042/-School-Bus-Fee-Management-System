import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Clock, Zap, AlertCircle, ShieldCheck, ShieldOff } from 'lucide-react';
import CameraFeed from '../../components/Camera/CameraFeed';
import { User } from '../../types';
import { supabase } from '../../lib/supabase';
import MiniLoader from '../../components/MiniLoader';

const BusCamera: React.FC<{ user: User }> = ({ user }) => {
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<any>(null);
  const [busInfo, setBusInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const cameraEnabled = (user as any).preferences?.camera === true;

  useEffect(() => {
    if (!cameraEnabled) { setLoading(false); return; }
    fetchCameraData();
  }, [user]);

  const fetchCameraData = async () => {
    try {
      const { data: studentsData } = await supabase
        .from('students')
        .select('*, buses(id, bus_number, plate)')
        .eq('parent_id', user.id)
        .limit(1);

      if (studentsData && studentsData.length > 0 && studentsData[0].buses) {
        const bus = studentsData[0].buses;
        setBusInfo(bus);

        const { data: cameraData } = await supabase
          .from('bus_cameras')
          .select('*')
          .eq('bus_id', bus.id);

        setCameras(cameraData || []);
        if (cameraData && cameraData.length > 0) setSelectedCamera(cameraData[0]);
      }
    } catch (err: any) {
      console.error('Failed to fetch camera data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="py-20 text-center">
      <MiniLoader />
    </div>
  );

  // Permission denied
  if (!cameraEnabled) {
    return (
      <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight">Live Bus Monitor</h1>
          <p className="text-slate-500 font-medium text-xs md:text-base mt-1 md:mt-2">Real-time safety monitoring for your child's journey</p>
        </div>
        <div className="py-16 md:py-32 bg-white rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center px-6 md:px-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-red-50 text-red-400 rounded-[2rem] flex items-center justify-center mb-5 md:mb-6">
            <ShieldOff size={48} />
          </div>
          <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight mb-3">Access Restricted</h3>
          <p className="text-slate-500 font-bold text-xs md:text-sm max-w-sm mx-auto">
            Camera access has not been granted for your account. Please contact the Bus Administrator to enable live camera monitoring.
          </p>
          <div className="mt-6 md:mt-8 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Admin to Enable Access</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
        <div>
          <h1 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight">Live Bus Monitor</h1>
          <p className="text-slate-500 font-medium text-xs md:text-base mt-1 md:mt-2">Real-time safety monitoring for your child's journey</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 bg-emerald-50 text-emerald-600 px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-emerald-100 self-start md:self-auto">
          <ShieldCheck size={18} />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Access Granted</span>
        </div>
      </div>

      {!busInfo ? (
        <div className="py-16 md:py-20 bg-slate-50 rounded-2xl md:rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6 md:px-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
            <Camera size={40} />
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-2">No Active Bus Session</h3>
          <p className="text-slate-500 text-xs md:text-sm max-w-xs mx-auto">Live monitoring is only available when your child's bus is on route.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-premium border border-slate-100 overflow-hidden relative">
              <div className="aspect-video bg-slate-900 rounded-2xl md:rounded-3xl flex items-center justify-center text-slate-700 overflow-hidden relative group">
                {selectedCamera ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <p className="text-white font-black text-base md:text-xl mb-3 md:mb-4">Click to Start Stream</p>
                    <button
                      onClick={() => setSelectedCamera({ ...selectedCamera })}
                      className="bg-primary text-white p-5 md:p-6 rounded-full shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Zap size={28} fill="currentColor" />
                    </button>
                    {/* Pulsing rings around play button */}
                    <span className="absolute w-24 h-24 rounded-full border-2 border-primary/30 animate-ping pointer-events-none"></span>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-xs md:text-sm font-bold opacity-40">Select a camera to view live feed</p>
                  </div>
                )}
                <div className="absolute top-3 left-3 md:top-6 md:left-6 flex gap-2">
                  <span className="bg-black/50 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg border border-white/10">
                    {busInfo.plate || busInfo.bus_number}
                  </span>
                  <span className="bg-emerald-500 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg border border-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    Live
                  </span>
                </div>
                {/* Signal-strength bars (top right) */}
                <div className="absolute top-3 right-3 md:top-6 md:right-6 flex items-end gap-0.5 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10">
                  <span className="w-1 h-2 bg-emerald-400 rounded-sm"></span>
                  <span className="w-1 h-3 bg-emerald-400 rounded-sm"></span>
                  <span className="w-1 h-4 bg-emerald-400 rounded-sm"></span>
                  <span className="w-1 h-5 bg-emerald-400 rounded-sm animate-pulse"></span>
                </div>
              </div>
            </div>

            {cameras.length > 0 && (
              <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 shadow-premium border border-slate-100">
                <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight mb-4 md:mb-6">Available Cameras</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {cameras.map((cam, idx) => (
                    <button
                      key={cam.id}
                      onClick={() => setSelectedCamera(cam)}
                      style={{ animationDelay: `${idx * 60}ms` }}
                      className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all text-left flex flex-col gap-3 md:gap-4 active:scale-95 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
                        selectedCamera?.id === cam.id
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:-translate-y-0.5'
                      }`}
                    >
                      <Camera size={20} />
                      <div>
                        <p className="font-bold text-xs md:text-sm">{cam.camera_name}</p>
                        <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${selectedCamera?.id === cam.id ? 'text-white/60' : 'text-slate-400'}`}>
                          {cam.camera_type}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 md:space-y-8">
            <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 shadow-premium border border-slate-100">
              <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight mb-4 md:mb-6">Bus Info</h3>
              <div className="grid grid-cols-3 md:grid-cols-1 md:space-y-6 gap-3">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Bus No.</p>
                    <p className="font-bold text-slate-900 text-xs md:text-base truncate">{busInfo.bus_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 text-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Zap size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Plate</p>
                    <p className="font-bold text-slate-900 text-xs md:text-base truncate">{busInfo.plate || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 text-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Cameras</p>
                    <p className="font-bold text-slate-900 text-xs md:text-base">{cameras.length} Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 text-white shadow-2xl relative overflow-hidden">
              <AlertCircle size={28} className="mb-4 md:mb-6 text-amber-400" />
              <h3 className="text-base md:text-xl font-black tracking-tight mb-2">Privacy Notice</h3>
              <p className="text-slate-400 text-xs md:text-sm font-medium mb-4 md:mb-6">Camera access is strictly for safety monitoring. Recording or sharing these feeds is prohibited.</p>
              <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Audit Log Active
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCamera && busInfo && (
        <CameraFeed
          streamUrl={selectedCamera.stream_url}
          cameraName={selectedCamera.camera_name}
          busName={busInfo.plate || busInfo.bus_number || 'Bus'}
          onClose={() => setSelectedCamera(null)}
        />
      )}
    </div>
  );
};

export default BusCamera;
