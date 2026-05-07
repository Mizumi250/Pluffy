// ============================================================
// ARKZEN ENGINE — VITE BUILDER v2.1
// Orchestrates tatemono build for React+Vite stack.
//
// v2.1: Registry wired in.
//   - updateRegistry() called after every successful build so
//     arkzen.json is written and App.tsx's Hub can display modules.
//   - removeFromRegistry() called on tatemono removal.
//   Previously the Vite builder never wrote arkzen.json — the Hub
//   fetched GET /api/arkzen/registry (proxied to Laravel) but Laravel
//   also had no registry route, causing the same 404 loop as Inertia.
//
// v2.0 (kept): All imports resolve locally — no more cross-stack
//       relative path imports from ../../../nextjs/.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { parseTatemono }                          from './parser'
import { syncSharedCoreToCurrentStack }           from './shared-sync'
import { registerVitePages, unregisterVitePages } from './vite-router'
import { triggerBackendBuild, triggerBackendRemove } from './backend-bridge'
import { parsePWAConfig, generatePWAFiles }       from './pwa-builder'
import { updateRegistry, removeFromRegistry }     from './registry'

export interface ViteBuildResult {
  success:  boolean
  tatemono: string
  errors:   string[]
  steps:    { name: string; status: 'success' | 'failed'; message?: string }[]
}

export async function buildViteTatemono(corePath: string): Promise<ViteBuildResult> {
  syncSharedCoreToCurrentStack('Arkzen Vite Builder')

  const tatName = path.basename(path.dirname(corePath))
  const steps: ViteBuildResult['steps'] = []
  const errors: string[] = []

  console.log(`\n[Arkzen Vite Builder] ════════════════════════════════`)
  console.log(`[Arkzen Vite Builder] Building: ${tatName}`)
  console.log(`[Arkzen Vite Builder] ════════════════════════════════`)

  let parsed: Awaited<ReturnType<typeof parseTatemono>>
  try {
    parsed = parseTatemono(corePath)
    steps.push({ name: 'Parse Tatemono', status: 'success', message: `Parsed ${tatName} — ${parsed.pages.length} page(s)` })
    console.log(`[Arkzen Vite Parser] ✓ Parsed: ${tatName} v${parsed.meta.version}`)
    console.log(`[Arkzen Vite Parser]   Pages: ${parsed.pages.map(p => p.name).join(', ')}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Parse Tatemono', status: 'failed', message })
    console.error(`[Arkzen Vite Builder] ✗ Parse failed:`, message)
    return { success: false, tatemono: tatName, errors: [message], steps }
  }

  try {
    registerVitePages(parsed)
    steps.push({ name: 'Register Vite Pages', status: 'success', message: `${parsed.pages.length} page(s) registered` })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Register Vite Pages', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen Vite Builder] ✗ Page registration failed:`, message)
  }

  const isStatic = parsed.databases.length === 0 && parsed.apis.length === 0
  if (isStatic) {
    steps.push({ name: 'Trigger Backend Build', status: 'success', message: 'Static tatemono — no backend' })
    console.log(`[Arkzen Vite Bridge] ✓ Static tatemono — skipping backend build`)
  } else {
    try {
      await triggerBackendBuild(parsed)
      steps.push({ name: 'Trigger Backend Build', status: 'success', message: 'Laravel backend updated' })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      steps.push({ name: 'Trigger Backend Build', status: 'failed', message })
      errors.push(message)
      console.error(`[Arkzen Vite Builder] ✗ Backend build failed:`, message)
    }
  }

  // ── PWA generation ─────────────────────────────────────────
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
      console.error(`[Arkzen Vite Builder] ✗ PWA generation failed:`, message)
    }
  }

  // ── Registry update ────────────────────────────────────────
  // v2.1: Write arkzen.json so Hub's /api/arkzen/registry has data.
  // Laravel reads the same file via RegistryReader.php.
  try {
    updateRegistry(parsed)
    steps.push({ name: 'Registry', status: 'success', message: `${tatName} registered in arkzen.json` })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Registry', status: 'failed', message })
    console.warn(`[Arkzen Vite Builder] ⚠ Registry update failed (non-fatal):`, message)
  }

  const success = errors.length === 0
  console.log(`\n[Arkzen Vite Builder] Build ${success ? '✓ COMPLETE' : '✗ FAILED'}: ${tatName}`)
  steps.forEach(s => console.log(`  ${s.status === 'success' ? '✓' : '✗'} ${s.name}: ${s.message ?? ''}`))
  return { success, tatemono: tatName, errors, steps }
}

export async function rebuildViteTatemono(corePath: string): Promise<ViteBuildResult> {
  const tatName = path.basename(path.dirname(corePath))
  unregisterVitePages(tatName)
  return buildViteTatemono(corePath)
}

export function removeViteTatemono(tatName: string): void {
  unregisterVitePages(tatName)
  removeFromRegistry(tatName)                    // ← v2.1: was missing
  triggerBackendRemove(tatName).catch(() => {})
  console.log(`[Arkzen Vite Builder] ✓ Removed: ${tatName}`)
}