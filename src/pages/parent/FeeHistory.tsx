
import React, { useState, useEffect } from 'react';
import { User, UserRole, MonthlyDue, PaymentStatus, Student } from '../../types';
import { MOCK_STUDENTS, MOCK_DUES, MONTHS } from '../../constants';
import { CreditCard, Download, CheckCircle2, AlertCircle, Clock, Filter, Search, ChevronRight } from 'lucide-react';
import { apiPost } from '../../lib/api';

const FeeHistory: React.FC<{ user: User }> = ({ user }) => {
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentData = await apiPost('parent-students', user.id, {}, 'GET');
        setStudents(studentData || []);
        
        const duesData = await apiPost('fees/dues', '', {}, 'GET');
        setDues(duesData || []);
      } catch (err) {
        console.error(err);
        setDues(MOCK_DUES);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredDues = selectedStudent === 'all' 
    ? dues 
    : dues.filter(d => String(d.student_id) === selectedStudent);

  const stats = {
    totalPaid: filteredDues.filter(d => d.status === PaymentStatus.PAID).reduce((acc, d) => acc + d.total_due, 0),
    pending: filteredDues.filter(d => d.status !== PaymentStatus.PAID).reduce((acc, d) => acc + d.total_due, 0),
    overdue: filteredDues.filter(d => d.status !== PaymentStatus.PAID && new Date() > new Date(d.due_date)).length
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Fee Ledger</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Comprehensive Payment History & Dues</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold text-sm border border-slate-100 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download size={18} />
            Export Statement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Cleared</p>
          <p className="text-3xl font-black text-emerald-600 tracking-tight">₹{stats.totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding</p>
          <p className="text-3xl font-black text-primary tracking-tight">₹{stats.pending.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overdue Months</p>
          <p className="text-3xl font-black text-red-500 tracking-tight">{stats.overdue}</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
              <Filter size={20} />
            </div>
            <select 
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="bg-transparent border-none font-black text-xs uppercase tracking-widest focus:ring-0 cursor-pointer"
            >
              <option value="all">All Students</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by Month, Year or ID..." 
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-xs font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Period</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDues.map((due) => (
                <tr key={due.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{MONTHS[due.month-1]} {due.year}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Due: {due.due_date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-700 uppercase">{students.find(s => String(s.id) === String(due.student_id))?.full_name || 'Unknown'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900 tracking-tight">₹{due.total_due.toLocaleString()}</p>
                    {due.late_fee > 0 && <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1">+ ₹{due.late_fee} Late Fee</p>}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${
                      due.status === PaymentStatus.PAID 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {due.status === PaymentStatus.PAID ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                      {due.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {due.status === PaymentStatus.PAID ? (
                      <button className="p-3 bg-white text-primary rounded-xl border border-slate-100 shadow-sm hover:bg-primary hover:text-white transition-all">
                        <Download size={16} />
                      </button>
                    ) : (
                      <button className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDues.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
              <CreditCard size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">No Transaction Records</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Your payment history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeHistory;
