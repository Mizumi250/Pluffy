// ============================================================
// ARKZEN ENGINE — EXPO ROUTER v3.1
//
// v3.1 – Fixed duplicate imports and missing ScrollView.
//        Engine now merges required components into existing
//        react-native import instead of adding a second one.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage } from '../types'

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
  const importRe = /^import\s+\{([^}]*)\}\s+from\s+['"]react-native['"]\s*;?/m
  const match = canonicalBlock.match(importRe)
  if (!match) {
    // No react-native import → add a new one
    return canonicalBlock + `\nimport { ${requiredComponents.join(', ')} } from 'react-native'`
  }
  // Merge missing components
  const existing = match[1].split(',').map(s => s.trim()).filter(Boolean)
  const merged = Array.from(new Set([...existing, ...requiredComponents]))
  const newLine = `import { ${merged.join(', ')} } from 'react-native'`
  return canonicalBlock.replace(importRe, newLine)
}

function ensureExpoRouterImport(canonicalBlock: string): string {
  if (/from ['"]expo-router['"]/.test(canonicalBlock)) return canonicalBlock
  return canonicalBlock + `\nimport { useRouter } from 'expo-router'`
}

function ensureStatusBarImport(canonicalBlock: string): string {
  if (/from ['"]expo-status-bar['"]/.test(canonicalBlock)) return canonicalBlock
  return canonicalBlock + `\nimport { StatusBar } from 'expo-status-bar'`
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
    ? `import { AppLayout }   from '@/layouts/AppLayout'`
    : `// No layout wrapper`

  const layoutOpen = isAuth
    ? `<AuthLayout tatSlug="${tatName}" loginRoute="/${tatName}/login">`
    : isGuest
    ? `<GuestLayout tatSlug="${tatName}" dashboardRoute="/${tatName}/dashboard">`
    : isApp
    ? `<AppLayout tatSlug="${tatName}">`
    : ''

  const layoutClose = isAuth ? `</AuthLayout>` : isGuest ? `</GuestLayout>` : isApp ? `</AppLayout>` : ''

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

  let { canonicalBlock, strippedSources } = resolveImports(allSources, {
    extra: layoutImport,
  })

  // ── Merge engine-required imports into canonicalBlock (no duplicates) ─────
  const engineRequiredRN = ['ScrollView']  // used by the wrapper
  canonicalBlock = ensureReactNativeImport(canonicalBlock, engineRequiredRN)
  canonicalBlock = ensureExpoRouterImport(canonicalBlock)
  canonicalBlock = ensureStatusBarImport(canonicalBlock)
  // SafeAreaView is never imported by user code – always add separately
  if (!/from ['"]react-native-safe-area-context['"]/.test(canonicalBlock)) {
    canonicalBlock += `\nimport { SafeAreaView } from 'react-native-safe-area-context'`
  }

  // strippedSources[0..n-1] = shared blocks, last = page block
  const sharedCode = strippedSources.slice(0, strippedSources.length - 1).join('\n\n')
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

function generateExpoRouteFile(tatName: string, screenName: string): string {
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

// ─── Register / Unregister ────────────────────────────────────────────────────

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

    writeIfChanged(path.join(screenDir, `${screenName}.tsx`), generateScreenFile(tatemono, page))
    writeIfChanged(path.join(appDir,    `${screenName}.tsx`), generateExpoRouteFile(tatName, screenName))

    newRoutes.push({ tatName, screenName, routePath, layout, auth: tatemono.meta.auth && layout === 'auth' })
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

  writeRouteRegistry(readExistingRoutes().filter(r => r.tatName !== tatName))
  console.log(`[Arkzen Expo Router] ✓ Route registry updated`)
}