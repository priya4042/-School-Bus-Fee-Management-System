
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  DRIVER = 'DRIVER'
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  OVERDUE = 'OVERDUE',
  PARTIAL = 'PARTIAL'
}

export interface UserPreferences {
  sms: boolean;
  email: boolean;
  push: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  full_name?: string; // Support for backend snake_case
  role: UserRole;
  admissionNumber?: string;
  phoneNumber?: string;
  staffId?: string;
  licenseNo?: string;
  location?: string;
  preferences?: UserPreferences;
}

export interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  class_name: string;
  section: string;
  route_name?: string;
  base_fee: number;
  status: 'active' | 'inactive';
}

export interface MonthlyDue {
  id: string;
  student_id: string;
  month: number;
  year: number;
  base_fee: number;
  late_fee: number;
  discount: number;
  total_due: number;
  due_date: string;
  status: PaymentStatus;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  base_fee: number;
  // Fix: Added distance_km property to match usage in pages/Routes.tsx
  distance_km: number;
}
