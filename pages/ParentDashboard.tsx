import React, { useState, useEffect, useRef } from 'react';
import { User, MonthlyDue, PaymentStatus, Student } from '../types';
import { MOCK_STUDENTS, MOCK_DUES, MONTHS } from '../constants';
import { usePayments } from '../hooks/usePayments';
import PaymentPortal from '../components/PaymentPortal';
import api from '../lib/api';
import { useTracking } from '../hooks/useTracking';
import { isMonthPayable } from '../utils/feeCalculator';

declare const L: any;

const ParentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const { paymentState, openPortal, closePortal, selectMethod, processPayment } = usePayments();
  const [familyStudents, setFamilyStudents] = useState<Student[]>([]);
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [map, setMap] = useState<any>(null);
  const markerRef = useRef<any>(null);
  
  const { location, hasArrived } = useTracking('b1');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data: studentsData } = await api.get('students');
        const family = studentsData.filter((s: any) => s.admission_number === user.admissionNumber || s.parent_id === user.id);
        setFamilyStudents(family);
        if (family.length > 0) setSelectedStudent(family[0]);

        const savedDues = localStorage.getItem('fee_dues');
        setDues(savedDues ? JSON.parse(savedDues) : MOCK_DUES as any);
      } catch (err) {
        const family = MOCK_STUDENTS.filter(s => s.admission_number === user.admissionNumber);
        setFamilyStudents(family);
        if (family.length > 0) setSelectedStudent(family[0]);
        const savedDues = localStorage.getItem('fee_dues');
        setDues(savedDues ? JSON.parse(savedDues) : MOCK_DUES as any);
      }
    };
    loadInitialData();
  }, [user, paymentState.step]);

  // Update marker position on location change
  useEffect(() => {
    if (map && location && markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lng]);
        if (trackingActive) map.panTo([location.lat, location.lng]);
    }
  }, [location, map, trackingActive]);

  useEffect(() => {
    if (trackingActive && !map) {
      setTimeout(() => {
        const initialPos = location ? [location.lat, location.lng] : [32.0900, 76.2600];
        const parentMap = L.map('parent-map').setView(initialPos, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(parentMap);
        
        const busIcon = L.divIcon({
          className: 'parent-bus-icon',
          html: '<div class="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-2xl border-2 md:border-4 border-white animate-bounce"><i class="fas fa-bus text-[10px] md:text-sm"></i></div>',
          iconSize: [48, 48]
        });

        const m = L.marker(initialPos, { icon: busIcon }).addTo(parentMap).bindPopup('<b>School Bus B101</b>');
        markerRef.current = m;
        setMap(parentMap);
      }, 100);
    }
  }, [trackingActive, map]);

  if (!selectedStudent) return (
     <div className="p-20 text-center">
        <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
     </div>
  );

  const studentDues = dues.filter(d => String(d.student_id) === String(selectedStudent.id))
                         .sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));
                         
  const totalFamilyDue = familyStudents.reduce((acc, s) => {
    const studentDuesAll = dues.filter(d => String(d.student_id) === String(s.id) && d.status !== PaymentStatus.PAID);
    return acc + studentDuesAll.reduce((sum, d) => sum + d.total_due, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <PaymentPortal 
        state={paymentState} 
        onClose={closePortal} 
        onSelectMethod={selectMethod} 
        onConfirm={processPayment} 
      />

      <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-premium flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute -right-10 md:-right-20 -top-10 md:-top-20 opacity-5 transition-transform duration-1000 group-hover:rotate-12">
           <i className="fas fa-bus text-[150px] md:text-[300px] text-primary"></i>
        </div>
        <div className="flex items-center gap-4 md:gap-8 relative z-10 w-full sm:w-auto">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/5 text-primary rounded-2xl md:rounded-[2rem] flex items-center justify-center text-2xl md:text-4xl border border-primary/10">
            <i className="fas fa-home-user"></i>
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Family Hub</h2>
            <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-2">
               {familyStudents.length} Students Registered
            </p>
          </div>
        </div>
        <div className="text-center md:text-right relative z-10 w-full sm:w-auto">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consolidated Dues</p>
          <p className={`text-3xl md:text-5xl font-black tracking-tighter ${totalFamilyDue > 0 ? 'text-danger' : 'text-success'}`}>
             ₹{totalFamilyDue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl md:rounded-[2rem] border border-slate-200/50 w-full md:w-max">
        {familyStudents.map(s => (
          <button 
            key={s.id}
            onClick={() => setSelectedStudent(s)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-4 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all ${
              selectedStudent.id === s.id 
                ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
            }`}
          >
            {s.full_name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <div className="bg-slate-950 rounded-3xl md:rounded-[3.5rem] shadow-2xl overflow-hidden border-8 md:border-[12px] border-white/5 relative h-[400px] md:h-[600px] group">
              <div id="parent-map" className={`absolute inset-0 transition-opacity duration-1000 ${trackingActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
              
              {!trackingActive && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-6 z-10">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-white/10 border border-white/10 group-hover:scale-110 transition-transform">
                        <i className="fas fa-satellite text-4xl md:text-6xl"></i>
                    </div>
                    <div>
                       <h3 className="text-xl md:text-3xl font-black text-white tracking-tight mb-2">Live Monitor</h3>
                       <p className="text-white/30 font-black uppercase text-[8px] md:text-[10px] tracking-[0.4em] max-w-[250px] mx-auto">
                          Connect to encrypted satellite stream
                       </p>
                    </div>
                    <button 
                       onClick={() => setTrackingActive(true)}
                       className="bg-primary text-white px-8 md:px-12 py-3 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[11px] tracking-widest shadow-2xl hover:scale-105 transition-all shadow-primary/20 active:scale-95"
                    >
                       Establish Uplink
                    </button>
                 </div>
              )}

              {trackingActive && (
                 <div className="absolute top-4 left-4 z-20 flex flex-col sm:flex-row gap-2">
                    <div className="bg-black/80 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/10 text-white flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full animate-pulse ${hasArrived ? 'bg-blue-500' : 'bg-success'}`}></div>
                       <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                        {hasArrived ? 'Bus at Campus • Final Stop' : 'Bus KNG-01-A • Live Telemetry'}
                       </span>
                    </div>
                    <button 
                       onClick={() => setTrackingActive(false)}
                       className="bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 font-black text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                       Disconnect
                    </button>
                 </div>
              )}
           </div>
        </div>

        <div className="bg-white rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden">
          <div className="p-6 md:p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
             <div>
                <h3 className="font-black text-[9px] md:text-[11px] uppercase tracking-widest text-slate-400 mb-1">Fee Manifest</h3>
                <p className="text-[10px] md:text-xs font-black text-slate-800 uppercase">{selectedStudent.full_name}</p>
             </div>
             <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <i className="fas fa-file-invoice"></i>
             </div>
          </div>
          <div className="divide-y divide-slate-50">
            {studentDues.map(due => {
              const isPaid = due.status === PaymentStatus.PAID;
              const isLocked = !isPaid && !isMonthPayable(due, studentDues);
              const isOverdue = !isPaid && new Date() > new Date(due.due_date);

              return (
                <div key={due.id} className={`p-6 md:p-8 flex items-center justify-between group transition-all ${isLocked ? 'opacity-30 grayscale' : 'hover:bg-slate-50'}`}>
                  <div>
                    <p className="font-black text-slate-800 text-xs md:text-sm uppercase tracking-tight">{MONTHS[due.month-1]} {due.year}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest border w-max ${isPaid ? 'bg-success/10 text-success border-success/10' : isLocked ? 'bg-slate-100 text-slate-400' : isOverdue ? 'bg-danger/10 text-danger border-danger/10' : 'bg-blue-50 text-primary border-blue-100'}`}>
                         {isLocked ? 'Locked' : due.status}
                      </span>
                      {!isPaid && <p className="text-[7px] text-slate-400 font-bold uppercase mt-1">Fine cutoff: {due.last_date}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-sm md:text-lg font-black text-slate-800 tracking-tighter mb-2">₹{due.total_due.toLocaleString()}</p>
                     {isPaid ? (
                        <i className="fas fa-check-circle text-success text-lg"></i>
                     ) : (
                       <button 
                         disabled={isLocked}
                         onClick={() => openPortal(due.id, due.total_due, selectedStudent.full_name)}
                         className={`px-4 md:px-6 py-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg md:rounded-xl transition-all ${isLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-800 shadow-xl shadow-primary/20'}`}
                       >
                         {isLocked ? 'Wait: Clear Prior' : 'Pay Now'}
                       </button>
                     )}
                  </div>
                </div>
              );
            })}
            {studentDues.length === 0 && (
              <div className="p-20 text-center">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No fee records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;