// ============================================================
// ARKZEN ENGINE — SHARED CORE SYNC v3.0
//
// Copies cross-platform and platform-specific shared files into
// each stack's arkzen/core/ so every stack gets identical shared
// logic.
//
// Source layout (engine/shared/arkzen/):
//   engine-core/   — cross-platform: parser, backend-bridge, validator, shared-sync
//   web-core/      — web components/layouts + cross-platform hooks/lib/stores + assets/sitemap
//   native-core/   — native components/layouts (NativeWind)
//
// Destination (always): <stack>/arkzen/core/
//   ALL stacks get: engine-core files + hooks/ + lib/ + stores/ (cross-platform)
//   Web stacks  add: web-core components/ + layouts/ + assets.ts + sitemap.ts
//   Mobile stacks add: native-core components/ + layouts/
//
// v3.0: Renamed core/ → web-core/. Split engine files into engine-core/.
//       Added platform detection (mobile vs web) for native-core sync.
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

// Engine-core files (cross-platform — synced to ALL stacks)
const ENGINE_FILES = ['parser.ts', 'backend-bridge.ts', 'validator.ts', 'shared-sync.ts'] as const

// Cross-platform folders from web-core (hooks, lib, stores use fetch/zustand — no DOM)
// Synced to ALL stacks (web + mobile)
const CROSS_PLATFORM_FOLDERS = ['hooks', 'lib', 'stores'] as const

// Web-only folders and files (components, layouts use DOM/Tailwind)
const WEB_ONLY_FOLDERS = ['components', 'layouts'] as const
const WEB_FILES        = ['assets.ts', 'sitemap.ts'] as const

// Files inside shared folders that must NOT be overwritten per-stack
const ADAPTER_PROTECTED = new Set(['router.ts', 'Link.tsx', 'Link.ts'])

// Mobile stack names (folder names under engine/frontend/)
const MOBILE_STACKS = new Set(['expo', 'react-native', 'lynx'])

export function syncSharedCoreToCurrentStack(label: string): void {
  const rootDir       = path.resolve(process.cwd(), '..', '..', '..')
  const sharedDir     = path.join(rootDir, 'engine', 'shared', 'arkzen')
  const engineCoreDir = path.join(sharedDir, 'engine-core')
  const webCoreDir    = path.join(sharedDir, 'web-core')
  const nativeCoreDir = path.join(sharedDir, 'native-core')
  const stackCoreDir  = path.join(process.cwd(), 'arkzen', 'core')

  // Determine if current stack is mobile
  const stackName = path.basename(process.cwd())
  const isMobile  = MOBILE_STACKS.has(stackName)

  fs.mkdirSync(stackCoreDir, { recursive: true })

  // 1. Sync engine-core files (always — all platforms)
  if (fs.existsSync(engineCoreDir)) {
    for (const file of ENGINE_FILES) {
      const src  = path.join(engineCoreDir, file)
      const dest = path.join(stackCoreDir, file)
      if (!fs.existsSync(src)) continue
      copyFileIfChanged(src, dest)
    }
  }

// 2. Sync cross-platform folders (hooks, lib, stores) to ALL stacks
if (fs.existsSync(webCoreDir)) {
  for (const folder of CROSS_PLATFORM_FOLDERS) {
    const src  = path.join(webCoreDir, folder)
    const dest = path.join(stackCoreDir, folder)
    if (!fs.existsSync(src)) continue
    // Mobile stacks get stores/ from native-core (step 3), not web-core
    if (isMobile && folder === 'stores') continue
    syncDirectoryIfChanged(src, dest, new Set())
  }
}

  // 3. Sync platform-specific shared files
  if (isMobile && fs.existsSync(nativeCoreDir)) {
    // Native stacks: sync native-core/ contents (components, layouts)
    for (const entry of fs.readdirSync(nativeCoreDir, { withFileTypes: true })) {
      const src  = path.join(nativeCoreDir, entry.name)
      const dest = path.join(stackCoreDir, entry.name)
      if (entry.isDirectory()) {
        syncDirectoryIfChanged(src, dest, new Set())
      } else if (entry.isFile()) {
        copyFileIfChanged(src, dest)
      }
    }
    console.log(`[${label}] ✓ Synced shared core (${[...ENGINE_FILES, ...CROSS_PLATFORM_FOLDERS, 'native-core/*'].join(', ')})`)
  } else if (!isMobile && fs.existsSync(webCoreDir)) {
    // Web stacks: sync web-only folders (components, layouts)
    for (const folder of WEB_ONLY_FOLDERS) {
      const src  = path.join(webCoreDir, folder)
      const dest = path.join(stackCoreDir, folder)
      if (!fs.existsSync(src)) continue
      syncDirectoryIfChanged(src, dest, folder === 'adapters' ? ADAPTER_PROTECTED : new Set())
    }

    for (const file of WEB_FILES) {
      const src  = path.join(webCoreDir, file)
      const dest = path.join(stackCoreDir, file)
      if (!fs.existsSync(src)) continue
      copyFileIfChanged(src, dest)
    }

    // Special: pwa-builder.ts syncs as pwa-builder.shared.ts
    const pwaSrc  = path.join(webCoreDir, 'pwa-builder.ts')
    const pwaDest = path.join(stackCoreDir,  'pwa-builder.shared.ts')
    if (fs.existsSync(pwaSrc)) copyFileIfChanged(pwaSrc, pwaDest)

    console.log(`[${label}] ✓ Synced shared core (${[...ENGINE_FILES, ...CROSS_PLATFORM_FOLDERS, ...WEB_ONLY_FOLDERS, ...WEB_FILES, 'pwa-builder.shared.ts'].join(', ')})`)
  }
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