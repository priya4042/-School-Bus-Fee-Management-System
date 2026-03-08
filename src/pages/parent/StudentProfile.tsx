
import React, { useState, useEffect } from 'react';
import { User, UserRole, Student, PaymentStatus } from '../../types';
import { MOCK_STUDENTS, MOCK_DUES } from '../../constants';
import { User as UserIcon, GraduationCap, Calendar, Phone, MapPin, Shield, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiPost } from '../../lib/api';

const StudentProfile: React.FC<{ user: User }> = ({ user }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // In a real app, we'd fetch students linked to this parent
        // For now, we'll use mock data or a filtered list
        const data = await apiPost('parent-students', user.id, {}, 'GET');
        setStudents(data || []);
        if (data && data.length > 0) {
          setSelectedStudent(data[0]);
        }
      } catch (err) {
        console.error(err);
        // Fallback to mock if API fails
        const family = MOCK_STUDENTS.filter(s => s.admission_number === user.admissionNumber);
        setStudents(family);
        if (family.length > 0) setSelectedStudent(family[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [user]);

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-300 font-black uppercase tracking-widest">Accessing Student Records...</div>;

  if (!selectedStudent) return (
    <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-premium">
      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
        <GraduationCap size={48} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">No Student Records</h2>
      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Please contact administration to link your child's account</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Student Dossier</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Official Academic & Transit Profile</p>
        </div>
        {students.length > 1 && (
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
            {students.map(s => (
              <button 
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  selectedStudent.id === s.id ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s.full_name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-slate-950 -mt-10 -skew-y-6 group-hover:skew-y-0 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] p-1 shadow-2xl mx-auto mb-6">
                <div className="w-full h-full bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300">
                  <UserIcon size={64} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{selectedStudent.full_name}</h2>
              <p className="text-primary font-black uppercase text-[10px] tracking-widest mt-1">Grade {selectedStudent.grade} • Section {selectedStudent.section}</p>
              
              <div className="mt-10 pt-10 border-t border-slate-50 space-y-6 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Admission ID</p>
                    <p className="text-xs font-black text-slate-800 uppercase">{selectedStudent.admission_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Enrolled Since</p>
                    <p className="text-xs font-black text-slate-800 uppercase">August 2023</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact</p>
                    <p className="text-xs font-black text-slate-800 uppercase">{user.phone_number || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full -mr-10 -mt-10 blur-2xl"></div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-8 relative z-10">Transit Details</h3>
            <div className="space-y-8 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Boarding Point</p>
                  <p className="text-xs font-black uppercase leading-relaxed">{selectedStudent.boarding_point || 'Not Assigned'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Pickup Time</p>
                  <p className="text-xs font-black uppercase">07:45 AM (Expected)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Fee Status</h3>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
                <CheckCircle2 size={12} /> Up to Date
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Paid</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">₹42,000</p>
                  </div>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-3/4"></div>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">75% of Annual Fees Cleared</p>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Next Due</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">₹4,500</p>
                  </div>
                </div>
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full w-max">Due in 12 Days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-premium border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-10">Recent Activity</h3>
            <div className="space-y-8">
              {[
                { title: 'Boarding Successful', time: '08:12 AM Today', icon: <MapPin />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { title: 'Fee Payment Received', time: 'Yesterday, 04:30 PM', icon: <CreditCard />, color: 'text-primary', bg: 'bg-primary/5' },
                { title: 'Route Change Notification', time: '2 Days Ago', icon: <AlertCircle />, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-6 group">
                  <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 pb-8 border-b border-slate-50 last:border-0">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
