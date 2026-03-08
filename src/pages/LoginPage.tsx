
import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Mail, 
  Lock, 
  ChevronRight, 
  ShieldCheck, 
  Smartphone,
  User,
  AlertCircle
} from 'lucide-react';
import { showToast } from '../lib/swal';

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'ADMIN' | 'PARENT'>('PARENT');
  const { loginWithCredentials, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithCredentials(identifier, password, loginType as any);
      showToast('Welcome back!');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full -ml-64 -mb-64 blur-3xl"></div>
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 relative z-10">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-bl-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                <Bus size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">BusWay Pro</h1>
            </div>
            
            <h2 className="text-5xl font-black leading-tight tracking-tighter mb-6">
              FLEET <br />
              <span className="text-primary">INTELLIGENCE</span> <br />
              REDEFINED.
            </h2>
            <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest max-w-xs">
              Enterprise-grade logistics management for modern educational institutions.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">Secure Access</p>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">End-to-end encrypted sessions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-12 lg:p-20">
          <div className="mb-12">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-2">Access Portal</h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Enter your credentials to continue</p>
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl mb-10">
            <button 
              onClick={() => setLoginType('PARENT')}
              className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                loginType === 'PARENT' ? 'bg-white text-primary shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Parent Portal
            </button>
            <button 
              onClick={() => setLoginType('ADMIN')}
              className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                loginType === 'ADMIN' ? 'bg-white text-primary shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Administrator
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {loginType === 'ADMIN' ? 'Email Address' : 'Admission Number'}
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                  {loginType === 'ADMIN' ? <Mail size={18} /> : <User size={18} />}
                </div>
                <input 
                  type={loginType === 'ADMIN' ? 'email' : 'text'}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={loginType === 'ADMIN' ? 'admin@buswaypro.com' : 'ADM-2024-001'}
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 pl-14 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 pl-14 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-slate-900 hover:-translate-y-1 transition-all active:scale-95 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Authenticate Session
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-slate-50 flex flex-col items-center gap-6">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Trusted by 500+ Institutions</p>
            <div className="flex gap-8 opacity-20 grayscale">
              <div className="w-8 h-8 bg-slate-400 rounded-lg"></div>
              <div className="w-8 h-8 bg-slate-400 rounded-lg"></div>
              <div className="w-8 h-8 bg-slate-400 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
