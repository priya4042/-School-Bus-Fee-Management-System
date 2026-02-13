
import React, { useState, useEffect, useRef } from 'react';
import { User, MonthlyDue, PaymentStatus, Student } from '../types';
import { MOCK_STUDENTS, MOCK_DUES, MONTHS } from '../constants';
import { usePayments } from '../hooks/usePayments';
import api from '../lib/api';

const ParentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const { initiatePayment, loading: isProcessing } = usePayments();
  const [familyStudents, setFamilyStudents] = useState<Student[]>([]);
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [busLoc, setBusLoc] = useState<any>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data: studentsData } = await api.get('/students');
        // Fix: Use admission_number instead of admissionNumber
        const family = studentsData.filter((s: any) => s.admission_number === user.admissionNumber || s.parent_id === user.id);
        setFamilyStudents(family);
        if (family.length > 0) setSelectedStudent(family[0]);

        const { data: duesData } = await api.get('/fees/dues');
        setDues(duesData);
      } catch (err) {
        // Fallback to mock for UI demo if API fails
        // Fix: Use admission_number instead of admissionNumber
        const family = MOCK_STUDENTS.filter(s => s.admission_number === user.admissionNumber);
        setFamilyStudents(family);
        if (family.length > 0) setSelectedStudent(family[0]);
        setDues(MOCK_DUES as any);
      }
    };
    loadInitialData();
  }, [user]);

  useEffect(() => {
    if (trackingActive) {
      const busId = 1; 
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/tracking/${busId}`;
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setBusLoc(data);
      };
    } else {
      socketRef.current?.close();
    }
    return () => socketRef.current?.close();
  }, [trackingActive]);

  if (!selectedStudent) return null;

  const currentDues = dues.filter(d => String(d.student_id) === String(selectedStudent.id));
  const totalFamilyDue = familyStudents.reduce((acc, s) => {
    const studentDues = dues.filter(d => String(d.student_id) === String(s.id) && d.status !== PaymentStatus.PAID);
    return acc + studentDues.reduce((sum, d) => sum + d.total_due, 0);
  }, 0);

  const earliestUnpaid = currentDues.find(d => d.status !== PaymentStatus.PAID);

  const handleQuickPay = async (due: MonthlyDue) => {
    await initiatePayment(due.id, due.total_due, selectedStudent.full_name);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
           <i className="fas fa-bus text-[200px] text-primary"></i>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-primary/10">
            <i className="fas fa-users-viewfinder"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Family Dashboard</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
              Fleet Management for {familyStudents.length} Registered Children
            </p>
          </div>
        </div>
        <div className="text-center md:text-right relative z-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding Ledger</p>
          <p className={`text-4xl font-black tracking-tighter ${totalFamilyDue > 0 ? 'text-danger' : 'text-success'}`}>
             ₹{totalFamilyDue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 p-2 bg-slate-100/50 rounded-3xl border border-slate-200/50 inline-flex">
        {familyStudents.map(s => (
          <button 
            key={s.id}
            onClick={() => setSelectedStudent(s)}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedStudent.id === s.id 
                ? 'bg-white shadow-xl text-primary scale-105' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className={`fas fa-child ${selectedStudent.id === s.id ? 'text-primary' : 'text-slate-300'}`}></i>
            {s.full_name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border-8 border-white/5 relative h-[500px]">
              <div className="absolute inset-0 opacity-15 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i14!2i9432!3i6154!2m3!1e0!2sm!3i633116543!3m17!2sen!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!12m3!1e12!2m1!1s1e10!4e0!5m1!5f2')] bg-cover"></div>
              
              <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-20">
                 <div className="p-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${trackingActive ? 'bg-success animate-pulse' : 'bg-slate-700'}`}></div>
                    <span className="text-white font-black text-[10px] uppercase tracking-[0.2em]">
                      {trackingActive ? 'Bus Location: Live' : 'GPS Offline'}
                    </span>
                 </div>
                 <button 
                   onClick={() => setTrackingActive(!trackingActive)}
                   className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     trackingActive ? 'bg-danger text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-blue-700'
                   } shadow-2xl`}
                 >
                    {trackingActive ? 'Stop Stream' : 'Track Bus'}
                 </button>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                 {trackingActive && busLoc ? (
                   <div className="relative z-10 text-center animate-in zoom-in duration-500">
                      <div className="relative bg-primary text-white p-8 rounded-[3rem] shadow-2xl border-4 border-white/20">
                         <i className="fas fa-bus-alt text-5xl"></i>
                      </div>
                      <div className="mt-12 space-y-3">
                         <div className="bg-white/10 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl">
                            VELOCITY: {busLoc.speed || 38} KM/H
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="text-center text-slate-500 max-w-sm">
                      <i className="fas fa-satellite text-4xl opacity-20 mb-8 block mx-auto"></i>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                        Securely connect to fleet GPS to visualize live position.
                      </p>
                   </div>
                 )}
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="font-black text-xs uppercase tracking-widest text-slate-800">Fee Ledger: {selectedStudent.full_name}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-50/50">
                      <th className="px-8 py-5">Month Cycle</th>
                      <th className="px-8 py-5 text-right">Total Due</th>
                      <th className="px-8 py-5 text-center">Status</th>
                      <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentDues.map(due => {
                      const isLocked = earliestUnpaid && earliestUnpaid.id !== due.id;
                      return (
                        <tr key={due.id} className={`group hover:bg-slate-50/50 transition-colors ${isLocked ? 'opacity-30' : ''}`}>
                          <td className="px-8 py-5">
                            <p className="font-black text-slate-800 tracking-tight uppercase text-sm">{MONTHS[due.month-1]}</p>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-slate-800">₹{due.total_due.toLocaleString()}</td>
                          <td className="px-8 py-5 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              due.status === PaymentStatus.PAID ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            }`}>
                              {due.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            {due.status !== PaymentStatus.PAID && (
                               <button 
                                 disabled={isLocked || isProcessing}
                                 onClick={() => handleQuickPay(due)}
                                 className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                   isLocked ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-800 shadow-lg'
                                 }`}
                               >
                                 {isLocked ? 'Locked' : 'Pay Now'}
                               </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
