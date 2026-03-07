// Removed problematic reference to vite/client to fix the "Cannot find type definition file" error.
// Manual type definitions for ImportMeta are provided to ensure type safety for Vite environment variables.
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STREAMING_URL: string
  readonly VITE_STREAMING_SERVER_SECRET: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_RAZORPAY_KEY_ID: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_OTP_PROVIDER: string
  readonly VITE_MSG91_AUTH_KEY: string
  readonly VITE_MSG91_TEMPLATE_ID: string
  readonly VITE_MSG91_SENDER_ID: string
  readonly VITE_RAZORPAY_KEY_SECRET: string
  readonly VITE_CAMERA_STREAM_BASE_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  google: any;
  Razorpay: any;
}
