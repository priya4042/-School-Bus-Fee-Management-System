import { apiPost } from '../lib/api';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/swal';
import { ENV } from '../config/env';

const isDevMode = import.meta.env.DEV || import.meta.env.VITE_ALLOW_DEV_OTP === 'true';
const forcedOtpRecipient = import.meta.env.VITE_TWILIO_FORCE_TO_NUMBER?.trim();

const normalizeToE164India = (phone: string) => {
  const digits = String(phone || '').replace(/\D/g, '').slice(-10);
  return `+91${digits}`;
};

const getOtpRecipient = (requestedPhone: string) => {
  if (forcedOtpRecipient) {
    const normalized = forcedOtpRecipient.startsWith('+')
      ? `+${forcedOtpRecipient.replace(/\D/g, '')}`
      : normalizeToE164India(forcedOtpRecipient);
    return {
      requested: normalizeToE164India(requestedPhone),
      actual: normalized,
      forced: true,
    };
  }

  const normalized = normalizeToE164India(requestedPhone);
  return { requested: normalized, actual: normalized, forced: false };
};

const isTwilioUnverifiedError = (message?: string) => {
  const text = (message || '').toLowerCase();
  return text.includes('trial accounts cannot send messages to unverified numbers') || text.includes('unverified');
};

const sendViaTwilio = async (formattedPhone: string, otp: string): Promise<void> => {
  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  const fromPhone = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    const missingVars = [];
    if (!accountSid) missingVars.push('VITE_TWILIO_ACCOUNT_SID');
    if (!authToken) missingVars.push('VITE_TWILIO_AUTH_TOKEN');
    if (!fromPhone) missingVars.push('VITE_TWILIO_PHONE_NUMBER');
    
    console.warn('[Twilio] Missing environment variables:', missingVars.join(', '));
    console.warn('[Twilio] OTP will be displayed in console for development mode.');
    
    throw new Error('Twilio SMS service not fully configured. Using development mode fallback. OTP will be shown in console.');
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      },
      body: new URLSearchParams({
        From: fromPhone,
        To: formattedPhone,
        Body: `Your School Bus WayPro OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`,
      }).toString(),
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to send SMS');
  }
};

