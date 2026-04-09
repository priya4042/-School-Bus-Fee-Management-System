import React, { useState, useEffect } from 'react';
import { User, Student } from '../../types';
import { CheckCircle2, XCircle, Filter, Calendar, Bus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import MiniLoader from '../../components/MiniLoader';
import { useLanguage } from '../../lib/i18n';

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  type: 'PICKUP' | 'DROP';
  status: boolean;
  created_at: string;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const AttendanceHistory: React.FC<{ user: User }> = ({ user }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PICKUP' | 'DROP'>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  // Fetch parent's students
  useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id);
      const myStudents = data || [];
      setStudents(myStudents);
      if (myStudents.length > 0) setSelectedStudentId(myStudents[0].id);
    };
    fetchStudents();
  }, [user.id]);

  // Fetch attendance when student changes
  useEffect(() => {
    if (!selectedStudentId) {
      setLoading(false);
      return;
    }
    const fetchAttendance = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', selectedStudentId)
        .order('date', { ascending: false })
        .order('type', { ascending: true })
        .limit(90);
      if (error) console.error('Failed to load attendance:', error);
      setRecords(data || []);
      setLoading(false);
    };
    fetchAttendance();
  }, [selectedStudentId]);

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const filteredRecords = records.filter((r) => {
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    const d = new Date(r.date);
    if (yearFilter !== 'ALL' && d.getFullYear() !== Number(yearFilter)) return false;
    if (monthFilter !== 'ALL' && d.getMonth() !== Number(monthFilter)) return false;
    return true;
  });

  const stats = {
    totalPresent: records.filter((r) => r.status).length,
    totalAbsent: records.filter((r) => !r.status).length,
    pickupPresent: records.filter((r) => r.type === 'PICKUP' && r.status).length,
    dropPresent: records.filter((r) => r.type === 'DROP' && r.status).length,
  };

  const attendanceRate =
    records.length > 0 ? Math.round((stats.totalPresent / records.length) * 100) : 0;

  // Group records by date for display
  const byDate: Record<string, AttendanceRecord[]> = {};
  filteredRecords.forEach((r) => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r);
  });

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Attendance History</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
            Daily Pickup & Drop Records
          </p>
        </div>

        {/* Student selector */}
        {students.length > 1 && (
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
                className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  selectedStudentId === s.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s.full_name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {students.length === 0 && !loading && (
        <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <Bus size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-700">No Students Found</h2>
          <p className="text-slate-500 text-sm mt-2">Please contact admin to link your child's account.</p>
        </div>
      )}

      {students.length > 0 && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.totalPresent}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Present</p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <XCircle size={24} />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.totalAbsent}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Absent</p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ArrowUpCircle size={24} />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.pickupPresent}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Pickups</p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ArrowDownCircle size={24} />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.dropPresent}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Drops</p>
            </div>
          </div>

          {/* Attendance rate bar */}
          {records.length > 0 && (
            <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="font-black text-slate-800 uppercase text-sm tracking-tight">
                  Overall Attendance Rate
                  {selectedStudent && (
                    <span className="text-slate-400 font-bold text-[10px] ml-2 normal-case">
                      — {selectedStudent.full_name}
                    </span>
                  )}
                </p>
                <p className={`text-2xl font-black tracking-tight ${
                  attendanceRate >= 75 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {attendanceRate}%
                </p>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                Last {records.length} records shown
              </p>
            </div>
          )}

          {/* Filter + Records */}
          <div className="bg-white rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-50 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setShowMonthFilter(!showMonthFilter)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      (yearFilter !== 'ALL' || monthFilter !== 'ALL') ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Filter size={18} />
                  </button>
                  {(yearFilter !== 'ALL' || monthFilter !== 'ALL') && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[7px] text-white font-black flex items-center justify-center">
                      {(yearFilter !== 'ALL' ? 1 : 0) + (monthFilter !== 'ALL' ? 1 : 0)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {(['ALL', 'PICKUP', 'DROP'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTypeFilter(f)}
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        typeFilter === f
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {showMonthFilter && (
                <div className="bg-slate-50 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] font-black text-slate-500 tracking-widest">Filter by Year & Month</p>
                    {(yearFilter !== 'ALL' || monthFilter !== 'ALL') && (
                      <button
                        onClick={() => { setYearFilter('ALL'); setMonthFilter('ALL'); }}
                        className="text-[9px] font-black text-primary tracking-widest hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {/* Year selector */}
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 tracking-widest ml-1">Year</p>
                      <select
                        value={yearFilter}
                        onChange={(e) => { setYearFilter(e.target.value); setMonthFilter('ALL'); }}
                        className="px-4 py-2.5 rounded-xl text-[11px] font-bold bg-white border border-slate-200 text-slate-700 outline-none focus:ring-2 ring-primary/20 focus:border-primary cursor-pointer"
                      >
                        <option value="ALL">All Years</option>
                        {yearsList.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    {/* Month selector */}
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 tracking-widest ml-1">Month</p>
                      <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl text-[11px] font-bold bg-white border border-slate-200 text-slate-700 outline-none focus:ring-2 ring-primary/20 focus:border-primary cursor-pointer"
                      >
                        <option value="ALL">All Months</option>
                        {MONTHS.map((name, idx) => (
                          <option key={idx} value={idx}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <MiniLoader />
              </div>
            ) : Object.keys(byDate).length === 0 ? (
              <div className="py-32 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
                  <Calendar size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">No Records Found</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">
                  No attendance data available for this student
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {Object.entries(byDate).map(([date, dayRecords]) => (
                  <div key={date} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                      {new Date(date).toLocaleDateString('en-IN', {
                        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {dayRecords.map((record) => (
                        <div
                          key={record.id}
                          className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                            record.status
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                              : 'bg-red-50 border-red-100 text-red-600'
                          }`}
                        >
                          {record.type === 'PICKUP' ? (
                            <ArrowUpCircle size={16} />
                          ) : (
                            <ArrowDownCircle size={16} />
                          )}
                          <span>{record.type}</span>
                          {record.status ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          <span>{record.status ? 'Present' : 'Absent'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceHistory;
