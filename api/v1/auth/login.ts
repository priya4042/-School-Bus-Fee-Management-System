import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Login] Missing Supabase environment variables');
}

// Use service role key to bypass RLS for profile lookup
const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

/**
 * Serverless function to handle user login via Supabase Auth.
 * Deployed at: /api/v1/auth/login
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

  const { email, identifier, password, type } = req.body;

  const loginIdentifier = identifier || email;
  console.log(`[Login] Attempting login for: ${loginIdentifier}, type: ${type || 'EMAIL'}`);

  if (!loginIdentifier || !password) {
    return res.status(400).json({ error: 'Identifier (or email) and password are required' });
  }

  try {
    let finalEmail = loginIdentifier;

    // If type is ADMISSION, we need to lookup the email first
    if (type === 'ADMISSION') {
      const admission = loginIdentifier.trim();
      console.log(`[Login] Looking up email for admission number: ${admission}`);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, admission_number')
        .eq('admission_number', admission)
        .maybeSingle();
      
      if (profileError) {
        console.error(`[Login] Supabase query error:`, profileError);
        return res.status(500).json({ error: 'Database error during login' });
      }
      
      if (!profile) {
        return res.status(404).json({ error: 'Admission number not found' });
      }
      
      if (!profile.email) {
        return res.status(400).json({ error: 'Please register first' });
      }
      
      finalEmail = profile.email;
      console.log(`[Login] Found email for admission ${admission}: ${finalEmail}`);
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password,
    });

    if (error) {
      console.error(`[Login] Supabase error: ${error.message}`);
      return res.status(error.status || 401).json({ error: error.message });
    }

    console.log(`[Login] Success for: ${finalEmail}`);
    
    // Return the session and user data
    return res.status(200).json(data);
  } catch (err: any) {
    console.error(`[Login] Unexpected error: ${err.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
