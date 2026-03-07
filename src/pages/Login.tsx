import React, { useState } from 'react';
import { UserRole } from '../types';
import { APP_NAME } from '../constants';
import { showToast } from '../lib/swal';
import { useAuthStore } from '../store/authStore';

interface LoginProps {
  onLogin: (user: any) => void;
  onGoToRegister: (role?: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister }) => {
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.PARENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { loginWithCredentials } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let type: 'ADMIN' | 'ADMISSION' = 'ADMIN';
      
      if (loginRole === UserRole.ADMIN) {
        type = 'ADMIN';
      } else {
        type = 'ADMISSION';
      }

      const user = await loginWithCredentials(identifier, password, type);
      showToast('Login successful', 'success');
      if (onLogin) onLogin(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-y-auto relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="max-w-md w-full py-8 space-y-8 animate-in fade-in zoom-in duration-700 relative z-10">
        <div className="text-center">
           <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 border-4 border-white/5 mb-8 transform hover:scale-105 transition-transform duration-500">
              <i className="fas fa-bus-alt text-5xl text-white drop-shadow-lg"></i>
           </div>
           <h1 className="text-5xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">{APP_NAME}</h1>
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Next Gen Fleet Management</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 ring-1 ring-black/5">
          <div className={`p-10 text-white transition-all duration-500 relative overflow-hidden ${loginRole === UserRole.PARENT ? 'bg-gradient-to-br from-primary to-blue-700' : 'bg-gradient-to-br from-slate-800 to-slate-950'}`}>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight mb-2">
                  {loginRole === UserRole.PARENT ? 'Parent Portal' : 'Admin Console'}
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                {loginRole === UserRole.PARENT ? 'Secure Family Gateway' : 'Global Operations Hub'}
              </p>
            </div>
          </div>

          <div className="p-10">
            {error && (
              <div className="mb-6 p-4 rounded-xl text-[10px] font-bold uppercase flex items-center gap-3 bg-red-50 text-red-600 border border-red-100">
                <i className="fas fa-exclamation-triangle"></i>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {loginRole === UserRole.ADMIN ? 'Email or Phone' : 'Admission Number'}
                </label>
                <input 
                  required 
                  type="text"
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  className={loginRole === UserRole.ADMIN ? adminInputClass : inputBaseClass} 
                  placeholder={loginRole === UserRole.ADMIN ? 'Enter Email or Phone' : 'Enter Admission Number'} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative">
                  <input 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className={loginRole === UserRole.ADMIN ? adminInputClass : inputBaseClass} 
                    placeholder="Enter Password" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <div className="text-right">
                  <a href="/forgot-password" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Forgot Password?</a>
                </div>
              </div>

              <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${loginRole === UserRole.ADMIN ? 'bg-slate-900 shadow-slate-900/20' : 'bg-primary shadow-primary/20'}`}>
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Login'}
              </button>
            </form>

            <div className="mt-10 text-center space-y-4 pt-6 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                New User? <button onClick={() => onGoToRegister(loginRole)} className="text-primary font-black ml-1">Register Account</button>
              </p>
              <div className="pt-2">
                <button onClick={togglePortal} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors">
                  {loginRole === UserRole.PARENT ? 'Access Bus admin Terminal' : 'Back to Parent Portal'}
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
