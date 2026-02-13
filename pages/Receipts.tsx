
import React from 'react';
import { User } from '../types';
import { MONTHS } from '../constants';
import { useReceipts } from '../hooks/useReceipts';

const MOCK_RECEIPTS = [
  { id: 1, txnId: 'REC-2024-001', month: 1, year: 2024, amount: 1500, date: '2024-01-05', method: 'Razorpay' },
  { id: 2, txnId: 'REC-2024-002', month: 2, year: 2024, amount: 1500, date: '2024-02-08', method: 'Razorpay' },
];

const Receipts: React.FC<{ user: User }> = ({ user }) => {
  const { downloadReceipt, downloading } = useReceipts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Payment Receipts</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Official Transaction Proofs</p>
        </div>
        <div className="bg-success/10 px-4 py-2 rounded-xl border border-success/20 flex items-center gap-2">
           <i className="fas fa-shield-check text-success"></i>
           <span className="text-[9px] font-black text-success uppercase tracking-widest">Digitally Signed & Verified</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
              <th className="px-8 py-5">Receipt Identity</th>
              <th className="px-8 py-5">Billing Cycle</th>
              <th className="px-8 py-5 text-right">Amount Settled</th>
              <th className="px-8 py-5 text-center">Payment Date</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MOCK_RECEIPTS.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                       <i className="fas fa-receipt"></i>
                    </div>
                    <span className="font-black text-slate-800 tracking-tight">{rec.txnId}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">{MONTHS[rec.month - 1]} {rec.year}</p>
                </td>
                <td className="px-8 py-5 text-right font-black text-success">₹{rec.amount}</td>
                <td className="px-8 py-5 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rec.date}</p>
                </td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => downloadReceipt(rec.id, rec.txnId)}
                    disabled={downloading === String(rec.id)}
                    className="w-10 h-10 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all flex items-center justify-center shadow-sm"
                  >
                    {downloading === String(rec.id) ? (
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
        
        {MOCK_RECEIPTS.length === 0 && (
          <div className="p-20 text-center">
             <i className="fas fa-folder-open text-5xl text-slate-100 mb-4"></i>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No receipts found in archives</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipts;
