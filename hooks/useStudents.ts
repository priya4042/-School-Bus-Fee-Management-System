
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Student } from '../types';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('students');
      setStudents(data);
    } catch (err) {
      console.error('API Connection issue: Fallback failed');
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: any) => {
    try {
      const { data } = await api.post('students', studentData);
      setStudents(prev => [...prev, data]);
      return true;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, fetchStudents, addStudent };
};
