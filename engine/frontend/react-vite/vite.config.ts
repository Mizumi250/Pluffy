// ============================================================
// ARKZEN — Vite Config (React+Vite stack) v1.3
//
// v1.1: arkzenReadyPlugin — polls for src/arkzen/generated/.arkzen-ready
//   before allowing Vite's buildStart to proceed. This ensures the
//   initial dep scan never reads stale generated pages from a
//   previous session (race condition fix).
// v1.2: arkzenApiPlugin — intercepts /api/arkzen/* in dev server
//   before the proxy can forward it to Laravel. Mirrors the pattern
//   used by Next.js (app/api/) and Astro (src/pages/api/) where the
//   frontend framework owns its own internal API routes.
// v1.3: wasm + topLevelAwait — fixes rapier2d/rapier3d ESM WASM proposal
//   error. Vite does not support bare .wasm ESM imports natively.
// ============================================================
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
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

function arkzenApiPlugin(): Plugin {
  return {
    name: 'arkzen-api',
    configureServer(server) {
      // Intercept /api/arkzen/* before the proxy forwards to Laravel.
      // This stack owns these routes — same pattern as Next.js app/api/
      // and Astro src/pages/api/. Laravel is never involved.
      server.middlewares.use('/api/arkzen/registry', (req, res, next) => {
        if (req.method !== 'GET') return next()
        import('./src/api/arkzen/registry').then(({ GET }) => {
          GET(req, res)
        }).catch(() => {
          res.writeHead(500)
          res.end(JSON.stringify({ error: 'Registry handler failed' }))
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    arkzenApiPlugin(),
    arkzenReadyPlugin(),
    react(),
  ],
  resolve: {
    alias: [
      // @/arkzen/core/adapters → this stack's own adapters (MUST be first — more specific)
      // Each stack owns only its adapters/ folder (Link.tsx etc.)
      {
        find: '@/arkzen/core/adapters',
        replacement: path.resolve(__dirname, './arkzen/core/adapters'),
      },
      // @/arkzen/core → local stack copy
      // synced from engine/shared on Arkzen build/start
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