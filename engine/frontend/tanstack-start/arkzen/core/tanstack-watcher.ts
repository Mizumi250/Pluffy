// ============================================================
// ARKZEN ENGINE — TANSTACK START WATCHER v1.0
// arkzen/core/tanstack-watcher.ts
//
// Mirrors vite-watcher.ts exactly — only the builder import
// and log labels differ. Same chokidar setup, same debounce,
// same tatemonos/ folder structure.
// ============================================================

import * as path from 'path'
import * as fs   from 'fs'
import chokidar  from 'chokidar'
import { buildTanStackTatemono, rebuildTanStackTatemono, removeTanStackTatemono } from './tanstack-builder'
import { checkBackendHealth }           from './backend-bridge'
import { syncSharedCoreToCurrentStack } from './shared-sync'

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
  console.log(`\n[Arkzen TanStack] Scanning existing tatemonos...`)

  if (!fs.existsSync(MODULES_DIR)) {
    console.log(`[Arkzen TanStack] No tatemonos directory found. Skipping.`)
    return
  }

  const folders = fs.readdirSync(MODULES_DIR).filter(f => {
    const corePath = path.join(MODULES_DIR, f, 'core.tsx')
    return fs.existsSync(corePath)
  })

  if (folders.length === 0) {
    console.log(`[Arkzen TanStack] No tatemonos found. Engine ready.`)
    return
  }

  console.log(`[Arkzen TanStack] Found ${folders.length} tatemono(s). Building...`)
  for (const folder of folders) {
    const corePath = path.join(MODULES_DIR, folder, 'core.tsx')
    await rebuildTanStackTatemono(corePath)
  }
  console.log(`[Arkzen TanStack] ✓ All tatemonos rebuilt`)
}

export async function startTanStackWatcher(): Promise<void> {
  console.log(`\n╔══════════════════════════════════════════════╗`)
  console.log(`║    ARKZEN ENGINE v1.0 — TANSTACK START       ║`)
  console.log(`╚══════════════════════════════════════════════╝`)
  console.log(`[Arkzen TanStack] Watching tatemonos at: ${MODULES_DIR}`)

  fs.mkdirSync(MODULES_DIR,   { recursive: true })
  fs.mkdirSync(GENERATED_DIR, { recursive: true })
  syncSharedCoreToCurrentStack('Arkzen TanStack')

  if (fs.existsSync(READY_FLAG)) fs.unlinkSync(READY_FLAG)

  const backendHealthy = await checkBackendHealth()
  if (backendHealthy) {
    console.log(`[Arkzen TanStack] ✓ Laravel backend is running`)
  } else {
    console.warn(`[Arkzen TanStack] ⚠ Laravel backend not reachable — static tatemonos still work`)
  }

  await rebuildAllFromRoot()

  fs.writeFileSync(READY_FLAG, Date.now().toString(), 'utf-8')
  console.log(`[Arkzen TanStack] ✓ Ready flag written`)
  console.log(`\n[Arkzen TanStack] ✓ Engine ready. Drop tatemonos at: tatemonos/<name>/core.tsx\n`)

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
      console.log(`\n[Arkzen TanStack] 📥 New tatemono: ${name}`)
      await buildTanStackTatemono(filePath)
    })
  })

  watcher.on('change', (filePath: string) => {
    if (!isValidTatemono(filePath)) return
    const name = path.basename(path.dirname(filePath))
    debounce(`change:${filePath}`, async () => {
      console.log(`\n[Arkzen TanStack] 🔄 Tatemono changed: ${name}`)
      await rebuildTanStackTatemono(filePath)
    })
  })

  watcher.on('unlink', (filePath: string) => {
    if (path.basename(filePath) !== 'core.tsx') return
    const name = path.basename(path.dirname(filePath))
    debounce(`unlink:${filePath}`, () => {
      console.log(`\n[Arkzen TanStack] 🗑 Tatemono removed: ${name}`)
      removeTanStackTatemono(name)
    })
  })

  process.on('SIGINT',  () => { watcher.close(); process.exit(0) })
  process.on('SIGTERM', () => { watcher.close(); process.exit(0) })
}
