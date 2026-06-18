// ============================================================
// ARKZEN ENGINE — NATIVE WATCHER v2.0
// Watches tatemonos/ and calls native-builder on changes.
//
// v2.0 — Updated for full wire-up.
//   - Removed v1.0 stub warnings
//   - isValidTatemono now also checks for @arkzen:native:page
//     so web-only tatemonos are recognised but skipped gracefully
//     by the builder's native guard (no watcher-level exclusion —
//     same pattern as expo-watcher.ts)
//   - rebuildAllFromRoot logs are cleaner, no placeholder notes
//
// v1.0 — Foundation: basic chokidar watch + placeholder build calls.
// ============================================================

import * as path from 'path'
import * as fs   from 'fs'
import chokidar  from 'chokidar'
import { buildNativeTatemono, rebuildNativeTatemono, removeNativeTatemono } from './native-builder'
import { checkBackendHealth } from './backend-bridge'
import { syncSharedCoreToCurrentStack } from './shared-sync'

// Root is 3 levels up from engine/frontend/react-native/arkzen/core/
const ROOT_DIR    = path.resolve(process.cwd(), '..', '..', '..')
const MODULES_DIR = path.join(ROOT_DIR, 'tatemonos')
const DEBOUNCE_MS = 500

const debounceMap = new Map<string, ReturnType<typeof setTimeout>>()

function debounce(key: string, fn: () => void, delay: number = DEBOUNCE_MS): void {
  const existing = debounceMap.get(key)
  if (existing) clearTimeout(existing)
  const timer = setTimeout(() => { fn(); debounceMap.delete(key) }, delay)
  debounceMap.set(key, timer)
}

function isValidTatemono(filePath: string): boolean {
  if (path.basename(filePath) !== 'core.tsx') return false
  if (!fs.existsSync(filePath)) return false
  const content = fs.readFileSync(filePath, 'utf-8')
  return content.includes('/* @arkzen:meta')
}

async function rebuildAllFromRoot(): Promise<void> {
  console.log(`\n[Arkzen Native] Scanning existing tatemonos...`)

  if (!fs.existsSync(MODULES_DIR)) {
    console.log(`[Arkzen Native] No tatemonos directory found. Skipping.`)
    return
  }

  const folders = fs.readdirSync(MODULES_DIR).filter(f => {
    const corePath = path.join(MODULES_DIR, f, 'core.tsx')
    return fs.existsSync(corePath)
  })

  if (folders.length === 0) {
    console.log(`[Arkzen Native] No tatemonos found. Engine ready.`)
    return
  }

  console.log(`[Arkzen Native] Found ${folders.length} tatemono(s). Building...`)
  for (const folder of folders) {
    const corePath = path.join(MODULES_DIR, folder, 'core.tsx')
    await rebuildNativeTatemono(corePath)
  }
  console.log(`[Arkzen Native] ✓ All tatemonos rebuilt`)
}

export async function startNativeWatcher(): Promise<void> {
  console.log(`\n╔════════════════════════════════════════╗`)
  console.log(`║    ARKZEN ENGINE v2.0 — REACT NATIVE   ║`)
  console.log(`╚════════════════════════════════════════╝`)
  console.log(`[Arkzen Native] Watching tatemonos at: ${MODULES_DIR}`)
  console.log(`[Arkzen Native] Screens output:        src/screens/`)
  console.log(`[Arkzen Native] Navigation registry:   src/arkzen/generated/routes.ts`)
  console.log(`[Arkzen Native] Styles/animations:     src/arkzen/generated/`)
  console.log(`[Arkzen Native] Custom layouts:        src/layouts/custom/`)

  fs.mkdirSync(MODULES_DIR, { recursive: true })
  syncSharedCoreToCurrentStack('Arkzen Native')

  const backendHealthy = await checkBackendHealth()
  if (backendHealthy) {
    console.log(`[Arkzen Native] ✓ Laravel backend is running`)
  } else {
    console.warn(`[Arkzen Native] ⚠ Laravel backend not reachable — start it first`)
  }

  await rebuildAllFromRoot()

  console.log(`\n[Arkzen Native] ✓ Engine ready. Drop tatemonos at: tatemonos/<name>/core.tsx\n`)

  const watcher = chokidar.watch(MODULES_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  })

  watcher.on('add', (filePath: string) => {
    if (!isValidTatemono(filePath)) return
    const name = path.basename(path.dirname(filePath))
    debounce(`add:${filePath}`, async () => {
      console.log(`\n[Arkzen Native] 📥 New tatemono: ${name}`)
      await buildNativeTatemono(filePath)
    })
  })

  watcher.on('change', (filePath: string) => {
    if (!isValidTatemono(filePath)) return
    const name = path.basename(path.dirname(filePath))
    debounce(`change:${filePath}`, async () => {
      console.log(`\n[Arkzen Native] 🔄 Tatemono changed: ${name}`)
      await rebuildNativeTatemono(filePath)
    })
  })

  watcher.on('unlink', (filePath: string) => {
    if (path.basename(filePath) !== 'core.tsx') return
    const name = path.basename(path.dirname(filePath))
    debounce(`unlink:${filePath}`, () => {
      console.log(`\n[Arkzen Native] 🗑 Tatemono removed: ${name}`)
      removeNativeTatemono(name)
    })
  })

  process.on('SIGINT',  () => { watcher.close(); process.exit(0) })
  process.on('SIGTERM', () => { watcher.close(); process.exit(0) })
}
