import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MONTHS } from '../constants';
import { useReceipts } from '../hooks/useReceipts';
import { supabase } from '../lib/supabase';
import MiniLoader from '../components/MiniLoader';

const Receipts: React.FC<{ user: User }> = ({ user }) => {
  const { downloadReceipt, downloading } = useReceipts();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (value?: string) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatMethod = (method?: string) => String(method || 'ONLINE').toUpperCase();

  const shortTxn = (value: string) => {
    const raw = String(value || '').trim();
    if (raw.length <= 16) return raw;
    return `${raw.slice(0, 8)}...${raw.slice(-6)}`;
  };

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const { data: receiptRows, error: receiptErr } = await supabase
          .from('receipts')
          .select('id, due_id, amount_paid, payment_method, transaction_id, created_at, monthly_dues(month, year, student_id), students:monthly_dues(student_id)');

        if (receiptErr) throw receiptErr;

        const mappedReceipts = (receiptRows || []).map((row: any) => ({
          id: row.id,
          due_id: row.due_id,
          transaction_id: row.transaction_id || row.id,
          amount: row.amount_paid,
          monthYear: row.monthly_dues?.month && row.monthly_dues?.year
            ? `${MONTHS[row.monthly_dues.month - 1]} ${row.monthly_dues.year}`
            : 'N/A',
          date: row.created_at,
          method: row.payment_method || 'ONLINE',
          status: 'PAID'
        }));

        const { data: paidDues, error: duesErr } = await supabase
          .from('monthly_dues')
          .select('id, month, year, total_due, amount, paid_at, transaction_id, payment_method, students!inner(parent_id)')
          .eq('status', 'PAID')
          .eq('students.parent_id', user.id);

        if (duesErr) throw duesErr;

        const historicalReceipts = (paidDues || []).map((d: any) => ({
          id: d.transaction_id || `HIST-${d.id}`,
          due_id: d.id,
          transaction_id: d.transaction_id || `HIST-${d.id}`,
          monthYear: `${MONTHS[d.month - 1]} ${d.year}`,
          amount: d.total_due || d.amount,
          date: d.paid_at,
          method: d.payment_method || 'ONLINE',
          status: 'PAID'
        }));

        const combined = [...mappedReceipts, ...historicalReceipts];
        const unique = combined.filter((entry, index, all) => {
          const key = entry.due_id || entry.transaction_id;
          return all.findIndex((candidate) => (candidate.due_id || candidate.transaction_id) === key) === index;
        });

        setPayments(unique.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
      } catch (err) {
        console.error("Receipt aggregation error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Payment Receipts</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Digital archive of settled fees</p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 flex items-center gap-2 w-fit">
           <i className="fas fa-shield-check text-success"></i>
           <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Verified digital signatures</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Receipts</p>
          <p className="text-xl font-black text-slate-900 mt-1">{payments.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paid Entries</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{payments.filter((p) => p.status === 'PAID').length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 col-span-2 md:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Settled</p>
          <p className="text-xl font-black text-primary mt-1">
            ₹{payments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-premium">
        <div className="min-h-[300px]">
          {loading ? (
             <div className="p-20 text-center">
                <MiniLoader />
             </div>
          ) : payments.length > 0 ? (
            <>
              <div className="md:hidden p-4 space-y-3">
                {payments.map((rec) => (
                  <div key={rec.id} className="rounded-2xl border border-slate-200 p-4 bg-gradient-to-br from-white to-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction</p>
                        <p className="text-sm font-black text-slate-900 mt-1">{shortTxn(rec.transaction_id)}</p>
                      </div>
                      <span className="text-[9px] font-black px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full uppercase tracking-widest border border-emerald-200">
                        {formatMethod(rec.method)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Billing</p>
                        <p className="text-xs font-bold text-slate-700 mt-1">{rec.monthYear}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</p>
                        <p className="text-xs font-bold text-slate-700 mt-1">{formatDate(rec.date || rec.payment_date)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-lg font-black text-primary">₹{Number(rec.amount || 0).toLocaleString('en-IN')}</p>
                      <button
                        onClick={() => downloadReceipt(rec.due_id || rec.id, rec.transaction_id, rec)}
                        disabled={downloading === String(rec.due_id || rec.id)}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                      >
                        {downloading === String(rec.due_id || rec.id) ? 'Downloading...' : 'Receipt PDF'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/70 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="px-8 py-5">Transaction Ref</th>
                      <th className="px-8 py-5">Billing Cycle</th>
                      <th className="px-8 py-5 text-right">Amount Settled</th>
                      <th className="px-8 py-5 text-center">Protocol</th>
                      <th className="px-8 py-5 text-center">Payment Date</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                              <i className="fas fa-receipt"></i>
                            </div>
                            <span className="font-black text-slate-800 tracking-tight text-xs uppercase">{shortTxn(rec.transaction_id)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-black text-slate-600 uppercase tracking-widest">{rec.monthYear}</p>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-emerald-600">₹{Number(rec.amount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-8 py-5 text-center">
                          <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase tracking-widest border border-slate-200">
                            {formatMethod(rec.method)}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formatDate(rec.date || rec.payment_date)}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => downloadReceipt(rec.due_id || rec.id, rec.transaction_id, rec)}
                            disabled={downloading === String(rec.due_id || rec.id)}
                            className="px-3 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            title="Download PDF"
                          >
                            {downloading === String(rec.due_id || rec.id) ? 'Downloading...' : 'Download'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 md:p-24 text-center">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                   <i className="fas fa-folder-open text-3xl text-slate-200"></i>
               </div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No receipts found in the cloud vault</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Receipts;