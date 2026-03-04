import axios from 'axios';
import { MonthlyDue as Due, Defaulter, Receipt } from '../types';

const API_URL = '/api/v1/fees';

export const feeService = {
  /**
   * Get list of fee defaulters
   */
  getDefaulters: async (filters?: any): Promise<Defaulter[]> => {
    const response = await axios.get(`${API_URL}/defaulters`, { params: filters });
    return response.data;
  },

  /**
   * Process payment via barcode
   */
  processPaymentByBarcode: async (barcode: string, paymentData: any): Promise<any> => {
    const response = await axios.post(`${API_URL}/barcode-payment`, { barcode, ...paymentData });
    return response.data;
  },

  /**
   * Send payment reminders to defaulters
   */
  sendReminders: async (studentIds?: string[]): Promise<any> => {
    const response = await axios.post(`${API_URL}/reminders`, { studentIds });
    return response.data;
  },

  /**
   * Generate monthly fees for all students
   */
  generateMonthlyFees: async (): Promise<any> => {
    const response = await axios.post(`${API_URL}/generate-all`);
    return response.data;
  },

  /**
   * Get fee details by barcode
   */
  getFeeByBarcode: async (barcode: string): Promise<Due> => {
    const response = await axios.get(`${API_URL}/barcode/${barcode}`);
    return response.data;
  }
};
