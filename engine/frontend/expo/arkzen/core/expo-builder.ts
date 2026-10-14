// ============================================================
// ARKZEN ENGINE — EXPO BUILDER v2.0
//
// Orchestrates tatemono build for the Expo stack.
//
// REUSES:  Shared parser (synced from engine/shared/arkzen/engine-core/parser.ts)
// READS:   @arkzen:native:page:* blocks ONLY — no web fallback.
//          If a tatemono has zero @arkzen:native:page blocks it is
//          web-only and this builder skips it entirely, just like the
//          web builders skip tatemonos with no @arkzen:web:page blocks.
// OUTPUTS: src/screens/{tat}/{screen}.tsx  ← Screen components
//          app/{tat}/{screen}.tsx           ← Expo Router file routes
//          src/arkzen/generated/routes.ts   ← Route registry
//
// STEPS:
//   1. Parse Tatemono   (shared parser — same DSL)
//   2. Guard: skip if no nativePages
//   3. Register Screens (expo-router.ts — reads parsed.nativePages)
//   4. Trigger Backend  (same Laravel backend — API is shared)
//   5. Update Registry  (expo-registry.ts)
// ============================================================

import * as path from 'path'
import * as fs   from 'fs'
import { parseTatemono }               from './parser'
import { registerExpoScreens, unregisterExpoScreens } from './expo-router'
import { updateExpoRegistry, removeFromExpoRegistry } from './expo-registry'
import { triggerBackendBuild, triggerBackendRemove }  from './backend-bridge'
import { syncSharedCoreToCurrentStack }               from './shared-sync'
import type { BuildResult }                           from '../types'

// ─── Build ────────────────────────────────────────────────────────────────────

export async function buildExpoTatemono(corePath: string): Promise<BuildResult> {
  syncSharedCoreToCurrentStack('Arkzen Expo Builder')

  const fileName     = path.basename(corePath, '.tsx')
  const tatemonoName = fileName === 'core'
    ? path.basename(path.dirname(corePath))
    : fileName

  const steps: BuildResult['steps'] = []
  const errors: string[] = []

  console.log(`\n[Arkzen Expo] ════════════════════════════════`)
  console.log(`[Arkzen Expo] Building: ${tatemonoName}`)
  console.log(`[Arkzen Expo] ════════════════════════════════`)

  // ─── Step 1: Parse ───────────────────────────────────────
  let parsed: ReturnType<typeof parseTatemono>
  try {
    parsed = parseTatemono(corePath)
    steps.push({
      name:    'Parse Tatemono',
      status:  'success',
      message: `Parsed ${tatemonoName} — ${parsed.nativePages.length} screen(s)`,
    })
    console.log(`[Arkzen Expo] ✓ Parsed: ${tatemonoName} v${parsed.meta.version}`)
    console.log(`[Arkzen Expo]   Auth: ${parsed.meta.auth}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Parse Tatemono', status: 'failed', message })
    console.error(`[Arkzen Expo] ✗ Parse failed:`, message)
    return { success: false, tatemono: tatemonoName, errors: [message], steps }
  }

  // ─── Step 2: Native guard ─────────────────────────────────
  // A tatemono with no @arkzen:native:page blocks is web-only.
  // Skip it — same contract as web builders skipping non-web tatemonos.
  if (!parsed.nativePages || parsed.nativePages.length === 0) {
    console.log(`[Arkzen Expo] ⏭ Skipping ${tatemonoName} — no @arkzen:native:page blocks (web-only tatemono)`)
    steps.push({
      name:    'Native guard',
      status:  'success',
      message: 'Web-only tatemono — no native screens to build',
    })
    return { success: true, tatemono: tatemonoName, errors: [], steps }
  }

  console.log(`[Arkzen Expo]   Screens: ${parsed.nativePages.map(p => p.name).join(', ')}`)

  // ─── Step 3: Register Expo Screens ───────────────────────
  try {
    registerExpoScreens(parsed)
    const routes = parsed.nativePages.map(p => `/${parsed.meta.name}/${p.name}`).join(', ')
    steps.push({
      name:    'Register Expo Screens',
      status:  'success',
      message: `${parsed.nativePages.length} screen(s) registered: ${routes}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Register Expo Screens', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen Expo] ✗ Screen registration failed:`, message)
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
      console.error(`[Arkzen Expo] ✗ Backend build failed:`, message)
    }
  }

  // ─── Step 5: Update Registry ─────────────────────────────
  try {
    updateExpoRegistry(parsed)
    steps.push({
      name:    'Update Registry',
      status:  'success',
      message: `${tatemonoName} registered in expo-registry.json`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Update Registry', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen Expo] ✗ Registry update failed:`, message)
  }

  const success = errors.length === 0

  console.log(`\n[Arkzen Expo] Build ${success ? '✓ COMPLETE' : '✗ FAILED'}: ${tatemonoName}`)
  steps.forEach(s => {
    const icon = s.status === 'success' ? '  ✓' : '  ✗'
    console.log(`${icon} ${s.name}: ${s.message ?? ''}`)
  })

  return { success, tatemono: tatemonoName, errors, steps }
}

// ─── Rebuild ──────────────────────────────────────────────────────────────────

export async function rebuildExpoTatemono(corePath: string): Promise<BuildResult> {
  const fileName     = path.basename(corePath, '.tsx')
  const tatemonoName = fileName === 'core'
    ? path.basename(path.dirname(corePath))
    : fileName

  unregisterExpoScreens(tatemonoName)
  return buildExpoTatemono(corePath)
}

// ─── Remove ───────────────────────────────────────────────────────────────────

export function removeExpoTatemono(tatemonoName: string): void {
  unregisterExpoScreens(tatemonoName)
  removeFromExpoRegistry(tatemonoName)
  triggerBackendRemove(tatemonoName).catch(() => {})
  console.log(`[Arkzen Expo] ✓ Removed: ${tatemonoName}`)
}
