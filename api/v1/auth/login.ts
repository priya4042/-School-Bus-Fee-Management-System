import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const jwtSecret = process.env.JWT_SECRET || 'your-fallback-secret-key';

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log(`[Login] Method ${req.method} not allowed`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { admission_number, password } = req.body;

  console.log(`[Login] Attempting login for admission_number: ${admission_number}`);

  if (!admission_number || !password) {
    console.log('[Login] Missing admission_number or password');
    return res.status(400).json({ error: 'Admission number and password are required' });
  }

  try {
    // 2. Check Supabase "parents" table
    const { data: parent, error } = await supabase
      .from('parents')
      .select('*')
      .eq('admission_number', admission_number)
      .single();

    if (error || !parent) {
      console.log(`[Login] Parent not found for admission_number: ${admission_number}`);
      return res.status(404).json({ error: 'Admission number not found' });
    }

    // 3. Verify password (plain text as requested)
    if (parent.password !== password) {
      console.log(`[Login] Invalid password for admission_number: ${admission_number}`);
      return res.status(401).json({ error: 'Invalid password' });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { 
        id: parent.id, 
        admission_number: parent.admission_number,
        role: 'PARENT'
      }, 
      jwtSecret, 
      { expiresIn: '24h' }
    );

    console.log(`[Login] Login successful for: ${admission_number}`);

    // 5. Return success response
    return res.status(200).json({
      parent: {
        id: parent.id,
        full_name: parent.full_name,
        admission_number: parent.admission_number,
        phone_number: parent.phone_number,
        email: parent.email
      },
      token
    });
  } catch (err: any) {
    console.error('[Login] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
