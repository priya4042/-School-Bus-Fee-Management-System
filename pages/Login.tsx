
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { APP_NAME } from '../constants';
import { showToast } from '../lib/swal';

interface LoginProps {
  onLogin: (user: User) => void;
  onGoToRegister: (role?: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister }) => {
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

  const getRegisteredUsers = (): any[] => {
    const data = localStorage.getItem('registered_users');
    return data ? JSON.parse(data) : [];
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const users = getRegisteredUsers();

    setTimeout(() => {
      if (loginRole === UserRole.PARENT) {
        if (method === 'phone') {
          const registeredUser = users.find(u => u.phoneNumber === phone && u.role === UserRole.PARENT);
          
          if (!registeredUser) {
            setError(`Mobile number ${phone} is not recognized. Please register your parent profile first.`);
            setLoading(false);
            return;
          }

          if (!otpSent) {
            setOtpSent(true);
            showToast('Verification code sent to ' + phone, 'info');
            setLoading(false);
            return;
          } else {
            if (otp !== '123456') { 
              setError('Security breach: Invalid verification code. (Hint: 123456)');
              setLoading(false);
              return;
            }
            onLogin(registeredUser);
          }
        } else if (method === 'admission') {
          const registeredUser = users.find(u => u.admissionNumber === parentAdm && u.password === parentPass && u.role === UserRole.PARENT);
          if (!registeredUser) {
            setError('Account match failed. Check Admission ID/Password or register your profile.');
            setLoading(false);
            return;
          }
          onLogin(registeredUser);
        }
      } else {
        // Staff/Admin login - Strict registration check
        const registeredStaff = users.find(u => u.email === email && u.password === password && u.role === loginRole);
        
        if (!registeredStaff) {
          setError(`No authorized ${loginRole.toLowerCase()} account found for ${email}. You must be registered by the system admin or register via the portal.`);
          setLoading(false);
          return;
        }
        onLogin(registeredStaff);
      }
      setLoading(false);
    }, 1000);
  };

  const getRoleLabel = () => {
    switch(loginRole) {
      case UserRole.ADMIN: return "Administrative Control";
      case UserRole.DRIVER: return "Driver Manifest";
      case UserRole.TEACHER: return "Faculty Portal";
      default: return "Parent Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black font-sans">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
           <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 border-2 border-white/10 mb-6">
              <i className="fas fa-bus-alt text-4xl text-white"></i>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{APP_NAME} <span className="text-primary text-xl">PRO</span></h1>
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">Unified Transport Intelligence</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 relative">
          <div className={`p-8 text-white ${loginRole === UserRole.ADMIN ? 'bg-slate-800' : 'bg-primary'} relative overflow-hidden`}>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <i className={`fas ${loginRole === UserRole.ADMIN ? 'fa-lock' : 'fa-users'} text-[100px] translate-x-1/4 translate-y-1/4`}></i>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{getRoleLabel()}</h2>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">Authorized Access Only</p>
          </div>

          <div className="p-8">
            {loginRole !== UserRole.ADMIN && (
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8">
                <button 
                  onClick={() => { setLoginRole(UserRole.PARENT); setOtpSent(false); setError(''); }}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${loginRole === UserRole.PARENT ? 'bg-white shadow-lg text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Parents
                </button>
                <button 
                  onClick={() => { setLoginRole(UserRole.TEACHER); setMethod('email'); setError(''); }}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${[UserRole.TEACHER, UserRole.DRIVER].includes(loginRole) ? 'bg-white shadow-lg text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Staff
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-bold uppercase flex items-center gap-3 animate-in shake duration-300">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {loginRole === UserRole.PARENT ? (
                <>
                  <div className="flex border-b border-slate-100 mb-6">
                    <button type="button" onClick={() => {setMethod('phone'); setError('');}} className={`pb-3 px-4 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${method === 'phone' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>Phone</button>
                    <button type="button" onClick={() => {setMethod('admission'); setError('');}} className={`pb-3 px-4 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${method === 'admission' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}>Admission ID</button>
                  </div>

                  {method === 'phone' ? (
                    !otpSent ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mobile Number</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold border-r border-slate-100 pr-3">+91</span>
                          <input 
                            required
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="w-full pl-16 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-black text-primary"
                            placeholder="00000 00000"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in slide-in-from-right-4">
                        <label className="block text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter Verification Code</label>
                        <input 
                          required
                          type="text" 
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full px-6 py-5 rounded-2xl border-2 border-primary/20 text-center text-2xl font-black tracking-[0.5em] text-primary bg-slate-50"
                          placeholder="••••••"
                        />
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Admission ID</label>
                        <input 
                          required
                          type="text" 
                          value={parentAdm}
                          onChange={(e) => setParentAdm(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-black"
                          placeholder="e.g. 1001"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Password</label>
                        <input 
                          required
                          type="password" 
                          value={parentPass}
                          onChange={(e) => setParentPass(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {loginRole !== UserRole.ADMIN && (
                    <div className="flex gap-2 p-1 bg-slate-50 rounded-xl mb-4">
                      <button 
                        type="button"
                        onClick={() => { setLoginRole(UserRole.TEACHER); setError(''); }}
                        className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg transition-all ${loginRole === UserRole.TEACHER ? 'bg-white shadow text-primary' : 'text-slate-400'}`}
                      >
                        Teacher
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setLoginRole(UserRole.DRIVER); setError(''); }}
                        className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg transition-all ${loginRole === UserRole.DRIVER ? 'bg-white shadow text-primary' : 'text-slate-400'}`}
                      >
                        Driver
                      </button>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Work Email</label>
                    <input 
                      required
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                      placeholder="name@school.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Password</label>
                    <input 
                      required
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${loginRole === UserRole.ADMIN ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20' : 'bg-primary hover:bg-blue-800 shadow-primary/20'}`}
              >
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-sign-in-alt"></i>}
                {method === 'phone' && !otpSent && loginRole === UserRole.PARENT ? 'Send OTP' : 'Access System'}
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Or create a profile</span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Need an account? <button onClick={() => onGoToRegister(loginRole)} className="text-primary hover:underline underline-offset-4">Register Now</button>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
           {loginRole !== UserRole.ADMIN ? (
             <button 
               onClick={() => { setLoginRole(UserRole.ADMIN); setMethod('email'); setError(''); }}
               className="text-[10px] font-black text-slate-600 hover:text-primary uppercase tracking-[0.4em] transition-all opacity-40 hover:opacity-100 flex items-center justify-center gap-2 mx-auto"
             >
                <i className="fas fa-fingerprint"></i>
                Administrative Core
             </button>
           ) : (
             <button 
               onClick={() => { setLoginRole(UserRole.PARENT); setMethod('phone'); setError(''); }}
               className="text-[10px] font-black text-primary uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2 mx-auto"
             >
                <i className="fas fa-arrow-left"></i>
                Return to Portals
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default Login;
