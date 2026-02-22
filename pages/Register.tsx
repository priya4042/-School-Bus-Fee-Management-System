import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { APP_NAME, MOCK_STUDENTS } from '../constants';
import { showToast } from '../lib/swal';
import { saveDBUser, getDBUsers } from '../lib/api';
import Modal from '../components/Modal';

interface RegisterProps {
  onRegister: (user: User) => void;
  onBackToLogin: () => void;
  initialRole?: UserRole;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onBackToLogin, initialRole }) => {
  const [role, setRole] = useState<UserRole>(initialRole === UserRole.ADMIN ? UserRole.ADMIN : UserRole.PARENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [regStep, setRegStep] = useState<'form' | 'verification' | 'success'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationCodeSecondary, setVerificationCodeSecondary] = useState('');
  const [pendingUser, setPendingUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    secondaryPhone: '', // For owner multi-phone support
    password: '',
    admissionNo: '',
    adminKey: ''
  });

  const [generatedOtp, setGeneratedOtp] = useState('');
  const [generatedOtpSecondary, setGeneratedOtpSecondary] = useState('');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePhone = (phone: string) => {
    return phone.length === 10;
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const normalizedEmail = formData.email.trim().toLowerCase();

    setTimeout(() => {
      try {
        if (!validateEmail(normalizedEmail)) throw new Error("Please enter a valid email address.");
        if (!validatePhone(formData.phone)) throw new Error("Primary mobile must be 10 digits.");
        if (formData.password.length < 6) throw new Error("Password must be 6+ characters.");

        if (role === UserRole.PARENT) {
          const dbStudents = JSON.parse(localStorage.getItem('db_students') || '[]');
          const allStudents = [...MOCK_STUDENTS, ...dbStudents];
          const student = allStudents.find(s => s.admission_number === formData.admissionNo);
          if (!student) throw new Error("Admission ID not found in school manifest.");
        } else if (role === UserRole.ADMIN) {
          if (formData.adminKey !== 'SUPER-SECRET-2025') {
            throw new Error("Invalid Fleet Security Token.");
          }
          if (!formData.secondaryPhone || !validatePhone(formData.secondaryPhone)) {
            throw new Error("Valid 10-digit secondary mobile required for Owner accounts.");
          }
          if (formData.phone === formData.secondaryPhone) {
            throw new Error("Primary and Secondary numbers must be different.");
          }
        }

        const existingUsers = getDBUsers();
        if (existingUsers.some((u: any) => u.email?.toLowerCase() === normalizedEmail)) {
           throw new Error("Email already registered.");
        }

        const newUser: any = {
          id: 'u-' + Math.random().toString(36).substr(2, 5),
          fullName: formData.fullName,
          email: normalizedEmail,
          phoneNumber: formData.phone,
          secondaryPhoneNumber: role === UserRole.ADMIN ? formData.secondaryPhone : undefined,
          password: formData.password,
          role: role,
          admissionNumber: role === UserRole.PARENT ? formData.admissionNo : undefined,
          verified: false,
          created_at: new Date().toISOString()
        };

        const otp1 = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp1);

        setPendingUser(newUser);
        setRegStep('verification');
        
        if (role === UserRole.ADMIN) {
          const otp2 = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedOtpSecondary(otp2);
          showToast(`Codes sent: Primary: ${otp1}, Secondary: ${otp2}`, 'info');
        } else {
          showToast(`Verification code sent: ${otp1}`, 'info');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const verifyOtp = () => {
    const isOwner = role === UserRole.ADMIN;
    
    if (verificationCode === generatedOtp && (!isOwner || verificationCodeSecondary === generatedOtpSecondary)) {
      setLoading(true);
      setTimeout(() => {
        saveDBUser({ ...pendingUser, verified: true });
        setRegStep('success');
        setLoading(false);
      }, 800);
    } else {
      const msg = isOwner 
        ? 'Verification failed. Both codes must match the generated values.' 
        : 'Incorrect code. Please check your messages.';
      showToast(msg, 'error');
    }
  };

  const toggleRole = () => {
     setRole(role === UserRole.PARENT ? UserRole.ADMIN : UserRole.PARENT);
     setError('');
     setFormData({ ...formData, adminKey: '', secondaryPhone: '', fullName: '', email: '', phone: '', password: '', admissionNo: '' });
  };

  if (regStep === 'success') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl animate-in zoom-in">
          <div className="w-20 h-20 bg-success text-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl">
            <i className="fas fa-check"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Account Initialized</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10 leading-loose">
            Authentication successfully verified for `{pendingUser?.email}`.
          </p>
          <button onClick={onBackToLogin} className="w-full py-5 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">Enter Hub</button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-5 py-4 rounded-xl bg-primary/5 border border-primary/20 outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 placeholder-slate-400";
  const ownerInputClass = "w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 placeholder-slate-400";

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
                {role === UserRole.ADMIN ? 'Setup multi-device owner authentication.' : 'Connect your family to the transport core.'}
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

           <form onSubmit={handleInitialSubmit} className="space-y-6">
              {role === UserRole.ADMIN && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fleet Security Token</label>
                   <input required type="password" value={formData.adminKey} onChange={(e) => setFormData({...formData, adminKey: e.target.value})} className={ownerInputClass.replace('text-sm', 'text-base font-black')} placeholder="••••••••" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {role === UserRole.PARENT && (
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission ID</label>
                      <input required type="text" value={formData.admissionNo} onChange={(e) => setFormData({...formData, admissionNo: e.target.value})} className={inputClass} placeholder="1001" />
                   </div>
                 )}
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                    <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className={role === UserRole.PARENT ? inputClass : ownerInputClass} placeholder="e.g. John Smith" />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={role === UserRole.PARENT ? inputClass : ownerInputClass} placeholder="owner@fleet.com" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Mobile</label>
                    <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className={role === UserRole.PARENT ? inputClass : ownerInputClass} placeholder="9876543210" />
                 </div>
              </div>

              {role === UserRole.ADMIN && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Secondary Mobile (Backup Auth)</label>
                  <input required type="tel" value={formData.secondaryPhone} onChange={(e) => setFormData({...formData, secondaryPhone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className={ownerInputClass} placeholder="Alternate Number" />
                </div>
              )}

              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Password</label>
                 <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={role === UserRole.PARENT ? inputClass : ownerInputClass} placeholder="••••••••" />
              </div>

              <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-[0.98] ${role === UserRole.ADMIN ? 'bg-slate-900 shadow-slate-900/20' : 'bg-primary shadow-primary/20'}`}>
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Initialize Hub Access'}
              </button>
           </form>

           <div className="mt-8 text-center pt-6 border-t border-slate-50">
              <button onClick={toggleRole} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors">
                {role === UserRole.PARENT ? 'Apply for Owner Status' : 'Return to Parent Onboarding'}
              </button>
           </div>
        </div>
      </div>

      <Modal isOpen={regStep === 'verification'} onClose={() => setRegStep('form')} title="Dual-Device Security Check">
        <div className="space-y-6 py-4 text-center">
            {role === UserRole.ADMIN ? (
              <div className="space-y-8">
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Code sent to Primary: {formData.phone}</p>
                  <input type="text" autoFocus value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full py-4 rounded-2xl border-2 border-primary text-center text-xl font-black tracking-[0.4em] text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" placeholder="••••••" />
                </div>
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Code sent to Secondary: {formData.secondaryPhone}</p>
                  <input type="text" value={verificationCodeSecondary} onChange={(e) => setVerificationCodeSecondary(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full py-4 rounded-2xl border-2 border-slate-900 text-center text-xl font-black tracking-[0.4em] text-slate-900 focus:ring-4 focus:ring-primary/10 outline-none transition-all" placeholder="••••••" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter the 6-digit code sent to your mobile (Demo: 123456)</p>
                <input type="text" autoFocus value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full py-5 rounded-2xl border-2 border-primary text-center text-2xl font-black tracking-[0.5em] text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" placeholder="••••••" />
              </div>
            )}
            
            <button 
              onClick={verifyOtp} 
              disabled={loading || verificationCode.length !== 6 || (role === UserRole.ADMIN && verificationCodeSecondary.length !== 6)} 
              className="w-full py-5 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl"
            >
              Verify All Channels
            </button>
        </div>
      </Modal>
    </div>
  );
};

export default Register;