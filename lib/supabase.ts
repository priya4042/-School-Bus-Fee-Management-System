
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env as any).VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

/**
 * Enterprise Audit Logger
 * Logs administrative and critical actions to the Supabase audit_logs table.
 */
export const logAuditAction = async (action: string, entityType: string, entityId: string, changes?: any) => {
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
