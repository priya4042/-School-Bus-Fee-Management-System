import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Refresh] Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Serverless function to handle token refresh via Supabase Auth.
 * Deployed at: /api/v1/auth/refresh
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Set CORS headers for cross-origin requests from the frontend
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refresh_token } = req.body;

  console.log('[Refresh] Attempting session refresh');

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    // Refresh the session with Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      console.error(`[Refresh] Supabase error: ${error.message}`);
      return res.status(error.status || 401).json({ error: error.message });
    }

    console.log('[Refresh] Success');
    
    // Return the new session data
    return res.status(200).json(data);
  } catch (err: any) {
    console.error(`[Refresh] Unexpected error: ${err.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