export const otpService = {
  sendOTP: async (phoneNumber: string, admissionNo?: string) => {
    try {
      if (!admissionNo?.trim()) throw new Error('Admission number is required');
      const recipient = getOtpRecipient(phoneNumber);

      // In local/dev, avoid slow API roundtrip and use direct fallback flow.
      if (isDevMode) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const formattedPhone = recipient.actual;
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        const { error: dbError } = await supabase.from('otp_logs').insert({
          phone_number: formattedPhone,
          otp_code: otp,
          is_verified: false,
          expires_at: expiresAt,
        });
        if (dbError) throw dbError;

        try {
          await sendViaTwilio(formattedPhone, otp);
          if (recipient.forced) {
            showToast(`OTP sent to test number ${recipient.actual}`, 'success');
          }
          return { success: true, error: null as string | null, devOtp: undefined as string | undefined };
        } catch (twilioError: any) {
          if (isTwilioUnverifiedError(twilioError?.message)) {
            showToast(`DEV OTP: ${otp}`, 'success');
            return {
              success: true,
              error: null as string | null,
              warning: 'Twilio trial restriction; using DEV OTP fallback',
              devOtp: otp,
            };
          }
          throw twilioError;
        }
      }

      try {
        await apiPost('v1/otp', 'send', {
          phone: recipient.actual,
          admissionNumber: admissionNo.trim(),
        }, 'POST');
        if (recipient.forced) {
          showToast(`OTP sent to test number ${recipient.actual}`, 'success');
        }
        return { success: true, error: null as string | null };
      } catch (_apiError) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const formattedPhone = recipient.actual;
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        const { error: dbError } = await supabase.from('otp_logs').insert({
          phone_number: formattedPhone,
          otp_code: otp,
          is_verified: false,
          expires_at: expiresAt,
        });
        if (dbError) throw dbError;

        try {
          await sendViaTwilio(formattedPhone, otp);
        } catch (twilioError: any) {
          if (isDevMode && isTwilioUnverifiedError(twilioError?.message)) {
            showToast(`DEV OTP: ${otp}`, 'success');
            console.warn('[OTP][DEV] Twilio trial restriction detected, using dev OTP fallback:', otp);
            return {
              success: true,
              error: null as string | null,
              warning: 'Twilio trial restriction; using DEV OTP fallback',
              devOtp: otp,
            };
          }
          throw twilioError;
        }

        if (recipient.forced) {
          showToast(`OTP sent to test number ${recipient.actual}`, 'success');
        }

        return { success: true, error: null as string | null };
      }
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  },

  verifyOTP: async (phoneNumber: string, otp: string, admissionNo?: string) => {
    try {
      const recipient = getOtpRecipient(phoneNumber);

      if (admissionNo?.trim()) {
        try {
          const data = await apiPost('v1/otp', 'verify', {
            phone: recipient.actual,
            otp: otp.trim(),
            admissionNumber: admissionNo.trim(),
          }, 'POST');

          showToast('Phone verified successfully', 'success');
          return { success: true, data, error: null as string | null };
        } catch (_apiError) {
          // fall through to DB verification fallback
        }
      }

      const formattedPhone = recipient.actual;
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('otp_logs')
        .select('*')
        .eq('phone_number', formattedPhone)
        .eq('otp_code', otp.trim())
        .eq('is_verified', false)
        .gte('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Invalid or expired OTP. Please request a new one.');

      await supabase.from('otp_logs').update({ is_verified: true }).eq('id', data[0].id);

      showToast('Phone verified successfully', 'success');
      return { success: true, data: data[0], error: null as string | null };
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      return { success: false, error: error.message || 'Invalid OTP' };
    }
  },

  sendForgotPasswordOTP: async (identifier: string, _type: 'ADMIN' | 'PARENT') => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const recipient = getOtpRecipient(identifier);
      const formattedPhone = recipient.actual;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Store OTP in Supabase first
      const { error: dbError } = await supabase.from('otp_logs').insert({
        phone_number: formattedPhone,
        otp_code: otp,
        is_verified: false,
        expires_at: expiresAt,
      });
      if (dbError) throw dbError;

      // Try to send via Twilio
      try {
        await sendViaTwilio(formattedPhone, otp);
        if (recipient.forced) {
          showToast(`OTP sent to test number ${recipient.actual}`, 'success');
        }
        return { success: true, error: null };
      } catch (twilioError: any) {
        // If Twilio is not configured or trial account restriction, use fallback in dev mode
        if (isDevMode || isTwilioUnverifiedError(twilioError?.message) || twilioError?.message?.includes('not configured')) {
          showToast(`📱 OTP Generated: ${otp}. Check console for details.`, 'success');
          console.warn('========================================');
          console.warn('🔐 [DEV MODE] OTP FOR PASSWORD RESET:');
          console.warn(`📱 Phone: ${formattedPhone}`);
          console.warn(`🔑 OTP Code: ${otp}`);
          console.warn('⏱️  Valid for 5 minutes');
          console.warn('⚡ Copy and paste in the form below ⬇️');
          console.warn('========================================');
          
          // Save to sessionStorage for easy access
          sessionStorage.setItem('devOTP', otp);
          sessionStorage.setItem('devPhone', formattedPhone);
          
          return { success: true, error: null };
        }
        throw twilioError;
      }
    } catch (error: any) {
      console.error('[OTP] Password reset error:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  },

  resetPassword: async (_profileId: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  },

  resetPasswordWithPhone: async (phone: string, otp: string, newPassword: string, admissionNumber?: string, role?: string) => {
    try {
      const payload = { phone, otp, newPassword, admissionNumber, role };

      const endpointAttempts: Array<() => Promise<any>> = [
        () => apiPost('v1/otp', 'reset-password', payload, 'POST'),
        () => apiPost('otp', 'reset-password', payload, 'POST'),
        async () => {
          const response = await fetch('/api/v1/otp/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const contentType = response.headers.get('content-type') || '';
          const data = contentType.includes('application/json')
            ? await response.json()
            : { error: `Server returned non-JSON response: ${response.status}` };

          if (!response.ok) {
            throw new Error(data?.error || data?.message || `Reset failed (${response.status})`);
          }

          return data;
        },
      ];

      let lastError: any = null;
      for (const attempt of endpointAttempts) {
        try {
          await attempt();
          return { success: true };
        } catch (err) {
          lastError = err;
        }
      }

      // Fallback: if API endpoint is unavailable, trigger standard Supabase reset email
      const normalizedPhone = normalizeToE164India(phone);
      let resolvedEmail: string | null = null;

      if ((role || '').toUpperCase() === 'PARENT' && admissionNumber?.trim()) {
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('parent_id')
          .eq('admission_number', admissionNumber.trim())
          .maybeSingle();

        if (!studentError && student?.parent_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', student.parent_id)
            .maybeSingle();
          resolvedEmail = profile?.email || null;
        }
      } else {
        const digits = normalizedPhone.replace('+91', '');
        
        // First try to find by phone number
        let query = supabase
          .from('profiles')
          .select('email, phone_number')
          .or(`phone_number.eq.${digits},phone_number.eq.${normalizedPhone},phone_number.eq.+91${digits}`);

        const { data: profileByPhone } = (role || '').toUpperCase() === 'ADMIN'
          ? await query.in('role', ['ADMIN', 'SUPER_ADMIN']).maybeSingle()
          : await query.maybeSingle();

        if (profileByPhone?.email) {
          resolvedEmail = profileByPhone.email;
        } else if ((role || '').toUpperCase() === 'ADMIN') {
          // For admin, also try finding any admin/super_admin (in case phone number isn't stored)
          const { data: adminProfiles } = await supabase
            .from('profiles')
            .select('email')
            .in('role', ['ADMIN', 'SUPER_ADMIN'])
            .limit(1);
          
          if (adminProfiles && adminProfiles.length > 0) {
            resolvedEmail = adminProfiles[0].email;
          }
        }
      }

      if (!resolvedEmail) {
        throw lastError || new Error('Unable to resolve account email for password reset. Please try again or contact support.');
      }

      // Validate email format before sending to Supabase
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(resolvedEmail)) {
        console.error('[PASSWORD RESET] Invalid email in database:', resolvedEmail);
        throw new Error(`Invalid email address on file (${resolvedEmail}). Please contact your administrator to fix your email address.`);
      }

      const { error: emailResetError } = await supabase.auth.resetPasswordForEmail(resolvedEmail, {
        redirectTo: ENV.AUTH_REDIRECT_URL,
      });
      if (emailResetError) {
        throw emailResetError;
      }

      return { success: true, mode: 'EMAIL_LINK_SENT', email: resolvedEmail };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }
};
