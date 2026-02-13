
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { MOCK_STUDENTS } from '../constants';
import api from '../lib/api';

const DriverDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [isTripActive, setIsTripActive] = useState(false);
  const [tripData, setTripData] = useState<any>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [boardingStatus, setBoardingStatus] = useState<Record<string, boolean>>({});
  const watchId = useRef<number | null>(null);

  const startTrip = async () => {
    try {
      const response = await api.post('/tracking/trip/start?bus_id=1&route_id=1&driver_id=' + user.id);
      setTripData(response.data);
      setIsTripActive(true);
      
      if ("geolocation" in navigator) {
        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed } = position.coords;
            setCurrentCoords({ lat: latitude, lng: longitude });
            api.post('/tracking/location', {
              trip_id: response.data.id,
              bus_id: 1,
              lat: latitude,
              lng: longitude,
              speed: speed || 0
            }).catch(console.error);
          },
          (error) => console.error("GPS Error:", error),
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
        );
      }
    } catch (err) {
      alert("Error starting trip. Check connection.");
    }
  };

  const endTrip = async () => {
    if (tripData) await api.post(`/tracking/trip/${tripData.id}/end`);
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    setIsTripActive(false);
    setTripData(null);
    setCurrentCoords(null);
  };

  const toggleStudentStatus = async (studentId: string) => {
    const isPicked = !boardingStatus[studentId];
    setBoardingStatus(prev => ({ ...prev, [studentId]: isPicked }));
    
    if (tripData) {
      api.post('/tracking/pickup', {
        trip_id: tripData.id,
        student_id: studentId,
        action_type: isPicked ? 'PICKED_UP' : 'DROPPED_OFF'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl">
             <i className="fas fa-id-card"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user.fullName}</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
              Active Driver • North Zone Route
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          {!isTripActive ? (
            <button 
              onClick={startTrip}
              className="flex-1 md:flex-none bg-success text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-success/20 hover:scale-105 transition-all"
            >
              <i className="fas fa-play text-xl"></i>
              Start Morning Trip
            </button>
          ) : (
            <button 
              onClick={endTrip}
              className="flex-1 md:flex-none bg-danger text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-danger/20 hover:scale-105 transition-all"
            >
              <i className="fas fa-stop text-xl"></i>
              End Current Trip
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-widest">Live Student Manifest</h3>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${isTripActive ? 'bg-success animate-pulse' : 'bg-slate-600'}`}></div>
                   <span className="text-[10px] font-bold">{isTripActive ? 'LIVE TRACKING' : 'READY'}</span>
                </div>
             </div>
             
             <div className="divide-y divide-slate-50">
                {MOCK_STUDENTS.map(student => (
                   <div key={student.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <i className="fas fa-user-graduate text-slate-400 group-hover:text-primary"></i>
                         </div>
                         <div>
                            {/* Fix: Use full_name */}
                            <p className="font-black text-slate-800">{student.full_name}</p>
                            <p className="text-xs text-slate-400 font-bold uppercase">Stop: Sector 14 Community</p>
                         </div>
                      </div>
                      <button 
                        disabled={!isTripActive}
                        onClick={() => toggleStudentStatus(student.id)}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          boardingStatus[student.id] 
                            ? 'bg-success text-white' 
                            : 'bg-slate-100 text-slate-400 hover:bg-primary hover:text-white'
                        } disabled:opacity-30`}
                      >
                         {boardingStatus[student.id] ? 'Boarded' : 'Mark Pickup'}
                      </button>
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <i className="fas fa-route text-[150px] -rotate-12 translate-x-8 translate-y-4"></i>
             </div>
             <h4 className="font-black text-xs uppercase tracking-[0.2em] text-success mb-6">Route Statistics</h4>
             <div className="space-y-6">
                <div>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Students Onboard</p>
                   <p className="text-4xl font-black">{Object.values(boardingStatus).filter(v => v).length} <span className="text-sm text-slate-500">/ {MOCK_STUDENTS.length}</span></p>
                </div>
                <div className="h-px bg-white/10 w-full"></div>
                <div>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Current Speed</p>
                   <p className="text-3xl font-black">42 <span className="text-sm text-slate-500">KM/H</span></p>
                </div>
                <div>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Next Stop Distance</p>
                   <p className="text-xl font-bold">1.2 KM <span className="text-xs font-medium text-slate-500 ml-2">~ 4 MINS</span></p>
                </div>
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">Emergency Support</h4>
             <button className="w-full flex items-center justify-between p-4 bg-danger/5 text-danger rounded-xl hover:bg-danger/10 transition-colors border border-danger/10">
                <span className="font-black text-sm uppercase">Panic Button</span>
                <i className="fas fa-exclamation-triangle"></i>
             </button>
             <p className="text-[10px] text-slate-400 mt-4 text-center font-bold italic uppercase">Instantly alerts Admin & Police</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
