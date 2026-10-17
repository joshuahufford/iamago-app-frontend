import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// The dev proxy below only exists in `vite dev`. A production build with no
// VITE_API_BASE_URL falls back to '/api', which resolves to whatever host serves
// the bundle — not the backend — and every call 404s with nothing obviously
// wrong. Warn loudly at build time rather than let that ship quietly.
if (process.env.NODE_ENV === 'production' && !process.env.VITE_API_BASE_URL) {
  console.warn(
    '\n  WARNING: building without VITE_API_BASE_URL.\n' +
      '  API calls will go to this site\'s own origin at /api.\n' +
      '  Set it to your backend, e.g. https://api.iamago.com/api\n',
  );
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Proxying /api in dev means the browser sees a same-origin API and we
    // never depend on CORS locally.
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
