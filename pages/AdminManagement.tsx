import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useAdmin } from '../hooks/useAdmin';
import { UserRole } from '../types';
import { showToast, showAlert, showLoading, closeSwal, showConfirm } from '../lib/swal';

const AdminManagement: React.FC = () => {
  const { admins, loading, toggleAdminStatus, createAdmin } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: UserRole.ADMIN
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    showLoading('Creating Account...');
    
    const success = await createAdmin(formData);
    closeSwal();
    
    if (success) {
      setFormData({ fullName: '', email: '', password: '', role: UserRole.ADMIN });
      showToast('Bus admin account created', 'success');
    } else {
      setIsModalOpen(true);
      showAlert('Creation Failed', 'Could not create admin account. Please try again.', 'error');
    }
  };

  const handleToggleStatus = async (id: string, status: boolean, name: string) => {
    const action = status ? 'Activate' : 'Deactivate';
    const confirmed = await showConfirm(
      `${action} Account?`,
      `Are you sure you want to ${action.toLowerCase()} ${name}?`,
      action
    );
    
    if (confirmed) {
      showLoading('Updating Status...');
      const success = await toggleAdminStatus(id, status);
      closeSwal();
      if (success) {
        showToast(`Account ${action}d`, 'success');
      } else {
        showAlert('Update Failed', 'Could not update admin status. Please try again.', 'error');
      }
    }
  };

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-800 placeholder-slate-300 transition-all";
  const selectClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold bg-white text-slate-800 cursor-pointer transition-all";

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Access Control</h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">Manage Administrative Personnel</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 md:px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20 flex-shrink-0"
        >
          <i className="fas fa-user-shield"></i>
          <span className="hidden md:inline">Provision New Bus admin</span>
          <span className="md:hidden">New Admin</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-4">
            <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Permissions...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 md:p-20 text-center">
            <i className="fas fa-user-shield text-3xl md:text-4xl text-slate-200 mb-3 md:mb-4"></i>
            <p className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">No bus admins yet</p>
          </div>
        ) : (
          <>
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-50">
            {admins.map((admin) => (
              <div key={admin.id} className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black flex-shrink-0">
                  {admin.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-slate-800 tracking-tight text-sm truncate">{admin.fullName}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      admin.is_active ? 'bg-success/10 text-success' : 'bg-red-100 text-red-600'
                    }`}>
                      {admin.is_active ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 lowercase truncate mt-0.5">{admin.email}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{admin.role.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={() => handleToggleStatus(admin.id, !admin.is_active, admin.fullName)}
                  className={`text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl flex-shrink-0 ${
                    admin.is_active ? 'text-danger bg-danger/5' : 'text-success bg-success/5'
                  }`}
                >
                  {admin.is_active ? 'Off' : 'On'}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-5">Bus admin</th>
                  <th className="px-8 py-5">Email Address</th>
                  <th className="px-8 py-5">Role Level</th>
                  <th className="px-8 py-5 text-center">Account Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                          {admin.fullName.charAt(0)}
                        </div>
                        <span className="font-black text-slate-800 tracking-tight">{admin.fullName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-500 lowercase">{admin.email}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                        {admin.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        admin.is_active ? 'bg-success/10 text-success' : 'bg-red-100 text-red-600'
                      }`}>
                        {admin.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleToggleStatus(admin.id, !admin.is_active, admin.fullName)}
                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                          admin.is_active ? 'text-danger hover:bg-danger/10' : 'text-success hover:bg-success/10'
                        }`}
                      >
                        {admin.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision Bus admin" maxWidthClass="max-w-2xl" bodyClassName="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
            <input type="text" required className={inputClass} placeholder="Bus admin Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input type="email" required className={inputClass} placeholder="admin@school.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Role Level</label>
            <select className={selectClass} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}>
              <option value={UserRole.ADMIN}>Standard Bus admin</option>
              <option value={UserRole.SUPER_ADMIN}>Super Bus admin</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Initial Password</label>
            <input type="password" required className={inputClass} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="pt-6 flex flex-col md:flex-row gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">Create Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminManagement;