
import React, { useState } from 'react';
import { User, PaymentStatus } from '../types';
import { MOCK_STUDENTS, MOCK_DUES, MONTHS } from '../constants';
import { usePayments } from '../hooks/usePayments';

const Payments: React.FC<{ user: User }> = ({ user }) => {
  const { initiatePayment, loading: isProcessing } = usePayments();
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  
  // Fix: Use admission_number instead of admissionNumber
  const student = MOCK_STUDENTS.find(s => s.admission_number === user.admissionNumber) || MOCK_STUDENTS[0];
  // Fix: Use student_id instead of studentId
  const dues = MOCK_DUES.filter(d => d.student_id === student.id);
  
  // Rule 1: No Month Skipping Logic
  // We sort dues by year then month to find the first unpaid one
  const sortedDues = [...dues].sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));
  const earliestUnpaid = sortedDues.find(d => d.status !== PaymentStatus.PAID);

  const handlePayClick = async (due: any) => {
    setActivePaymentId(due.id);
    // Fix: Use full_name
    await initiatePayment(due.id, due.total_due, student.full_name);
    setActivePaymentId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fee Payments</h2>
          {/* Fix: Use full_name */}
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Secure Ledger for {student.full_name}</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white"><i className="fab fa-google-pay text-primary text-[10px]"></i></div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white"><i className="fas fa-credit-card text-success text-[10px]"></i></div>
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multi-Channel Secure Pay</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Chronological Payment Schedule</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Billing Month</th>
                <th className="px-8 py-5">Due Date</th>
                <th className="px-8 py-5 text-right">Base Fee</th>
                <th className="px-8 py-5 text-right">Late Penalty</th>
                <th className="px-8 py-5 text-right">Total Payable</th>
                <th className="px-8 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedDues.filter(d => d.status !== PaymentStatus.PAID).map(due => {
                // Rule 1 Enforcement: If this isn't the earliest unpaid month, lock it.
                const isLocked = earliestUnpaid && earliestUnpaid.id !== due.id;
                const isCurrentlyPaying = activePaymentId === due.id;

                return (
                  <tr key={due.id} className={`${isLocked ? 'opacity-40 grayscale pointer-events-none bg-slate-50/30' : 'hover:bg-slate-50/50'} transition-all`}>
                    <td className="px-8 py-5">
                       <p className="font-black text-slate-800 text-lg tracking-tight">{MONTHS[due.month - 1]} {due.year}</p>
                       <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${due.status === PaymentStatus.OVERDUE ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                          {due.status}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       {/* Fix: Use due_date, base_fee, late_fee, total_due */}
                       <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{due.due_date}</p>
                    </td>
                    <td className="px-8 py-5 text-right text-slate-600 font-bold">₹{due.base_fee}</td>
                    <td className="px-8 py-5 text-right text-danger font-black">₹{due.late_fee}</td>
                    <td className="px-8 py-5 text-right font-black text-slate-800 text-xl tracking-tighter">₹{due.total_due}</td>
                    <td className="px-8 py-5 text-center">
                       {isLocked ? (
                         <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                            <i className="fas fa-lock text-xs"></i>
                            <span className="text-[8px] font-black uppercase tracking-widest">Pay Previous Months First</span>
                         </div>
                       ) : (
                         <button 
                           onClick={() => handlePayClick(due)}
                           disabled={isProcessing}
                           className="bg-primary text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl text-[10px] hover:bg-blue-800 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                         >
                           {isCurrentlyPaying ? (
                             <i className="fas fa-circle-notch fa-spin"></i>
                           ) : (
                             <i className="fas fa-shield-alt"></i>
                           )}
                           Pay Securely
                         </button>
                       )}
                    </td>
                  </tr>
                );
              })}
              {sortedDues.filter(d => d.status !== PaymentStatus.PAID).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-success font-black uppercase text-xs">
                    <i className="fas fa-check-circle text-2xl mb-4 block"></i>
                    All dues are cleared!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
