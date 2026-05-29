// ============================================================
// ARKZEN ENGINE — EXPO ROUTER v2.2
//
// v2.2 – Component extraction: now works like Next.js.
//         If the user writes a full component (const X = () => {...})
//         inside @arkzen:native:page, the engine extracts it and
//         renders <X /> inside the ScrollView. No more raw paste.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage } from '../types'

// Resolved relative to CWD (engine/frontend/expo/)
const SRC_SCREENS_DIR  = path.resolve(process.cwd(), 'src', 'screens')
const APP_DIR          = path.resolve(process.cwd(), 'app')
const GENERATED_DIR    = path.resolve(process.cwd(), 'src', 'arkzen', 'generated')
const ROUTES_FILE      = path.join(GENERATED_DIR, 'routes.ts')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

// ─── Unified Import Resolver (unchanged) ──────────────────────────────────────

interface ResolvedImports {
  canonicalBlock:  string
  strippedSources: string[]
}

const ENGINE_OWNED_MODULES = new Set([
  'react',
  'react-native',
  'expo-router',
  'expo-status-bar',
])

function flattenMultilineImports(src: string): string {
  return src.replace(/import\s[^;'"]*?\n[^;'"]*?from\s+['"][^'"]+['"]/g, m =>
    m.replace(/\n\s*/g, ' ')
  )
}

function resolveImports(
  sources: string[],
  engineRequired: {
    reactHooks?: string[]
    extra?: string
  } = {}
): ResolvedImports {
  const importMap = new Map<string, { defaultImport?: string; named: Set<string> }>()
  const getEntry = (mod: string) => {
    if (!importMap.has(mod)) importMap.set(mod, { named: new Set() })
    return importMap.get(mod)!
  }

  const reactEntry = getEntry('react')
  ;(engineRequired.reactHooks ?? []).forEach(h => reactEntry.named.add(h))

  const defaultImportRe   = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/
  const namedImportRe     = /^import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  const mixedImportRe     = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*,\s*\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  const namespaceImportRe = /^import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/
  const sideEffectRe      = /^import\s+['"]([^'"]+)['"]\s*;?/

  const sideEffects: string[] = []

  for (const source of sources) {
    const flattened = flattenMultilineImports(source)
    for (const rawLine of flattened.split('\n')) {
      const line = rawLine.trim()
      if (!line.startsWith('import ')) continue

      let m: RegExpMatchArray | null

      m = line.match(mixedImportRe)
      if (m) {
        const [, def, namedStr, mod] = m
        if (!ENGINE_OWNED_MODULES.has(mod)) {
          const entry = getEntry(mod)
          entry.defaultImport = def
          namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => entry.named.add(n))
        }
        continue
      }

      m = line.match(namespaceImportRe)
      if (m) {
        const [, ns, mod] = m
        if (!ENGINE_OWNED_MODULES.has(mod)) getEntry(mod).defaultImport = `* as ${ns}`
        continue
      }

      m = line.match(namedImportRe)
      if (m) {
        const [, namedStr, mod] = m
        if (ENGINE_OWNED_MODULES.has(mod)) {
          if (mod === 'react') {
            namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
              if (n !== 'React') reactEntry.named.add(n)
            })
          }
          continue
        }
        const entry = getEntry(mod)
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => entry.named.add(n))
        continue
      }

      m = line.match(defaultImportRe)
      if (m) {
        const [, def, mod] = m
        if (!ENGINE_OWNED_MODULES.has(mod)) getEntry(mod).defaultImport = def
        continue
      }

      m = line.match(sideEffectRe)
      if (m) {
        if (!ENGINE_OWNED_MODULES.has(m[1])) sideEffects.push(`import '${m[1]}'`)
        continue
      }
    }
  }

  const lines: string[] = []
  const reactNamed = [...(importMap.get('react')?.named ?? [])].filter(n => n !== 'React').sort()
  lines.push(
    reactNamed.length > 0
      ? `import React, { ${reactNamed.join(', ')} } from 'react'`
      : `import React from 'react'`
  )

  const otherModules = [...importMap.keys()]
    .filter(m => m !== 'react' && !ENGINE_OWNED_MODULES.has(m))
    .sort()

  for (const mod of otherModules) {
    const { defaultImport, named } = importMap.get(mod)!
    const namedArr = [...named].sort()
    if (defaultImport?.startsWith('* as ')) {
      lines.push(`import ${defaultImport} from '${mod}'`)
    } else if (defaultImport && namedArr.length > 0) {
      lines.push(`import ${defaultImport}, { ${namedArr.join(', ')} } from '${mod}'`)
    } else if (defaultImport) {
      lines.push(`import ${defaultImport} from '${mod}'`)
    } else if (namedArr.length > 0) {
      lines.push(`import { ${namedArr.join(', ')} } from '${mod}'`)
    }
  }

  sideEffects.forEach(s => lines.push(s))
  if (engineRequired.extra) lines.push(engineRequired.extra)

  const canonicalBlock = lines.filter(Boolean).join('\n')

  const stripRaw = (src: string) =>
    src
      .replace(/^\s*import\s[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .trim()

  const strippedSources = sources.map(stripRaw)

  return { canonicalBlock, strippedSources }
}

// ─── NEW: Component extractor (copied from Next.js router logic) ─────────────

interface ExtractedComponent {
  name: string
  definition: string
}

function extractComponentFromBlock(raw: string): ExtractedComponent | null {
  // Match const Name = () => { ... } or function Name() { ... }
  const constMatch = raw.match(/^(const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:\(\))?\s*=>\s*\{[\s\S]*\})/m)
  if (constMatch) {
    return { name: constMatch[2], definition: constMatch[1] }
  }
  const funcMatch = raw.match(/^(function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(\s*\)\s*\{[\s\S]*\})/m)
  if (funcMatch) {
    return { name: funcMatch[2], definition: funcMatch[1] }
  }
  return null
}

