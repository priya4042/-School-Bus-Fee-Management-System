
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * Robust environment variable retrieval.
 * Supports both Vite's import.meta.env and Node-style process.env injection.
 */
const getEnv = (key: string): string => {
  try {
    // Check import.meta.env first (standard for Vite)
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) return metaEnv[key];
    
    // Fallback to process.env (often used in serverless/container environments)
    const procEnv = (process as any).env;
    if (procEnv && procEnv[key]) return procEnv[key];
  } catch (e) {
    // Silently fall back if process or import.meta are completely missing
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Initialize the Supabase client.
// Note: Supabase requires a valid URL and Anon Key. Ensure these are configured
// in your deployment environment variables.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Enterprise Audit Logger
 * Logs administrative and critical actions to the Supabase audit_logs table.
 */
export const logAuditAction = async (action: string, entityType: string, entityId: string, changes?: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    return await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes: changes || {}
    });
  } catch (err) {
    console.error('Audit Log Sync Failure:', err);
  }
};
