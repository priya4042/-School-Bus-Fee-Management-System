import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { showToast, showLoading, closeSwal, showAlert, showConfirm } from '../lib/swal';
import { MONTHS } from '../constants';
import { useStudents } from '../hooks/useStudents';
import { useFees } from '../hooks/useFees';
import Modal from '../components/Modal';

const FEE_SETTINGS_KEY = 'busway_fee_settings_v1';

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Fees: React.FC = () => {
  const { dues, loading: duesLoading, fetchDues, markAsPaid, sendNotification, createFee, updateFee, waiveLateFee } = useFees();
  const { students } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDue, setEditingDue] = useState<any>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    due_date: new Date().toISOString().split('T')[0],
    last_date: new Date().toISOString().split('T')[0],
    fine_after_days: 5,
    fine_per_day: 50,
    sendNotification: true
  });

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [policyDefaults, setPolicyDefaults] = useState({
    cutoffDay: 10,
    gracePeriod: 2,
    dailyPenalty: 50,
  });

  const dueDateForPreview = formData.due_date ? new Date(formData.due_date) : null;
  const fineStartDateForPreview = dueDateForPreview
    ? new Date(dueDateForPreview.getTime() + Math.max(0, formData.fine_after_days) * 24 * 60 * 60 * 1000)
    : null;
  const previewDailyFine = Math.max(0, Number(formData.fine_per_day || 0));
  const previewFineDay1 = previewDailyFine;
  const previewFineDay3 = previewDailyFine * 3;
  const previewFineDay7 = previewDailyFine * 7;

  const applyPolicyDefaultsToForm = (month: number, year: number) => {
    const dueDate = new Date(year, Math.max(0, month - 1), policyDefaults.cutoffDay);
    const lastDate = new Date(dueDate);
    lastDate.setDate(lastDate.getDate() + policyDefaults.gracePeriod);

    setFormData((prev) => ({
      ...prev,
      due_date: toISODate(dueDate),
      last_date: toISODate(lastDate),
      fine_after_days: policyDefaults.gracePeriod,
      fine_per_day: policyDefaults.dailyPenalty,
    }));
  };

  useEffect(() => {
    try {
      const local = localStorage.getItem(FEE_SETTINGS_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        setPolicyDefaults({
          cutoffDay: Number(parsed.cutoffDay || 10),
          gracePeriod: Number(parsed.gracePeriod || 2),
          dailyPenalty: Number(parsed.dailyPenalty || 50),
        });
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!editingDue) {
      applyPolicyDefaultsToForm(formData.month, formData.year);
    }
  }, [policyDefaults]);

  const handleEdit = (due: any) => {
    setEditingDue(due);
    setFormData({
      student_id: due.student_id,
      month: due.month,
      year: due.year,
      amount: due.amount,
      due_date: due.due_date ? due.due_date.split('T')[0] : '',
      last_date: due.last_date ? due.last_date.split('T')[0] : '',
      fine_after_days: due.fine_after_days !== undefined ? due.fine_after_days : 5,
      fine_per_day: due.fine_per_day !== undefined ? due.fine_per_day : 50,
      sendNotification: false
    });
    setIsModalOpen(true);
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData(prev => ({
        ...prev,
        student_id: studentId,
        amount: student.monthly_fee || 0
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id) {
      showAlert('Error', 'Please select a student', 'error');
      return;
    }
    if (formData.amount <= 0) {
      showAlert('Error', 'Fee amount must be greater than 0', 'error');
      return;
    }
    if (!formData.due_date) {
      showAlert('Error', 'Please set a due date', 'error');
      return;
    }

    showLoading(editingDue ? 'Updating Fee...' : 'Generating Fee...');
    const success = editingDue 
      ? await updateFee(editingDue.id, formData)
      : await createFee(formData);
    closeSwal();

    if (success) {
      showToast(editingDue ? 'Fee updated successfully' : 'Fee generated successfully', 'success');
      setIsModalOpen(false);
      setEditingDue(null);
      setFormData({
        student_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: 0,
        due_date: new Date().toISOString().split('T')[0],
        last_date: new Date().toISOString().split('T')[0],
        fine_after_days: 5,
        fine_per_day: 50,
        sendNotification: true
      });
      fetchDues();
    } else {
      showAlert('Error', 'Check browser console (F12) for detailed error. Common issues: fee already exists for this month/student, invalid dates, or database error.', 'error');
    }
  };

  const handleMarkPaid = async (id: string) => {
    const confirmed = await showConfirm('Mark as Paid?', 'This will record the payment and update the status to PAID.', 'Confirm');
    if (confirmed) {
      showLoading('Updating Status...');
      const success = await markAsPaid(id);
      closeSwal();
      if (success) {
        showToast('Status updated successfully', 'success');
      } else {
        showAlert('Error', 'Failed to update status', 'error');
      }
    }
  };

  const handleManualNotify = async (id: string) => {
    showLoading('Sending Notification...');
    const success = await sendNotification(id);
    closeSwal();
    if (success) {
      showToast('Notification sent successfully', 'success');
    } else {
      showAlert('Error', 'Failed to send notification', 'error');
    }
  };

  const handleWaiveLateFee = async (id: string) => {
    const confirmed = await showConfirm(
      'Waive Late Fee?',
      'This will remove the current late fine from this due record.',
      'Waive Fine'
    );
    if (!confirmed) return;

    showLoading('Applying waiver...');
    const success = await waiveLateFee(id);
    closeSwal();
    if (success) {
      showToast('Late fee waived successfully', 'success');
    } else {
      showAlert('Error', 'Failed to waive late fee', 'error');
    }
  };

  const filteredDues = dues.filter(d => 
    (d.student_name || d.students?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.admission_number || d.students?.admission_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = "w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Fee Management</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Monitor collections and generate monthly dues</p>
        </div>
        <button 
          onClick={() => {
            setEditingDue(null);
            applyPolicyDefaultsToForm(formData.month, formData.year);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
        >
          <i className="fas fa-magic"></i>
          Generate Monthly Dues
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-premium">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search by student name or admission number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 rounded-2xl border border-primary/20 bg-primary/5 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Filter Status:</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5"
            >
              <option value="ALL">All Dues</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue Only</option>
            </select>
          </div>
        </div>

        <div className="responsive-table-container">
          {duesLoading ? (
            <div className="flex flex-col items-center justify-center h-80">
              <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
            </div>
          ) : (
            <table className="w-full text-left responsive-table">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Student</th>
                  <th className="px-8 py-5">Month/Year</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDues.filter(d => {
                  if (statusFilter === 'ALL') return true;
                  if (statusFilter === 'OVERDUE') return d.status === 'OVERDUE' || (d.status !== 'PAID' && d.late_fee > 0);
                  return d.status === statusFilter;
                }).map((due) => (
                  <tr key={due.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 tracking-tight text-sm">{due.student_name || due.students?.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Adm: {due.admission_number || due.students?.admission_number}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-600 uppercase">{MONTHS[due.month-1]} {due.year}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-800">₹{due.total_due || (due.amount + (due.late_fee || 0))}</p>
                        {due.late_fee > 0 && (
                          <p className="text-[9px] font-black text-danger uppercase tracking-widest">Incl. ₹{due.late_fee} Late Fee</p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        due.status === 'PAID'
                          ? 'bg-success/10 text-success border-success/10'
                          : due.status === 'OVERDUE'
                            ? 'bg-danger/10 text-danger border-danger/10'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {due.status}
                      </span>
                      {due.paid_at && (
                        <p className="text-[9px] text-slate-400 mt-1 font-bold">{new Date(due.paid_at).toLocaleDateString()}</p>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {due.status !== 'PAID' && (
                          <>
                            <button 
                              onClick={() => handleMarkPaid(due.id)}
                              className="p-2 text-success hover:bg-success/10 rounded-lg transition-all"
                              title="Mark as Paid"
                            >
                              <i className="fas fa-check-circle"></i>
                            </button>
                            <button 
                              onClick={() => handleEdit(due)}
                              className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                              title="Edit Fee"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              onClick={() => handleManualNotify(due.id)}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                              title="Send Notification"
                            >
                              <i className="fas fa-bell"></i>
                            </button>
                            {Number(due.late_fee || 0) > 0 && (
                              <button
                                onClick={() => handleWaiveLateFee(due.id)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Waive Late Fee (Admin Only)"
                              >
                                <i className="fas fa-hand-holding-usd"></i>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingDue(null); }} title={editingDue ? "Edit Fee Record" : "Generate Monthly Due"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Select Student</label>
            <select 
              value={formData.student_id}
              onChange={(e) => handleStudentChange(e.target.value)}
              className={inputClass}
              required
              disabled={!!editingDue}
            >
              <option value="">Choose a student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Month</label>
              <select 
                value={formData.month}
                onChange={(e) => {
                  const month = Number(e.target.value);
                  setFormData({...formData, month});
                  if (!editingDue) {
                    applyPolicyDefaultsToForm(month, formData.year);
                  }
                }}
                className={inputClass}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Year</label>
              <input 
                type="number" 
                value={formData.year}
                onChange={(e) => {
                  const year = Number(e.target.value);
                  setFormData({...formData, year});
                  if (!editingDue) {
                    applyPolicyDefaultsToForm(formData.month, year);
                  }
                }}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Bus Fee Amount (₹)</label>
            <input 
              type="number" 
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Due Date</label>
              <input 
                type="date" 
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Last Date (Before Fine)</label>
              <input 
                type="date" 
                value={formData.last_date}
                onChange={(e) => setFormData({...formData, last_date: e.target.value})}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fine After Days</label>
              <input 
                type="number" 
                value={formData.fine_after_days}
                onChange={(e) => setFormData({...formData, fine_after_days: Number(e.target.value)})}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Fine Per Day (₹)</label>
              <input 
                type="number" 
                value={formData.fine_per_day}
                onChange={(e) => setFormData({...formData, fine_per_day: Number(e.target.value)})}
                className={inputClass}
              />
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Fine Preview</p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Fine starts on:{' '}
              <span className="text-slate-900">
                {fineStartDateForPreview ? fineStartDateForPreview.toLocaleDateString('en-IN') : 'Select due date'}
              </span>
            </p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Day 1: <span className="text-slate-900">₹{previewFineDay1}</span> • Day 3: <span className="text-slate-900">₹{previewFineDay3}</span> • Day 7: <span className="text-slate-900">₹{previewFineDay7}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="sendNotification"
              checked={formData.sendNotification}
              onChange={(e) => setFormData({...formData, sendNotification: e.target.checked})}
              className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
            />
            <label htmlFor="sendNotification" className="text-xs font-bold text-slate-600 uppercase tracking-widest cursor-pointer">
              Send Notification to Parent
            </label>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
            >
              {editingDue ? "Update Fee Record" : "Generate Fee Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Fees;
