import React, { useState, useEffect } from 'react';
import GoogleMap from '../components/GoogleMap';
import { useTracking } from '../hooks/useTracking';
import { useBuses } from '../hooks/useBuses';
import BusCameraAdmin from './BusCameraAdmin';
import Permissions from './Permissions';

const LiveTracking: React.FC = () => {
  const { buses } = useBuses();
  const [activeBusId, setActiveBusId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tracking' | 'camera' | 'permissions'>('tracking');
  const { location } = useTracking(activeBusId || undefined);

  useEffect(() => {
    if (buses && buses.length > 0 && !activeBusId) {
      setActiveBusId(buses[0].id);
    }
  }, [buses, activeBusId]);

  const renderTrackingPanel = () => (
    <>
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveBusId(activeBusId === buses?.[0]?.id ? buses?.[1]?.id || buses?.[0]?.id : buses?.[0]?.id || null)}
            className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-primary text-white shadow-lg"
          >
            <i className="fas fa-bus mr-2"></i>
            Switch Bus
          </button>
        </div>
      </div>

      <div className="h-[600px] bg-white rounded-2xl md:rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden relative z-0">
        <GoogleMap location={location} busId={activeBusId || undefined} />
        {location && (
          <div className="absolute bottom-10 left-10 z-[1000] bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-white min-w-[200px] animate-in slide-in-from-left-4">
            <p className="text-[9px] font-black uppercase text-success tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              Live Signal: {activeBusId || 'B101'}
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase">Velocity</span>
                <span className="text-xl font-black tracking-tighter">{Math.round(location.speed)} KM/H</span>
              </div>
              <div className="h-px bg-white/5"></div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase">Satellite Ref</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase">GPS_32N_76E</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bus List */}
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-premium p-8">
        <h3 className="text-lg font-black text-slate-800 tracking-widest mb-6">Active Buses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buses && buses.map((bus) => (
            <button
              key={bus.id}
              onClick={() => setActiveBusId(bus.id)}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                activeBusId === bus.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-slate-50 border-slate-200 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${bus.status === 'active' ? 'bg-success animate-pulse' : 'bg-slate-300'}`}></div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{bus.bus_number || `Bus ${bus.id}`}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">{bus.status}</p>
                  </div>
                </div>
                <i className={`fas fa-arrow-right text-slate-300 transition-all ${activeBusId === bus.id ? 'text-primary translate-x-1' : ''}`}></i>
              </div>
            </button>
          ))}
        </div>
      </div>

    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {activeTab === 'tracking' ? (
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Live Tracking Hub</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Tracking, Camera Monitoring & Parent Access Controls</p>
          </div>
        ) : <div />}
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tracking' ? 'bg-primary text-white' : 'text-slate-500'}`}
          >
            Tracking
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'camera' ? 'bg-primary text-white' : 'text-slate-500'}`}
          >
            Bus Camera
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'permissions' ? 'bg-primary text-white' : 'text-slate-500'}`}
          >
            Permissions
          </button>
        </div>
      </div>

      {activeTab === 'tracking' && renderTrackingPanel()}
      {activeTab === 'camera' && <BusCameraAdmin />}
      {activeTab === 'permissions' && <Permissions />}
    </div>
  );
};

export default LiveTracking;
