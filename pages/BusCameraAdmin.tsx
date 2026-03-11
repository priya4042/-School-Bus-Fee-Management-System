import React, { useState, useEffect } from 'react';
import { Camera, AlertCircle, ShieldCheck } from 'lucide-react';
import CameraFeed from '../components/Camera/CameraFeed';
import { useBuses } from '../hooks/useBuses';
import { supabase } from '../lib/supabase';

const BusCameraAdmin: React.FC = () => {
  const { buses } = useBuses();
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<any>(null);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (buses && buses.length > 0) {
      setSelectedBus(buses[0]);
      fetchCameras(buses[0].id);
    }
  }, [buses]);

  const fetchCameras = async (busId: string) => {
    try {
      setLoading(true);
      const { data: cameraData } = await supabase
        .from('camera_configs')
        .select('*')
        .eq('bus_id', busId);

      setCameras(cameraData || []);
      if (cameraData && cameraData.length > 0) {
        setSelectedCamera(cameraData[0]);
      } else {
        setSelectedCamera(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch cameras:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBusChange = (bus: any) => {
    setSelectedBus(bus);
    fetchCameras(bus.id);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Live Bus Monitor</h1>
          <p className="text-slate-500 font-medium mt-2">Fleet Safety & Monitoring Hub</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl border border-emerald-100">
          <ShieldCheck size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Admin Access</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Loading camera feeds...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            {selectedCamera ? (
              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden h-[500px]">
                  <CameraFeed 
                    streamUrl={selectedCamera.rtsp_url || ''} 
                    cameraName={selectedCamera.name || 'Camera Feed'}
                    busName={selectedBus?.bus_number || 'Bus'}
                    onClose={() => setSelectedCamera(null)}
                  />
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-black text-slate-800 uppercase text-sm mb-4">Camera Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">RTSP URL</p>
                      <p className="font-mono text-xs text-slate-600 truncate">{selectedCamera.rtsp_url || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Status</p>
                      <span className="inline-block px-3 py-1 bg-success/10 text-success text-[10px] font-black uppercase rounded-lg">
                        Active
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Resolution</p>
                      <p className="font-mono text-xs text-slate-600">{selectedCamera.resolution || '1920x1080'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">FPS</p>
                      <p className="font-mono text-xs text-slate-600">{selectedCamera.fps || '30'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-8 h-[500px]">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                  <Camera size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Camera Configured</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">This bus doesn't have a camera configured yet. Add a camera through the admin settings.</p>
              </div>
            )}
          </div>

          {/* Bus & Camera Selection */}
          <div className="space-y-6">
            {/* Bus List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-black text-slate-800 uppercase text-[10px] mb-4 tracking-widest">Select Bus</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {buses && buses.map((bus) => (
                  <button
                    key={bus.id}
                    onClick={() => handleBusChange(bus)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                      selectedBus?.id === bus.id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-slate-50 border-slate-100 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${bus.status === 'active' ? 'bg-success' : 'bg-slate-300'}`}></div>
                      <span className="font-black text-slate-800 text-sm truncate">{bus.bus_number || `Bus ${bus.id}`}</span>
                    </div>
                    <i className={`fas fa-arrow-right text-slate-300 text-xs transition-all ${selectedBus?.id === bus.id ? 'text-primary' : ''}`}></i>
                  </button>
                ))}
              </div>
            </div>

            {/* Cameras for Selected Bus */}
            {selectedBus && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-black text-slate-800 uppercase text-[10px] mb-4 tracking-widest">Available Cameras</h3>
                {cameras.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cameras.map((camera) => (
                      <button
                        key={camera.id}
                        onClick={() => setSelectedCamera(camera)}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                          selectedCamera?.id === camera.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-slate-50 border-slate-100 hover:border-primary/30'
                        }`}
                      >
                        <Camera size={16} className={selectedCamera?.id === camera.id ? 'text-primary' : 'text-slate-400'} />
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-xs truncate">{camera.name || 'Camera Feed'}</p>
                          <p className="text-[8px] text-slate-500 uppercase">{camera.location || 'Main Cabin'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">No cameras</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusCameraAdmin;
