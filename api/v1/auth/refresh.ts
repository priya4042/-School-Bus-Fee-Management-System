import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'your-fallback-secret-key';

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
    console.log(`[Refresh] Method ${req.method} not allowed`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  console.log('[Refresh] Attempting token refresh');

  if (!token) {
    console.log('[Refresh] Missing token');
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // 2. Validate token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    console.log(`[Refresh] Token valid for user: ${decoded.admission_number}`);

    // 3. Generate new token
    const newToken = jwt.sign(
      { 
        id: decoded.id, 
        admission_number: decoded.admission_number,
        role: decoded.role 
      }, 
      jwtSecret, 
      { expiresIn: '24h' }
    );

    console.log(`[Refresh] Token refreshed successfully for: ${decoded.admission_number}`);

    // 4. Return new token
    return res.status(200).json({
      token: newToken
    });
  } catch (err: any) {
    console.error('[Refresh] Token validation failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
