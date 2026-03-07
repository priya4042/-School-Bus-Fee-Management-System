import { ENV } from '../config/env';
import axios from 'axios';

export const otpService = {
  sendOTP: async (phone: string) => {
    try {
      const response = await axios.post('/api/v1/auth/send-otp', { phone });
      return response.data;
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  verifyOTP: async (phone: string, otp: string) => {
    try {
      const response = await axios.post('/api/v1/auth/verify-otp', { phone, otp });
      return response.data;
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  sendForgotPasswordOTP: async (identifier: string, type: 'ADMIN' | 'PARENT') => {
    try {
      const response = await axios.post('/api/v1/auth/forgot-password-send-otp', { identifier, type });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send OTP');
    }
  },

  verifyForgotPasswordOTP: async (phone: string, otp: string) => {
    try {
      const response = await axios.post('/api/v1/auth/forgot-password-verify-otp', { phone, otp });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Invalid OTP');
    }
  },

  resetPassword: async (profileId: string, newPassword: string) => {
    try {
      const response = await axios.post('/api/v1/auth/reset-password', { profileId, newPassword });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to reset password');
    }
  }
};
