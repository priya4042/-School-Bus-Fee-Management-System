import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useAdmin } from '../hooks/useAdmin';
import { UserRole } from '../types';

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
    const success = await createAdmin(formData);
    if (success) {
      setIsModalOpen(false);
      setFormData({ fullName: '', email: '', password: '', role: UserRole.ADMIN });
    }
  };

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-800 placeholder-slate-300 transition-all";
  const selectClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold bg-white text-slate-800 cursor-pointer transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Access Control</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Manage Administrative Personnel</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
        >
          <i className="fas fa-user-shield"></i>
          Provision New Admin
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Permissions...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-5">Administrator</th>
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
                        onClick={() => toggleAdminStatus(admin.id, !admin.is_active)}
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
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision Administrator">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
            <input type="text" required className={inputClass} placeholder="Admin Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input type="email" required className={inputClass} placeholder="admin@school.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Role Level</label>
            <select className={selectClass} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}>
              <option value={UserRole.ADMIN}>Standard Admin</option>
              <option value={UserRole.SUPER_ADMIN}>Super Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Initial Password</label>
            <input type="password" required className={inputClass} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="pt-6 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">Create Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminManagement;