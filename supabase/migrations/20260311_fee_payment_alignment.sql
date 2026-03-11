-- Fee/Payment schema alignment migration (2026-03-11)
-- Safe to run multiple times where possible.

-- 1) monthly_dues: payment method support
ALTER TABLE public.monthly_dues
  ADD COLUMN IF NOT EXISTS payment_method text;

-- 2) receipts: support current app receipt model (due-based)
ALTER TABLE public.receipts
  ADD COLUMN IF NOT EXISTS due_id uuid REFERENCES public.monthly_dues(id),
  ADD COLUMN IF NOT EXISTS receipt_no text,
  ADD COLUMN IF NOT EXISTS amount_paid numeric,
  ADD COLUMN IF NOT EXISTS payment_method text;

-- Optional backfill for legacy rows
UPDATE public.receipts
SET amount_paid = COALESCE(amount_paid, amount),
    payment_method = COALESCE(payment_method, method)
WHERE amount_paid IS NULL OR payment_method IS NULL;

-- Optional strict uniqueness for receipt numbers
-- CREATE UNIQUE INDEX IF NOT EXISTS receipts_receipt_no_uniq ON public.receipts(receipt_no);

-- 3) notifications: allow payment-success semantic types used by app
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type = ANY (ARRAY[
    'INFO'::text,
    'SUCCESS'::text,
    'WARNING'::text,
    'DANGER'::text,
    'PAYMENT_SUCCESS'::text,
    'FEE_DUE'::text,
    'BUS_UPDATE'::text
  ]));

-- 4) waiver_requests: support due-based waiver audit logs
ALTER TABLE public.waiver_requests
  ADD COLUMN IF NOT EXISTS due_id uuid REFERENCES public.monthly_dues(id),
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- 5) waiver status: support both uppercase/lowercase states used across environments
ALTER TABLE public.waiver_requests
  DROP CONSTRAINT IF EXISTS waiver_requests_status_check;

ALTER TABLE public.waiver_requests
  ADD CONSTRAINT waiver_requests_status_check
  CHECK (status = ANY (ARRAY[
    'pending'::text,
    'approved'::text,
    'rejected'::text,
    'PENDING'::text,
    'APPROVED'::text,
    'REJECTED'::text
  ]));
