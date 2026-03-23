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

CREATE INDEX IF NOT EXISTS idx_deleted_students_admission_number
  ON public.deleted_students (admission_number);

CREATE INDEX IF NOT EXISTS idx_deleted_students_deleted_at
  ON public.deleted_students (deleted_at DESC);

CREATE INDEX IF NOT EXISTS idx_deleted_students_original_student_id
  ON public.deleted_students (original_student_id);

ALTER TABLE public.deleted_students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage deleted students" ON public.deleted_students;
CREATE POLICY "Admins manage deleted students"
ON public.deleted_students
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'ADMIN' OR auth.jwt()->>'role' = 'SUPER_ADMIN')
WITH CHECK (auth.jwt()->>'role' = 'ADMIN' OR auth.jwt()->>'role' = 'SUPER_ADMIN');

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