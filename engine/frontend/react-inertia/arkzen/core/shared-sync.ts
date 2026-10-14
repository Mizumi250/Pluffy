// ============================================================
// ARKZEN ENGINE — SHARED CORE SYNC v3.1
//
// Copies cross-platform and platform-specific shared files into
// each stack's arkzen/core/ so every stack gets identical shared
// logic.
//
// Source layout (engine/shared/arkzen/):
//   engine-core/   — cross-platform: parser, backend-bridge, validator, shared-sync
//   web-core/      — web components/layouts + cross-platform hooks/lib/stores + assets/sitemap
//   native-core/   — Expo-flavored native components/layouts (NativeWind, expo-router,
//                    @expo/vector-icons, react-native-reanimated). NOT a generic "native"
//                    layer — it's specifically Expo's dependency surface.
//
// Destination (always): <stack>/arkzen/core/
//   ALL stacks get: engine-core files + hooks/ + lib/ + stores/ (cross-platform)
//   Web stacks  add: web-core components/ + layouts/ + assets.ts + sitemap.ts
//   'expo' adds:     native-core components/ + layouts/ (verbatim — deps match 1:1)
//   'react-native' / 'lynx': own components/ + layouts/ — NOT synced from native-core.
//     Each mobile framework's component primitives + router are different enough
//     (RN CLI uses @react-navigation/native + lucide-react-native, no expo-router;
//     Lynx uses @lynx-js/react, no react-native at all) that a shared implementation
//     isn't viable. Same treatment web stacks give adapters/router.ts.
//
// v3.0: Renamed core/ → web-core/. Split engine files into engine-core/.
//       Added platform detection (mobile vs web) for native-core sync.
// v3.1: native-core components/layouts now only sync to stacks listed in
//       NATIVE_CORE_COMPATIBLE_STACKS (currently just 'expo'). Previously every
//       MOBILE_STACKS entry got an identical copy, but native-core imports
//       expo-router/@expo/vector-icons directly — react-native and lynx don't
//       have those packages, so the synced files didn't compile for either.
//
// NEVER synced (each stack owns these):
//   adapters/router.ts          — framework-specific (next/navigation vs react-router-dom)
//   adapters/Link.tsx           — framework-specific (next/link vs react-router Link)
//   pwa-builder.ts               — stack-specific thin wrapper
//   generated/                   — runtime output
//   vite-*/builder/router/watcher — stack engine files
//   components/ + layouts/ for react-native & lynx — see NATIVE_CORE_COMPATIBLE_STACKS above
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

// Of the mobile stacks, only these actually share native-core's dependency surface
// (react-native primitives + expo-router + @expo/vector-icons + react-native-reanimated).
// Stacks NOT in this set (react-native CLI, lynx) own components/ + layouts/ themselves —
// the sync skips those two folders for them entirely, same as adapters/ for web.
const NATIVE_CORE_COMPATIBLE_STACKS = new Set(['expo'])

// Folders inside native-core that are Expo-specific and must not be force-fed to
// mobile stacks outside NATIVE_CORE_COMPATIBLE_STACKS
const NATIVE_CORE_EXPO_ONLY_FOLDERS = new Set(['components', 'layouts'])

// Mobile stacks with an actual React Native runtime underneath (AsyncStorage,
// require()-based asset imports, react-native StyleSheet.create). Expo and bare
// RN both qualify — Lynx does not (no react-native at all: lynx.localStorage,
// ES-import assets via Rspeedy/Rsbuild, fully inline styles via @lynx-js/react).
const NATIVE_CORE_RN_RUNTIME_STACKS = new Set(['expo', 'react-native'])

// Entries inside native-core that assume a real RN runtime and must not be
// force-fed to mobile stacks outside NATIVE_CORE_RN_RUNTIME_STACKS (i.e. lynx).
// assets.ts   — require()-based, Lynx uses ES imports instead
// stores/     — authStore.ts uses @react-native-async-storage, Lynx has no RN at all
// lib/        — dsl-native-style-emitter.ts emits StyleSheet.create(), meaningless
//               to Lynx which has its own dsl-lynx-style-emitter.ts (inline styles)
const NATIVE_CORE_RN_RUNTIME_ONLY = new Set(['assets.ts', 'stores', 'lib'])

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
    // Only stacks whose deps actually match native-core (currently just 'expo')
    // get components/ and layouts/ verbatim. react-native and lynx skip those two
    // folders and keep whatever they already have under arkzen/core/components|layouts —
    // hand-written, never touched by this sync, exactly like adapters/ for web stacks.
    const inheritsExpoUI = NATIVE_CORE_COMPATIBLE_STACKS.has(stackName)

    // Only stacks with a real RN runtime (expo, react-native) get assets.ts,
    // stores/, and lib/ verbatim. Lynx skips all three and keeps its own
    // hand-written versions under arkzen/core/ — never touched by this sync.
    const hasRNRuntime = NATIVE_CORE_RN_RUNTIME_STACKS.has(stackName)

    for (const entry of fs.readdirSync(nativeCoreDir, { withFileTypes: true })) {
      if (!inheritsExpoUI && NATIVE_CORE_EXPO_ONLY_FOLDERS.has(entry.name)) continue
      if (!hasRNRuntime && NATIVE_CORE_RN_RUNTIME_ONLY.has(entry.name)) continue

      const src  = path.join(nativeCoreDir, entry.name)
      const dest = path.join(stackCoreDir, entry.name)
      if (entry.isDirectory()) {
        syncDirectoryIfChanged(src, dest, new Set())
      } else if (entry.isFile()) {
        copyFileIfChanged(src, dest)
      }
    }

    const excluded: string[] = []
    if (!inheritsExpoUI) excluded.push('components/', 'layouts/')
    if (!hasRNRuntime)   excluded.push('assets.ts', 'stores/', 'lib/')
    const syncedLabel = excluded.length === 0
      ? 'native-core/*'
      : `native-core/* (excl. ${excluded.join(', ')} — stack-owned)`
    console.log(`[${label}] ✓ Synced shared core (${[...ENGINE_FILES, ...CROSS_PLATFORM_FOLDERS, syncedLabel].join(', ')})`)
  } else if (!isMobile && fs.existsSync(webCoreDir)) {
    // Web stacks: sync web-only folders (components, layouts)
    for (const folder of WEB_ONLY_FOLDERS) {
      const src  = path.join(webCoreDir, folder)
      const dest = path.join(stackCoreDir, folder)
      if (!fs.existsSync(src)) continue
      syncDirectoryIfChanged(src, dest, new Set())
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