import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch role from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      role: profile?.role || 'user',
      email: user.email
    };
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.some(role => role.toUpperCase() === req.user?.role.toUpperCase())) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
