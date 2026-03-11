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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, otp, newPassword, admissionNumber } = req.body;
  if (!phone || !otp || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let formattedPhone = String(phone).trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone.replace(/\D/g, '')}`;
    } else {
      formattedPhone = `+${formattedPhone.replace(/\D/g, '')}`;
    }

    let profileRes;
    if (admissionNumber) {
      profileRes = await supabase
        .from('profiles')
        .select('id, preferences')
        .eq('admission_number', admissionNumber.trim())
        .maybeSingle();
    } else {
      profileRes = await supabase
        .from('profiles')
        .select('id, preferences')
        .filter("preferences->>temp_phone", 'eq', formattedPhone)
        .maybeSingle();
    }

    if (profileRes.error) throw profileRes.error;
    const profile = profileRes.data || profileRes;
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const prefs = (profile.preferences || {}) as any;
    if (!prefs || prefs.otp !== String(otp) || prefs.temp_phone !== formattedPhone) {
      return res.status(400).json({ error: 'Invalid OTP or phone mismatch' });
    }

    if (Date.now() > (prefs.otp_expiry || 0)) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    const userId = profile.id;
    if (!userId) return res.status(500).json({ error: 'Unable to determine user id' });

    // Update user password using service role
    try {
      const { data: updatedUser, error: updateErr } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      const userEmail = updatedUser?.user?.email;
      console.log(`[OTP Reset] Password updated for userId=${userId}, email=${userEmail}`);

      try {
        const { data: existingProfile } = await supabase.from('profiles').select('email').eq('id', userId).maybeSingle();
        if (existingProfile && !existingProfile.email && userEmail) {
          await supabase.from('profiles').update({ email: userEmail }).eq('id', userId);
          console.log(`[OTP Reset] profiles.email populated for userId=${userId}`);
        }
      } catch (e) {
        console.warn('[OTP Reset] Failed to populate profile email:', e);
      }

      await supabase.from('profiles').update({ preferences: {} }).eq('id', userId);
      return res.status(200).json({ success: true, message: 'Password reset successful', userId, updatedUser });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update password' });
    }
  } catch (error: any) {
    console.error('[OTP Reset] Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to reset password' });
  }
}
