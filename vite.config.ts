import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Forwards same-origin `/api` to the backend, so the app works without
 * `VITE_API_BASE_URL` set and without CORS. Shared by dev and preview because
 * Vite keeps their proxy configuration separate.
 */
const API_PROXY = {
  '/api': {
    target: 'http://localhost:4100',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split only what every route needs anyway. Form libraries are
        // deliberately NOT listed: leaving them unchunked lets Rollup keep them
        // with the auth routes that are their only consumer.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: API_PROXY,
  },
  // `server.proxy` does NOT apply to `vite preview`; it needs its own block.
  // Without this, a preview build calling same-origin `/api` 404s on every
  // request — which is how the built app is usually smoke-tested.
  preview: {
    port: 4173,
    proxy: API_PROXY,
  },
});
