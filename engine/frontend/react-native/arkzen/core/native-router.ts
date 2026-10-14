// ============================================================
// ARKZEN ENGINE — NATIVE ROUTER v2.0
// React Native (bare) equivalent of expo-router.ts
//
// v2.0 — FULL WIRE-UP. Reads @arkzen:native:* DSL blocks.
//   - nativePages      → src/screens/{tat}/{screen}.tsx
//   - nativeComponents → src/screens/{tat}/components/{Name}.tsx
//   - nativeStyles     → src/arkzen/generated/{tat}.native-styles.ts
//   - nativeAnimationRN → src/arkzen/generated/{tat}.native-animations.ts
//   - nativeLayouts    → src/layouts/custom/{tat}-{name}.tsx
//   - nativeErrorHandlers → src/screens/{tat}/error-boundary.tsx
//   - routes.ts        → React Navigation stack config (auto-imported by App.tsx)
//
// v1.0 — Foundation only: placeholder screens, web JSX reference in comments.
//
// KEY DIFFERENCES from expo-router.ts:
//   - No Expo Router file-based routing — no app/ directory
//   - No expo-router imports → @react-navigation/native-stack
//   - No expo-status-bar → react-native StatusBar
//   - No SafeAreaView from react-native-safe-area-context on screens
//     (GestureHandlerRootView + SafeAreaProvider live in App.tsx)
//   - No NativeWind className — uses StyleSheet.create()
//   - Auth store: ../../../arkzen/core/stores/authStore (same shared file)
//   - Routes emitted as React Navigation ArkzenRootStackParamList entries
//   - Screen wrapper uses navigation.navigate() not useRouter()
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import * as ts   from 'typescript'
import type {
  ParsedTatemono,
  ArkzenPage,
  ArkzenLayout,
  ArkzenErrorHandler,
} from '../types'
import { emitNativeStyles } from './lib/dsl-native-style-emitter'

const SRC_SCREENS_DIR  = path.resolve(process.cwd(), 'src', 'screens')
const CUSTOM_LAYOUTS_DIR = path.resolve(process.cwd(), 'src', 'layouts', 'custom')
const GENERATED_DIR    = path.resolve(process.cwd(), 'src', 'arkzen', 'generated')
const ROUTES_FILE      = path.join(GENERATED_DIR, 'routes.ts')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

function writeIfChanged(filePath: string, content: string): void {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8')
    if (existing === content) return
  }
  fs.writeFileSync(filePath, content, 'utf-8')
}

// ─── Import resolution ────────────────────────────────────────────────────────
//
// Strips duplicate/conflicting import declarations from user code
// and emits one canonical import block combining engine-required
// and user-declared imports.

