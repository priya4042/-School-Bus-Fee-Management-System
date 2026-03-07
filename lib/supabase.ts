import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.error("Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

// Create client only if configured, otherwise use a safe fallback that won't throw on initialization
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url-missing.supabase.co',
  supabaseAnonKey || 'placeholder-key-missing'
);

/**
 * Enterprise Audit Logger
 * Logs administrative and critical actions to the Supabase audit_logs table.
 */
export const logAuditAction = async (action: string, entityType: string, entityId: string, changes?: any) => {
  if (!isSupabaseConfigured) return;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    return await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      new_values: changes ? JSON.stringify(changes) : null
    });
  } catch (err) {
    console.error('Audit Log Sync Failure:', err);
  }
};
