export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://pjovjynubnrvhwpnfnlw.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  // Use the environment variable as requested, fallback to Render URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://busway-backend-9maw.onrender.com',

  OTP_PROVIDER: import.meta.env.VITE_OTP_PROVIDER || 'TWILIO',

  PAYU_MERCHANT_KEY: import.meta.env.VITE_PAYU_MERCHANT_KEY || '',

  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

  CAMERA_STREAM_BASE_URL: import.meta.env.VITE_CAMERA_STREAM_BASE_URL || '',
};

export const checkEnvWarnings = () => {
  const missing = [];
  if (!ENV.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!ENV.PAYU_MERCHANT_KEY) missing.push('PAYU_MERCHANT_KEY');
  if (!ENV.GOOGLE_MAPS_API_KEY) missing.push('GOOGLE_MAPS_API_KEY');

  if (missing.length > 0) {
    console.warn('⚠️ Missing API Keys in Environment Configuration:', missing.join(', '));
    console.warn('Please add these keys to your .env file for full functionality.');
  }
};