function flattenMultilineImports(code: string): string {
  return code.replace(/import\s+((?:[\w$]+\s*,\s*)?\{[^}]*\})\s+from\s+(['"`][^'"`]+['"`])/gs, (_, specifiers, mod) => {
    const flat = specifiers.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim()
    return `import ${flat} from ${mod}`
  })
}

// All React hooks resolveImports will auto-add to the import block
const REACT_HOOKS = new Set([
  'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
  'useContext', 'useReducer', 'useLayoutEffect', 'useId',
  'useTransition', 'useDeferredValue', 'useImperativeHandle',
])

// RN core components we recognise and auto-import from react-native
const RN_CORE_COMPONENTS = new Set([
  'View', 'Text', 'ScrollView', 'TextInput', 'TouchableOpacity',
  'TouchableHighlight', 'Pressable', 'FlatList', 'SectionList',
  'Image', 'ImageBackground', 'ActivityIndicator', 'Switch',
  'Modal', 'KeyboardAvoidingView', 'Platform', 'Linking',
  'StyleSheet', 'Dimensions', 'Animated', 'PanResponder',
  'RefreshControl', 'StatusBar', 'Alert', 'Vibration',
  'Keyboard', 'AppState', 'BackHandler', 'PermissionsAndroid',
  'Share', 'Clipboard', 'SafeAreaView',
])

// Auth store exports — always injected into every screen file
const AUTH_STORE_EXPORTS = new Set([
  'useAuthStore', 'setActiveTatemono',
])

interface ResolveImportsOptions {
  extra?:            string          // pre-built import lines to merge
  reactHooks?:       string[]        // explicit list of hooks to include
  engineNamed?:      Record<string, string[]>
  engineNamespaces?: Record<string, string>  // alias → module
  arkzenImportPrefix?: string
}

function resolveImports(
  sources: string[],
  options: ResolveImportsOptions = {},
): { canonicalBlock: string; strippedSources: string[] } {
  const {
    extra = '',
    reactHooks = [],
    engineNamed = {},
    engineNamespaces = {},
    arkzenImportPrefix = '../../../arkzen/',
  } = options

  // importMap: module → Set<named export>
  const importMap = new Map<string, Set<string>>()
  const typeImportMap = new Map<string, Set<string>>()
  // namespaceMap: alias → module
  const namespaceMap = new Map<string, string>()
  // defaultMap: module → default import alias
  const defaultMap = new Map<string, string>()

  function normaliseMod(raw: string): string {
    return raw.replace(/^@\/arkzen\//, arkzenImportPrefix)
  }

  function addNamed(mod: string, names: string[]): void {
    const m = normaliseMod(mod)
    if (!importMap.has(m)) importMap.set(m, new Set())
    names.forEach(n => {
      const name = n.trim()
      importMap.get(m)!.add(name)
      typeImportMap.get(m)?.delete(name)
    })
  }

  function addTypeNamed(mod: string, names: string[]): void {
    const m = normaliseMod(mod)
    if (!typeImportMap.has(m)) typeImportMap.set(m, new Set())
    names.forEach(n => {
      const name = n.trim()
      if (!importMap.get(m)?.has(name)) typeImportMap.get(m)!.add(name)
    })
  }

  function addNamespace(alias: string, mod: string): void {
    namespaceMap.set(alias, normaliseMod(mod))
  }

  function addDefault(mod: string, alias: string): void {
    if (mod === 'react' && alias === 'React') return
    defaultMap.set(normaliseMod(mod), alias)
  }

  // Seed engine-required named imports
  for (const [mod, names] of Object.entries(engineNamed)) {
    addNamed(mod, names)
  }
  for (const [alias, mod] of Object.entries(engineNamespaces)) {
    addNamespace(alias, mod)
  }

  // Parse extra pre-built import lines
  if (extra) {
    const flat = flattenMultilineImports(extra)
    for (const line of flat.split('\n')) {
      const typeNamed = line.match(/^import\s+type\s+\{([^}]+)\}\s+from\s+['"`]([^'"`]+)['"`]/)
      if (typeNamed) { addTypeNamed(typeNamed[2], typeNamed[1].split(',').map(s => s.trim()).filter(Boolean)); continue }
      const mixed = line.match(/^import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+['"`]([^'"`]+)['"`]/)
      if (mixed) {
        addDefault(mixed[3], mixed[1])
        addNamed(mixed[3], mixed[2].split(',').map(s => s.trim()).filter(Boolean))
        continue
      }
      const named = line.match(/^import\s+\{([^}]+)\}\s+from\s+['"`]([^'"`]+)['"`]/)
      if (named) { addNamed(named[2], named[1].split(',').map(s => s.trim()).filter(Boolean)); continue }
      const ns = line.match(/^import\s+\*\s+as\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/)
      if (ns) { addNamespace(ns[1], ns[2]); continue }
      const def = line.match(/^import\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/)
      if (def) { addDefault(def[2], def[1]) }
    }
  }

  // Strip import lines from each source, collecting user-declared imports
  const strippedSources = sources.map(src => {
    const flat = flattenMultilineImports(src)
    return flat.split('\n').filter(line => {
      const typeNamed = line.match(/^import\s+type\s+\{([^}]+)\}\s+from\s+['"`]([^'"`]+)['"`]/)
      if (typeNamed) {
        addTypeNamed(typeNamed[2], typeNamed[1].split(',').map(s => s.trim()).filter(Boolean))
        return false
      }
      const mixed = line.match(/^import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+['"`]([^'"`]+)['"`]/)
      if (mixed) {
        addDefault(mixed[3], mixed[1])
        addNamed(mixed[3], mixed[2].split(',').map(s => s.trim()).filter(Boolean))
        return false
      }
      const named = line.match(/^import\s+\{([^}]+)\}\s+from\s+['"`]([^'"`]+)['"`]/)
      if (named) { addNamed(named[2], named[1].split(',').map(s => s.trim()).filter(Boolean)); return false }
      const ns = line.match(/^import\s+\*\s+as\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/)
      if (ns) { addNamespace(ns[1], ns[2]); return false }
      const def = line.match(/^import\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/)
      if (def) { addDefault(def[2], def[1]); return false }
      // Drop bare 'use client' / 'use server' directives
      if (/^'use (client|server)'/.test(line.trim())) return false
      return true
    }).join('\n')
  })

  // Always inject React
  addNamed('react', ['React'])

  // React hooks
  const allHooks = Array.from(new Set([...reactHooks]))
  if (allHooks.length > 0) addNamed('react', allHooks)

  // Emit canonical import block
  const lines: string[] = []

  // React first
  const reactNames = importMap.get('react')
  if (reactNames) {
    const sorted = Array.from(reactNames).filter(n => n !== 'React').sort()
    lines.push(`import React${sorted.length ? `, { ${sorted.join(', ')} }` : ''} from 'react'`)
    importMap.delete('react')
  }

  // Remaining named imports (sorted by module)
  for (const [mod, names] of Array.from(importMap.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    const sorted = Array.from(names).sort()
    lines.push(`import { ${sorted.join(', ')} } from '${mod}'`)
  }

  for (const [mod, names] of Array.from(typeImportMap.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    if (names.size > 0) {
      lines.push(`import type { ${Array.from(names).sort().join(', ')} } from '${mod}'`)
    }
  }

  // Namespace imports
  for (const [alias, mod] of Array.from(namespaceMap.entries()).sort()) {
    lines.push(`import * as ${alias} from '${mod}'`)
  }

  // Default imports
  for (const [mod, alias] of Array.from(defaultMap.entries()).sort()) {
    lines.push(`import ${alias} from '${mod}'`)
  }

  return { canonicalBlock: lines.join('\n'), strippedSources }
}

// ─── Source analysis helpers ───────────────────────────────────────────────────

function stripTemplateLiterals(src: string): string {
  return src.replace(/`[^`]*`/g, '""')
}

function findReferencedNames(strippedSource: string, names: Set<string>): string[] {
  return Array.from(names).filter(name => {
    const re = new RegExp(`\\b${name}\\b`)
    return re.test(strippedSource)
  })
}

function extractExportNames(raw: string): string[] {
  const matches = [...raw.matchAll(/export\s+(?:const|function|class|type|interface)\s+(\w+)/g)]
  return matches.map(m => m[1])
}

function extractNativeComponentNames(tatemono: ParsedTatemono): Set<string> {
  const constants = extractNativeSharedConstantNames(tatemono)
  const names = new Set<string>()
  for (const block of (tatemono.nativeComponents ?? [])) {
    const matches = [...block.raw.matchAll(/^(?:export\s+)?(?:const|function)\s+([A-Z][A-Za-z0-9_$]*)/gm)]
    matches.forEach(m => {
      if (!constants.has(m[1])) names.add(m[1])
    })
  }
  return names
}

function extractNativeSharedConstantNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const block of (tatemono.nativeComponents ?? [])) {
    const matches = [...block.raw.matchAll(/^(?:export\s+)?const\s+([A-Z_][A-Z0-9_$]*)\s*=/gm)]
    matches.forEach(m => names.add(m[1]))
  }
  return names
}

function extractNativeCustomHookNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const block of (tatemono.nativeComponents ?? [])) {
    const matches = [...block.raw.matchAll(/^(?:export\s+)?(?:const|function)\s+(use[A-Z][A-Za-z0-9_$]*)/gm)]
    matches.forEach(m => names.add(m[1]))
  }
  return names
}

function extractNativeSharedTypeNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const block of (tatemono.nativeComponents ?? [])) {
    const matches = [...block.raw.matchAll(/^(?:export\s+)?(?:type|interface)\s+([A-Z][A-Za-z0-9_$]*)/gm)]
    matches.forEach(m => names.add(m[1]))
  }
  return names
}

function extractNativeUtilityFunctionNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const block of (tatemono.nativeComponents ?? [])) {
    const matches = [...block.raw.matchAll(/^(?:export\s+)?(?:const|function)\s+([a-z][A-Za-z0-9_$]*)/gm)]
    matches.filter(m => !m[1].startsWith('use')).forEach(m => names.add(m[1]))
  }
  return names
}

function extractNativeNamedImportsByModule(tatemono: ParsedTatemono): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>()
  for (const block of (tatemono.nativeComponents ?? [])) {
    const flat = flattenMultilineImports(block.raw)
    for (const line of flat.split('\n')) {
      const m = line.match(/^import\s+(?:\w+\s*,\s*)?\{([^}]+)\}\s+from\s+['"`]([^'"`]+)['"`]/)
      if (!m) continue
      const mod   = m[2]
      const names = m[1].split(',').map(s => s.trim()).filter(Boolean)
      if (!result.has(mod)) result.set(mod, new Set())
      names.forEach(n => result.get(mod)!.add(n))
    }
  }
  return result
}

function extractNativeNamespaceImports(tatemono: ParsedTatemono): Map<string, string> {
  const result = new Map<string, string>()
  for (const block of (tatemono.nativeComponents ?? [])) {
    const flat = flattenMultilineImports(block.raw)
    for (const line of flat.split('\n')) {
      const m = line.match(/^import\s+\*\s+as\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/)
      if (m) result.set(m[1], m[2])
    }
  }
  return result
}

function extractNativeDefaultImports(tatemono: ParsedTatemono): Map<string, string> {
  const result = new Map<string, string>()
  for (const block of (tatemono.nativeComponents ?? [])) {
    const flat = flattenMultilineImports(block.raw)
    for (const line of flat.split('\n')) {
      const match = line.match(/^import\s+(\w+)(?:\s*,\s*\{[^}]+\})?\s+from\s+['"`]([^'"`]+)['"`]/)
      if (match) result.set(match[1], match[2])
    }
  }
  return result
}

function splitNativeComponentDeclarations(rawSource: string, names: Set<string>): Map<string, string> {
  const result = new Map<string, string>()
  const sourceFile = ts.createSourceFile('native-components.tsx', rawSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

  for (const statement of sourceFile.statements) {
    const declarationNames: string[] = []
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) declarationNames.push(declaration.name.text)
      }
    } else if (
      (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) &&
      statement.name
    ) {
      declarationNames.push(statement.name.text)
    }

    const matchedNames = declarationNames.filter(name => names.has(name))
    if (matchedNames.length === 0) continue

    const declaration = rawSource.slice(statement.getStart(sourceFile), statement.end).trim()
    for (const name of matchedNames) {
      result.set(name, declaration)
    }
  }
  return result
}

function exportNativeDeclarations(source: string): string {
  const sourceFile = ts.createSourceFile('native-declarations.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  return sourceFile.statements.map(statement => {
    const declaration = source.slice(statement.getStart(sourceFile), statement.end)
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined
    return modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
      ? declaration
      : `export ${declaration}`
  }).join('\n\n')
}

function extractNativeAnimationExportNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set(tatemono.nativeAnimationRN
    ? extractExportNames(tatemono.nativeAnimationRN.raw)
    : [])
  if (!tatemono.nativeAnimationRN) return names

  const sourceFile = ts.createSourceFile(
    'native-animation.ts',
    tatemono.nativeAnimationRN.raw,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement) ||
        !statement.moduleSpecifier ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        statement.moduleSpecifier.text !== '@arkzen:native:animation:expo' ||
        !statement.exportClause ||
        !ts.isNamedExports(statement.exportClause)) continue
    for (const specifier of statement.exportClause.elements) {
      names.add(specifier.name.text)
    }
  }
  return names
}

