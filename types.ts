export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PARENT = 'PARENT',
  DRIVER = 'DRIVER'
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  OVERDUE = 'OVERDUE',
  PARTIAL = 'PARTIAL',
  PENDING = 'PENDING'
}

export enum PaymentMethod {
  CASH = 'CASH',
  ONLINE = 'ONLINE',
  UPI = 'UPI',
  CARD = 'CARD',
  NETBANKING = 'NETBANKING'
}

export interface UserPreferences {
  sms: boolean;
  email: boolean;
  push: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  fullName?: string; // Alias for full_name
  role: UserRole;
  admission_number?: string;
  admissionNumber?: string; // Alias for admission_number
  phone_number?: string;
  phoneNumber?: string; // Alias for phone_number
  secondaryPhoneNumber?: string;
  fleet_security_token?: string;
  fleetSecurityToken?: string; // Alias for fleet_security_token
  location?: string;
  avatar_url?: string;
  preferences?: UserPreferences;
  created_at?: string;
}

export interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  class_name: string;
  section: string;
  parent_id?: string;
  parent_phone?: string;
  bus_id?: string;
  route_id?: string;
  route_name?: string;
  boarding_point?: string;
  monthly_fee: number;
  base_fee?: number; // Alias or specific base fee
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  risk_score?: number;
  routes?: any; // For joined data
  buses?: any; // For joined data
  created_at?: string;
}

export interface MonthlyDue {
  id: string;
  student_id: string;
  month: number;
  year: number;
  amount: number;
  base_fee?: number;
  total_due?: number;
  late_fine: number;
  late_fee?: number; // Alias for late_fine
  fine_amount?: number; // Alias for late_fine
  discount?: number;
  due_date: string;
  last_date?: string;
  status: PaymentStatus;
  paid_at?: string;
  created_at?: string;
  students?: Partial<Student>;
}

export interface Receipt {
  id: string;
  due_id: string;
  receipt_no: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
  generated_by?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'FEE_DUE' | 'PAYMENT_SUCCESS' | 'BUS_UPDATE' | 'SUCCESS' | 'WARNING';
  is_read: boolean;
  read?: boolean; // Alias for is_read
  created_at: string;
  timestamp?: string; // Alias for created_at
}

export interface Route {
  id: string;
  name: string;
  code: string;
  base_fee: number;
  distance_km: number;
  is_active: boolean;
}

export interface Bus {
  id: string;
  plate: string;
  model: string;
  capacity: number;
  driver_id?: string;
  route_id?: string;
  status: 'ON_ROUTE' | 'IDLE' | 'MAINTENANCE';
}

export interface CameraConfig {
  id: string;
  bus_id: string;
  name: string;
  stream_url: string;
  is_active: boolean;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'OPTIMIZATION' | 'WARNING' | 'INFO' | 'PAYMENT_RISK' | 'FLEET_EFFICIENCY';
  impact: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  actionLabel?: string;
}

export interface Defaulter {
  id: string;
  studentId?: string;
  student_name: string;
  studentName?: string;
  admission_number: string;
  amount_due: number;
  totalAmount?: number;
  months_overdue: number;
  last_payment_date?: string;
  class?: string;
  section?: string;
  parentName?: string;
  parentPhone?: string;
  month?: number;
  year?: number;
  daysOverdue?: number;
}
