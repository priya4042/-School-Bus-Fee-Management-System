
import { useState, useEffect } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../lib/supabaseService';
import { Student } from '../types';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
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
      await createStudent(studentData);
      await fetchStudents();
      return { success: true };
    } catch (err: any) {
      console.error("Student registration failed:", err);
      return { success: false, error: err.message };
    }
  };

  const updateStudentById = async (id: string, studentData: any) => {
    try {
      await updateStudent(id, studentData);
      await fetchStudents();
      return { success: true };
    } catch (err: any) {
      console.error("Student update failed:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteStudentById = async (id: string) => {
    try {
      await deleteStudent(id);
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