// ─── Per-component file generator ─────────────────────────────────────────────

function generateIndividualNativeComponentFiles(
  tatemono: ParsedTatemono,
  screenDir: string,
): void {
  const nativeComponents = tatemono.nativeComponents ?? []
  if (nativeComponents.length === 0) return

  const componentsDir = path.join(screenDir, 'components')
  ensureDir(componentsDir)

  const rawSources   = nativeComponents.map(c => c.raw.trim())
  const combinedRaw  = rawSources.join('\n\n')

  const componentNames = extractNativeComponentNames(tatemono)
  const hookNames      = extractNativeCustomHookNames(tatemono)
  const typeNames      = extractNativeSharedTypeNames(tatemono)
  const constNames     = extractNativeSharedConstantNames(tatemono)
  const utilNames      = extractNativeUtilityFunctionNames(tatemono)

  // Animation hook names (for injection into per-component files)
  const animExports = extractNativeAnimationExportNames(tatemono)

  // Style presence
  const hasNativeStyles = Boolean(tatemono.nativeStyleGlobal) ||
    !!(tatemono.nativeStyles && tatemono.nativeStyles.length > 0)

  const tatName      = tatemono.meta.name
  const animImport   = `import { ${Array.from(animExports).join(', ')} } from '../../../arkzen/generated/${tatName}.native-animations'`
  const styleImport  = `import { s } from '../../../arkzen/generated/${tatName}.native-styles'`

  const namedByModule = extractNativeNamedImportsByModule(tatemono)
  const defaultImports = extractNativeDefaultImports(tatemono)
  const nsImports     = extractNativeNamespaceImports(tatemono)

  // Helper: build engineNamed for one component's source
  function buildEngineNamed(src: string): Record<string, string[]> {
    const stripped = stripTemplateLiterals(src)
    const explicitlyOwned = new Set<string>()
    for (const [mod, names] of namedByModule) {
      if (mod === 'react-native') continue
      findReferencedNames(stripped, names).forEach(n => explicitlyOwned.add(n))
    }
    findReferencedNames(stripped, new Set(defaultImports.keys())).forEach(n => explicitlyOwned.add(n))
    const rnCore = findReferencedNames(stripped, RN_CORE_COMPONENTS)
      .filter(n => !explicitlyOwned.has(n))
    const result: Record<string, string[]> = {
      'react-native': Array.from(new Set(['StyleSheet', ...rnCore])),
    }
    const authStoreExports = findReferencedNames(stripped, AUTH_STORE_EXPORTS)
    if (authStoreExports.length > 0) {
      result['../../../../arkzen/core/stores/authStore'] = authStoreExports
    }
    for (const [mod, names] of namedByModule) {
      const ref = findReferencedNames(stripped, names)
      if (ref.length) result[mod] = Array.from(new Set([...(result[mod] ?? []), ...ref]))
    }
    return result
  }

  const declMap = splitNativeComponentDeclarations(combinedRaw, new Set([
    ...componentNames,
    ...hookNames,
    ...typeNames,
    ...constNames,
    ...utilNames,
  ]))

  // ── constants.tsx ──────────────────────────────────────────
  const constDecls = splitNativeComponentDeclarations(combinedRaw, constNames)
  if (constDecls.size > 0) {
    const constSrc = exportNativeDeclarations(Array.from(new Set(constDecls.values())).join('\n\n'))
    const { canonicalBlock, strippedSources } = resolveImports([constSrc], {
      arkzenImportPrefix: '../../../../arkzen/',
    })
    const out = `// ARKZEN GENERATED — ${tatName}/components/constants\n// DO NOT EDIT\n\n${canonicalBlock}\n\n${strippedSources[0].trim()}\n`
    const sibling = path.join(componentsDir, 'constants.ts')
    if (fs.existsSync(sibling)) fs.unlinkSync(sibling)
    writeIfChanged(path.join(componentsDir, 'constants.tsx'), out)
  } else {
    ;['.tsx', '.ts'].forEach(ext => {
      const f = path.join(componentsDir, `constants${ext}`)
      if (fs.existsSync(f)) fs.unlinkSync(f)
    })
  }

  // ── types.ts ───────────────────────────────────────────────
  const typeSrc = exportNativeDeclarations(Array.from(typeNames)
    .map(name => declMap.get(name))
    .filter((source): source is string => Boolean(source))
    .join('\n\n')
    .trim())
  if (typeSrc) {
    const { canonicalBlock, strippedSources } = resolveImports([typeSrc], {
      arkzenImportPrefix: '../../../../arkzen/',
    })
    const out = `// ARKZEN GENERATED — ${tatName}/components/types\n// DO NOT EDIT\n\n${canonicalBlock}\n\n${strippedSources[0].trim()}\n`
    const sibling = path.join(componentsDir, 'types.tsx')
    if (fs.existsSync(sibling)) fs.unlinkSync(sibling)
    writeIfChanged(path.join(componentsDir, 'types.ts'), out)
  }

  // ── utils.tsx ──────────────────────────────────────────────
  const utilDecls = splitNativeComponentDeclarations(combinedRaw, utilNames)
  if (utilDecls.size > 0) {
    const utilSrc = exportNativeDeclarations(Array.from(new Set(utilDecls.values())).join('\n\n'))
    const stripped = stripTemplateLiterals(utilSrc)
    const extra = [
      ...(animExports.size && findReferencedNames(stripped, animExports).length ? [animImport] : []),
      ...(hasNativeStyles && /\bs\./.test(stripped) ? [styleImport] : []),
      ...findReferencedNames(stripped, new Set(defaultImports.keys()))
        .map(name => `import ${name} from '${defaultImports.get(name)}'`),
    ].join('\n')
    const { canonicalBlock, strippedSources } = resolveImports([utilSrc], {
      extra,
      engineNamed: buildEngineNamed(utilSrc),
      engineNamespaces: Object.fromEntries(nsImports),
      arkzenImportPrefix: '../../../../arkzen/',
    })
    const out = `// ARKZEN GENERATED — ${tatName}/components/utils\n// DO NOT EDIT\n\n${canonicalBlock}\n\n${strippedSources[0].trim()}\n`
    const sibling = path.join(componentsDir, 'utils.ts')
    if (fs.existsSync(sibling)) fs.unlinkSync(sibling)
    writeIfChanged(path.join(componentsDir, 'utils.tsx'), out)
  }

  // ── hooks.tsx ──────────────────────────────────────────────
  if (hookNames.size > 0) {
    const hookDecls = exportNativeDeclarations(Array.from(hookNames)
      .map(name => declMap.get(name))
      .filter(Boolean)
      .join('\n\n')
    )
    if (hookDecls) {
      const stripped = stripTemplateLiterals(hookDecls)
      const referencedTypes = findReferencedNames(stripped, typeNames)
      const referencedConstants = findReferencedNames(stripped, constNames)
      const referencedUtils = findReferencedNames(stripped, utilNames)
      const extra = [
        ...(animExports.size && findReferencedNames(stripped, animExports).length ? [animImport] : []),
        ...(hasNativeStyles && /\bs\./.test(stripped) ? [styleImport] : []),
        ...findReferencedNames(stripped, new Set(defaultImports.keys()))
          .map(name => `import ${name} from '${defaultImports.get(name)}'`),
        ...(referencedTypes.length
          ? [`import type { ${referencedTypes.sort().join(', ')} } from './types'`]
          : []),
        ...(referencedConstants.length
          ? [`import { ${referencedConstants.sort().join(', ')} } from './constants'`]
          : []),
        ...(referencedUtils.length
          ? [`import { ${referencedUtils.sort().join(', ')} } from './utils'`]
          : []),
      ].join('\n')
      const hookedHooks = findReferencedNames(stripped, REACT_HOOKS)
      const { canonicalBlock, strippedSources } = resolveImports([hookDecls], {
        extra,
        reactHooks:      hookedHooks,
        engineNamed:     buildEngineNamed(hookDecls),
        engineNamespaces: Object.fromEntries(nsImports),
        arkzenImportPrefix: '../../../../arkzen/',
      })
      const out = `// ARKZEN GENERATED — ${tatName}/components/hooks\n// DO NOT EDIT\n\n${canonicalBlock}\n\n${strippedSources[0].trim()}\n`
      const sibling = path.join(componentsDir, 'hooks.ts')
      if (fs.existsSync(sibling)) fs.unlinkSync(sibling)
      writeIfChanged(path.join(componentsDir, 'hooks.tsx'), out)
    }
  }

  // ── Individual component files ─────────────────────────────
  const writtenFiles = new Set<string>(['constants.tsx', 'types.ts', 'utils.tsx', 'hooks.tsx'])
  for (const name of componentNames) {
    const declaration = declMap.get(name)
    if (!declaration) continue
    const src = exportNativeDeclarations(declaration)
    const stripped = stripTemplateLiterals(src)
    const siblingComponents = findReferencedNames(stripped, componentNames)
      .filter(componentName => componentName !== name)
    const referencedConstants = findReferencedNames(stripped, constNames)
    const referencedHooks = findReferencedNames(stripped, hookNames)
    const referencedUtils = findReferencedNames(stripped, utilNames)
    const referencedTypes = findReferencedNames(stripped, typeNames)
    const extra = [
      ...(animExports.size && findReferencedNames(stripped, animExports).length ? [animImport] : []),
      ...(hasNativeStyles && /\bs\./.test(stripped) ? [styleImport] : []),
      ...findReferencedNames(stripped, new Set(defaultImports.keys()))
        .map(importName => `import ${importName} from '${defaultImports.get(importName)}'`),
      ...(siblingComponents.length
        ? siblingComponents.sort().map(componentName =>
            `import { ${componentName} } from './${componentName}'`)
        : []),
      ...(referencedConstants.length
        ? [`import { ${referencedConstants.sort().join(', ')} } from './constants'`]
        : []),
      ...(referencedHooks.length
        ? [`import { ${referencedHooks.sort().join(', ')} } from './hooks'`]
        : []),
      ...(referencedUtils.length
        ? [`import { ${referencedUtils.sort().join(', ')} } from './utils'`]
        : []),
      ...(referencedTypes.length
        ? [`import type { ${referencedTypes.sort().join(', ')} } from './types'`]
        : []),
    ].join('\n')
    const hookedHooks = findReferencedNames(stripped, REACT_HOOKS)
    const { canonicalBlock, strippedSources } = resolveImports([src], {
      extra,
      reactHooks:      hookedHooks,
      engineNamed:     buildEngineNamed(src),
      engineNamespaces: Object.fromEntries(nsImports),
      arkzenImportPrefix: '../../../../arkzen/',
    })
    const fileName = `${name}.tsx`
    const out = `// ARKZEN GENERATED — ${tatName}/components/${name}\n// DO NOT EDIT\n\n${canonicalBlock}\n\n${strippedSources[0].trim()}\n`
    writeIfChanged(path.join(componentsDir, fileName), out)
    writtenFiles.add(fileName)
    console.log(`[Arkzen Native Router] ✓ Component: ${tatName}/components/${name}`)
  }

  // Remove stale component files
  if (fs.existsSync(componentsDir)) {
    for (const f of fs.readdirSync(componentsDir)) {
      if (!writtenFiles.has(f)) {
        fs.unlinkSync(path.join(componentsDir, f))
        console.log(`[Arkzen Native Router] ✓ Removed stale component: ${f}`)
      }
    }
  }
}

