// ============================================================
// ARKZEN ENGINE — ASTRO BUILDER v1.0
// Orchestrates tatemono build for the Astro stack.
// Mirrors react-vite/arkzen/core/vite-builder.ts exactly —
// same steps, same structure, Astro-flavoured output.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { parseTatemono }                              from './parser'
import { syncSharedCoreToCurrentStack }               from './shared-sync'
import { registerAstroPages, unregisterAstroPages }  from './astro-router'
import { triggerBackendBuild, triggerBackendRemove }  from './backend-bridge'
import { parsePWAConfig, generatePWAFiles }           from './pwa-builder'
import { updateRegistry, removeFromRegistry }         from './registry'

export interface AstroBuildResult {
  success:  boolean
  tatemono: string
  errors:   string[]
  steps:    { name: string; status: 'success' | 'failed'; message?: string }[]
}

export async function buildAstroTatemono(corePath: string): Promise<AstroBuildResult> {
  syncSharedCoreToCurrentStack('Arkzen Astro Builder')

  const tatName = path.basename(path.dirname(corePath))
  const steps: AstroBuildResult['steps'] = []
  const errors: string[] = []

  console.log(`\n[Arkzen Astro Builder] ════════════════════════════════`)
  console.log(`[Arkzen Astro Builder] Building: ${tatName}`)
  console.log(`[Arkzen Astro Builder] ════════════════════════════════`)

  let parsed: Awaited<ReturnType<typeof parseTatemono>>
  try {
    parsed = parseTatemono(corePath)
    steps.push({ name: 'Parse Tatemono', status: 'success', message: `Parsed ${tatName} — ${parsed.pages.length} page(s)` })
    console.log(`[Arkzen Astro Parser] ✓ Parsed: ${tatName} v${parsed.meta.version}`)
    console.log(`[Arkzen Astro Parser]   Pages: ${parsed.pages.map(p => p.name).join(', ')}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Parse Tatemono', status: 'failed', message })
    console.error(`[Arkzen Astro Builder] ✗ Parse failed:`, message)
    return { success: false, tatemono: tatName, errors: [message], steps }
  }

  try {
    registerAstroPages(parsed)
    steps.push({ name: 'Register Astro Pages', status: 'success', message: `${parsed.pages.length} page(s) registered` })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Register Astro Pages', status: 'failed', message })
    errors.push(message)
    console.error(`[Arkzen Astro Builder] ✗ Page registration failed:`, message)
  }

  // Clean up old .tsx files from src/pages/ after registering new islands
  try {
    const tatemonoDir = path.join(process.cwd(), 'src', 'pages', tatName)
    if (fs.existsSync(tatemonoDir)) {
      // Remove old component files (now in arkzen/generated/components/)
      const componentsDir = path.join(tatemonoDir, 'components')
      if (fs.existsSync(componentsDir)) {
        fs.rmSync(componentsDir, { recursive: true })
        console.log(`[Arkzen Astro Builder] ✓ Cleaned old components directory`)
      }
      
      // Remove any loose .tsx files in the tatemono dir
      const files = fs.readdirSync(tatemonoDir)
      for (const file of files) {
        if (file.endsWith('.tsx')) {
          fs.unlinkSync(path.join(tatemonoDir, file))
          console.log(`[Arkzen Astro Builder] ✓ Cleaned old island file: ${file}`)
        }
      }
    }
  } catch (e) {
    // Non-fatal cleanup
    console.log(`[Arkzen Astro Builder] ⚠ Could not clean old island files (non-fatal)`)
  }

  const isStatic = parsed.databases.length === 0 && parsed.apis.length === 0
  if (isStatic) {
    steps.push({ name: 'Trigger Backend Build', status: 'success', message: 'Static tatemono — no backend' })
    console.log(`[Arkzen Astro Bridge] ✓ Static tatemono — skipping backend build`)
  } else {
    try {
      await triggerBackendBuild(parsed)
      steps.push({ name: 'Trigger Backend Build', status: 'success', message: 'Laravel backend updated' })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      steps.push({ name: 'Trigger Backend Build', status: 'failed', message })
      errors.push(message)
      console.error(`[Arkzen Astro Builder] ✗ Backend build failed:`, message)
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
      console.error(`[Arkzen Astro Builder] ✗ PWA generation failed:`, message)
    }
  }

  // ── Registry update ────────────────────────────────────────
  try {
    updateRegistry(parsed)
    steps.push({ name: 'Registry', status: 'success', message: `${tatName} registered in arkzen.json` })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    steps.push({ name: 'Registry', status: 'failed', message })
    console.warn(`[Arkzen Astro Builder] ⚠ Registry update failed (non-fatal):`, message)
  }

  const success = errors.length === 0
  console.log(`\n[Arkzen Astro Builder] Build ${success ? '✓ COMPLETE' : '✗ FAILED'}: ${tatName}`)
  steps.forEach(s => console.log(`  ${s.status === 'success' ? '✓' : '✗'} ${s.name}: ${s.message ?? ''}`))
  return { success, tatemono: tatName, errors, steps }
}

export async function rebuildAstroTatemono(corePath: string): Promise<AstroBuildResult> {
  const tatName = path.basename(path.dirname(corePath))
  unregisterAstroPages(tatName)
  return buildAstroTatemono(corePath)
}

export function removeAstroTatemono(tatName: string): void {
  unregisterAstroPages(tatName)
  removeFromRegistry(tatName)
  triggerBackendRemove(tatName).catch(() => {})
  console.log(`[Arkzen Astro Builder] ✓ Removed: ${tatName}`)
}