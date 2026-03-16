
-- BUSWAY PRO - ENTERPRISE SCHEMA (SUPABASE/POSTGRES)
-- RECREATION SCRIPT (DROPS EXISTING TABLES)

-- 0. CLEANUP
DROP TABLE IF EXISTS public.waiver_requests CASCADE;
DROP TABLE IF EXISTS public.bus_locations CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.monthly_dues CASCADE;
DROP TABLE IF EXISTS public.deleted_students CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.camera_configs CASCADE;
DROP TABLE IF EXISTS public.buses CASCADE;
DROP TABLE IF EXISTS public.routes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. ENUMS (Create if not exists)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'PARENT', 'DRIVER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PAID', 'UNPAID', 'OVERDUE', 'PARTIAL', 'PENDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('CASH', 'ONLINE', 'UPI', 'CARD', 'NETBANKING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bus_status AS ENUM ('ON_ROUTE', 'IDLE', 'MAINTENANCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE student_status AS ENUM ('ACTIVE', 'INACTIVE', 'GRADUATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role user_role DEFAULT 'PARENT',
  phone_number TEXT UNIQUE,
  admission_number TEXT UNIQUE, -- For Parents to link their account
  password TEXT, -- Added as per user request (should be hashed)
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"sms": true, "email": true, "push": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  base_fee NUMERIC(10,2) NOT NULL,
  distance_km NUMERIC(5,2),
  start_point TEXT,
  end_point TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.buses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_number TEXT UNIQUE NOT NULL,
  vehicle_number TEXT UNIQUE NOT NULL,
  model TEXT,
  capacity INTEGER DEFAULT 40,
  driver_name TEXT,
  driver_phone TEXT,
  route_id UUID REFERENCES public.routes(id),
  status bus_status DEFAULT 'IDLE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.camera_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stream_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admission_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  grade TEXT,
  section TEXT,
  parent_id UUID REFERENCES public.profiles(id),
  bus_id UUID REFERENCES public.buses(id),
  route_id UUID REFERENCES public.routes(id),
  boarding_point TEXT,
  monthly_fee NUMERIC(10,2) DEFAULT 0,
  status student_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.deleted_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_student_id UUID,
  admission_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  grade TEXT,
  section TEXT,
  parent_id UUID,
  parent_name TEXT,
  parent_phone TEXT,
  bus_id UUID,
  route_id UUID,
  boarding_point TEXT,
  monthly_fee NUMERIC(10,2) DEFAULT 0,
  student_status TEXT,
  original_created_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_by UUID REFERENCES public.profiles(id),
  fee_record_count INTEGER NOT NULL DEFAULT 0,
  paid_fee_record_count INTEGER NOT NULL DEFAULT 0,
  outstanding_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  deleted_reason TEXT DEFAULT 'Deleted from admin module',
  snapshot JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE INDEX idx_deleted_students_admission_number ON public.deleted_students (admission_number);
CREATE INDEX idx_deleted_students_deleted_at ON public.deleted_students (deleted_at DESC);
CREATE INDEX idx_deleted_students_original_student_id ON public.deleted_students (original_student_id);

CREATE TABLE public.monthly_dues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  late_fee NUMERIC(10,2) DEFAULT 0,
  due_date DATE NOT NULL,
  last_date DATE,
  fine_after_days INTEGER DEFAULT 5,
  fine_per_day NUMERIC(10,2) DEFAULT 50,
  status payment_status DEFAULT 'UNPAID',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, month, year)
);

CREATE TABLE public.receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  due_id UUID REFERENCES public.monthly_dues(id) ON DELETE CASCADE,
  receipt_no TEXT UNIQUE NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_method payment_method DEFAULT 'ONLINE',
  transaction_id TEXT,
  generated_by UUID REFERENCES public.profiles(id), -- Admin who generated it
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO', -- INFO, FEE_DUE, PAYMENT_SUCCESS, BUS_UPDATE
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  bus_id UUID REFERENCES public.buses(id),
  status TEXT DEFAULT 'PRESENT', -- PRESENT, ABSENT
  type TEXT DEFAULT 'PICKUP', -- PICKUP, DROP
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.bus_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  speed NUMERIC(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.waiver_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  due_id UUID REFERENCES public.monthly_dues(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.profiles(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REALTIME CONFIG
-- (These might fail if publication already exists, so we wrap or ignore)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bus_locations;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiver_requests ENABLE ROW LEVEL SECURITY;

-- Admins see all
CREATE POLICY "Admins have full access" ON public.profiles FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'ADMIN' OR auth.jwt()->>'role' = 'SUPER_ADMIN');
CREATE POLICY "Admins manage students" ON public.students FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'ADMIN' OR auth.jwt()->>'role' = 'SUPER_ADMIN');
CREATE POLICY "Admins manage deleted students" ON public.deleted_students FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'ADMIN' OR auth.jwt()->>'role' = 'SUPER_ADMIN') WITH CHECK (auth.jwt()->>'role' = 'ADMIN' OR auth.jwt()->>'role' = 'SUPER_ADMIN');
CREATE POLICY "Admins manage dues" ON public.monthly_dues FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'ADMIN' OR auth.jwt()->>'role' = 'SUPER_ADMIN');

