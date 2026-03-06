import axios from 'axios';
import { 
  getStudents, createStudent, updateStudent, deleteStudent,
  getRoutes, createRoute, updateRoute, deleteRoute,
  getBuses, createBus, updateBus, deleteBus,
  getAttendance, createAttendance,
  getDues, getStats
} from './supabaseService';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include Supabase token
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await (await import('./supabase')).supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.error('Failed to attach auth header:', err);
  }
  return config;
});

export const api = {
  get: async (url: string, config?: any) => {
    if (url === 'students') return { data: await getStudents() };
    if (url === 'routes') return { data: await getRoutes() };
    if (url === 'buses') return { data: await getBuses() };
    if (url === 'attendance') return { data: await getAttendance() };
    if (url === 'dues') return { data: await getDues() };
    if (url === 'stats') return { data: await getStats() };
    return axiosInstance.get(url, config);
  },
  post: async (url: string, data?: any, config?: any) => {
    if (url === 'students') return { data: await createStudent(data) };
    if (url === 'routes') return { data: await createRoute(data) };
    if (url === 'buses') return { data: await createBus(data) };
    if (url === 'attendance') return { data: await createAttendance(data) };
    
    // Handle both /payments/create-order and payments/create-order
    const targetUrl = url.startsWith('/') ? url : `/${url}`;
    return axiosInstance.post(targetUrl, data, config);
  },
  put: async (url: string, data?: any, config?: any) => {
    if (url.startsWith('students/')) return { data: await updateStudent(url.split('/')[1], data) };
    if (url.startsWith('routes/')) return { data: await updateRoute(url.split('/')[1], data) };
    if (url.startsWith('buses/')) return { data: await updateBus(url.split('/')[1], data) };
    
    const targetUrl = url.startsWith('/') ? url : `/${url}`;
    return axiosInstance.put(targetUrl, data, config);
  },
  delete: async (url: string, config?: any) => {
    if (url.startsWith('students/')) return { data: await deleteStudent(url.split('/')[1]) };
    if (url.startsWith('routes/')) return { data: await deleteRoute(url.split('/')[1]) };
    if (url.startsWith('buses/')) return { data: await deleteBus(url.split('/')[1]) };
    
    const targetUrl = url.startsWith('/') ? url : `/${url}`;
    return axiosInstance.delete(targetUrl, config);
  }
};

export default api;
