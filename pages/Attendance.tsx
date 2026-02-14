
import React, { useState } from 'react';
import { MOCK_STUDENTS } from '../constants';
import { useAttendance } from '../hooks/useAttendance';
import { useAuthStore } from '../store/authStore';
import { showAlert } from '../lib/swal';

const Attendance: React.FC = () => {
  const { user } = useAuthStore();
  const { markAttendance, loading: syncLoading } = useAttendance();
  const [selectedRoute, setSelectedRoute] = useState('North Zone');
  const [selectedShift, setSelectedShift] = useState<'MORNING' | 'AFTERNOON'>('MORNING');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const routeStudents = MOCK_STUDENTS.filter(s => s.route_name === selectedRoute);

  const toggleStatus = async (studentId: string) => {
    const currentStatus = attendance[studentId] || false;
    const newStatus = !currentStatus;
    
    setAttendance(prev => ({
      ...prev,
      [studentId]: newStatus
    }));

    if (user) {
      const type = selectedShift === 'MORNING' ? 'PICKUP' : 'DROP';
      const success = await markAttendance(studentId, type, newStatus, user.id);
      if (!success) {
        setAttendance(prev => ({
          ...prev,
          [studentId]: currentStatus
        }));
        showAlert('Sync Failed', 'Could not synchronize attendance with the central cloud. Please check your internet connection.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fleet Attendance</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Real-time Manifest Tracking</p>
        </div>
        <div className="flex gap-4">
           <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <button 
                onClick={() => setSelectedShift('MORNING')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedShift === 'MORNING' ? 'bg-primary text-white shadow-lg' : 'text-slate-400'}`}
              >
                Pickup
              </button>
              <button 
                onClick={() => setSelectedShift('AFTERNOON')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedShift === 'AFTERNOON' ? 'bg-primary text-white shadow-lg' : 'text-slate-400'}`}
              >
                Drop
              </button>
           </div>
           <input 
             type="date" 
             value={selectedDate}
             onChange={(e) => setSelectedDate(e.target.value)}
             className="px-6 py-2 rounded-2xl border border-slate-200 bg-white font-black text-[10px] uppercase text-slate-600 focus:ring-4 focus:ring-primary/5 outline-none shadow-sm"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {['North Zone', 'South Zone', 'East Zone', 'West Link'].map(route => (
          <button 
            key={route}
            onClick={() => setSelectedRoute(route)}
            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              selectedRoute === route 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
            }`}
          >
            {route}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${selectedShift === 'MORNING' ? 'bg-orange-500 shadow-orange-500/20' : 'bg-primary shadow-primary/20'}`}>
                <i className={`fas ${selectedShift === 'MORNING' ? 'fa-sun' : 'fa-moon'}`}></i>
              </div>
              <div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{selectedRoute}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedShift} SHIFT ACTIVE</p>
              </div>
           </div>
           {syncLoading && <i className="fas fa-circle-notch fa-spin text-primary"></i>}
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Student Identity</th>
                <th className="px-8 py-5">Class</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Emergency Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {routeStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                        {student.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tight">{student.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{student.admission_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-500 uppercase">{student.class_name}-{student.section}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => toggleStatus(student.id)}
                      className={`w-12 h-6 rounded-full relative transition-all ${attendance[student.id] ? 'bg-success' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${attendance[student.id] ? 'translate-x-6' : ''}`}></div>
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <i className="fas fa-phone-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {routeStudents.length === 0 && (
            <div className="p-20 text-center">
               <i className="fas fa-search text-4xl text-slate-100 mb-4"></i>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching manifests for this route</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
