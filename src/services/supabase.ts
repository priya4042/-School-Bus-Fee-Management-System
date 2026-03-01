import { createClient } from '@supabase/supabase-js';

// Environment variables are loaded in server.ts
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] CRITICAL: Credentials missing in supabase.ts');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
