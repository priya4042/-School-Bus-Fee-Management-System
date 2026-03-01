-- BusWay Pro Enterprise Production Schema v2
-- Optimized for PostgreSQL (Supabase)

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Role Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'parent', 'driver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'parent',
    phone_number TEXT,
    admission_number TEXT, -- For parents/students linking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Users View (to satisfy 'public.users' requirement in legacy code)
CREATE OR REPLACE VIEW public.users AS SELECT * FROM public.profiles;

-- 5. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    employee_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Parents Table
CREATE TABLE IF NOT EXISTS public.parents (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Drivers Table
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    license_number TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Routes Table
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_name TEXT NOT NULL,
    route_code TEXT UNIQUE,
    start_point TEXT NOT NULL,
    end_point TEXT NOT NULL,
    distance_km DECIMAL(10,2),
    base_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.1 Stops Table
CREATE TABLE IF NOT EXISTS public.stops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    stop_name TEXT NOT NULL,
    sequence_order INTEGER NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    eta_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Buses Table
CREATE TABLE IF NOT EXISTS public.buses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bus_number TEXT UNIQUE NOT NULL,
    model TEXT,
    capacity INTEGER NOT NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admission_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    grade TEXT,
    section TEXT,
    parent_id UUID REFERENCES public.parents(id) ON DELETE SET NULL,
    parent_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    bus_id UUID REFERENCES public.buses(id) ON DELETE SET NULL,
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    monthly_fee DECIMAL(10,2) DEFAULT 0,
    boarding_point TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'graduated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 11. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.parents(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    billing_month TEXT NOT NULL, -- Format: YYYY-MM
    due_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
    payment_method TEXT CHECK (payment_method IN ('online', 'cash')),
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    receipt_id TEXT UNIQUE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Bus Locations Table (GPS Tracking)
CREATE TABLE IF NOT EXISTS public.bus_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    speed DECIMAL(5,2),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Camera Configs Table
CREATE TABLE IF NOT EXISTS public.camera_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
    rtsp_url TEXT NOT NULL,
    streaming_url TEXT, -- Transcoded HLS/WebRTC URL
    username TEXT,
    password TEXT,
    port INTEGER DEFAULT 554,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Boarding Point Requests
CREATE TABLE IF NOT EXISTS public.boarding_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE,
    requested_boarding_point TEXT NOT NULL,
    current_boarding_point TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Fee Waiver Requests
CREATE TABLE IF NOT EXISTS public.waiver_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Support Tickets (Chat)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('alert', 'payment', 'general', 'bus_arrival')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. OTP Logs Table
CREATE TABLE IF NOT EXISTS public.otp_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_students_parent ON public.students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_bus ON public.students(bus_id);
CREATE INDEX IF NOT EXISTS idx_bus_locations_bus_time ON public.bus_locations(bus_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_payments_student_month ON public.payments(student_id, billing_month);

-- 21. Trigger to create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, admission_number)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'parent'::user_role),
    NEW.raw_user_meta_data->>'admission_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 22. Default Settings
INSERT INTO public.settings (key, value) VALUES 
('fee_rules', '{"due_day": 5, "fine_rules": [{"days": 5, "amount": 50}, {"days": 15, "amount": 100}, {"days": 30, "amount": 200}]}'::jsonb)
ON CONFLICT (key) DO NOTHING;
