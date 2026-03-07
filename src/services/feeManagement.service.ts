import { apiPost } from '../lib/api';
import { MonthlyDue as Due, Defaulter } from '../types';
import axios from 'axios';
import { ENV } from '../config/env';

export const feeService = {
  /**
   * Get list of fee defaulters
   */
  getDefaulters: async (filters?: any): Promise<Defaulter[]> => {
    try {
      const response = await axios.get(`${ENV.API_BASE_URL}/api/fees/defaulters`, {
        params: filters
      });
      const data = response.data;

      // Map to Defaulter type
      return (data || []).map((due: any) => ({
        id: due.id,
        studentId: due.student_id,
        student_name: due.students?.full_name || 'Unknown',
        admission_number: due.students?.admission_number || 'N/A',
        month: due.month,
        year: due.year,
        amount_due: due.amount,
        due_date: due.due_date,
        status: due.status,
        parentPhone: due.students?.phone_number,
        months_overdue: 1 // Simplified for now
      }));
    } catch (error: any) {
      console.error('Failed to fetch defaulters:', error);
      throw error;
    }
  },

  /**
   * Process payment via barcode
   */
  processPaymentByBarcode: async (barcode: string, paymentData: any): Promise<any> => {
    try {
      // This should ideally be a backend route too for security
      const data = await apiPost('fees', 'process-barcode', { barcode, ...paymentData });
      return data;
    } catch (error: any) {
      console.error('Failed to process barcode payment:', error);
      throw error;
    }
  },

  /**
   * Send payment reminders to defaulters
   */
  sendReminders: async (studentIds?: string[]): Promise<any> => {
    try {
      const response = await axios.post(`${ENV.API_BASE_URL}/api/fees/reminders`, { studentIds });
      return response.data;
    } catch (error: any) {
      console.error('Failed to send reminders:', error);
      throw error;
    }
  },

  /**
   * Generate monthly fees for all students
   */
  generateMonthlyFees: async (): Promise<any> => {
    try {
      const response = await axios.post(`${ENV.API_BASE_URL}/api/fees/generate`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to generate monthly fees:', error);
      throw error;
    }
  },

  /**
   * Get fee details by barcode
   */
  getFeeByBarcode: async (barcode: string): Promise<Due> => {
    try {
      const response = await axios.get(`${ENV.API_BASE_URL}/api/fees/barcode/${barcode}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch fee by barcode:', error);
      throw error;
    }
  }
};
