// ============================================================
// ARKZEN ENGINE — INERTIA WATCHER v1.0
// Mirrors vite-watcher.ts but calls inertia-router instead
// Watches same tatemonos/ folder — same DSL, different output
// ============================================================

import * as path from 'path'
import * as fs   from 'fs'
import chokidar  from 'chokidar'
import { buildInertiaTatemono, rebuildInertiaTatemono, removeInertiaTatemono } from './inertia-builder'
import { checkBackendHealth } from '../../../nextjs/arkzen/core/backend-bridge'
import { syncSharedCoreToCurrentStack } from '../../../nextjs/arkzen/core/shared-sync'

// Root is 3 levels up from engine/frontend/react-inertia/arkzen/core/
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
  console.log(`\n[Arkzen Inertia] Scanning existing tatemonos...`)

  if (!fs.existsSync(MODULES_DIR)) {
    console.log(`[Arkzen Inertia] No tatemonos directory found. Skipping.`)
    return
  }

  const folders = fs.readdirSync(MODULES_DIR).filter(f => {
    const corePath = path.join(MODULES_DIR, f, 'core.tsx')
    return fs.existsSync(corePath)
  })

  if (folders.length === 0) {
    console.log(`[Arkzen Inertia] No tatemonos found. Engine ready.`)
    return
  }

  console.log(`[Arkzen Inertia] Found ${folders.length} tatemono(s). Building...`)
  for (const folder of folders) {
    const corePath = path.join(MODULES_DIR, folder, 'core.tsx')
    await rebuildInertiaTatemono(corePath)
  }
  console.log(`[Arkzen Inertia] ✓ All tatemonos rebuilt`)
}

export async function startInertiaWatcher(): Promise<void> {
  console.log(`\n╔════════════════════════════════════════════╗`)
  console.log(`║  ARKZEN ENGINE v1.0 — REACT+INERTIA.JS     ║`)
  console.log(`╚════════════════════════════════════════════╝`)
  console.log(`[Arkzen Inertia] Watching tatemonos at: ${MODULES_DIR}`)
  console.log(`[Arkzen Inertia] Pages output: resources/js/Pages/`)
  console.log(`[Arkzen Inertia] NOTE: Run 'npm run dev' in react-inertia/ for Vite HMR`)
  console.log(`[Arkzen Inertia] NOTE: Run 'php artisan serve' in backend/laravel/ for app`)

  fs.mkdirSync(MODULES_DIR, { recursive: true })
  syncSharedCoreToCurrentStack('Arkzen Inertia')

  const backendHealthy = await checkBackendHealth()
  if (backendHealthy) {
    console.log(`[Arkzen Inertia] ✓ Laravel backend is running`)
  } else {
    console.warn(`[Arkzen Inertia] ⚠ Laravel backend not reachable — start it first`)
  }

  await rebuildAllFromRoot()

  console.log(`\n[Arkzen Inertia] ✓ Engine ready. Drop tatemonos at: tatemonos/<name>/core.tsx\n`)

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
      console.log(`\n[Arkzen Inertia] 📥 New tatemono: ${name}`)
      await buildInertiaTatemono(filePath)
    })
  })

  watcher.on('change', (filePath: string) => {
    if (!isValidTatemono(filePath)) return
    const name = path.basename(path.dirname(filePath))
    debounce(`change:${filePath}`, async () => {
      console.log(`\n[Arkzen Inertia] 🔄 Tatemono changed: ${name}`)
      await rebuildInertiaTatemono(filePath)
    })
  })

  watcher.on('unlink', (filePath: string) => {
    if (path.basename(filePath) !== 'core.tsx') return
    const name = path.basename(path.dirname(filePath))
    debounce(`unlink:${filePath}`, () => {
      console.log(`\n[Arkzen Inertia] 🗑 Tatemono removed: ${name}`)
      removeInertiaTatemono(name)
    })
  })

  process.on('SIGINT',  () => { watcher.close(); process.exit(0) })
  process.on('SIGTERM', () => { watcher.close(); process.exit(0) })
}
