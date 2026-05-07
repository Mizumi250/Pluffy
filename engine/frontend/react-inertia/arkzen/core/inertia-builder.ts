// ============================================================
// ARKZEN ENGINE — INERTIA BUILDER v1.0
// Orchestrates tatemono build for React+Inertia stack.
//
// KEY DIFFERENCE from vite-builder / nextjs builder:
//   Frontend pages are written directly into the Laravel backend:
//   ../../backend/laravel-inertia/resources/js/Pages/{tat}/{Page}.tsx
//
//   Backend (models, migrations, routes, auth) still go via the
//   backend bridge to laravel-inertia's ArkzenEngineController —
//   same HTTP bridge pattern, different port (8001).
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { parseTatemono }                from './parser'
import { syncSharedCoreToCurrentStack } from './shared-sync'
import { registerInertiaPages, unregisterInertiaPages } from './inertia-router'
import { triggerBackendBuild, triggerBackendRemove }     from './backend-bridge'
import type { InertiaBuildResult }      from '../types'

export async function buildInertiaTatemono(corePath: string): Promise<InertiaBuildResult> {
  syncSharedCoreToCurrentStack('Arkzen Inertia Builder')

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
  triggerBackendRemove(tatName).catch(() => {})
  console.log(`[Arkzen Inertia Builder] ✓ Removed: ${tatName}`)
}
