import React, { useState } from 'react';
import { UserRole } from '../types';
import { APP_NAME } from '../constants';
import { showToast } from '../lib/swal';
import { useAuthStore } from '../store/authStore';
import Modal from '../components/Modal';
import axios from 'axios';

interface LoginProps {
  onLogin: (user: any) => void;
  onGoToRegister: (role?: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister }) => {
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.PARENT);
  const [loginMethod, setLoginMethod] = useState<'PHONE' | 'ADMISSION' | 'EMAIL'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  
  const { loginWithOtp, loginWithCredentials } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const type = loginRole === UserRole.ADMIN ? 'EMAIL' : 'ADMISSION';
      await loginWithCredentials(identifier, password, type);
      showToast('Login successful', 'success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const { value: email } = await import('sweetalert2').then(Swal => Swal.default.fire({
      title: 'Forgot Password',
      input: 'email',
      inputLabel: 'Enter your registered email address',
      inputPlaceholder: 'email@example.com',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
    }));

    if (email) {
      try {
        const { forgotPassword } = useAuthStore.getState();
        await forgotPassword(email);
        showToast('Reset link sent to your email', 'success');
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    }
  };

  const togglePortal = () => {
    const newRole = loginRole === UserRole.PARENT ? UserRole.ADMIN : UserRole.PARENT;
    setLoginRole(newRole);
    setIdentifier('');
    setPassword('');
    setError('');
  };

  const inputBaseClass = "w-full px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20 outline-none font-bold transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 placeholder-slate-400";
  const adminInputClass = "w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 placeholder-slate-400";

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
                {loginRole === UserRole.PARENT ? 'Parent Terminal' : 'Administrator Terminal'}
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

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {loginRole === UserRole.ADMIN ? 'Email Address' : 'Admission Number'}
                </label>
                <input 
                  required 
                  type={loginRole === UserRole.ADMIN ? 'email' : 'text'}
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  className={loginRole === UserRole.ADMIN ? adminInputClass : inputBaseClass} 
                  placeholder={loginRole === UserRole.ADMIN ? 'admin@school.com' : 'Enter Admission Number'} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <button type="button" onClick={handleForgotPassword} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</button>
                </div>
                <input 
                  required 
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className={loginRole === UserRole.ADMIN ? adminInputClass : inputBaseClass} 
                  placeholder="••••••••" 
                />
              </div>

              <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${loginRole === UserRole.ADMIN ? 'bg-slate-900 shadow-slate-900/20' : 'bg-primary shadow-primary/20'}`}>
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Authorize Login'}
              </button>
            </form>

            <div className="mt-10 text-center space-y-4 pt-6 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                New User? <button onClick={() => onGoToRegister(loginRole)} className="text-primary font-black ml-1">Register Account</button>
              </p>
              <div className="pt-2">
                <button onClick={togglePortal} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors">
                  {loginRole === UserRole.PARENT ? 'Access Admin Terminal' : 'Back to Parent Portal'}
                </button>
              </div>
              <div className="pt-6 flex justify-center gap-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                <span className="opacity-20">|</span>
                <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
