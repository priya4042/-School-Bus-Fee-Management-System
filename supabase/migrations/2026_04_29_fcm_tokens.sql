-- FCM device tokens for push notifications.
-- One row per device-per-user. UNIQUE on (user_id, token) so the same
-- device re-registering is a no-op (upsert). RLS limits each user to
-- their own rows so a token leak from one device can't be used to spy
-- on another user's tokens.

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
