import axios from 'axios';
import { DEFAULT_ROUTES, MOCK_STUDENTS, MOCK_DUES } from '../constants';
import { UserRole } from '../types';
import { supabase } from './supabase';

/**
 * BusWay Pro - Enterprise Virtual Telemetry & Storage Controller
 */

// Custom Event Names
export const TELEMETRY_EVENT = 'busway_gps_update';
export const ARRIVAL_EVENT = 'busway_arrival_notice';
export const PAYMENT_EVENT = 'busway_payment_success';

export const PaymentTelemetry = {
  notifyPayment: async (studentName: string, amount: number, txnId: string, userId?: string) => {
    const data = { studentName, amount, txnId, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent(PAYMENT_EVENT, { detail: data }));
    
    // Log into Supabase notifications
    if (userId) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Fee Payment Received',
        message: `Payment of ₹${amount.toLocaleString()} received for ${studentName}. Transaction ID: ${txnId}`,
        type: 'SUCCESS'
      });
    }
  }
};

export const BusTelemetry = {
  broadcastLocation: async (busId: string, lat: number, lng: number, speed: number) => {
    const data = { busId, lat, lng, speed, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent(TELEMETRY_EVENT, { detail: data }));
    
    // Persist for page refreshes locally
    localStorage.setItem(`live_pos_${busId}`, JSON.stringify(data));

    // Production: Update Supabase bus_locations table
    try {
      const { error } = await supabase
        .from('bus_locations')
        .upsert({ 
          bus_id: busId, 
          latitude: lat, 
          longitude: lng, 
          speed, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'bus_id' });
      
      if (error) console.error('Supabase Telemetry Error:', error);
    } catch (err) {
      console.error('Telemetry Sync Failed:', err);
    }
  },
  notifyArrival: async (busId: string, busPlate: string, adminId?: string) => {
    const data = { busId, busPlate, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent(ARRIVAL_EVENT, { detail: data }));
    
    // Log into Supabase notifications
    if (adminId) {
      await supabase.from('notifications').insert({
        user_id: adminId,
        title: 'Bus Arrived',
        message: `Bus ${busPlate} has successfully reached the school campus.`,
        type: 'SUCCESS'
      });
    }
  }
};

export const getDBUsers = async (): Promise<any[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data || [];
};

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

const api = axios.create({ baseURL: '/api/v1/' });

