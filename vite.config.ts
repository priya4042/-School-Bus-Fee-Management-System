
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = process.env.VITE_API_BASE_URL || 'https://busway-backend-9maw.onrender.com';

export default defineConfig({
  plugins: [react()],
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Split heavy libraries into their own chunks so the initial bundle
        // is small and these chunks can be cached separately by the CDN.
        // Result: faster first-paint, way better cache hit ratio on updates.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['recharts'],
          'pdf': ['jspdf', 'html2canvas'],
          'maps': ['leaflet', 'react-leaflet'],
          'excel': ['xlsx'],
          'icons': ['lucide-react'],
          'swal': ['sweetalert2'],
        },
      },
    },
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
