// ============================================================
// ARKZEN ENGINE — VITE BUILDER v2.0
// Orchestrates tatemono build for React+Vite stack.
//
// v2.0: All imports now resolve locally — no more cross-stack
//       relative path imports from ../../../nextjs/.
//       parser, backend-bridge, shared-sync live in this
//       stack's arkzen/core/ (synced from engine/shared).
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { parseTatemono }                          from '../parser'
import { syncSharedCoreToCurrentStack }           from '../shared-sync'
import { registerVitePages, unregisterVitePages } from './vite-router'
import { triggerBackendBuild, triggerBackendRemove } from '../backend-bridge'
import { parsePWAConfig, generatePWAFiles } from './pwa-builder'

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
  triggerBackendRemove(tatName).catch(() => {})
  console.log(`[Arkzen Vite Builder] ✓ Removed: ${tatName}`)
}
