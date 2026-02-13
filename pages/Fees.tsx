
import React, { useState } from 'react';
import { MONTHS } from '../constants';
import { PaymentStatus, MonthlyDue } from '../types';
import Modal from '../components/Modal';
import { useFees } from '../hooks/useFees';
import { useStudents } from '../hooks/useStudents';

const Fees: React.FC = () => {
  const { dues, loading: duesLoading, generateMonthlyBills, waiveLateFee, applyDiscount } = useFees();
  const { students } = useStudents();
  
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isManualPayModalOpen, setIsManualPayModalOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState<MonthlyDue | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [manualPayData, setManualPayData] = useState({
    method: 'Cash',
    reference: '',
    notes: ''
  });

  const handleWaiveClick = (due: MonthlyDue) => {
    setSelectedDue(due);
    setIsWaiverModalOpen(true);
  };

  const handleDiscountClick = (due: MonthlyDue) => {
    setSelectedDue(due);
    setIsDiscountModalOpen(true);
  };

  const handleManualPayClick = (due: MonthlyDue) => {
    setSelectedDue(due);
    setIsManualPayModalOpen(true);
  };

  const confirmWaiver = async () => {
    if (selectedDue) {
      await waiveLateFee(selectedDue.id);
      setIsWaiverModalOpen(false);
    }
  };

  const confirmDiscount = async () => {
    if (selectedDue) {
      await applyDiscount(selectedDue.id, discountAmount);
      setIsDiscountModalOpen(false);
    }
  };

  const confirmManualPayment = () => {
    if (!selectedDue) return;
    alert(`Recorded ${manualPayData.method} payment of ₹${selectedDue.total_due} for Student ID ${selectedDue.student_id}.`);
    setIsManualPayModalOpen(false);
  };

  const unpaidDues = dues.filter(d => d.status !== PaymentStatus.PAID);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fee Management</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Collections, Overdues & Waivers</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => generateMonthlyBills()}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
          >
            <i className="fas fa-sync"></i>
            Generate Monthly Dues
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Outstanding</p>
          <h3 className="text-4xl font-black text-danger mt-2">
            ₹{unpaidDues.reduce((sum, d) => sum + d.total_due, 0).toLocaleString()}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Late Fees Billed</p>
          <h3 className="text-4xl font-black text-warning mt-2">
            ₹{unpaidDues.reduce((sum, d) => sum + d.late_fee, 0).toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {duesLoading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Ledger...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-5">Student Identity</th>
                  <th className="px-8 py-5">Billing Month</th>
                  <th className="px-8 py-5 text-right">Late Fee</th>
                  <th className="px-8 py-5 text-right">Total Payable</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {unpaidDues.map((due) => {
                  const student = students.find(s => String(s.id) === String(due.student_id));
                  return (
                    <tr key={due.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="font-black text-slate-800 tracking-tight">{student?.full_name || 'Loading...'}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{student?.admission_number}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">{MONTHS[due.month - 1]} {due.year}</p>
                      </td>
                      <td className="px-8 py-5 text-right text-danger font-black">₹{due.late_fee}</td>
                      <td className="px-8 py-5 text-right font-black text-slate-800 text-lg">₹{due.total_due}</td>
                      <td className="px-8 py-5 text-center">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                           due.status === PaymentStatus.OVERDUE ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                         }`}>
                           {due.status}
                         </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleManualPayClick(due)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-success hover:bg-success hover:text-white transition-all"><i className="fas fa-receipt"></i></button>
                          <button onClick={() => handleWaiveClick(due)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-primary hover:bg-primary hover:text-white transition-all"><i className="fas fa-hand-holding-heart"></i></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isManualPayModalOpen} onClose={() => setIsManualPayModalOpen(false)} title="Record Manual Payment">
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total to Settle</p>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">₹{selectedDue?.total_due}</p>
          </div>
          <button 
            onClick={confirmManualPayment}
            className="w-full py-5 bg-success text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-green-600 transition-all"
          >
            Finalize Manual Entry
          </button>
        </div>
      </Modal>

      <Modal isOpen={isWaiverModalOpen} onClose={() => setIsWaiverModalOpen(false)} title="Waive Late Fee">
        <div className="space-y-6">
          <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Late Fee Waiver</p>
            <p className="text-xl font-black text-red-600">₹{selectedDue?.late_fee}</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setIsWaiverModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest rounded-2xl">Dismiss</button>
             <button onClick={confirmWaiver} className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg">Approve Waiver</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Fees;
