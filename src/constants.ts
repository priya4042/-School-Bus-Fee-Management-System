import { UserRole, PaymentStatus, Student, MonthlyDue, Route } from './types';

export const APP_NAME = "School Bus WayPro";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export const DEFAULT_ROUTES: Route[] = [
  { id: 'r1', route_name: 'Kangra Main Express', code: 'KNG-01', base_fee: 1800, distance_km: 15 },
  { id: 'r2', route_name: 'Kangra Valley Route', code: 'KNG-02', base_fee: 1600, distance_km: 12 },
  { id: 'r3', route_name: 'Dharamshala Link', code: 'DHM-01', base_fee: 2200, distance_km: 25 },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', admission_number: '1001', full_name: 'Rahul Sharma', grade: '5th', section: 'A', route_name: 'Kangra Main Express', monthly_fee: 1800, status: 'active' },
  { id: 's2', admission_number: '1002', full_name: 'Priya Verma', grade: '3rd', section: 'B', route_name: 'Kangra Valley Route', monthly_fee: 1600, status: 'active' },
];

export const MOCK_DUES: MonthlyDue[] = [
  { 
    id: 'd1', 
    student_id: 's1', 
    month: currentMonth, 
    year: currentYear, 
    amount: 1800,
    base_fee: 1800, 
    late_fee: 0, 
    fine_amount: 500,
    discount: 0, 
    total_due: 1800, 
    due_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-10`, 
    last_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
    status: PaymentStatus.UNPAID 
  },
  { 
    id: 'd2', 
    student_id: 's2', 
    month: currentMonth, 
    year: currentYear, 
    amount: 1600,
    base_fee: 1600, 
    late_fee: 0, 
    fine_amount: 500,
    discount: 0, 
    total_due: 1600, 
    due_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-10`, 
    last_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
    status: PaymentStatus.UNPAID 
  },
];
