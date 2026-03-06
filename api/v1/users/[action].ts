import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (action === 'delete' && req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(404).json({ error: 'Not found or method not allowed' });
  }
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.warn('[Delete Account] Invalid session attempt');
      return res.status(401).json({ error: 'Invalid session' });
    }

    console.log(`[Delete Account] Deleting account for user: ${user.id}`);

    // Delete profile
    await supabase.from('profiles').delete().eq('id', user.id);

    // Delete auth user (requires service role)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    console.log(`[Delete Account] Success for user: ${user.id}`);
    res.status(200).json({ success: true, message: 'Account deleted' });
  } catch (error: any) {
    console.error('[Delete Account] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete account' });
  }
}
