// ============================================================
// ARKZEN — TanStack Start Vite Config v1.0
//
// TanStack Start 1.x is Vite-native. The @tanstack/react-start
// Vite plugin handles SSR, server functions, and routing.
// arkzenReadyPlugin waits for the engine's initial build before
// Vite scans deps — same pattern as the react-vite stack.
// ============================================================
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import path from 'path'
import fs from 'fs'

const READY_FLAG = path.resolve(__dirname, 'src/arkzen/generated/.arkzen-ready')
const PROCESS_START_TS = Date.now()

function isFreshReadyFlag(minTimestamp: number): boolean {
  if (!fs.existsSync(READY_FLAG)) return false
  try {
    return fs.statSync(READY_FLAG).mtimeMs >= minTimestamp
  } catch {
    return false
  }
}

function arkzenReadyPlugin(): Plugin {
  return {
    name: 'arkzen-ready',
    async buildStart() {
      if (process.env.NODE_ENV === 'production') return

      const TIMEOUT_MS = 60_000
      const POLL_MS    = 200
      const start      = Date.now()

      if (!isFreshReadyFlag(PROCESS_START_TS)) {
        process.stdout.write('[Arkzen TanStack] ⏳ Waiting for Arkzen initial build')
      }

      while (!isFreshReadyFlag(PROCESS_START_TS)) {
        if (Date.now() - start > TIMEOUT_MS) {
          process.stdout.write('\n')
          console.warn('[Arkzen TanStack] ⚠ Timed out waiting for ready flag — starting anyway')
          return
        }
        process.stdout.write('.')
        await new Promise(r => setTimeout(r, POLL_MS))
      }

      if (Date.now() - start > 0) process.stdout.write('\n')
      console.log('[Arkzen TanStack] ✓ Pages ready — starting Vite')
    },
  }
}

export default defineConfig({
  plugins: [
    arkzenReadyPlugin(),
    tanstackStart({
      // Entry points
      client: { entry: './src/client.tsx' },
      ssr:    { entry: './src/server.tsx' },
      // SSR preset
      server: { preset: 'node-server' },
    }),
    react(),
  ],
  resolve: {
    alias: [
      {
        find: '@/arkzen/core/adapters',
        replacement: path.resolve(__dirname, './arkzen/core/adapters'),
      },
      {
        find: '@/arkzen/core',
        replacement: path.resolve(__dirname, './arkzen/core'),
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
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
})
