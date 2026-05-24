// ============================================================
// ARKZEN ENGINE — EXPO WATCHER v1.0
//
// Expo equivalent of nextjs/arkzen/core/watcher.ts.
// Watches the same tatemonos/ folder — same DSL, native output.
//
// Mirrors the web watcher pattern exactly:
//   add    → buildExpoTatemono()
//   change → rebuildExpoTatemono()
//   unlink → removeExpoTatemono()
//
// Also cleans stale modules on startup (same as web watcher).
// ============================================================

import * as path    from 'path'
import * as fs      from 'fs'
import chokidar     from 'chokidar'
import {
  buildExpoTatemono,
  rebuildExpoTatemono,
  removeExpoTatemono,
} from './expo-builder'
import { checkBackendHealth }           from './backend-bridge'
import { syncSharedCoreToCurrentStack } from './shared-sync'
import { getExpoRegistry, listExpoModules } from './expo-registry'

// Root is 3 levels up from engine/frontend/expo/arkzen/core/
const ROOT_DIR    = path.resolve(process.cwd(), '..', '..', '..')
const MODULES_DIR = path.join(ROOT_DIR, 'tatemonos')
const DEBOUNCE_MS = 500

const debounceMap = new Map<string, ReturnType<typeof setTimeout>>()

function debounce(key: string, fn: () => void, delay = DEBOUNCE_MS): void {
  const existing = debounceMap.get(key)
  if (existing) clearTimeout(existing)
  const timer = setTimeout(() => { fn(); debounceMap.delete(key) }, delay)
  debounceMap.set(key, timer)
}

function isValidTatemono(filePath: string): boolean {
  if (path.basename(filePath) !== 'core.tsx') return false
  if (!fs.existsSync(filePath)) return false
  const content = fs.readFileSync(filePath, 'utf-8')
  if (!content.includes('/* @arkzen:meta')) {
    console.log(`[Arkzen Expo Watcher] Not a valid tatemono (missing @arkzen:meta): ${filePath}`)
    return false
  }
  return true
}

async function rebuildAllFromRoot(): Promise<void> {
  console.log(`\n[Arkzen Expo] Scanning existing tatemonos...`)

  if (!fs.existsSync(MODULES_DIR)) {
    console.log(`[Arkzen Expo] No tatemonos directory found at ${MODULES_DIR}. Skipping.`)
    return
  }

  // Get all folders that have a core.tsx
  const existingFolders = new Set(
    fs.readdirSync(MODULES_DIR).filter(f => {
      const corePath = path.join(MODULES_DIR, f, 'core.tsx')
      try {
        return fs.statSync(path.join(MODULES_DIR, f)).isDirectory() && fs.existsSync(corePath)
      } catch { return false }
    })
  )

  // Clean up stale modules from registry
  const registry   = getExpoRegistry()
  let   staleCount = 0

  for (const module of registry.modules) {
    if (!existingFolders.has(module.name)) {
      console.log(`[Arkzen Expo] Cleaning up stale module: ${module.name}`)
      removeExpoTatemono(module.name)
      staleCount++
    }
  }

  if (staleCount > 0) {
    console.log(`[Arkzen Expo] ✓ Cleaned up ${staleCount} stale module(s)`)
  }

  if (existingFolders.size === 0) {
    console.log(`[Arkzen Expo] No tatemonos found. Engine ready for first drop.`)
    return
  }

  console.log(`[Arkzen Expo] Found ${existingFolders.size} tatemono(s). Building...`)
  for (const folder of existingFolders) {
    const corePath = path.join(MODULES_DIR, folder, 'core.tsx')
    await buildExpoTatemono(corePath)
  }
  console.log(`[Arkzen Expo] ✓ All tatemonos built\n`)
}

export async function startExpoWatcher(): Promise<void> {
  console.log(`\n╔══════════════════════════════════════════╗`)
  console.log(`║   ARKZEN ENGINE v1.0 — EXPO GO STACK    ║`)
  console.log(`╚══════════════════════════════════════════╝`)
  console.log(`[Arkzen Expo] Watching tatemonos at: ${MODULES_DIR}`)
  console.log(`[Arkzen Expo] Screens output:        src/screens/`)
  console.log(`[Arkzen Expo] Expo routes output:    app/`)
  console.log(`[Arkzen Expo] Route registry:        src/arkzen/generated/routes.ts`)
  console.log(`[Arkzen Expo] Styling:               NativeWind v4 (Tailwind className)`)
  console.log(`[Arkzen Expo] Navigation:             Expo Router (file-based)`)

  // Ensure tatemonos dir exists
  fs.mkdirSync(MODULES_DIR, { recursive: true })

  // Sync shared core files (parser, backend-bridge, assets, etc.)
  syncSharedCoreToCurrentStack('Arkzen Expo Watcher')

  // Check Laravel backend
  const backendHealthy = await checkBackendHealth()
  if (backendHealthy) {
    console.log(`[Arkzen Expo] ✓ Laravel backend is running`)
  } else {
    console.warn(`[Arkzen Expo] ⚠ Laravel backend not reachable — start it first with: node start.js`)
  }

  // Build all existing tatemonos on startup
  await rebuildAllFromRoot()

  console.log(`[Arkzen Expo] ✓ Engine ready. Drop tatemonos at: tatemonos/<name>/core.tsx\n`)

  // Watch for changes
  const watcher = chokidar.watch(MODULES_DIR, {
    ignored:          /(^|[\/\\])\../,
    persistent:       true,
    ignoreInitial:    true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  })

  watcher.on('add', (filePath: string) => {
    if (!isValidTatemono(filePath)) return
    const name = path.basename(path.dirname(filePath))
    debounce(`add:${filePath}`, async () => {
      console.log(`\n[Arkzen Expo] 📥 New tatemono: ${name}`)
      await buildExpoTatemono(filePath)
    })
  })

  watcher.on('change', (filePath: string) => {
    if (!isValidTatemono(filePath)) return
    const name = path.basename(path.dirname(filePath))
    debounce(`change:${filePath}`, async () => {
      console.log(`\n[Arkzen Expo] 🔄 Tatemono changed: ${name}`)
      await rebuildExpoTatemono(filePath)
    })
  })

  watcher.on('unlink', (filePath: string) => {
    if (path.basename(filePath) !== 'core.tsx') return
    const name = path.basename(path.dirname(filePath))
    debounce(`unlink:${filePath}`, () => {
      console.log(`\n[Arkzen Expo] 🗑 Tatemono removed: ${name}`)
      removeExpoTatemono(name)
    })
  })

  process.on('SIGINT',  () => { watcher.close(); process.exit(0) })
  process.on('SIGTERM', () => { watcher.close(); process.exit(0) })
}
