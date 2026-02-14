
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Student } from '../types';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('students');
      setStudents(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: any) => {
    try {
      await api.post('students', studentData);
      await fetchStudents();
      return true;
    } catch (err: any) {
      return false;
    }
  };

  const updateStudent = async (id: string, studentData: any) => {
    try {
      await api.put(`students/${id}`, studentData);
      await fetchStudents();
      return true;
    } catch (err: any) {
      return false;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await api.delete(`students/${id}`);
      await fetchStudents();
      return true;
    } catch (err: any) {
      return false;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, error, fetchStudents, addStudent, updateStudent, deleteStudent };
};