-- Allow anon to read admission_number and email for login purposes
CREATE POLICY "Anon can read admission for login" ON public.profiles FOR SELECT TO anon USING (true);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());

-- Parents see only their children and related data
CREATE POLICY "Parents see their children" ON public.students FOR SELECT TO authenticated USING (parent_id = auth.uid());
CREATE POLICY "Parents see their children's dues" ON public.monthly_dues FOR SELECT TO authenticated 
USING (student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()));
CREATE POLICY "Parents see their receipts" ON public.receipts FOR SELECT TO authenticated 
USING (due_id IN (SELECT id FROM public.monthly_dues WHERE student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid())));

CREATE OR REPLACE FUNCTION public.archive_and_delete_student(
  p_student_id UUID,
  p_deleted_reason TEXT DEFAULT 'Deleted from admin module'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_snapshot JSONB;
  v_fee_record_count INTEGER := 0;
  v_paid_fee_record_count INTEGER := 0;
  v_outstanding_amount NUMERIC(10,2) := 0;
  v_deleted_archive_id UUID;
BEGIN
  SELECT to_jsonb(student_row)
  INTO v_student_snapshot
  FROM public.students
  AS student_row
  WHERE id = p_student_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found for delete: %', p_student_id;
  END IF;

  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE UPPER(COALESCE(status::TEXT, '')) = 'PAID'),
    COALESCE(
      SUM(
        CASE
          WHEN UPPER(COALESCE(status::TEXT, '')) = 'PAID' THEN 0
          ELSE COALESCE(total_due, amount, 0)
        END
      ),
      0
    )
  INTO v_fee_record_count, v_paid_fee_record_count, v_outstanding_amount
  FROM public.monthly_dues
  WHERE student_id = p_student_id;

  INSERT INTO public.deleted_students (
    original_student_id,
    admission_number,
    full_name,
    grade,
    section,
    parent_id,
    parent_name,
    parent_phone,
    bus_id,
    route_id,
    boarding_point,
    monthly_fee,
    student_status,
    original_created_at,
    deleted_at,
    deleted_by,
    fee_record_count,
    paid_fee_record_count,
    outstanding_amount,
    deleted_reason,
    snapshot
  )
  VALUES (
    p_student_id,
    BTRIM(v_student_snapshot->>'admission_number'),
    v_student_snapshot->>'full_name',
    COALESCE(v_student_snapshot->>'grade', v_student_snapshot->>'class_name'),
    v_student_snapshot->>'section',
    NULLIF(v_student_snapshot->>'parent_id', '')::UUID,
    v_student_snapshot->>'parent_name',
    v_student_snapshot->>'parent_phone',
    NULLIF(v_student_snapshot->>'bus_id', '')::UUID,
    NULLIF(v_student_snapshot->>'route_id', '')::UUID,
    v_student_snapshot->>'boarding_point',
    COALESCE(NULLIF(v_student_snapshot->>'monthly_fee', '')::NUMERIC(10,2), 0),
    v_student_snapshot->>'status',
    NULLIF(v_student_snapshot->>'created_at', '')::TIMESTAMPTZ,
    NOW(),
    auth.uid(),
    v_fee_record_count,
    v_paid_fee_record_count,
    v_outstanding_amount,
    COALESCE(NULLIF(BTRIM(p_deleted_reason), ''), 'Deleted from admin module'),
    jsonb_build_object(
      'student', v_student_snapshot,
      'route', (
        SELECT to_jsonb(route_row)
        FROM public.routes AS route_row
        WHERE route_row.id = NULLIF(v_student_snapshot->>'route_id', '')::UUID
      ),
      'bus', (
        SELECT to_jsonb(bus_row)
        FROM public.buses AS bus_row
        WHERE bus_row.id = NULLIF(v_student_snapshot->>'bus_id', '')::UUID
      )
    )
  )
  RETURNING id INTO v_deleted_archive_id;

  UPDATE public.profiles
  SET admission_number = NULL,
      updated_at = NOW()
  WHERE id = NULLIF(v_student_snapshot->>'parent_id', '')::UUID
    AND admission_number = BTRIM(v_student_snapshot->>'admission_number');

  DELETE FROM public.students
  WHERE id = p_student_id;

  RETURN v_deleted_archive_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.archive_and_delete_student(UUID, TEXT) TO authenticated;
CREATE POLICY "Parents see their notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Parents manage their waiver requests" ON public.waiver_requests FOR ALL TO authenticated USING (parent_id = auth.uid());