// ─── Native animation file generator ──────────────────────────────────────────

function generateNativeAnimationFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.nativeAnimationRN) return null

  const animationSource = ts.createSourceFile(
    'native-animation.ts',
    tatemono.nativeAnimationRN.raw,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const expoExports = new Set<string>()
  const reexportRanges: Array<[number, number]> = []
  for (const statement of animationSource.statements) {
    if (!ts.isExportDeclaration(statement) ||
        !statement.moduleSpecifier ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        statement.moduleSpecifier.text !== '@arkzen:native:animation:expo' ||
        !statement.exportClause ||
        !ts.isNamedExports(statement.exportClause)) continue
    reexportRanges.push([statement.getStart(animationSource), statement.end])
    statement.exportClause.elements.forEach(specifier => expoExports.add(specifier.propertyName?.text ?? specifier.name.text))
  }

  let animationRaw = tatemono.nativeAnimationRN.raw
  for (const [start, end] of reexportRanges.sort((a, b) => b[0] - a[0])) {
    animationRaw = animationRaw.slice(0, start) + animationRaw.slice(end)
  }
  if (expoExports.size > 0) {
    if (!tatemono.nativeAnimationExpo) {
      throw new Error(`Bare RN animation exports Expo hooks for ${tatemono.meta.name}, but no Expo animation block exists`)
    }
    const implementations = splitNativeComponentDeclarations(tatemono.nativeAnimationExpo.raw, expoExports)
    const missing = [...expoExports].filter(name => !implementations.has(name))
    if (missing.length > 0) {
      throw new Error(`Bare RN animation block for ${tatemono.meta.name} re-exports missing Expo hooks: ${missing.join(', ')}`)
    }
    animationRaw += '\n\n' + Array.from(new Set(implementations.values())).join('\n\n')
  }

  const { canonicalBlock, strippedSources } = resolveImports([animationRaw], {
    reactHooks: findReferencedNames(animationRaw, REACT_HOOKS),
  })
  const clean = strippedSources[0].replace(/\*\/\s*$/, '').trim()
  if (!clean) return null

  return `// ============================================================
// ARKZEN GENERATED NATIVE ANIMATIONS — ${tatemono.meta.name}
// Source: @arkzen:native:animation:rn
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
//
// Supported patterns:
//   Reanimated — useSharedValue, useAnimatedStyle, withTiming,
//                withSpring, withSequence, runOnUI, worklets, etc.
//   Moti       — transition presets, useDynamicAnimation, etc.
// ============================================================

${canonicalBlock}

${clean}
`
}