// ─── Screen component generator (FIXED) ───────────────────────────────────────

function generateScreenFile(tatemono: ParsedTatemono, page: ArkzenPage): string {
  const tatName    = tatemono.meta.name
  const layout     = page.layout ?? 'default'
  const isAuth     = layout === 'auth'
  const isGuest    = layout === 'guest'
  const isApp      = layout === 'app'

  const layoutImport = isAuth
    ? `import { AuthLayout }  from '@/layouts/AuthLayout'`
    : isGuest
    ? `import { GuestLayout } from '@/layouts/GuestLayout'`
    : isApp
    ? `import { AppLayout }   from '@/layouts/AppLayout'`
    : `// No layout wrapper`

  const layoutOpen = isAuth
    ? `<AuthLayout tatSlug="${tatName}" loginRoute="/${tatName}/login">`
    : isGuest
    ? `<GuestLayout tatSlug="${tatName}" dashboardRoute="/${tatName}/dashboard">`
    : isApp
    ? `<AppLayout tatSlug="${tatName}">`
    : ''

  const layoutClose = isAuth
    ? `</AuthLayout>`
    : isGuest
    ? `</GuestLayout>`
    : isApp
    ? `</AppLayout>`
    : ''

  const hasNativeContent = page.raw && page.raw.trim().length > 0

  // ── Placeholder when empty (same as Next.js minimal) ──
  if (!hasNativeContent) {
    const uniqueWrapper = `ArkzenScreen_${tatName}_${page.name}`
    const placeholderBody = `<View className="flex-1 items-center justify-center p-6">
      <Text className="text-gray-400">Add JSX to @arkzen:native:page:${page.name}</Text>
    </View>`

    return `// ============================================================
// ARKZEN GENERATED SCREEN — ${tatName}/${page.name} (placeholder)
// ============================================================

import React from 'react'
import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
${layoutImport}

export function ${uniqueWrapper}() {
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      ${layoutOpen}
      <ScrollView className="flex-1">
        ${placeholderBody}
      </ScrollView>
      ${layoutClose}
    </SafeAreaView>
  )
}

export default ${uniqueWrapper}
`
  }

  // ── User wrote content – resolve imports and extract component ──
  const { canonicalBlock, strippedSources } = resolveImports([page.raw.trim()], {
    reactHooks: [],
    extra: layoutImport
  })

  let userCode = strippedSources[0]
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()

  // Extract component name (like Next.js extractComponentName)
  let componentName: string
  let componentDefinition: string

  const extracted = extractComponentFromBlock(userCode)
  if (extracted) {
    componentName = extracted.name
    componentDefinition = extracted.definition
  } else {
    // Raw JSX – wrap into a default component
    componentName = toPascalCase(page.name) + 'Content'
    componentDefinition = `const ${componentName} = () => (\n  ${userCode}\n)`
  }

  // UNIQUE wrapper name – never clashes with user's component (exactly like Next.js)
  const wrapperName = `ArkzenScreen_${toPascalCase(tatName)}_${toPascalCase(page.name)}`

  return `// ============================================================
// ARKZEN GENERATED SCREEN — ${tatName}/${page.name}
// ============================================================

${canonicalBlock}
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  FlatList, ActivityIndicator, SafeAreaView, Image,
  Pressable, RefreshControl, KeyboardAvoidingView, Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
${layoutImport}

// User's component (extracted from @arkzen:native:page)
${componentDefinition}

// Engine wrapper – unique name (no conflict)
export function ${wrapperName}() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      ${layoutOpen}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <${componentName} />
      </ScrollView>
      ${layoutClose}
    </SafeAreaView>
  )
}

export default ${wrapperName}
`
}

// ─── Expo Router file-based route entry (unchanged) ───────────────────────────

function generateExpoRouteFile(tatName: string, screenName: string): string {
  return `// ============================================================
// ARKZEN EXPO ROUTE — ${tatName}/${screenName}
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

export { default } from '@/screens/${tatName}/${screenName}'
`
}

// ─── Route registry (unchanged) ───────────────────────────────────────────────

interface ExpoRoute {
  tatName:    string
  screenName: string
  routePath:  string
  layout:     string
  auth:       boolean
}

