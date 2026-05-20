import { defineConfig, type Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const READY_FLAG = path.resolve(import.meta.dirname, 'src/arkzen/generated/.arkzen-ready')
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
      // Only gate during dev server startup, not production builds
      if (process.env.NODE_ENV === 'production') return

      const TIMEOUT_MS  = 60_000  // 60s max wait
      const POLL_MS     = 200
      const start       = Date.now()

      if (!isFreshReadyFlag(PROCESS_START_TS)) {
        process.stdout.write('[Arkzen TanStack] ⏳ Waiting for Arkzen initial build')
      }

      while (!isFreshReadyFlag(PROCESS_START_TS)) {
        if (Date.now() - start > TIMEOUT_MS) {
          process.stdout.write('\n')
          console.warn('[Arkzen TanStack] ⚠ Timed out waiting for Arkzen ready flag — starting anyway')
          return
        }
        process.stdout.write('.')
        await new Promise(r => setTimeout(r, POLL_MS))
      }

      if (Date.now() - start > 0) {
        process.stdout.write('\n')
      }
      console.log(`[Arkzen TanStack] ✓ Pages ready — starting TanStack router generation`)
    },
  }
}

export default defineConfig({
  plugins: [
    arkzenReadyPlugin(),
    tanstackStart({
      routers: {
        // Ignore /api/ folder — not page routes, just HTTP endpoints
        routeFileIgnorePattern: /^(api|_)/,
      },
    }),
    viteReact(), // must come AFTER tanstackStart
  ],
  resolve: {
    alias: [
      { find: '@/arkzen/core/adapters', replacement: path.resolve(import.meta.dirname, './arkzen/core/adapters') },
      { find: '@/arkzen/core', replacement: path.resolve(import.meta.dirname, './arkzen/core') },
      { find: '@', replacement: path.resolve(import.meta.dirname, './src') },
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