import React, { useState, useEffect } from 'react';
import { User, MonthlyDue, PaymentStatus, Student } from '../../types';
import { MONTHS } from '../../constants';
import { Download, CheckCircle2, AlertCircle, Filter, Search, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { usePayments } from '../../hooks/usePayments';
import { useReceipts } from '../../hooks/useReceipts';
import PaymentPortal from '../../components/PaymentPortal';

const FeeHistory: React.FC<{ user: User }> = ({ user }) => {
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { paymentState, openPortal, closePortal, initiateRazorpay } = usePayments();
  const { downloadReceipt, downloading } = useReceipts();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch students linked to this parent
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id);

      if (studentsError) throw studentsError;
      const myStudents = studentsData || [];
      setStudents(myStudents);

      if (myStudents.length === 0) {
        setDues([]);
        return;
      }

      // Fetch dues for all children
      const studentIds = myStudents.map((s: Student) => s.id);
      const { data: duesData, error: duesError } = await supabase
        .from('monthly_dues')
        .select('*')
        .in('student_id', studentIds)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (duesError) throw duesError;
      setDues(duesData || []);
    } catch (err) {
      console.error('Failed to load fee history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id, paymentState.step]);

  const filteredDues = (selectedStudent === 'all'
    ? dues
    : dues.filter((d) => d.student_id === selectedStudent)
  ).filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const monthName = MONTHS[(d.month || 1) - 1]?.toLowerCase() || '';
    const studentName = students.find((s) => s.id === d.student_id)?.full_name?.toLowerCase() || '';
    return monthName.includes(q) || String(d.year).includes(q) || studentName.includes(q);
  });

  const stats = {
    totalPaid: dues
      .filter((d) => d.status === PaymentStatus.PAID)
      .reduce((acc, d) => acc + (d.total_due || 0), 0),
    pending: dues
      .filter((d) => d.status !== PaymentStatus.PAID)
      .reduce((acc, d) => acc + (d.total_due || 0), 0),
    overdue: dues.filter(
      (d) => d.status !== PaymentStatus.PAID && d.due_date && new Date() > new Date(d.due_date)
    ).length,
  };

  const handleExport = () => {
    const rows = [
      ['Period', 'Student', 'Base Fee', 'Late Fee', 'Total', 'Status', 'Paid On'],
      ...filteredDues.map((d) => [
        `${MONTHS[(d.month || 1) - 1]} ${d.year}`,
        students.find((s) => s.id === d.student_id)?.full_name || d.student_name || '',
        d.amount,
        d.late_fee || 0,
        d.total_due || 0,
        d.status,
        d.paid_at ? new Date(d.paid_at).toLocaleDateString('en-IN') : '',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fee_statement.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-20 text-center">
        <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mt-4">Loading Fee Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PaymentPortal state={paymentState} onClose={closePortal} onInitiateRazorpay={initiateRazorpay} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Fee Ledger</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
            Comprehensive Payment History & Dues
          </p>
        </div>
        <button
          onClick={handleExport}
          className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold text-sm border border-slate-100 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Cleared</p>
          <p className="text-3xl font-black text-emerald-600 tracking-tight">
            ₹{stats.totalPaid.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding</p>
          <p className="text-3xl font-black text-primary tracking-tight">
            ₹{stats.pending.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overdue Months</p>
          <p className="text-3xl font-black text-red-500 tracking-tight">{stats.overdue}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
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
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative group flex-1 max-w-md">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by month, year or student..."
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-xs font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Billing Period
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDues.map((due) => {
                const isPaid = due.status === PaymentStatus.PAID;
                const isOverdue =
                  !isPaid && due.due_date && new Date() > new Date(due.due_date);
                const student = students.find((s) => s.id === due.student_id);

                return (
                  <tr key={due.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        {MONTHS[(due.month || 1) - 1]} {due.year}
                      </p>
                      {due.due_date && (
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Due: {new Date(due.due_date).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-slate-700 uppercase">
                        {student?.full_name || due.student_name || 'Unknown'}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {student ? `Grade ${student.grade} – ${student.section}` : ''}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900 tracking-tight">
                        ₹{Number(due.total_due || 0).toLocaleString('en-IN')}
                      </p>
                      {(due.late_fee || 0) > 0 && (
                        <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1">
                          + ₹{Number(due.late_fee).toLocaleString('en-IN')} Late Fee
                        </p>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : isOverdue
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}
                      >
                        {isPaid ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                        {due.status}
                      </span>
                      {isPaid && due.paid_at && (
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">
                          {new Date(due.paid_at).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {isPaid ? (
                        <button
                          onClick={() => downloadReceipt(due.id, due.transaction_id || due.id)}
                          disabled={downloading === due.id}
                          className="p-3 bg-white text-primary rounded-xl border border-slate-100 shadow-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                          title="Download Receipt"
                        >
                          {downloading === due.id ? (
                            <i className="fas fa-circle-notch fa-spin text-sm"></i>
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            openPortal(
                              due.id,
                              due.total_due || due.amount,
                              student?.full_name || due.student_name || 'Student'
                            )
                          }
                          className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-800 transition-all"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDues.length === 0 && !loading && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">No Records Found</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">
              {students.length === 0
                ? 'No students linked to your account. Contact school admin.'
                : 'No fee records match your filter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeHistory;
