import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateCurrentLedger } from '../utils/feeCalculator';
import { MONTHS } from '../constants';
import Reports from './Reports';
import MiniLoader from '../components/MiniLoader';
import PendingUpiVerifications from '../components/Admin/PendingUpiVerifications';

const AdminPayments: React.FC = () => {
  const [view, setView] = useState<'payments' | 'verify' | 'reports'>('payments');
  const [pendingCount, setPendingCount] = useState(0);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchPendingCount();

    const channel = supabase
      .channel('admin-pending-upi-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => fetchPendingCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingCount = async () => {
    try {
      const { count, error } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('payment_method', 'upi');
      if (error) throw error;
      setPendingCount(count || 0);
    } catch (err) {
      console.warn('Failed to fetch pending count:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentPeriod = now.getFullYear() * 12 + (now.getMonth() + 1);
      const toPeriod = (due: any) => Number(due.year || 0) * 12 + Number(due.month || 0);

      // Fetch dues without embedded join to avoid PostgREST 400
      const { data: dues, error: duesError } = await supabase
        .from('monthly_dues')
        .select('id, student_id, month, year, amount, due_date, last_date, status, paid_at')
        .order('year', { ascending: false });

      if (duesError) throw duesError;

      // Fetch students separately and merge
      const studentIds = [...new Set((dues || []).map((d: any) => d.student_id).filter(Boolean))];
      let studentsMap: Record<string, any> = {};
      if (studentIds.length > 0) {
        const { data: students } = await supabase
          .from('students')
          .select('id, full_name, admission_number')
          .in('id', studentIds);
        (students || []).forEach((s: any) => { studentsMap[s.id] = s; });
      }

      const enrichedDues = (dues || []).map((due: any) => {
        const student = studentsMap[due.student_id] || {};
        const ledger = calculateCurrentLedger(due);
        const rawStatus = String(due.status || '').toUpperCase() || 'PENDING';
        const monthStarted = toPeriod(due) <= currentPeriod;
        const effectiveStatus = rawStatus === 'PAID'
          ? 'PAID'
          : !monthStarted
            ? 'FUTURE'
            : rawStatus === 'OVERDUE'
              ? 'OVERDUE'
              : 'PENDING';

        return {
          ...due,
          status: effectiveStatus,
          student_name: student.full_name || 'Unknown',
          admission_number: student.admission_number || 'N/A',
          late_fee: ledger.lateFee,
          total_due: Number(ledger.total || due.amount || 0),
        };
      });

      // Sort by month descending after merging
      enrichedDues.sort((a: any, b: any) => b.month - a.month);
      setPayments(enrichedDues);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const normalizedStatus = String(payment.status || '').toLowerCase();
    const matchesStatus = filterStatus === 'all' || normalizedStatus === filterStatus;
    const matchesSearch = 
      String(payment.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(payment.admission_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    totalDues: payments.length,
    totalPaid: payments.filter(p => p.status === 'PAID').length,
    totalPending: payments.filter(p => p.status === 'PENDING').length,
    totalOverdue: payments.filter(p => p.status === 'OVERDUE').length,
    totalFuture: payments.filter(p => p.status === 'FUTURE').length,
    totalRevenue: payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.total_due || p.amount || 0), 0),
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-success/10 text-success border-success/10';
      case 'OVERDUE':
        return 'bg-danger/10 text-danger border-danger/10';
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'FUTURE':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        {view === 'payments' ? (
          <div>
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tighter">Payment Hub</h2>
            <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-1">System-Wide Payment Tracking</p>
          </div>
        ) : <div />}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-hide">
          <button onClick={() => setView('payments')} className={`px-3 md:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${view === 'payments' ? 'bg-primary text-white' : 'text-slate-500'}`}>Payments</button>
          <button onClick={() => setView('verify')} className={`px-3 md:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex-shrink-0 flex items-center gap-2 ${view === 'verify' ? 'bg-amber-500 text-white' : 'text-slate-500'}`}>
            <span>Verify UPI</span>
            {pendingCount > 0 && (
              <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center ${view === 'verify' ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'}`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button onClick={() => setView('reports')} className={`px-3 md:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${view === 'reports' ? 'bg-primary text-white' : 'text-slate-500'}`}>Reports</button>
        </div>
      </div>

      {view === 'reports' ? (
        <Reports />
      ) : view === 'verify' ? (
        <PendingUpiVerifications />
      ) : (
        <>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[8px] md:text-[9px] tracking-widest mb-1 md:mb-2">Total Dues</p>
          <p className="text-2xl md:text-3xl font-black text-slate-800">{stats.totalDues}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[8px] md:text-[9px] tracking-widest mb-1 md:mb-2">Paid</p>
          <p className="text-2xl md:text-3xl font-black text-success">{stats.totalPaid}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[8px] md:text-[9px] tracking-widest mb-1 md:mb-2">Pending</p>
          <p className="text-2xl md:text-3xl font-black text-amber-600">{stats.totalPending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[8px] md:text-[9px] tracking-widest mb-1 md:mb-2">Overdue</p>
          <p className="text-2xl md:text-3xl font-black text-danger">{stats.totalOverdue}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[8px] md:text-[9px] tracking-widest mb-1 md:mb-2">Future</p>
          <p className="text-2xl md:text-3xl font-black text-slate-500">{stats.totalFuture}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm col-span-2 md:col-span-1">
          <p className="text-slate-500 font-black uppercase text-[8px] md:text-[9px] tracking-widest mb-1 md:mb-2">Total Revenue</p>
          <p className="text-2xl md:text-3xl font-black text-primary">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'paid', 'pending', 'overdue'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === status
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? 'All Payments' : status}
              </button>
            ))}
          </div>
          <div className="relative flex-1 md:flex-initial">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input
              type="text"
              placeholder="Search by name or admission..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-primary text-sm font-bold text-slate-700 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <MiniLoader />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-20 text-center">
            <i className="fas fa-inbox text-slate-200 text-3xl mb-4"></i>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No payments found</p>
          </div>
        ) : (
          <>
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-50">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">{payment.student_name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      {payment.admission_number} · {MONTHS[payment.month - 1]} {payment.year}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex-shrink-0 ${getStatusStyle(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                    <p className="text-base font-black text-slate-800">₹{Number(payment.total_due || payment.amount || 0).toLocaleString()}</p>
                    {payment.late_fee > 0 && (
                      <p className="text-[9px] font-black text-danger">+ ₹{payment.late_fee} late</p>
                    )}
                  </div>
                  {(payment.paid_at || payment.due_date) && (
                    <p className="text-[10px] font-bold text-slate-500 text-right">
                      {new Date(payment.paid_at || payment.due_date).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-6">Student</th>
                  <th className="px-8 py-6">Admission</th>
                  <th className="px-8 py-6">Billing Cycle</th>
                  <th className="px-8 py-6 text-right">Amount</th>
                  <th className="px-8 py-6 text-right">Late Fee</th>
                  <th className="px-8 py-6 text-right">Total</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6">Paid / Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800">{payment.student_name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-600">{payment.admission_number}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800">
                        {MONTHS[payment.month - 1]} {payment.year}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-sm font-bold">₹{payment.amount || payment.base_fee}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className={`text-sm font-black ${payment.late_fee > 0 ? 'text-danger' : 'text-slate-400'}`}>
                        ₹{payment.late_fee || 0}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="font-black text-slate-800 text-lg">₹{Number(payment.total_due || payment.amount || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${getStatusStyle(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {(payment.paid_at || payment.due_date) ? (
                        <div>
                          <p className="text-[11px] font-bold text-slate-700">
                            {new Date(payment.paid_at || payment.due_date).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            {new Date(payment.paid_at || payment.due_date).toLocaleTimeString('en-IN', {
                              hour: '2-digit', minute: '2-digit', hour12: true
                            })}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400">—</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default AdminPayments;
