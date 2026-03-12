-- Payment email delivery audit log (safe append-only)
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

CREATE INDEX IF NOT EXISTS payment_email_logs_due_id_idx
  ON public.payment_email_logs (due_id);

CREATE INDEX IF NOT EXISTS payment_email_logs_transaction_id_idx
  ON public.payment_email_logs (transaction_id);

CREATE INDEX IF NOT EXISTS payment_email_logs_created_at_idx
  ON public.payment_email_logs (created_at DESC);
