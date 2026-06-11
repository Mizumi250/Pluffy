// ============================================================
// ARKZEN ENGINE — EXPO ROUTER v3.4
//
// v3.4 – @arkzen:native:animation support.
//        generateNativeAnimationFile(): strips imports via resolveImports,
//        writes src/arkzen/generated/{name}.native-animations.ts.
//        Supports both Reanimated (imperative hooks/worklets) and Moti
//        (declarative presets) — no forced export convention unlike web.
//        registerExpoScreens() now generates the animation file when
//        tatemono.nativeAnimationRN is present.
//        unregisterExpoScreens() cleans up the generated file.
//
// v3.3 – native:error handler support.
//        generateNotFoundFile(): generates app/{tat}/+not-found.tsx
//        generateErrorBoundaryFile(): generates src/screens/{tat}/error-boundary.tsx
//        registerExpoScreens() now processes tatemono.nativeErrorHandlers.
//
// v3.1 – Fixed duplicate imports and missing ScrollView.
//        Engine now merges required components into existing
//        react-native import instead of adding a second one.
// v3.2 – Fixed index screen routing: Expo Router treats
//        app/{tat}/index.tsx as the /{tat} route, not /{tat}/index.
//        routePath, hub navigation, and routes.ts now all use
//        /{tat} for screenName === 'index' screens.
//        Also fixed layoutImport='' for default layout so
//        resolveImports doesn't append a comment onto import lines.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage, ArkzenErrorHandler } from '../types'
import { emitNativeStyles }                    from './lib/dsl-native-style-emitter'
import { copyAssetsToExpo, cleanExpoAssets }   from '../../../../shared/arkzen/native-core/assets'

const SRC_SCREENS_DIR    = path.resolve(process.cwd(), 'src', 'screens')
const NATIVE_LAYOUTS_DIR = path.join(process.cwd(), 'arkzen', 'core', 'layouts', 'custom')
const APP_DIR            = path.resolve(process.cwd(), 'app')
const GENERATED_DIR      = path.resolve(process.cwd(), 'src', 'arkzen', 'generated')
const ROUTES_FILE        = path.join(GENERATED_DIR, 'routes.ts')
const EXPO_ASSETS_DIR    = path.resolve(process.cwd(), 'assets')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

// ─── flattenMultilineImports — brace-counting (from Next.js router.ts) ────────

function flattenMultilineImports(code: string): string {
  const lines = code.split('\n')
  const out: string[] = []
  let inImport = false
  let buffer = ''
  let depth = 0

  const isCompleteImport = (s: string): boolean =>
    /^import\s+(?:(?:[\w*\s{},]+)\s+from\s+['"][^'"]+['"]|['"][^'"]+['"'])\s*;?\s*$/.test(s)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!inImport && /^\s*import\s/.test(line)) {
      inImport = true
      buffer = trimmed
      depth += (trimmed.match(/\{/g) || []).length
      depth -= (trimmed.match(/\}/g) || []).length
      const collapsed = buffer.replace(/\s+/g, ' ')
      if (depth === 0 && isCompleteImport(collapsed)) {
        out.push(collapsed)
        inImport = false
        buffer = ''
        depth = 0
      }
      continue
    }

    if (inImport) {
      buffer += ' ' + trimmed
      depth += (trimmed.match(/\{/g) || []).length
      depth -= (trimmed.match(/\}/g) || []).length
      const collapsed = buffer.replace(/\s+/g, ' ')
      if (depth === 0 && isCompleteImport(collapsed)) {
        out.push(collapsed)
        inImport = false
        buffer = ''
        depth = 0
      }
      continue
    }

    out.push(line)
  }

  if (inImport && buffer.trim()) out.push(buffer.replace(/\s+/g, ' '))
  return out.join('\n')
}

// ─── resolveImports — mirrors Next.js router.ts exactly ──────────────────────
// NO ENGINE_OWNED_MODULES guard. Every module is processed freely.
// React default import is always implicit; only named hooks are tracked.

