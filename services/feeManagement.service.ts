import { supabase } from '../lib/supabase';
import { MonthlyDue as Due, Defaulter } from '../types';

export const feeService = {
  /**
   * Get list of fee defaulters
   */
  getDefaulters: async (filters?: any): Promise<Defaulter[]> => {
    let query = supabase
      .from('monthly_dues')
      .select('*, students(*)')
      .neq('status', 'PAID');

    if (filters?.month) query = query.eq('month', filters.month);
    if (filters?.year) query = query.eq('year', filters.year);

    const { data, error } = await query;
    if (error) throw error;

    // Map to Defaulter type
    return (data || []).map(due => ({
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
  },

  /**
   * Process payment via barcode
   */
  processPaymentByBarcode: async (barcode: string, paymentData: any): Promise<any> => {
    // 1. Find due by barcode
    const { data: due, error: dueError } = await supabase
      .from('monthly_dues')
      .select('*')
      .eq('barcode', barcode)
      .single();
    
    if (dueError || !due) throw new Error('Invalid barcode');

    // 2. Insert payment
    const { error: payError } = await supabase.from('payments').insert({
      student_id: due.student_id,
      amount: paymentData.amount,
      month: due.month,
      method: paymentData.method || 'CASH',
      status: 'SUCCESS',
      created_at: new Date().toISOString()
    });

    if (payError) throw payError;

    // 3. Update due status
    const { error: updateError } = await supabase
      .from('monthly_dues')
      .update({ status: 'PAID' })
      .eq('id', due.id);
    
    if (updateError) throw updateError;

    return { success: true };
  },

  /**
   * Send payment reminders to defaulters
   */
  sendReminders: async (studentIds?: string[]): Promise<any> => {
    // This would typically call a serverless function to send SMS/Email
    // For now, we'll just mock it or call a generic send-otp like function if applicable
    console.log('Sending reminders to:', studentIds);
    return { success: true, count: studentIds?.length || 0 };
  },

  /**
   * Generate monthly fees for all students
   */
  generateMonthlyFees: async (): Promise<any> => {
    // This is a heavy operation, better suited for a serverless function
    // But we can try to do it here if students count is small
    const { data: students, error: studentError } = await supabase.from('students').select('id, base_fee');
    if (studentError) throw studentError;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const dues = students.map(s => ({
      student_id: s.id,
      month,
      year,
      amount: s.base_fee || 1500,
      status: 'PENDING',
      due_date: new Date(year, month, 10).toISOString().split('T')[0],
      barcode: `FEE-${s.id}-${month}-${year}`
    }));

    const { error: insertError } = await supabase.from('monthly_dues').upsert(dues, { onConflict: 'student_id,month,year' });
    if (insertError) throw insertError;

    return { success: true, count: dues.length };
  },

  /**
   * Get fee details by barcode
   */
  getFeeByBarcode: async (barcode: string): Promise<Due> => {
    const { data, error } = await supabase
      .from('monthly_dues')
      .select('*, students(*)')
      .eq('barcode', barcode)
      .single();
    
    if (error) throw error;
    return data;
  }
};
