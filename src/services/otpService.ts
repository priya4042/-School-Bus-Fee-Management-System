import { apiPost } from '../lib/api';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/swal';

export const otpService = {
 sendOTP: async (phoneNumber: string, admissionNo?: string) => {
    try {
      const response = await apiPost('otp', 'send', { 
        phone: phoneNumber, 
        admissionNumber: admissionNo 
      });
      showToast('OTP sent successfully', 'success');
      return { success: true, error: null as string | null };
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  },

  verifyOTP: async (phoneNumber: string, otp: string, admissionNo?: string) => {
    try {
      const response = await apiPost('otp', 'verify', { 
        phone: phoneNumber, 
        otp, 
        admissionNumber: admissionNo 
      });
      showToast('OTP verified successfully', 'success');
      return { success: true, error: null as string | null };
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      return { success: false, error: error.message || 'Invalid OTP' };
    }
  },

  sendForgotPasswordOTP: async (identifier: string, type: 'ADMIN' | 'PARENT') => {
    try {
      // Updated to use apiPost
      const data = await apiPost('otp', 'send', { phone: identifier, type });
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  },

  verifyForgotPasswordOTP: async (phone: string, otp: string) => {
    try {
      // Updated to use apiPost
      const data = await apiPost('otp', 'verify', { phone, otp });
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Invalid OTP');
    }
  },

  resetPassword: async (profileId: string, newPassword: string) => {
    try {
      // Use Supabase Auth to update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }
};
