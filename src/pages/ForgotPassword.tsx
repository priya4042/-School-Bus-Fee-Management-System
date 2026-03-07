import React, { useState, useEffect } from 'react';
import { otpService } from '../services/otpService';
import { showToast } from '../lib/swal';
import { APP_NAME } from '../constants';

const ForgotPassword: React.FC = () => {
  const [tab, setTab] = useState<'ADMIN' | 'PARENT'>('ADMIN');
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileId, setProfileId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await otpService.sendForgotPasswordOTP(identifier, tab);
      setProfileId(res.profileId);
      setPhone(res.phone);
      setStep(2);
      setTimer(30);
      showToast('OTP sent successfully', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await otpService.verifyForgotPasswordOTP(phone, otp);
      setStep(3);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) return showToast('Passwords do not match', 'error');
    setLoading(true);
    try {
      await otpService.resetPassword(profileId, newPassword);
      showToast('Password reset successful. Please login.', 'success');
      setTimeout(() => window.location.href = '/', 1500);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl">
        <h1 className="text-2xl font-black text-slate-900 text-center mb-8 uppercase tracking-widest">{APP_NAME}</h1>
        <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => { setTab('ADMIN'); setStep(1); }} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest ${tab === 'ADMIN' ? 'bg-white shadow' : ''}`}>Admin Reset</button>
          <button onClick={() => { setTab('PARENT'); setStep(1); }} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest ${tab === 'PARENT' ? 'bg-white shadow' : ''}`}>Parent Reset</button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <input type="text" placeholder={tab === 'ADMIN' ? 'Enter Phone Number' : 'Enter Admission Number'} value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200" />
            <button onClick={handleSendOtp} disabled={loading} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest">{loading ? 'Sending...' : 'Send OTP'}</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200" />
            <button onClick={handleVerifyOtp} disabled={loading} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest">{loading ? 'Verifying...' : 'Verify OTP'}</button>
            <button onClick={handleSendOtp} disabled={timer > 0 || loading} className="w-full py-2 text-slate-400 text-[10px] uppercase font-bold tracking-widest">{timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
            </div>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
            </div>
            <button onClick={handleResetPassword} disabled={loading} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest">{loading ? 'Resetting...' : 'Reset Password'}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
