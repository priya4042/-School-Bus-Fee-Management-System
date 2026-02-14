
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { APP_NAME, MOCK_STUDENTS } from '../constants';
import { showAlert } from '../lib/swal';

interface RegisterProps {
  onRegister: (user: User) => void;
  onBackToLogin: () => void;
  initialRole?: UserRole;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onBackToLogin, initialRole }) => {
  const isAdminPath = initialRole === UserRole.ADMIN;
  const [role, setRole] = useState<UserRole>(initialRole || UserRole.PARENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    admissionNo: '',
    staffId: '',
    licenseNo: '',
    adminKey: ''
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      try {
        if (formData.fullName.split(' ').length < 2) throw new Error("Full Legal Name is required (First & Last).");
        if (formData.password.length < 6) throw new Error("Security Requirement: Password must be 6+ characters.");

        if (role === UserRole.PARENT) {
          const student = MOCK_STUDENTS.find(s => s.admission_number === formData.admissionNo);
          if (!student) throw new Error("Admission ID Verification Failed: Student not found in academic database.");
        }

        if (role === UserRole.TEACHER && !formData.staffId) {
          throw new Error("Staff ID is required for Teacher registration.");
        }

        if (role === UserRole.DRIVER && !formData.licenseNo) {
          throw new Error("Commercial License Number is required for Driver registration.");
        }

        if (role === UserRole.ADMIN && formData.adminKey !== 'SUPER-SECRET-2024') {
          throw new Error("Invalid Administrative Protocol: Secret Key is incorrect.");
        }

        const newUser: any = {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password,
          role: role,
          admissionNumber: role === UserRole.PARENT ? formData.admissionNo : undefined,
          staffId: [UserRole.TEACHER, UserRole.ADMIN].includes(role) ? formData.staffId : undefined,
          licenseNo: role === UserRole.DRIVER ? formData.licenseNo : undefined
        };

        const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        
        if (existingUsers.some((u: any) => u.email === newUser.email)) {
           throw new Error("Duplicate Account: This email is already registered.");
        }
        
        if (newUser.phoneNumber && existingUsers.some((u: any) => u.phoneNumber === newUser.phoneNumber)) {
           throw new Error("Duplicate Account: This mobile number is already registered.");
        }

        existingUsers.push(newUser);
        localStorage.setItem('registered_users', JSON.stringify(existingUsers));

        showAlert('Profile Activated', `Welcome to ${APP_NAME}. Your authorized ${role.toLowerCase()} profile is now active.`, 'success');
        onRegister(newUser);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black font-sans">
      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-700">
        <div className={`md:w-96 p-12 text-white flex flex-col justify-between relative overflow-hidden transition-colors ${role === UserRole.ADMIN ? 'bg-slate-800' : 'bg-primary'}`}>
           <div className="absolute inset-0 opacity-10">
              <div className="w-80 h-80 rounded-full border-[40px] border-white absolute -top-20 -left-20"></div>
           </div>
           <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/30 shadow-2xl">
                 <i className={`fas ${role === UserRole.ADMIN ? 'fa-shield-halved' : 'fa-user-plus'} text-2xl`}></i>
              </div>
              <h1 className="text-4xl font-black tracking-tighter leading-none mb-6">Join {APP_NAME}</h1>
              <p className="text-white/70 text-sm font-bold leading-relaxed opacity-80">
                 {role === UserRole.ADMIN 
                  ? "Elevated administrative core provisioning."
                  : "Seamless enterprise fleet management for authorized staff and families."}
              </p>
           </div>
           <div className="relative z-10 mt-12 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success border border-success/30">
                    <i className="fas fa-check text-xs"></i>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Biometric Readiness</span>
              </div>
           </div>
        </div>

        <div className="flex-1 p-12 md:p-16">
           <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                {isAdminPath ? "Admin Core Provisioning" : "Enlist Profile"}
              </h2>
              <button onClick={onBackToLogin} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline underline-offset-4 transition-all">
                 Return to Terminal
              </button>
           </div>

           {!isAdminPath && (
             <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[1.25rem] mb-10 overflow-x-auto scrollbar-hide">
                <button onClick={() => {setRole(UserRole.PARENT); setError('');}} className={`min-w-[100px] flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.PARENT ? 'bg-white shadow-lg text-primary' : 'text-slate-400 hover:text-slate-600'}`}>Parent</button>
                <button onClick={() => {setRole(UserRole.TEACHER); setError('');}} className={`min-w-[100px] flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.TEACHER ? 'bg-white shadow-lg text-primary' : 'text-slate-400 hover:text-slate-600'}`}>Teacher</button>
                <button onClick={() => {setRole(UserRole.DRIVER); setError('');}} className={`min-w-[100px] flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.DRIVER ? 'bg-white shadow-lg text-primary' : 'text-slate-400 hover:text-slate-600'}`}>Driver</button>
             </div>
           )}

           {error && (
             <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-[10px] font-black uppercase text-center mb-8 animate-bounce">
                {error}
             </div>
           )}

           <form onSubmit={handleRegister} className="space-y-6">
              {role === UserRole.ADMIN && (
                <div className="p-8 bg-slate-900 rounded-3xl border border-white/10 mb-8">
                   <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-3 ml-1">Admin Protocol Secret Key</label>
                   <input 
                     required
                     type="password" 
                     value={formData.adminKey}
                     onChange={(e) => setFormData({...formData, adminKey: e.target.value})}
                     className="w-full px-6 py-5 rounded-[1.5rem] bg-white/5 border border-white/10 outline-none font-black text-xl text-white tracking-widest"
                     placeholder="••••••••••••"
                   />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {role === UserRole.PARENT && (
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Admission ID</label>
                      <input 
                        required
                        type="text" 
                        value={formData.admissionNo}
                        onChange={(e) => setFormData({...formData, admissionNo: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                        placeholder="e.g. 1001"
                      />
                   </div>
                 )}
                 {role === UserRole.TEACHER && (
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Staff ID</label>
                       <input 
                         required
                         type="text" 
                         value={formData.staffId}
                         onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                         className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                         placeholder="T-0000X"
                       />
                    </div>
                 )}
                 {role === UserRole.DRIVER && (
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commercial License No.</label>
                       <input 
                         required
                         type="text" 
                         value={formData.licenseNo}
                         onChange={(e) => setFormData({...formData, licenseNo: e.target.value})}
                         className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                         placeholder="DL-XXXXXXXXX"
                       />
                    </div>
                 )}
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                      placeholder="John Smith"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Email</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                      placeholder="name@portal.com"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Contact</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                      placeholder="98765 43210"
                    />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Password</label>
                 <input 
                   required
                   type="password" 
                   value={formData.password}
                   onChange={(e) => setFormData({...formData, password: e.target.value})}
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                   placeholder="••••••••"
                 />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-[1.5rem] text-white font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 mt-6 active:scale-[0.98] ${role === UserRole.ADMIN ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20' : 'bg-primary hover:bg-blue-800 shadow-primary/20'}`}
              >
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className={`fas ${role === UserRole.ADMIN ? 'fa-shield-halved' : 'fa-user-plus'}`}></i>}
                {role === UserRole.ADMIN ? 'Authorize Admin Core' : 'Activate Profile'}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
