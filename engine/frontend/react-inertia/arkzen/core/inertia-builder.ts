// ============================================================
// ARKZEN ENGINE — INERTIA BUILDER v1.0
// Orchestrates tatemono build for React+Inertia.js stack
// Reuses same parser as Next.js — DSL is identical
// Key difference: pages go to resources/js/Pages/ (Laravel convention)
// Routes are Laravel routes, not file-based
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { parseTatemono } from '../../../nextjs/arkzen/core/parser'
import { registerInertiaPages, unregisterInertiaPages } from './inertia-router'
import { triggerBackendBuild, triggerBackendRemove } from '../../../nextjs/arkzen/core/backend-bridge'

export interface InertiaBuildResult {
  success:  boolean
  tatemono: string
  errors:   string[]
  steps:    { name: string; status: 'success' | 'failed'; message?: string }[]
}

// ─── Build ────────────────────────────────────────────────────────────────────

export async function buildInertiaTatemono(corePath: string): Promise<InertiaBuildResult> {
  const tatName = path.basename(path.dirname(corePath))
  const steps: InertiaBuildResult['steps'] = []
  const errors: string[] = []

  console.log(`\n[Arkzen Inertia Builder] ════════════════════════════════`)
  console.log(`[Arkzen Inertia Builder] Building: ${tatName}`)
  console.log(`[Arkzen Inertia Builder] ════════════════════════════════`)

  // Step 1: Parse (reuses Next.js parser — same DSL)
  let parsed: Awaited<ReturnType<typeof parseTatemono>>
  try {
    parsed = parseTatemono(corePath)
    steps.push({
      name:    'Parse Tatemono',
      status:  'success',
      message: `Parsed ${tatName} — ${parsed.pages.length} page(s)`,
    })
    console.log(`[Arkzen Inertia] ✓ Parsed: ${tatName} v${parsed.meta.version}`)
    console.log(`[Arkzen Inertia]   Pages: ${parsed.pages.map(p => p.name).join(', ')}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Parse Tatemono', status: 'failed', message })
    console.error(`[Arkzen Inertia Builder] ✗ Parse failed:`, message)
    return { success: false, tatemono: tatName, errors: [message], steps }
  }

  // Step 2: Generate Inertia page files
  try {
    registerInertiaPages(parsed)
    steps.push({
      name:    'Register Inertia Pages',
      status:  'success',
      message: `${parsed.pages.length} page(s) generated in resources/js/Pages/`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Register Inertia Pages', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen Inertia Builder] ✗ Page generation failed:`, message)
  }

  // Step 3: Backend build
  // NOTE: For Inertia, backend also needs to generate Inertia::render() routes
  // The backend-bridge sends the same payload — InertiaRouteBuilder on Laravel side
  // will detect framework: inertia and generate Inertia routes instead of REST
  const isStatic = parsed.databases.length === 0 && parsed.apis.length === 0
  if (isStatic) {
    steps.push({ name: 'Trigger Backend Build', status: 'success', message: 'Static tatemono — no backend' })
    console.log(`[Arkzen Inertia Bridge] ✓ Static tatemono — skipping backend build`)
  } else {
    try {
      await triggerBackendBuild(parsed)
      steps.push({ name: 'Trigger Backend Build', status: 'success', message: 'Laravel backend updated' })
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

// ─── Rebuild ──────────────────────────────────────────────────────────────────

export async function rebuildInertiaTatemono(corePath: string): Promise<InertiaBuildResult> {
  const tatName = path.basename(path.dirname(corePath))
  unregisterInertiaPages(tatName)
  return buildInertiaTatemono(corePath)
}

// ─── Remove ───────────────────────────────────────────────────────────────────

export function removeInertiaTatemono(tatName: string): void {
  unregisterInertiaPages(tatName)
  triggerBackendRemove(tatName).catch(() => {})
  console.log(`[Arkzen Inertia Builder] ✓ Removed: ${tatName}`)
}