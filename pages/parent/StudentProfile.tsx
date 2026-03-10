import React, { useState, useEffect } from 'react';
import { User, Student, MonthlyDue, PaymentStatus } from '../../types';
import { MONTHS } from '../../constants';
import {
  User as UserIcon, GraduationCap, Calendar, Phone, MapPin, Shield,
  CreditCard, AlertCircle, CheckCircle2, Bus, BookOpen,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const StudentProfile: React.FC<{ user: User }> = ({ user }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*, routes(route_name), buses(bus_number, plate)')
        .eq('parent_id', user.id);

      if (error) console.error('Failed to load students:', error);
      const myStudents = data || [];
      setStudents(myStudents);
      if (myStudents.length > 0) setSelectedStudent(myStudents[0]);
      setLoading(false);
    };
    fetchStudents();
  }, [user.id]);

  useEffect(() => {
    if (!selectedStudent) return;

    const fetchStudentData = async () => {
      // Fetch dues
      const { data: duesData } = await supabase
        .from('monthly_dues')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      setDues(duesData || []);

      // Fetch recent attendance (last 10)
      const { data: attendData } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .order('date', { ascending: false })
        .limit(10);
      setRecentAttendance(attendData || []);
    };
    fetchStudentData();
  }, [selectedStudent?.id]);

  if (loading) return (
    <div className="p-20 text-center animate-pulse text-slate-300 font-black uppercase tracking-widest">
      Accessing Student Records...
    </div>
  );

  if (!selectedStudent) return (
    <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
        <GraduationCap size={48} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">No Student Records</h2>
      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">
        Please contact administration to link your child's account
      </p>
    </div>
  );

  const totalPaid = dues
    .filter((d) => d.status === PaymentStatus.PAID)
    .reduce((sum, d) => sum + (d.total_due || 0), 0);

  const totalDue = dues
    .filter((d) => d.status !== PaymentStatus.PAID)
    .reduce((sum, d) => sum + (d.total_due || 0), 0);

  const nextDue = dues.find((d) => d.status !== PaymentStatus.PAID);

  const enrolledDate = selectedStudent.created_at
    ? new Date(selectedStudent.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'N/A';

  const feeStatusOk = totalDue === 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Student Dossier</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
            Official Academic & Transit Profile
          </p>
        </div>
        {students.length > 1 && (
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
            {students.map((s) => (
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
        {/* Left column */}
        <div className="lg:col-span-1 space-y-8">
          {/* ID Card */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-slate-950 -mt-10 -skew-y-6 group-hover:skew-y-0 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] p-1 shadow-2xl mx-auto mb-6">
                <div className="w-full h-full bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300">
                  <UserIcon size={64} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {selectedStudent.full_name}
              </h2>
              <p className="text-primary font-black uppercase text-[10px] tracking-widest mt-1">
                Grade {selectedStudent.grade} • Section {selectedStudent.section}
              </p>
              <span className={`mt-3 inline-block px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                selectedStudent.status === 'active'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                {selectedStudent.status}
              </span>

              <div className="mt-8 pt-8 border-t border-slate-50 space-y-5 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Admission No.</p>
                    <p className="text-xs font-black text-slate-800 uppercase">{selectedStudent.admission_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Enrolled Since</p>
                    <p className="text-xs font-black text-slate-800 uppercase">{enrolledDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Parent Contact</p>
                    <p className="text-xs font-black text-slate-800 uppercase">{user.phone_number || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transit Details */}
          <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full -mr-10 -mt-10 blur-2xl"></div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-8 relative z-10">Transit Details</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Boarding Point</p>
                  <p className="text-xs font-black uppercase leading-relaxed">
                    {selectedStudent.boarding_point || 'Not Assigned'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary">
                  <Bus size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Bus Assigned</p>
                  <p className="text-xs font-black uppercase">
                    {(selectedStudent as any).buses?.bus_number || 'Not Assigned'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary">
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Route</p>
                  <p className="text-xs font-black uppercase">
                    {(selectedStudent as any).routes?.route_name || 'Not Assigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Fee Status */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Fee Status</h3>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                feeStatusOk ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {feeStatusOk ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {feeStatusOk ? 'All Clear' : 'Dues Pending'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Paid</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                      ₹{totalPaid.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {dues.filter((d) => d.status === PaymentStatus.PAID).length} months cleared
                </p>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm ${totalDue > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      {nextDue ? 'Next Due' : 'Outstanding'}
                    </p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                      ₹{(nextDue?.total_due || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                {nextDue ? (
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full w-max">
                    {MONTHS[(nextDue.month || 1) - 1]} {nextDue.year}
                  </p>
                ) : (
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full w-max">
                    No pending dues
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-8">
              Recent Attendance
            </h3>
            {recentAttendance.length === 0 ? (
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest text-center py-10">
                No attendance records yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentAttendance.slice(0, 6).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        record.status ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {record.status ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase">{record.type}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(record.date).toLocaleDateString('en-IN', {
                            weekday: 'short', day: '2-digit', month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      record.status ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {record.status ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
