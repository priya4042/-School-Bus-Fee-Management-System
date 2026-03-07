
import { useState } from 'react';
import api from '../lib/api';

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async (date: string, type: 'PICKUP' | 'DROP') => {
    setLoading(true);
    try {
      const { data } = await api.get('attendance', {
        params: { date, type }
      });
      return data;
    } catch (err) {
      console.error("Failed to fetch attendance", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string | number, type: 'PICKUP' | 'DROP', status: boolean, userId: string) => {
    setLoading(true);
    try {
      await api.post('attendance', {
        student_id: studentId,
        type,
        status,
        marked_by: userId,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error("Attendance sync failed", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { markAttendance, fetchAttendance, loading };
};
