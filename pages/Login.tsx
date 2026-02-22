import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { APP_NAME } from '../constants';
import { showToast } from '../lib/swal';
import { useAuthStore } from '../store/authStore';
import { getDBUsers } from '../lib/api';

interface LoginProps {
  onLogin: (user: User) => void;
  onGoToRegister: (role?: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister }) => {
  const { loginLocal } = useAuthStore();
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.PARENT);
  const [method, setMethod] = useState<'phone' | 'email' | 'admission'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [parentAdm, setParentAdm] = useState('');
  const [parentPass, setParentPass] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [generatedOtp, setGeneratedOtp] = useState('');

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const users = getDBUsers();
    const normalizedEmail = email.trim().toLowerCase();

    setTimeout(() => {
      let foundUser: any = null;

      if (loginRole === UserRole.PARENT) {
        if (method === 'phone') {
          if (!validatePhone(phone)) {
            setError('Please enter a valid 10-digit mobile number.');
            setLoading(false);
            return;
          }
          foundUser = users.find(u => u.phoneNumber === phone && u.role === UserRole.PARENT);
          if (!foundUser) {
            setError(`Mobile ${phone} is not registered.`);
            setLoading(false);
            return;
          }
          if (!otpSent) {
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);
            setOtpSent(true);
            showToast(`Code sent to ${phone}: ${newOtp}`, 'info');
            setLoading(false);
            return;
          } else if (otp !== generatedOtp) { 
              setError('Invalid verification code.');
              setLoading(false);
              return;
          }
        } else if (method === 'admission') {
          foundUser = users.find(u => u.admissionNumber === parentAdm && u.password === parentPass && u.role === UserRole.PARENT);
        } else {
          if (!validateEmail(normalizedEmail)) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
          }
          foundUser = users.find(u => u.email?.toLowerCase() === normalizedEmail && u.password === password && u.role === UserRole.PARENT);
          if (foundUser && !otpSent) {
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);
            setOtpSent(true);
            showToast(`Verification code sent to email: ${newOtp}`, 'info');
            setLoading(false);
            return;
          } else if (otpSent && otp !== generatedOtp) {
            setError('Invalid verification code.');
            setLoading(false);
            return;
          }
        }
      } else {
        if (method === 'phone') {
          if (!validatePhone(phone)) {
            setError('Please enter a valid 10-digit mobile number.');
            setLoading(false);
            return;
          }
          foundUser = users.find(u => (u.phoneNumber === phone || u.secondaryPhoneNumber === phone) && (u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN));
          if (!foundUser) {
            setError(`Number ${phone} is not linked to an owner account.`);
            setLoading(false);
            return;
          }
          if (!otpSent) {
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);
            setOtpSent(true);
            showToast(`Owner OTP sent to ${phone}: ${newOtp}`, 'info');
            setLoading(false);
            return;
          } else if (otp !== generatedOtp) {
            setError('Invalid owner verification code.');
            setLoading(false);
            return;
          }
        } else {
          if (!validateEmail(normalizedEmail)) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
          }
          foundUser = users.find(u => u.email?.toLowerCase() === normalizedEmail && u.password === password && (u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN));
          if (foundUser && !otpSent) {
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);
            setOtpSent(true);
            showToast(`Admin verification code sent: ${newOtp}`, 'info');
            setLoading(false);
            return;
          } else if (otpSent && otp !== generatedOtp) {
            setError('Invalid verification code.');
            setLoading(false);
            return;
          }
        }
      }

      if (foundUser) {
        loginLocal(foundUser);
        onLogin(foundUser);
        showToast(`Welcome back, ${foundUser.fullName || foundUser.full_name}`, 'success');
      } else {
        setError('Invalid credentials for selected portal.');
      }
      setLoading(false);
    }, 800);
  };

  const togglePortal = () => {
    if (loginRole === UserRole.PARENT) {
      setLoginRole(UserRole.ADMIN);
      setMethod('email');
    } else {
      setLoginRole(UserRole.PARENT);
      setMethod('phone');
    }
    setError('');
    setOtpSent(false);
    setOtp('');
    setPhone('');
  };

  const inputBaseClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 outline-none font-bold transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 placeholder-slate-400";
  const ownerInputClass = "w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 placeholder-slate-400";

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-y-auto">
      <div className="max-w-md w-full py-8 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
           <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl border-2 border-white/10 mb-6">
              <i className="fas fa-bus-alt text-4xl text-white"></i>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{APP_NAME} PRO</h1>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className={`p-8 text-white transition-colors duration-500 ${loginRole === UserRole.PARENT ? 'bg-primary' : 'bg-slate-950'}`}>
            <h2 className="text-2xl font-black tracking-tight">
                {loginRole === UserRole.PARENT ? 'Parent Terminal' : 'Fleet Owner Terminal'}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-1">
              {loginRole === UserRole.PARENT ? 'Secure Family Gateway' : 'Global Operations Hub'}
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl text-[10px] font-bold uppercase flex items-center gap-3 bg-red-50 text-red-600 border border-red-100">
                <i className="fas fa-exclamation-triangle"></i>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="flex border-b border-slate-100 mb-6">
                <button type="button" onClick={() => { setMethod('phone'); setOtpSent(false); }} className={`pb-2 px-4 text-[9px] font-black uppercase border-b-2 transition-all ${method === 'phone' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>Mobile</button>
                {loginRole === UserRole.PARENT && <button type="button" onClick={() => setMethod('admission')} className={`pb-2 px-4 text-[9px] font-black uppercase border-b-2 transition-all ${method === 'admission' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>ID</button>}
                <button type="button" onClick={() => { setMethod('email'); setOtpSent(false); }} className={`pb-2 px-4 text-[9px] font-black uppercase border-b-2 transition-all ${method === 'email' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>Email</button>
              </div>

              {method === 'phone' ? (
                !otpSent ? (
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className={loginRole === UserRole.PARENT ? inputBaseClass : ownerInputClass} placeholder="Mobile Number" />
                ) : (
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Enter OTP sent to {phone}</p>
                    <input required type="text" value={otp} autoFocus onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-4 py-4 rounded-2xl border-2 border-primary text-center text-2xl font-black tracking-[0.5em] text-primary" placeholder="••••••" />
                  </div>
                )
              ) : method === 'admission' ? (
                <div className="space-y-4">
                  <input required type="text" value={parentAdm} onChange={(e) => setParentAdm(e.target.value)} className={inputBaseClass} placeholder="Admission ID" />
                  <input required type="password" value={parentPass} onChange={(e) => setParentPass(e.target.value)} className={inputBaseClass} placeholder="Password" />
                </div>
              ) : (
                <div className="space-y-4">
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={loginRole === UserRole.PARENT ? inputBaseClass : ownerInputClass} placeholder="Email Address" />
                  <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={loginRole === UserRole.PARENT ? inputBaseClass : ownerInputClass} placeholder="Password" />
                </div>
              )}

              <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${loginRole === UserRole.ADMIN ? 'bg-slate-900 shadow-slate-900/20' : 'bg-primary shadow-primary/20'}`}>
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : otpSent ? 'Verify & Access' : 'Secure Authenticate'}
              </button>
            </form>

            <div className="mt-10 text-center space-y-4 pt-6 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                New User? <button onClick={() => onGoToRegister(loginRole)} className="text-primary font-black ml-1">Register Account</button>
              </p>
              <div className="pt-2">
                <button onClick={togglePortal} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors">
                  {loginRole === UserRole.PARENT ? 'Access Owner Terminal' : 'Back to Parent Portal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;