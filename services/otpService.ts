import { ENV } from '../config/env';
import axios from 'axios';

export const otpService = {
  sendOTP: async (phone: string) => {
    // Basic validation
    if (!phone || phone.length < 10) {
      return { success: false, error: 'Invalid phone number' };
    }

    try {
      // Use backend API to send OTP (which uses Twilio/MSG91)
      const response = await axios.post('/api/v1/auth/send-otp', { phone });
      return response.data;
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      // Fallback for demo/dev if backend fails or is not configured
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Backend OTP failed, simulating success for dev.');
        return { success: true, message: 'OTP sent (simulated)' };
      }
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  verifyOTP: async (phone: string, otp: string) => {
    try {
      // Use backend API to verify OTP
      const response = await axios.post('/api/v1/auth/verify-otp', { phone, otp });
      return response.data;
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      // Fallback for demo/dev
      if (process.env.NODE_ENV !== 'production' && otp === '123456') {
        return { success: true, message: 'Verified (simulated)' };
      }
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
};
