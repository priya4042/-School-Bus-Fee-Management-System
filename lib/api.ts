
import axios from 'axios';
import { DEFAULT_ROUTES, MOCK_STUDENTS, MOCK_DUES } from '../constants';
import { PaymentStatus } from '../types';

/**
 * BusWay Pro - High-Fidelity Virtual API Engine
 * Manages all persistent data in LocalStorage to simulate a stateful backend.
 */

const MOCK_BUSES = [
  { id: 'b1', plate: 'KNG-01-A', model: 'Tata Starbus 40s', capacity: 40, status: 'On Route' },
  { id: 'b2', plate: 'KNG-02-B', model: 'Force Traveller', capacity: 20, status: 'Maintenance' },
];

const initDB = () => {
  if (!localStorage.getItem('db_students')) localStorage.setItem('db_students', JSON.stringify(MOCK_STUDENTS));
  if (!localStorage.getItem('db_routes')) localStorage.setItem('db_routes', JSON.stringify(DEFAULT_ROUTES));
  if (!localStorage.getItem('db_dues')) localStorage.setItem('db_dues', JSON.stringify(MOCK_DUES));
  if (!localStorage.getItem('db_buses')) localStorage.setItem('db_buses', JSON.stringify(MOCK_BUSES));
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

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const api = axios.create({
  baseURL: '/api/v1/',
});

api.interceptors.request.use(async (config) => {
  await delay(250);
  
  const rawUrl = config.url || '';
  const cleanUrl = rawUrl.replace(/^\/+/, '').replace(/^api\/v1\//, '').replace(/\/+$/, '');
  const method = config.method?.toUpperCase();
  const data = config.data;

  // Database helper
  const getDB = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
  const saveDB = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

  // --- VIRTUAL ROUTING TABLE ---
  
  // 1. ROUTES
  if (cleanUrl === 'routes') {
    const routes = getDB('db_routes');
    if (method === 'GET') {
      config.adapter = async () => ({ data: routes, status: 200, statusText: 'OK', headers: {}, config });
    } else if (method === 'POST') {
      const newRoute = { ...data, id: `r-${Math.random().toString(36).substr(2, 5)}`, is_active: true };
      saveDB('db_routes', [...routes, newRoute]);
      config.adapter = async () => ({ data: newRoute, status: 201, statusText: 'Created', headers: {}, config });
    }
  }

  // 2. BUSES (Fleet Assets)
  if (cleanUrl === 'buses') {
    const buses = getDB('db_buses');
    if (method === 'GET') {
      config.adapter = async () => ({ data: buses, status: 200, statusText: 'OK', headers: {}, config });
    } else if (method === 'POST') {
      const newBus = { 
        ...data, 
        id: `b-${Math.random().toString(36).substr(2, 5)}`,
        status: data.status || 'Idle'
      };
      saveDB('db_buses', [...buses, newBus]);
      config.adapter = async () => ({ data: newBus, status: 201, statusText: 'Created', headers: {}, config });
    }
  }

  if (cleanUrl.startsWith('buses/')) {
    const busId = cleanUrl.split('/').pop();
    if (method === 'DELETE') {
      const buses = getDB('db_buses');
      saveDB('db_buses', buses.filter((b: any) => b.id !== busId));
      config.adapter = async () => ({ data: { status: 'deleted' }, status: 200, statusText: 'OK', headers: {}, config });
    }
  }

  // 3. STUDENTS
  if (cleanUrl === 'students') {
    const students = getDB('db_students');
    if (method === 'GET') {
      config.adapter = async () => ({ data: students, status: 200, statusText: 'OK', headers: {}, config });
    } else if (method === 'POST') {
      const routes = getDB('db_routes');
      const assignedRoute = routes.find((r: any) => r.id === data.route_id || r.id === String(data.route_id));
      const newStudent = { 
        ...data, 
        id: `s-${Math.random().toString(36).substr(2, 5)}`, 
        status: 'active',
        route_name: assignedRoute ? assignedRoute.name : 'Unassigned Route',
        base_fee: assignedRoute ? assignedRoute.base_fee : 1500
      };
      saveDB('db_students', [...students, newStudent]);
      config.adapter = async () => ({ data: newStudent, status: 201, statusText: 'Created', headers: {}, config });
    }
  }

  // 4. FEES & DASHBOARD
  if (cleanUrl === 'fees/dues') {
    config.adapter = async () => ({ data: getDB('db_dues'), status: 200, statusText: 'OK', headers: {}, config });
  }

  if (cleanUrl === 'dashboard/stats') {
    const students = getDB('db_students');
    const dues = getDB('db_dues');
    const paid = dues.filter((d: any) => d.status === 'PAID');
    config.adapter = async () => ({
      data: {
        totalCollection: `₹${(paid.reduce((a: any, b: any) => a + (b.total_due || 0), 0) / 1000).toFixed(1)}K`,
        activeStudents: students.length,
        defaulters: dues.filter((d: any) => d.status === 'OVERDUE').length,
        lateFeeCollected: "₹0",
        revenueTrend: [ { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 }, { month: 'Mar', revenue: 65000 } ],
        paymentHealth: [ { name: 'Paid', value: paid.length, color: '#22c55e' }, { name: 'Unpaid', value: (dues.length - paid.length), color: '#ef4444' } ]
      },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  // Catch-all
  if (!config.adapter) {
    config.adapter = async () => ({
      data: { status: "success", message: "Processed by Omni-Engine" },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  return config;
});

export default api;
