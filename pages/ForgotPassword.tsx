
import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldCheck, Phone, KeyRound, Lock, User, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { otpService } from '../services/otpService';
import { showToast } from '../lib/swal';
import { UserRole } from '../types';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuthStore();
  const [resetMethod, setResetMethod] = useState<'EMAIL' | 'PHONE'>('PHONE');
  const [role, setRole] = useState<UserRole>(UserRole.PARENT);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (resetMethod === 'EMAIL') {
        await forgotPassword(email);
        setStep(4); // Success for email
      } else {
        if (phone.length < 10) throw new Error('Please enter a valid phone number');
        
        let res;
        if (role === UserRole.PARENT) {
          if (!admissionNumber) throw new Error('Please enter Admission Number');
          res = await otpService.sendOTP(phone, admissionNumber);
        } else {
          // For Admin, use sendForgotPasswordOTP which sends type='ADMIN'
          res = await otpService.sendForgotPasswordOTP(phone, 'ADMIN');
        }

        if (res.success) {
          setStep(2);
          setTimer(30);
        } else {
          throw new Error(res.error || 'Failed to send OTP');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Pass admission number if Parent
      const res = await otpService.verifyOTP(phone, otp, role === UserRole.PARENT ? admissionNumber : undefined);
      if (res.success) {
        // If verifyOTP returns a session/token, set it in auth store
        if (res.data?.session?.access_token) {
          const { setAccessToken, setUser } = useAuthStore.getState();
          setAccessToken(res.data.session.access_token);
          if (res.data.user) setUser(res.data.user);
        }
        
        setStep(3);
        showToast('OTP verified successfully', 'success');
      } else {
        throw new Error(res.error || 'Invalid OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');
      if (newPassword !== confirmPassword) throw new Error('Passwords do not match');

      const { accessToken } = useAuthStore.getState();
      
      // If we have an access token (from verifyOTP), use standard resetPassword (supabase update)
      if (accessToken) {
        const { user } = useAuthStore.getState();
        await otpService.resetPassword(user?.id || '', newPassword);
      } else {
        // Otherwise try the phone-specific reset endpoint
        // Trying PUT as POST failed with 404
        await otpService.resetPasswordWithPhone(
          phone, 
          otp, 
          newPassword, 
          role === UserRole.PARENT ? admissionNumber : undefined,
          role
        );
      }
      
      setStep(4);
      showToast('Password reset successfully', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError('');
    try {
      let res;
      if (role === UserRole.PARENT) {
        res = await otpService.sendOTP(phone, admissionNumber);
      } else {
        res = await otpService.sendForgotPasswordOTP(phone, 'ADMIN');
      }

      if (res.success) {
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

  const renderStep = () => {
    if (step === 4) {
      return (
        <div className="text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {resetMethod === 'EMAIL' ? 'Email Sent!' : 'Password Reset!'}
            </p>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              {resetMethod === 'EMAIL' 
                ? <span>We've sent a password reset link to <span className="text-slate-900 font-bold">{email}</span>. Please check your inbox.</span>
                : <span>Your password has been successfully updated. Redirecting to login...</span>
              }
            </p>
          </div>
          {resetMethod === 'EMAIL' && (
            <button 
              onClick={() => setStep(1)}
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
            >
              Didn't receive it? Try again
            </button>
          )}
        </div>
      );
    }

    if (step === 3) {
      return (
        <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password" 
                  className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-12 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password" 
                  className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-12 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
          </button>
        </form>
      );
    }

    if (step === 2) {
      return (
        <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Enter OTP</label>
            <div className="relative group">
              <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code" 
                maxLength={6}
                className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-6 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all tracking-widest"
              />
            </div>
            <div className="flex justify-between items-center px-4 mt-2">
              <span className="text-[10px] font-bold text-slate-400">Sent to {phone}</span>
              <button 
                type="button"
                onClick={handleResendOtp}
                disabled={timer > 0 || loading}
                className={`text-[10px] font-black uppercase tracking-widest ${timer > 0 ? 'text-slate-300' : 'text-primary hover:underline'}`}
              >
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify OTP'}
          </button>
          
          <button 
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
          >
            Change Phone Number
          </button>
        </form>
      );
    }

    return (
      <form onSubmit={handleSendResetLink} className="space-y-8 animate-in slide-in-from-right duration-300">
        <div className="flex p-1 bg-slate-50 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setRole(UserRole.PARENT); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.PARENT ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Parent
          </button>
          <button
            type="button"
            onClick={() => { setRole(UserRole.ADMIN); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.ADMIN ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Admin
          </button>
        </div>

        <div className="flex p-1 bg-slate-50 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setResetMethod('PHONE'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${resetMethod === 'PHONE' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Phone Number
          </button>
          <button
            type="button"
            onClick={() => { setResetMethod('EMAIL'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${resetMethod === 'EMAIL' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Email Address
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              {resetMethod === 'EMAIL' ? 'Email Address' : 'Phone Number'}
            </label>
            <div className="relative group">
              {resetMethod === 'EMAIL' ? (
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
              ) : (
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
              )}
              <input 
                type={resetMethod === 'EMAIL' ? 'email' : 'tel'}
                required
                value={resetMethod === 'EMAIL' ? email : phone}
                onChange={(e) => resetMethod === 'EMAIL' ? setEmail(e.target.value) : setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder={resetMethod === 'EMAIL' ? 'name@example.com' : 'Enter 10-digit number'} 
                className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-6 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
              />
            </div>
          </div>

          {resetMethod === 'PHONE' && role === UserRole.PARENT && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                Admission Number
              </label>
              <div className="relative group">
                <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="text"
                  required
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  placeholder="Enter Admission Number" 
                  className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-6 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3 disabled:opacity-70"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
            <>
              <Send size={18} />
              {resetMethod === 'EMAIL' ? 'Send Reset Link' : 'Send OTP'}
            </>
          )}
        </button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Reset Access</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Recover your account credentials</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-[10px] font-bold uppercase flex items-center gap-3 bg-red-50 text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <p>{error}</p>
            </div>
          )}

          {renderStep()}

          <div className="mt-12 pt-10 border-t border-slate-50 text-center">
            <a
              href="/login"
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