interface ResolvedImports {
  canonicalBlock:  string
  strippedSources: string[]
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

  // Seed react entry with any engine-required hooks
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

      // mixed: import Default, { a, b } from 'mod'
      m = line.match(mixedImportRe)
      if (m) {
        const [, def, namedStr, mod] = m
        const entry = getEntry(mod)
        // React default is implicit — skip it, only collect hooks
        if (mod !== 'react') entry.defaultImport = def
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      // namespace: import * as Ns from 'mod'
      m = line.match(namespaceImportRe)
      if (m) {
        const [, ns, mod] = m
        getEntry(mod).defaultImport = `* as ${ns}`
        continue
      }

      // named: import { a, b } from 'mod'
      m = line.match(namedImportRe)
      if (m) {
        const [, namedStr, mod] = m
        const entry = getEntry(mod)
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      // default: import Default from 'mod'
      m = line.match(defaultImportRe)
      if (m) {
        const [, def, mod] = m
        if (mod === 'react') continue // React default is implicit
        getEntry(mod).defaultImport = def
        continue
      }

      // side-effect: import 'mod'
      m = line.match(sideEffectRe)
      if (m) {
        sideEffects.push(`import '${m[1]}'`)
        continue
      }
    }
  }

  // ── Build canonical import block ──────────────────────────────────────────
  const lines: string[] = []

  // 1. React always first
  const reactNamed = [...(importMap.get('react')?.named ?? [])]
    .filter(n => n !== 'React')
    .sort()
  lines.push(
    reactNamed.length > 0
      ? `import React, { ${reactNamed.join(', ')} } from 'react'`
      : `import React from 'react'`
  )

  // 2. All other modules — alphabetical
  const otherModules = [...importMap.keys()]
    .filter(m => m !== 'react')
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

  // 3. Side-effects
  sideEffects.forEach(s => lines.push(s))

  // 4. Verbatim extra (layout import etc.)
  if (engineRequired.extra) lines.push(engineRequired.extra)

  const canonicalBlock = lines.filter(Boolean).join('\n')

