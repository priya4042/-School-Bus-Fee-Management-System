import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { APP_NAME } from '../constants';
import { showToast } from '../lib/swal';
import { useAuthStore } from '../store/authStore';
import { otpService } from '../services/otpService';
import { userService } from '../services/userService';
import { useLanguage } from '../lib/i18n';

interface RegisterProps {
  onRegister: (user: any) => void;
  onBackToLogin: () => void;
  initialRole?: UserRole;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onBackToLogin, initialRole }) => {
  const { lang, setLang, t } = useLanguage();
  const [role, setRole] = useState<UserRole>(initialRole || UserRole.PARENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLangPicker, setShowLangPicker] = useState(() => !localStorage.getItem('app_language'));

  const [regStep, setRegStep] = useState<'form' | 'success'>('form');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [devOtpValue, setDevOtpValue] = useState('');
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    admissionNo: '',
    adminKey: '',
  });

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDevOtpHint('');
    setDevOtpValue('');

    try {
      if (formData.password.length < 8) throw new Error("Password must be at least 8 characters.");
      if (!formData.phone || formData.phone.length < 10) throw new Error("Please enter a valid 10-digit phone number.");
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) throw new Error("Please enter a valid email address.");
      if (role === UserRole.PARENT && !formData.admissionNo) throw new Error("Please enter the student's Admission Number.");

      // Check phone uniqueness
      const phoneCheck = await userService.checkUserExists(formData.phone, 'PHONE');
      if (phoneCheck.exists) throw new Error(phoneCheck.message || 'Phone number already registered');

      // Check email uniqueness
      const emailCheck = await userService.checkUserExists(formData.email, 'EMAIL');
      if (emailCheck.exists) throw new Error(emailCheck.message || 'Email already registered');

      if (role === UserRole.PARENT) {
        const admissionCheck = await userService.checkUserExists(formData.admissionNo, 'ADMISSION');
        // valid: false means admission number not in DB
        if (admissionCheck.valid === false) throw new Error(admissionCheck.message || 'Admission number not found');
        if (admissionCheck.exists) throw new Error(admissionCheck.message || 'Admission number already registered');
      }

      const res = role === UserRole.PARENT
        ? await otpService.sendOTP(formData.phone, formData.admissionNo)
        : await otpService.sendForgotPasswordOTP(formData.phone, 'ADMIN');
      if (res.success) {
        const fallbackOtp = (res as any).devOtp ? String((res as any).devOtp) : '';
        setDevOtpHint(fallbackOtp ? `DEV OTP: ${fallbackOtp}` : '');
        setDevOtpValue(fallbackOtp);
        setIsOtpSent(true);
        setTimer(30);
      } else {
        if (res.error && res.error.includes('OTP already sent')) {
          setIsOtpSent(true);
          setTimer(30);
        } else {
          setError(res.error || 'Failed to send OTP');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError('');
    try {
      const res = role === UserRole.PARENT
        ? await otpService.sendOTP(formData.phone, formData.admissionNo)
        : await otpService.sendForgotPasswordOTP(formData.phone, 'ADMIN');
      if (res.success) {
        const fallbackOtp = (res as any).devOtp ? String((res as any).devOtp) : '';
        setDevOtpHint(fallbackOtp ? `DEV OTP: ${fallbackOtp}` : '');
        setDevOtpValue(fallbackOtp);
        setTimer(30);
      } else {
        setError(res.error || 'Failed to resend OTP');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.password.length < 8) throw new Error("Password must be at least 8 characters.");

      const verifyRes = await otpService.verifyOTP(
        formData.phone,
        otp,
        role === UserRole.PARENT ? formData.admissionNo : undefined
      );
      if (!verifyRes.success) {
        throw new Error(verifyRes.error || 'Invalid OTP');
      }

      const { registerAdmin, registerParent } = useAuthStore.getState();

      if (role === UserRole.ADMIN) {
        await registerAdmin({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          secret: formData.adminKey,
          phoneNumber: formData.phone // Add phone number to admin registration
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
      
      // If we have a user in the store now (auto-logged in by backend), trigger redirection
      // Otherwise redirect to login
      setTimeout(() => {
        const { user } = useAuthStore.getState();
        if (user) {
          onRegister(user);
        } else {
          onBackToLogin();
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = () => {
     setRole(role === UserRole.PARENT ? UserRole.ADMIN : UserRole.PARENT);
     setError('');
     setIsOtpSent(false);
      setDevOtpHint('');
      setDevOtpValue('');
     setOtp('');
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

  if (showLangPicker) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-slate-900 to-black">
        <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl border-2 border-white/10 mb-6">
              <i className="fas fa-globe text-4xl text-white"></i>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Choose Language</h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-3">भाषा चुनें • Select your preferred language</p>
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-2xl space-y-4">
            <button
              onClick={() => { setLang('en'); setShowLangPicker(false); }}
              className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-5 ${
                lang === 'en' ? 'border-primary bg-primary/5 shadow-lg' : 'border-slate-100 hover:border-primary/30'
              }`}
            >
              <span className="text-4xl">🇬🇧</span>
              <div className="text-left flex-1">
                <p className="font-black text-lg text-slate-800">English</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Default language</p>
              </div>
              {lang === 'en' && <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"><i className="fas fa-check text-white text-xs"></i></div>}
            </button>

            <button
              onClick={() => { setLang('hi'); setShowLangPicker(false); }}
              className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-5 ${
                lang === 'hi' ? 'border-primary bg-primary/5 shadow-lg' : 'border-slate-100 hover:border-primary/30'
              }`}
            >
              <span className="text-4xl">🇮🇳</span>
              <div className="text-left flex-1">
                <p className="font-black text-lg text-slate-800">हिन्दी</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hindi language</p>
              </div>
              {lang === 'hi' && <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"><i className="fas fa-check text-white text-xs"></i></div>}
            </button>

            <button
              onClick={() => setShowLangPicker(false)}
              className="w-full mt-4 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                {role === UserRole.ADMIN ? 'Setup Bus admin authentication.' : 'Connect your family to the transport core.'}
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

           {error && (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[9px] font-black uppercase mb-8 border border-red-100">
               <p>{error}</p>
             </div>
           )}

           {isOtpSent ? (
             <form onSubmit={handleRegister} className="space-y-6">
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter OTP</label>
                  <input
                    required
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={inputClass}
                    placeholder="Enter 6-digit OTP"
                    inputMode="numeric"
                    maxLength={6}
                  />
                  {devOtpHint && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-widest">
                      <div className="flex items-center justify-between gap-3">
                        <span>{devOtpHint}</span>
                        {devOtpValue && (
                          <button
                            type="button"
                            onClick={() => setOtp(devOtpValue)}
                            className="px-3 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 text-[9px] font-black uppercase tracking-widest"
                          >
                            Use OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-2 px-1">
                    <span className="text-[10px] font-bold text-slate-500">
                      OTP sent to {formData.phone.slice(0, 2)}******{formData.phone.slice(-2)}
                    </span>
                    <button 
                      type="button" 
                      onClick={handleResendOtp}
                      disabled={timer > 0 || loading}
                      className={`text-[10px] font-black uppercase tracking-widest ${timer > 0 ? 'text-slate-400' : 'text-primary hover:underline'}`}
                    >
                      {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                    </button>
                  </div>
               </div>
               
               <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-[0.98]">
                 {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Verify & Create Account'}
               </button>

               <button 
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                >
                  Change Details
                </button>
             </form>
           ) : (
             <form onSubmit={handleSendOtp} className="space-y-6">
                {role === UserRole.ADMIN && (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Master Admin Secret</label>
                     <div className="relative">
                       <input 
                         required 
                         type={showAdminKey ? "text" : "password"} 
                         value={formData.adminKey} 
                         onChange={(e) => setFormData({...formData, adminKey: e.target.value})} 
                         className={adminInputClass.replace('text-sm', 'text-base font-black')} 
                         placeholder="••••••••" 
                       />
                       <button
                         type="button"
                         onClick={() => setShowAdminKey(!showAdminKey)}
                         className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                       >
                         <i className={`fas ${showAdminKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                       </button>
                     </div>
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
                   <div className="relative">
                     <input 
                       required 
                       type={showPassword ? "text" : "password"} 
                       value={formData.password} 
                       onChange={(e) => setFormData({...formData, password: e.target.value})} 
                       className={role === UserRole.PARENT ? inputClass : adminInputClass} 
                       placeholder="••••••••" 
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                     >
                       <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                     </button>
                   </div>
                </div>

                <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-[0.98] ${role === UserRole.ADMIN ? 'bg-slate-900 shadow-slate-900/20' : 'bg-primary shadow-primary/20'}`}>
                  {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Send OTP'}
                </button>
             </form>
           )}

           <div className="mt-8 text-center pt-6 border-t border-slate-50">
              <button onClick={toggleRole} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors">
                Switch to {role === UserRole.PARENT ? 'Bus admin' : 'Parent'} Registration
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
