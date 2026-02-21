import React, { useState } from 'react';
import { MONTHS } from '../constants';
import { PaymentStatus, MonthlyDue, Student } from '../types';
import Modal from '../components/Modal';
import { useFees } from '../hooks/useFees';
import { useStudents } from '../hooks/useStudents';
import { showConfirm, showToast, showAlert, showLoading, closeSwal } from '../lib/swal';

const Fees: React.FC = () => {
  const { dues, loading: duesLoading, generateMonthlyBills, waiveLateFee, createFee, updateFee, deleteFee } = useFees();
  const { students } = useStudents();
  
  const [view, setView] = useState<'pending' | 'history'>('pending');
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [isFeeBuilderOpen, setIsFeeBuilderOpen] = useState(false);
  const [isManualPayModalOpen, setIsManualPayModalOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState<MonthlyDue | null>(null);
  
  const [feeFormData, setFeeFormData] = useState({
    student_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    base_fee: 1500,
    fine_amount: 250,
    due_date: '',
    last_date: '',
    status: PaymentStatus.UNPAID
  });

  const [manualPayData, setManualPayData] = useState({
    method: 'Cash',
    reference: '',
    notes: ''
  });

  const handleEditClick = (due: MonthlyDue) => {
    setSelectedDue(due);
    setFeeFormData({
      student_id: due.student_id,
      month: due.month,
      year: due.year,
      base_fee: due.base_fee,
      fine_amount: due.fine_amount || 0,
      due_date: due.due_date,
      last_date: due.last_date,
      status: due.status
    });
    setIsFeeBuilderOpen(true);
  };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeFormData.student_id) {
      showAlert('Error', 'Please select a student.', 'warning');
      return;
    }

    showLoading(selectedDue ? 'Updating Ledger...' : 'Creating Fee Entry...');
    
    const payload = {
      ...feeFormData,
      late_fee: 0,
      discount: 0,
      total_due: feeFormData.base_fee
    };

    const success = selectedDue 
      ? await updateFee(selectedDue.id, payload as any)
      : await createFee(payload as any);
    
    closeSwal();
    if (success) {
      setIsFeeBuilderOpen(false);
      setSelectedDue(null);
      showToast(selectedDue ? 'Ledger updated' : 'Fee entry created', 'success');
    }
  };

  const handleDeleteFee = async (id: string) => {
    const confirmed = await showConfirm('Remove Fee Record?', 'This action will permanently delete this ledger entry.', 'Delete');
    if (confirmed) {
      showLoading('Removing...');
      await deleteFee(id);
      closeSwal();
      showToast('Record deleted', 'info');
    }
  };

  const confirmManualPayment = () => {
    if (!selectedDue) return;
    showLoading('Recording Payment...');
    setTimeout(() => {
      closeSwal();
      setIsManualPayModalOpen(false);
      showAlert('Payment Recorded', `Payment settled for ₹${selectedDue.total_due}.`, 'success');
    }, 1000);
  };

  const inputClass = "w-full px-5 py-3.5 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm transition-all text-slate-800 placeholder-slate-400";
  const selectClass = "w-full px-5 py-3.5 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm bg-white transition-all text-slate-800 cursor-pointer";

  const unpaidDues = dues.filter(d => d.status !== PaymentStatus.PAID);
  const paidDues = dues.filter(d => d.status === PaymentStatus.PAID);
  const activeDues = view === 'pending' ? unpaidDues : paidDues;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">Fee Management</h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">Collections & History</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-white p-1 rounded-xl md:rounded-2xl border border-slate-200 flex shadow-sm w-full sm:w-auto">
             <button 
               onClick={() => setView('pending')}
               className={`flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-2.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg md:rounded-xl transition-all ${view === 'pending' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
             >
               Pending
             </button>
             <button 
               onClick={() => setView('history')}
               className={`flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-2.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg md:rounded-xl transition-all ${view === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
             >
               History
             </button>
          </div>
          <button 
            onClick={() => {
              setSelectedDue(null);
              setFeeFormData({
                student_id: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                base_fee: 1500,
                fine_amount: 250,
                due_date: '',
                last_date: '',
                status: PaymentStatus.UNPAID
              });
              setIsFeeBuilderOpen(true);
            }}
            className="bg-primary text-white px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
          >
            <i className="fas fa-plus"></i>
            Create Fee
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
        <div className="responsive-table-container">
          {duesLoading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Ledger...</p>
            </div>
          ) : (
            <table className="w-full text-left responsive-table">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-6 md:px-8 py-4 md:py-5">Student Identity</th>
                  <th className="px-6 md:px-8 py-4 md:py-5">Cycle & Deadlines</th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-right">Penalty/Fine</th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-right">Total Ledger</th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-center">Status</th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeDues.length > 0 ? activeDues.map((due) => {
                  const student = students.find(s => String(s.id) === String(due.student_id));
                  const isLate = new Date() > new Date(due.due_date);
                  const isPastLastDate = new Date() > new Date(due.last_date);

                  return (
                    <tr key={due.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 md:px-8 py-4 md:py-5">
                        <p className="font-black text-slate-800 tracking-tight text-sm">{student?.full_name || 'Loading...'}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{student?.admission_number}</p>
                      </td>
                      <td className="px-6 md:px-8 py-4 md:py-5">
                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{MONTHS[due.month - 1]} {due.year}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">Due: {due.due_date} | Fine from: {due.last_date}</p>
                      </td>
                      <td className="px-6 md:px-8 py-4 md:py-5 text-right">
                         <p className={`font-black text-sm ${isLate ? 'text-danger' : 'text-slate-300'}`}>
                           ₹{isPastLastDate ? due.fine_amount : (due.late_fee || 0)}
                         </p>
                         {isPastLastDate && <span className="text-[8px] font-black text-danger uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded">Fine Applied</span>}
                      </td>
                      <td className="px-6 md:px-8 py-4 md:py-5 text-right font-black text-slate-800 text-base md:text-lg">₹{due.total_due}</td>
                      <td className="px-6 md:px-8 py-4 md:py-5 text-center">
                         <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
                           due.status === PaymentStatus.PAID ? 'bg-success/10 text-success border-success/10' : 
                           isLate ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-primary border-blue-100'
                         }`}>
                           {due.status}
                         </span>
                      </td>
                      <td className="px-6 md:px-8 py-4 md:py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditClick(due)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg md:rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm"><i className="fas fa-edit text-xs"></i></button>
                          <button onClick={() => handleDeleteFee(due.id)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg md:rounded-xl text-danger hover:bg-danger hover:text-white transition-all shadow-sm"><i className="fas fa-trash-alt text-xs"></i></button>
                          {due.status !== PaymentStatus.PAID && (
                            <button onClick={() => { setSelectedDue(due); setIsManualPayModalOpen(true); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg md:rounded-xl text-success hover:bg-success hover:text-white transition-all shadow-sm"><i className="fas fa-receipt text-xs"></i></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                       <i className="fas fa-check-circle text-3xl text-slate-100 mb-4"></i>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching records</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isFeeBuilderOpen} onClose={() => setIsFeeBuilderOpen(false)} title={selectedDue ? "Edit Fee Record" : "Create New Fee Entry"}>
        <form onSubmit={handleCreateFee} className="space-y-5">
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Select Student</label>
              <select 
                required
                className={selectClass}
                value={feeFormData.student_id}
                onChange={(e) => setFeeFormData({...feeFormData, student_id: e.target.value})}
              >
                <option value="">Choose Student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>
                ))}
              </select>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Month</label>
                <select 
                   className={selectClass}
                   value={feeFormData.month}
                   onChange={(e) => setFeeFormData({...feeFormData, month: Number(e.target.value)})}
                >
                   {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Year</label>
                <input 
                  type="number"
                  className={inputClass}
                  value={feeFormData.year}
                  onChange={(e) => setFeeFormData({...feeFormData, year: Number(e.target.value)})}
                />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Base Fee (₹)</label>
                <input 
                  type="number"
                  className={inputClass.replace('text-slate-800', 'text-primary font-black')}
                  value={feeFormData.base_fee}
                  onChange={(e) => setFeeFormData({...feeFormData, base_fee: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fixed Fine (₹)</label>
                <input 
                  type="number"
                  className={inputClass.replace('text-slate-800', 'text-danger font-black')}
                  value={feeFormData.fine_amount}
                  onChange={(e) => setFeeFormData({...feeFormData, fine_amount: Number(e.target.value)})}
                />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Due Date</label>
                <input 
                  type="date"
                  required
                  className={inputClass}
                  value={feeFormData.due_date}
                  onChange={(e) => setFeeFormData({...feeFormData, due_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fine Cutoff Date</label>
                <input 
                  type="date"
                  required
                  className={inputClass}
                  value={feeFormData.last_date}
                  onChange={(e) => setFeeFormData({...feeFormData, last_date: e.target.value})}
                />
              </div>
           </div>

           <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setIsFeeBuilderOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 transition-all">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">
                {selectedDue ? 'Save Changes' : 'Create Entry'}
              </button>
           </div>
        </form>
      </Modal>

      <Modal isOpen={isManualPayModalOpen} onClose={() => setIsManualPayModalOpen(false)} title="Record Manual Payment">
        <div className="space-y-6">
          <div className="p-5 md:p-6 bg-primary/5 rounded-2xl border border-primary/20">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total to Settle</p>
            <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">₹{selectedDue?.total_due}</p>
          </div>
          <div className="space-y-4">
             <div>
                <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Payment Method</label>
                <select 
                   value={manualPayData.method}
                   onChange={(e) => setManualPayData({...manualPayData, method: e.target.value})}
                   className={selectClass}
                >
                   <option>Cash</option>
                   <option>Cheque</option>
                   <option>Bank Transfer</option>
                </select>
             </div>
             <div>
                <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Reference No.</label>
                <input 
                   type="text"
                   placeholder="e.g. CHQ-99812"
                   className={inputClass}
                   value={manualPayData.reference}
                   onChange={(e) => setManualPayData({...manualPayData, reference: e.target.value})}
                />
             </div>
          </div>
          <button 
            onClick={confirmManualPayment}
            className="w-full py-4 md:py-5 bg-success text-white font-black uppercase tracking-widest rounded-xl md:rounded-2xl shadow-xl hover:bg-green-600 transition-all active:scale-95 text-xs"
          >
            Finalize Entry
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Fees;