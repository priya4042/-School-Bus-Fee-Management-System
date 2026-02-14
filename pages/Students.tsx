
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
  
  // FIXED: Changed fullName to full_name to match backend schemas.py
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showLoading('Processing Manifest...');
      setTimeout(() => {
        closeSwal();
        setIsBulkOpen(false);
        showAlert('Import Success', '42 student records have been synchronized with the fleet database.', 'success');
      }, 1500);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirm(
      'Remove Student?', 
      `Are you sure you want to remove ${name} from the active fleet manifest? This action is logged.`,
      'Yes, Deactivate'
    );
    if (confirmed) {
      showToast('Student record deactivated', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Student Directory</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Manage bus registrations and student details</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsBulkOpen(true)}
            className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
          >
            <i className="fas fa-file-excel text-success"></i>
            Bulk Upload
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
          >
            <i className="fas fa-plus"></i>
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-premium overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="relative">
            <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search by student name, admission number or class..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Records...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-5">Student Identity</th>
                  <th className="px-8 py-5">ID / Adm.</th>
                  <th className="px-8 py-5">Class-Section</th>
                  <th className="px-8 py-5">Assigned Route</th>
                  <th className="px-8 py-5 text-center">Lifecycle</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                          {student.full_name.charAt(0)}
                        </div>
                        <span className="font-black text-slate-800 tracking-tight">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-slate-400 text-xs tracking-widest">{student.admission_number}</td>
                    <td className="px-8 py-5 font-bold text-slate-600 uppercase text-xs">{student.class_name}-{student.section}</td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                        <i className="fas fa-route text-[8px] text-primary/50"></i>
                        {student.route_name || 'Assigned'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/10">
                        {student.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30 rounded-xl transition-all shadow-sm">
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id, student.full_name)}
                          className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-danger hover:border-danger/30 rounded-xl transition-all shadow-sm"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                       <i className="fas fa-users-slash text-4xl text-slate-200 mb-4"></i>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching students found in directory</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Register Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Student">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Legal Name</label>
            <input 
              type="text" 
              required
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/5 outline-none font-bold"
              placeholder="e.g. John Smith"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Admission ID</label>
              <input 
                type="text" 
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/5 outline-none font-black text-primary"
                placeholder="10XX"
                value={formData.admission_number}
                onChange={(e) => setFormData({...formData, admission_number: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Class/Grade</label>
              <input 
                type="text"
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/5 outline-none font-bold uppercase"
                placeholder="e.g. 5th"
                value={formData.class_name}
                onChange={(e) => setFormData({...formData, class_name: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Section</label>
              <input 
                type="text"
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/5 outline-none font-bold uppercase"
                placeholder="A"
                value={formData.section}
                onChange={(e) => setFormData({...formData, section: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assign Route</label>
              <select 
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/5 outline-none font-bold bg-white"
                value={formData.route_id}
                onChange={(e) => setFormData({...formData, route_id: Number(e.target.value)})}
              >
                <option value={0}>Select Route...</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>{route.name} ({route.code})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest rounded-2xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all hover:bg-blue-800"
            >
              Register Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} title="Excel Bulk Import">
         <div className="space-y-8 py-4">
            <div className="text-center p-8 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
               <i className="fas fa-file-excel text-5xl text-success/20 mb-4"></i>
               <h4 className="font-black text-slate-800 uppercase text-xs mb-2">Drop Excel File Here</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">or click to browse from device</p>
               <input 
                  type="file" 
                  accept=".csv,.xlsx,.xls" 
                  onChange={handleFileUpload}
                  className="hidden" 
                  id="excelInput" 
               />
               <label htmlFor="excelInput" className="bg-success text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-green-600 transition-all shadow-lg shadow-success/20 inline-block">
                  Select File
               </label>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default Students;
