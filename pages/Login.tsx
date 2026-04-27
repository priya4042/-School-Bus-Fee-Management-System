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
      let type: 'ADMIN' | 'ADMISSION';

      if (loginRole === UserRole.ADMIN) {
        type = 'ADMIN';
      } else {
        type = 'ADMISSION';
      }

      const user = await loginWithCredentials(identifier, password, type);
      showToast('Login successful', 'success');
      if (onLogin) onLogin(user);
    } catch (err: any) {
      if (err.message.includes('401') || err.message.includes('Invalid login credentials')) {
        setError('Incorrect password. If you have forgotten your password, please reset it.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
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

  const isAdmin = loginRole === UserRole.ADMIN;

  return (
    <div
      className="relative min-h-screen min-h-[100dvh] bg-slate-900 flex items-stretch md:items-center justify-center bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-y-auto"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Decorative floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-md w-full md:py-8 px-0 md:px-4 flex flex-col">
        <div className="text-center pt-6 md:pt-0 pb-6 md:pb-8 px-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 border-2 border-white/10 mb-4 md:mb-6 hover:scale-110 transition-transform">
            <i className="fas fa-bus-alt text-3xl md:text-4xl text-white"></i>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter">{APP_NAME}</h1>
          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1 md:mt-2">Secure Sign In</p>
        </div>

        {/* Role toggle pill */}
        <div className="px-4 md:px-0 mb-4 md:mb-6 animate-in fade-in slide-in-from-top-2 duration-500" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
          <div className="relative bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 grid grid-cols-2">
            <span
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-xl transition-transform duration-300 ease-out ${isAdmin ? 'bg-slate-100 translate-x-full' : 'bg-white'}`}
            ></span>
            <button
              onClick={() => { if (isAdmin) togglePortal(); }}
              className={`relative z-10 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                !isAdmin ? 'text-primary' : 'text-white/60'
              }`}
            >
              <i className="fas fa-user"></i>
              Parent
            </button>
            <button
              onClick={() => { if (!isAdmin) togglePortal(); }}
              className={`relative z-10 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                isAdmin ? 'text-slate-900' : 'text-white/60'
              }`}
            >
              <i className="fas fa-shield-halved"></i>
              Admin
            </button>
          </div>
        </div>

        <div className="bg-white rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 md:flex-none" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className={`px-6 md:px-8 py-5 md:py-8 text-white transition-colors duration-500 ${isAdmin ? 'bg-slate-950' : 'bg-primary'}`}>
            <h2 className="text-lg md:text-2xl font-black tracking-tight">
              {isAdmin ? 'Bus Admin Terminal' : 'Parent Terminal'}
            </h2>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/50 mt-1">
              {isAdmin ? 'Global Operations Hub' : 'Secure Family Gateway'}
            </p>
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-5 md:mb-6 p-4 rounded-xl text-[12px] font-semibold flex items-start gap-3 bg-red-50 text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <i className="fas fa-exclamation-triangle flex-shrink-0 mt-1"></i>
                <div className="space-y-2 min-w-0 break-words">
                  <p>{error}</p>
                  {error.includes('account not found') && isAdmin && (
                    <p className="text-[9px] text-red-500 mt-2">💡 <strong>Tip:</strong> First-time admins should create a new account via registration. Click "Register Account" button below.</p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <i className={`fas ${isAdmin ? 'fa-envelope' : 'fa-id-card'} text-primary`}></i>
                  {isAdmin ? 'Email or Phone' : 'Admission Number'}
                </label>
                <input
                  required
                  type="text"
                  inputMode={isAdmin ? 'email' : 'numeric'}
                  autoComplete={isAdmin ? 'email' : 'username'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={isAdmin ? adminInputClass : inputBaseClass}
                  placeholder={isAdmin ? 'Enter Email or Phone' : 'Enter Admission Number'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <i className="fas fa-lock text-primary"></i>
                  Password
                </label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={(isAdmin ? adminInputClass : inputBaseClass) + ' pr-12'}
                    placeholder="Enter Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <div className="text-right">
                  <a href="/forgot-password" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Forgot Password?</a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`group w-full py-4 md:py-5 rounded-2xl text-white font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                  isAdmin ? 'bg-slate-900 shadow-slate-900/20' : 'bg-primary shadow-primary/30'
                }`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    <span className="text-xs">Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <i className="fas fa-arrow-right text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 md:mt-10 text-center space-y-3 md:space-y-4 pt-5 md:pt-6 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                New User?
                <button onClick={() => onGoToRegister(loginRole)} className="text-primary font-black ml-1 hover:underline active:scale-95 inline-block">
                  Register Account
                </button>
              </p>

              <div className="web-only pt-4 flex justify-center flex-wrap gap-x-3 gap-y-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                <a href="/about" className="hover:text-primary transition-colors">About Us</a>
                <span className="opacity-20">|</span>
                <a href="/services" className="hover:text-primary transition-colors">Services</a>
                <span className="opacity-20">|</span>
                <a href="/contact-us" className="hover:text-primary transition-colors">Contact</a>
                <span className="opacity-20">|</span>
                <a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy</a>
                <span className="opacity-20">|</span>
                <a href="/terms-of-service" className="hover:text-primary transition-colors">Terms</a>
                <span className="opacity-20">|</span>
                <a href="/refund-policy" className="hover:text-primary transition-colors">Refund</a>
                <span className="opacity-20">|</span>
                <a href="/shipping-policy" className="hover:text-primary transition-colors">Shipping</a>
              </div>
              <div className="native-only pt-3 flex justify-center flex-wrap gap-x-3 gap-y-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                <a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy</a>
                <span className="opacity-20">|</span>
                <a href="/terms-of-service" className="hover:text-primary transition-colors">Terms</a>
                <span className="opacity-20">|</span>
                <a href="/refund-policy" className="hover:text-primary transition-colors">Refund</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;