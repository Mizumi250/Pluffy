// ============================================================
// ARKZEN ENGINE — EXPO BUILDER v1.0
//
// Orchestrates tatemono build for the Expo stack.
// Mirrors the pattern of nextjs/arkzen/core/builder.ts exactly.
//
// REUSES:  Same shared parser (engine/shared/arkzen/core/parser.ts)
// READS:   @arkzen:native:page:* blocks (native section of tatemono)
//          Falls back to @arkzen:web:page:* if no native section found.
// OUTPUTS: src/screens/{tat}/{screen}.tsx  ← Screen components
//          app/{tat}/{screen}.tsx           ← Expo Router file routes
//          src/arkzen/generated/routes.ts   ← Route registry
//
// STEPS:
//   1. Parse Tatemono   (shared parser — same DSL)
//   2. Register Screens (expo-router.ts)
//   3. Trigger Backend  (same Laravel backend — API is shared)
//   4. Update Registry  (expo-registry.ts)
// ============================================================

import * as path from 'path'
import * as fs   from 'fs'
import { parseTatemono }               from '../../../nextjs/arkzen/core/parser'
import { registerExpoScreens, unregisterExpoScreens } from './expo-router'
import { updateExpoRegistry, removeFromExpoRegistry } from './expo-registry'
import { triggerBackendBuild, triggerBackendRemove }  from '../../../nextjs/arkzen/core/backend-bridge'
import { syncSharedCoreToCurrentStack }               from '../../../nextjs/arkzen/core/shared-sync'
import type { ExpoBuildResult }                       from '../types'

// ─── Build ────────────────────────────────────────────────────────────────────

export async function buildExpoTatemono(corePath: string): Promise<ExpoBuildResult> {
  syncSharedCoreToCurrentStack('Arkzen Expo Builder')

  const fileName     = path.basename(corePath, '.tsx')
  const tatemonoName = fileName === 'core'
    ? path.basename(path.dirname(corePath))
    : fileName

  const steps: ExpoBuildResult['steps'] = []
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
      message: `Parsed ${tatemonoName} — ${parsed.pages.length} screen(s)`,
    })
    console.log(`[Arkzen Expo] ✓ Parsed: ${tatemonoName} v${parsed.meta.version}`)
    console.log(`[Arkzen Expo]   Screens: ${parsed.pages.map(p => p.name).join(', ')}`)
    console.log(`[Arkzen Expo]   Auth: ${parsed.meta.auth}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Parse Tatemono', status: 'failed', message })
    console.error(`[Arkzen Expo] ✗ Parse failed:`, message)
    return { success: false, tatemono: tatemonoName, errors: [message], steps }
  }

  // ─── Step 2: Register Expo Screens ───────────────────────
  try {
    registerExpoScreens(parsed)
    const routes = parsed.pages.map(p => `/${parsed.meta.name}/${p.name}`).join(', ')
    steps.push({
      name:    'Register Expo Screens',
      status:  'success',
      message: `${parsed.pages.length} screen(s) registered: ${routes}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Register Expo Screens', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen Expo] ✗ Screen registration failed:`, message)
  }

  // ─── Step 3: Trigger Backend Build ───────────────────────
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

  // ─── Step 4: Update Registry ─────────────────────────────
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

export async function rebuildExpoTatemono(corePath: string): Promise<ExpoBuildResult> {
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
