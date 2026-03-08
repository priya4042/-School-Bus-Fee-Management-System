
import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending reset link
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-white/10">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Reset Access</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Recover your account credentials</p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-6 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3"
              >
                <Send size={18} />
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center space-y-8 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">Email Sent!</p>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  We've sent a password reset link to <span className="text-slate-900 font-bold">{email}</span>. Please check your inbox.
                </p>
              </div>
              <button 
                onClick={() => setIsSent(false)}
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                Didn't receive it? Try again
              </button>
            </div>
          )}

          <div className="mt-12 pt-10 border-t border-slate-50 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
