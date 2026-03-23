import { supabase } from './supabase';

export const saveDBUser = async (user: any) => {
    const normalizedUser = { 
        id: user.id,
        email: user.email?.trim().toLowerCase(),
        full_name: user.fullName || user.full_name,
        phone_number: user.phoneNumber,
        secondary_phone_number: user.secondaryPhoneNumber,
        role: user.role,
        admission_number: user.admissionNumber,
        fleet_security_token: user.fleetSecurityToken,
        location: user.location,
        preferences: user.preferences || { sms: true, email: true, push: true }
    };
    
    const { error } = await supabase.from('profiles').upsert(normalizedUser);
    if (error) {
      console.error('Error saving user to profiles table:', error);
      throw error;
    }
};

export const getStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*, routes(route_name), buses(plate), profiles(full_name, phone_number)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createStudent = async (studentData: any) => {
  // Logic to handle parent creation if needed
  const { data, error } = await supabase.from('students').insert(studentData).select().single();
  if (error) throw error;
  return data;
};

export const updateStudent = async (id: string, studentData: any) => {
  const { data, error } = await supabase.from('students').update(studentData).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteStudent = async (id: string) => {
  const { error } = await supabase.rpc('archive_and_delete_student', {
    p_student_id: id,
    p_deleted_reason: 'Deleted from admin module',
  });
  if (error) throw error;
  return true;
};

export const getRoutes = async () => {
  const { data, error } = await supabase.from('routes').select('*');
  if (error) throw error;
  return data || [];
};

export const createRoute = async (routeData: any) => {
  const { data, error } = await supabase.from('routes').insert(routeData).select().single();
  if (error) throw error;
  return data;
};

export const updateRoute = async (id: string, routeData: any) => {
  const { data, error } = await supabase.from('routes').update(routeData).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteRoute = async (id: string) => {
  const { error } = await supabase.from('routes').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const getBuses = async () => {
  const { data, error } = await supabase.from('buses').select('*, routes(route_name)').order('bus_number', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const createBus = async (busData: any) => {
  const { data, error } = await supabase.from('buses').insert(busData).select().single();
  if (error) throw error;
  return data;
};

export const updateBus = async (id: string, busData: any) => {
  const { data, error } = await supabase.from('buses').update(busData).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteBus = async (id: string) => {
  const { error } = await supabase.from('buses').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const getAttendance = async () => {
  const { data, error } = await supabase.from('attendance').select('*');
  if (error) throw error;
  return data || [];
};

export const createAttendance = async (attendanceData: any) => {
  const { data, error } = await supabase.from('attendance').insert(attendanceData).select().single();
  if (error) throw error;
  return data;
};

export const getDues = async () => {
  const { data, error } = await supabase.from('monthly_dues').select('*, students(full_name, admission_number)');
  if (error) throw error;
  return data || [];
};

export const getParentStudents = async (parentId: string) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, routes(*), buses(*)')
    .eq('parent_id', parentId);
  if (error) throw error;
  return data || [];
};

export const getStudentBoardingPoints = async (studentId: string) => {
  const { data, error } = await supabase
    .from('boarding_points')
    .select('*')
    .eq('student_id', studentId);
  if (error) throw error;
  return data || [];
};

export const createBoardingPoint = async (data: any) => {
  const { data: result, error } = await supabase.from('boarding_points').insert(data).select().single();
  if (error) throw error;
  return result;
};

export const deleteBoardingPoint = async (id: string) => {
  const { error } = await supabase.from('boarding_points').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const getBusCameras = async (busId: string) => {
  const { data, error } = await supabase
    .from('bus_cameras')
    .select('*')
    .eq('bus_id', busId);
  if (error) throw error;
  return data || [];
};

export const getStats = async () => {
  // Mock stats for dashboard, in production these would be aggregate queries
  const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
  const { count: busCount } = await supabase.from('buses').select('*', { count: 'exact', head: true });
  const { count: routeCount } = await supabase.from('routes').select('*', { count: 'exact', head: true });
  
  return {
    totalStudents: studentCount || 0,
    activeBuses: busCount || 0,
    totalRoutes: routeCount || 0,
    revenue: 1250000, // Mock revenue
    attendanceRate: 94
  };
};
