// ============================================================
// ARKZEN ENGINE — VITE WATCHER v1.1
// Mirrors nextjs/watcher.ts but calls vite-router instead
// Watches same tatemonos/ folder — same DSL, different output
//
// v1.1 changes:
//   • Write src/arkzen/generated/.arkzen-ready after initial build
//     so vite.config.ts plugin can delay server start until
//     all pages are freshly generated (fixes stale-file race condition)
// ============================================================

import * as path from 'path'
import * as fs   from 'fs'
import chokidar  from 'chokidar'
import { buildViteTatemono, rebuildViteTatemono, removeViteTatemono } from './vite-builder'
import { checkBackendHealth } from '../../../nextjs/arkzen/core/backend-bridge'
import { syncSharedCoreToCurrentStack } from '../../../nextjs/arkzen/core/shared-sync'

// Root is 3 levels up from engine/frontend/react-vite/arkzen/core/
const ROOT_DIR      = path.resolve(process.cwd(), '..', '..', '..')
const MODULES_DIR   = path.join(ROOT_DIR, 'tatemonos')
const GENERATED_DIR = path.join(process.cwd(), 'src', 'arkzen', 'generated')
const READY_FLAG    = path.join(GENERATED_DIR, '.arkzen-ready')
const DEBOUNCE_MS   = 500

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
  console.log(`\n[Arkzen Vite] Scanning existing tatemonos...`)

  if (!fs.existsSync(MODULES_DIR)) {
    console.log(`[Arkzen Vite] No tatemonos directory found. Skipping.`)
    return
  }

  const folders = fs.readdirSync(MODULES_DIR).filter(f => {
    const corePath = path.join(MODULES_DIR, f, 'core.tsx')
    return fs.existsSync(corePath)
  })

  if (folders.length === 0) {
    console.log(`[Arkzen Vite] No tatemonos found. Engine ready.`)
    return
  }

  console.log(`[Arkzen Vite] Found ${folders.length} tatemono(s). Building...`)
  for (const folder of folders) {
    const corePath = path.join(MODULES_DIR, folder, 'core.tsx')
    await rebuildViteTatemono(corePath)
  }
  console.log(`[Arkzen Vite] ✓ All tatemonos rebuilt`)
}

export async function startViteWatcher(): Promise<void> {
  console.log(`\n╔════════════════════════════════════════╗`)
  console.log(`║    ARKZEN ENGINE v1.1 — REACT+VITE     ║`)
  console.log(`╚════════════════════════════════════════╝`)
  console.log(`[Arkzen Vite] Watching tatemonos at: ${MODULES_DIR}`)

  fs.mkdirSync(MODULES_DIR,   { recursive: true })
  fs.mkdirSync(GENERATED_DIR, { recursive: true })
  syncSharedCoreToCurrentStack('Arkzen Vite')

  // Remove stale ready flag so Vite waits for THIS build to finish
  if (fs.existsSync(READY_FLAG)) fs.unlinkSync(READY_FLAG)

  const backendHealthy = await checkBackendHealth()
  if (backendHealthy) {
    console.log(`[Arkzen Vite] ✓ Laravel backend is running`)
  } else {
    console.warn(`[Arkzen Vite] ⚠ Laravel backend not reachable`)
  }

  await rebuildAllFromRoot()

  // Signal Vite that all pages are freshly generated — Vite plugin polls this file
  fs.writeFileSync(READY_FLAG, Date.now().toString(), 'utf-8')
  console.log(`[Arkzen Vite] ✓ Ready flag written — Vite will now start dep scan`)

  console.log(`\n[Arkzen Vite] ✓ Engine ready. Drop tatemonos at: tatemonos/<name>/core.tsx\n`)

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
      console.log(`\n[Arkzen Vite] 📥 New tatemono: ${name}`)
      await buildViteTatemono(filePath)
    })
  })

  watcher.on('change', (filePath: string) => {
    if (!isValidTatemono(filePath)) return
    const name = path.basename(path.dirname(filePath))
    debounce(`change:${filePath}`, async () => {
      console.log(`\n[Arkzen Vite] 🔄 Tatemono changed: ${name}`)
      await rebuildViteTatemono(filePath)
    })
  })

  watcher.on('unlink', (filePath: string) => {
    if (path.basename(filePath) !== 'core.tsx') return
    const name = path.basename(path.dirname(filePath))
    debounce(`unlink:${filePath}`, () => {
      console.log(`\n[Arkzen Vite] 🗑 Tatemono removed: ${name}`)
      removeViteTatemono(name)
    })
  })

  process.on('SIGINT',  () => { watcher.close(); process.exit(0) })
  process.on('SIGTERM', () => { watcher.close(); process.exit(0) })
}
