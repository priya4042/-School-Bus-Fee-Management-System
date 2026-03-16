import React, { useState } from 'react';
import Modal from '../components/Modal.tsx';
import { useStudents } from '../hooks/useStudents.ts';
import { useRoutes } from '../hooks/useRoutes.ts';
import { useBuses } from '../hooks/useBuses.ts';
import { useFees } from '../hooks/useFees.ts';
import FeeManagement from './Fees.tsx';
import { MONTHS } from '../constants.ts';
import { showConfirm, showToast, showAlert, showLoading, closeSwal } from '../lib/swal.ts';

const toMonthInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getCurrentFinancialYearRange = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
  return {
    startPeriod: `${startYear}-03`,
    endPeriod: `${startYear + 1}-02`,
  };
};

const parseMonthInput = (value: string) => {
  const [yearStr, monthStr] = String(value || '').split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month || month < 1 || month > 12) return null;
  return { year, month };
};

const buildDateFromPeriod = (period: string, day: number) => {
  const parsed = parseMonthInput(period);
  if (!parsed) return null;
  const maxDay = new Date(parsed.year, parsed.month, 0).getDate();
  const safeDay = Math.min(Math.max(1, day), maxDay);
  const month = String(parsed.month).padStart(2, '0');
  const dayStr = String(safeDay).padStart(2, '0');
  return `${parsed.year}-${month}-${dayStr}`;
};

