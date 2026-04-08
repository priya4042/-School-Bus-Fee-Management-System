import React, { useState, useEffect, useRef } from 'react';
import { User, MonthlyDue, PaymentStatus, Student } from '../../types';
import { MONTHS } from '../../constants';
import { Download, CheckCircle2, AlertCircle, Filter, Search, FileText, ChevronDown, FileSpreadsheet, Receipt } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { calculateCurrentLedger, buildPaymentBundle } from '../../utils/feeCalculator';
import { usePayments } from '../../hooks/usePayments';
import { useReceipts } from '../../hooks/useReceipts';
import PaymentPortal from '../../components/PaymentPortal';
import MiniLoader from '../../components/MiniLoader';
import { useLanguage } from '../../lib/i18n';

const ReceiptDropdown: React.FC<{
  dueId: string;
  txnId: string;
  due: any;
  downloading: string | null;
  onDownload: (id: string, txn: string, due: any, format: 'pdf' | 'invoice' | 'receipt') => void;
}> = ({ dueId, txnId, due, downloading, onDownload }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isLoading = downloading === dueId;

  const items: { format: 'pdf' | 'invoice' | 'receipt'; label: string; icon: React.ReactNode; desc: string }[] = [
    { format: 'pdf', label: 'PDF', icon: <FileText size={14} />, desc: 'Standard format' },
    { format: 'invoice', label: 'Invoice', icon: <FileSpreadsheet size={14} />, desc: 'Detailed tax invoice' },
    { format: 'receipt', label: 'Receipt', icon: <Receipt size={14} />, desc: 'Compact receipt' },
  ];

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen(!open)}
        disabled={isLoading}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all disabled:opacity-50"
        title="Download Receipt"
      >
        {isLoading ? (
          <i className="fas fa-circle-notch fa-spin text-sm text-primary"></i>
        ) : (
          <i className="fas fa-ellipsis-vertical text-slate-500"></i>
        )}
      </button>
      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-[8px] font-black text-slate-400 tracking-widest px-3 py-2">Download As</p>
          {items.map((item) => (
            <button
              key={item.format}
              onClick={() => {
                setOpen(false);
                onDownload(dueId, txnId, due, item.format);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-all text-left group"
            >
              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                {item.icon}
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-800 tracking-widest">{item.label}</p>
                <p className="text-[8px] font-bold text-slate-400">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FeeHistory: React.FC<{ user: User }> = ({ user }) => {
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFutureScheduled, setShowFutureScheduled] = useState(false);
  const [loading, setLoading] = useState(true);

  const { paymentState, openPortal, closePortal, initiateRazorpay, initiateUpiIntent, confirmUpiPayment } = usePayments();
  const { downloadReceipt, downloading } = useReceipts();

  const getFinancialYearLabel = (month: number, year: number) => {
    const startsInCurrentYear = month >= 3;
    const fyStart = startsInCurrentYear ? year : year - 1;
    const fyEndShort = String((fyStart + 1) % 100).padStart(2, '0');
    return `FY ${fyStart}-${fyEndShort}`;
  };

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
      if (!selectedStudent && myStudents.length > 0) {
        setSelectedStudent(String(myStudents[0].id));
      }

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
        .order('year', { ascending: true })
        .order('month', { ascending: true });

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

  const now = new Date();
  const currentPeriod = now.getFullYear() * 12 + (now.getMonth() + 1);
  const toPeriod = (due: MonthlyDue) => Number(due.year || 0) * 12 + Number(due.month || 0);
  const isMonthStarted = (due: MonthlyDue) => toPeriod(due) <= currentPeriod;
  const sortedDues = [...dues].sort((a, b) => {
    if (a.student_id !== b.student_id) return Number(a.student_id) - Number(b.student_id);
    return toPeriod(a) - toPeriod(b);
  });

  const firstUnpaidByStudent = new Map<string, string>();
  sortedDues.forEach((due) => {
    const studentKey = String(due.student_id);
    if (due.status === PaymentStatus.PAID || !isMonthStarted(due)) return;
    if (!firstUnpaidByStudent.has(studentKey)) {
      firstUnpaidByStudent.set(studentKey, String(due.id));
    }
  });

  const visibleDues = dues.filter((due) => {
    if (due.status === PaymentStatus.PAID) return true;
    return firstUnpaidByStudent.get(String(due.student_id)) === String(due.id);
  });

  const futureScheduledDues = dues
    .filter((d) => d.status !== PaymentStatus.PAID)
    .filter((d) => firstUnpaidByStudent.get(String(d.student_id)) !== String(d.id))
    .filter((d) => (selectedStudent ? String(d.student_id) === String(selectedStudent) : true))
    .sort((a, b) => toPeriod(a) - toPeriod(b));

  const studentFilteredDues = selectedStudent
    ? visibleDues.filter((d) => String(d.student_id) === String(selectedStudent))
    : visibleDues;

  const filteredDues = studentFilteredDues.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const monthName = MONTHS[(d.month || 1) - 1]?.toLowerCase() || '';
    const studentName = students.find((s) => s.id === d.student_id)?.full_name?.toLowerCase() || '';
    return monthName.includes(q) || String(d.year).includes(q) || studentName.includes(q);
  }).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const selectedStudentData = students.find((s) => String(s.id) === String(selectedStudent));
  const selectedStudentDues = visibleDues
    .filter((d) => String(d.student_id) === String(selectedStudent))
    .sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));
  const billingStart = selectedStudentDues[0];
  const billingEnd = selectedStudentDues[selectedStudentDues.length - 1];

  const selectedStudentScopeDues = selectedStudent
    ? visibleDues.filter((d) => String(d.student_id) === String(selectedStudent))
    : visibleDues;

  const selectedStudentActionableUnpaid = selectedStudent
    ? dues
        .filter((d) => String(d.student_id) === String(selectedStudent))
        .filter((d) => firstUnpaidByStudent.get(String(d.student_id)) === String(d.id))
    : dues.filter((d) => firstUnpaidByStudent.get(String(d.student_id)) === String(d.id));

  // Always recalculate using feeCalculator for consistency
  const stats = {
    totalPaid: selectedStudentScopeDues
      .filter((d) => d.status === PaymentStatus.PAID)
      .reduce((acc, d) => acc + calculateCurrentLedger(d).total, 0),
    pending: selectedStudentActionableUnpaid
      .reduce((acc, d) => acc + calculateCurrentLedger(d).total, 0),
    overdue: selectedStudentActionableUnpaid.filter(
      (d) => d.due_date && new Date() > new Date(d.due_date)
    ).length,
  };

  const getDueOrderValue = (due: MonthlyDue) => Number(due.year || 0) * 12 + Number(due.month || 0);

  const isDuePayable = (targetDue: MonthlyDue) => {
    if (targetDue.status === PaymentStatus.PAID) return true;
    const targetValue = getDueOrderValue(targetDue);
    const previousUnpaid = dues.some((due) => {
      if (String(due.student_id) !== String(targetDue.student_id)) return false;
      if (due.status === PaymentStatus.PAID) return false;
      return getDueOrderValue(due) < targetValue;
    });
    return !previousUnpaid;
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
        <MiniLoader />
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mt-4">Loading Fee Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PaymentPortal state={paymentState} onClose={closePortal} onInitiateRazorpay={initiateRazorpay} onInitiateUpi={initiateUpiIntent} onConfirmUpi={confirmUpiPayment} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Fee Ledger</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
            Comprehensive Payment History & Dues
          </p>
        </div>
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

        {selectedStudentData && (
          <div className="px-8 py-5 border-b border-slate-50 bg-primary/5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">
              Child: {selectedStudentData.full_name}
            </p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Billing Period: {billingStart ? `${MONTHS[(billingStart.month || 1) - 1]} ${billingStart.year}` : 'N/A'} to {billingEnd ? `${MONTHS[(billingEnd.month || 1) - 1]} ${billingEnd.year}` : 'N/A'}
            </p>
          </div>
        )}

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
                const isPayable = isDuePayable(due);
                const isOverdue =
                  !isPaid && due.due_date && new Date() > new Date(due.due_date);
                const student = students.find((s) => s.id === due.student_id);
                const isLocked = !isPaid && !isPayable;

                return (
                  <tr key={due.id} className={`group transition-colors ${isLocked ? 'opacity-60' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        {MONTHS[(due.month || 1) - 1]} {due.year}
                      </p>
                      <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
                        {getFinancialYearLabel(Number(due.month || 1), Number(due.year || 0))}
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
                        <ReceiptDropdown
                          dueId={due.id}
                          txnId={due.transaction_id || due.id}
                          due={due}
                          downloading={downloading}
                          onDownload={downloadReceipt}
                        />
                      ) : isLocked ? (
                        <div className="inline-flex items-center gap-2 text-slate-400">
                          <i className="fas fa-lock text-xs"></i>
                          <span className="text-[8px] font-black uppercase tracking-widest">Pay previous month first</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const payBundle = buildPaymentBundle(due, dues);
                            openPortal(
                              due.id,
                              payBundle.amount || Number(due.total_due || due.amount || 0),
                              student?.full_name || due.student_name || 'Student',
                              payBundle.dueIds,
                              payBundle
                            );
                          }}
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
            <h3 className="text-xl font-black text-slate-900 tracking-tight">No Records Found</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">
              {students.length === 0
                ? 'No students linked to your account. Contact Bus Administrator.'
                : 'No fee records match your filter.'}
            </p>
          </div>
        )}
      </div>

      {futureScheduledDues.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
          <button
            onClick={() => setShowFutureScheduled((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all"
          >
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Future Scheduled Months ({futureScheduledDues.length})
            </span>
            <i className={`fas ${showFutureScheduled ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-400 text-xs`}></i>
          </button>

          {showFutureScheduled && (
            <div className="mt-4 space-y-2">
              {futureScheduledDues.map((due) => {
                const student = students.find((s) => s.id === due.student_id);
                return (
                  <div key={`future-${due.id}`} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                        {MONTHS[(due.month || 1) - 1]} {due.year}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {student?.full_name || due.student_name || 'Student'} • scheduled
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-slate-600 tracking-tight">
                        ₹{Number(due.total_due || due.amount || 0).toLocaleString('en-IN')}
                      </p>
                      <button
                        onClick={() => {
                          const payBundle = buildPaymentBundle(due, dues);
                          openPortal(
                            due.id,
                            payBundle.amount || Number(due.total_due || due.amount || 0),
                            student?.full_name || due.student_name || 'Student',
                            payBundle.dueIds,
                            payBundle
                          );
                        }}
                        className="px-3 py-2 rounded-lg bg-primary text-white text-[8px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeeHistory;
