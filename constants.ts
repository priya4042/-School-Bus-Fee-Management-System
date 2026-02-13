
import { UserRole, PaymentStatus, Student, MonthlyDue } from './types';

export const APP_NAME = "BusWay Pro";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const MOCK_ADMIN_USER = {
  id: '1',
  email: 'admin@school.com',
  fullName: 'Administrator',
  role: UserRole.ADMIN
};

export const MOCK_PARENT_USER = {
  id: '2',
  email: 'parent@home.com',
  fullName: 'John Doe',
  role: UserRole.PARENT,
  admissionNumber: '1001'
};

// Fix: Use snake_case properties to match the Student interface
export const MOCK_STUDENTS: Student[] = [
  { id: 's1', admission_number: '1001', full_name: 'Alice Doe', class_name: '5th', section: 'A', route_name: 'North Zone', base_fee: 1500, status: 'active' },
  { id: 's2', admission_number: '1002', full_name: 'Bob Smith', class_name: '3rd', section: 'B', route_name: 'South Zone', base_fee: 1800, status: 'active' },
  { id: 's3', admission_number: '1003', full_name: 'Charlie Brown', class_name: '7th', section: 'C', route_name: 'East Zone', base_fee: 2000, status: 'active' }
];

// Fix: Use snake_case properties to match the MonthlyDue interface
export const MOCK_DUES: MonthlyDue[] = [
  { id: 'd1', student_id: 's1', month: 1, year: 2024, base_fee: 1500, late_fee: 0, discount: 0, total_due: 1500, due_date: '2024-01-10', status: PaymentStatus.PAID },
  { id: 'd2', student_id: 's1', month: 2, year: 2024, base_fee: 1500, late_fee: 0, discount: 0, total_due: 1500, due_date: '2024-02-10', status: PaymentStatus.PAID },
  { id: 'd3', student_id: 's1', month: 3, year: 2024, base_fee: 1500, late_fee: 150, discount: 0, total_due: 1650, due_date: '2024-03-10', status: PaymentStatus.OVERDUE },
  { id: 'd4', student_id: 's1', month: 4, year: 2024, base_fee: 1500, late_fee: 0, discount: 0, total_due: 1500, due_date: '2024-04-10', status: PaymentStatus.UNPAID },
];
