const browserOrigin = typeof window !== 'undefined' ? window.location.origin : '';

export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://pjovjynubnrvhwpnfnlw.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  // Use the environment variable as requested, fallback to Render URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://busway-backend-9maw.onrender.com',
  APP_URL: import.meta.env.VITE_APP_URL || browserOrigin,
  AUTH_REDIRECT_URL: import.meta.env.VITE_AUTH_REDIRECT_URL || `${import.meta.env.VITE_APP_URL || browserOrigin}/forgot-password`,
  
  OTP_PROVIDER: import.meta.env.VITE_OTP_PROVIDER || 'TWILIO',
  // MSG91 keys removed as requested

  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: import.meta.env.VITE_RAZORPAY_KEY_SECRET || '',

  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

  CAMERA_STREAM_BASE_URL: import.meta.env.VITE_CAMERA_STREAM_BASE_URL || '',
};

export const checkEnvWarnings = () => {
  const missing = [];
  if (!ENV.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!ENV.SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
  if (!ENV.RAZORPAY_KEY_ID) missing.push('RAZORPAY_KEY_ID');
  if (!ENV.GOOGLE_MAPS_API_KEY) missing.push('GOOGLE_MAPS_API_KEY');
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing API Keys in Environment Configuration:', missing.join(', '));
    console.warn('Please add these keys to your .env file for full functionality.');
  }
};
