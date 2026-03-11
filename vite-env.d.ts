// Removed problematic reference to vite/client to fix the "Cannot find type definition file" error.
// Manual type definitions for ImportMeta are provided to ensure type safety for Vite environment variables.
interface ImportMetaEnv {
  readonly DEV: boolean
  readonly VITE_ALLOW_DEV_OTP?: string
  readonly VITE_API_BASE_URL: 'https://busway-backend-9maw.onrender.com'
  readonly VITE_APP_URL?: string
  readonly VITE_AUTH_REDIRECT_URL?: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STREAMING_URL: string
  readonly VITE_STREAMING_SERVER_SECRET: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_RAZORPAY_KEY_ID: string
  readonly VITE_SUPABASE_URL: 'https://pjovjynubnrvhwpnfnlw.supabase.co'
  readonly VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb3ZqeW51Ym5ydmh3cG5mbmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzEwNjcsImV4cCI6MjA4NzY0NzA2N30.SkEOaLUY6o1MrmGXgilW_hNA0fi6fvKWURES82UVp8M'
  readonly VITE_OTP_PROVIDER: string
  readonly VITE_MSG91_AUTH_KEY: string
  readonly VITE_MSG91_TEMPLATE_ID: string
  readonly VITE_MSG91_SENDER_ID: string
  readonly VITE_RAZORPAY_KEY_SECRET: string
  readonly VITE_CAMERA_STREAM_BASE_URL: string
  readonly VITE_TWILIO_ACCOUNT_SID: string
  readonly VITE_TWILIO_AUTH_TOKEN: string
  readonly VITE_TWILIO_PHONE_NUMBER: string
  readonly VITE_TWILIO_FORCE_TO_NUMBER?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  google: any;
  Razorpay: any;
}
