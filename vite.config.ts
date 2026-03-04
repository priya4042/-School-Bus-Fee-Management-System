
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
    } : true
  },
});
