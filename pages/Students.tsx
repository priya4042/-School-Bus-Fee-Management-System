import React, { useState } from 'react';
import Modal from '../components/Modal.tsx';
import { useStudents } from '../hooks/useStudents.ts';
import { useRoutes } from '../hooks/useRoutes.ts';
import { showConfirm, showToast, showAlert, showLoading, closeSwal } from '../lib/swal.ts';

const Students: React.FC = () => {
  const { students, loading, addStudent } = useStudents();
  const { routes } = useRoutes();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    admission_number: '',
    class_name: '',
    section: '',
    route_id: 0,
    parent_name: '',
    parent_phone: '',
    parent_email: ''
  });

  const filteredStudents = (students || []).filter(s => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (s.full_name || '').toLowerCase().includes(term) || 
           (s.admission_number || '').toLowerCase().includes(term) ||
           (s.parent_name || '').toLowerCase().includes(term);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.route_id === 0) {
      showAlert('Selection Required', 'Please assign a fleet route.', 'warning');
      return;
    }
    
    showLoading('Syncing Records...');
    const success = await addStudent(formData);
    closeSwal();
    
    if (success) {
      setIsModalOpen(false);
      setFormData({ full_name: '', admission_number: '', class_name: '', section: '', route_id: 0, parent_name: '', parent_phone: '', parent_email: '' });
      showToast('Student & Guardian linked', 'success');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirm('Remove Student?', `Archive record for ${name}?`, 'Deactivate');
    if (confirmed) showToast('Record deactivated', 'info');
  };

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm transition-all text-slate-800 placeholder-slate-400";
  const selectClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm bg-white transition-all text-slate-800 cursor-pointer";

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">Student Directory</h2>
          <p className="text-secondary font-bold uppercase text-[10px] tracking-widest">Global Enrollment & Parent Mapping</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
        >
          <i className="fas fa-plus"></i>
          Register Student
        </button>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
          <div className="relative max-w-md">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search by student or parent name..." 
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
                  <th className="px-8 py-5">Parent / Guardian</th>
                  <th className="px-8 py-5">Contact Details</th>
                  <th className="px-8 py-5">Class-Section</th>
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
                      <p className="text-xs font-black text-slate-600 uppercase tracking-tight">{student.parent_name || 'Not Linked'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{student.parent_phone || '---'}</p>
                      <p className="text-[10px] text-slate-400 lowercase">{student.parent_email}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                        {student.class_name}-{student.section}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-primary rounded-xl transition-all shadow-sm"><i className="fas fa-edit text-xs"></i></button>
                        <button onClick={() => handleDelete(student.id, student.full_name)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-danger rounded-xl transition-all shadow-sm"><i className="fas fa-trash-alt text-xs"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Student">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">Academic Profile</h4>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Student Legal Name</label>
              <input type="text" required className={inputClass} placeholder="e.g. Rahul Verma" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" required className={inputClass} placeholder="Admission ID" value={formData.admission_number} onChange={(e) => setFormData({...formData, admission_number: e.target.value})} />
              <select required className={selectClass} value={formData.route_id} onChange={(e) => setFormData({...formData, route_id: Number(e.target.value)})}>
                <option value={0}>Select Route...</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" required className={inputClass} placeholder="Grade (5th)" value={formData.class_name} onChange={(e) => setFormData({...formData, class_name: e.target.value})} />
              <input type="text" required className={inputClass + " uppercase"} placeholder="Section" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-success uppercase tracking-[0.2em] border-b border-success/10 pb-2">Guardian Linkage</h4>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Parent Name</label>
              <input type="text" required className={inputClass.replace('bg-primary/5', 'bg-success/5').replace('border-primary/20', 'border-success/20').replace('focus:border-primary', 'focus:border-success').replace('focus:ring-primary/10', 'focus:ring-success/10')} placeholder="Father/Mother Name" value={formData.parent_name} onChange={(e) => setFormData({...formData, parent_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="tel" required className={inputClass} placeholder="Mobile Number" value={formData.parent_phone} onChange={(e) => setFormData({...formData, parent_phone: e.target.value})} />
              <input type="email" required className={inputClass} placeholder="Guardian Email" value={formData.parent_email} onChange={(e) => setFormData({...formData, parent_email: e.target.value})} />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all active:scale-95">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">Authorize Entry</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;