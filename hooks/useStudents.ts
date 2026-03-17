
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student } from '../types';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*, routes(route_name), buses(bus_number, vehicle_number, plate), profiles(full_name, phone_number)')
        .in('status', ['active', 'ACTIVE'])
        .order('full_name');
      if (error) throw error;
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: any) => {
    try {
      const normalizedAdmissionNumber = String(studentData.admission_number || '').trim();

      // Resolve parent_id from phone number if provided
      let parent_id: string | null = null;
      if (studentData.parent_phone) {
        const digits = String(studentData.parent_phone).replace(/\D/g, '').slice(-10);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .or(`phone_number.eq.${digits},phone_number.eq.+91${digits}`)
          .eq('role', 'PARENT')
          .maybeSingle();
        if (profileData) parent_id = profileData.id;
      }

      const { data, error } = await supabase
        .from('students')
        .insert({
          full_name: studentData.full_name,
          admission_number: normalizedAdmissionNumber,
          grade: studentData.grade,
          section: studentData.section,
          route_id: studentData.route_id || null,
          bus_id: studentData.bus_id || null,
          boarding_point: studentData.boarding_point || null,
          monthly_fee: studentData.monthly_fee || 0,
          status: studentData.status || 'active',
          parent_name: studentData.parent_name || null,
          parent_phone: studentData.parent_phone || null,
          parent_id,
        })
        .select('id')
        .single();
      if (error) throw error;
      let studentId = data?.id as string | undefined;
      if (!studentId) {
        const { data: fallbackStudent } = await supabase
          .from('students')
          .select('id')
          .eq('admission_number', normalizedAdmissionNumber)
          .eq('full_name', studentData.full_name)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        studentId = fallbackStudent?.id;
      }

      await fetchStudents();
      return { success: true, studentId };
    } catch (err: any) {
      console.error('Student registration failed:', err);
      return { success: false, error: err.message };
    }
  };

  const updateStudentById = async (id: string, studentData: any) => {
    try {
      const normalizedAdmissionNumber = String(studentData.admission_number || '').trim();

      // Resolve parent_id from phone number if provided
      let parent_id: string | undefined = undefined;
      if (studentData.parent_phone) {
        const digits = String(studentData.parent_phone).replace(/\D/g, '').slice(-10);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .or(`phone_number.eq.${digits},phone_number.eq.+91${digits}`)
          .eq('role', 'PARENT')
          .maybeSingle();
        parent_id = profileData?.id ?? undefined;
      }

      const updatePayload: any = {
        full_name: studentData.full_name,
        admission_number: normalizedAdmissionNumber,
        grade: studentData.grade,
        section: studentData.section,
        route_id: studentData.route_id || null,
        bus_id: studentData.bus_id || null,
        boarding_point: studentData.boarding_point || null,
        monthly_fee: studentData.monthly_fee || 0,
        status: studentData.status || 'active',
        parent_name: studentData.parent_name || null,
        parent_phone: studentData.parent_phone || null,
      };
      if (parent_id !== undefined) updatePayload.parent_id = parent_id;

      const { error } = await supabase.from('students').update(updatePayload).eq('id', id);
      if (error) throw error;
      await fetchStudents();
      return { success: true };
    } catch (err: any) {
      console.error('Student update failed:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteStudentById = async (id: string) => {
    try {
      const { error } = await supabase.rpc('archive_and_delete_student', {
        p_student_id: id,
        p_deleted_reason: 'Deleted from admin module',
      });
      if (error) throw error;
      await fetchStudents();
      return { success: true };
    } catch (err: any) {
      console.error('Student deletion failed:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, fetchStudents, addStudent, updateStudent: updateStudentById, deleteStudent: deleteStudentById };
};
