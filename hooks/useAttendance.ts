
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async (date: string, type: 'PICKUP' | 'DROP') => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, students(full_name, admission_number)')
        .eq('date', date)
        .eq('type', type);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string | number, type: 'PICKUP' | 'DROP', status: boolean, userId: string) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('attendance').upsert({
        student_id: String(studentId),
        type,
        status,
        marked_by: userId,
        date: today,
        timestamp: new Date().toISOString(),
      }, { onConflict: 'student_id,type,date' });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Attendance sync failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { markAttendance, fetchAttendance, loading };
};
