import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In a real app, you'd verify the user's session here.
  // Since we're using Supabase Auth on the client, we might need to pass the token.
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Delete profile
    await supabase.from('profiles').delete().eq('id', user.id);

    // Delete auth user (requires service role)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    res.status(200).json({ success: true, message: 'Account deleted' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete account' });
  }
}
