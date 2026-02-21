import axios from 'axios';
import { DEFAULT_ROUTES, MOCK_STUDENTS, MOCK_DUES } from '../constants';
import { UserRole } from '../types';

/**
 * BusWay Pro - Enterprise Virtual Telemetry & Storage Controller
 */

// Custom Event Names
export const TELEMETRY_EVENT = 'busway_gps_update';
export const ARRIVAL_EVENT = 'busway_arrival_notice';

export const BusTelemetry = {
  broadcastLocation: (busId: string, lat: number, lng: number, speed: number) => {
    const data = { busId, lat, lng, speed, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent(TELEMETRY_EVENT, { detail: data }));
    // Also persist for page refreshes
    localStorage.setItem(`live_pos_${busId}`, JSON.stringify(data));
  },
  notifyArrival: (busId: string, busPlate: string) => {
    const data = { busId, busPlate, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent(ARRIVAL_EVENT, { detail: data }));
    
    // Log into shared notifications
    const notes = JSON.parse(localStorage.getItem('db_global_notifications') || '[]');
    notes.unshift({
      id: Math.random().toString(36).substr(2, 9),
      title: 'Bus Arrived',
      message: `Bus ${busPlate} has successfully reached the school campus.`,
      type: 'SUCCESS',
      timestamp: 'Just now'
    });
    localStorage.setItem('db_global_notifications', JSON.stringify(notes.slice(0, 20)));
  }
};

const MOCK_BUSES = [
  { id: 'b1', plate: 'KNG-01-A', model: 'Tata Starbus 40s', capacity: 40, status: 'On Route' },
  { id: 'b2', plate: 'KNG-02-B', model: 'Force Traveller', capacity: 20, status: 'Maintenance' },
];

const DEFAULT_SETTINGS = {
  cutoffDay: 10,
  gracePeriod: 2,
  dailyPenalty: 50,
  maxPenalty: 500,
  strictNoSkip: true,
  enforce2FA: false
};

export const getDBUsers = (): any[] => {
    try {
        const raw = localStorage.getItem('db_users');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
};

export const saveDBUser = (user: any) => {
    const users = getDBUsers();
    const normalizedUser = { 
        ...user, 
        email: user.email?.trim().toLowerCase(),
        fullName: user.fullName || user.full_name,
        full_name: user.fullName || user.full_name,
        phoneNumber: user.phoneNumber,
        secondaryPhoneNumber: user.secondaryPhoneNumber // Persist secondary number
    };
    
    const index = users.findIndex(u => u.email?.toLowerCase() === normalizedUser.email || (u.admissionNumber && u.admissionNumber === normalizedUser.admissionNumber));
    if (index !== -1) {
        users[index] = normalizedUser;
    } else {
        users.push(normalizedUser);
    }
    
    localStorage.setItem('db_users', JSON.stringify(users));
};

const initDB = () => {
  const tables = {
    'db_students': MOCK_STUDENTS,
    'db_routes': DEFAULT_ROUTES,
    'fee_dues': MOCK_DUES,
    'db_buses': MOCK_BUSES,
    'db_settings': DEFAULT_SETTINGS
  };

  Object.entries(tables).forEach(([key, defaultData]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultData));
    }
  });
  
  const users = getDBUsers();
  const adminEmail = 'admin@school.com';
  if (!users.some(u => u.email?.toLowerCase() === adminEmail)) {
    saveDBUser({ 
      id: 'u-admin-01', 
      email: adminEmail, 
      fullName: 'Fleet Owner', 
      role: UserRole.ADMIN, 
      password: 'admin123',
      verified: true,
      phoneNumber: '9000000000',
      secondaryPhoneNumber: '8000000000', // Default owner with two numbers
      created_at: new Date().toISOString()
    });
  }
};

initDB();

const api = axios.create({ baseURL: '/api/v1/' });

api.interceptors.request.use(async (config) => {
  const url = (config.url || '').replace(/^\/+/, '');
  
  await new Promise(res => setTimeout(res, 100));

  // Intercept stats
  if (url === 'dashboard/stats') {
    config.adapter = async () => ({
      data: {
        totalCollection: "₹12.4L",
        activeStudents: MOCK_STUDENTS.length,
        defaulters: 18,
        lateFeeCollected: "₹4,250",
        revenueTrend: [
          { month: 'Oct', revenue: 450000 }, { month: 'Nov', revenue: 520000 }, { month: 'Dec', revenue: 480000 },
          { month: 'Jan', revenue: 610000 }, { month: 'Feb', revenue: 590000 }, { month: 'Mar', revenue: 650000 }
        ]
      },
      status: 200, statusText: 'OK', headers: {}, config
    });
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

  return config;
});

export default api;