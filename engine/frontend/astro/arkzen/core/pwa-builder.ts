// ============================================================
// ARKZEN ENGINE — ASTRO PWA BUILDER v1.0
// Stack-specific wrapper. Shared logic lives in pwa-builder.shared.ts
// (synced from engine/shared) — this file only handles the
// Astro file structure differences:
//   src/pages/{name}/offline.astro — offline page as a route
//   src/layouts/                    — manifest link injection
//   public/                         — manifest.json + sw js
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

  // Astro: offline page as .astro component with React island
  fs.mkdirSync(pagesDir, { recursive: true })
  
  const astroOfflineContent = `---
// ARKZEN OFFLINE PAGE — ${tatName} [Astro]
// Auto-generated — do not edit directly
import OfflineContent from './offline.tsx'
---

<OfflineContent client:load />`
  fs.writeFileSync(path.join(pagesDir, 'offline.astro'), astroOfflineContent, 'utf-8')

  const reactOfflineContent = `// ============================================================
// ARKZEN OFFLINE PAGE CONTENT — ${tatName} [React Island]
// Auto-generated — do not edit directly
// ============================================================

import React from 'react'

export default function OfflinePage() {
  return (
${generateOfflinePageJSX(tatName, pwa)}
  )
}
`
  fs.writeFileSync(path.join(pagesDir, 'offline.tsx'), reactOfflineContent, 'utf-8')
  console.log(`[Arkzen PWA] ✓ Offline page: src/pages/${tatName}/offline.astro`)

  // Astro: inject manifest link into src/layouts/Layout.astro if exists
  const layoutPath = path.resolve(process.cwd(), 'src', 'layouts', 'Layout.astro')
  if (fs.existsSync(layoutPath)) {
    let layout = fs.readFileSync(layoutPath, 'utf-8')
    if (!layout.includes(`manifest-${tatName}`)) {
      const manifestTag = `  <link rel="manifest" href="/manifest-${tatName}.json" />\n  <meta name="theme-color" content="${pwa.theme_color}" />`
      layout = layout.replace('</head>', `${manifestTag}\n</head>`)

      // Inject SW registration before </body>
      const swSnippet = `  <script>\n  ${generateSWRegistration(tatName)}\n  </script>`
      layout = layout.replace('</body>', `${swSnippet}\n</body>`)

      fs.writeFileSync(layoutPath, layout, 'utf-8')
      console.log(`[Arkzen PWA] ✓ Layout.astro updated with manifest + SW registration`)
    }
  }

  console.log(`[Arkzen PWA] ✓ PWA fully generated for: ${tatName}`)
  console.log(`[Arkzen PWA]   • Offline support: ${pwa.offline ? 'enabled' : 'disabled'}`)
  console.log(`[Arkzen PWA]   • Start URL: ${pwa.start_url}`)
}
