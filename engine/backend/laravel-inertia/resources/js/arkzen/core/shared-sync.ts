// ============================================================
// ARKZEN ENGINE — SHARED CORE SYNC v2.1
//
// Copies engine/shared/arkzen/core/* into the current stack's
// arkzen/core/ so every stack gets identical shared logic.
//
// v2.1 — pwa-builder.ts now syncs as pwa-builder.shared.ts
//   so each stack's thin pwa-builder.ts wrapper is never
//   overwritten by the shared copy.
//
// Folders:  components/, hooks/, lib/, layouts/, stores/
// Files:    parser.ts, backend-bridge.ts, assets.ts,
//           validator.ts, sitemap.ts
// Special:  pwa-builder.ts → pwa-builder.shared.ts
//
// NEVER synced (each stack owns these):
//   adapters/router.ts   — framework-specific (next/navigation vs react-router-dom)
//   adapters/Link.tsx    — framework-specific (next/link vs react-router Link)
//   pwa-builder.ts       — stack-specific thin wrapper
//   generated/           — runtime output
//   vite-*/builder/router/watcher — stack engine files
//
// Skips unchanged files to avoid watch-restart loops.
// ============================================================

import * as fs from 'fs'
import * as path from 'path'

const SHARED_FOLDERS = ['components', 'hooks', 'lib', 'layouts', 'stores'] as const
const SHARED_FILES   = ['parser.ts', 'backend-bridge.ts', 'assets.ts', 'validator.ts', 'sitemap.ts'] as const

// Files inside shared folders that must NOT be overwritten per-stack
const ADAPTER_PROTECTED = new Set(['router.ts', 'Link.tsx', 'Link.ts'])

export function syncSharedCoreToCurrentStack(label: string): void {
  const rootDir       = path.resolve(process.cwd(), '..', '..', '..')
  const sharedCoreDir = path.join(rootDir, 'engine', 'shared', 'arkzen', 'core')
  const stackCoreDir  = path.join(process.cwd(), 'arkzen', 'core')

  if (!fs.existsSync(sharedCoreDir)) {
    console.warn(`[${label}] ⚠ Shared core not found at ${sharedCoreDir}`)
    return
  }

  fs.mkdirSync(stackCoreDir, { recursive: true })

  for (const folder of SHARED_FOLDERS) {
    const src  = path.join(sharedCoreDir, folder)
    const dest = path.join(stackCoreDir, folder)
    if (!fs.existsSync(src)) continue
    syncDirectoryIfChanged(src, dest, folder === 'adapters' ? ADAPTER_PROTECTED : new Set())
  }

  for (const file of SHARED_FILES) {
    const src  = path.join(sharedCoreDir, file)
    const dest = path.join(stackCoreDir, file)
    if (!fs.existsSync(src)) continue
    copyFileIfChanged(src, dest)
  }

  // Special: pwa-builder.ts syncs as pwa-builder.shared.ts
  // so each stack's thin pwa-builder.ts wrapper is never overwritten
  const pwaSrc  = path.join(sharedCoreDir, 'pwa-builder.ts')
  const pwaDest = path.join(stackCoreDir,  'pwa-builder.shared.ts')
  if (fs.existsSync(pwaSrc)) copyFileIfChanged(pwaSrc, pwaDest)

  console.log(`[${label}] ✓ Synced shared core (${[...SHARED_FOLDERS, ...SHARED_FILES, 'pwa-builder.shared.ts'].join(', ')})`)
}

function copyFileIfChanged(src: string, dest: string): void {
  if (!fs.existsSync(dest)) { fs.copyFileSync(src, dest); return }
  const srcStat  = fs.statSync(src)
  const destStat = fs.statSync(dest)
  if (srcStat.size !== destStat.size || !fs.readFileSync(src).equals(fs.readFileSync(dest))) {
    fs.copyFileSync(src, dest)
  }
}

function syncDirectoryIfChanged(srcDir: string, destDir: string, skip: Set<string> = new Set()): void {
  fs.mkdirSync(destDir, { recursive: true })

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue

    const srcPath  = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)

    if (entry.isDirectory()) {
      syncDirectoryIfChanged(srcPath, destPath)
      continue
    }

    if (!entry.isFile()) continue
    copyFileIfChanged(srcPath, destPath)
  }
}