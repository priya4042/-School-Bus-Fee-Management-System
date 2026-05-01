-- =====================================================================
-- BusWayPro catch-up migration — runs every prior migration in one shot.
-- Safe to re-run (every statement uses IF NOT EXISTS / DROP-then-CREATE).
-- Use this whenever the production DB might be behind the repo migrations.
-- =====================================================================

-- From 20260311_add_profiles_avatar_url.sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
UPDATE public.profiles
   SET avatar_url = preferences->>'avatar_url'
 WHERE avatar_url IS NULL
   AND preferences IS NOT NULL
   AND preferences ? 'avatar_url'
   AND NULLIF(preferences->>'avatar_url','') IS NOT NULL;

-- From 20260311_fee_payment_alignment.sql
ALTER TABLE public.monthly_dues ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.receipts
  ADD COLUMN IF NOT EXISTS due_id uuid REFERENCES public.monthly_dues(id),
  ADD COLUMN IF NOT EXISTS receipt_no text,
  ADD COLUMN IF NOT EXISTS amount_paid numeric,
  ADD COLUMN IF NOT EXISTS payment_method text;
UPDATE public.receipts
   SET amount_paid    = COALESCE(amount_paid, amount),
       payment_method = COALESCE(payment_method, method)
 WHERE amount_paid IS NULL OR payment_method IS NULL;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type = ANY (ARRAY['INFO','SUCCESS','WARNING','DANGER',
                           'PAYMENT_SUCCESS','FEE_DUE','BUS_UPDATE']));
ALTER TABLE public.waiver_requests
  ADD COLUMN IF NOT EXISTS due_id uuid REFERENCES public.monthly_dues(id),
  ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.waiver_requests DROP CONSTRAINT IF EXISTS waiver_requests_status_check;
ALTER TABLE public.waiver_requests
  ADD CONSTRAINT waiver_requests_status_check
  CHECK (status = ANY (ARRAY['pending','approved','rejected',
                             'PENDING','APPROVED','REJECTED']));

-- From 20260312_payment_email_delivery_logs.sql
CREATE TABLE IF NOT EXISTS public.payment_email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  due_id UUID REFERENCES public.monthly_dues(id) ON DELETE SET NULL,
  transaction_id TEXT,
  recipient_email TEXT NOT NULL,
  recipient_role TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'EMAIL',
  provider TEXT DEFAULT 'RESEND',
  status TEXT NOT NULL,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS payment_email_logs_due_id_idx ON public.payment_email_logs (due_id);
CREATE INDEX IF NOT EXISTS payment_email_logs_transaction_id_idx ON public.payment_email_logs (transaction_id);
CREATE INDEX IF NOT EXISTS payment_email_logs_created_at_idx ON public.payment_email_logs (created_at DESC);