const Students: React.FC = () => {
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { routes } = useRoutes();
  const { buses } = useBuses();
  const { dues, createFee, createFeesForYear } = useFees();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStudentForFees, setSelectedStudentForFees] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<'students' | 'fees'>('students');
  
  const [formData, setFormData] = useState({
    full_name: '',
    admission_number: '',
    grade: '',
    section: '',
    route_id: '',
    bus_id: '',
    parent_name: '',
    parent_phone: '',
    boarding_point: '',
    monthly_fee: 0,
    status: 'active' as any
  });

  const [feeSetupData, setFeeSetupData] = useState({
    enabled: true,
    billingMode: 'yearly' as 'monthly' | 'yearly',
    amount: 0,
    monthlyPeriod: toMonthInputValue(new Date()),
    startPeriod: toMonthInputValue(new Date()),
    endPeriod: toMonthInputValue(new Date(new Date().getFullYear(), new Date().getMonth() + 11, 1)),
    due_date_day: 10,
    last_date_day: 12,
    fine_after_days: 5,
    fine_per_day: 50,
  });

  // Removed fetchParents useEffect as it's no longer needed

  const filteredStudents = (students || []).filter(s => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (s.full_name || '').toLowerCase().includes(term) || 
           (s.admission_number || '').toLowerCase().includes(term);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsModalOpen(false);
    showLoading('Syncing Records...');
    let result;
    
    if (editingId) {
      result = await updateStudent(editingId, formData);
    } else {
      result = await addStudent(formData);
    }

    if (result.success && !editingId && feeSetupData.enabled) {
      if (!result.studentId) {
        closeSwal();
        resetForm();
        showAlert('Student Added, Fee Setup Failed', 'Could not resolve student ID for automatic fee setup.', 'warning');
        return;
      }

      const feeAmount = Number(feeSetupData.amount || formData.monthly_fee || 0);
      if (feeSetupData.billingMode === 'monthly') {
        const dueDate = buildDateFromPeriod(feeSetupData.monthlyPeriod, Number(feeSetupData.due_date_day || 10));
        const lastDate = buildDateFromPeriod(feeSetupData.monthlyPeriod, Number(feeSetupData.last_date_day || 12));
        const parsed = parseMonthInput(feeSetupData.monthlyPeriod);

        if (!dueDate || !lastDate || !parsed) {
          closeSwal();
          resetForm();
          showAlert('Student Added, Fee Setup Failed', 'Invalid monthly billing period selected.', 'warning');
          return;
        }

        const monthlySuccess = await createFee({
          student_id: result.studentId,
          month: parsed.month,
          year: parsed.year,
          amount: feeAmount,
          due_date: dueDate,
          last_date: lastDate,
          fine_after_days: Number(feeSetupData.fine_after_days || 5),
          fine_per_day: Number(feeSetupData.fine_per_day || 50),
        });

        closeSwal();
        resetForm();

        if (!monthlySuccess) {
          showAlert(
            'Student Added, Monthly Fee Failed',
            `${formData.full_name} was added, but monthly fee creation failed. You can create it from Students -> Fee Management.`,
            'warning'
          );
          return;
        }

        showAlert(
          'Success',
          `${formData.full_name} added and monthly fee created for ${feeSetupData.monthlyPeriod}.`,
          'success'
        );
        return;
      }

      const feeResult = await createFeesForYear({
        student_id: result.studentId,
        amount: feeAmount,
        due_date_day: Number(feeSetupData.due_date_day || 10),
        last_date_day: Number(feeSetupData.last_date_day || 12),
        fine_after_days: Number(feeSetupData.fine_after_days || 5),
        fine_per_day: Number(feeSetupData.fine_per_day || 50),
        startPeriod: feeSetupData.startPeriod,
        endPeriod: feeSetupData.endPeriod,
      });

      closeSwal();

      if (!feeResult.success) {
        resetForm();
        showAlert(
          'Student Added, Fee Setup Failed',
          `${formData.full_name} was added successfully, but initial fee generation failed: ${feeResult.message}`,
          'warning'
        );
        return;
      }

      resetForm();
      showAlert(
        'Success',
        `${formData.full_name} added and fee records generated successfully. ${feeResult.message}`,
        'success'
      );
      return;
    }

    closeSwal();

    if (result.success) {
      resetForm();
      showToast(editingId ? 'Student updated' : 'Student registered', 'success');
    } else {
      setIsModalOpen(true);
      showAlert('Error', result.error || 'Failed to save student record.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      admission_number: '',
      grade: '',
      section: '',
      route_id: '',
      bus_id: '',
      parent_name: '',
      parent_phone: '',
      boarding_point: '',
      monthly_fee: 0,
      status: 'active'
    });
    setFeeSetupData({
      enabled: true,
      billingMode: 'yearly',
      amount: 0,
      monthlyPeriod: toMonthInputValue(new Date()),
      startPeriod: toMonthInputValue(new Date()),
      endPeriod: toMonthInputValue(new Date(new Date().getFullYear(), new Date().getMonth() + 11, 1)),
      due_date_day: 10,
      last_date_day: 12,
      fine_after_days: 5,
      fine_per_day: 50,
    });
    setEditingId(null);
  };

  const handleEdit = (student: any) => {
    setFormData({
      full_name: student.full_name,
      admission_number: student.admission_number,
      grade: student.grade,
      section: student.section,
      route_id: student.route_id || '',
      bus_id: student.bus_id || '',
      parent_name: student.profiles?.full_name || student.parent_name || '',
      parent_phone: student.profiles?.phone_number || student.parent_phone || '',
      boarding_point: student.boarding_point || '',
      monthly_fee: student.monthly_fee || student.base_fee || 0,
      status: student.status || 'active'
    });
    setEditingId(student.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirm(
      'Archive Student?',
      `Archive ${name} and remove from active admin/parent modules? Historical records will remain available in Reports.`,
      'Archive'
    );
    if (confirmed) {
      showLoading('Archiving Student...');
      const result = await deleteStudent(id);
      closeSwal();
      if (result.success) showToast('Student archived successfully', 'info');
      else showAlert('Error', result.error || 'Failed to archive student record', 'error');
    }
  };

  const handleViewFees = (student: any) => {
    setSelectedStudentForFees(student);
    setIsFeeModalOpen(true);
  };

  const getStudentFees = (studentId: string) => {
    return dues.filter(due => due.student_id === studentId).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  };

  const calculateTotalDue = (fees: any[]) => {
    return fees.reduce((sum, fee) => sum + (Number(fee.total_due) || Number(fee.amount) || 0), 0);
  };

  const calculateTotalPaid = (fees: any[]) => {
    return fees.filter(f => f.status === 'PAID').reduce((sum, fee) => sum + (Number(fee.total_due) || Number(fee.amount) || 0), 0);
  };

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm transition-all text-slate-800 placeholder-slate-400";
  const selectClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm bg-white transition-all text-slate-800 cursor-pointer";

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {activeSection === 'students' ? (
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">Student & Fee Management</h2>
            <p className="text-secondary font-bold uppercase text-[10px] tracking-widest">Enrollment, Fleet Mapping, Monthly & Financial Year Fees</p>
          </div>
        ) : <div />}
        <div className="flex gap-3">
          <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveSection('students')}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSection === 'students' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500'}`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveSection('fees')}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSection === 'fees' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500'}`}
            >
              Fee Management
            </button>
          </div>
          {activeSection === 'students' && (
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
            >
              <i className="fas fa-plus"></i>
              Register Student
            </button>
          )}
        </div>
      </div>

      {activeSection === 'fees' ? (
        <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-premium p-2 md:p-4">
          <FeeManagement />
        </div>
      ) : (

      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
          <div className="relative max-w-md">
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
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80">
              <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
            </div>
          ) : (
            <table className="w-full text-left responsive-table">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Student Identity</th>
                  <th className="px-8 py-5">Class-Section</th>
                  <th className="px-8 py-5">Route / Bus</th>
                  <th className="px-8 py-5">Parent Info</th>
                  <th className="px-8 py-5">Fee (Monthly)</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 tracking-tight text-sm">{student.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Adm: {student.admission_number}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                        {student.grade}-{student.section}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-slate-600 uppercase tracking-tight">{student.routes?.route_name || 'No Route'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{student.buses?.plate || 'No Bus'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-700">{student.profiles?.full_name || student.parent_name || 'Unassigned'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{student.profiles?.phone_number || student.parent_phone || ''}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-800">₹{student.monthly_fee || student.base_fee || 0}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleViewFees(student)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm" title="View Yearly Fees"><i className="fas fa-receipt text-xs"></i></button>
                        <button onClick={() => handleEdit(student)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-primary rounded-xl transition-all shadow-sm" title="Edit Student"><i className="fas fa-edit text-xs"></i></button>
                        <button onClick={() => handleDelete(student.id, student.full_name)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-danger rounded-xl transition-all shadow-sm" title="Archive Student"><i className="fas fa-trash-alt text-xs"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Student" : "Register New Student"} maxWidthClass="max-w-5xl" bodyClassName="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">Academic Profile</h4>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Student Legal Name</label>
              <input type="text" required className={inputClass} placeholder="e.g. Rahul Verma" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Admission Number</label>
                <input type="text" required className={inputClass} placeholder="Adm No" value={formData.admission_number} onChange={(e) => setFormData({...formData, admission_number: e.target.value})} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Monthly Fee (₹)</label>
                <input
                  type="number"
                  required
                  className={inputClass}
                  placeholder="Fee"
                  value={formData.monthly_fee}
                  onChange={(e) => {
                    const monthlyFee = Number(e.target.value);
                    setFormData({ ...formData, monthly_fee: monthlyFee });
                    setFeeSetupData((prev) => ({ ...prev, amount: monthlyFee }));
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" required className={inputClass} placeholder="Grade (e.g. 5th)" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} />
              <input type="text" required className={inputClass + " uppercase"} placeholder="Section" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-success uppercase tracking-[0.2em] border-b border-success/10 pb-2">Fleet Mapping</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Parent Name</label>
                <input type="text" className={inputClass} placeholder="Parent Full Name" value={formData.parent_name} onChange={(e) => setFormData({...formData, parent_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Parent Phone</label>
                <input type="tel" className={inputClass} placeholder="Phone Number" value={formData.parent_phone} onChange={(e) => setFormData({...formData, parent_phone: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Assigned Route</label>
                <select required className={selectClass} value={formData.route_id} onChange={(e) => setFormData({...formData, route_id: e.target.value})}>
                  <option value="">Select Route...</option>
                  {routes.map(r => <option key={r.id} value={r.id}>{r.route_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Assigned Bus</label>
                <select required className={selectClass} value={formData.bus_id} onChange={(e) => setFormData({...formData, bus_id: e.target.value})}>
                  <option value="">Select Bus...</option>
                  {buses.map(b => <option key={b.id} value={b.id}>{b.plate}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Boarding Point</label>
              <input type="text" className={inputClass} placeholder="e.g. Main Gate, Sector 4" value={formData.boarding_point} onChange={(e) => setFormData({...formData, boarding_point: e.target.value})} />
            </div>
          </div>

          {!editingId && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-100 pb-2">Initial Fee Setup</h4>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feeSetupData.enabled}
                  onChange={(e) => setFeeSetupData({ ...feeSetupData, enabled: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Generate fee records during student registration
                </span>
              </label>

              {feeSetupData.enabled && (
                <>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Billing Mode</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFeeSetupData({ ...feeSetupData, billingMode: 'monthly' })}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${feeSetupData.billingMode === 'monthly' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-200'}`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeSetupData({ ...feeSetupData, billingMode: 'yearly' })}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${feeSetupData.billingMode === 'yearly' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-200'}`}
                      >
                        Financial Year
                      </button>
                    </div>
                  </div>

                  {feeSetupData.billingMode === 'monthly' ? (
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Billing Month</label>
                      <input
                        type="month"
                        className={inputClass}
                        value={feeSetupData.monthlyPeriod}
                        onChange={(e) => setFeeSetupData({ ...feeSetupData, monthlyPeriod: e.target.value })}
                        required={feeSetupData.enabled}
                      />
                    </div>
                  ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        const fy = getCurrentFinancialYearRange();
                        setFeeSetupData({
                          ...feeSetupData,
                          startPeriod: fy.startPeriod,
                          endPeriod: fy.endPeriod,
                        });
                      }}
                      className="w-full py-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                    >
                      Use Current Financial Year (Mar-Feb)
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Start Month</label>
                        <input
                          type="month"
                          className={inputClass}
                          value={feeSetupData.startPeriod}
                          onChange={(e) => setFeeSetupData({ ...feeSetupData, startPeriod: e.target.value })}
                          required={feeSetupData.enabled}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">End Month</label>
                        <input
                          type="month"
                          className={inputClass}
                          value={feeSetupData.endPeriod}
                          onChange={(e) => setFeeSetupData({ ...feeSetupData, endPeriod: e.target.value })}
                          required={feeSetupData.enabled}
                        />
                      </div>
                    </div>
                  </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Due Date Day</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className={inputClass}
                        value={feeSetupData.due_date_day}
                        onChange={(e) => setFeeSetupData({ ...feeSetupData, due_date_day: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Last Date Day</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className={inputClass}
                        value={feeSetupData.last_date_day}
                        onChange={(e) => setFeeSetupData({ ...feeSetupData, last_date_day: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fine After Days</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={feeSetupData.fine_after_days}
                        onChange={(e) => setFeeSetupData({ ...feeSetupData, fine_after_days: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fine Per Day (₹)</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={feeSetupData.fine_per_day}
                        onChange={(e) => setFeeSetupData({ ...feeSetupData, fine_per_day: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    {feeSetupData.billingMode === 'monthly'
                      ? `Auto plan: create one due for ${feeSetupData.monthlyPeriod} at ₹${Number(feeSetupData.amount || formData.monthly_fee || 0)}.`
                      : `Auto plan: monthly dues from ${feeSetupData.startPeriod} to ${feeSetupData.endPeriod} at ₹${Number(feeSetupData.amount || formData.monthly_fee || 0)} per month.`}
                  </p>
                </>
              )}
            </div>
          )}

          <div className="pt-4 flex flex-col md:flex-row gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all active:scale-95">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">
              {editingId ? 'Update Record' : 'Authorize Entry'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isFeeModalOpen} onClose={() => setIsFeeModalOpen(false)} title={selectedStudentForFees ? `Yearly Fees - ${selectedStudentForFees.full_name} (Adm: ${selectedStudentForFees.admission_number})` : "Yearly Fees"} maxWidthClass="max-w-6xl" bodyClassName="p-6 md:p-8">
        {selectedStudentForFees && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Total Due</p>
                <p className="text-2xl font-black text-slate-800">₹{calculateTotalDue(getStudentFees(selectedStudentForFees.id)).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-success/5 border border-success/10 rounded-2xl p-4">
                <p className="text-[9px] font-black text-success uppercase tracking-widest mb-2">Total Paid</p>
                <p className="text-2xl font-black text-slate-800">₹{calculateTotalPaid(getStudentFees(selectedStudentForFees.id)).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2">Pending</p>
                <p className="text-2xl font-black text-slate-800">₹{(calculateTotalDue(getStudentFees(selectedStudentForFees.id)) - calculateTotalPaid(getStudentFees(selectedStudentForFees.id))).toLocaleString('en-IN')}</p>
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
                  {getStudentFees(selectedStudentForFees.id).length > 0 ? (
                    getStudentFees(selectedStudentForFees.id).map((fee: any) => (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-bold">
                        No fees created for this student yet
                      </td>
                    </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsFeeModalOpen(false)}
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

export default Students;
