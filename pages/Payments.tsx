
import React, { useState, useEffect } from 'react';
import { User, PaymentStatus } from '../types';
import { MOCK_STUDENTS, MOCK_DUES, MONTHS } from '../constants';
import { usePayments } from '../hooks/usePayments';
import PaymentPortal from '../components/PaymentPortal';

const Payments: React.FC<{ user: User }> = ({ user }) => {
  const { paymentState, openPortal, closePortal, selectMethod, processPayment } = usePayments();
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  
  // Local persistence for the demo
  const [dues, setDues] = useState<any[]>([]);
  const student = MOCK_STUDENTS.find(s => s.admission_number === user.admissionNumber) || MOCK_STUDENTS[0];

  useEffect(() => {
    const savedDues = localStorage.getItem('fee_dues');
    if (savedDues) {
      const parsed = JSON.parse(savedDues);
      const studentDues = parsed.filter((d: any) => String(d.student_id) === String(student.id));
      setDues(studentDues);
    } else {
      const initialDues = MOCK_DUES.filter(d => d.student_id === student.id);
      setDues(initialDues);
      localStorage.setItem('fee_dues', JSON.stringify(MOCK_DUES));
    }
  }, [student.id]);
  
  const sortedDues = [...dues].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const earliestUnpaid = sortedDues.find(d => d.status !== PaymentStatus.PAID);

  const handlePayClick = (due: any) => {
    openPortal(due.id, due.total_due, student.full_name);
  };

  return (
    <div className="space-y-6">
      <PaymentPortal 
        state={paymentState} 
        onClose={closePortal} 
        onSelectMethod={selectMethod} 
        onConfirm={processPayment} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fee Settlement</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Active Ledger: {student.full_name} ({student.admission_number})</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white"><i className="fab fa-google-pay text-primary text-[10px]"></i></div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white"><i className="fas fa-credit-card text-success text-[10px]"></i></div>
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest uppercase">Encryption Active</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
        <div className="p-8 bg-slate-50 border-b border-slate-100">
           <div className="flex items-center gap-3">
              <i className="fas fa-history text-primary"></i>
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Billing Lifecycle Archive</h3>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Month Cycle</th>
                <th className="px-8 py-5">Due Date</th>
                <th className="px-8 py-5 text-right">Base</th>
                <th className="px-8 py-5 text-right">Penalty</th>
                <th className="px-8 py-5 text-right">Final Ledger</th>
                <th className="px-8 py-5 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedDues.map(due => {
                const isPaid = due.status === PaymentStatus.PAID;
                const isLocked = earliestUnpaid && earliestUnpaid.id !== due.id && !isPaid;

                return (
                  <tr key={due.id} className={`${isPaid ? 'bg-slate-50/30' : isLocked ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-slate-50/50'} transition-all group`}>
                    <td className="px-8 py-5">
                       <p className="font-black text-slate-800 text-lg tracking-tight leading-none mb-2">{MONTHS[due.month - 1]} {due.year}</p>
                       <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                         isPaid ? 'bg-success/10 text-success border-success/10' : 
                         due.status === PaymentStatus.OVERDUE ? 'bg-danger/10 text-danger border-danger/10' : 'bg-orange-50 text-orange-600 border-orange-100'
                       }`}>
                          {due.status}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{due.due_date}</p>
                    </td>
                    <td className="px-8 py-5 text-right text-slate-600 font-bold">₹{due.base_fee}</td>
                    <td className="px-8 py-5 text-right text-danger font-black">₹{due.late_fee}</td>
                    <td className="px-8 py-5 text-right font-black text-slate-800 text-xl tracking-tighter">₹{due.total_due}</td>
                    <td className="px-8 py-5 text-center">
                       {isPaid ? (
                         <span className="text-success font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                            <i className="fas fa-check-circle"></i>
                            Settled
                         </span>
                       ) : isLocked ? (
                         <div className="flex flex-col items-center justify-center text-slate-400 gap-1 opacity-50">
                            <i className="fas fa-lock text-xs"></i>
                            <span className="text-[8px] font-black uppercase tracking-widest">Wait: Clear Previous</span>
                         </div>
                       ) : (
                         <button 
                           onClick={() => handlePayClick(due)}
                           className="bg-primary text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl text-[10px] hover:bg-blue-800 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 group-hover:scale-105"
                         >
                           <i className="fas fa-shield-alt"></i>
                           Authorize Pay
                         </button>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
