// ============================================================
// ARKZEN ENGINE — REACT+INERTIA PWA BUILDER v1.0
// Stack-specific wrapper. Shared logic lives in pwa-builder.shared.ts
// (synced from engine/shared) — this file only handles the
// Inertia/Laravel file structure differences:
//
//   resources/js/Pages/{tat}/Offline.tsx  — offline page as Inertia page
//   public/                               — manifest.json + sw js
//   routes/modules/{tat}.pages.php        — offline route (GET /{tat}/offline)
//
// In Inertia, the offline page must be a proper Inertia page component
// rather than a standalone React route — it's rendered via Laravel's
// Inertia::render() just like every other page.
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

// Paths inside the Laravel+Inertia backend
const ROOT_DIR    = path.resolve(process.cwd(), '..', '..', '..')
const BACKEND_DIR = path.join(ROOT_DIR, 'engine', 'backend', 'laravel-inertia')

export function generatePWAFiles(tatemono: ParsedTatemono, pwa: ArkzenPWAConfig): void {
  const tatName    = tatemono.meta.name
  const tatPascal  = tatName.replace(/(^|-)\w/g, m => m.replace('-', '').toUpperCase())
  const publicDir  = path.join(BACKEND_DIR, 'public')
  const hooksDir   = path.join(BACKEND_DIR, 'resources', 'js', 'arkzen', 'core', 'hooks')
  const pagesDir   = path.join(BACKEND_DIR, 'resources', 'js', 'Pages', tatPascal)
  const routesDir  = path.join(BACKEND_DIR, 'routes', 'modules')

  // Shared: manifest.json + sw-{name}.js + usePWA hook
  writePWAPublicFiles(tatName, pwa, publicDir)
  writePWAHook(tatName, hooksDir)

  // Inertia: offline page as a proper Inertia page component
  fs.mkdirSync(pagesDir, { recursive: true })

  const offlineJSX = generateOfflinePageJSX(tatName, pwa)
  // Wrap in Inertia-compatible default export (no 'use client' directive needed)
  const inertiaOfflinePage = `// ============================================================
// ARKZEN OFFLINE PAGE — ${tatName} [React+Inertia]
// Auto-generated — do not edit directly
// ============================================================

import React from 'react'

${offlineJSX.replace(/^['"]use client['"];?\s*\n?/m, '')}

export default Offline${tatPascal}Page
`

  fs.writeFileSync(path.join(pagesDir, 'Offline.tsx'), inertiaOfflinePage, 'utf-8')
  console.log(`[Arkzen Inertia PWA] ✓ Offline page written: Pages/${tatPascal}/Offline.tsx`)

  // Write route for the offline page
  fs.mkdirSync(routesDir, { recursive: true })
  const offlineRoute = `<?php
// ARKZEN GENERATED — PWA offline route for ${tatName}
// DO NOT EDIT — managed by Arkzen engine

use Illuminate\\Support\\Facades\\Route;

Route::middleware(['web'])->group(function () {
    Route::get('/${tatName}/offline', function () {
        return \\Inertia\\Inertia::render('${tatPascal}/Offline');
    })->name('${tatName}.offline');
});
`
  // Append offline route to the tatemono's existing pages route file if present
  const pagesRouteFile = path.join(routesDir, `${tatName}.pages.php`)
  if (fs.existsSync(pagesRouteFile)) {
    const existing = fs.readFileSync(pagesRouteFile, 'utf-8')
    if (!existing.includes(`${tatName}/offline`)) {
      // Insert before closing }); of the web group
      const updated = existing.replace(
        /\}\);\s*$/,
        `\n    // Offline page (PWA)\n    Route::get('/${tatName}/offline', function () {\n        return \\Inertia\\Inertia::render('${tatPascal}/Offline');\n    })->name('${tatName}.offline');\n});\n`
      )
      fs.writeFileSync(pagesRouteFile, updated, 'utf-8')
      console.log(`[Arkzen Inertia PWA] ✓ Offline route appended to ${tatName}.pages.php`)
    }
  } else {
    fs.writeFileSync(path.join(routesDir, `${tatName}-offline.pages.php`), offlineRoute, 'utf-8')
    console.log(`[Arkzen Inertia PWA] ✓ Offline route written: ${tatName}-offline.pages.php`)
  }

  // Inject SW registration into resources/js/app.tsx
  const appTsxPath = path.join(BACKEND_DIR, 'resources', 'js', 'app.tsx')
  if (fs.existsSync(appTsxPath)) {
    const appContent = fs.readFileSync(appTsxPath, 'utf-8')
    const swSnippet  = generateSWRegistration(tatName)

    if (!appContent.includes(`sw-${tatName}.js`)) {
      const updated = appContent + `\n// PWA: ${tatName}\n${swSnippet}\n`
      fs.writeFileSync(appTsxPath, updated, 'utf-8')
      console.log(`[Arkzen Inertia PWA] ✓ SW registration injected into app.tsx`)
    }
  }

  console.log(`[Arkzen Inertia PWA] ✓ PWA files generated for: ${tatName}`)
}
