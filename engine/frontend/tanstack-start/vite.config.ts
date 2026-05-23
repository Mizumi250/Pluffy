// ============================================================
// ARKZEN — Vite Config (TanStack Start stack) v1.4
//
// v1.1: arkzenReadyPlugin — polls for .arkzen-ready before Vite starts
// v1.2: proxy bypass for /api/arkzen/* (didn't work with TanStack Start)
// v1.3: arkzenApiPlugin — configureServer intercepts /api/arkzen/*
//   before the proxy middleware runs. Guaranteed to work regardless
//   of how TanStack Start wraps Vite internally. Same pattern as
//   react-vite stack. Laravel is never involved.
// v1.4: wasm + topLevelAwait plugins — fixes rapier2d/rapier3d ESM WASM
//   proposal error. Vite does not support bare .wasm ESM imports natively.
// ============================================================
import { defineConfig, type Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
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
      if (process.env.NODE_ENV === 'production') return

      const TIMEOUT_MS  = 60_000
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

      if (Date.now() - start > 0) process.stdout.write('\n')
      console.log(`[Arkzen TanStack] ✓ Pages ready — starting TanStack router generation`)
    },
  }
}

function arkzenApiPlugin(): Plugin {
  return {
    name: 'arkzen-api',
    configureServer(server) {
      // Intercept /api/arkzen/* before the proxy forwards to Laravel.
      // configureServer runs before proxy middleware in Vite's pipeline,
      // so this is guaranteed to fire regardless of proxy config.
      // Mirrors Next.js app/api/ and Astro src/pages/api/ — frontend owns it.
      server.middlewares.use('/api/arkzen/registry', (req, res, next) => {
        if (req.method !== 'GET') return next()
        try {
          const registryPath = path.resolve(import.meta.dirname, '..', '..', '..', 'arkzen.json')
          if (!fs.existsSync(registryPath)) {
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(200)
            res.end(JSON.stringify({ engine: '1.0.0', project: 'arkzen', modules: [] }))
            return
          }
          const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'))
          res.setHeader('Content-Type', 'application/json')
          res.writeHead(200)
          res.end(JSON.stringify(registry))
        } catch {
          res.setHeader('Content-Type', 'application/json')
          res.writeHead(500)
          res.end(JSON.stringify({ error: 'Failed to read registry' }))
        }
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
    tanstackStart(),
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