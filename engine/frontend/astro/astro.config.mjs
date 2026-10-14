// ============================================================
// ASTRO CONFIG — Arkzen Astro Stack
// Astro v7 | React 19 | Tailwind v4 | Node SSR
// ============================================================

import { fileURLToPath } from 'node:url'
import { defineConfig }  from 'astro/config'
import react             from '@astrojs/react'
import node              from '@astrojs/node'
import tailwindcss       from '@tailwindcss/vite'
import wasm              from 'vite-plugin-wasm'
import topLevelAwait     from 'vite-plugin-top-level-await'

export default defineConfig({
  integrations: [
    react(),
  ],

  // ── SSR / Adapter ─────────────────────────────────────────
  adapter: node({ mode: 'standalone' }),
  output: 'server',

  // ── Security: Content Security Policy (Astro v6 built-in) ─
  security: {
    checkOrigin: true,
  },

  // ── Vite ──────────────────────────────────────────────────
  vite: {
    plugins: [
      tailwindcss(),   // Tailwind v4 — replaces postcss/autoprefixer
      wasm(),
      topLevelAwait(),
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          bypass: (req) => {
            if (req.url?.startsWith('/api/arkzen')) return req.url
            return null
          },
        },
        '/broadcasting': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@/arkzen/core': fileURLToPath(new URL('./arkzen/core', import.meta.url)),
        '@':             fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
})
