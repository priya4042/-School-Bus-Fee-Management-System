
-- BUSWAY PRO - ENTERPRISE SCHEMA (SUPABASE/POSTGRES)

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'PARENT', 'TEACHER', 'DRIVER');
CREATE TYPE payment_status AS ENUM ('PAID', 'UNPAID', 'OVERDUE', 'PARTIAL');
CREATE TYPE bus_status AS ENUM ('ON_ROUTE', 'IDLE', 'MAINTENANCE');

-- 2. TABLES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role user_role DEFAULT 'PARENT',
  phone_number TEXT,
  admission_number TEXT, -- For Parents
  staff_id TEXT,         -- For Staff
  license_no TEXT,       -- For Drivers
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  base_fee NUMERIC(10,2) NOT NULL,
  distance_km NUMERIC(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.buses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plate TEXT UNIQUE NOT NULL,
  model TEXT,
  capacity INTEGER DEFAULT 40,
  driver_id UUID REFERENCES public.profiles(id),
  route_id UUID REFERENCES public.routes(id),
  status bus_status DEFAULT 'IDLE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admission_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  class_name TEXT,
  section TEXT,
  parent_id UUID REFERENCES public.profiles(id),
  route_id UUID REFERENCES public.routes(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.fee_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  base_fee NUMERIC(10,2),
  late_fee NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total_paid NUMERIC(10,2) DEFAULT 0,
  status payment_status DEFAULT 'UNPAID',
  transaction_id TEXT,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, month, year)
);

CREATE TABLE public.bus_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  speed NUMERIC(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REALTIME CONFIG
ALTER PUBLICATION supabase_realtime ADD TABLE public.bus_locations;

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_transactions ENABLE ROW LEVEL SECURITY;

-- Admins see all
CREATE POLICY "Admins have full access" ON public.profiles FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'ADMIN' OR auth.jwt()->>'role' = 'SUPER_ADMIN');

-- Parents see only their children
CREATE POLICY "Parents see their children" ON public.students FOR SELECT TO authenticated USING (parent_id = auth.uid());
CREATE POLICY "Parents see their children's fees" ON public.fee_transactions FOR SELECT TO authenticated 
USING (student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()));

-- Drivers see their own location
CREATE POLICY "Drivers update own location" ON public.bus_locations FOR ALL TO authenticated USING (bus_id IN (SELECT id FROM public.buses WHERE driver_id = auth.uid()));

-- 5. SEED DATA
-- Insert initial route
INSERT INTO public.routes (name, code, base_fee, distance_km) VALUES ('Kangra Main Express', 'KNG-01', 1800.00, 15.0);
