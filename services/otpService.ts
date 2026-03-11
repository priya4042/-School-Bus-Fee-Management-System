import { apiPost } from '../lib/api';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/swal';

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
    throw new Error('SMS service not configured. Contact admin.');
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

      const { error: dbError } = await supabase.from('otp_logs').insert({
        phone_number: formattedPhone,
        otp_code: otp,
        is_verified: false,
        expires_at: expiresAt,
      });
      if (dbError) throw dbError;

      await sendViaTwilio(formattedPhone, otp);
      if (recipient.forced) {
        showToast(`OTP sent to test number ${recipient.actual}`, 'success');
      }
      return { success: true, error: null };
    } catch (error: any) {
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
      await apiPost('otp', 'reset-password', { phone, otp, newPassword, admissionNumber, role }, 'POST');
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }
};
