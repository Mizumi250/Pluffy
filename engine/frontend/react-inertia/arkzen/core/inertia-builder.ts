// ============================================================
// ARKZEN ENGINE — INERTIA BUILDER v1.2
// Orchestrates tatemono build for React+Inertia stack.
//
// KEY DIFFERENCE from vite-builder / nextjs builder:
//   Frontend pages are written directly into the Laravel backend:
//   ../../backend/laravel-inertia/resources/js/Pages/{tat}/{Page}.tsx
//
//   Backend (models, migrations, routes, auth) still go via the
//   backend bridge to laravel-inertia's ArkzenEngineController —
//   same HTTP bridge pattern, different port (8001).
//
// v1.2: registry + PWA wired in.
//   - updateRegistry() / removeFromRegistry() now called on every
//     successful build and removal. Previously inertia-builder never
//     wrote arkzen.json, so the Hub page's /api/arkzen/registry call
//     always returned an empty module list.
//   - generatePWAFiles() called when tatemono.meta.pwa is set.
//     Previously the inertia stack silently skipped PWA generation.
//
// v1.1 (kept): syncSharedCoreToLaravelInertia() — also spreads
//   engine/shared/arkzen/core directly into laravel-inertia/resources/js/
//   arkzen/core/ so Vite's @/ alias resolves correctly and export.js
//   ships a fully self-contained Laravel app.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { parseTatemono }                from './parser'
import { syncSharedCoreToCurrentStack } from './shared-sync'
import { registerInertiaPages, unregisterInertiaPages } from './inertia-router'
import { triggerBackendBuild, triggerBackendRemove }     from './backend-bridge'
import { updateRegistry, removeFromRegistry }            from './registry'
import { parsePWAConfig, generatePWAFiles }              from './pwa-builder'
import type { InertiaBuildResult }      from '../types'

// ─── Sync shared core → laravel-inertia/resources/js/arkzen/core/ ─────────────
//
// engine/shared/arkzen/core/ is the source of truth for all stacks.
// shared-sync already spreads it to engine/frontend/react-inertia/arkzen/core/
// but Vite runs from laravel-inertia/ and @/ points to resources/js/ —
// so we need the core to also live there for imports and export.js to work.
//
// After cpSync of shared core, we overlay the inertia-specific adapters
// (Link.tsx, router.ts) so they're never overwritten by the shared copy.
// ──────────────────────────────────────────────────────────────────────────────
function syncSharedCoreToLaravelInertia(): void {
  const rootDir        = path.resolve(process.cwd(), '..', '..', '..')
  const sharedCoreDir  = path.join(rootDir, 'engine', 'shared', 'arkzen', 'core')
  const destCoreDir    = path.join(rootDir, 'engine', 'backend', 'laravel-inertia', 'resources', 'js', 'arkzen', 'core')
  const inertiaAdapters = path.join(process.cwd(), 'arkzen', 'core', 'adapters')

  if (!fs.existsSync(sharedCoreDir)) {
    console.warn('[Arkzen Inertia Builder] ⚠ Shared core not found — skipping laravel-inertia sync')
    return
  }

  // Spread shared core into resources/js/arkzen/core/
  fs.cpSync(sharedCoreDir, destCoreDir, { recursive: true })

  // Overlay inertia-specific adapters (Link.tsx uses @inertiajs/react, router.ts uses Inertia router)
  // These must win over anything shared may have copied into adapters/
  if (fs.existsSync(inertiaAdapters)) {
    fs.cpSync(inertiaAdapters, path.join(destCoreDir, 'adapters'), { recursive: true })
  }

  // Overlay the custom layouts directory — shared core doesn't have inertia-specific custom layouts
  const inertiaCustomLayouts = path.join(
    rootDir, 'engine', 'backend', 'laravel-inertia', 'resources', 'js', 'arkzen', 'core', 'layouts', 'custom'
  )
  const engineCustomLayouts = path.join(process.cwd(), 'arkzen', 'core', 'layouts', 'custom')
  if (fs.existsSync(engineCustomLayouts)) {
    fs.mkdirSync(inertiaCustomLayouts, { recursive: true })
    fs.cpSync(engineCustomLayouts, inertiaCustomLayouts, { recursive: true })
  }

  console.log('[Arkzen Inertia Builder] ✓ Synced shared core → laravel-inertia/resources/js/arkzen/core/')
}