// ─── Custom layout generator ───────────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  const layouts = tatemono.nativeLayouts ?? []
  if (layouts.length === 0) return
  ensureDir(CUSTOM_LAYOUTS_DIR)

  for (const layout of layouts) {
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(CUSTOM_LAYOUTS_DIR, fileName)
    const { canonicalBlock, strippedSources } = resolveImports([layout.raw ?? ''])
    const out = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name} [Bare RN]\n\n${canonicalBlock}\n\n${strippedSources[0]}\n`
    writeIfChanged(filePath, out)
    console.log(`[Arkzen Native Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─── Layout JSX builder ────────────────────────────────────────────────────────
//
// Mirrors expo-router.ts buildNativeLayoutJSX but produces imports
// from src/layouts/custom/ (relative to screen file) instead of
// Expo-specific paths.

function parseNativeLayoutDecl(raw: string): { guard?: 'auth' | 'guest'; layout?: string } {
  const authMatch  = raw.match(/layout:\+auth:(\S+)/)
  const guestMatch = raw.match(/layout:\+guest:(\S+)/)
  const plainMatch = raw.match(/layout:(\S+)/)
  if (authMatch)  return { guard: 'auth',  layout: authMatch[1] }
  if (guestMatch) return { guard: 'guest', layout: guestMatch[1] }
  if (plainMatch) return { layout: plainMatch[1] }
  return {}
}

function resolveNativeLayoutChain(
  layoutName: string,
  allLayouts: ArkzenLayout[],
): string[] {
  const chain: string[] = []
  let current: string | undefined = layoutName
  const visited = new Set<string>()
  while (current && !visited.has(current)) {
    visited.add(current)
    chain.unshift(current)
    const found = allLayouts.find(l => l.name === current)
    current = (found as any)?.parent
  }
  return chain
}

function getNativeLayoutImport(layout: string, tatName: string): string {
  const componentName = toPascalCase(tatName) + toPascalCase(layout) + 'Layout'
  const filePath      = `../../layouts/custom/${tatName}-${layout}`
  return `import { ${componentName} } from '${filePath}'`
}

function getNativeLayoutComponent(layout: string, tatName: string): string {
  return toPascalCase(tatName) + toPascalCase(layout) + 'Layout'
}

function buildNativeLayoutJSX(
  page: ArkzenPage,
  tatemono: ParsedTatemono,
): { imports: string[]; openTags: string; closeTags: string } {
  const layoutRaw = (page as any).layoutRaw ?? page.layout ?? ''
  if (!layoutRaw || layoutRaw === 'default') {
    return { imports: [], openTags: '', closeTags: '' }
  }

  const decl         = parseNativeLayoutDecl(layoutRaw)
  const nativeLayouts = (tatemono.nativeLayouts ?? []) as ArkzenLayout[]

  if (!decl.layout) {
    // Built-in layouts: 'guest' | 'auth'
    const guard = decl.guard ?? (layoutRaw === 'auth' ? 'auth' : layoutRaw === 'guest' ? 'guest' : null)
    if (guard === 'auth') {
      const loginRoute = `${tatemono.meta.name}/login`
      return {
        imports:   [`import { AuthLayout } from '../../layouts/AuthLayout'`],
        openTags:  `<AuthLayout tatSlug=${JSON.stringify(tatemono.meta.name)} loginRoute=${JSON.stringify(loginRoute)}>`,
        closeTags: `</AuthLayout>`,
      }
    }
    if (guard === 'guest') {
      const dashboardRoute = `${tatemono.meta.name}/dashboard`
      return {
        imports:   [`import { GuestLayout } from '../../layouts/GuestLayout'`],
        openTags:  `<GuestLayout tatSlug=${JSON.stringify(tatemono.meta.name)} dashboardRoute=${JSON.stringify(dashboardRoute)}>`,
        closeTags: `</GuestLayout>`,
      }
    }
    return { imports: [], openTags: '', closeTags: '' }
  }

  const chain    = resolveNativeLayoutChain(decl.layout, nativeLayouts)
  const imports  = chain.map(l => getNativeLayoutImport(l, tatemono.meta.name))
  const openTags = chain.map(l => `<${getNativeLayoutComponent(l, tatemono.meta.name)}>`).join('\n      ')
  const closeTags = chain.map(l => `</${getNativeLayoutComponent(l, tatemono.meta.name)}>`).reverse().join('\n      ')

  return { imports, openTags, closeTags }
}

// ─── Screen file generator ────────────────────────────────────────────────────

function generateScreenFile(tatemono: ParsedTatemono, page: ArkzenPage): string {
  const tatName = tatemono.meta.name
  const { imports: layoutImports, openTags: layoutOpen, closeTags: layoutClose } =
    buildNativeLayoutJSX(page, tatemono)

  const hasNativeContent = page.raw && page.raw.trim().length > 0

  // ── Placeholder (empty @arkzen:native:page block) ──────────
  if (!hasNativeContent) {
    const wrapperName = `ArkzenScreen_${toPascalCase(tatName)}_${toPascalCase(page.name)}`
    return `// ============================================================
// ARKZEN GENERATED SCREEN — ${tatName}/${page.name} (placeholder)
// ============================================================

import React from 'react'
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
${layoutImports.join('\n')}

export function ${wrapperName}({ navigation }: any) {
  setActiveTatemono('${tatName}')
  return (
    <>
      <StatusBar barStyle="dark-content" />
      ${layoutOpen}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.center}>
          <Text style={styles.hint}>Add JSX to @arkzen:native:page:${page.name}</Text>
        </View>
      </ScrollView>
      ${layoutClose}
    </>
  )
}

const styles = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: '#f5f5f0' },
  content: { flexGrow: 1 },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  hint:    { color: '#aaa', fontSize: 13 },
})

export default ${wrapperName}
`
  }

  // ── Full generation ────────────────────────────────────────// ── Resolve imports from ALL RN sources ──────────────────────────────────
const allSources = [
  page.raw.trim(),
  ...(tatemono.nativePages || []).map(p => p.raw.trim()),
  ...(tatemono.nativeComponents || []).map(c => c.raw.trim()),
  ...(tatemono.nativeLayouts || []).map(l => l.raw.trim()),
  ...(tatemono.nativeErrorHandlers || []).map(e => e.raw.trim()),
  ...(tatemono.nativeStyleGlobal ? [tatemono.nativeStyleGlobal.raw.trim()] : []),
  ...(tatemono.nativeStyles || []).map(s => s.raw.trim()),
  ...(tatemono.nativeAnimationRN ? [tatemono.nativeAnimationRN.raw.trim()] : []),
  ...(tatemono.nativeScriptRN ? [tatemono.nativeScriptRN.raw.trim()] : []),
  ...(tatemono.nativeScriptsRN || []).map(s => s.raw.trim()),
].filter(Boolean)
  const pageStripped = stripTemplateLiterals(page.raw)

  const animExports = [...extractNativeAnimationExportNames(tatemono)]
  const animImportLine = animExports.length > 0
    ? `import { ${animExports.join(', ')} } from '../../arkzen/generated/${tatName}.native-animations'`
    : ''

  const styleImportLine = (tatemono.nativeStyles && tatemono.nativeStyles.length > 0)
    ? `import { s } from '../../arkzen/generated/${tatName}.native-styles'`
    : ''

  const nativeComponentNames = extractNativeComponentNames(tatemono)
  const componentImportLines = [...nativeComponentNames].sort()
    .map(name => `import { ${name} } from './components/${name}'`)
    .join('\n')

  const sharedConstants       = extractNativeSharedConstantNames(tatemono)
  const referencedConstants   = findReferencedNames(pageStripped, sharedConstants)
  const constantsImportLine   = referencedConstants.length > 0
    ? `import { ${referencedConstants.sort().join(', ')} } from './components/constants'`
    : ''

  const customHooks     = extractNativeCustomHookNames(tatemono)
  const referencedHooks = findReferencedNames(pageStripped, customHooks)
  const hooksImportLine = referencedHooks.length > 0
    ? `import { ${referencedHooks.sort().join(', ')} } from './components/hooks'`
    : ''

  const utilityFns    = extractNativeUtilityFunctionNames(tatemono)
  const referencedUtils = findReferencedNames(pageStripped, utilityFns)
  const utilsImportLine = referencedUtils.length > 0
    ? `import { ${referencedUtils.sort().join(', ')} } from './components/utils'`
    : ''

  const sharedTypes     = extractNativeSharedTypeNames(tatemono)
  const referencedTypes = findReferencedNames(pageStripped, sharedTypes)
  const typesImportLine = referencedTypes.length > 0
    ? `import type { ${referencedTypes.sort().join(', ')} } from './components/types'`
    : ''

  const extraLines = [
    ...layoutImports,
    animImportLine,
    styleImportLine,
    componentImportLines,
    constantsImportLine,
    hooksImportLine,
    utilsImportLine,
    typesImportLine,
  ].filter(Boolean).join('\n')

  const referencedHookCalls = findReferencedNames(pageStripped, REACT_HOOKS)

  // Explicit named imports from components block
  const namedByModule = extractNativeNamedImportsByModule(tatemono)
  const defaultImports = extractNativeDefaultImports(tatemono)
  const explicitlyOwned = new Set<string>()
  for (const [mod, names] of namedByModule) {
    if (mod === 'react-native') continue
    findReferencedNames(pageStripped, names).forEach(n => explicitlyOwned.add(n))
  }
  findReferencedNames(pageStripped, new Set(defaultImports.keys()))
    .forEach(name => explicitlyOwned.add(name))

  const rnCore = findReferencedNames(pageStripped, RN_CORE_COMPONENTS)
    .filter(n => !explicitlyOwned.has(n))
  const rnRequired = Array.from(new Set(['ScrollView', 'StyleSheet', 'StatusBar', ...rnCore]))

  const referencedAuthStoreExports = findReferencedNames(pageStripped, AUTH_STORE_EXPORTS)
  const authStoreNamed = Array.from(new Set(['setActiveTatemono', ...referencedAuthStoreExports]))

  const nsImports       = extractNativeNamespaceImports(tatemono)
  const referencedNS    = findReferencedNames(pageStripped, new Set(nsImports.keys()))
  const engineNamespaces: Record<string, string> = {}
  for (const ns of referencedNS) {
    engineNamespaces[ns] = nsImports.get(ns)!
  }

  // Bare RN uses react-native StatusBar and @react-navigation/native-stack navigation
  const engineNamed: Record<string, string[]> = {
    'react-native':                         rnRequired,
    '../../../arkzen/core/stores/authStore':   authStoreNamed,
  }
  for (const [rawMod, names] of namedByModule) {
    const mod = rawMod.replace(/^@\/arkzen\//, '../../../arkzen/')
    const ref = findReferencedNames(pageStripped, names)
    if (ref.length) {
      engineNamed[mod] = Array.from(new Set([...(engineNamed[mod] ?? []), ...ref]))
    }
  }

  const { canonicalBlock, strippedSources } = resolveImports(allSources, {
    extra:            extraLines,
    reactHooks:       referencedHookCalls,
    engineNamed,
    engineNamespaces,
  })

  let userCode = strippedSources[0]
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()

  // Find the last PascalCase component
  const pascalConst = [...userCode.matchAll(/^(?:export\s+)?const\s+([A-Z][A-Za-z0-9_$]*)\s*(?::[^=]*)?\s*=/gm)]
  const pascalFunc  = [...userCode.matchAll(/^(?:export\s+)?function\s+([A-Z][A-Za-z0-9_$]*)\s*[(<]/gm)]
  const allPascal   = [...pascalConst, ...pascalFunc].sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  const lastPascal  = allPascal[allPascal.length - 1]

  let componentName: string
  let componentDefinition: string

  if (lastPascal) {
    componentName       = lastPascal[1]
    componentDefinition = userCode
  } else {
    componentName       = toPascalCase(page.name) + 'Content'
    componentDefinition = `const ${componentName} = ({ navigation }: any) => (\n  ${userCode}\n)`
  }

  const wrapperName = `ArkzenScreen_${toPascalCase(tatName)}_${toPascalCase(page.name)}`
  const componentSignature = componentDefinition.match(
    new RegExp(`(?:function\\s+${componentName}\\s*|const\\s+${componentName}\\s*=\\s*(?:async\\s*)?)\\(([^)]*)\\)`),
  )?.[1] ?? ''
  const screenProps = /\b(navigation|route)\b/.test(componentSignature)
    ? ' navigation={navigation} route={route}'
    : ''

  return `// ============================================================
// ARKZEN GENERATED SCREEN — ${tatName}/${page.name}
// DO NOT EDIT — edit the tatemono file instead
// ============================================================

${canonicalBlock}

// User screen (from @arkzen:native:page:${page.name})
${componentDefinition}

// Engine wrapper — injected by Arkzen
export function ${wrapperName}({ navigation, route }: any) {
  // Set slug synchronously on every render so auth store always
  // has the correct tatemono slug before any child runs.
  setActiveTatemono('${tatName}')
  return (
    <>
      <StatusBar barStyle="dark-content" />
      ${layoutOpen}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <${componentName}${screenProps} />
      </ScrollView>
      ${layoutClose}
    </>
  )
}

export default ${wrapperName}
`
}

// ─── Error boundary generator ──────────────────────────────────────────────────

function generateErrorBoundaryFile(
  tatemono: ParsedTatemono,
  handler: ArkzenErrorHandler,
): string {
  const tatName = tatemono.meta.name
  const { canonicalBlock, strippedSources } = resolveImports([handler.raw.trim()], {
    engineNamed: {
      'react-native': ['View', 'Text', 'TouchableOpacity', 'StyleSheet'],
    },
  })
  const nativeComponentNames = extractNativeComponentNames(tatemono)
  const stripped = stripTemplateLiterals(handler.raw)
  const refComps = findReferencedNames(stripped, nativeComponentNames)
  const compImports = refComps.length > 0
    ? refComps.sort().map(n => `import { ${n} } from './components/${n}'`).join('\n') + '\n'
    : ''

  const handlerCode = strippedSources[0]
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()
  const errorScreenName = handlerCode.match(/(?:const|function)\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
  const errorScreen = errorScreenName
    ? `<${errorScreenName} />`
    : `<View style={styles.fallback}><Text>Something went wrong.</Text></View>`
  const fallbackStyles = errorScreenName
    ? ''
    : `\nconst styles = StyleSheet.create({ fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' } })\n`

  return `// ============================================================
// ARKZEN NATIVE SCREEN — ${tatName}/error-boundary
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

${canonicalBlock}
${compImports}
${handlerCode}
${fallbackStyles}

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
      return ${errorScreen}
    }
    return this.props.children
  }
}

export default ErrorBoundary
`
}

// ─── Route registry ────────────────────────────────────────────────────────────

interface NativeRoute {
  tatName:    string
  screenName: string
  routeKey:   string   // e.g. 'my-app/dashboard'
  layout:     string
  auth:       boolean
}

function readExistingRoutes(): NativeRoute[] {
  if (!fs.existsSync(ROUTES_FILE)) return []
  const content = fs.readFileSync(ROUTES_FILE, 'utf-8')
  const matches = [...content.matchAll(/\/\/ ROUTE:([^:]+):([^:]+):([^:]+):([^:]+):(true|false)/g)]
  return matches.map(m => ({
    tatName:    m[1],
    screenName: m[2],
    routeKey:   m[3],
    layout:     m[4],
    auth:       m[5] === 'true',
  }))
}

function writeRouteRegistry(routes: NativeRoute[]): void {
  ensureDir(GENERATED_DIR)

  const paramListEntries = routes.length > 0
    ? routes.map(r => `  '${r.routeKey}': undefined`).join('\n')
    : '  [routeName: string]: undefined'

  const imports = routes.map(r => {
    const screenComp = toPascalCase(r.tatName) + toPascalCase(r.screenName) + 'Screen'
    const compName   = `ArkzenScreen_${toPascalCase(r.tatName)}_${toPascalCase(r.screenName)}`
    return (
      `// ROUTE:${r.tatName}:${r.screenName}:${r.routeKey}:${r.layout}:${r.auth}\n` +
      `import { ${compName} as ${screenComp} } from '../../screens/${r.tatName}/${r.screenName}'`
    )
  }).join('\n')

  const screenDefs = routes.map(r => {
    const screenComp = toPascalCase(r.tatName) + toPascalCase(r.screenName) + 'Screen'
    return `  {
    name:      '${r.routeKey}',
    component: ${screenComp},
    auth:      ${r.auth},
    tatemono:  '${r.tatName}',
    screenName: '${r.screenName}',
    layout:    '${r.layout}',
  }`
  }).join(',\n')

  const content = `// ============================================================
// ARKZEN GENERATED — React Navigation Route Registry v2.0
// Auto-updated when tatemonos are built/removed
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

${imports}

// React Navigation param list — required for type-safe navigation
export type ArkzenRootStackParamList = {
${paramListEntries}
}

export interface ArkzenNativeRoute {
  name:      string
  component: React.ComponentType<any>
  auth:      boolean
  tatemono:  string
  screenName: string
  layout:    string
}

export const ARKZEN_NATIVE_ROUTES: ArkzenNativeRoute[] = [
${screenDefs}
]

export function getFirstRouteForTat(tatName: string): string | undefined {
  return ARKZEN_NATIVE_ROUTES.find(r => r.tatemono === tatName)?.name
}

export function getLoginRoute(tatName: string): string {
  const login = ARKZEN_NATIVE_ROUTES.find(r => r.tatemono === tatName && r.screenName === 'login')
  return login?.name ?? \`\${tatName}/login\`
}

export function getDashboardRoute(tatName: string): string {
  const dash = ARKZEN_NATIVE_ROUTES.find(
    r => r.tatemono === tatName && (r.screenName === 'dashboard' || r.screenName === 'index') && r.auth
  )
  return dash?.name ?? \`\${tatName}/dashboard\`
}
`
  fs.writeFileSync(ROUTES_FILE, content, 'utf-8')
}

// ─── Register / Unregister ─────────────────────────────────────────────────────

export function registerNativeScreens(tatemono: ParsedTatemono): void {
  const tatName   = tatemono.meta.name
  const screenDir = path.join(SRC_SCREENS_DIR, tatName)
  ensureDir(screenDir)

  // Per-file native component generation
  generateIndividualNativeComponentFiles(tatemono, screenDir)

  // Native style emission (→ src/arkzen/generated/{tat}.native-styles.ts)
  emitNativeStyles(
    tatName,
    tatemono.nativeStyles ?? [],
    GENERATED_DIR,
    'Arkzen Native Router',
    tatemono.nativeStyleGlobal,
  )

  // Native animation file
  if (tatemono.nativeAnimationRN) {
    ensureDir(GENERATED_DIR)
    const animContent = generateNativeAnimationFile(tatemono)
    if (animContent) {
      const animPath = path.join(GENERATED_DIR, `${tatName}.native-animations.ts`)
      writeIfChanged(animPath, animContent)
      console.log(`[Arkzen Native Router] ✓ Animation file: ${tatName}.native-animations.ts`)
    }
  }

  // Custom native layouts
  generateCustomLayouts(tatemono)

  const existingRoutes = readExistingRoutes().filter(r => r.tatName !== tatName)
  const newRoutes: NativeRoute[] = []

  for (const page of tatemono.nativePages) {
    const screenName = page.name
    const routeKey   = `${tatName}/${screenName}`
    const layout     = page.layout ?? 'default'
    const isAuth     = tatemono.meta.auth && layout === 'auth'

    writeIfChanged(
      path.join(screenDir, `${screenName}.tsx`),
      generateScreenFile(tatemono, page),
    )

    newRoutes.push({ tatName, screenName, routeKey, layout, auth: isAuth })
    console.log(`[Arkzen Native Router] ✓ ${routeKey} [${layout}]`)
  }

  // Error handlers
  for (const handler of tatemono.nativeErrorHandlers ?? []) {
    if (handler.type === '500') {
      const errorBoundaryPath = path.join(screenDir, 'error-boundary.tsx')
      writeIfChanged(errorBoundaryPath, generateErrorBoundaryFile(tatemono, handler))
      console.log(`[Arkzen Native Router] ✓ error-boundary.tsx generated for ${tatName}`)
    }
  }

  writeRouteRegistry([...existingRoutes, ...newRoutes])
  console.log(`[Arkzen Native Router] ✓ Navigation registry updated: ${newRoutes.length} screen(s)`)
}

export function unregisterNativeScreens(tatName: string): void {
  const screenDir = path.join(SRC_SCREENS_DIR, tatName)
  if (fs.existsSync(screenDir)) {
    fs.rmSync(screenDir, { recursive: true, force: true })
    console.log(`[Arkzen Native Router] ✓ Removed screens: ${tatName}`)
  }

  // Clean up animation and style files
  for (const suffix of ['native-animations.ts', 'native-styles.ts']) {
    const f = path.join(GENERATED_DIR, `${tatName}.${suffix}`)
    if (fs.existsSync(f)) {
      fs.unlinkSync(f)
      console.log(`[Arkzen Native Router] ✓ Removed: ${tatName}.${suffix}`)
    }
  }

  // Clean up custom layouts
  if (fs.existsSync(CUSTOM_LAYOUTS_DIR)) {
    for (const f of fs.readdirSync(CUSTOM_LAYOUTS_DIR)) {
      if (f.startsWith(`${tatName}-`)) {
        fs.unlinkSync(path.join(CUSTOM_LAYOUTS_DIR, f))
        console.log(`[Arkzen Native Router] ✓ Removed layout: ${f}`)
      }
    }
  }

  const routes = readExistingRoutes().filter(r => r.tatName !== tatName)
  writeRouteRegistry(routes)
  console.log(`[Arkzen Native Router] ✓ Navigation registry updated`)
}
