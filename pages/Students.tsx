
import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useStudents } from '../hooks/useStudents';
import { useRoutes } from '../hooks/useRoutes';
import { showConfirm, showToast, showAlert, showLoading, closeSwal } from '../lib/swal';

const Students: React.FC = () => {
  const { students, loading, addStudent } = useStudents();
  const { routes } = useRoutes();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    admission_number: '',
    class_name: '',
    section: '',
    route_id: 0
  });

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.admission_number.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.route_id === 0) {
      showAlert('Selection Required', 'Please assign a fleet route to the student.', 'warning');
      return;
    }
    
    showLoading('Registering Student...');
    const success = await addStudent(formData);
    closeSwal();
    
    if (success) {
      setIsModalOpen(false);
      setFormData({ full_name: '', admission_number: '', class_name: '', section: '', route_id: 0 });
      showToast('Student registered successfully', 'success');
    } else {
      showAlert('Error', 'Failed to register student. Please check if the Admission ID is unique.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirm(
      'Remove Student?', 
      `Are you sure you want to remove ${name} from the manifest?`,
      'Deactivate'
    );
    if (confirmed) {
      showToast('Student record deactivated', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">Student Directory</h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">Manage registrations and fleet details</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <button 
            onClick={() => setIsBulkOpen(true)}
            className="bg-white border-2 border-slate-100 text-slate-600 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
          >
            <i className="fas fa-file-excel text-success"></i>
            Bulk Import
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
          >
            <i className="fas fa-plus"></i>
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-premium overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="relative">
            <i className="fas fa-search absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search by name or admission ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 md:pl-16 pr-6 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-slate-700"
            />
          </div>
        </div>

        <div className="responsive-table-container">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Records...</p>
            </div>
          ) : (
            <table className="w-full text-left responsive-table">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-6 md:px-8 py-4 md:py-5">Student Identity</th>
                  <th className="px-6 md:px-8 py-4 md:py-5">ID / Adm.</th>
                  <th className="px-6 md:px-8 py-4 md:py-5">Class-Section</th>
                  <th className="px-6 md:px-8 py-4 md:py-5">Assigned Route</th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-center">Status</th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 md:px-8 py-4 md:py-5">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black group-hover:scale-110 transition-transform text-sm">
                          {student.full_name.charAt(0)}
                        </div>
                        <span className="font-black text-slate-800 tracking-tight text-sm">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-4 md:py-5 font-black text-slate-400 text-[10px] md:text-xs tracking-widest">{student.admission_number}</td>
                    <td className="px-6 md:px-8 py-4 md:py-5 font-bold text-slate-600 uppercase text-[10px] md:text-xs">{student.class_name}-{student.section}</td>
                    <td className="px-6 md:px-8 py-4 md:py-5">
                      <span className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-slate-200">
                        {student.route_name || 'KNG-01'}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-4 md:py-5 text-center">
                      <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/10">
                        ACTIVE
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-4 md:py-5 text-right">
                      <div className="flex justify-end gap-2 md:gap-3">
                        <button className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30 rounded-lg md:rounded-xl transition-all shadow-sm">
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id, student.full_name)}
                          className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-danger hover:border-danger/30 rounded-lg md:rounded-xl transition-all shadow-sm"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                       <i className="fas fa-users-slash text-3xl text-slate-200 mb-4"></i>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching students</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Student">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Legal Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 outline-none font-bold text-sm"
              placeholder="e.g. John Smith"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Admission ID</label>
              <input 
                type="text" 
                required
                className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 outline-none font-black text-primary text-sm"
                placeholder="10XX"
                value={formData.admission_number}
                onChange={(e) => setFormData({...formData, admission_number: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Grade</label>
              <input 
                type="text"
                required
                className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 outline-none font-bold uppercase text-sm"
                placeholder="e.g. 5th"
                value={formData.class_name}
                onChange={(e) => setFormData({...formData, class_name: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Section</label>
              <input 
                type="text"
                required
                className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 outline-none font-bold uppercase text-sm"
                placeholder="A"
                value={formData.section}
                onChange={(e) => setFormData({...formData, section: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Assign Route</label>
              <select 
                required
                className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 outline-none font-bold bg-white text-sm"
                value={formData.route_id}
                onChange={(e) => setFormData({...formData, route_id: Number(e.target.value)})}
              >
                <option value={0}>Select Route...</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="w-full py-3 md:py-4 bg-slate-100 text-slate-600 font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-xl md:rounded-2xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="w-full py-3 md:py-4 bg-primary text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 transition-all hover:bg-blue-800"
            >
              Register Student
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
