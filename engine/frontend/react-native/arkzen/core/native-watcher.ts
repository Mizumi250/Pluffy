// ============================================================
// ARKZEN ENGINE — NATIVE WATCHER v1.0
// Mirrors vite-watcher.ts but calls native-router
// Watches same tatemonos/ folder — same DSL, different output
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
  console.log(`║    ARKZEN ENGINE v1.0 — REACT NATIVE   ║`)
  console.log(`╚════════════════════════════════════════╝`)
  console.log(`[Arkzen Native] Watching tatemonos at: ${MODULES_DIR}`)
  console.log(`[Arkzen Native] Screens output: src/screens/`)
  console.log(`[Arkzen Native] Navigation: src/arkzen/generated/routes.ts`)
  console.log(`[Arkzen Native] ⚠ STATUS: v9 foundation — placeholder screens only`)
  console.log(`[Arkzen Native] ⚠ To run the app: open the generated Expo project separately`)

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