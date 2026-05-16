// ============================================================
// ASTRO CONFIG — Arkzen Astro Stack
// ============================================================

import { defineConfig } from 'astro/config'
import react            from '@astrojs/react'
import tailwind         from '@astrojs/tailwind'

export default defineConfig({
  // React integration for island components
  integrations: [
    react(),
    tailwind(),
  ],

  // Vite config (shared with the Arkzen dev proxy)
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/broadcasting': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },

  // Output: hybrid (pages can be static or SSR individually)
  // Switch to 'static' for fully static output
  // Switch to 'server' for full SSR (requires Node adapter)
  output: 'hybrid',
})