import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateCurrentLedger } from '../utils/feeCalculator';
import { MONTHS } from '../constants';
import Reports from './Reports';

const AdminPayments: React.FC = () => {
  const [view, setView] = useState<'payments' | 'reports'>('payments');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      // Fetch dues without embedded join to avoid PostgREST 400
      const { data: dues, error: duesError } = await supabase
        .from('monthly_dues')
        .select('id, student_id, month, year, amount, base_fee, due_date, last_date, status, paid_at, total_due, transaction_id')
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
        const normalizedStatus = String(due.status || '').toUpperCase() || 'PENDING';
        return {
          ...due,
          status: normalizedStatus,
          student_name: student.full_name || 'Unknown',
          admission_number: student.admission_number || 'N/A',
          late_fee: ledger.lateFee,
          total_due: ledger.total,
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
      default:
        return 'bg-slate-100 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Payment Hub</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">System-Wide Payment Tracking</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
          <button onClick={() => setView('payments')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${view === 'payments' ? 'bg-primary text-white' : 'text-slate-500'}`}>Payments</button>
          <button onClick={() => setView('reports')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${view === 'reports' ? 'bg-primary text-white' : 'text-slate-500'}`}>Reports</button>
        </div>
      </div>

      {view === 'reports' ? (
        <Reports />
      ) : (
        <>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[9px] tracking-widest mb-2">Total Dues</p>
          <p className="text-3xl font-black text-slate-800">{stats.totalDues}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[9px] tracking-widest mb-2">Paid</p>
          <p className="text-3xl font-black text-success">{stats.totalPaid}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[9px] tracking-widest mb-2">Pending</p>
          <p className="text-3xl font-black text-amber-600">{stats.totalPending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[9px] tracking-widest mb-2">Overdue</p>
          <p className="text-3xl font-black text-danger">{stats.totalOverdue}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 font-black uppercase text-[9px] tracking-widest mb-2">Total Revenue</p>
          <p className="text-2xl font-black text-primary">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
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
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center">
              <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-20 text-center">
              <i className="fas fa-inbox text-slate-200 text-3xl mb-4"></i>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No payments found</p>
            </div>
          ) : (
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
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{payment.paid_at || payment.due_date}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default AdminPayments;
