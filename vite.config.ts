
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = process.env.VITE_API_BASE_URL || 'https://busway-backend-9maw.onrender.com';

export default defineConfig({
  plugins: [react()],
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    hmr: process.env.NODE_ENV === 'production' ? {
      protocol: 'wss',
      clientPort: 443
    } : true,
    proxy: {
      // Proxy API calls to the backend during development to avoid CORS issues
      '^/api/.*': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
});
