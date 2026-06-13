// ============================================================
// ARKZEN ENGINE — EXPO ROUTER v4.0
//
// v4.0 – PER-FILE NATIVE COMPONENT GENERATION.
//        generateIndividualNativeComponentFiles(): splits @arkzen:native:components
//        blocks into individual files under src/screens/{tat}/components/.
//        generateScreenFile() no longer inlines nativeComponents — it imports
//        each component individually via `import { X } from './components/X'`.
//        Full parity with vite-router.ts / next.js router.ts component model.
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
// v3.2 – Fixed index screen routing.
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

// ─── flattenMultilineImports ───────────────────────────────────────────────────

function flattenMultilineImports(code: string): string {
  const lines = code.split('\n')
  const out: string[] = []
  let inImport = false
  let buffer = ''
  let depth = 0

  const isCompleteImport = (s: string): boolean =>
    /^import\s+(?:(?:[\w*\s{},]+)\s+from\s+['"][^'"]+['"]|['"][^'"]+['"])\s*;?\s*$/.test(s)

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

// ─── resolveImports ───────────────────────────────────────────────────────────

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
        const entry = getEntry(mod)
        if (mod !== 'react') entry.defaultImport = def
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      m = line.match(namespaceImportRe)
      if (m) {
        const [, ns, mod] = m
        getEntry(mod).defaultImport = `* as ${ns}`
        continue
      }

      m = line.match(namedImportRe)
      if (m) {
        const [, namedStr, mod] = m
        const entry = getEntry(mod)
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      m = line.match(defaultImportRe)
      if (m) {
        const [, def, mod] = m
        if (mod === 'react') continue
        getEntry(mod).defaultImport = def
        continue
      }

      m = line.match(sideEffectRe)
      if (m) {
        sideEffects.push(`import '${m[1]}'`)
        continue
      }
    }
  }

  const lines: string[] = []

  const reactNamed = [...(importMap.get('react')?.named ?? [])]
    .filter(n => n !== 'React')
    .sort()
  lines.push(
    reactNamed.length > 0
      ? `import React, { ${reactNamed.join(', ')} } from 'react'`
      : `import React from 'react'`
  )

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

// ─── Template literal stripper ────────────────────────────────────────────────
// Replaces template literal STATIC content char-for-char with whitespace so
// character indices are preserved for splitNativeComponentDeclarations slicing.

function stripTemplateLiterals(src: string): string {
  let result = ''
  let i = 0
  while (i < src.length) {
    if (src[i] === '`') {
      result += ' '
      i++
      while (i < src.length) {
        if (src[i] === '\\') { result += '  '; i += 2; continue }
        if (src[i] === '`') { result += ' '; i++; break }
        if (src[i] === '$' && src[i + 1] === '{') {
          result += '  '
          i += 2
          let depth = 1
          while (i < src.length && depth > 0) {
            if (src[i] === '{') depth++
            else if (src[i] === '}') {
              depth--
              if (depth === 0) { result += '}'; i++; break }
            }
            result += src[i]
            i++
          }
          continue
        }
        result += ' '
        i++
      }
    } else {
      result += src[i]
      i++
    }
  }
  return result
}

// ─── Native component name extractors ─────────────────────────────────────────
// Mirror the web extractors but operate on tatemono.nativeComponents

function extractNativeComponentNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of (tatemono.nativeComponents ?? [])) {
    const stripped = stripTemplateLiterals(component.raw)
    const constMatches = stripped.match(/(?:export\s+)?const\s+([A-Z][A-Za-z0-9_$]*)\s*[=:(]/g) || []
    for (const match of constMatches) {
      const name = match.match(/const\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^[A-Z_]+$/.test(name)) names.add(name)
    }
    const fnMatches = stripped.match(/(?:export\s+)?function\s+([A-Z][A-Za-z0-9_$]*)\s*[(<]/g) || []
    for (const match of fnMatches) {
      const name = match.match(/function\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

function extractNativeSharedConstantNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of (tatemono.nativeComponents ?? [])) {
    const stripped = stripTemplateLiterals(component.raw)
    const matches = stripped.match(/^(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*[=:]/gm) || []
    for (const match of matches) {
      const name = match.match(/const\s+([A-Z][A-Z0-9_]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

function extractNativeCustomHookNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of (tatemono.nativeComponents ?? [])) {
    const stripped = stripTemplateLiterals(component.raw)
    const fnMatches = stripped.match(/(?:export\s+)?function\s+(use[A-Z][A-Za-z0-9_$]*)\s*[(<]/g) || []
    for (const match of fnMatches) {
      const name = match.match(/function\s+(use[A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
    const constMatches = stripped.match(/(?:export\s+)?const\s+(use[A-Z][A-Za-z0-9_$]*)\s*[=:(]/g) || []
    for (const match of constMatches) {
      const name = match.match(/const\s+(use[A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

function extractNativeSharedTypeNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of (tatemono.nativeComponents ?? [])) {
    const stripped = stripTemplateLiterals(component.raw)
    const typeMatches = stripped.match(/(?:export\s+)?type\s+([A-Z][A-Za-z0-9_$]*)\s*[=<{]/g) || []
    for (const match of typeMatches) {
      const name = match.match(/type\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
    const ifaceMatches = stripped.match(/(?:export\s+)?interface\s+([A-Z][A-Za-z0-9_$]*)\s*[{<]/g) || []
    for (const match of ifaceMatches) {
      const name = match.match(/interface\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

function extractNativeUtilityFunctionNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of (tatemono.nativeComponents ?? [])) {
    const stripped = stripTemplateLiterals(component.raw)

    // Only match TOP-LEVEL declarations: anchored to line start with zero
    // leading whitespace. This naturally excludes nested locals like
    // `const res = await apiFetch(...)` inside a component's event handlers,
    // which are always indented. The previous approach tried to strip
    // component bodies via a non-greedy lookahead that stopped at the first
    // nested const/function and leaked the remainder of the body into scope.
    const constMatches = stripped.match(/^(?:export\s+)?const\s+([a-z][A-Za-z0-9_$]*)\s*[=:(]/gm) || []
    for (const match of constMatches) {
      const name = match.match(/const\s+([a-z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^use[A-Z]/.test(name)) names.add(name)
    }
    const fnMatches = stripped.match(/^(?:export\s+)?(?:async\s+)?function\s+([a-z][A-Za-z0-9_$]*)\s*[(<]/gm) || []
    for (const match of fnMatches) {
      const name = match.match(/function\s+([a-z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^use[A-Z]/.test(name)) names.add(name)
    }
  }
  return names
}

// Core react-native components that @arkzen:native:page blocks may reference
// without their own import (they relied on the shared inline scope before
// per-file generation split components out of the page block).
const RN_CORE_COMPONENTS = new Set([
  'View', 'Text', 'ScrollView', 'TouchableOpacity', 'Pressable',
  'TextInput', 'Image', 'ImageBackground', 'FlatList', 'SectionList',
  'Switch', 'ActivityIndicator', 'Modal', 'KeyboardAvoidingView',
  'Platform', 'Dimensions', 'StyleSheet', 'Alert', 'Linking',
  'Keyboard', 'RefreshControl',
])

// React hooks that @arkzen:native:page blocks may reference without their
// own 'react' import for the same reason as RN_CORE_COMPONENTS above.
const REACT_HOOKS = new Set([
  'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback',
  'useContext', 'useReducer', 'useLayoutEffect', 'useId',
  'useImperativeHandle', 'useDeferredValue', 'useTransition',
])

function findReferencedNames(strippedSource: string, names: Set<string>): string[] {
  const found: string[] = []
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`[^\\w$]${escaped}\\b`).test(' ' + strippedSource)) {
      found.push(name)
    }
  }
  return found
}

function splitNativeComponentDeclarations(rawSource: string, names: Set<string>): Map<string, string> {
  const out = new Map<string, string>()
  if (names.size === 0) return out

  const scanSource = stripTemplateLiterals(rawSource)
  const nameAlt = [...names].map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const re = new RegExp(`^(?:export\\s+)?(?:async\\s+)?(const|function|interface|type)\\s+(${nameAlt})\\b`, 'gm')

  const starts: { index: number; name: string }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(scanSource)) !== null) {
    starts.push({ index: m.index, name: m[2] })
  }
  if (starts.length === 0) return out

  for (let i = 0; i < starts.length; i++) {
    const { index, name } = starts[i]
    let chunkStart = index
    const before = scanSource.slice(0, index)
    const lines = before.split('\n')
    let li = lines.length - 1
    let consumed = 0
    while (li >= 0) {
      const line = lines[li].trim()
      if (line === '' || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        consumed += lines[li].length + 1
        li--
      } else {
        break
      }
    }
    if (consumed > 0) chunkStart = Math.max(0, index - consumed)
    const chunkEnd = i + 1 < starts.length ? starts[i + 1].index : rawSource.length
    out.set(name, rawSource.slice(chunkStart, chunkEnd).trim())
  }
  return out
}

// ─── Import merger helpers ─────────────────────────────────────────────────────

function ensureReactNativeImport(canonicalBlock: string, requiredComponents: string[]): string {
  const importRe = /^import\s+\{([^}]*)\}\s+from\s+['"]react-native['"]\s*;?\n?/m
  const match = canonicalBlock.match(importRe)
  if (!match) {
    return canonicalBlock + `\nimport { ${requiredComponents.join(', ')} } from 'react-native'`
  }
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

// AuthStore exports a page block may reference without importing them itself
// (relied on the shared inline scope before per-file generation split the
// page block out from @arkzen:native:components:shared).
const AUTH_STORE_EXPORTS = new Set(['useAuthStore', 'useAuthStoreHydrated'])

function ensureAuthStoreImports(canonicalBlock: string, extraNamed: string[]): string {
  const authStorePath = `'../../../arkzen/core/stores/authStore'`
  const required = Array.from(new Set(['setActiveTatemono', ...extraNamed]))

  const existingImportRe = /import\s+\{([^}]*)\}\s+from\s+['"](?:\.\.\/)+arkzen\/core\/stores\/authStore['"]\s*;?/
  const match = canonicalBlock.match(existingImportRe)
  if (match) {
    const named = match[1].split(',').map(s => s.trim()).filter(Boolean)
    for (const name of required) {
      if (!named.includes(name)) named.push(name)
    }
    return canonicalBlock.replace(existingImportRe, `import { ${named.join(', ')} } from ${authStorePath}`)
  }

  const sep = canonicalBlock.endsWith('\n') ? '' : '\n'
  return canonicalBlock + `${sep}\nimport { ${required.join(', ')} } from ${authStorePath}`
}

function normaliseNativeImports(block: string): string {
  return block.replace(/from\s+'@\/arkzen\//g, `from '../../../arkzen/`)
              .replace(/from\s+"@\/arkzen\//g, `from "../../../arkzen/`)
}

function extractExportNames(raw: string): string[] {
  const names: string[] = []
  const namedRe = /^\s*export\s+(?:function|const|class|let|var)\s+([A-Za-z_$][\w$]*)/gm
  let m: RegExpExecArray | null
  while ((m = namedRe.exec(raw)) !== null) names.push(m[1])
  return names
}

// ─── Per-file native component generation ─────────────────────────────────────
// v4.0: Each native component gets its own file under src/screens/{tat}/components/
// with real code, not re-exports. Mirrors web stack behaviour exactly.

function generateIndividualNativeComponentFiles(tatemono: ParsedTatemono, screenDir: string): void {
  const nativeComponents = tatemono.nativeComponents ?? []
  const componentsDir = path.join(screenDir, 'components')

  if (nativeComponents.length === 0) {
    if (fs.existsSync(componentsDir)) {
      fs.rmSync(componentsDir, { recursive: true })
      console.log(`[Arkzen Expo Router] 🧹 Removed stale components/ (no @arkzen:native:components)`)
    }
    return
  }

  ensureDir(componentsDir)

  // Resolve imports across ALL native component blocks
  const rawSources = nativeComponents.map(c => c.raw.trim())
  const { canonicalBlock, strippedSources } = resolveImports(rawSources)

  // Normalise @/arkzen/* paths — components/components/index.ts is 4 levels deep:
  // src/screens/{tat}/components/{Name}.tsx → 4 levels up = expo root
  // Adjust relative path: ../../../../arkzen/...
  const normalisedCanonicalBlock = canonicalBlock
    .replace(/from\s+'@\/arkzen\//g, `from '../../../../arkzen/`)
    .replace(/from\s+"@\/arkzen\//g, `from "../../../../arkzen/`)

  const extractedComponents = extractNativeComponentNames(tatemono)
  const sharedConstants     = extractNativeSharedConstantNames(tatemono)
  const customHooks         = extractNativeCustomHookNames(tatemono)
  const sharedTypes         = extractNativeSharedTypeNames(tatemono)
  const utilityFunctions    = extractNativeUtilityFunctionNames(tatemono)
  const allDeclaredNames    = new Set([...extractedComponents, ...sharedConstants, ...customHooks, ...sharedTypes, ...utilityFunctions])

  // Split each stripped source into per-declaration chunks
  const declarationsByName = new Map<string, string>()
  for (const stripped of strippedSources) {
    for (const [name, code] of splitNativeComponentDeclarations(stripped, allDeclaredNames)) {
      declarationsByName.set(name, code)
    }
  }

  // ── Shared constants file ──────────────────────────────────────────────────
  if (sharedConstants.size > 0) {
    const constChunks = [...sharedConstants]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(const)(\\s+${esc}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })
    if (constChunks.length > 0) {
      // constants.ts lives in components/ — one level deeper than the screen dir
      // where tatemono authors write their require() paths. Prepend one extra ../
      // to all relative require() calls so asset paths resolve correctly.
      // e.g. require('../../../assets/...') → require('../../../../assets/...')
      const fixRequireDepth = (s: string) =>
        s.replace(/require\(['"](\.\.[\/\\])/g, "require('../$1")
      const constChunksFixed      = constChunks.map(fixRequireDepth)
      const canonicalBlockFixed   = fixRequireDepth(normalisedCanonicalBlock)

      const content = `// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — ${tatemono.meta.name} [Expo]
// Source: @arkzen:native:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlockFixed}

${constChunksFixed.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'constants.tsx'), content, 'utf-8')
      console.log(`[Arkzen Expo Router] ✓ Native shared constants: constants.tsx`)
    }
  } else {
    const p = path.join(componentsDir, 'constants.tsx')
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Expo Router] 🧹 Removed stale constants.tsx`) }
  }

  // ── Custom hooks file ──────────────────────────────────────────────────────
  if (customHooks.size > 0) {
    const hookChunks = [...customHooks]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(const|(?:async\\s+)?function)(\\s+${esc}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })
    if (hookChunks.length > 0) {
      const hookChunksJoined = hookChunks.join('\n\n')

      const hookReferencedConstants = findReferencedNames(hookChunksJoined, sharedConstants)
      const hookConstantsImport = hookReferencedConstants.length > 0
        ? `import { ${hookReferencedConstants.sort().join(', ')} } from './constants'\n`
        : ''

      const hookReferencedTypes = findReferencedNames(hookChunksJoined, sharedTypes)
      const hookTypesImport = hookReferencedTypes.length > 0
        ? `import type { ${hookReferencedTypes.sort().join(', ')} } from './types'\n`
        : ''

      const content = `// ============================================================
// ARKZEN GENERATED NATIVE HOOKS — ${tatemono.meta.name} [Expo]
// Source: @arkzen:native:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${normalisedCanonicalBlock}
${hookConstantsImport}${hookTypesImport}
${hookChunksJoined}
`
      fs.writeFileSync(path.join(componentsDir, 'hooks.tsx'), content, 'utf-8')
      console.log(`[Arkzen Expo Router] ✓ Native custom hooks: hooks.tsx (${[...customHooks].join(', ')})`)
    }
  } else {
    for (const stale of ['hooks.tsx', 'hooks.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Expo Router] 🧹 Removed stale ${stale}`) }
    }
  }

  // ── Utility functions file ─────────────────────────────────────────────────
  if (utilityFunctions.size > 0) {
    const utilChunks = [...utilityFunctions]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(const|(?:async\\s+)?function)(\\s+${esc}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })
    if (utilChunks.length > 0) {
      const utilChunksJoined = utilChunks.join('\n\n')

      // Utility functions may reference shared constants/types/hooks that
      // were split out into their own files (e.g. apiFetch uses BACKEND_URL
      // from constants.tsx). Mirror the per-component import resolution.
      const utilReferencedConstants = findReferencedNames(utilChunksJoined, sharedConstants)
      const utilConstantsImport = utilReferencedConstants.length > 0
        ? `import { ${utilReferencedConstants.sort().join(', ')} } from './constants'\n`
        : ''

      const utilReferencedTypes = findReferencedNames(utilChunksJoined, sharedTypes)
      const utilTypesImport = utilReferencedTypes.length > 0
        ? `import type { ${utilReferencedTypes.sort().join(', ')} } from './types'\n`
        : ''

      const utilReferencedHooks = findReferencedNames(utilChunksJoined, customHooks)
      const utilHooksImport = utilReferencedHooks.length > 0
        ? `import { ${utilReferencedHooks.sort().join(', ')} } from './hooks'\n`
        : ''

      const content = `// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — ${tatemono.meta.name} [Expo]
// Source: @arkzen:native:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${normalisedCanonicalBlock}
${utilConstantsImport}${utilTypesImport}${utilHooksImport}
${utilChunksJoined}
`
      fs.writeFileSync(path.join(componentsDir, 'utils.tsx'), content, 'utf-8')
      console.log(`[Arkzen Expo Router] ✓ Native utility functions: utils.tsx (${[...utilityFunctions].join(', ')})`)
    }
  } else {
    const p = path.join(componentsDir, 'utils.tsx')
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Expo Router] 🧹 Removed stale utils.tsx`) }
  }

  // ── Shared types file ──────────────────────────────────────────────────────
  if (sharedTypes.size > 0) {
    const typeChunks = [...sharedTypes]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(type|interface)(\\s+${esc}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })
    if (typeChunks.length > 0) {
      const content = `// ============================================================
// ARKZEN GENERATED NATIVE TYPES — ${tatemono.meta.name} [Expo]
// Source: @arkzen:native:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${typeChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'types.ts'), content, 'utf-8')
      console.log(`[Arkzen Expo Router] ✓ Native shared types: types.ts (${[...sharedTypes].join(', ')})`)
    }
  } else {
    const p = path.join(componentsDir, 'types.ts')
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Expo Router] 🧹 Removed stale types.ts`) }
  }

  // ── One real file per component containing its actual code ─────────────────
  for (const compName of extractedComponents) {
    const declaration = declarationsByName.get(compName)
    if (!declaration) {
      console.log(`[Arkzen Expo Router] ⚠ Could not isolate declaration for ${compName}, skipping file`)
      continue
    }

    const fileName = `${compName}.tsx`
    const filePath = path.join(componentsDir, fileName)

    const escapedName = compName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const exportedDeclaration = declaration.replace(
      new RegExp(`^(\\s*)(export\\s+)?(const|(?:async\\s+)?function)(\\s+${escapedName}\\b)`, 'm'),
      (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
    )

    const referencedConstants = findReferencedNames(declaration, sharedConstants)
    const constantsImport = referencedConstants.length > 0
      ? `import { ${referencedConstants.sort().join(', ')} } from './constants'\n`
      : ''

    const referencedHooks = findReferencedNames(declaration, customHooks)
    const hooksImport = referencedHooks.length > 0
      ? `import { ${referencedHooks.sort().join(', ')} } from './hooks'\n`
      : ''

    const referencedTypes = findReferencedNames(declaration, sharedTypes)
    const typesImport = referencedTypes.length > 0
      ? `import type { ${referencedTypes.sort().join(', ')} } from './types'\n`
      : ''

    const otherComponents = new Set(extractedComponents)
    otherComponents.delete(compName)
    const referencedComponents = findReferencedNames(declaration, otherComponents)
    const siblingImportBlock = referencedComponents.length > 0
      ? referencedComponents.sort().map(name => `import { ${name} } from './${name}'`).join('\n') + '\n'
      : ''

    const referencedUtils = findReferencedNames(declaration, utilityFunctions)
    const utilsImport = referencedUtils.length > 0
      ? `import { ${referencedUtils.sort().join(', ')} } from './utils'\n`
      : ''

    const content = `// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ${compName} [Expo]
// Source: @arkzen:native:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${normalisedCanonicalBlock}
${constantsImport}${hooksImport}${utilsImport}${typesImport}${siblingImportBlock}
${exportedDeclaration}
`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Expo Router] ✓ Native component: ${fileName}`)
  }

  // ── Clean up stale files ───────────────────────────────────────────────────
  try {
    const files = fs.readdirSync(componentsDir)
    for (const file of files) {
      const base = file.replace(/\.(tsx|ts)$/, '')
      if (['hooks.ts','hooks.tsx','types.ts','constants.ts','constants.tsx','utils.ts','utils.tsx'].includes(file)) continue
      if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !extractedComponents.has(base)) {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen Expo Router] 🧹 Removed stale native component: ${file}`)
      }
    }
  } catch (e) {
    // ignore
  }
}

// ─── Screen file generator ────────────────────────────────────────────────────
// v4.0: no longer inlines nativeComponents — imports each component individually.

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

  // ── Resolve imports from page source ONLY ─────────────────────────────────
  const pageSources = [page.raw.trim()]

  const animImportLine = tatemono.nativeAnimationRN
    ? `import { ${extractExportNames(tatemono.nativeAnimationRN.raw).join(', ')} } from '../../arkzen/generated/${tatName}.native-animations'`
    : ''

  const styleImportLine = (tatemono.nativeStyles && tatemono.nativeStyles.length > 0)
    ? `import { s } from '../../arkzen/generated/${tatName}.native-styles'`
    : ''

  // Per-component imports — one import line per component file
  const nativeComponentNames = extractNativeComponentNames(tatemono)
  const componentImportLines = [...nativeComponentNames]
    .sort()
    .map(name => `import { ${name} } from './components/${name}'`)
    .join('\n')

  // Smart imports for constants / hooks / utils / types this screen references
  const pageStrippedForRefs = stripTemplateLiterals(page.raw)

  const sharedConstants    = extractNativeSharedConstantNames(tatemono)
  const referencedConstants = findReferencedNames(pageStrippedForRefs, sharedConstants)
  const constantsImportLine = referencedConstants.length > 0
    ? `import { ${referencedConstants.sort().join(', ')} } from './components/constants'`
    : ''

  const customHooks       = extractNativeCustomHookNames(tatemono)
  const referencedHooks   = findReferencedNames(pageStrippedForRefs, customHooks)
  const hooksImportLine   = referencedHooks.length > 0
    ? `import { ${referencedHooks.sort().join(', ')} } from './components/hooks'`
    : ''

  const utilityFunctions  = extractNativeUtilityFunctionNames(tatemono)
  const referencedUtils   = findReferencedNames(pageStrippedForRefs, utilityFunctions)
  const utilsImportLine   = referencedUtils.length > 0
    ? `import { ${referencedUtils.sort().join(', ')} } from './components/utils'`
    : ''

  const sharedTypes       = extractNativeSharedTypeNames(tatemono)
  const referencedTypes   = findReferencedNames(pageStrippedForRefs, sharedTypes)
  const typesImportLine   = referencedTypes.length > 0
    ? `import type { ${referencedTypes.sort().join(', ')} } from './components/types'`
    : ''

  const extraLines = [
    layoutImport,
    animImportLine,
    styleImportLine,
    componentImportLines,
    constantsImportLine,
    hooksImportLine,
    utilsImportLine,
    typesImportLine,
  ].filter(Boolean).join('\n')

  const referencedHookCalls = findReferencedNames(pageStrippedForRefs, REACT_HOOKS)

  let { canonicalBlock, strippedSources } = resolveImports(pageSources, {
    extra: extraLines,
    reactHooks: referencedHookCalls,
  })

  // ── Merge engine-required imports ─────────────────────────────────────────
  const referencedRNCore = findReferencedNames(pageStrippedForRefs, RN_CORE_COMPONENTS)
  canonicalBlock = ensureReactNativeImport(canonicalBlock, Array.from(new Set(['ScrollView', ...referencedRNCore])))
  canonicalBlock = ensureExpoRouterImport(canonicalBlock)
  canonicalBlock = ensureStatusBarImport(canonicalBlock)
  const referencedAuthStoreExports = findReferencedNames(pageStrippedForRefs, AUTH_STORE_EXPORTS)
  canonicalBlock = ensureAuthStoreImports(canonicalBlock, referencedAuthStoreExports)
  if (!/from ['"]react-native-safe-area-context['"]/.test(canonicalBlock)) {
    canonicalBlock += `\nimport { SafeAreaView } from 'react-native-safe-area-context'`
  }

  canonicalBlock = normaliseNativeImports(canonicalBlock)

  let userCode = strippedSources[0]
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()

  let componentName: string
  let componentDefinition: string

  const constMatch = userCode.match(/^(const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:\(\))?\s*=>\s*\{[\s\S]*\})/m)
  const funcMatch  = userCode.match(/^(function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(\s*\)\s*\{[\s\S]*\})/m)

  if (constMatch) {
    componentName = constMatch[2]
    componentDefinition = constMatch[1]
  } else if (funcMatch) {
    componentName = funcMatch[2]
    componentDefinition = funcMatch[1]
  } else {
    componentName = toPascalCase(page.name) + 'Content'
    componentDefinition = `const ${componentName} = () => (\n  ${userCode}\n)`
  }

  const wrapperName = `ArkzenScreen_${toPascalCase(tatName)}_${toPascalCase(page.name)}`

  return `// ============================================================
// ARKZEN GENERATED SCREEN — ${tatName}/${page.name}
// ============================================================

${canonicalBlock}

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

// ─── Route registry ────────────────────────────────────────────────────────────

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
// ARKZEN GENERATED — Expo Route Registry v4.0
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

// ─── Write-if-changed ──────────────────────────────────────────────────────────

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

  // Only handler code — components are now imported per-file
  const { canonicalBlock, strippedSources } = resolveImports([handler.raw.trim()])
  let cb = ensureReactNativeImport(canonicalBlock, ['View', 'Text', 'TouchableOpacity'])
  cb = ensureExpoRouterImport(cb)
  cb = normaliseNativeImports(cb)

  // Build component imports for any native components referenced in the handler
  const nativeComponentNames = extractNativeComponentNames(tatemono)
  const handlerStripped = stripTemplateLiterals(handler.raw)
  const referencedComponents = findReferencedNames(handlerStripped, nativeComponentNames)
  const componentImportLines = referencedComponents.length > 0
    ? referencedComponents.sort()
        .map(name => `import { ${name} } from '@/screens/${tatName}/components/${name}'`)
        .join('\n') + '\n'
    : ''

  const handlerCode = strippedSources[0]
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()

  return `// ============================================================
// ARKZEN EXPO ROUTE — ${tatName}/+not-found
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

${cb}
${componentImportLines}
${handlerCode}

export default NativeNotFoundScreen
`
}

// ─── Error boundary file generator ────────────────────────────────────────────

function generateErrorBoundaryFile(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const tatName = tatemono.meta.name

  const { canonicalBlock, strippedSources } = resolveImports([handler.raw.trim()])
  let cb = ensureReactNativeImport(canonicalBlock, ['View', 'Text', 'TouchableOpacity'])
  cb = ensureExpoRouterImport(cb)
  cb = normaliseNativeImports(cb)

  // Build component imports for any native components referenced in the handler
  const nativeComponentNames = extractNativeComponentNames(tatemono)
  const handlerStripped = stripTemplateLiterals(handler.raw)
  const referencedComponents = findReferencedNames(handlerStripped, nativeComponentNames)
  const componentImportLines = referencedComponents.length > 0
    ? referencedComponents.sort()
        .map(name => `import { ${name} } from './components/${name}'`)
        .join('\n') + '\n'
    : ''

  const handlerCode = strippedSources[0]
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()

  return `// ============================================================
// ARKZEN EXPO SCREEN — ${tatName}/error-boundary
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

${cb}
${componentImportLines}
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

// ─── Native animation file generator ──────────────────────────────────────────

function generateNativeAnimationFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.nativeAnimationRN) return null

  const { strippedSources } = resolveImports([tatemono.nativeAnimationRN.raw])
  const clean = strippedSources[0]
    .replace(/\*\/\s*$/, '')
    .trim()

  if (!clean) return null

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

// ─── Custom layout generator ───────────────────────────────────────────────────

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

// ─── Register / Unregister ─────────────────────────────────────────────────────

export function registerExpoScreens(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name

  const screenDir = path.join(SRC_SCREENS_DIR, tatName)
  const appDir    = path.join(APP_DIR, tatName)
  ensureDir(screenDir)
  ensureDir(appDir)

  // v4.0: per-file native component generation
  generateIndividualNativeComponentFiles(tatemono, screenDir)

  // v3.5: emit native styles
  emitNativeStyles(tatName, tatemono.nativeStyles ?? [], GENERATED_DIR, 'Arkzen Expo Router')

  // Distribute tatemono assets
  const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
  const assetsPath   = path.join(tatemonosDir, tatName, 'assets')
  const hasAssets    = copyAssetsToExpo(tatName, assetsPath, EXPO_ASSETS_DIR)
  if (!hasAssets) {
    console.log(`[Arkzen Expo Router] No assets folder for ${tatName}`)
  }

  // v3.4: generate native animation file if present
  if (tatemono.nativeAnimationRN) {
    ensureDir(GENERATED_DIR)
    const animContent = generateNativeAnimationFile(tatemono)
    if (animContent) {
      const animPath = path.join(GENERATED_DIR, `${tatName}.native-animations.ts`)
      writeIfChanged(animPath, animContent)
      console.log(`[Arkzen Expo Router] ✓ Native animation file generated: ${tatName}.native-animations.ts`)
    }
  }

  // v3.5: generate custom native layouts
  generateCustomLayouts(tatemono)

  const existingRoutes = readExistingRoutes().filter(r => r.tatName !== tatName)
  const newRoutes: ExpoRoute[] = []

  for (const page of tatemono.nativePages) {
    const screenName = page.name
    const routePath  = screenName === 'index' ? `/${tatName}` : `/${tatName}/${screenName}`
    const layout     = page.layout ?? 'default'

    writeIfChanged(path.join(screenDir, `${screenName}.tsx`), generateScreenFile(tatemono, page))
    writeIfChanged(path.join(appDir,    `${screenName}.tsx`), generateExpoRouteFile(tatName, screenName, (tatemono.nativeErrorHandlers ?? []).some(h => h.type === '500')))

    newRoutes.push({ tatName, screenName, routePath, layout, auth: tatemono.meta.auth && layout === 'auth' })
    console.log(`[Arkzen Expo Router] ✓ ${routePath} [${layout}]`)
  }

  // v3.3: error handlers
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

  cleanExpoAssets(tatName, EXPO_ASSETS_DIR)

  const animPath = path.join(GENERATED_DIR, `${tatName}.native-animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.unlinkSync(animPath)
    console.log(`[Arkzen Expo Router] ✓ Removed native animation file: ${tatName}.native-animations.ts`)
  }

  writeRouteRegistry(readExistingRoutes().filter(r => r.tatName !== tatName))
  console.log(`[Arkzen Expo Router] ✓ Route registry updated`)
}
