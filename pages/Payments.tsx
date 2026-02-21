import React, { useState, useEffect } from 'react';
import { User, PaymentStatus, MonthlyDue } from '../types';
import { MOCK_STUDENTS, MOCK_DUES, MONTHS } from '../constants';
import { usePayments } from '../hooks/usePayments';
import PaymentPortal from '../components/PaymentPortal';
import { calculateCurrentLedger, isMonthPayable } from '../utils/feeCalculator';

const Payments: React.FC<{ user: User }> = ({ user }) => {
  const { paymentState, openPortal, closePortal, selectMethod, processPayment } = usePayments();
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  
  const student = MOCK_STUDENTS.find(s => s.admission_number === user.admissionNumber) || MOCK_STUDENTS[0];

  const fetchUpdatedDues = () => {
    const savedDues = localStorage.getItem('fee_dues');
    let studentDues: MonthlyDue[] = [];
    if (savedDues) {
      const parsed = JSON.parse(savedDues);
      studentDues = parsed.filter((d: any) => String(d.student_id) === String(student.id));
    } else {
      studentDues = MOCK_DUES.filter(d => d.student_id === student.id);
      localStorage.setItem('fee_dues', JSON.stringify(MOCK_DUES));
    }
    
    // Apply dynamic calculations
    const calculated = studentDues.map(d => {
      const ledger = calculateCurrentLedger(d);
      return { ...d, late_fee: ledger.lateFee, total_due: ledger.total };
    });

    setDues(calculated.sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month)));
  };

  useEffect(() => {
    fetchUpdatedDues();
    // Listen for payment success from portal
    if (paymentState.step === 'SUCCESS') {
      fetchUpdatedDues();
    }
  }, [student.id, paymentState.step]);

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
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Student: {student.full_name} • Seq. Payment Enforced</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
           <i className="fas fa-lock text-primary text-xs"></i>
           <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">Strict Billing Protocol v2.1</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-6">Billing Cycle</th>
                <th className="px-8 py-6">Deadlines</th>
                <th className="px-8 py-6 text-right">Fee / Penalty</th>
                <th className="px-8 py-6 text-right">Total Ledger</th>
                <th className="px-8 py-6 text-center">Protocol Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dues.map(due => {
                const isPaid = due.status === PaymentStatus.PAID;
                const payable = isMonthPayable(due, dues);
                const isLocked = !isPaid && !payable;
                const { isFineApplied } = calculateCurrentLedger(due);
                const isLate = new Date() > new Date(due.due_date);

                return (
                  <tr key={due.id} className={`${isPaid ? 'bg-slate-50/20' : isLocked ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-slate-50/50'} transition-all group`}>
                    <td className="px-8 py-6">
                       <p className="font-black text-slate-800 text-lg tracking-tight leading-none mb-2">{MONTHS[due.month - 1]} {due.year}</p>
                       <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border inline-flex items-center gap-1.5 ${
                         isPaid ? 'bg-success/10 text-success border-success/10' : 
                         isLocked ? 'bg-slate-100 text-slate-400 border-slate-200' :
                         isLate ? 'bg-danger/10 text-danger border-danger/10' : 'bg-blue-50 text-primary border-blue-100'
                       }`}>
                          {isLocked && <i className="fas fa-lock text-[7px]"></i>}
                          {isPaid ? 'Settled' : isLocked ? 'Locked' : due.status}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                            <span>Due:</span> 
                            <span className="text-slate-600">{due.due_date}</span>
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                            <span>Last Date:</span> 
                            <span className={isFineApplied ? 'text-danger' : 'text-slate-600'}>{due.last_date}</span>
                          </p>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className="text-xs font-bold text-slate-500">₹{due.base_fee}</p>
                       {due.late_fee > 0 && (
                         <p className="text-[10px] font-black text-danger uppercase tracking-tighter mt-1">
                           +{isFineApplied ? 'Fixed Fine' : 'Late Fee'} ₹{due.late_fee}
                         </p>
                       )}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className="font-black text-slate-800 text-xl tracking-tighter">₹{due.total_due.toLocaleString()}</p>
                       {isFineApplied && !isPaid && <span className="text-[7px] font-black bg-danger text-white px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Fine Applied</span>}
                    </td>
                    <td className="px-8 py-6 text-center">
                       {isPaid ? (
                         <div className="flex flex-col items-center">
                            <i className="fas fa-check-circle text-success text-xl mb-1"></i>
                            <span className="text-[8px] font-black text-slate-400 uppercase">Paid Oct 12</span>
                         </div>
                       ) : isLocked ? (
                         <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                            <i className="fas fa-lock text-sm"></i>
                            <span className="text-[8px] font-black uppercase tracking-widest text-center">Clear previous<br/>months first</span>
                         </div>
                       ) : (
                         <button 
                           onClick={() => openPortal(due.id, due.total_due, student.full_name)}
                           className="bg-primary text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl text-[10px] hover:bg-blue-800 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 group-hover:scale-105"
                         >
                           <i className="fas fa-credit-card"></i>
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
      
      <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg">
             <i className="fas fa-info-circle"></i>
          </div>
          <div>
             <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-1">Billing Sequence Policy</h4>
             <p className="text-[11px] text-primary/70 font-bold leading-relaxed">
               For financial consistency, the school system requires all dues to be settled chronologically. Future months will remain locked until current and past outstanding balances are cleared. Fines are automatically calculated based on the cutoff date of each individual billing cycle.
             </p>
          </div>
      </div>
    </div>
  );
};

export default Payments;