
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Student } from '../types';
import { MOCK_STUDENTS } from '../constants';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const getStoredStudents = () => {
    const stored = localStorage.getItem('fleet_students');
    return stored ? JSON.parse(stored) : MOCK_STUDENTS;
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('students');
      setStudents(data.length > 0 ? data : getStoredStudents());
    } catch (err) {
      console.warn('API Connection issue: Using Local Student Vault');
      setStudents(getStoredStudents());
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: any) => {
    const newStudent = {
      ...studentData,
      id: `s-${Math.random().toString(36).substr(2, 5)}`,
      status: 'active'
    };

    try {
      await api.post('students', studentData);
      await fetchStudents();
      return true;
    } catch (err) {
      const current = getStoredStudents();
      const updated = [...current, newStudent];
      localStorage.setItem('fleet_students', JSON.stringify(updated));
      setStudents(updated);
      return true;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, fetchStudents, addStudent };
};
