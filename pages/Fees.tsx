import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { showToast, showLoading, closeSwal, showAlert, showConfirm } from '../lib/swal';
import { MONTHS } from '../constants';
import { useStudents } from '../hooks/useStudents';
import { useFees } from '../hooks/useFees';
import Modal from '../components/Modal';
import { FEE_SETTINGS_UPDATED_EVENT, loadFeeSettings } from '../lib/feeSettings';

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toMonthInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const parseMonthInput = (value: string) => {
  const [yearStr, monthStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month || month < 1 || month > 12) return null;
  return { year, month };
};

const monthSequenceCount = (startPeriod: string, endPeriod: string) => {
  const start = parseMonthInput(startPeriod);
  const end = parseMonthInput(endPeriod);
  if (!start || !end) return 0;
  const startIndex = start.year * 12 + (start.month - 1);
  const endIndex = end.year * 12 + (end.month - 1);
  if (endIndex < startIndex) return 0;
  return endIndex - startIndex + 1;
};

const formatPeriodLabel = (period: string) => {
  const parsed = parseMonthInput(period);
  if (!parsed) return period;
  return `${MONTHS[parsed.month - 1]} ${parsed.year}`;
};

const Fees: React.FC = () => {
  const { dues, loading: duesLoading, fetchDues, markAsPaid, sendNotification, createFee, createFeesForYear, updateFee, waiveLateFee } = useFees();
  const { students } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkYearModalOpen, setIsBulkYearModalOpen] = useState(false);
  const [isStudentFeesModalOpen, setIsStudentFeesModalOpen] = useState(false);
  const [selectedStudentForFeesView, setSelectedStudentForFeesView] = useState<any>(null);
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

  const [bulkYearFormData, setBulkYearFormData] = useState({
    student_id: '',
    amount: 0,
    due_date_day: 10,
    last_date_day: 12,
    fine_after_days: 5,
    fine_per_day: 50,
    startPeriod: toMonthInputValue(new Date()),
    endPeriod: toMonthInputValue(new Date(new Date().getFullYear(), new Date().getMonth() + 11, 1)),
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
    const applyPolicy = () => {
      const parsed = loadFeeSettings();
      setPolicyDefaults({
        cutoffDay: Number(parsed.cutoffDay || 10),
        gracePeriod: Number(parsed.gracePeriod || 2),
        dailyPenalty: Number(parsed.dailyPenalty || 50),
      });
    };

    applyPolicy();
    const onSettingsUpdated = () => applyPolicy();
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'busway_fee_settings_v1') applyPolicy();
    };

    window.addEventListener(FEE_SETTINGS_UPDATED_EVENT, onSettingsUpdated as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(FEE_SETTINGS_UPDATED_EVENT, onSettingsUpdated as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!editingDue) {
      applyPolicyDefaultsToForm(formData.month, formData.year);
    }
  }, [policyDefaults]);

  // Get unique students with their fee data
  const getUniqueStudentsWithFees = () => {
    const studentMap = new Map();
    
    dues.forEach(due => {
      if (!studentMap.has(due.student_id)) {
        const student = students.find(s => s.id === due.student_id);
        if (student) {
          studentMap.set(due.student_id, {
            ...student,
            studentDues: []
          });
        }
      }
      studentMap.get(due.student_id)?.studentDues.push(due);
    });

    return Array.from(studentMap.values());
  };

  const getStudentTotalDue = (studentDues: any[]) => {
    return studentDues.reduce((sum, due) => sum + (Number(due.total_due) || Number(due.amount) || 0), 0);
  };

  const getStudentPaidAmount = (studentDues: any[]) => {
    return studentDues.filter(d => d.status === 'PAID').reduce((sum, due) => sum + (Number(due.total_due) || Number(due.amount) || 0), 0);
  };

  const getStudentPendingAmount = (studentDues: any[]) => {
    const total = getStudentTotalDue(studentDues);
    const paid = getStudentPaidAmount(studentDues);
    return total - paid;
  };

  const getStudentOverdueCount = (studentDues: any[]) => {
    return studentDues.filter(d => d.status === 'OVERDUE').length;
  };

  const getStudentPaidCount = (studentDues: any[]) => {
    return studentDues.filter(d => d.status === 'PAID').length;
  };

  const handleViewStudentFees = (student: any) => {
    setSelectedStudentForFeesView(student);
    setIsStudentFeesModalOpen(true);
  };

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

  const handleBulkYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkYearFormData.student_id) {
      showAlert('Error', 'Please select a student', 'error');
      return;
    }
    if (bulkYearFormData.amount <= 0) {
      showAlert('Error', 'Fee amount must be greater than 0', 'error');
      return;
    }
    if (monthSequenceCount(bulkYearFormData.startPeriod, bulkYearFormData.endPeriod) <= 0) {
      showAlert('Error', 'End period must be on or after start period', 'error');
      return;
    }

    showLoading('Creating fees for selected months...');
    const result = await createFeesForYear(bulkYearFormData);
    closeSwal();

    if (result.success) {
      showAlert(
        'Success',
        `${result.message}\nCreated: ${result.created} | Skipped: ${result.skipped}`,
        'success'
      );
      setIsBulkYearModalOpen(false);
      setBulkYearFormData({
        student_id: '',
        amount: 0,
        due_date_day: 10,
        last_date_day: 12,
        fine_after_days: 5,
        fine_per_day: 50,
        startPeriod: toMonthInputValue(new Date()),
        endPeriod: toMonthInputValue(new Date(new Date().getFullYear(), new Date().getMonth() + 11, 1)),
      });
      fetchDues();
    } else {
      showAlert('Error', result.message, 'error');
    }
  };

  const handleBulkYearStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setBulkYearFormData(prev => ({
        ...prev,
        student_id: studentId,
        amount: student.monthly_fee || 0
      }));
    }
  };

  const filteredDues = dues.filter(d => 
    (d.student_name || d.students?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.admission_number || d.students?.admission_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueStudentsFiltered = getUniqueStudentsWithFees().filter(student => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (student.full_name || '').toLowerCase().includes(term) ||
           (student.admission_number || '').toLowerCase().includes(term);
  });

  const inputClass = "w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Fee Management</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Monitor collections and generate monthly dues</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
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
          <button 
            onClick={() => setIsBulkYearModalOpen(true)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
          >
            <i className="fas fa-calendar-alt"></i>
            Generate Year Fees
          </button>
        </div>
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
                  <th className="px-8 py-5">Adm. No</th>
                  <th className="px-8 py-5">Grade/Section</th>
                  <th className="px-8 py-5">Total Due</th>
                  <th className="px-8 py-5">Paid / Pending</th>
                  <th className="px-8 py-5">Status Summary</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {uniqueStudentsFiltered.length > 0 ? (
                  uniqueStudentsFiltered.map((student) => {
                    const totalDue = getStudentTotalDue(student.studentDues);
                    const paidAmount = getStudentPaidAmount(student.studentDues);
                    const pendingAmount = getStudentPendingAmount(student.studentDues);
                    const overdueCount = getStudentOverdueCount(student.studentDues);
                    const paidCount = getStudentPaidCount(student.studentDues);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-black text-slate-800 tracking-tight text-sm">{student.full_name}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{student.admission_number}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                            {student.grade}-{student.section}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-lg font-black text-slate-800">₹{totalDue.toLocaleString('en-IN')}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="space-y-1">
                            <p className="text-xs font-black text-success">✓ ₹{paidAmount.toLocaleString('en-IN')}</p>
                            <p className="text-xs font-black text-danger">⏳ ₹{pendingAmount.toLocaleString('en-IN')}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/10">
                              {paidCount} Paid
                            </span>
                            {overdueCount > 0 && (
                              <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-danger/10 text-danger border border-danger/10">
                                {overdueCount} Overdue
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleViewStudentFees(student)}
                              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                              title="View All Fees"
                            >
                              <i className="fas fa-list text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-8 text-center text-slate-400 font-bold">
                      No fees created yet. Use "Generate Monthly Dues" or "Generate Year Fees" to create fees.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingDue(null); }} title={editingDue ? "Edit Fee Record" : "Generate Monthly Due"} maxWidthClass="max-w-3xl" bodyClassName="p-6 md:p-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <Modal isOpen={isBulkYearModalOpen} onClose={() => setIsBulkYearModalOpen(false)} title="Generate Fees for Complete Year" maxWidthClass="max-w-4xl" bodyClassName="p-6 md:p-8">
        <form onSubmit={handleBulkYearSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Select Student</label>
            <select 
              value={bulkYearFormData.student_id}
              onChange={(e) => handleBulkYearStudentChange(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Choose a student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Month</label>
              <input
                type="month"
                value={bulkYearFormData.startPeriod}
                onChange={(e) => setBulkYearFormData({ ...bulkYearFormData, startPeriod: e.target.value })}
                className={inputClass}
                required
              />
              <p className="text-[9px] text-slate-400 mt-1 italic">Pick first billing month (for example March 2026)</p>
            </div>
            <div>
              <label className={labelClass}>End Month</label>
              <input
                type="month"
                value={bulkYearFormData.endPeriod}
                onChange={(e) => setBulkYearFormData({ ...bulkYearFormData, endPeriod: e.target.value })}
                className={inputClass}
                required
              />
              <p className="text-[9px] text-slate-400 mt-1 italic">Can be next year (for example February 2027)</p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Bus Fee Amount (₹)</label>
            <input 
              type="number" 
              value={bulkYearFormData.amount}
              onChange={(e) => setBulkYearFormData({...bulkYearFormData, amount: Number(e.target.value)})}
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Due Date Day (e.g., 10)</label>
              <input 
                type="number" 
                min="1" 
                max="31"
                value={bulkYearFormData.due_date_day}
                onChange={(e) => setBulkYearFormData({...bulkYearFormData, due_date_day: Number(e.target.value)})}
                className={inputClass}
                required
              />
              <p className="text-[9px] text-slate-400 mt-1 italic">Fees will be due on this day of each month</p>
            </div>
            <div>
              <label className={labelClass}>Last Date Day (e.g., 12)</label>
              <input 
                type="number" 
                min="1" 
                max="31"
                value={bulkYearFormData.last_date_day}
                onChange={(e) => setBulkYearFormData({...bulkYearFormData, last_date_day: Number(e.target.value)})}
                className={inputClass}
                required
              />
              <p className="text-[9px] text-slate-400 mt-1 italic">Fine starts after this day</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fine After Days</label>
              <input 
                type="number" 
                value={bulkYearFormData.fine_after_days}
                onChange={(e) => setBulkYearFormData({...bulkYearFormData, fine_after_days: Number(e.target.value)})}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Fine Per Day (₹)</label>
              <input 
                type="number" 
                value={bulkYearFormData.fine_per_day}
                onChange={(e) => setBulkYearFormData({...bulkYearFormData, fine_per_day: Number(e.target.value)})}
                className={inputClass}
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Summary</p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Creating fees for <span className="text-slate-900 text-sm">{monthSequenceCount(bulkYearFormData.startPeriod, bulkYearFormData.endPeriod)} months</span>
            </p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Range: <span className="text-slate-900">{formatPeriodLabel(bulkYearFormData.startPeriod)} - {formatPeriodLabel(bulkYearFormData.endPeriod)}</span>
            </p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Fee per month: <span className="text-slate-900">₹{bulkYearFormData.amount}</span>
            </p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Total amount: <span className="text-slate-900 text-sm">₹{bulkYearFormData.amount * monthSequenceCount(bulkYearFormData.startPeriod, bulkYearFormData.endPeriod)}</span>
            </p>
          </div>

          <div className="pt-4 flex flex-col md:flex-row gap-3">
            <button 
              type="button"
              onClick={() => setIsBulkYearModalOpen(false)}
              className="flex-1 bg-slate-200 text-slate-800 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
            >
              Create {monthSequenceCount(bulkYearFormData.startPeriod, bulkYearFormData.endPeriod)} Fees
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isStudentFeesModalOpen} onClose={() => setIsStudentFeesModalOpen(false)} title={selectedStudentForFeesView ? `All Monthly Fees - ${selectedStudentForFeesView.full_name}` : "Student Fees"} maxWidthClass="max-w-6xl" bodyClassName="p-6 md:p-8">
        {selectedStudentForFeesView && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Total Due</p>
                <p className="text-2xl font-black text-slate-800">₹{getStudentTotalDue(selectedStudentForFeesView.studentDues).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-success/5 border border-success/10 rounded-2xl p-4">
                <p className="text-[9px] font-black text-success uppercase tracking-widest mb-2">Total Paid</p>
                <p className="text-2xl font-black text-slate-800">₹{getStudentPaidAmount(selectedStudentForFeesView.studentDues).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2">Pending</p>
                <p className="text-2xl font-black text-slate-800">₹{getStudentPendingAmount(selectedStudentForFeesView.studentDues).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Fees Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden max-h-96 flex flex-col">
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 sticky top-0">
                      <th className="px-4 py-3 text-left">Month/Year</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Total Due</th>
                      <th className="px-4 py-3 text-left">Paid Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                  {selectedStudentForFeesView.studentDues.sort((a: any, b: any) => {
                    if (a.year !== b.year) return b.year - a.year;
                    return b.month - a.month;
                  }).map((fee: any) => (
                    <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-700">{MONTHS[fee.month - 1]} {fee.year}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-black text-slate-800">₹{Number(fee.amount).toLocaleString('en-IN')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          fee.status === 'PAID'
                            ? 'bg-success/10 text-success border-success/10'
                            : fee.status === 'OVERDUE'
                              ? 'bg-danger/10 text-danger border-danger/10'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">₹{(Number(fee.total_due) || Number(fee.amount)).toLocaleString('en-IN')}</p>
                        {fee.late_fee > 0 && (
                          <p className="text-[9px] font-bold text-danger">+₹{Number(fee.late_fee).toLocaleString('en-IN')} Fine</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[9px] font-bold text-slate-600">
                          {fee.paid_at ? new Date(fee.paid_at).toLocaleDateString('en-IN') : '-'}
                        </p>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsStudentFeesModalOpen(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Fees;