function readExistingRoutes(): ExpoRoute[] {
  if (!fs.existsSync(ROUTES_FILE)) return []
  const content = fs.readFileSync(ROUTES_FILE, 'utf-8')
  const matches = [
    ...content.matchAll(
      /\/\/ ROUTE:([^:]+):([^:]+):([^:]+):([^:]+):(true|false)/g
    ),
  ]
  return matches.map(m => ({
    tatName:    m[1],
    screenName: m[2],
    routePath:  m[3],
    layout:     m[4],
    auth:       m[5] === 'true',
  }))
}

function writeRouteRegistry(routes: ExpoRoute[]): void {
  ensureDir(GENERATED_DIR)

  const routeLines = routes.map(r =>
    `// ROUTE:${r.tatName}:${r.screenName}:${r.routePath}:${r.layout}:${r.auth}\n` +
    `  { tatName: '${r.tatName}', screenName: '${r.screenName}', routePath: '${r.routePath}', layout: '${r.layout}', auth: ${r.auth} },`
  ).join('\n')

  const content = `// ============================================================
// ARKZEN GENERATED — Expo Route Registry v2.2
// Auto-updated when tatemonos are built / removed
// DO NOT EDIT — managed by Arkzen engine
//
// Only tatemonos with @arkzen:native:page blocks appear here.
// Web-only tatemonos are never registered.
//
// Consumed by:
//   src/layouts/AuthLayout.tsx   — login route per tatemono
//   src/layouts/GuestLayout.tsx  — dashboard route per tatemono
//   src/layouts/AppLayout.tsx    — app shell per tatemono
// ============================================================

export interface ArkzenExpoRoute {
  tatName:    string
  screenName: string
  /** Expo Router path e.g. '/barbershop-booking/index' */
  routePath:  string
  /** 'guest' | 'auth' | 'app' | 'default' */
  layout:     string
  auth:       boolean
}

export const ARKZEN_EXPO_ROUTES: ArkzenExpoRoute[] = [
${routeLines}
]

/** Find the login route for a given tatemono */
export function getLoginRoute(tatName: string): string {
  const login = ARKZEN_EXPO_ROUTES.find(
    r => r.tatName === tatName && r.screenName === 'login'
  )
  return login?.routePath ?? \`/\${tatName}/login\`
}

/** Find the dashboard / first auth-required route for a given tatemono */
export function getDashboardRoute(tatName: string): string {
  const dashboard = ARKZEN_EXPO_ROUTES.find(
    r => r.tatName === tatName && (r.screenName === 'dashboard' || r.screenName === 'index') && r.auth
  )
  return dashboard?.routePath ?? \`/\${tatName}/dashboard\`
}
`

  fs.writeFileSync(ROUTES_FILE, content, 'utf-8')
}

// ─── Main: register native screens only ───────────────────────────────────────

export function registerExpoScreens(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name

  const screenDir = path.join(SRC_SCREENS_DIR, tatName)
  const appDir    = path.join(APP_DIR, tatName)
  ensureDir(screenDir)
  ensureDir(appDir)

  const existingRoutes = readExistingRoutes().filter(r => r.tatName !== tatName)
  const newRoutes: ExpoRoute[] = []

  for (const page of tatemono.nativePages) {
    const screenName = page.name
    const routePath  = `/${tatName}/${screenName}`
    const layout     = page.layout ?? 'default'

    const screenContent = generateScreenFile(tatemono, page)
    fs.writeFileSync(path.join(screenDir, `${screenName}.tsx`), screenContent, 'utf-8')

    const routeContent = generateExpoRouteFile(tatName, screenName)
    fs.writeFileSync(path.join(appDir, `${screenName}.tsx`), routeContent, 'utf-8')

    newRoutes.push({
      tatName,
      screenName,
      routePath,
      layout,
      auth: tatemono.meta.auth && layout === 'auth',
    })

    console.log(`[Arkzen Expo Router] ✓ ${routePath} [${layout}]`)
  }

  writeRouteRegistry([...existingRoutes, ...newRoutes])
  console.log(`[Arkzen Expo Router] ✓ Route registry updated: ${newRoutes.length} screen(s)`)
}

export function unregisterExpoScreens(tatName: string): void {
  const screenDir = path.join(SRC_SCREENS_DIR, tatName)
  if (fs.existsSync(screenDir)) {
    fs.rmSync(screenDir, { recursive: true, force: true })
    console.log(`[Arkzen Expo Router] ✓ Removed screens: ${tatName}`)
  }

  const appDir = path.join(APP_DIR, tatName)
  if (fs.existsSync(appDir)) {
    fs.rmSync(appDir, { recursive: true, force: true })
    console.log(`[Arkzen Expo Router] ✓ Removed app routes: ${tatName}`)
  }

  const routes = readExistingRoutes().filter(r => r.tatName !== tatName)
  writeRouteRegistry(routes)
  console.log(`[Arkzen Expo Router] ✓ Route registry updated`)
}