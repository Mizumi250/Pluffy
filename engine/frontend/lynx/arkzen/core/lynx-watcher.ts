// ============================================================
// ARKZEN ENGINE — LYNX WATCHER v1.0
//
// Mirrors expo-watcher.ts exactly — same rebuild-all-on-startup
// pattern, same chokidar watch loop, same debounce logic.
// ============================================================

import * as path    from 'path'
import * as fs      from 'fs'
import chokidar     from 'chokidar'
import {
  buildLynxTatemono,
  rebuildLynxTatemono,
  removeLynxTatemono,
} from './lynx-builder'
import { checkBackendHealth }           from './backend-bridge'
import { syncSharedCoreToCurrentStack } from './shared-sync'
import { getLynxRegistry }              from './lynx-registry'

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
    console.log(`[Arkzen Lynx Watcher] Not a valid tatemono (missing @arkzen:meta): ${filePath}`)
    return false
  }
  return true
}

async function rebuildAllFromRoot(): Promise<void> {
  console.log(`\n[Arkzen Lynx] Scanning existing tatemonos...`)

  if (!fs.existsSync(MODULES_DIR)) {
    console.log(`[Arkzen Lynx] No tatemonos directory found at ${MODULES_DIR}. Skipping.`)
    return
  }

  const existingFolders = new Set(
    fs.readdirSync(MODULES_DIR).filter(f => {
      const corePath = path.join(MODULES_DIR, f, 'core.tsx')
      try {
        return fs.statSync(path.join(MODULES_DIR, f)).isDirectory() && fs.existsSync(corePath)
      } catch { return false }
    })
  )

  // Clean stale registry entries
  const registry   = getLynxRegistry()
  let   staleCount = 0
  for (const module of registry.modules) {
    if (!existingFolders.has(module.name)) {
      console.log(`[Arkzen Lynx] Cleaning up stale module: ${module.name}`)
      removeLynxTatemono(module.name)
      staleCount++
    }
  }
  if (staleCount > 0) console.log(`[Arkzen Lynx] ✓ Cleaned up ${staleCount} stale module(s)`)

  if (existingFolders.size === 0) {
    console.log(`[Arkzen Lynx] No tatemonos found. Engine ready for first drop.`)
    return
  }

  console.log(`[Arkzen Lynx] Found ${existingFolders.size} tatemono(s). Building...`)
  for (const folder of existingFolders) {
    const corePath = path.join(MODULES_DIR, folder, 'core.tsx')
    await buildLynxTatemono(corePath)
  }
  console.log(`[Arkzen Lynx] ✓ All tatemonos built\n`)
}

export async function startLynxWatcher(): Promise<void> {
  console.log(`\n╔══════════════════════════════════════════╗`)
  console.log(`║   ARKZEN ENGINE v1.0 — LYNX STACK       ║`)
  console.log(`╚══════════════════════════════════════════╝`)
  console.log(`[Arkzen Lynx] Watching tatemonos at: ${MODULES_DIR}`)
  console.log(`[Arkzen Lynx] Pages output:          src/pages/`)
  console.log(`[Arkzen Lynx] Generated output:      src/arkzen/generated/`)
  console.log(`[Arkzen Lynx] App entry:             src/App.tsx`)

  fs.mkdirSync(MODULES_DIR, { recursive: true })
  syncSharedCoreToCurrentStack('Arkzen Lynx Watcher')

  const backendHealthy = await checkBackendHealth()
  if (backendHealthy) {
    console.log(`[Arkzen Lynx] ✓ Laravel backend is running`)
  } else {
    console.warn(`[Arkzen Lynx] ⚠ Laravel backend not reachable — start it with: node start.js`)
  }

  await rebuildAllFromRoot()

  console.log(`[Arkzen Lynx] ✓ Engine ready. Drop tatemonos at: tatemonos/<name>/core.tsx\n`)

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
      console.log(`\n[Arkzen Lynx] 📥 New tatemono: ${name}`)
      await buildLynxTatemono(filePath)
    })
  })

  watcher.on('change', (filePath: string) => {
    if (!isValidTatemono(filePath)) return
    const name = path.basename(path.dirname(filePath))
    debounce(`change:${filePath}`, async () => {
      console.log(`\n[Arkzen Lynx] 🔄 Tatemono changed: ${name}`)
      await rebuildLynxTatemono(filePath)
    })
  })

  watcher.on('unlink', (filePath: string) => {
    if (path.basename(filePath) !== 'core.tsx') return
    const name = path.basename(path.dirname(filePath))
    debounce(`unlink:${filePath}`, () => {
      console.log(`\n[Arkzen Lynx] 🗑 Tatemono removed: ${name}`)
      removeLynxTatemono(name)
    })
  })

  watcher.on('error', (error: Error) => console.error(`[Arkzen Lynx Watcher] ✗ Error:`, error))

  process.on('SIGINT',  () => { watcher.close(); process.exit(0) })
  process.on('SIGTERM', () => { watcher.close(); process.exit(0) })
}