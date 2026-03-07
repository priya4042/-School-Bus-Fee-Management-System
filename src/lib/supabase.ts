import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.error("Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

// Create client only if configured, otherwise use a safe fallback that won't throw on initialization
export const supabase = createClient(
  supabaseUrl || 'https://pjovjynubnrvhwpnfnlw.supabase.co',
  supabaseAnonKey || 'placeholder-key-missing'
);

/**
 * Enterprise Audit Logger
 * Logs administrative and critical actions to the backend API.
 */
export const logAuditAction = async (action: string, entityType: string, entityId: string, changes?: any) => {
  if (!isSupabaseConfigured) return;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use the backend API for audit logs to ensure consistency and bypass client-side RLS if needed
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/audit-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
      },
      body: JSON.stringify({
        user_id: user?.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        new_values: changes
      })
    });

    if (!response.ok) {
      console.warn('Audit Log API Failure:', await response.text());
    }
  } catch (err) {
    console.error('Audit Log Sync Failure:', err);
  }
};
