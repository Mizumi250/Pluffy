// ============================================================
// ARKZEN ENGINE — NATIVE BUILDER v2.0
// Orchestrates tatemono build for the React Native bare stack.
//
// v2.0 — FULL WIRE-UP. Mirrors expo-builder.ts exactly.
//   - Reads @arkzen:native:page blocks ONLY (native guard)
//   - Tatemonos with zero @arkzen:native:page blocks are web-only
//     and skipped — same contract as Expo builder
//   - Delegates to native-router.ts for all file generation
//   - Backend build triggered via shared backend-bridge.ts
//
// v1.0 — Foundation only: stubbed screen generation, placeholder output.
//
// STEPS:
//   1. Parse Tatemono   (shared parser — same DSL as all stacks)
//   2. Guard            skip if no nativePages
//   3. Register Screens (native-router.ts — reads parsed.nativePages)
//   4. Trigger Backend  (shared Laravel backend — API is identical)
//   5. (no separate registry — routes.ts IS the registry)
// ============================================================

import * as path from 'path'
import { parseTatemono }                                   from './parser'
import { syncSharedCoreToCurrentStack }                    from './shared-sync'
import { registerNativeScreens, unregisterNativeScreens }  from './native-router'
import { triggerBackendBuild, triggerBackendRemove }        from './backend-bridge'

export interface NativeBuildResult {
  success:  boolean
  tatemono: string
  errors:   string[]
  steps:    { name: string; status: 'success' | 'failed'; message?: string }[]
}

// ─── Build ────────────────────────────────────────────────────────────────────

export async function buildNativeTatemono(corePath: string): Promise<NativeBuildResult> {
  syncSharedCoreToCurrentStack('Arkzen Native Builder')

  const fileName     = path.basename(corePath, '.tsx')
  const tatemonoName = fileName === 'core'
    ? path.basename(path.dirname(corePath))
    : fileName

  const steps: NativeBuildResult['steps'] = []
  const errors: string[] = []

  console.log(`\n[Arkzen Native] ════════════════════════════════`)
  console.log(`[Arkzen Native] Building: ${tatemonoName}`)
  console.log(`[Arkzen Native] ════════════════════════════════`)

  // ─── Step 1: Parse ───────────────────────────────────────
  let parsed: ReturnType<typeof parseTatemono>
  try {
    parsed = parseTatemono(corePath)
    steps.push({
      name:    'Parse Tatemono',
      status:  'success',
      message: `Parsed ${tatemonoName} — ${parsed.nativePages.length} screen(s)`,
    })
    console.log(`[Arkzen Native] ✓ Parsed: ${tatemonoName} v${parsed.meta.version}`)
    console.log(`[Arkzen Native]   Auth: ${parsed.meta.auth}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Parse Tatemono', status: 'failed', message })
    console.error(`[Arkzen Native] ✗ Parse failed:`, message)
    return { success: false, tatemono: tatemonoName, errors: [message], steps }
  }

  // ─── Step 2: Native guard ─────────────────────────────────
  // A tatemono with no @arkzen:native:page blocks is web-only.
  // Skip it — same contract as Expo builder skipping non-native tatemonos.
  if (!parsed.nativePages || parsed.nativePages.length === 0) {
    console.log(
      `[Arkzen Native] ⏭ Skipping ${tatemonoName} — no @arkzen:native:page blocks (web-only tatemono)`
    )
    steps.push({
      name:    'Native guard',
      status:  'success',
      message: 'Web-only tatemono — no native screens to build',
    })
    return { success: true, tatemono: tatemonoName, errors: [], steps }
  }

  console.log(
    `[Arkzen Native]   Screens: ${parsed.nativePages.map((p: any) => p.name).join(', ')}`
  )

  // ─── Step 3: Register Native Screens ─────────────────────
  try {
    registerNativeScreens(parsed)
    const routes = parsed.nativePages
      .map((p: any) => `${parsed.meta.name}/${p.name}`)
      .join(', ')
    steps.push({
      name:    'Register Native Screens',
      status:  'success',
      message: `${parsed.nativePages.length} screen(s) registered: ${routes}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Register Native Screens', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen Native] ✗ Screen registration failed:`, message)
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
      const controllers = parsed.apis.map((a: any) => a.controller).join(', ')
      steps.push({
        name:    'Trigger Backend Build',
        status:  'success',
        message: `Backend built: ${controllers}`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      steps.push({ name: 'Trigger Backend Build', status: 'failed', message })
      errors.push(message)
      console.error(`[Arkzen Native] ✗ Backend build failed:`, message)
    }
  }

  const success = errors.length === 0

  console.log(`\n[Arkzen Native] Build ${success ? '✓ COMPLETE' : '✗ FAILED'}: ${tatemonoName}`)
  steps.forEach(s => {
    const icon = s.status === 'success' ? '  ✓' : '  ✗'
    console.log(`${icon} ${s.name}: ${s.message ?? ''}`)
  })

  return { success, tatemono: tatemonoName, errors, steps }
}

// ─── Rebuild ──────────────────────────────────────────────────────────────────

export async function rebuildNativeTatemono(corePath: string): Promise<NativeBuildResult> {
  const fileName     = path.basename(corePath, '.tsx')
  const tatemonoName = fileName === 'core'
    ? path.basename(path.dirname(corePath))
    : fileName

  unregisterNativeScreens(tatemonoName)
  return buildNativeTatemono(corePath)
}

// ─── Remove ───────────────────────────────────────────────────────────────────

export function removeNativeTatemono(tatemonoName: string): void {
  unregisterNativeScreens(tatemonoName)
  triggerBackendRemove(tatemonoName).catch(() => {})
  console.log(`[Arkzen Native] ✓ Removed: ${tatemonoName}`)
}
