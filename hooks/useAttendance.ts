
import { useState } from 'react';
import api from '../lib/api';

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);

  const markAttendance = async (studentId: string | number, type: 'PICKUP' | 'DROP', status: boolean, userId: string) => {
    setLoading(true);
    try {
      await api.post('/attendance/mark', null, {
        params: {
          student_id: studentId,
          type,
          status,
          marked_by: userId
        }
      });
      return true;
    } catch (err) {
      console.error("Attendance sync failed", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { markAttendance, loading };
};
