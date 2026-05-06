// ============================================================
// ARKZEN ENGINE — REACT+VITE PWA BUILDER v1.0
// Stack-specific wrapper. Shared logic lives in pwa-builder.ts
// (synced from engine/shared) — this file only handles the
// Vite file structure differences:
//   src/pages/{name}/offline.tsx — offline page as a route
//   index.html                   — manifest link injection
//   public/                      — manifest.json + sw js
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

export function generatePWAFiles(tatemono: ParsedTatemono, pwa: ArkzenPWAConfig): void {
  const tatName   = tatemono.meta.name
  const publicDir = path.resolve(process.cwd(), 'public')
  const pagesDir  = path.resolve(process.cwd(), 'src', 'pages', tatName)
  const hooksDir  = path.resolve(process.cwd(), 'arkzen', 'core', 'hooks')

  // Shared: manifest.json + sw-{name}.js + usePWA hook
  writePWAPublicFiles(tatName, pwa, publicDir)
  writePWAHook(tatName, hooksDir)

  // Vite: offline page as a regular route component
  fs.mkdirSync(pagesDir, { recursive: true })
  fs.writeFileSync(path.join(pagesDir, 'offline.tsx'), `// ============================================================
// ARKZEN OFFLINE PAGE — ${tatName} [React+Vite]
// Auto-generated — do not edit directly
// ============================================================

import React from 'react'

export default function OfflinePage() {
  return (
${generateOfflinePageJSX(tatName, pwa)}
  )
}
`, 'utf-8')
  console.log(`[Arkzen PWA] ✓ Offline page: src/pages/${tatName}/offline.tsx`)

  // Vite: inject manifest link into index.html if not already there
  const indexPath = path.resolve(process.cwd(), 'index.html')
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf-8')
    if (!html.includes(`manifest-${tatName}`)) {
      const manifestTag = `  <link rel="manifest" href="/manifest-${tatName}.json" />\n  <meta name="theme-color" content="${pwa.theme_color}" />`
      html = html.replace('</head>', `${manifestTag}\n</head>`)

      // Inject SW registration before </body>
      const swSnippet = `  <script>\n  ${generateSWRegistration(tatName)}\n  </script>`
      html = html.replace('</body>', `${swSnippet}\n</body>`)

      fs.writeFileSync(indexPath, html, 'utf-8')
      console.log(`[Arkzen PWA] ✓ index.html updated with manifest + SW registration`)
    }
  }

  console.log(`[Arkzen PWA] ✓ PWA fully generated for: ${tatName}`)
  console.log(`[Arkzen PWA]   • Offline support: ${pwa.offline ? 'enabled' : 'disabled'}`)
  console.log(`[Arkzen PWA]   • Start URL: ${pwa.start_url}`)
}