-- From 20260316_archive_deleted_students.sql
CREATE TABLE IF NOT EXISTS public.deleted_students (
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
CREATE INDEX IF NOT EXISTS idx_deleted_students_admission_number ON public.deleted_students (admission_number);
CREATE INDEX IF NOT EXISTS idx_deleted_students_deleted_at ON public.deleted_students (deleted_at DESC);
CREATE INDEX IF NOT EXISTS idx_deleted_students_original_student_id ON public.deleted_students (original_student_id);
ALTER TABLE public.deleted_students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage deleted students" ON public.deleted_students;
CREATE POLICY "Admins manage deleted students" ON public.deleted_students
  FOR ALL TO authenticated
  USING (auth.jwt()->>'role' IN ('ADMIN','SUPER_ADMIN'))
  WITH CHECK (auth.jwt()->>'role' IN ('ADMIN','SUPER_ADMIN'));

CREATE OR REPLACE FUNCTION public.archive_and_delete_student(
  p_student_id UUID,
  p_deleted_reason TEXT DEFAULT 'Deleted from admin module'
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student_snapshot JSONB;
  v_fee_record_count INTEGER := 0;
  v_paid_fee_record_count INTEGER := 0;
  v_outstanding_amount NUMERIC(10,2) := 0;
  v_deleted_archive_id UUID;
BEGIN
  SELECT to_jsonb(student_row) INTO v_student_snapshot
    FROM public.students AS student_row WHERE id = p_student_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Student not found for delete: %', p_student_id; END IF;
  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE UPPER(COALESCE(status::TEXT,''))='PAID'),
         COALESCE(SUM(CASE WHEN UPPER(COALESCE(status::TEXT,''))='PAID' THEN 0
                           ELSE COALESCE(total_due, amount, 0) END),0)
    INTO v_fee_record_count, v_paid_fee_record_count, v_outstanding_amount
    FROM public.monthly_dues WHERE student_id = p_student_id;
  INSERT INTO public.deleted_students (
    original_student_id, admission_number, full_name, grade, section,
    parent_id, parent_name, parent_phone, bus_id, route_id, boarding_point,
    monthly_fee, student_status, original_created_at, deleted_at, deleted_by,
    fee_record_count, paid_fee_record_count, outstanding_amount, deleted_reason, snapshot)
  VALUES (
    p_student_id,
    BTRIM(v_student_snapshot->>'admission_number'),
    v_student_snapshot->>'full_name',
    COALESCE(v_student_snapshot->>'grade', v_student_snapshot->>'class_name'),
    v_student_snapshot->>'section',
    NULLIF(v_student_snapshot->>'parent_id','')::UUID,
    v_student_snapshot->>'parent_name',
    v_student_snapshot->>'parent_phone',
    NULLIF(v_student_snapshot->>'bus_id','')::UUID,
    NULLIF(v_student_snapshot->>'route_id','')::UUID,
    v_student_snapshot->>'boarding_point',
    COALESCE(NULLIF(v_student_snapshot->>'monthly_fee','')::NUMERIC(10,2),0),
    v_student_snapshot->>'status',
    NULLIF(v_student_snapshot->>'created_at','')::TIMESTAMPTZ,
    NOW(), auth.uid(),
    v_fee_record_count, v_paid_fee_record_count, v_outstanding_amount,
    COALESCE(NULLIF(BTRIM(p_deleted_reason),''),'Deleted from admin module'),
    jsonb_build_object('student', v_student_snapshot)
  ) RETURNING id INTO v_deleted_archive_id;
  UPDATE public.profiles SET admission_number = NULL, updated_at = NOW()
   WHERE id = NULLIF(v_student_snapshot->>'parent_id','')::UUID
     AND admission_number = BTRIM(v_student_snapshot->>'admission_number');
  DELETE FROM public.students WHERE id = p_student_id;
  RETURN v_deleted_archive_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.archive_and_delete_student(UUID, TEXT) TO authenticated;

-- From 20260317_add_otp_logs_audit_logs.sql
CREATE TABLE IF NOT EXISTS public.otp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_logs_phone   ON public.otp_logs (phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_logs_expires ON public.otp_logs (expires_at);
ALTER TABLE public.otp_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages otp_logs" ON public.otp_logs;
CREATE POLICY "Service role manages otp_logs" ON public.otp_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Anon can insert otp_logs" ON public.otp_logs;
CREATE POLICY "Anon can insert otp_logs" ON public.otp_logs
  FOR INSERT TO anon WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user    ON public.audit_logs (user_id);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read audit_logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit_logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (auth.jwt()->>'role' IN ('ADMIN','SUPER_ADMIN'));
DROP POLICY IF EXISTS "Admins can insert audit_logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit_logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt()->>'role' IN ('ADMIN','SUPER_ADMIN'));
DROP POLICY IF EXISTS "Service role manages audit_logs" ON public.audit_logs;
CREATE POLICY "Service role manages audit_logs" ON public.audit_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- From 2026_04_29_fcm_tokens.sql
CREATE TABLE IF NOT EXISTS public.fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, token)
);
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user manages own tokens" ON public.fcm_tokens;
CREATE POLICY "user manages own tokens" ON public.fcm_tokens
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS fcm_tokens_user_idx ON public.fcm_tokens (user_id);

-- From 2026_04_30_features_pack.sql — Expenses + Holidays + Documents + discount columns
CREATE TABLE IF NOT EXISTS public.bus_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
  expense_type TEXT NOT NULL CHECK (expense_type IN ('fuel','service','repair','insurance','permit','other')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  fuel_litres NUMERIC(8,2),
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bus_expenses_bus_date_idx ON public.bus_expenses(bus_id, date DESC);
CREATE INDEX IF NOT EXISTS bus_expenses_type_idx     ON public.bus_expenses(expense_type);
ALTER TABLE public.bus_expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin all access bus_expenses" ON public.bus_expenses;
CREATE POLICY "admin all access bus_expenses" ON public.bus_expenses
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')));

CREATE TABLE IF NOT EXISTS public.bus_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bus_holidays_date_idx ON public.bus_holidays(date);
ALTER TABLE public.bus_holidays ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "all read bus_holidays" ON public.bus_holidays;
CREATE POLICY "all read bus_holidays" ON public.bus_holidays
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "admin write bus_holidays" ON public.bus_holidays;
CREATE POLICY "admin write bus_holidays" ON public.bus_holidays
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')));

CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('vaccine','medical','id_proof','birth_certificate','photo','other')),
  doc_url TEXT NOT NULL,
  doc_name TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS student_documents_student_idx ON public.student_documents(student_id);
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "parent self student docs" ON public.student_documents;
CREATE POLICY "parent self student docs" ON public.student_documents
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.parent_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.parent_id = auth.uid()));
DROP POLICY IF EXISTS "admin all student docs" ON public.student_documents;
CREATE POLICY "admin all student docs" ON public.student_documents
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')));

ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS sibling_discount_percent NUMERIC(5,2) DEFAULT 0
    CHECK (sibling_discount_percent >= 0 AND sibling_discount_percent <= 100);
ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS annual_prepay_discount_percent NUMERIC(5,2) DEFAULT 0
    CHECK (annual_prepay_discount_percent >= 0 AND annual_prepay_discount_percent <= 100);

-- Belt-and-suspenders: ensure the attendance unique used by parent Mark Absent
-- and admin attendance upserts (onConflict 'student_id,type,date') is in place.
-- If attendance table is missing entirely this is a no-op via DO block.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='attendance') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS attendance_student_type_date_uniq
      ON public.attendance (student_id, type, date);
  END IF;
END $$;

-- Force PostgREST to drop its cached schema so all new columns/tables appear immediately
NOTIFY pgrst, 'reload schema';
