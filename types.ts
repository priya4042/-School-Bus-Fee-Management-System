export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PARENT = 'PARENT',
  ACCOUNTANT = 'ACCOUNTANT',
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
  full_name?: string;
  role: UserRole;
  admissionNumber?: string;
  phoneNumber?: string;
  secondaryPhoneNumber?: string; // New field for owners
  location?: string;
  preferences?: UserPreferences;
  lastLogin?: string;
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
  risk_score?: number;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
}

export interface MonthlyDue {
  id: string;
  student_id: string;
  month: number;
  year: number;
  base_fee: number;
  late_fee: number;
  fine_amount: number; // Fixed fine if late
  total_due: number;
  due_date: string;
  last_date: string; // Deadline after which fine applies
  status: PaymentStatus;
  discount: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  read: boolean;
  timestamp: string;
}

export interface AIInsight {
  type: 'PAYMENT_RISK' | 'FLEET_EFFICIENCY' | 'MAINTENANCE';
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actionLabel: string;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  base_fee: number;
  distance_km: number;
}