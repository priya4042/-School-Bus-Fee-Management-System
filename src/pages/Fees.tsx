
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { MonthlyDue, PaymentStatus } from '../types';
import { 
  Search, 
  Filter, 
  CreditCard, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  IndianRupee,
  Calendar,
  ArrowRight,
  Receipt,
  Plus,
  GraduationCap
} from 'lucide-react';
import { showToast, showConfirm } from '../lib/swal';
import { MONTHS } from '../constants';

const Fees: React.FC = () => {
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchDues();
  }, []);

  const fetchDues = async () => {
    try {
      const { data } = await api.get('fees/dues');
      setDues(data || []);
    } catch (err) {
      console.error('Failed to fetch dues:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDues = dues.filter(d => {
    const matchesSearch = d.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         d.admission_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'ALL' || d.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleMarkPaid = async (dueId: string) => {
    const confirmed = await showConfirm('Mark as Paid?', 'This will record a manual cash payment.');
    if (confirmed) {
      try {
        await api.post(`fees/mark-paid/${dueId}`);
        showToast('Payment recorded successfully');
        fetchDues();
      } catch (err) {
        showToast('Failed to record payment', 'error');
      }
    }
  };

  const stats = {
    totalPending: dues.filter(d => d.status !== PaymentStatus.PAID).reduce((acc, d) => acc + (d.total_due || 0), 0),
    collectedThisMonth: dues.filter(d => d.status === PaymentStatus.PAID).reduce((acc, d) => acc + (d.total_due || 0), 0),
    overdueCount: dues.filter(d => d.status === PaymentStatus.OVERDUE).length
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Fee Management</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Financial Operations & Collections</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white px-8 py-4 rounded-2xl border border-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3">
            <Download size={18} />
            Export Report
          </button>
          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30 hover:bg-primary-dark hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95 active:translate-y-0">
            <Plus size={18} />
            Generate Dues
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Collections</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter">₹{stats.totalPending.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-2 text-red-500">
            <AlertCircle size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">{stats.overdueCount} Overdue Accounts</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Collected (MTD)</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter text-emerald-600">₹{stats.collectedThisMonth.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-500">
            <CheckCircle2 size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">85% Collection Rate</span>
          </div>
        </div>
        <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Next Billing Cycle</p>
          <h3 className="text-3xl font-black tracking-tighter">01 {MONTHS[new Date().getMonth()]}</h3>
          <div className="mt-4 flex items-center gap-2 text-white/30">
            <Calendar size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Automated Generation</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center px-6 py-4 focus-within:ring-4 ring-primary/10 transition-all">
          <Search size={20} className="text-slate-400 mr-4" />
          <input 
            type="text" 
            placeholder="Search by student name or ID..." 
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-300 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-100">
          {(['ALL', PaymentStatus.UNPAID, PaymentStatus.PAID, PaymentStatus.OVERDUE] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                activeFilter === filter ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Month</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-8 h-20 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : filteredDues.map(due => (
                <tr key={due.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 tracking-tight">{due.student_name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{due.admission_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">{MONTHS[due.month-1]} {due.year}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-800">₹{(due.total_due || due.amount).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={14} />
                      <span className="text-xs font-bold">{new Date(due.due_date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                      due.status === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      due.status === PaymentStatus.OVERDUE ? 'bg-red-50 text-red-600 border-red-100' : 
                      'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {due.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {due.status !== PaymentStatus.PAID && (
                        <button 
                          onClick={() => handleMarkPaid(due.id)}
                          className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                          title="Mark as Paid"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95">
                        <Receipt size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDues.length === 0 && !loading && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
              <IndianRupee size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Records Found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fees;
