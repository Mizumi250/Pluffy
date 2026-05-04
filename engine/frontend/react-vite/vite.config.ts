// ============================================================
// ARKZEN — Vite Config (React+Vite stack) v1.1
//
// v1.1: arkzenReadyPlugin — polls for src/arkzen/generated/.arkzen-ready
//   before allowing Vite's buildStart to proceed. This ensures the
//   initial dep scan never reads stale generated pages from a
//   previous session (race condition fix).
// ============================================================
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path  from 'path'
import fs    from 'fs'

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
      // Only gate during dev server startup, not production builds
      if (process.env.NODE_ENV === 'production') return

      const TIMEOUT_MS  = 60_000  // 60s max wait
      const POLL_MS     = 200
      const start       = Date.now()

      if (!isFreshReadyFlag(PROCESS_START_TS)) {
        process.stdout.write('[Arkzen Vite] ⏳ Waiting for Arkzen initial build')
      }

      while (!isFreshReadyFlag(PROCESS_START_TS)) {
        if (Date.now() - start > TIMEOUT_MS) {
          process.stdout.write('\n')
          console.warn('[Arkzen Vite] ⚠ Timed out waiting for Arkzen ready flag — starting anyway')
          return
        }
        process.stdout.write('.')
        await new Promise(r => setTimeout(r, POLL_MS))
      }

      if (Date.now() - start > 0) {
        process.stdout.write('\n')
      }
      console.log(`[Arkzen Vite] ✓ Pages ready — starting Vite dep scan`)
    },
  }
}

export default defineConfig({
  plugins: [
    arkzenReadyPlugin(),
    react(),
  ],
  resolve: {
    alias: [
      // @/arkzen/core → engine root arkzen/core  (matches Next.js structure)
      // Must be listed BEFORE the catch-all @/ rule
      {
        find: '@/arkzen/core',
        replacement: path.resolve(__dirname, './arkzen/core'),
      },
      // @/ → src/  (everything else: pages, layouts, arkzen/generated, etc.)
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
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html',
    },
  },
})
