import axios from 'axios';
import { ENV } from '../config/env';

export const otpService = {
  sendOTP: async (phone) => {
    if (!ENV.MSG91_AUTH_KEY) {
      console.warn('MSG91_AUTH_KEY is missing. Simulating OTP send. Use 123456 to verify.');
      return { success: true, message: 'OTP sent (simulated)' };
    }
    
    try {
      // MSG91 Send OTP API
      const response = await axios.post(
        `https://control.msg91.com/api/v5/otp?template_id=${ENV.MSG91_TEMPLATE_ID}&mobile=91${phone}&authkey=${ENV.MSG91_AUTH_KEY}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.type === 'success') {
        return { success: true, message: 'OTP sent successfully' };
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  verifyOTP: async (phone, otp) => {
    if (!ENV.MSG91_AUTH_KEY) {
      console.warn('MSG91_AUTH_KEY is missing. Simulating OTP verification.');
      if (otp === '123456') {
        return { success: true, message: 'OTP verified (simulated)' };
      }
      return { success: false, error: 'Invalid OTP' };
    }

    try {
      // MSG91 Verify OTP API
      const response = await axios.get(
        `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${phone}&authkey=${ENV.MSG91_AUTH_KEY}`
      );
      
      if (response.data.type === 'success') {
        return { success: true, message: 'OTP verified successfully' };
      } else {
        throw new Error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }
};
