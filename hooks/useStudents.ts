
import { useState, useEffect } from 'react';
import { apiPost } from '../lib/api';
import { Student } from '../types';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Updated to use apiPost with GET method
      const data = await apiPost('students', '', {}, 'GET');
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: any) => {
    try {
      // Updated to use apiPost
      await apiPost('students', '', studentData, 'POST');
      await fetchStudents();
      return { success: true };
    } catch (err: any) {
      console.error("Student registration failed:", err);
      return { success: false, error: err.message };
    }
  };

  const updateStudentById = async (id: string, studentData: any) => {
    try {
      // Updated to use apiPost with PUT method
      await apiPost('students', id, studentData, 'PUT');
      await fetchStudents();
      return { success: true };
    } catch (err: any) {
      console.error("Student update failed:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteStudentById = async (id: string) => {
    try {
      // Updated to use apiPost with DELETE method
      await apiPost('students', id, {}, 'DELETE');
      await fetchStudents();
      return { success: true };
    } catch (err: any) {
      console.error("Student deletion failed:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, fetchStudents, addStudent, updateStudent: updateStudentById, deleteStudent: deleteStudentById };
};
