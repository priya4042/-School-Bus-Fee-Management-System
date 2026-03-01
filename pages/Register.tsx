import React, { useState } from 'react';
import { UserRole } from '../types';
import { APP_NAME } from '../constants';
import { showToast } from '../lib/swal';
import { useAuthStore } from '../store/authStore';

interface RegisterProps {
  onRegister: (user: any) => void;
  onBackToLogin: () => void;
  initialRole?: UserRole;
}

const Register: React.FC<RegisterProps> = ({ onBackToLogin, initialRole }) => {
  const [role, setRole] = useState<UserRole>(initialRole || UserRole.PARENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [regStep, setRegStep] = useState<'form' | 'success'>('form');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    admissionNo: '',
    adminKey: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.password.length < 8) throw new Error("Password must be at least 8 characters.");

      const { registerAdmin, registerParent } = useAuthStore.getState();

      if (role === UserRole.ADMIN) {
        await registerAdmin({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          secret: formData.adminKey
        });
      } else {
        await registerParent({
          admissionNumber: formData.admissionNo,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
      }

      setRegStep('success');
      showToast('Account created successfully!', 'success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = () => {
     setRole(role === UserRole.PARENT ? UserRole.ADMIN : UserRole.PARENT);
     setError('');
  };

  if (regStep === 'success') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl animate-in zoom-in">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl">
            <i className="fas fa-check"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Registration Complete</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10 leading-loose">
            Your account has been successfully created. You can now log in.
          </p>
          <button onClick={onBackToLogin} className="w-full py-5 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">Go to Login</button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-5 py-4 rounded-xl bg-primary/5 border border-primary/20 outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 placeholder-slate-400";
  const adminInputClass = "w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 placeholder-slate-400";

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-y-auto">
      <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-500">
        <div className={`md:w-80 p-12 text-white flex flex-col justify-between transition-colors ${role === UserRole.ADMIN ? 'bg-slate-950' : 'bg-primary'}`}>
           <div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                 <i className={`fas ${role === UserRole.ADMIN ? 'fa-shield-halved' : 'fa-user-plus'} text-xl`}></i>
              </div>
              <h1 className="text-3xl font-black tracking-tighter leading-none mb-4 uppercase">Enrollment Hub</h1>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                {role === UserRole.ADMIN ? 'Setup administrator authentication.' : 'Connect your family to the transport core.'}
              </p>
           </div>
        </div>

        <div className="flex-1 p-8 md:p-12">
           <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Registration</h2>
              <button onClick={onBackToLogin} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">
                 <i className="fas fa-arrow-left mr-2"></i> Exit
              </button>
           </div>

           {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[9px] font-black uppercase mb-8 border border-red-100">{error}</div>}

           <form onSubmit={handleRegister} className="space-y-6">
              {role === UserRole.ADMIN && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Master Admin Secret</label>
                   <input required type="password" value={formData.adminKey} onChange={(e) => setFormData({...formData, adminKey: e.target.value})} className={adminInputClass.replace('text-sm', 'text-base font-black')} placeholder="••••••••" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {role === UserRole.PARENT && (
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Number</label>
                      <input required type="text" value={formData.admissionNo} onChange={(e) => setFormData({...formData, admissionNo: e.target.value})} className={inputClass} placeholder="Enter Admission Number" />
                   </div>
                 )}
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className={role === UserRole.PARENT ? inputClass : adminInputClass} placeholder="e.g. John Smith" />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={role === UserRole.PARENT ? inputClass : adminInputClass} placeholder="parent@example.com" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                    <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className={role === UserRole.PARENT ? inputClass : adminInputClass} placeholder="9876543210" />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Password</label>
                 <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={role === UserRole.PARENT ? inputClass : adminInputClass} placeholder="••••••••" />
              </div>

              <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-[0.98] ${role === UserRole.ADMIN ? 'bg-slate-900 shadow-slate-900/20' : 'bg-primary shadow-primary/20'}`}>
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Create Account'}
              </button>
           </form>

           <div className="mt-8 text-center pt-6 border-t border-slate-50">
              <button onClick={toggleRole} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors">
                Switch to {role === UserRole.PARENT ? 'Admin' : 'Parent'} Registration
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
