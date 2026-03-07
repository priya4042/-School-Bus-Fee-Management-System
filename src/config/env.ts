export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://pjovjynubnrvhwpnfnlw.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  // Force empty string to use relative paths (same origin) since we are running a unified server on port 3000
  API_BASE_URL: '',
  
  OTP_PROVIDER: import.meta.env.VITE_OTP_PROVIDER || 'MSG91',
  MSG91_AUTH_KEY: import.meta.env.VITE_MSG91_AUTH_KEY || '',
  MSG91_TEMPLATE_ID: import.meta.env.VITE_MSG91_TEMPLATE_ID || '',
  MSG91_SENDER_ID: import.meta.env.VITE_MSG91_SENDER_ID || '',

  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: import.meta.env.VITE_RAZORPAY_KEY_SECRET || '',

  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

  CAMERA_STREAM_BASE_URL: import.meta.env.VITE_CAMERA_STREAM_BASE_URL || '',
};

export const checkEnvWarnings = () => {
  const missing = [];
  if (!ENV.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!ENV.RAZORPAY_KEY_ID) missing.push('RAZORPAY_KEY_ID');
  if (!ENV.GOOGLE_MAPS_API_KEY) missing.push('GOOGLE_MAPS_API_KEY');
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing API Keys in Environment Configuration:', missing.join(', '));
    console.warn('Please add these keys to your .env file for full functionality.');
  }
};