export async function buildInertiaTatemono(corePath: string): Promise<InertiaBuildResult> {
  // Spread shared core → engine/frontend/react-inertia/arkzen/core/ (engine runtime)
  syncSharedCoreToCurrentStack('Arkzen Inertia Builder')

  // Spread shared core → laravel-inertia/resources/js/arkzen/core/ (Vite + export target)
  syncSharedCoreToLaravelInertia()

  const tatName = path.basename(path.dirname(corePath))
  const steps: InertiaBuildResult['steps'] = []
  const errors: string[] = []

  console.log(`\n[Arkzen Inertia Builder] ════════════════════════════════`)
  console.log(`[Arkzen Inertia Builder] Building: ${tatName}`)
  console.log(`[Arkzen Inertia Builder] ════════════════════════════════`)

  // ── Step 1: Parse tatemono DSL ─────────────────────────────
  let parsed: Awaited<ReturnType<typeof parseTatemono>>
  try {
    parsed = parseTatemono(corePath)
    steps.push({ name: 'Parse Tatemono', status: 'success', message: `Parsed ${tatName} — ${parsed.pages.length} page(s)` })
    console.log(`[Arkzen Inertia Parser] ✓ Parsed: ${tatName} v${parsed.meta.version}`)
    console.log(`[Arkzen Inertia Parser]   Pages: ${parsed.pages.map(p => p.name).join(', ')}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Parse Tatemono', status: 'failed', message })
    console.error(`[Arkzen Inertia Builder] ✗ Parse failed:`, message)
    return { success: false, tatemono: tatName, errors: [message], steps }
  }

  // ── Step 2: Write React pages into laravel-inertia/resources/js/Pages/ ──
  try {
    registerInertiaPages(parsed)
    steps.push({ name: 'Register Inertia Pages', status: 'success', message: `${parsed.pages.length} page(s) written to laravel-inertia` })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Register Inertia Pages', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen Inertia Builder] ✗ Page registration failed:`, message)
  }

  // ── Step 3: Backend build (models, migrations, routes, auth) ──
  const isStatic = parsed.databases.length === 0 && parsed.apis.length === 0
  if (isStatic) {
    steps.push({ name: 'Trigger Backend Build', status: 'success', message: 'Static tatemono — no backend' })
    console.log(`[Arkzen Inertia Bridge] ✓ Static tatemono — skipping backend build`)
  } else {
    try {
      await triggerBackendBuild(parsed)
      steps.push({ name: 'Trigger Backend Build', status: 'success', message: 'Laravel-Inertia backend updated' })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      steps.push({ name: 'Trigger Backend Build', status: 'failed', message })
      errors.push(message)
      console.error(`[Arkzen Inertia Builder] ✗ Backend build failed:`, message)
    }
  }

  // ── Step 4: PWA generation ─────────────────────────────────
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
      console.error(`[Arkzen Inertia Builder] ✗ PWA generation failed:`, message)
    }
  }

  // ── Step 5: Registry update ────────────────────────────────
  // v1.2: Write to arkzen.json so Hub page has data to display.
  // Laravel reads the same file via RegistryReader.php and serves
  // it at GET /api/arkzen/registry.
  try {
    updateRegistry(parsed)
    steps.push({ name: 'Registry', status: 'success', message: `${tatName} registered in arkzen.json` })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Registry', status: 'failed', message })
    // Non-fatal — don't push to errors or abort
    console.warn(`[Arkzen Inertia Builder] ⚠ Registry update failed (non-fatal):`, message)
  }

  const success = errors.length === 0
  console.log(`\n[Arkzen Inertia Builder] Build ${success ? '✓ COMPLETE' : '✗ FAILED'}: ${tatName}`)
  steps.forEach(s => console.log(`  ${s.status === 'success' ? '✓' : '✗'} ${s.name}: ${s.message ?? ''}`))
  return { success, tatemono: tatName, errors, steps }
}

export async function rebuildInertiaTatemono(corePath: string): Promise<InertiaBuildResult> {
  const tatName = path.basename(path.dirname(corePath))
  unregisterInertiaPages(tatName)
  return buildInertiaTatemono(corePath)
}

export function removeInertiaTatemono(tatName: string): void {
  unregisterInertiaPages(tatName)
  removeFromRegistry(tatName)                    // ← v1.2: was missing
  triggerBackendRemove(tatName).catch(() => {})
  console.log(`[Arkzen Inertia Builder] ✓ Removed: ${tatName}`)
}
