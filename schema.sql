-- BusWay Pro Enterprise Production Schema
-- Optimized for PostgreSQL (Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Unified for Admin, Parent, Driver)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'parent', 'driver')),
    admission_number TEXT UNIQUE, -- Used for Parent Login/Registration
    is_verified BOOLEAN DEFAULT false,
    refresh_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete support
);

-- 2. Buses Table
CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_number TEXT NOT NULL UNIQUE,
    plate_number TEXT NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    driver_id UUID REFERENCES users(id),
    camera_url TEXT, -- RTSP/HLS Stream URL
    status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'maintenance')),
    last_latitude DECIMAL(9,6),
    last_longitude DECIMAL(9,6),
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. Routes Table
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name TEXT NOT NULL,
    start_point TEXT,
    end_point TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. Stops Table
CREATE TABLE stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    stop_name TEXT NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    pickup_time TIME,
    drop_time TIME,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Students Table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_number TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    grade TEXT,
    section TEXT,
    parent_id UUID REFERENCES users(id),
    bus_id UUID REFERENCES buses(id),
    route_id UUID REFERENCES routes(id),
    monthly_fee DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 6. Payments Table (Razorpay Integrated)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    parent_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    billing_month TEXT NOT NULL, -- Format: YYYY-MM
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('alert', 'payment', 'general')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. GPS Logs (High Frequency Data)
CREATE TABLE gps_logs (
    id BIGSERIAL PRIMARY KEY,
    bus_id UUID REFERENCES buses(id),
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    speed DECIMAL(5,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. OTP Logs
CREATE TABLE otp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_admission ON users(admission_number);
CREATE INDEX idx_students_admission ON students(admission_number);
CREATE INDEX idx_gps_logs_bus_time ON gps_logs(bus_id, timestamp DESC);
CREATE INDEX idx_payments_student_month ON payments(student_id, billing_month);

-- RLS Policies (Basic Example)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view their students" ON students FOR SELECT USING (parent_id = auth.uid());
