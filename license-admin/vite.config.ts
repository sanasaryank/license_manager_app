import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Backend base derived from production env (used only as the proxy target in dev).
// In dev, VITE_API_BASE_URL is overridden to '' via .env.development so that fetch()
// uses relative paths that the Vite proxy intercepts below.
const PROXY_TARGET = 'https://license.trio.am';
const PROXY_PATH_PREFIX = '/dev';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // All API calls are prefixed with /api in dev (VITE_API_BASE_URL=/api).
      // This avoids the proxy matching SPA routes like /login or /customers on page refresh.
      '^/api': {
        target: PROXY_TARGET,
        changeOrigin: true,
        rewrite: (p) => `${PROXY_PATH_PREFIX}${p.replace(/^\/api/, '')}`,
        headers: {
          Origin: 'license.trio.am',
          'X-Origin': 'license.trio.am',
        },
        cookieDomainRewrite: '',      // remove Domain → cookie stored for localhost
        cookiePathRewrite: { '/dev': '/' }, // fix Path=/dev → Path=/ so cookie is sent for all /api/* paths
      },
    },
  },
});
