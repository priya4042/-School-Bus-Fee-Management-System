
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
        .select('*, routes(route_name), buses(bus_number, plate), profiles(full_name, phone_number)')
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

      // Auto-generate monthly dues for the rest of the current Indian academic
      // year (April -> March). Skips if student has no monthly_fee or if dues
      // already exist for this student in the target window.
      const monthlyFee = Number(studentData.monthly_fee || 0);
      if (studentId && monthlyFee > 0) {
        try {
          const today = new Date();
          const currentMonth = today.getMonth() + 1;       // 1-12
          const currentYear = today.getFullYear();
          const fyStart = currentMonth >= 4 ? currentYear : currentYear - 1;

          // Build the (month, year) pairs from the current month -> March of fyStart+1
          const cycles: Array<{ month: number; year: number }> = [];
          let m = currentMonth;
          let y = currentYear;
          while (true) {
            cycles.push({ month: m, year: y });
            // Stop when we've added March of fyStart+1
            if (y === fyStart + 1 && m === 3) break;
            m += 1;
            if (m > 12) { m = 1; y += 1; }
            // Safety: never loop more than 18 cycles
            if (cycles.length > 18) break;
          }

          // Don't insert duplicates — check existing dues for this student in the window
          const { data: existing } = await supabase
            .from('monthly_dues')
            .select('month, year')
            .eq('student_id', studentId);
          const existingKey = new Set((existing || []).map((d: any) => `${d.year}-${d.month}`));

          const rowsToInsert = cycles
            .filter((c) => !existingKey.has(`${c.year}-${c.month}`))
            .map((c) => ({
              student_id: studentId,
              month: c.month,
              year: c.year,
              amount: monthlyFee,
              total_due: monthlyFee,
              base_fee: monthlyFee,
              due_date: new Date(Date.UTC(c.year, c.month - 1, 10)).toISOString().slice(0, 10),
              last_date: new Date(Date.UTC(c.year, c.month - 1, 20)).toISOString().slice(0, 10),
              status: 'PENDING',
            }));

          if (rowsToInsert.length > 0) {
            const { error: duesErr } = await supabase.from('monthly_dues').insert(rowsToInsert);
            if (duesErr) console.warn('Auto-generate dues failed (non-fatal):', duesErr.message);
          }
        } catch (genErr) {
          console.warn('Auto-generate dues threw (non-fatal):', genErr);
        }
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
