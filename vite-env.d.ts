// Removed problematic reference to vite/client to fix the "Cannot find type definition file" error.
// Manual type definitions for ImportMeta are provided to ensure type safety for Vite environment variables.
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
