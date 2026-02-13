
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { APP_NAME, MOCK_STUDENTS } from '../constants';

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

  // If the user was trying to login as Teacher or Driver and clicked register, 
  // ensure we respect that role if we're on the non-admin path.
  useEffect(() => {
    if (initialRole && !isAdminPath) {
      setRole(initialRole);
    }
  }, [initialRole, isAdminPath]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      try {
        // Validations
        if (formData.fullName.split(' ').length < 2) throw new Error("Please enter your full legal name (First & Last)");
        if (formData.phone.length < 10) throw new Error("Please enter a valid 10-digit phone number");
        if (formData.password.length < 6) throw new Error("Password must be at least 6 characters");

        if (role === UserRole.PARENT) {
          // Fix: Use admission_number instead of admissionNumber
          const student = MOCK_STUDENTS.find(s => s.admission_number === formData.admissionNo);
          if (!student) throw new Error("Invalid Admission ID. Student not found in active records.");
        }

        if (role === UserRole.ADMIN) {
          if (formData.adminKey !== 'SUPER-SECRET-2024') {
             throw new Error("Invalid Administrative Secret Key. Access denied.");
          }
        }

        onRegister({
          id: Math.random().toString(),
          fullName: formData.fullName,
          email: formData.email,
          role: role,
          admissionNumber: role === UserRole.PARENT ? formData.admissionNo : undefined,
          phoneNumber: formData.phone
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-700">
        
        {/* Left Side Branding */}
        <div className={`md:w-96 p-12 text-white flex flex-col justify-between relative overflow-hidden transition-colors ${role === UserRole.ADMIN ? 'bg-slate-800' : 'bg-primary'}`}>
           <div className="absolute inset-0 opacity-10">
              <div className="w-80 h-80 rounded-full border-[40px] border-white absolute -top-20 -left-20"></div>
              <div className="w-40 h-40 rounded-full border-[20px] border-white absolute bottom-10 right-10"></div>
           </div>
           
           <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/30 shadow-2xl">
                 <i className={`fas ${role === UserRole.ADMIN ? 'fa-shield-halved' : 'fa-user-plus'} text-2xl`}></i>
              </div>
              <h1 className="text-4xl font-black tracking-tighter leading-none mb-6">Join {APP_NAME}</h1>
              <p className="text-white/70 text-sm font-bold leading-relaxed">
                 {role === UserRole.ADMIN 
                  ? "Elevated administrative access for school management and fleet control."
                  : "Seamless transportation management for students, parents, and school staff."}
              </p>
           </div>

           <div className="relative z-10 mt-12 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success border border-success/30">
                    <i className="fas fa-check text-xs"></i>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Instant Verification</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success border border-success/30">
                    <i className="fas fa-lock text-xs"></i>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">GDPR Compliant</span>
              </div>
           </div>
        </div>

        {/* Right Side Form */}
        <div className="flex-1 p-12 md:p-16">
           <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                {isAdminPath ? "Admin Registration" : "Account Creation"}
              </h2>
              <button onClick={onBackToLogin} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline underline-offset-4 transition-all">
                 Return to Login
              </button>
           </div>

           {/* Conditional Role Selection Tabs */}
           {!isAdminPath ? (
             <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[1.25rem] mb-10 overflow-x-auto scrollbar-hide">
                <button onClick={() => setRole(UserRole.PARENT)} className={`min-w-[100px] flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.PARENT ? 'bg-white shadow-lg text-primary' : 'text-slate-400 hover:text-slate-600'}`}>Parent</button>
                <button onClick={() => setRole(UserRole.TEACHER)} className={`min-w-[100px] flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.TEACHER ? 'bg-white shadow-lg text-primary' : 'text-slate-400 hover:text-slate-600'}`}>Teacher</button>
                <button onClick={() => setRole(UserRole.DRIVER)} className={`min-w-[100px] flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.DRIVER ? 'bg-white shadow-lg text-primary' : 'text-slate-400 hover:text-slate-600'}`}>Driver</button>
             </div>
           ) : (
             <div className="mb-10 p-5 bg-slate-800 rounded-2xl flex items-center gap-4 border border-white/10 animate-in slide-in-from-left-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                   <i className="fas fa-user-shield"></i>
                </div>
                <div>
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Registering as</p>
                   <p className="text-sm font-black text-white tracking-tight uppercase">System Administrator</p>
                </div>
             </div>
           )}

           {error && (
             <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-[10px] font-black uppercase text-center mb-8 flex items-center justify-center gap-3 animate-bounce">
                <i className="fas fa-exclamation-circle"></i>
                {error}
             </div>
           )}

           <form onSubmit={handleRegister} className="space-y-6">
              {role === UserRole.ADMIN && (
                <div className="p-8 bg-slate-900 rounded-3xl border border-white/10 mb-8 animate-in slide-in-from-top-4">
                   <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-3 ml-1">Secret Access Key</label>
                   <div className="relative">
                      <i className="fas fa-key absolute left-5 top-1/2 -translate-y-1/2 text-white/20"></i>
                      <input 
                        required
                        type="password" 
                        value={formData.adminKey}
                        onChange={(e) => setFormData({...formData, adminKey: e.target.value})}
                        className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-white/5 border border-white/10 outline-none focus:ring-8 focus:ring-primary/5 font-black text-xl text-white tracking-widest shadow-inner"
                        placeholder="••••••••••••"
                      />
                   </div>
                   <p className="text-[9px] font-bold text-white/30 mt-3 ml-2 uppercase tracking-widest">Mandatory for Administrative verification</p>
                </div>
              )}

              {role === UserRole.PARENT && (
                <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 mb-8 animate-in slide-in-from-top-4">
                   <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-3 ml-1">Student Admission ID (Required)</label>
                   <div className="relative">
                      <i className="fas fa-id-card absolute left-5 top-1/2 -translate-y-1/2 text-primary/40"></i>
                      <input 
                        required
                        type="text" 
                        value={formData.admissionNo}
                        onChange={(e) => setFormData({...formData, admissionNo: e.target.value})}
                        className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border border-primary/20 bg-white outline-none focus:ring-8 focus:ring-primary/5 font-black text-xl text-primary tracking-widest shadow-inner"
                        placeholder="e.g. 1001"
                      />
                   </div>
                   <p className="text-[9px] font-bold text-primary/50 mt-3 ml-2 uppercase tracking-widest">Linking account to student file records.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                      placeholder="First Last"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Phone</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                      placeholder="00000 00000"
                    />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                 <input 
                   required
                   type="email" 
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                   placeholder="name@school.com"
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
                 <input 
                   required
                   type="password" 
                   value={formData.password}
                   onChange={(e) => setFormData({...formData, password: e.target.value})}
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none"
                   placeholder="••••••••"
                 />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-[1.5rem] text-white font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 mt-6 active:scale-[0.98] ${role === UserRole.ADMIN ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20' : 'bg-primary hover:bg-blue-800 shadow-primary/20'}`}
              >
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className={`fas ${role === UserRole.ADMIN ? 'fa-shield-halved' : 'fa-user-plus'}`}></i>}
                {role === UserRole.ADMIN ? 'Activate Admin Core' : 'Complete Registration'}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
