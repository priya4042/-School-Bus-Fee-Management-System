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
      <div
        className="min-h-screen min-h-[100dvh] bg-slate-900 flex items-center justify-center p-4 md:p-6 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-900 to-black"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-md w-full bg-white rounded-2xl md:rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in zoom-in duration-500">
          <div className="relative w-20 h-20 md:w-24 md:h-24 bg-emerald-500 text-white rounded-3xl flex items-center justify-center text-3xl md:text-4xl mx-auto mb-6 md:mb-8 shadow-xl shadow-emerald-500/40 animate-in zoom-in-50 duration-700">
            <i className="fas fa-check"></i>
            <span className="absolute inset-0 rounded-3xl bg-emerald-500 animate-ping opacity-20"></span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter mb-3 md:mb-4">Registration Complete</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 md:mb-10 leading-loose">
            Your account has been successfully created. You can now log in.
          </p>
          <button onClick={onBackToLogin} className="w-full py-4 md:py-5 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 hover:scale-[1.01] transition-all">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-5 py-4 rounded-xl bg-primary/5 border border-primary/20 outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 placeholder-slate-400";
  const adminInputClass = "w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 placeholder-slate-400";

  if (showLangPicker) {
    return (
      <div
        className="min-h-screen min-h-[100dvh] bg-slate-900 flex items-center justify-center p-4 md:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-slate-900 to-black"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-6 md:mb-10">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 border-2 border-white/10 mb-4 md:mb-6 hover:scale-110 transition-transform">
              <i className="fas fa-globe text-3xl md:text-4xl text-white"></i>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Choose Language</h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2 md:mt-3">भाषा चुनें • Select your preferred language</p>
          </div>

          <div className="bg-white rounded-2xl md:rounded-[3rem] p-5 md:p-10 shadow-2xl space-y-3 md:space-y-4">
            {[
              { code: 'en', flag: '🇬🇧', name: 'English', sub: 'Default language' },
              { code: 'hi', flag: '🇮🇳', name: 'हिन्दी', sub: 'Hindi language' },
            ].map((option, idx) => (
              <button
                key={option.code}
                onClick={() => { setLang(option.code as any); setShowLangPicker(false); }}
                style={{ animationDelay: `${idx * 100}ms` }}
                className={`w-full p-4 md:p-6 rounded-2xl border-2 transition-all flex items-center gap-4 md:gap-5 active:scale-95 animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
                  lang === option.code ? 'border-primary bg-primary/5 shadow-lg' : 'border-slate-100 hover:border-primary/30 hover:-translate-y-0.5'
                }`}
              >
                <span className="text-3xl md:text-4xl">{option.flag}</span>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-black text-base md:text-lg text-slate-800">{option.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{option.sub}</p>
                </div>
                {lang === option.code && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                )}
              </button>
            ))}

            <button
              onClick={() => setShowLangPicker(false)}
              className="w-full mt-3 md:mt-4 py-3 md:py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen min-h-[100dvh] bg-slate-900 flex items-start md:items-center justify-center p-3 md:p-6 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-y-auto"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-1/4 w-72 h-72 rounded-full bg-primary/15 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1.2s' }}></div>
      </div>

      <div className="relative max-w-4xl w-full bg-white rounded-2xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-500">
        <div className={`relative md:w-80 px-6 py-5 md:p-12 text-white flex items-center md:items-start md:flex-col justify-between md:justify-start gap-4 transition-colors duration-500 overflow-hidden ${role === UserRole.ADMIN ? 'bg-slate-950' : 'bg-primary'}`}>
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <i className={`fas ${role === UserRole.ADMIN ? 'fa-shield-halved' : 'fa-user-plus'} absolute -right-6 -bottom-6 text-[140px] md:-right-10 md:-bottom-10 md:text-[220px]`}></i>
          </div>
          <div className="relative flex items-center md:flex-col md:items-start gap-3 md:gap-0">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center border border-white/20 flex-shrink-0 md:mb-8">
              <i className={`fas ${role === UserRole.ADMIN ? 'fa-shield-halved' : 'fa-user-plus'} text-base md:text-xl`}></i>
            </div>
            <div>
              <h1 className="text-lg md:text-3xl font-black tracking-tighter leading-none">Enrollment Hub</h1>
              <p className="text-white/70 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-relaxed mt-1 md:mt-4">
                {role === UserRole.ADMIN ? 'Setup Bus admin authentication.' : 'Connect your family to the transport core.'}
              </p>
            </div>
          </div>

          {/* Animated role toggle (desktop only — mobile reuses the toggleRole button below) */}
          <div className="relative hidden md:block w-full mt-auto">
            <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 grid grid-cols-2">
              <span
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-xl transition-transform duration-300 ease-out ${role === UserRole.ADMIN ? 'bg-white translate-x-full' : 'bg-white'}`}
              ></span>
              <button
                type="button"
                onClick={() => { if (role !== UserRole.PARENT) toggleRole(); }}
                className={`relative z-10 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${role === UserRole.PARENT ? 'text-primary' : 'text-white/60'}`}
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => { if (role !== UserRole.ADMIN) toggleRole(); }}
                className={`relative z-10 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${role === UserRole.ADMIN ? 'text-slate-900' : 'text-white/60'}`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 md:p-12 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-5 md:mb-10">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Registration</h2>
            <button onClick={onBackToLogin} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline active:scale-95 flex items-center gap-2">
              <i className="fas fa-arrow-left"></i>
              <span className="hidden sm:inline">Exit</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>

          {/* Mobile role toggle */}
          <div className="md:hidden mb-5 bg-slate-100 p-1 rounded-2xl grid grid-cols-2 relative">
            <span
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-white shadow-sm transition-transform duration-300 ease-out ${role === UserRole.ADMIN ? 'translate-x-full' : ''}`}
            ></span>
            <button
              type="button"
              onClick={() => { if (role !== UserRole.PARENT) toggleRole(); }}
              className={`relative z-10 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${role === UserRole.PARENT ? 'text-primary' : 'text-slate-400'}`}
            >
              Parent
            </button>
            <button
              type="button"
              onClick={() => { if (role !== UserRole.ADMIN) toggleRole(); }}
              className={`relative z-10 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${role === UserRole.ADMIN ? 'text-slate-900' : 'text-slate-400'}`}
            >
              Admin
            </button>
          </div>

           {error && (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[12px] font-semibold mb-6 border border-red-100">
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
             <form onSubmit={handleSendOtp} className="space-y-4 md:space-y-6">
                {role === UserRole.ADMIN && (
                  <div className="p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-4 md:mb-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
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

           <div className="mt-6 md:mt-8 text-center pt-4 md:pt-6 border-t border-slate-50">
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
