// ============================================================
// FILE: frontend/vite.config.js
// Vite config — proxies /api/* to Django during development
// so you don't need CORS headers in dev mode.
// ============================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All /api/* requests forwarded to Django backend
      '/api': {
        target:    process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir:     '../services/backend/static/frontend',  // Django serves from here
    emptyOutDir: true,
  },
});