// ============================================================
// ARKZEN — Vite Config (React+Inertia stack)
// Inertia uses Laravel as the entry point — Vite is asset-only
// Laravel serves the HTML shell; Inertia hydrates in browser
// 
// v1.1: arkzenReadyPlugin — polls for resources/js/arkzen/generated/.arkzen-ready
//   before allowing Vite's buildStart to proceed. This ensures the
//   initial dep scan never reads stale generated pages from a
//   previous session (race condition fix).
// ============================================================
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const READY_FLAG = path.resolve(__dirname, 'resources/js/arkzen/generated/.arkzen-ready')
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
        process.stdout.write('[Arkzen Inertia] ⏳ Waiting for Arkzen initial build')
      }

      while (!isFreshReadyFlag(PROCESS_START_TS)) {
        if (Date.now() - start > TIMEOUT_MS) {
          process.stdout.write('\n')
          console.warn('[Arkzen Inertia] ⚠ Timed out waiting for Arkzen ready flag — starting anyway')
          return
        }
        process.stdout.write('.')
        await new Promise(r => setTimeout(r, POLL_MS))
      }

      if (Date.now() - start > 0) {
        process.stdout.write('\n')
      }
      console.log(`[Arkzen Inertia] ✓ Pages ready — starting Vite dep scan`)
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
      {
        find: '@/arkzen/core',
        replacement: path.resolve(__dirname, './arkzen/core'),
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './resources/js'),
      },
    ],
  },
  build: {
    // Output goes into Laravel public/build — served by Laravel
    outDir: '../../backend/laravel/public/build',
    emptyOutDir: true,
    rollupOptions: {
      input: 'resources/js/app.tsx',
    },
    manifest: true,
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    // HMR connects to Vite dev server; Laravel proxies assets
    hmr: {
      host: 'localhost',
    },
  },
})