api.interceptors.request.use(async (config) => {
  const url = (config.url || '').replace(/^\/+/, '');
  
  await new Promise(res => setTimeout(res, 100));

  // Intercept students
  if (url === 'students') {
    config.adapter = async () => {
      const { data, error } = await supabase.from('students').select('*');
      return {
        data: data || [],
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url === 'students' && config.method === 'post') {
    config.adapter = async () => {
      const studentData = JSON.parse(config.data);
      const { data, error } = await supabase.from('students').insert(studentData).select().single();
      return {
        data: data || {},
        status: 201, statusText: 'Created', headers: {}, config
      };
    };
  }

  if (url.startsWith('students/') && config.method === 'delete') {
    config.adapter = async () => {
      const id = url.split('/')[1];
      const { error } = await supabase.from('students').delete().eq('id', id);
      return {
        data: { success: !error },
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  // Intercept routes
  if (url === 'routes') {
    config.adapter = async () => {
      if (config.method === 'post') {
        const routeData = JSON.parse(config.data);
        const { data, error } = await supabase.from('routes').insert(routeData).select().single();
        return {
          data: data || {},
          status: 201, statusText: 'Created', headers: {}, config
        };
      }
      const { data, error } = await supabase.from('routes').select('*');
      return {
        data: data || [],
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url.startsWith('routes/') && config.method === 'delete') {
    config.adapter = async () => {
      const id = url.split('/')[1];
      const { error } = await supabase.from('routes').delete().eq('id', id);
      return {
        data: { success: !error },
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  // Intercept receipts
  if (url === 'receipts') {
    config.adapter = async () => {
      const { data, error } = await supabase.from('receipts').select('*').order('created_at', { ascending: false });
      return {
        data: data || [],
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url === 'receipts' && config.method === 'post') {
    config.adapter = async () => {
      const receiptData = JSON.parse(config.data);
      const { data, error } = await supabase.from('receipts').insert(receiptData).select().single();
      return {
        data: data || {},
        status: 201, statusText: 'Created', headers: {}, config
      };
    };
  }

  // Intercept dues
  if (url === 'fees/dues') {
    config.adapter = async () => {
      const { data, error } = await supabase.from('monthly_dues').select('*');
      return {
        data: data || [],
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url === 'fees/defaulters') {
    config.adapter = async () => {
      const { data, error } = await supabase.from('monthly_dues').select('*').eq('status', 'PENDING');
      // Filter for overdue ones in real app, here we just return pending
      return {
        data: data || [],
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url === 'fees/add' && config.method === 'post') {
    config.adapter = async () => {
      const feeData = JSON.parse(config.data);
      const { data, error } = await supabase.from('monthly_dues').insert(feeData).select().single();
      return {
        data: data || {},
        status: 201, statusText: 'Created', headers: {}, config
      };
    };
  }

  if (url.startsWith('fees/edit/') && config.method === 'put') {
    config.adapter = async () => {
      const id = url.split('/')[2];
      const feeData = JSON.parse(config.data);
      const { data, error } = await supabase.from('monthly_dues').update(feeData).eq('id', id).select().single();
      return {
        data: data || {},
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url === 'fees/generate-monthly' && config.method === 'post') {
    config.adapter = async () => {
      // In a real app, this would be a complex server-side function
      // Here we simulate it by inserting mock dues for all students
      const { data: students } = await supabase.from('students').select('*');
      if (students) {
        const newDues = students.map(s => ({
          student_id: s.id,
          student_name: s.full_name,
          admission_number: s.admission_number,
          amount: s.base_fee,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          status: 'PENDING',
          total_due: s.base_fee,
          due_date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString()
        }));
        await supabase.from('monthly_dues').insert(newDues);
      }
      return {
        data: { success: true },
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url.startsWith('fees/waive/') && config.method === 'post') {
    config.adapter = async () => {
      const id = url.split('/')[2];
      const { error } = await supabase.from('monthly_dues').update({ late_fee: 0 }).eq('id', id);
      return {
        data: { success: !error },
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url.startsWith('fees/delete/') && config.method === 'delete') {
    config.adapter = async () => {
      const id = url.split('/')[2];
      const { error } = await supabase.from('monthly_dues').delete().eq('id', id);
      return {
        data: { success: !error },
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  // Intercept receipts download
  if (url.includes('receipts/') && url.endsWith('/download')) {
    config.adapter = async () => {
      // Return a fake PDF blob for demonstration
      const dummyContent = "%PDF-1.4 Mock Receipt Data Generated for " + url;
      const blob = new Blob([dummyContent], { type: 'application/pdf' });
      return {
        data: blob,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/pdf' },
        config
      };
    };
  }

  if (url === 'dashboard/stats') {
    config.adapter = async () => {
      const { data: students } = await supabase.from('students').select('*');
      const { data: dues } = await supabase.from('monthly_dues').select('*');
      
      const activeStudents = students?.length || 0;
      const totalCollection = dues?.filter(d => d.status === 'PAID').reduce((acc, d) => acc + (d.total_due || 0), 0) || 0;
      const lateFeeCollected = dues?.filter(d => d.status === 'PAID').reduce((acc, d) => acc + (d.late_fee || 0), 0) || 0;
      const defaultersCount = dues?.filter(d => d.status === 'PENDING').length || 0;

      return {
        data: {
          totalCollection: `₹${(totalCollection / 100000).toFixed(1)}L`,
          activeStudents,
          defaulters: defaultersCount,
          lateFeeCollected: `₹${lateFeeCollected.toLocaleString()}`,
          revenueTrend: [
            { month: 'Jan', revenue: 610000 },
            { month: 'Feb', revenue: 590000 },
            { month: 'Mar', revenue: totalCollection || 650000 },
          ],
          paymentHealth: [
            { name: 'Paid', value: dues?.filter(d => d.status === 'PAID').length || 0, color: '#1e40af' },
            { name: 'Pending', value: defaultersCount, color: '#f59e0b' },
          ]
        },
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url.startsWith('fees/barcode/')) {
    config.adapter = async () => {
      const barcode = url.split('/')[2];
      // In a real app, we'd lookup by barcode. Here we just return a due for demo.
      const { data } = await supabase.from('monthly_dues').select('*').limit(1).single();
      return {
        data: data || {},
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  // Intercept buses
  if (url === 'buses') {
    config.adapter = async () => {
      if (config.method === 'post') {
        const busData = JSON.parse(config.data);
        const { data, error } = await supabase.from('buses').insert(busData).select().single();
        return {
          data: data || {},
          status: 201, statusText: 'Created', headers: {}, config
        };
      }
      const { data, error } = await supabase.from('buses').select('*');
      return {
        data: data || [],
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url.startsWith('buses/') && config.method === 'delete') {
    config.adapter = async () => {
      const id = url.split('/')[1];
      const { error } = await supabase.from('buses').delete().eq('id', id);
      return {
        data: { success: !error },
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  // Intercept attendance
  if (url === 'attendance' && config.method === 'post') {
    config.adapter = async () => {
      const attendanceData = JSON.parse(config.data);
      const { data, error } = await supabase.from('attendance').insert(attendanceData).select().single();
      return {
        data: data || {},
        status: 201, statusText: 'Created', headers: {}, config
      };
    };
  }

  if (url.startsWith('attendance') && config.method === 'get') {
    config.adapter = async () => {
      const { data, error } = await supabase.from('attendance').select('*');
      return {
        data: data || [],
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  return config;
});

export default api;