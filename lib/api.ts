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
        message: `Payment of ₹${Number(amount || 0).toLocaleString()} received for ${studentName}. Transaction ID: ${txnId}`,
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
  const token = localStorage.getItem('schoolBusToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  await new Promise(res => setTimeout(res, 100));

  // Intercept students
  if (url === 'students') {
    config.adapter = async () => {
      if (config.method === 'post') {
        try {
          const studentData = JSON.parse(config.data);
          let parentId = null;

          // Auto-create parent if provided
          if (studentData.parent_phone) {
            // Check if parent exists
            const { data: existingParent } = await supabase
              .from('profiles')
              .select('id')
              .eq('phone_number', studentData.parent_phone)
              .single();

            if (existingParent) {
              parentId = existingParent.id;
            } else {
              // Create new parent
              const { data: newParent, error: parentError } = await supabase
                .from('profiles')
                .insert({
                  full_name: studentData.parent_name || 'Parent',
                  phone_number: studentData.parent_phone,
                  role: 'PARENT',
                  email: `parent.${studentData.parent_phone}@school.com` // Dummy email
                })
                .select()
                .single();
              
              if (parentError) throw parentError;
              parentId = newParent.id;
            }
          }

          // Sanitize foreign keys
          const payload = {
            full_name: studentData.full_name,
            admission_number: studentData.admission_number,
            grade: studentData.grade,
            section: studentData.section,
            monthly_fee: studentData.monthly_fee,
            status: studentData.status,
            route_id: studentData.route_id || null,
            bus_id: studentData.bus_id || null,
            parent_id: parentId,
            boarding_point: studentData.boarding_point
          };
          
          const { data, error } = await supabase.from('students').insert(payload).select().single();
          
          if (error) throw error;
          
          return {
            data: data || {},
            status: 201, statusText: 'Created', headers: {}, config
          };
        } catch (error: any) {
          return Promise.reject({ response: { data: { error: error.message } } });
        }
      }
      
      const { data, error } = await supabase
        .from('students')
        .select('*, routes(route_name), buses(plate), profiles(full_name, phone_number)')
        .order('created_at', { ascending: false });
        
      return {
        data: data || [],
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url.startsWith('students/') && config.method === 'put') {
    config.adapter = async () => {
      try {
        const id = url.split('/')[1];
        const studentData = JSON.parse(config.data);
        let parentId = studentData.parent_id;

        // Auto-create parent if provided and changed
        if (studentData.parent_phone) {
           // Check if parent exists
           const { data: existingParent } = await supabase
             .from('profiles')
             .select('id')
             .eq('phone_number', studentData.parent_phone)
             .single();

           if (existingParent) {
             parentId = existingParent.id;
           } else {
             // Create new parent
             const { data: newParent, error: parentError } = await supabase
               .from('profiles')
               .insert({
                 full_name: studentData.parent_name || 'Parent',
                 phone_number: studentData.parent_phone,
                 role: 'PARENT',
                 email: `parent.${studentData.parent_phone}@school.com`
               })
               .select()
               .single();
             
             if (parentError) throw parentError;
             parentId = newParent.id;
           }
        }

        // Sanitize foreign keys
        const payload = {
          full_name: studentData.full_name,
          admission_number: studentData.admission_number,
          grade: studentData.grade,
          section: studentData.section,
          monthly_fee: studentData.monthly_fee,
          status: studentData.status,
          route_id: studentData.route_id || null,
          bus_id: studentData.bus_id || null,
          parent_id: parentId || null,
          boarding_point: studentData.boarding_point
        };

        const { data, error } = await supabase.from('students').update(payload).eq('id', id).select().single();
        
        if (error) throw error;

        return {
          data: data || {},
          status: 200, statusText: 'OK', headers: {}, config
        };
      } catch (error: any) {
        return Promise.reject({ response: { data: { error: error.message } } });
      }
    };
  }

  if (url.startsWith('students/') && config.method === 'delete') {
    config.adapter = async () => {
      try {
        const id = url.split('/')[1];
        const { error } = await supabase.from('students').delete().eq('id', id);
        
        if (error) throw error;

        return {
          data: { success: true },
          status: 200, statusText: 'OK', headers: {}, config
        };
      } catch (error: any) {
        return Promise.reject({ response: { data: { error: error.message } } });
      }
    };
  }

  // Intercept routes
  if (url === 'routes') {
    config.adapter = async () => {
      if (config.method === 'post') {
        const routeData = JSON.parse(config.data);
        const { data, error } = await supabase.from('routes').insert(routeData).select().single();
        if (error) return Promise.reject({ response: { data: { error: error.message } } });
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

  if (url.startsWith('routes/') && config.method === 'put') {
    config.adapter = async () => {
      const id = url.split('/')[1];
      const routeData = JSON.parse(config.data);
      const { data, error } = await supabase.from('routes').update(routeData).eq('id', id).select().single();
      if (error) return Promise.reject({ response: { data: { error: error.message } } });
      return {
        data: data || {},
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
      const { data, error } = await supabase.from('monthly_dues').select('*, students(*)').order('created_at', { ascending: false });
      const processedData = (data || []).map(due => {
        if (due.status === 'PENDING' && due.last_date && due.fine_after_days !== undefined && due.fine_per_day) {
          const lastDate = new Date(due.last_date);
          const fineStartDate = new Date(lastDate);
          fineStartDate.setDate(fineStartDate.getDate() + due.fine_after_days);
          
          const today = new Date();
          if (today > fineStartDate) {
            const diffTime = Math.abs(today.getTime() - fineStartDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const lateFee = diffDays * due.fine_per_day;
            return {
              ...due,
              late_fee: lateFee,
              total_due: due.amount + lateFee
            };
          }
        }
        return {
          ...due,
          total_due: due.amount + (due.late_fee || 0)
        };
      });
      return {
        data: processedData,
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url === 'fees/add' && config.method === 'post') {
    config.adapter = async () => {
      try {
        const feeData = JSON.parse(config.data);
        
        // 1. Fetch student data
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('id', feeData.student_id)
          .single();
        
        if (studentError || !student) throw new Error('Student not found');

        // 2. Insert record into monthly_dues
        const payload = {
          student_id: student.id,
          student_name: student.full_name,
          admission_number: student.admission_number,
          month: Number(feeData.month),
          year: Number(feeData.year),
          amount: Number(feeData.amount),
          late_fee: 0,
          total_due: Number(feeData.amount),
          due_date: feeData.due_date,
          last_date: feeData.last_date,
          fine_after_days: Number(feeData.fine_after_days),
          fine_per_day: Number(feeData.fine_per_day),
          status: 'PENDING'
        };

        const { data, error } = await supabase.from('monthly_dues').insert(payload).select().single();
        if (error) throw error;

        // 3. Notification System
        if (feeData.sendNotification && student.parent_id) {
          await supabase.from('notifications').insert({
            user_id: student.parent_id,
            title: "Bus Fee Generated",
            message: `Bus fee for ${feeData.month}/${feeData.year} has been generated. Due Date: ${feeData.due_date}. Late fine ₹${feeData.fine_per_day}/day after ${feeData.fine_after_days} days.`,
            type: 'INFO'
          });
        }

        return {
          data: data || {},
          status: 201, statusText: 'Created', headers: {}, config
        };
      } catch (error: any) {
        return Promise.reject({ response: { data: { error: error.message } } });
      }
    };
  }

  if (url.startsWith('fees/mark-paid/') && config.method === 'post') {
    config.adapter = async () => {
      try {
        const id = url.split('/')[2];
        const { data: due } = await supabase.from('monthly_dues').select('*').eq('id', id).single();
        
        if (!due) throw new Error('Due not found');

        // Calculate final late fee if overdue
        let lateFee = due.late_fee || 0;
        if (due.status === 'PENDING' && due.last_date && due.fine_after_days !== undefined && due.fine_per_day) {
          const lastDate = new Date(due.last_date);
          const fineStartDate = new Date(lastDate);
          fineStartDate.setDate(fineStartDate.getDate() + due.fine_after_days);
          const today = new Date();
          if (today > fineStartDate) {
            const diffTime = Math.abs(today.getTime() - fineStartDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            lateFee = diffDays * due.fine_per_day;
          }
        }

        const { data, error } = await supabase
          .from('monthly_dues')
          .update({ 
            status: 'PAID', 
            paid_at: new Date().toISOString(),
            late_fee: lateFee
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return {
          data: data || {},
          status: 200, statusText: 'OK', headers: {}, config
        };
      } catch (error: any) {
        return Promise.reject({ response: { data: { error: error.message } } });
      }
    };
  }

  if (url.startsWith('fees/notify/') && config.method === 'post') {
    config.adapter = async () => {
      try {
        const id = url.split('/')[2];
        const { data: due } = await supabase.from('monthly_dues').select('*, students(*)').eq('id', id).single();
        
        if (!due || !due.students?.parent_id) throw new Error('Parent not found for notification');

        await supabase.from('notifications').insert({
          user_id: due.students.parent_id,
          title: "Fee Reminder",
          message: `Reminder: Bus fee for ${due.month}/${due.year} is pending. Current total: ₹${due.amount + (due.late_fee || 0)}.`,
          type: 'WARNING'
        });

        return {
          data: { success: true },
          status: 200, statusText: 'OK', headers: {}, config
        };
      } catch (error: any) {
        return Promise.reject({ response: { data: { error: error.message } } });
      }
    };
  }

  if (url.startsWith('fees/edit/') && config.method === 'put') {
    config.adapter = async () => {
      try {
        const id = url.split('/')[2];
        const feeData = JSON.parse(config.data);
        
        const payload = {
          amount: Number(feeData.amount),
          due_date: feeData.due_date,
          last_date: feeData.last_date,
          fine_after_days: Number(feeData.fine_after_days),
          fine_per_day: Number(feeData.fine_per_day),
          month: Number(feeData.month),
          year: Number(feeData.year)
        };

        const { data, error } = await supabase.from('monthly_dues').update(payload).eq('id', id).select().single();
        if (error) throw error;

        return {
          data: data || {},
          status: 200, statusText: 'OK', headers: {}, config
        };
      } catch (error: any) {
        return Promise.reject({ response: { data: { error: error.message } } });
      }
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
      const safeDues = dues || [];
      const totalCollection = safeDues.filter(d => d.status === 'PAID').reduce((acc, d) => acc + (d.total_due || 0), 0) || 0;
      const lateFeeCollected = safeDues.filter(d => d.status === 'PAID').reduce((acc, d) => acc + (d.late_fee || 0), 0) || 0;
      const defaultersCount = safeDues.filter(d => d.status === 'PENDING').length || 0;

      return {
        data: {
          totalCollection: `₹${(totalCollection / 100000).toFixed(1)}L`,
          activeStudents,
          defaulters: defaultersCount,
          lateFeeCollected: `₹${Number(lateFeeCollected || 0).toLocaleString()}`,
          revenueTrend: [
            { month: 'Jan', revenue: 610000 },
            { month: 'Feb', revenue: 590000 },
            { month: 'Mar', revenue: totalCollection || 650000 },
          ],
          paymentHealth: [
            { name: 'Paid', value: safeDues.filter(d => d.status === 'PAID').length || 0, color: '#1e40af' },
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
        if (error) return Promise.reject({ response: { data: { error: error.message } } });
        return {
          data: data || {},
          status: 201, statusText: 'Created', headers: {}, config
        };
      }
      const { data, error } = await supabase.from('buses').select('*, routes(route_name)').order('bus_number', { ascending: true });
      return {
        data: data || [],
        status: 200, statusText: 'OK', headers: {}, config
      };
    };
  }

  if (url.startsWith('buses/') && config.method === 'put') {
    config.adapter = async () => {
      const id = url.split('/')[1];
      const busData = JSON.parse(config.data);
      const { data, error } = await supabase.from('buses').update(busData).eq('id', id).select().single();
      if (error) return Promise.reject({ response: { data: { error: error.message } } });
      return {
        data: data || {},
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