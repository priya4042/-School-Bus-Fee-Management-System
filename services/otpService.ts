import { apiPost } from '../lib/api';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/swal';

const sendViaTwilio = async (formattedPhone: string, otp: string): Promise<void> => {
  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  const fromPhone = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    throw new Error('SMS service not configured. Contact admin.');
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      },
      body: new URLSearchParams({
        From: fromPhone,
        To: formattedPhone,
        Body: `Your School Bus WayPro OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`,
      }).toString(),
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to send SMS');
  }
};

export const otpService = {
  sendOTP: async (phoneNumber: string, _admissionNo?: string) => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const formattedPhone = `+91${phoneNumber.replace(/\D/g, '').slice(-10)}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Store OTP in Supabase
      const { error: dbError } = await supabase.from('otp_logs').insert({
        phone_number: formattedPhone,
        otp_code: otp,
        is_verified: false,
        expires_at: expiresAt,
      });
      if (dbError) throw dbError;

      // Send SMS via Twilio
      await sendViaTwilio(formattedPhone, otp);

      return { success: true, error: null as string | null };
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  },

  verifyOTP: async (phoneNumber: string, otp: string, _admissionNo?: string) => {
    try {
      const formattedPhone = `+91${phoneNumber.replace(/\D/g, '').slice(-10)}`;
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('otp_logs')
        .select('*')
        .eq('phone_number', formattedPhone)
        .eq('otp_code', otp.trim())
        .eq('is_verified', false)
        .gte('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Invalid or expired OTP. Please request a new one.');

      await supabase.from('otp_logs').update({ is_verified: true }).eq('id', data[0].id);

      showToast('Phone verified successfully', 'success');
      return { success: true, data: data[0], error: null as string | null };
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      return { success: false, error: error.message || 'Invalid OTP' };
    }
  },

  sendForgotPasswordOTP: async (identifier: string, _type: 'ADMIN' | 'PARENT') => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const formattedPhone = `+91${identifier.replace(/\D/g, '').slice(-10)}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const { error: dbError } = await supabase.from('otp_logs').insert({
        phone_number: formattedPhone,
        otp_code: otp,
        is_verified: false,
        expires_at: expiresAt,
      });
      if (dbError) throw dbError;

      await sendViaTwilio(formattedPhone, otp);
      return { success: true, error: null };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  },

  resetPassword: async (_profileId: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  },

  resetPasswordWithPhone: async (phone: string, otp: string, newPassword: string, admissionNumber?: string, role?: string) => {
    try {
      await apiPost('otp', 'reset-password', { phone, otp, newPassword, admissionNumber, role }, 'POST');
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }
};
