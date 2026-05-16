// ============================================================
// ARKZEN ENGINE — ASTRO WATCHER v1.0
// Mirrors react-vite/arkzen/core/vite-watcher.ts exactly.
// Watches same tatemonos/ folder — same DSL, Astro output.
//
// Generates a .arkzen-ready flag after initial build so
// Astro's dev server can wait until all pages are generated.
// ============================================================

import * as path from 'path'
import * as fs   from 'fs'
import chokidar  from 'chokidar'
import { buildAstroTatemono, rebuildAstroTatemono, removeAstroTatemono } from './astro-builder'
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
  console.log(`\n[Arkzen Astro] Scanning existing tatemonos...`)

  if (!fs.existsSync(MODULES_DIR)) {
    console.log(`[Arkzen Astro] No tatemonos directory found. Skipping.`)
    return
  }

  const folders = fs.readdirSync(MODULES_DIR).filter(f => {
    const corePath = path.join(MODULES_DIR, f, 'core.tsx')
    return fs.existsSync(corePath)
  })

  if (folders.length === 0) {
    console.log(`[Arkzen Astro] No tatemonos found. Engine ready.`)
    return
  }

  console.log(`[Arkzen Astro] Found ${folders.length} tatemono(s). Building...`)

  for (const folder of folders) {
    const corePath = path.join(MODULES_DIR, folder, 'core.tsx')
    await buildAstroTatemono(corePath)
  }

  console.log(`[Arkzen Astro] ✓ Initial build complete.`)
}

export async function startAstroWatcher(): Promise<void> {
  console.log(`\n[Arkzen Astro] ════════════════════════════════`)
  console.log(`[Arkzen Astro] Arkzen Astro Engine starting...`)
  console.log(`[Arkzen Astro] ════════════════════════════════`)

  syncSharedCoreToCurrentStack('Arkzen Astro Watcher')

  fs.mkdirSync(GENERATED_DIR, { recursive: true })

  // Wait for backend health before building
  console.log(`[Arkzen Astro] Waiting for Laravel backend...`)
  await checkBackendHealth()
  console.log(`[Arkzen Astro] ✓ Backend is up.`)

  // Build all existing tatemonos on startup
  await rebuildAllFromRoot()

  // Write .arkzen-ready flag so Astro config plugin can proceed
  fs.writeFileSync(READY_FLAG, new Date().toISOString(), 'utf-8')
  console.log(`[Arkzen Astro] ✓ .arkzen-ready written`)

  // Watch for changes
  const watcher = chokidar.watch(MODULES_DIR, {
    persistent:        true,
    ignoreInitial:     true,
    awaitWriteFinish:  { stabilityThreshold: 300, pollInterval: 100 },
    ignored:           /(^|[/\\])\../,
  })

  watcher.on('add', (filePath: string) => {
    if (!isValidTatemono(filePath)) return
    const tatName = path.basename(path.dirname(filePath))
    console.log(`\n[Arkzen Astro] New tatemono detected: ${tatName}`)
    debounce(tatName, () => buildAstroTatemono(filePath))
  })

  watcher.on('change', (filePath: string) => {
    if (!isValidTatemono(filePath)) return
    const tatName = path.basename(path.dirname(filePath))
    console.log(`\n[Arkzen Astro] Tatemono changed: ${tatName}`)
    debounce(tatName, () => rebuildAstroTatemono(filePath))
  })

  watcher.on('unlink', (filePath: string) => {
    if (path.basename(filePath) !== 'core.tsx') return
    const tatName = path.basename(path.dirname(filePath))
    console.log(`\n[Arkzen Astro] Tatemono removed: ${tatName}`)
    debounce(tatName, () => removeAstroTatemono(tatName))
  })

  console.log(`[Arkzen Astro] Watching: ${MODULES_DIR}`)
  console.log(`[Arkzen Astro] Engine ready. Ctrl+C to stop.\n`)
}