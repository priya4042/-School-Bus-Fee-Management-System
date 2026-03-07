import { supabase } from './supabase';
import { apiPost } from './api';
import axios from 'axios';
import { ENV } from '../config/env';

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
  try {
    const response = await axios.get(`${ENV.API_BASE_URL}/api/students`);
    return response.data;
  } catch (error) {
    console.error('Failed to get students:', error);
    throw error;
  }
};

export const createStudent = async (studentData: any) => {
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
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const getRoutes = async () => {
  try {
    const response = await axios.get(`${ENV.API_BASE_URL}/api/routes`);
    return response.data;
  } catch (error) {
    console.error('Failed to get routes:', error);
    throw error;
  }
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
  try {
    const response = await axios.get(`${ENV.API_BASE_URL}/api/buses`);
    return response.data;
  } catch (error) {
    console.error('Failed to get buses:', error);
    throw error;
  }
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
  try {
    const response = await axios.get(`${ENV.API_BASE_URL}/api/fees/dues`);
    return response.data;
  } catch (error) {
    console.error('Failed to get dues:', error);
    throw error;
  }
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
  try {
    const response = await axios.get(`${ENV.API_BASE_URL}/api/bus-cameras/${busId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get bus cameras:', error);
    throw error;
  }
};

export const getStats = async () => {
  try {
    const response = await axios.get(`${ENV.API_BASE_URL}/api/dashboard/stats`);
    return response.data;
  } catch (error) {
    console.error('Failed to get stats:', error);
    throw error;
  }
};
