
import React, { useState } from 'react';
import { MONTHS } from '../constants';
import { PaymentStatus, MonthlyDue } from '../types';
import Modal from '../components/Modal';
import { useFees } from '../hooks/useFees';
import { useStudents } from '../hooks/useStudents';
import { showConfirm, showToast, showAlert, showLoading, closeSwal } from '../lib/swal';

const Fees: React.FC = () => {
  const { dues, loading: duesLoading, generateMonthlyBills, waiveLateFee } = useFees();
  const { students } = useStudents();
  
  const [view, setView] = useState<'pending' | 'history'>('pending');
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [isManualPayModalOpen, setIsManualPayModalOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState<MonthlyDue | null>(null);
  const [manualPayData, setManualPayData] = useState({
    method: 'Cash',
    reference: '',
    notes: ''
  });

  const handleWaiveClick = (due: MonthlyDue) => {
    setSelectedDue(due);
    setIsWaiverModalOpen(true);
  };

  const confirmWaiver = async () => {
    if (selectedDue) {
      showLoading('Approving Waiver...');
      await waiveLateFee(selectedDue.id);
      closeSwal();
      setIsWaiverModalOpen(false);
      showToast('Late fee waived successfully', 'success');
    }
  };

  const handleManualPayClick = (due: MonthlyDue) => {
    setSelectedDue(due);
    setIsManualPayModalOpen(true);
  };

  const confirmManualPayment = () => {
    if (!selectedDue) return;
    showLoading('Recording Payment...');
    setTimeout(() => {
      closeSwal();
      setIsManualPayModalOpen(false);
      showAlert('Payment Recorded', `Offline ${manualPayData.method} payment of ₹${selectedDue.total_due} has been logged.`, 'success');
    }, 1000);
  };

  const sendReminder = async (studentName: string) => {
    showLoading(`Dispatching Reminder to ${studentName}...`);
    setTimeout(() => {
      closeSwal();
      showToast('SMS & Email Reminder Sent', 'success');
    }, 800);
  };

  const unpaidDues = dues.filter(d => d.status !== PaymentStatus.PAID);
  const paidDues = dues.filter(d => d.status === PaymentStatus.PAID);

  const activeDues = view === 'pending' ? unpaidDues : paidDues;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fee Management</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Collections & History</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
             <button 
               onClick={() => setView('pending')}
               className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${view === 'pending' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
             >
               Pending
             </button>
             <button 
               onClick={() => setView('history')}
               className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${view === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
             >
               History
             </button>
          </div>
          <button 
            onClick={async () => {
              const confirm = await showConfirm('Generate Bills?', 'This will generate monthly dues for all active students.', 'Generate Now');
              if (confirm) {
                showLoading('Generating Global Dues...');
                await generateMonthlyBills();
                closeSwal();
                showToast('Monthly billing synchronized', 'success');
              }
            }}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
          >
            <i className="fas fa-sync"></i>
            Run Billing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-premium">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uncollected Assets</p>
          <h3 className="text-4xl font-black text-danger mt-2">
            ₹{unpaidDues.reduce((sum, d) => sum + d.total_due, 0).toLocaleString()}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-premium">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Realized Revenue</p>
          <h3 className="text-4xl font-black text-success mt-2">
            ₹{paidDues.reduce((sum, d) => sum + d.total_due, 0).toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
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
                  <th className="px-8 py-5">Billing Cycle</th>
                  <th className="px-8 py-5 text-right">Late Penalty</th>
                  <th className="px-8 py-5 text-right">Total Ledger</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeDues.length > 0 ? activeDues.map((due) => {
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
                           due.status === PaymentStatus.PAID ? 'bg-success/10 text-success' : 
                           due.status === PaymentStatus.OVERDUE ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                         }`}>
                           {due.status}
                         </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {due.status !== PaymentStatus.PAID ? (
                            <>
                              <button 
                                onClick={() => sendReminder(student?.full_name || 'Student')}
                                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                              >
                                <i className="fas fa-bell"></i>
                              </button>
                              <button onClick={() => handleManualPayClick(due)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-success hover:bg-success hover:text-white transition-all shadow-sm"><i className="fas fa-receipt"></i></button>
                              <button onClick={() => handleWaiveClick(due)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-warning hover:bg-warning hover:text-white transition-all shadow-sm"><i className="fas fa-hand-holding-heart"></i></button>
                            </>
                          ) : (
                            <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">View Receipt</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                       <i className="fas fa-check-circle text-4xl text-slate-100 mb-4"></i>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching records found</p>
                    </td>
                  </tr>
                )}
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
          <div className="space-y-4">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payment Method</label>
                <select 
                   value={manualPayData.method}
                   onChange={(e) => setManualPayData({...manualPayData, method: e.target.value})}
                   className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-bold bg-white"
                >
                   <option>Cash</option>
                   <option>Cheque</option>
                   <option>Bank Transfer</option>
                   <option>POS Machine</option>
                </select>
             </div>
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reference No.</label>
                <input 
                   type="text"
                   placeholder="e.g. CHQ-99812"
                   className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-bold"
                   value={manualPayData.reference}
                   onChange={(e) => setManualPayData({...manualPayData, reference: e.target.value})}
                />
             </div>
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
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Late Fee Waiver Amount</p>
            <p className="text-xl font-black text-red-600">₹{selectedDue?.late_fee}</p>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Approving this will reset the late fee to zero for this cycle. This action is recorded in the audit vault.
          </p>
          <div className="flex gap-3">
             <button onClick={() => setIsWaiverModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all">Dismiss</button>
             <button onClick={confirmWaiver} className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg transition-all">Approve Waiver</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Fees;
