import { apiPost } from '../lib/api';
import { supabase } from '../lib/supabase';

export const otpService = {
  sendOTP: async (phone: string, admissionNumber?: string) => {
    try {
      // Updated to use apiPost
      const data = await apiPost('otp', 'send', { phone, admissionNumber });
      return data;
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      return { success: false, error: error.message };
    }
  },

  verifyOTP: async (phone: string, otp: string, admissionNumber?: string) => {
    try {
      // Updated to use apiPost
      const data = await apiPost('otp', 'verify', { phone, otp, admissionNumber });
      return data;
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      return { success: false, error: error.message };
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
