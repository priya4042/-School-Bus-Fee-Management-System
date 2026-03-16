import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MONTHS } from '../constants';
import { useReceipts } from '../hooks/useReceipts';
import api from '../lib/api';
import { supabase } from '../lib/supabase';

const Receipts: React.FC<{ user: User }> = ({ user }) => {
  const { downloadReceipt, downloading } = useReceipts();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Payment Receipts</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Digital Archive of Settled Fees</p>
        </div>
        <div className="bg-success/10 px-4 py-2 rounded-xl border border-success/20 flex items-center gap-2">
           <i className="fas fa-shield-check text-success"></i>
           <span className="text-[9px] font-black text-success uppercase tracking-widest">Verified Digital Signatures</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-premium">
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="p-20 text-center">
                <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
             </div>
          ) : payments.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
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
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                           <i className="fas fa-receipt"></i>
                        </div>
                        <span className="font-black text-slate-800 tracking-tight text-xs uppercase">{rec.transaction_id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-slate-600 uppercase tracking-widest">{rec.monthYear}</p>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-success">₹{Number(rec.amount || 0).toLocaleString()}</td>
                    <td className="px-8 py-5 text-center">
                        <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full uppercase tracking-widest border border-slate-200">
                            {rec.method || 'Online'}
                        </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rec.date || rec.payment_date || '---'}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => downloadReceipt(rec.due_id || rec.id, rec.transaction_id, rec)}
                        disabled={downloading === String(rec.due_id || rec.id)}
                        className="w-10 h-10 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all flex items-center justify-center shadow-sm ml-auto"
                        title="Download PDF"
                      >
                        {downloading === String(rec.due_id || rec.id) ? (
                          <i className="fas fa-circle-notch fa-spin text-xs"></i>
                        ) : (
                          <i className="fas fa-file-pdf"></i>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-24 text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
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