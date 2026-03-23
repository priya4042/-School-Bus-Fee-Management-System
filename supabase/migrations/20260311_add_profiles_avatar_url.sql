-- Ensure profiles.avatar_url exists across all environments
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Backfill from legacy preferences.avatar_url when available
UPDATE public.profiles
SET avatar_url = preferences->>'avatar_url'
WHERE avatar_url IS NULL
  AND preferences IS NOT NULL
  AND preferences ? 'avatar_url'
  AND NULLIF(preferences->>'avatar_url', '') IS NOT NULL;
