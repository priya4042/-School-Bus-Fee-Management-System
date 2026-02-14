
import React, { useState, useEffect } from 'react';
import { User, MonthlyDue, PaymentStatus, Student } from '../types';
import { MOCK_STUDENTS, MOCK_DUES, MONTHS } from '../constants';
import { usePayments } from '../hooks/usePayments';
import PaymentPortal from '../components/PaymentPortal';
import api from '../lib/api';

declare const L: any;

const ParentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const { paymentState, openPortal, closePortal, selectMethod, processPayment } = usePayments();
  const [familyStudents, setFamilyStudents] = useState<Student[]>([]);
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data: studentsData } = await api.get('/students');
        const family = studentsData.filter((s: any) => s.admission_number === user.admissionNumber || s.parent_id === user.id);
        setFamilyStudents(family);
        if (family.length > 0) setSelectedStudent(family[0]);

        const savedDues = localStorage.getItem('fee_dues');
        if (savedDues) {
          setDues(JSON.parse(savedDues));
        } else {
          setDues(MOCK_DUES as any);
        }
      } catch (err) {
        const family = MOCK_STUDENTS.filter(s => s.admission_number === user.admissionNumber);
        setFamilyStudents(family);
        if (family.length > 0) setSelectedStudent(family[0]);
        
        const savedDues = localStorage.getItem('fee_dues');
        setDues(savedDues ? JSON.parse(savedDues) : MOCK_DUES as any);
      }
    };
    loadInitialData();
  }, [user]);

  useEffect(() => {
    if (trackingActive && !map) {
      const parentMap = L.map('parent-map').setView([28.6139, 77.2090], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(parentMap);
      
      const busIcon = L.divIcon({
        className: 'parent-bus-icon',
        html: '<div class="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl border-4 border-white animate-bounce"><i class="fas fa-bus text-sm"></i></div>',
        iconSize: [48, 48]
      });

      L.marker([28.6139, 77.2090], { icon: busIcon }).addTo(parentMap).bindPopup('<b>Your Child\'s Bus</b><br>ETA: 12 mins');
      setMap(parentMap);
    }
  }, [trackingActive, map]);

  if (!selectedStudent) return (
     <div className="p-20 text-center">
        <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
     </div>
  );

  const currentDues = dues.filter(d => String(d.student_id) === String(selectedStudent.id));
  const totalFamilyDue = familyStudents.reduce((acc, s) => {
    const studentDues = dues.filter(d => String(d.student_id) === String(s.id) && d.status !== PaymentStatus.PAID);
    return acc + studentDues.reduce((sum, d) => sum + d.total_due, 0);
  }, 0);

  const earliestUnpaid = currentDues.find(d => d.status !== PaymentStatus.PAID);

  return (
    <div className="space-y-6">
      <PaymentPortal 
        state={paymentState} 
        onClose={closePortal} 
        onSelectMethod={selectMethod} 
        onConfirm={processPayment} 
      />

      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-premium flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
           <i className="fas fa-bus text-[300px] text-primary"></i>
        </div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-24 h-24 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border border-primary/10">
            <i className="fas fa-home-user"></i>
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Family Hub</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">
               Digital Oversight for {familyStudents.length} Students
            </p>
          </div>
        </div>
        <div className="text-center md:text-right relative z-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aggregate Outstanding</p>
          <p className={`text-5xl font-black tracking-tighter ${totalFamilyDue > 0 ? 'text-danger' : 'text-success'}`}>
             ₹{totalFamilyDue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 p-2 bg-slate-100/30 rounded-[2rem] border border-slate-200/50 inline-flex">
        {familyStudents.map(s => (
          <button 
            key={s.id}
            onClick={() => setSelectedStudent(s)}
            className={`flex items-center gap-4 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              selectedStudent.id === s.id 
                ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-105' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className={`fas fa-child-reaching ${selectedStudent.id === s.id ? 'text-white' : 'text-slate-300'}`}></i>
            {s.full_name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-slate-950 rounded-[3.5rem] shadow-2xl overflow-hidden border-[12px] border-white/5 relative h-[600px] group">
              <div id="parent-map" className={`absolute inset-0 transition-opacity duration-1000 ${trackingActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
              
              {!trackingActive && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-8 z-10">
                    <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center text-white/10 border border-white/10 group-hover:scale-110 transition-transform duration-700">
                        <i className="fas fa-satellite text-6xl"></i>
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-white tracking-tight mb-4">Live Telemetry Vault</h3>
                       <p className="text-white/30 font-black uppercase text-[10px] tracking-[0.4em] max-w-sm">
                          Connect to encrypted satellite stream to visualize child's fleet coordinates.
                       </p>
                    </div>
                    <button 
                       onClick={() => setTrackingActive(true)}
                       className="bg-primary text-white px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-105 transition-all shadow-primary/20 active:scale-95"
                    >
                       Establish Connection
                    </button>
                 </div>
              )}

              {trackingActive && (
                 <div className="absolute top-8 left-8 z-20 flex gap-4">
                    <div className="bg-black/80 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 text-white flex items-center gap-4">
                       <div className="w-3 h-3 bg-success rounded-full animate-pulse shadow-lg shadow-success"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest">Bus B101 • Sector 14</span>
                    </div>
                    <button 
                       onClick={() => setTrackingActive(false)}
                       className="bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-2xl border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                       Disconnect
                    </button>
                 </div>
              )}
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-premium overflow-hidden">
              <div className="p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                 <div>
                    <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-1">Fee Schedule</h3>
                    <p className="text-xs font-black text-slate-800">{selectedStudent.full_name}</p>
                 </div>
                 <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <i className="fas fa-file-invoice"></i>
                 </div>
              </div>
              <div className="divide-y divide-slate-50">
                {currentDues.map(due => {
                  const isLocked = earliestUnpaid && earliestUnpaid.id !== due.id;
                  return (
                    <div key={due.id} className={`p-8 flex items-center justify-between group transition-all ${isLocked ? 'opacity-30 grayscale pointer-events-none' : 'hover:bg-slate-50'}`}>
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{MONTHS[due.month-1]} {due.year}</p>
                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${due.status === PaymentStatus.PAID ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                           {due.status}
                        </span>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-black text-slate-800 tracking-tighter mb-2">₹{due.total_due.toLocaleString()}</p>
                         {due.status !== PaymentStatus.PAID && (
                           <button 
                             disabled={isLocked}
                             onClick={() => openPortal(due.id, due.total_due, selectedStudent.full_name)}
                             className="px-6 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-800 shadow-xl shadow-primary/20 transition-all active:scale-95"
                           >
                             Pay Now
                           </button>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
