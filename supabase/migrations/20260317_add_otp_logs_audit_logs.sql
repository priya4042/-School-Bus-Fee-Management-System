-- Migration: Add otp_logs and audit_logs tables
-- otp_logs: stores OTP codes for phone verification during parent registration
-- audit_logs: stores admin action history for the Audit Logs page

-- otp_logs table (used by /api/v1/otp/send.ts and /api/v1/otp/verify.ts)
CREATE TABLE IF NOT EXISTS public.otp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_logs_phone ON public.otp_logs (phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_logs_expires ON public.otp_logs (expires_at);

-- Cleanup old expired OTPs automatically via RLS (service role only)
ALTER TABLE public.otp_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages otp_logs"
  ON public.otp_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anon to insert (OTP send from Vercel serverless uses service_role client,
-- but adding anon policy too for local dev compatibility)
CREATE POLICY "Anon can insert otp_logs"
  ON public.otp_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- audit_logs table (used by pages/AuditLogs.tsx)
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
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs (user_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit_logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'ADMIN' OR auth.jwt()->>'role' = 'SUPER_ADMIN');

CREATE POLICY "Admins can insert audit_logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'role' = 'ADMIN' OR auth.jwt()->>'role' = 'SUPER_ADMIN');

CREATE POLICY "Service role manages audit_logs"
  ON public.audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
