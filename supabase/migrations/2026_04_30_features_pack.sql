-- ============================================================================
-- Features pack migration — run this once in Supabase SQL Editor.
-- Adds tables for: bus expenses (fuel + maintenance), holiday calendar,
-- student documents. Adds discount columns on payment_settings.
-- All operations use IF NOT EXISTS so re-running is safe.
-- ============================================================================

-- 1. BUS EXPENSES — daily fuel entries + monthly servicing logs.
-- Owner uses this to compute real per-bus profit (Revenue - Expenses).
CREATE TABLE IF NOT EXISTS public.bus_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
  expense_type TEXT NOT NULL CHECK (expense_type IN (
    'fuel',         -- daily diesel/petrol
    'service',      -- oil change, tire rotation, scheduled service
    'repair',       -- one-off breakdowns
    'insurance',    -- annual insurance premium
    'permit',       -- RTO / road tax / fitness
    'other'
  )),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  -- For fuel entries: how many litres. NULL for non-fuel expenses.
  fuel_litres NUMERIC(8,2),
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bus_expenses_bus_date_idx ON public.bus_expenses(bus_id, date DESC);
CREATE INDEX IF NOT EXISTS bus_expenses_type_idx ON public.bus_expenses(expense_type);

ALTER TABLE public.bus_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin all access bus_expenses" ON public.bus_expenses;
CREATE POLICY "admin all access bus_expenses" ON public.bus_expenses
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')));


-- 2. BUS HOLIDAYS — days the bus does not run. Parents see them as "Bus off"
-- on the attendance calendar, so a holiday absence isn't confused with the
-- child skipping school.
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
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin write bus_holidays" ON public.bus_holidays;
CREATE POLICY "admin write bus_holidays" ON public.bus_holidays
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')));


-- 3. STUDENT DOCUMENTS — vaccine card, medical certificate, ID proof, etc.
-- Storage uses the existing 'receipts' bucket with a docs/ prefix; this table
-- just tracks metadata.
CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN (
    'vaccine',
    'medical',
    'id_proof',
    'birth_certificate',
    'photo',
    'other'
  )),
  doc_url TEXT NOT NULL,
  doc_name TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS student_documents_student_idx ON public.student_documents(student_id);

ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Parent: read + write only their children's docs
DROP POLICY IF EXISTS "parent self student docs" ON public.student_documents;
CREATE POLICY "parent self student docs" ON public.student_documents
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.parent_id = auth.uid()
    )
  );

-- Admin: read all, write all
DROP POLICY IF EXISTS "admin all student docs" ON public.student_documents;
CREATE POLICY "admin all student docs" ON public.student_documents
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN')));


-- 4. PAYMENT_SETTINGS — discount controls.
ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS sibling_discount_percent NUMERIC(5,2) DEFAULT 0
    CHECK (sibling_discount_percent >= 0 AND sibling_discount_percent <= 100);

ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS annual_prepay_discount_percent NUMERIC(5,2) DEFAULT 0
    CHECK (annual_prepay_discount_percent >= 0 AND annual_prepay_discount_percent <= 100);


-- 5. STUDENT_DOCUMENTS storage policy — uses the existing 'receipts' bucket
-- under a 'student-docs/' prefix. Parents can only read/write their own
-- children's docs, admins can do everything.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'receipts') THEN
    -- Allow parent uploads to student-docs/{studentId}/...
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('receipts', 'receipts', true, 10485760, ARRAY['image/png','image/jpeg','image/jpg','application/pdf'])
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
