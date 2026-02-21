
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
      // Ensure data is always an array
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch students from virtual DB:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: any) => {
    try {
      const { data } = await api.post('students', studentData);
      setStudents(prev => [...(prev || []), data]);
      return true;
    } catch (err) {
      console.error("Student registration failed in virtual DB:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, fetchStudents, addStudent };
};