  // ── Strip all imports from raw sources ────────────────────────────────────
  const stripRaw = (src: string) =>
    src
      .replace(/^\s*import\s[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .trim()

  const strippedSources = sources.map(stripRaw)

  return { canonicalBlock, strippedSources }
}

// ─── Component extractor ──────────────────────────────────────────────────────

interface ExtractedComponent {
  name: string
  definition: string
}

function extractComponentFromBlock(raw: string): ExtractedComponent | null {
  const constMatch = raw.match(/^(const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:\(\))?\s*=>\s*\{[\s\S]*\})/m)
  if (constMatch) return { name: constMatch[2], definition: constMatch[1] }
  const funcMatch = raw.match(/^(function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(\s*\)\s*\{[\s\S]*\})/m)
  if (funcMatch) return { name: funcMatch[2], definition: funcMatch[1] }
  return null
}

// ─── Import merger helpers ────────────────────────────────────────────────────

function ensureReactNativeImport(canonicalBlock: string, requiredComponents: string[]): string {
  const importRe = /^import\s+\{([^}]*)\}\s+from\s+['"]react-native['"]\s*;?\n?/m
  const match = canonicalBlock.match(importRe)
  if (!match) {
    // No react-native import → add a new one
    return canonicalBlock + `\nimport { ${requiredComponents.join(', ')} } from 'react-native'`
  }
  // Merge missing components — always preserve trailing newline
  const existing = match[1].split(',').map(s => s.trim()).filter(Boolean)
  const merged = Array.from(new Set([...existing, ...requiredComponents]))
  const newLine = `import { ${merged.join(', ')} } from 'react-native'\n`
  return canonicalBlock.replace(importRe, newLine)
}

function ensureExpoRouterImport(canonicalBlock: string): string {
  if (/from ['"]expo-router['"]/.test(canonicalBlock)) return canonicalBlock
  const sep = canonicalBlock.endsWith('\n') ? '' : '\n'
  return canonicalBlock + `${sep}\nimport { useRouter } from 'expo-router'`
}

function ensureStatusBarImport(canonicalBlock: string): string {
  if (/from ['"]expo-status-bar['"]/.test(canonicalBlock)) return canonicalBlock
  const sep = canonicalBlock.endsWith('\n') ? '' : '\n'
  return canonicalBlock + `${sep}\nimport { StatusBar } from 'expo-status-bar'`
}

// The wrapper always calls setActiveTatemono() — guarantee it is imported
// regardless of whether the user tatemono code imports arkzenFetch or not.
// Auth-false tatemonos use a plain apiFetch helper and never pull in authStore,
// so setActiveTatemono ends up undefined at runtime without this guard.
function ensureSetActiveTatemonoImport(canonicalBlock: string): string {
  const authStorePath = `'../../../arkzen/core/stores/authStore'`
  if (/setActiveTatemono/.test(canonicalBlock)) return canonicalBlock

  // authStore import already present — merge setActiveTatemono into it
  const existingImportRe = /import\s+\{([^}]*)\}\s+from\s+['"]\.\.\.\/\.\.\.\.\/\.\.\.\.\/arkzen\/core\/stores\/authStore['"]\s*;?/
  const match = canonicalBlock.match(existingImportRe)
  if (match) {
    const named = match[1].split(',').map(s => s.trim()).filter(Boolean)
    if (!named.includes('setActiveTatemono')) named.push('setActiveTatemono')
    return canonicalBlock.replace(existingImportRe, `import { ${named.join(', ')} } from ${authStorePath}`)
  }

  // No authStore import at all — add a fresh one
  const sep = canonicalBlock.endsWith('\n') ? '' : '\n'
  return canonicalBlock + `${sep}\nimport { setActiveTatemono } from ${authStorePath}`
}

// ─── Native import normaliser ─────────────────────────────────────────────────
// The shared authStore (and any other arkzen core files) live at
// <expo-root>/arkzen/core/... — outside src/.
// Metro resolves @/* → src/*, so @/arkzen/* would look inside src/arkzen/
// which does not exist. We rewrite @/arkzen/* → ../../../arkzen/* at generation
// time so screens are self-contained regardless of any babel alias config.
// Depth is fixed: src/screens/{tat}/{screen}.tsx → 3 levels up = expo root.

function normaliseNativeImports(block: string): string {
  return block.replace(/from\s+'@\/arkzen\//g, `from '../../../arkzen/`)
              .replace(/from\s+"@\/arkzen\//g, `from "../../../arkzen/`)
}

// ─── Extract named exports from a raw DSL block ───────────────────────────────
// Used to destructure animation hook/preset names into screen scope so the
// author can write  useSpin()  directly rather than  NativeAnims.useSpin().

function extractExportNames(raw: string): string[] {
  const names: string[] = []
  const namedRe = /^\s*export\s+(?:function|const|class|let|var)\s+([A-Za-z_$][\w$]*)/gm
  let m: RegExpExecArray | null
  while ((m = namedRe.exec(raw)) !== null) names.push(m[1])
  return names
}

// ─── Screen file generator ────────────────────────────────────────────────────

function generateScreenFile(tatemono: ParsedTatemono, page: ArkzenPage): string {
  const tatName  = tatemono.meta.name
  const layout   = page.layout ?? 'default'
  const isAuth   = layout === 'auth'
  const isGuest  = layout === 'guest'
  const isApp    = layout === 'app'

  const layoutImport = isAuth
    ? `import { AuthLayout }  from '@/layouts/AuthLayout'`
    : isGuest
    ? `import { GuestLayout } from '@/layouts/GuestLayout'`
    : isApp
    ? `import { ${toPascalCase(layout)}Layout } from '@/arkzen/core/layouts/custom/${tatName}-${layout}'`
    : ''

  const layoutOpen = isAuth
    ? `<AuthLayout tatSlug="${tatName}" loginRoute="/${tatName}/login">`
    : isGuest
    ? `<GuestLayout tatSlug="${tatName}" dashboardRoute="/${tatName}/dashboard">`
    : isApp
    ? `<${toPascalCase(layout)}Layout tatSlug="${tatName}">`
    : ''

  const layoutClose = isAuth ? `</AuthLayout>` : isGuest ? `</GuestLayout>` : isApp ? `</${toPascalCase(layout)}Layout>` : ''

  const hasNativeContent = page.raw && page.raw.trim().length > 0

  // ── Placeholder ────────────────────────────────────────────────────────────
  if (!hasNativeContent) {
    const wrapperName = `ArkzenScreen_${toPascalCase(tatName)}_${toPascalCase(page.name)}`
    return `// ============================================================
// ARKZEN GENERATED SCREEN — ${tatName}/${page.name} (placeholder)
// ============================================================

import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
${layoutImport}

export function ${wrapperName}() {
  setActiveTatemono('${tatName}')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      ${layoutOpen}
      <ScrollView className="flex-1">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-gray-400">Add JSX to @arkzen:native:page:${page.name}</Text>
        </View>
      </ScrollView>
      ${layoutClose}
    </SafeAreaView>
  )
}

export default ${wrapperName}
`
  }

  // ── Resolve imports across ALL shared component blocks + this page ─────────
  const allSources = [
    ...(tatemono.nativeComponents ?? []).map(c => c.raw.trim()),
    page.raw.trim(),
  ]

  const animImportLine = tatemono.nativeAnimationRN
    ? `import { ${extractExportNames(tatemono.nativeAnimationRN.raw).join(', ')} } from '../../arkzen/generated/${tatName}.native-animations'`
    : ''

  const styleImportLine = (tatemono.nativeStyles && tatemono.nativeStyles.length > 0)
    ? `import { s } from '../../arkzen/generated/${tatName}.native-styles'`
    : ''

  const extraLines = [layoutImport, animImportLine, styleImportLine].filter(Boolean).join('\n')

  let { canonicalBlock, strippedSources } = resolveImports(allSources, {
    extra: extraLines,
  })

  // ── Merge engine-required imports into canonicalBlock (no duplicates) ─────
  const engineRequiredRN = ['ScrollView']  // used by the wrapper
  canonicalBlock = ensureReactNativeImport(canonicalBlock, engineRequiredRN)
  canonicalBlock = ensureExpoRouterImport(canonicalBlock)
  canonicalBlock = ensureStatusBarImport(canonicalBlock)
  canonicalBlock = ensureSetActiveTatemonoImport(canonicalBlock)
  // SafeAreaView is never imported by user code – always add separately
  if (!/from ['"]react-native-safe-area-context['"]/.test(canonicalBlock)) {
    canonicalBlock += `\nimport { SafeAreaView } from 'react-native-safe-area-context'`
  }

  // ── Rewrite @/arkzen/* → ../../arkzen/* so Metro can resolve without aliases ─
  canonicalBlock = normaliseNativeImports(canonicalBlock)

  // strippedSources[0..n-1] = shared blocks, last = page block
  // Strip bare module-level setActiveTatemono() calls from shared code.
  // These fire at import time and stomp __ARKZEN_TATEMONO__ globally the
  // moment Expo Router eagerly loads all screen files on startup — even
  // screens not being viewed. The layout (AuthLayout/GuestLayout) already
  // calls setActiveTatemono(tatSlug) correctly at mount time via the
  // explicit tatSlug prop, so the module-level call is not needed.
  const sharedCode = strippedSources
    .slice(0, strippedSources.length - 1)
    .join('\n\n')
    .replace(/^setActiveTatemono\([^)]*\)\s*\n?/gm, '')
  let userCode = strippedSources[strippedSources.length - 1]
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()

  // Extract the page's component
  let componentName: string
  let componentDefinition: string

  const extracted = extractComponentFromBlock(userCode)
  if (extracted) {
    componentName = extracted.name
    componentDefinition = extracted.definition
  } else {
    componentName = toPascalCase(page.name) + 'Content'
    componentDefinition = `const ${componentName} = () => (\n  ${userCode}\n)`
  }

  const wrapperName = `ArkzenScreen_${toPascalCase(tatName)}_${toPascalCase(page.name)}`

  // ── Build final file ──────────────────────────────────────────────────────
  return `// ============================================================
// ARKZEN GENERATED SCREEN — ${tatName}/${page.name}
// ============================================================

${canonicalBlock}

// Shared components (from @arkzen:native:components:*)
${sharedCode}

// User screen (from @arkzen:native:page:${page.name})
${componentDefinition}

// Engine wrapper
export function ${wrapperName}() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('${tatName}')
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

// ─── Expo Router route file ────────────────────────────────────────────────────

function generateExpoRouteFile(tatName: string, screenName: string, hasErrorBoundary = false): string {
  if (hasErrorBoundary) {
    return `// ============================================================
// ARKZEN EXPO ROUTE — ${tatName}/${screenName}
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import React from 'react'
import Screen from '@/screens/${tatName}/${screenName}'
import { ErrorBoundary } from '@/screens/${tatName}/error-boundary'

const WrappedScreen = () => (
  <ErrorBoundary>
    <Screen />
  </ErrorBoundary>
)

export default WrappedScreen
`
  }

  return `// ============================================================
// ARKZEN EXPO ROUTE — ${tatName}/${screenName}
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

export { default } from '@/screens/${tatName}/${screenName}'
`
}

// ─── Route registry ───────────────────────────────────────────────────────────

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
  const matches = [...content.matchAll(/\/\/ ROUTE:([^:]+):([^:]+):([^:]+):([^:]+):(true|false)/g)]
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
// ARKZEN GENERATED — Expo Route Registry v3.1
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

export interface ArkzenExpoRoute {
  tatName:    string
  screenName: string
  routePath:  string
  layout:     string
  auth:       boolean
}

export const ARKZEN_EXPO_ROUTES: ArkzenExpoRoute[] = [
${routeLines}
]

export function getLoginRoute(tatName: string): string {
  const login = ARKZEN_EXPO_ROUTES.find(r => r.tatName === tatName && r.screenName === 'login')
  return login?.routePath ?? \`/\${tatName}/login\`
}

export function getDashboardRoute(tatName: string): string {
  const dashboard = ARKZEN_EXPO_ROUTES.find(
    r => r.tatName === tatName && (r.screenName === 'dashboard' || r.screenName === 'index') && r.auth
  )
  return dashboard?.routePath ?? \`/\${tatName}/dashboard\`
}
`
  fs.writeFileSync(ROUTES_FILE, content, 'utf-8')
}

// ─── Write-if-changed — prevents Metro from seeing spurious events ────────────

function writeIfChanged(filePath: string, content: string): void {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8')
    if (existing === content) return
  }
  fs.writeFileSync(filePath, content, 'utf-8')
}


// ─── Not-found file generator (+not-found.tsx) ────────────────────────────────

function generateNotFoundFile(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const tatName = tatemono.meta.name

  // Inline shared components so +not-found.tsx is self-contained — no separate shared file exists
  const sharedSources = [
    ...(tatemono.nativeComponents ?? []).map(c => c.raw.trim()),
    handler.raw.trim(),
  ]

  let { canonicalBlock, strippedSources } = resolveImports(sharedSources)
  canonicalBlock = ensureReactNativeImport(canonicalBlock, ['View', 'Text', 'TouchableOpacity'])
  canonicalBlock = ensureExpoRouterImport(canonicalBlock)
  canonicalBlock = normaliseNativeImports(canonicalBlock)

  const sharedCode  = strippedSources.slice(0, strippedSources.length - 1).join('\n\n')
  const handlerCode = strippedSources[strippedSources.length - 1]
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()

  return `// ============================================================
// ARKZEN EXPO ROUTE — ${tatName}/+not-found
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

${canonicalBlock}

${sharedCode}

${handlerCode}

export default NativeNotFoundScreen
`
}

// ─── Error boundary file generator (error-boundary.tsx) ──────────────────────

function generateErrorBoundaryFile(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const tatName = tatemono.meta.name

  // Inline shared components so error-boundary.tsx is self-contained
  const sharedSources = [
    ...(tatemono.nativeComponents ?? []).map(c => c.raw.trim()),
    handler.raw.trim(),
  ]

  let { canonicalBlock, strippedSources } = resolveImports(sharedSources)
  canonicalBlock = ensureReactNativeImport(canonicalBlock, ['View', 'Text', 'TouchableOpacity'])
  canonicalBlock = ensureExpoRouterImport(canonicalBlock)
  canonicalBlock = normaliseNativeImports(canonicalBlock)

  const sharedCode  = strippedSources.slice(0, strippedSources.length - 1).join('\n\n')
  const handlerCode = strippedSources[strippedSources.length - 1]
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()

  return `// ============================================================
// ARKZEN EXPO SCREEN — ${tatName}/error-boundary
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

${canonicalBlock}

${sharedCode}

${handlerCode}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  reset = () => this.setState({ hasError: false })

  render() {
    if (this.state.hasError) {
      return <NativeServerErrorScreen reset={this.reset} />
    }
    return this.props.children
  }
}

export default ErrorBoundary
`
}

// ─── Native animation file generator (RN / Expo) ─────────────────────────────
// Reads @arkzen:native:animation:rn — Reanimated hooks / Moti presets.
// Lynx reads @arkzen:native:animation:lynx in its own builder (not here).
//
// Output: src/arkzen/generated/{name}.native-animations.ts
// Import: import { ... } from '@/arkzen/generated/{name}.native-animations'
//         (or the normalised ../../arkzen/generated/... path in screen files)

function generateNativeAnimationFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.nativeAnimationRN) return null

  const { strippedSources } = resolveImports([tatemono.nativeAnimationRN.raw])
  const clean = strippedSources[0]
    // strip trailing */ bleed from the DSL block comment
    .replace(/\*\/\s*$/, '')
    .trim()

  if (!clean) return null

  // Rebuild canonical imports from the animation block alone so the file is
  // self-contained — no engine-injected packages, author owns all imports.
  const { canonicalBlock } = resolveImports([tatemono.nativeAnimationRN.raw])

  return `// ============================================================
// ARKZEN GENERATED NATIVE ANIMATIONS — ${tatemono.meta.name}
// Source: @arkzen:native:animation:rn
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
//
// Supported patterns:
//   Reanimated — useSharedValue, useAnimatedStyle, withTiming, withSpring,
//                withSequence, runOnUI, worklets, etc.
//   Moti       — transition presets, useDynamicAnimation, etc.
//   Both can coexist freely in this file.
// ============================================================

${canonicalBlock}

${clean}
`
}

// ─── Custom layout generator (mirrors web stacks) ───────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  if (!tatemono.nativeLayouts || tatemono.nativeLayouts.length === 0) return
  ensureDir(NATIVE_LAYOUTS_DIR)

  for (const layout of tatemono.nativeLayouts) {
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(NATIVE_LAYOUTS_DIR, fileName)

    const { canonicalBlock, strippedSources } = resolveImports([normaliseNativeImports(layout.raw ?? '')])
    const content = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name} [Expo]\n\n${canonicalBlock}\n\n${strippedSources[0]}\n`
    writeIfChanged(filePath, content)
    console.log(`[Arkzen Expo Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─── Register / Unregister ────────────────────────────────────────────────────

export function registerExpoScreens(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name

  const screenDir = path.join(SRC_SCREENS_DIR, tatName)
  const appDir    = path.join(APP_DIR, tatName)
  ensureDir(screenDir)
  ensureDir(appDir)

  // v3.5: emit native styles from @arkzen:native:style:* blocks
  emitNativeStyles(tatName, tatemono.nativeStyles ?? [], GENERATED_DIR, 'Arkzen Expo Router')

  // Distribute tatemono assets → assets/tatemonos/{tatName}/
  const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
  const assetsPath   = path.join(tatemonosDir, tatName, 'assets')
  const hasAssets    = copyAssetsToExpo(tatName, assetsPath, EXPO_ASSETS_DIR)
  if (!hasAssets) {
    console.log(`[Arkzen Expo Router] No assets folder for ${tatName}`)
  }

  // v3.4: generate native animation file if present (:rn block — Expo / bare RN)
  if (tatemono.nativeAnimationRN) {
    ensureDir(GENERATED_DIR)
    const animContent = generateNativeAnimationFile(tatemono)
    if (animContent) {
      const animPath = path.join(GENERATED_DIR, `${tatName}.native-animations.ts`)
      writeIfChanged(animPath, animContent)
      console.log(`[Arkzen Expo Router] ✓ Native animation file generated: ${tatName}.native-animations.ts`)
    }
  }

  // v3.5: generate custom native layouts from @arkzen:native:layout:* blocks
  generateCustomLayouts(tatemono)

  const existingRoutes = readExistingRoutes().filter(r => r.tatName !== tatName)
  const newRoutes: ExpoRoute[] = []

  for (const page of tatemono.nativePages) {
    const screenName = page.name
    // Expo Router convention: app/{tat}/index.tsx serves /{tat}, not /{tat}/index
    const routePath  = screenName === 'index' ? `/${tatName}` : `/${tatName}/${screenName}`
    const layout     = page.layout ?? 'default'

    writeIfChanged(path.join(screenDir, `${screenName}.tsx`), generateScreenFile(tatemono, page))
    writeIfChanged(path.join(appDir,    `${screenName}.tsx`), generateExpoRouteFile(tatName, screenName, (tatemono.nativeErrorHandlers ?? []).some(h => h.type === '500')))

    newRoutes.push({ tatName, screenName, routePath, layout, auth: tatemono.meta.auth && layout === 'auth' })
    console.log(`[Arkzen Expo Router] ✓ ${routePath} [${layout}]`)
  }

  // v3.3: generate +not-found.tsx and error-boundary.tsx from nativeErrorHandlers
  for (const handler of tatemono.nativeErrorHandlers ?? []) {
    if (handler.type === '404') {
      const notFoundPath = path.join(appDir, '+not-found.tsx')
      writeIfChanged(notFoundPath, generateNotFoundFile(tatemono, handler))
      console.log(`[Arkzen Expo Router] ✓ +not-found.tsx generated for ${tatName}`)
    }
    if (handler.type === '500') {
      const errorBoundaryPath = path.join(screenDir, 'error-boundary.tsx')
      writeIfChanged(errorBoundaryPath, generateErrorBoundaryFile(tatemono, handler))
      console.log(`[Arkzen Expo Router] ✓ error-boundary.tsx generated for ${tatName}`)
    }
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

  // Clean distributed assets
  cleanExpoAssets(tatName, EXPO_ASSETS_DIR)

  // v3.4: clean up generated native animation file
  const animPath = path.join(GENERATED_DIR, `${tatName}.native-animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.unlinkSync(animPath)
    console.log(`[Arkzen Expo Router] ✓ Removed native animation file: ${tatName}.native-animations.ts`)
  }

  writeRouteRegistry(readExistingRoutes().filter(r => r.tatName !== tatName))
  console.log(`[Arkzen Expo Router] ✓ Route registry updated`)
}