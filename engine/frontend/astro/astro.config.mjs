// ============================================================
// ASTRO CONFIG — Arkzen Astro Stack
// ============================================================

import { defineConfig } from 'astro/config'
import react            from '@astrojs/react'
import tailwindcss      from '@tailwindcss/vite'

export default defineConfig({
  // React integration for island components
  integrations: [
    react(),
  ],

  // Vite config (shared with the Arkzen dev proxy)
  vite: {
    plugins: [
      tailwindcss(),
    ],
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

  // Output: static (default for Astro 6)
  // For SSR, use 'server' with Node adapter
  output: 'static',
})