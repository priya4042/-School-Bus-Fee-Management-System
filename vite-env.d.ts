// Removed problematic reference to vite/client to fix the "Cannot find type definition file" error.
// Manual type definitions for ImportMeta are provided to ensure type safety for Vite environment variables.
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STREAMING_URL: string
  readonly VITE_STREAMING_SERVER_SECRET: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_RAZORPAY_KEY_ID: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
