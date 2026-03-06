import { ENV } from '../config/env';
import axios from 'axios';
import { supabase } from '../lib/supabase';

export const otpService = {
  sendOTP: async (phone: string, admissionNumber?: string) => {
    try {
      const response = await axios.post('/api/send-otp', { phone, admissionNumber });
      return response.data;
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  verifyOTP: async (phone: string, otp: string, admissionNumber?: string) => {
    try {
      const response = await axios.post('/api/verify-otp', { phone, otp, admissionNumber });
      return response.data;
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  sendForgotPasswordOTP: async (identifier: string, type: 'ADMIN' | 'PARENT') => {
    try {
      // For forgot password, we can use Supabase's built-in reset password flow
      // but if the user wants OTP specifically, we'd need a serverless function for it.
      // For now, let's use the send-otp serverless function if it's a parent.
      const response = await axios.post('/api/send-otp', { phone: identifier, type });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send OTP');
    }
  },

  verifyForgotPasswordOTP: async (phone: string, otp: string) => {
    try {
      const response = await axios.post('/api/verify-otp', { phone, otp });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Invalid OTP');
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
