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
      <div className="h-[400px] md:h-[600px] bg-white rounded-2xl md:rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden relative z-0">
        <GoogleMap location={location} busId={activeBusId || undefined} />
        {location && (
          <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-auto z-[1000] bg-slate-900/90 backdrop-blur-xl p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 text-white md:min-w-[200px] animate-in slide-in-from-left-4">
            <p className="text-[9px] font-black uppercase text-success tracking-widest mb-3 md:mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              Live Signal: {activeBusId || 'B101'}
            </p>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase">Velocity</span>
                <span className="text-lg md:text-xl font-black tracking-tighter">{Math.round(location.speed)} KM/H</span>
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
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-premium p-3 md:p-8">
        <h3 className="text-sm md:text-lg font-black text-slate-800 tracking-tight md:tracking-widest mb-3 md:mb-6">Active Buses</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {buses && buses.map((bus) => (
            <button
              key={bus.id}
              onClick={() => setActiveBusId(bus.id)}
              className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all text-left active:scale-95 ${
                activeBusId === bus.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-slate-50 border-slate-200 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 ${bus.status === 'active' ? 'bg-success animate-pulse' : 'bg-slate-300'}`}></div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-xs md:text-sm truncate">{bus.bus_number || `Bus ${bus.id}`}</p>
                    <p className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-widest">{bus.status}</p>
                  </div>
                </div>
                <i className={`fas fa-arrow-right text-slate-300 text-xs md:text-sm flex-shrink-0 transition-all ${activeBusId === bus.id ? 'text-primary translate-x-1' : ''}`}></i>
              </div>
            </button>
          ))}
        </div>
      </div>

    </>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        {activeTab === 'tracking' ? (
          <div>
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tighter">Live Tracking Hub</h2>
            <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-1">Tracking, Camera Monitoring & Parent Access Controls</p>
          </div>
        ) : <div />}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3 md:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${activeTab === 'tracking' ? 'bg-primary text-white' : 'text-slate-500'}`}
          >
            Tracking
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3 md:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${activeTab === 'camera' ? 'bg-primary text-white' : 'text-slate-500'}`}
          >
            <span className="hidden sm:inline">Bus </span>Camera
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3 md:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${activeTab === 'permissions' ? 'bg-primary text-white' : 'text-slate-500'}`}
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
