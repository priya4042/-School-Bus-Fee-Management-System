import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { MOCK_STUDENTS } from '../constants';
import api, { BusTelemetry } from '../lib/api';
import { supabase } from '../lib/supabase';
import { showToast, showAlert, showLoading, closeSwal } from '../lib/swal';

import { Geolocation } from '@capacitor/geolocation';
import { requestLocationPermission } from '../lib/permissions';

const DriverDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [boardingStatus, setBoardingStatus] = useState<Record<string, boolean>>({});
  const watchId = useRef<string | null>(null);
  const [busId, setBusId] = useState<string>('b1');
  const [geofences, setGeofences] = useState<any[]>([]);

  useEffect(() => {
    const fetchGeofences = async () => {
      const { data } = await supabase.from('geofences').select('*');
      if (data) setGeofences(data);
    };
    fetchGeofences();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  };

  const startTrip = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    showLoading('Initializing Fleet GPS...');
    try {
      setIsTripActive(true);
      
      // Capacitor Geolocation Watch
      watchId.current = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000 },
        (position, err) => {
          if (err) {
            console.error("GPS Error:", err);
            return;
          }
          if (position) {
            const { latitude, longitude, speed } = position.coords;
            setCurrentCoords({ lat: latitude, lng: longitude });
            BusTelemetry.broadcastLocation(busId, latitude, longitude, speed || 0);

            // Geofence Check: Auto-notify arrival for any geofence of type 'SCHOOL'
            geofences.forEach(gf => {
              const dist = calculateDistance(latitude, longitude, gf.latitude, gf.longitude);
              if (dist < gf.radius_meters && gf.type === 'SCHOOL' && isTripActive) {
                 endTrip();
              }
            });
          }
        }
      );

      closeSwal();
      showToast('Morning Trip Started', 'success');
    } catch (err) {
      closeSwal();
      showAlert('Sync Error', 'Could not establish satellite link.', 'error');
    }
  };

  const endTrip = async () => {
    showLoading('Broadcasting Arrival to Parents...');
    
    // Broadcast arrival notification
    BusTelemetry.notifyArrival(busId, 'KNG-01-A');

    if (watchId.current) {
      await Geolocation.clearWatch({ id: watchId.current });
      watchId.current = null;
    }
    
    setIsTripActive(false);
    setCurrentCoords(null);
    closeSwal();
    showAlert('Arrived at School', 'Arrival notification has been sent to all parents on this manifest.', 'success');
  };

  const toggleStudentStatus = async (studentId: string) => {
    const isPicked = !boardingStatus[studentId];
    setBoardingStatus(prev => ({ ...prev, [studentId]: isPicked }));
    showToast(isPicked ? 'Student Boarded' : 'Marked Absence', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-premium flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 p-8 opacity-5">
           <i className="fas fa-id-card text-[150px] text-primary -rotate-12 translate-x-12 translate-y-6"></i>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-3xl shadow-2xl border-4 border-white/10">
             <i className="fas fa-id-card"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{user.fullName || user.full_name}</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
              Fleet Asset B101 • North Zone Route
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto relative z-10">
          {!isTripActive ? (
            <button 
              onClick={startTrip}
              className="flex-1 md:flex-none bg-success text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-4 shadow-xl shadow-success/20 hover:scale-105 transition-all active:scale-95"
            >
              <i className="fas fa-play text-xl"></i>
              Start Morning Trip
            </button>
          ) : (
            <button 
              onClick={endTrip}
              className="flex-1 md:flex-none bg-danger text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-4 shadow-xl shadow-danger/20 hover:scale-105 transition-all active:scale-95"
            >
              <i className="fas fa-school text-xl"></i>
              Reached School
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden">
             <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                <div>
                   <h3 className="font-black text-[11px] uppercase tracking-widest text-white/50 mb-1">Boarding Manifest</h3>
                   <p className="text-xs font-bold">{MOCK_STUDENTS.length} Authorized Riders</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${isTripActive ? 'bg-success animate-pulse' : 'bg-slate-700'}`}></div>
                   <span className="text-[10px] font-black tracking-widest uppercase">{isTripActive ? 'Live Telemetry' : 'Standby'}</span>
                </div>
             </div>
             
             <div className="divide-y divide-slate-50">
                {MOCK_STUDENTS.map(student => (
                   <div key={student.id} className="p-8 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors text-slate-400 group-hover:text-primary border border-slate-200/50">
                            <i className="fas fa-user-graduate text-xl"></i>
                         </div>
                         <div>
                            <p className="font-black text-slate-800 text-lg tracking-tight">{student.full_name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Stop ID: ST-442 • Kangra Gate</p>
                         </div>
                      </div>
                      <button 
                        disabled={!isTripActive}
                        onClick={() => toggleStudentStatus(student.id)}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          boardingStatus[student.id] 
                            ? 'bg-success text-white shadow-lg shadow-success/20' 
                            : 'bg-white border border-slate-200 text-slate-400 hover:bg-primary hover:text-white hover:border-primary'
                        } disabled:opacity-30 active:scale-95`}
                      >
                         {boardingStatus[student.id] ? 'Boarded' : 'Mark Pickup'}
                      </button>
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <i className="fas fa-route text-[200px] -rotate-12 translate-x-12 translate-y-12"></i>
             </div>
             <h4 className="font-black text-[10px] uppercase tracking-widest text-success mb-10">Real-Time Metrics</h4>
             <div className="space-y-10 relative z-10">
                <div>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Occupancy</p>
                   <p className="text-5xl font-black">{Object.values(boardingStatus).filter(v => v).length} <span className="text-lg text-slate-600 font-black ml-2 uppercase">/ {MOCK_STUDENTS.length} Seats</span></p>
                </div>
                <div className="h-px bg-white/10 w-full"></div>
                <div className="flex justify-between items-end">
                    <div>
                       <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Ground Velocity</p>
                       <p className="text-3xl font-black">{isTripActive ? 'Simulated' : '0'} <span className="text-sm text-slate-600 ml-1 uppercase">km/h</span></p>
                    </div>
                    <div className="text-right">
                       <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Next Destination</p>
                       <p className="text-sm font-black text-primary-light uppercase">Main Campus</p>
                    </div>
                </div>
             </div>
          </div>
          
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-premium">
             <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3">
                <i className="fas fa-shield-alt text-danger"></i>
                Tactical Support
             </h4>
             <button className="w-full flex items-center justify-between p-6 bg-red-600 text-white rounded-[1.5rem] hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-[0.98]">
                <span className="font-black text-xs uppercase tracking-widest">SOS Panic Signal</span>
                <i className="fas fa-exclamation-triangle text-xl"></i>
             </button>
             <p className="text-[9px] text-slate-400 mt-6 text-center font-bold italic uppercase tracking-[0.2em]">Instantly locks manifest & alerts authorities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;