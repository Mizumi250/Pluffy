// ============================================================
// ASTRO CONFIG — Arkzen Astro Stack
// ============================================================

import { defineConfig } from 'astro/config'
import react            from '@astrojs/react'
import node             from '@astrojs/node'
import wasm             from 'vite-plugin-wasm'
import topLevelAwait    from 'vite-plugin-top-level-await'

export default defineConfig({
  integrations: [
    react(),
  ],

  adapter: node({ mode: 'standalone' }),
  output: 'server',

  vite: {
    plugins: [
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
        '@': new URL('./src', import.meta.url).pathname,
        '@/arkzen/core': new URL('./arkzen/core', import.meta.url).pathname,
      },
    },
  },
})