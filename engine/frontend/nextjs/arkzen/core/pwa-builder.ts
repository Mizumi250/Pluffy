// ============================================================
// ARKZEN ENGINE — NEXT.JS PWA BUILDER v8.0
// Stack-specific wrapper. All shared logic lives in pwa-builder.ts
// (synced from engine/shared) — this file only handles Next.js
// file structure differences:
//   app/{name}/offline/page.tsx  — offline page as a Next.js page
//   app/{name}/layout.tsx        — metadata + manifest injection
//   'use client' directives      — Next.js RSC requirement
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono } from '../types'
import {
  generateOfflinePageJSX,
  generateSWRegistration,
  writePWAPublicFiles,
  writePWAHook,
} from './pwa-builder.shared'

export { parsePWAConfig } from './pwa-builder.shared'
export type { ArkzenPWAConfig } from './pwa-builder.shared'

import type { ArkzenPWAConfig } from './pwa-builder.shared'

// ─── Next.js exclusive: offline page as app/[name]/offline/page.tsx ──────────

function generateOfflinePage(tatName: string, pwa: ArkzenPWAConfig): string {
  return `'use client'
// ============================================================
// ARKZEN OFFLINE PAGE — ${tatName} [Next.js]
// Auto-generated — do not edit directly
// ============================================================

export default function OfflinePage() {
  return (
${generateOfflinePageJSX(tatName, pwa)}
  )
}
`
}

// ─── Next.js exclusive: layout.tsx metadata block ────────────────────────────

function generateLayoutMetadata(tatName: string, pwa: ArkzenPWAConfig): string {
  return `import type { Metadata } from 'next'

export const metadata: Metadata = {
  manifest: '/manifest-${tatName}.json',
  themeColor: '${pwa.theme_color}',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '${pwa.name}',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function ${tatName.replace(/-./g, m => m[1].toUpperCase())}Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
`
}

// ─── Main export: generatePWAFiles (Next.js) ─────────────────────────────────

export function generatePWAFiles(tatemono: ParsedTatemono, pwa: ArkzenPWAConfig): void {
  const tatName   = tatemono.meta.name
  const publicDir = path.resolve(process.cwd(), 'public')
  const appDir    = path.resolve(process.cwd(), 'app', tatName)
  const hooksDir  = path.resolve(process.cwd(), 'arkzen', 'core', 'hooks')

  // Shared: manifest.json + sw-{name}.js + usePWA hook
  writePWAPublicFiles(tatName, pwa, publicDir)
  writePWAHook(tatName, hooksDir)

  // Next.js: offline page as app/{name}/offline/page.tsx
  const offlineDir = path.join(appDir, 'offline')
  fs.mkdirSync(offlineDir, { recursive: true })
  fs.writeFileSync(
    path.join(offlineDir, 'page.tsx'),
    generateOfflinePage(tatName, pwa),
    'utf-8'
  )
  console.log(`[Arkzen PWA] ✓ Offline page: app/${tatName}/offline/page.tsx`)

  // Next.js: inject metadata into app/{name}/layout.tsx
  const layoutPath = path.join(appDir, 'layout.tsx')
  if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, 'utf-8')
    if (!layoutContent.includes(`manifest-${tatName}`)) {
      layoutContent = generateLayoutMetadata(tatName, pwa) + '\n' + layoutContent
      fs.writeFileSync(layoutPath, layoutContent, 'utf-8')
      console.log(`[Arkzen PWA] ✓ Layout updated with manifest + meta`)
    }
  } else {
    fs.mkdirSync(appDir, { recursive: true })
    fs.writeFileSync(layoutPath, generateLayoutMetadata(tatName, pwa), 'utf-8')
    console.log(`[Arkzen PWA] ✓ Layout created with PWA meta`)
  }

  console.log(`[Arkzen PWA] ✓ PWA fully generated for: ${tatName}`)
  console.log(`[Arkzen PWA]   • Offline support: ${pwa.offline ? 'enabled' : 'disabled'}`)
  console.log(`[Arkzen PWA]   • Start URL: ${pwa.start_url}`)
}