import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MONTHS } from '../constants';
import { useReceipts } from '../hooks/useReceipts';
import api from '../lib/api';

const Receipts: React.FC<{ user: User }> = ({ user }) => {
  const { downloadReceipt, downloading } = useReceipts();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        // 1. Fetch receipts from Supabase via API interceptor
        const { data: supabaseReceipts } = await api.get('receipts');
        
        // 2. Map Supabase receipts to the format expected by the UI
        const mappedReceipts = (supabaseReceipts || []).map((r: any) => ({
          id: r.id,
          transaction_id: r.transaction_id,
          amount: r.amount,
          studentName: r.student_name,
          monthYear: r.month_year,
          date: r.payment_date,
          method: r.method,
          status: r.status
        }));

        // 3. Fetch historical data from dues if needed (optional, but keeping for completeness)
        let historicalReceipts = [];
        try {
            const { data: dues } = await api.get('fees/dues');
            historicalReceipts = (dues || [])
                .filter((d: any) => d.status === 'PAID')
                .map((d: any) => ({
                    id: d.transaction_id || `HIST-${d.id}`,
                    transaction_id: d.transaction_id || `HIST-${d.id}`,
                    monthYear: `${MONTHS[d.month - 1]} ${d.year}`,
                    amount: d.total_due || d.amount,
                    date: d.payment_date || d.due_date,
                    method: 'Online'
                }));
        } catch (e) {
            console.error("Historical dues fetch error:", e);
        }

        // Combine and filter duplicates by transaction ID
        const combined = [...mappedReceipts, ...historicalReceipts];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.transaction_id === v.transaction_id) === i);
        
        setPayments(unique);
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
                    <td className="px-8 py-5 text-right font-black text-success">₹{rec.amount?.toLocaleString()}</td>
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
                        onClick={() => downloadReceipt(rec.transaction_id, rec.transaction_id)}
                        disabled={downloading === String(rec.transaction_id)}
                        className="w-10 h-10 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all flex items-center justify-center shadow-sm ml-auto"
                        title="Download PDF"
                      >
                        {downloading === String(rec.transaction_id) ? (
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