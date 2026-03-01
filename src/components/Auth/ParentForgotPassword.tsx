import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, EyeOff, Lock, Hash, ArrowLeft, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function ParentForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'admission' | 'otp' | 'reset'>('admission');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionNumber })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('OTP sent to your registered mobile number');
        setStep('otp');
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("Passwords don't match");
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: admissionNumber, otp, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Password reset successfully!');
        navigate('/parent/login');
      } else {
        toast.error(data.error || 'Reset failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 mb-4">
            <Users size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Reset Password</h1>
          <p className="text-zinc-500 text-sm mt-1 text-center">
            {step === 'admission' && 'Enter your child\'s Admission ID'}
            {step === 'otp' && 'Enter the 6-digit code sent to your phone'}
            {step === 'reset' && 'Create a new secure password'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'admission' && (
            <motion.form 
              key="admission"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendOtp} 
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Admission ID</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value.toUpperCase())}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="SCH-2024-001"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send OTP"}
              </button>
            </motion.form>
          )}

          {step === 'otp' && (
            <motion.form 
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOtp} 
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Verification Code</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white tracking-[0.5em] font-bold text-center"
                    placeholder="000000"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98]"
              >
                Verify OTP
              </button>
              <button 
                type="button"
                onClick={() => setStep('admission')}
                className="w-full text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium"
              >
                Resend Code
              </button>
            </motion.form>
          )}

          {step === 'reset' && (
            <motion.form 
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword} 
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Reset Password"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <button 
            onClick={() => navigate('/parent/login')}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
