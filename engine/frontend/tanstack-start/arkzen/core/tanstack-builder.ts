// ============================================================
// ARKZEN ENGINE — TANSTACK START BUILDER v1.0
// arkzen/core/tanstack-builder.ts
//
// Orchestrates tatemono build for TanStack Start stack.
// Mirrors vite-builder.ts exactly — only the page/route
// registration calls swap to the TanStack router.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { parseTatemono }                               from './parser'
import { syncSharedCoreToCurrentStack }                from './shared-sync'
import { buildTanStackPages, softUnregisterTanStackPages, writeRouteTree } from './tanstack-router'
import type { RouteEntry }                             from './tanstack-router'
import { triggerBackendBuild, triggerBackendRemove }   from './backend-bridge'
import { parsePWAConfig, generatePWAFiles }            from './pwa-builder'
import { updateRegistry, removeFromRegistry }          from './registry'

const GENERATED_DIR  = path.resolve(process.cwd(), 'src', 'arkzen', 'generated')
const ROUTE_TREE     = path.join(GENERATED_DIR, 'routeTree.ts')
const TATEMONO_DIR   = path.resolve(process.cwd(), 'arkzen', 'tatemono')

export interface TanStackBuildResult {
  success:  boolean
  tatemono: string
  errors:   string[]
  steps:    { name: string; status: 'success' | 'failed'; message?: string }[]
}

// ─── Route entry registry (in-memory, rebuilt on each full rebuild) ────────────

const _registeredRoutes = new Map<string, RouteEntry[]>()
const _authTatemonos    = new Set<string>()

function rebuildRouteTree(): void {
  const allEntries: RouteEntry[] = []
  for (const entries of _registeredRoutes.values()) {
    allEntries.push(...entries)
  }
  writeRouteTree(allEntries, [..._authTatemonos])
}

// ─── Build ─────────────────────────────────────────────────────────────────────

export async function buildTanStackTatemono(corePath: string): Promise<TanStackBuildResult> {
  syncSharedCoreToCurrentStack('Arkzen TanStack Builder')

  const tatName = path.basename(path.dirname(corePath))
  const steps: TanStackBuildResult['steps'] = []
  const errors: string[] = []

  console.log(`\n[Arkzen TanStack] ════════════════════════════════`)
  console.log(`[Arkzen TanStack] Building: ${tatName}`)
  console.log(`[Arkzen TanStack] ════════════════════════════════`)

  // ── Parse ────────────────────────────────────────────────────
  let parsed: Awaited<ReturnType<typeof parseTatemono>>
  try {
    parsed = parseTatemono(corePath)
    steps.push({ name: 'Parse Tatemono', status: 'success', message: `Parsed ${tatName} — ${parsed.pages.length} page(s)` })
    console.log(`[Arkzen TanStack] ✓ Parsed: ${tatName} v${parsed.meta.version}`)
    console.log(`[Arkzen TanStack]   Pages: ${parsed.pages.map(p => p.name).join(', ')}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Parse Tatemono', status: 'failed', message })
    console.error(`[Arkzen TanStack] ✗ Parse failed:`, message)
    return { success: false, tatemono: tatName, errors: [message], steps }
  }

  // ── Generate page + route files ──────────────────────────────
  try {
    buildTanStackPages(parsed)

    // Build route entries for this tatemono
    const entries: RouteEntry[] = parsed.pages.map(page => ({
      tatName,
      page,
      routeVar: `Route_${tatName.replace(/-/g, '_')}_${page.name.replace(/-/g, '_')}`,
      filePath: `${tatName}/${page.name}`,
    }))
    _registeredRoutes.set(tatName, entries)

    // Track auth tatemonos
    if (parsed.meta.auth) _authTatemonos.add(tatName)
    else _authTatemonos.delete(tatName)

    rebuildRouteTree()
    steps.push({ name: 'Register TanStack Routes', status: 'success', message: `${parsed.pages.length} route(s) registered` })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Register TanStack Routes', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen TanStack] ✗ Route registration failed:`, message)
  }

  // ── Backend build ────────────────────────────────────────────
  const isStatic = parsed.databases.length === 0 && parsed.apis.length === 0
  if (isStatic) {
    steps.push({ name: 'Trigger Backend Build', status: 'success', message: 'Static tatemono — no backend' })
  } else {
    try {
      await triggerBackendBuild(parsed)
      steps.push({ name: 'Trigger Backend Build', status: 'success', message: 'Laravel backend updated' })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      steps.push({ name: 'Trigger Backend Build', status: 'failed', message })
      errors.push(message)
      console.error(`[Arkzen TanStack] ✗ Backend build failed:`, message)
    }
  }

  // ── PWA ──────────────────────────────────────────────────────
  if (parsed.meta.pwa) {
    try {
      const pwaConfig = parsePWAConfig(parsed)
      if (pwaConfig) {
        generatePWAFiles(parsed, pwaConfig)
        steps.push({ name: 'PWA', status: 'success', message: `PWA files generated for ${tatName}` })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      steps.push({ name: 'PWA', status: 'failed', message })
      errors.push(message)
    }
  }

  // ── Registry ─────────────────────────────────────────────────
  try {
    updateRegistry(parsed)
    steps.push({ name: 'Registry', status: 'success', message: `${tatName} registered in arkzen.json` })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Registry', status: 'failed', message })
    console.warn(`[Arkzen TanStack] ⚠ Registry update failed (non-fatal):`, message)
  }

  const success = errors.length === 0
  console.log(`\n[Arkzen TanStack] Build ${success ? '✓ COMPLETE' : '✗ FAILED'}: ${tatName}`)
  steps.forEach(s => console.log(`  ${s.status === 'success' ? '✓' : '✗'} ${s.name}: ${s.message ?? ''}`))
  return { success, tatemono: tatName, errors, steps }
}

export async function rebuildTanStackTatemono(corePath: string): Promise<TanStackBuildResult> {
  const tatName = path.basename(path.dirname(corePath))
  softUnregisterTanStackPages(tatName)
  _registeredRoutes.delete(tatName)
  rebuildRouteTree()
  return buildTanStackTatemono(corePath)
}

export async function removeTanStackTatemono(tatName: string): Promise<void> {
  softUnregisterTanStackPages(tatName)
  _registeredRoutes.delete(tatName)
  _authTatemonos.delete(tatName)
  rebuildRouteTree()

  try {
    await triggerBackendRemove(tatName)
  } catch {
    // non-fatal
  }

  removeFromRegistry(tatName)
  console.log(`[Arkzen TanStack] ✗ Removed: ${tatName}`)
}
