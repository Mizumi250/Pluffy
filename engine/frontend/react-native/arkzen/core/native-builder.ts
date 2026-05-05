// ============================================================
// ARKZEN ENGINE — NATIVE BUILDER v1.0
// Orchestrates tatemono build for React Native stack
//
// REUSES: Same parser as Next.js — DSL is identical
// GENERATES: React Native screens instead of web pages
//
// KEY DIFFERENCES from web stacks:
//   - No HTML/CSS → React Native StyleSheet
//   - No <div> → <View>, <Text>, <ScrollView>, etc.
//   - No React Router → React Navigation
//   - No Tailwind → StyleSheet.create({}) with JS objects
//   - No browser APIs → AsyncStorage, SecureStore, etc.
//   - No fetch for auth → same arkzenFetch but with token storage
//
// STATUS: Foundation only — screen generation is stubbed.
//   The builder parses tatemonos and creates placeholder screens.
//   Full native component generation is planned for v9 final.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { parseTatemono } from '../../../nextjs/arkzen/core/parser'
import { syncSharedCoreToCurrentStack } from '../../../nextjs/arkzen/core/shared-sync'
import { registerNativeScreens, unregisterNativeScreens } from './native-router'
import { triggerBackendBuild, triggerBackendRemove } from '../../../nextjs/arkzen/core/backend-bridge'

export interface NativeBuildResult {
  success:  boolean
  tatemono: string
  errors:   string[]
  steps:    { name: string; status: 'success' | 'failed'; message?: string }[]
}

// ─── Build ────────────────────────────────────────────────────────────────────

export async function buildNativeTatemono(corePath: string): Promise<NativeBuildResult> {
  syncSharedCoreToCurrentStack('Arkzen Native Builder')

  const tatName = path.basename(path.dirname(corePath))
  const steps: NativeBuildResult['steps'] = []
  const errors: string[] = []

  console.log(`\n[Arkzen Native Builder] ════════════════════════════════`)
  console.log(`[Arkzen Native Builder] Building: ${tatName}`)
  console.log(`[Arkzen Native Builder] ════════════════════════════════`)

  // Step 1: Parse (reuses Next.js parser — same DSL)
  let parsed: Awaited<ReturnType<typeof parseTatemono>>
  try {
    parsed = parseTatemono(corePath)
    steps.push({
      name:    'Parse Tatemono',
      status:  'success',
      message: `Parsed ${tatName} — ${parsed.pages.length} screen(s)`,
    })
    console.log(`[Arkzen Native] ✓ Parsed: ${tatName} v${parsed.meta.version}`)
    console.log(`[Arkzen Native]   Screens: ${parsed.pages.map(p => p.name).join(', ')}`)
    console.log(`[Arkzen Native]   ⚠ NOTE: @arkzen:page blocks contain web JSX`)
    console.log(`[Arkzen Native]   ⚠ Full native screen generation planned for v9 final`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Parse Tatemono', status: 'failed', message })
    console.error(`[Arkzen Native Builder] ✗ Parse failed:`, message)
    return { success: false, tatemono: tatName, errors: [message], steps }
  }

  // Step 2: Generate native screens
  try {
    registerNativeScreens(parsed)
    steps.push({
      name:    'Register Native Screens',
      status:  'success',
      message: `${parsed.pages.length} screen(s) generated in src/screens/`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Register Native Screens', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen Native Builder] ✗ Screen generation failed:`, message)
  }

  // Step 3: Backend build (same Laravel backend — API is shared)
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
      console.error(`[Arkzen Native Builder] ✗ Backend build failed:`, message)
    }
  }

  const success = errors.length === 0
  console.log(`\n[Arkzen Native Builder] Build ${success ? '✓ COMPLETE' : '✗ FAILED'}: ${tatName}`)
  steps.forEach(s => console.log(`  ${s.status === 'success' ? '✓' : '✗'} ${s.name}: ${s.message ?? ''}`))

  return { success, tatemono: tatName, errors, steps }
}

// ─── Rebuild ──────────────────────────────────────────────────────────────────

export async function rebuildNativeTatemono(corePath: string): Promise<NativeBuildResult> {
  const tatName = path.basename(path.dirname(corePath))
  unregisterNativeScreens(tatName)
  return buildNativeTatemono(corePath)
}

// ─── Remove ───────────────────────────────────────────────────────────────────

export function removeNativeTatemono(tatName: string): void {
  unregisterNativeScreens(tatName)
  triggerBackendRemove(tatName).catch(() => {})
  console.log(`[Arkzen Native Builder] ✓ Removed: ${tatName}`)
}
