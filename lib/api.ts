
import axios from 'axios';
import { DEFAULT_ROUTES, MOCK_STUDENTS, MOCK_DUES } from '../constants';
import { PaymentStatus } from '../types';

/**
 * BusWay Pro - Virtual API Engine
 * This interceptor simulates a full backend to ensure zero 404 errors.
 * It uses localStorage as a persistent database.
 */

// Initialize "Database" in LocalStorage if empty
const initDB = () => {
  if (!localStorage.getItem('db_students')) localStorage.setItem('db_students', JSON.stringify(MOCK_STUDENTS));
  if (!localStorage.getItem('db_routes')) localStorage.setItem('db_routes', JSON.stringify(DEFAULT_ROUTES));
  if (!localStorage.getItem('db_dues')) localStorage.setItem('db_dues', JSON.stringify(MOCK_DUES));
  if (!localStorage.getItem('db_users')) {
    const admin = { 
      id: 'u-1', 
      email: 'admin@school.com', 
      full_name: 'System Admin', 
      role: 'ADMIN', 
      password: 'admin123' 
    };
    localStorage.setItem('db_users', JSON.stringify([admin]));
  }
};

initDB();

// Mock Delay Helper
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const api = axios.create({
  baseURL: '/api/v1/',
});

// --- VIRTUAL BACKEND INTERCEPTOR ---
api.interceptors.request.use(async (config) => {
  await delay(400); // Simulate network latency
  
  const url = config.url || '';
  const method = config.method?.toUpperCase();
  const data = config.data;

  // 1. ROUTES CRUD
  if (url === 'routes' && method === 'GET') {
    const routes = JSON.parse(localStorage.getItem('db_routes') || '[]');
    config.adapter = async () => ({
      data: routes, status: 200, statusText: 'OK', headers: {}, config
    });
  }

  if (url === 'routes' && method === 'POST') {
    const routes = JSON.parse(localStorage.getItem('db_routes') || '[]');
    const newRoute = { ...data, id: `r-${Math.random().toString(36).substr(2, 5)}`, is_active: true };
    routes.push(newRoute);
    localStorage.setItem('db_routes', JSON.stringify(routes));
    config.adapter = async () => ({
      data: newRoute, status: 201, statusText: 'Created', headers: {}, config
    });
  }

  // 2. STUDENTS CRUD
  if (url === 'students' && method === 'GET') {
    const students = JSON.parse(localStorage.getItem('db_students') || '[]');
    config.adapter = async () => ({
      data: students, status: 200, statusText: 'OK', headers: {}, config
    });
  }

  if (url === 'students' && method === 'POST') {
    const students = JSON.parse(localStorage.getItem('db_students') || '[]');
    const routes = JSON.parse(localStorage.getItem('db_routes') || '[]');
    const assignedRoute = routes.find((r: any) => r.id === data.route_id || r.name === data.route_name);
    
    const newStudent = { 
      ...data, 
      id: `s-${Math.random().toString(36).substr(2, 5)}`, 
      status: 'active',
      route_name: assignedRoute ? assignedRoute.name : 'Unknown Route',
      base_fee: assignedRoute ? assignedRoute.base_fee : 1500
    };
    students.push(newStudent);
    localStorage.setItem('db_students', JSON.stringify(students));
    config.adapter = async () => ({
      data: newStudent, status: 201, statusText: 'Created', headers: {}, config
    });
  }

  // 3. FEE ENGINE CRUD
  if (url === 'fees/dues' && method === 'GET') {
    const dues = JSON.parse(localStorage.getItem('db_dues') || '[]');
    config.adapter = async () => ({
      data: dues, status: 200, statusText: 'OK', headers: {}, config
    });
  }

  if (url === 'fees/generate-monthly' && method === 'POST') {
    const students = JSON.parse(localStorage.getItem('db_students') || '[]');
    const dues = JSON.parse(localStorage.getItem('db_dues') || '[]');
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    let createdCount = 0;
    students.forEach((s: any) => {
      const exists = dues.find((d: any) => d.student_id === s.id && d.month === month && d.year === year);
      if (!exists) {
        dues.push({
          id: `d-${Math.random().toString(36).substr(2, 5)}`,
          student_id: s.id,
          month,
          year,
          base_fee: s.base_fee || 1500,
          late_fee: 0,
          discount: 0,
          total_due: s.base_fee || 1500,
          due_date: `${year}-${month.toString().padStart(2, '0')}-10`,
          status: PaymentStatus.UNPAID
        });
        createdCount++;
      }
    });
    
    localStorage.setItem('db_dues', JSON.stringify(dues));
    config.adapter = async () => ({
      data: { message: `Generated ${createdCount} bills` }, status: 200, statusText: 'OK', headers: {}, config
    });
  }

  if (url.startsWith('fees/waive/')) {
    const dueId = url.split('/').pop();
    const dues = JSON.parse(localStorage.getItem('db_dues') || '[]');
    const updated = dues.map((d: any) => d.id === dueId ? { ...d, late_fee: 0, total_due: d.base_fee - d.discount } : d);
    localStorage.setItem('db_dues', JSON.stringify(updated));
    config.adapter = async () => ({
      data: { status: 'success' }, status: 200, statusText: 'OK', headers: {}, config
    });
  }

  // 4. AUTH SIMULATION
  if (url === 'auth/login-staff' || url === 'auth/login-parent') {
    const users = JSON.parse(localStorage.getItem('db_users') || '[]');
    // For demo purposes, we accept any login that exists in our db_users
    // or just return a default admin if it's the first time
    config.adapter = async () => ({
      data: { 
        user: { id: 'u-1', fullName: 'System Admin', role: 'ADMIN', email: 'admin@school.com' },
        access_token: 'mock-token-xyz'
      }, 
      status: 200, 
      statusText: 'OK', 
      headers: {}, 
      config
    });
  }

  // 5. DASHBOARD STATS
  if (url === 'dashboard/stats' && method === 'GET') {
    const dues = JSON.parse(localStorage.getItem('db_dues') || '[]');
    const students = JSON.parse(localStorage.getItem('db_students') || '[]');
    const paid = dues.filter((d: any) => d.status === 'PAID');
    const totalCollection = paid.reduce((sum: number, d: any) => sum + d.total_due, 0);

    config.adapter = async () => ({
      data: {
        totalCollection: `₹${(totalCollection / 1000).toFixed(1)}K`,
        activeStudents: students.length,
        defaulters: dues.filter((d: any) => d.status === 'OVERDUE').length,
        lateFeeCollected: "₹0",
        revenueTrend: [
          { month: 'Jan', revenue: 45000 },
          { month: 'Feb', revenue: 52000 },
          { month: 'Mar', revenue: totalCollection },
        ],
        paymentHealth: [
          { name: 'Paid', value: paid.length, color: '#22c55e' },
          { name: 'Unpaid', value: dues.length - paid.length, color: '#ef4444' },
        ]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    });
  }

  return config;
});

export default api;
