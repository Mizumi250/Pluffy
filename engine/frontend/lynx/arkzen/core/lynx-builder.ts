// ============================================================
// ARKZEN ENGINE — LYNX BUILDER v1.0
//
// Orchestrates tatemono build for the Lynx stack.
//
// Mirrors expo-builder.ts exactly — same 5-step pattern:
//   1. Parse Tatemono
//   2. Guard: skip if no @arkzen:native:page:lynx blocks
//   3. Register Lynx Pages (lynx-router.ts)
//   4. Trigger Backend Build (shared Laravel — API is shared)
//   5. Update Registry (lynx-registry.ts)
//
// READS:   @arkzen:native:page:lynx:* blocks ONLY.
//          If a tatemono has zero Lynx page blocks it is skipped.
// OUTPUTS: src/pages/{tat}/{page}.tsx          ← Lynx page components
//          src/pages/{tat}/components/*.tsx     ← Lynx components
//          src/arkzen/generated/{tat}.lynx-styles.css
//          src/arkzen/generated/{tat}.lynx-animations.ts
//          src/arkzen/generated/{tat}.lynx-utils.ts
//          src/arkzen/generated/routes.ts       ← Route registry
//          src/App.tsx                          ← Regenerated entry point
// ============================================================

import * as path from 'path'
import * as fs   from 'fs'
import { parseTatemono }                          from './parser'
import { registerLynxPages, unregisterLynxPages } from './lynx-router'
import { updateLynxRegistry, removeFromLynxRegistry } from './lynx-registry'
import { triggerBackendBuild, triggerBackendRemove }   from './backend-bridge'
import { syncSharedCoreToCurrentStack }               from './shared-sync'
import type { LynxBuildResult }                       from '../types'

// ─── Build ────────────────────────────────────────────────────────────────────

export async function buildLynxTatemono(corePath: string): Promise<LynxBuildResult> {
  syncSharedCoreToCurrentStack('Arkzen Lynx Builder')

  const fileName     = path.basename(corePath, '.tsx')
  const tatemonoName = fileName === 'core'
    ? path.basename(path.dirname(corePath))
    : fileName

  const steps: LynxBuildResult['steps'] = []
  const errors: string[] = []

  console.log(`\n[Arkzen Lynx] ════════════════════════════════`)
  console.log(`[Arkzen Lynx] Building: ${tatemonoName}`)
  console.log(`[Arkzen Lynx] ════════════════════════════════`)

  // ─── Step 1: Parse ───────────────────────────────────────
  let parsed: ReturnType<typeof parseTatemono>
  try {
    parsed = parseTatemono(corePath)
    const count = (parsed.nativeLynxPages ?? []).length
    steps.push({
      name:    'Parse Tatemono',
      status:  'success',
      message: `Parsed ${tatemonoName} — ${count} Lynx page(s)`,
    })
    console.log(`[Arkzen Lynx] ✓ Parsed: ${tatemonoName} v${parsed.meta.version}`)
    console.log(`[Arkzen Lynx]   Auth: ${parsed.meta.auth}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Parse Tatemono', status: 'failed', message })
    console.error(`[Arkzen Lynx] ✗ Parse failed:`, message)
    return { success: false, tatemono: tatemonoName, errors: [message], steps }
  }

  // ─── Step 2: Lynx guard ───────────────────────────────────
  const lynxPages = parsed.nativeLynxPages ?? []
  if (lynxPages.length === 0) {
    console.log(`[Arkzen Lynx] ⏭ Skipping ${tatemonoName} — no @arkzen:native:page:lynx blocks`)
    steps.push({
      name:    'Lynx guard',
      status:  'success',
      message: 'No Lynx pages — skipping',
    })
    return { success: true, tatemono: tatemonoName, errors: [], steps }
  }

  console.log(`[Arkzen Lynx]   Pages: ${lynxPages.map(p => p.name).join(', ')}`)

  // ─── Step 3: Register Lynx Pages ─────────────────────────
  try {
    registerLynxPages(parsed)
    steps.push({
      name:    'Register Lynx Pages',
      status:  'success',
      message: `${lynxPages.length} page(s) registered`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Register Lynx Pages', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen Lynx] ✗ Page registration failed:`, message)
  }

  // ─── Step 4: Trigger Backend Build ───────────────────────
  const isStatic = parsed.databases.length === 0 && parsed.apis.length === 0
  if (isStatic) {
    steps.push({
      name:    'Trigger Backend Build',
      status:  'success',
      message: 'Static tatemono — no backend',
    })
  } else {
    try {
      await triggerBackendBuild(parsed)
      const controllers = parsed.apis.map(a => a.controller).join(', ')
      steps.push({
        name:    'Trigger Backend Build',
        status:  'success',
        message: `Backend built: ${controllers}`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      steps.push({ name: 'Trigger Backend Build', status: 'failed', message })
      errors.push(message)
      console.error(`[Arkzen Lynx] ✗ Backend build failed:`, message)
    }
  }

  // ─── Step 5: Update Registry ─────────────────────────────
  try {
    updateLynxRegistry(parsed)
    steps.push({
      name:    'Update Registry',
      status:  'success',
      message: `${tatemonoName} registered in lynx-registry.json`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Update Registry', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen Lynx] ✗ Registry update failed:`, message)
  }

  const success = errors.length === 0

  console.log(`\n[Arkzen Lynx] Build ${success ? '✓ COMPLETE' : '✗ FAILED'}: ${tatemonoName}`)
  steps.forEach(s => {
    const icon = s.status === 'success' ? '  ✓' : '  ✗'
    console.log(`${icon} ${s.name}: ${s.message ?? ''}`)
  })

  return { success, tatemono: tatemonoName, errors, steps }
}

// ─── Rebuild ──────────────────────────────────────────────────────────────────

export async function rebuildLynxTatemono(corePath: string): Promise<LynxBuildResult> {
  const fileName     = path.basename(corePath, '.tsx')
  const tatemonoName = fileName === 'core'
    ? path.basename(path.dirname(corePath))
    : fileName

  unregisterLynxPages(tatemonoName)
  return buildLynxTatemono(corePath)
}

// ─── Remove ───────────────────────────────────────────────────────────────────

export function removeLynxTatemono(tatemonoName: string): void {
  unregisterLynxPages(tatemonoName)
  removeFromLynxRegistry(tatemonoName)
  triggerBackendRemove(tatemonoName).catch(() => {})
  console.log(`[Arkzen Lynx] ✓ Removed: ${tatemonoName}`)
}