// ============================================================
// ARKZEN — TanStack Start App Config (Vite-native, no Vinxi)
// TanStack Start 1.x uses Vite directly. defineConfig is
// imported from @tanstack/start/config which wraps Vite.
// ============================================================
import { defineConfig } from '@tanstack/start/config'
import path from 'path'

export default defineConfig({
  vite: {
    resolve: {
      alias: [
        // @/arkzen/core/adapters → this stack's own adapters (most specific first)
        {
          find: '@/arkzen/core/adapters',
          replacement: path.resolve(import.meta.dirname, './arkzen/core/adapters'),
        },
        // @/arkzen/core → local stack copy (synced from engine/shared)
        {
          find: '@/arkzen/core',
          replacement: path.resolve(import.meta.dirname, './arkzen/core'),
        },
        // @/ → src/ (pages, arkzen/generated, etc.)
        {
          find: '@',
          replacement: path.resolve(import.meta.dirname, './src'),
        },
      ],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  },

  // TanStack Start SSR — set to false if you want SPA-only mode
  server: {
    preset: 'node-server',
  },
})
