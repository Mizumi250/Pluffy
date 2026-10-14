// ============================================================
// ARKZEN ENGINE — EXPO ROUTER v4.7
//
// v4.7 – New Expo-specific DSL syntax support.
//        The native platform table now uses stack-split DSL markers.
//        Expo stack:
//          page      — @arkzen:native:page:name + @arkzen:import:expo  (embedded)
//          layout    — @arkzen:native:layout:name + @arkzen:import:expo
//          component — @arkzen:native:components:name + @arkzen:import:expo
//          error 404 — @arkzen:native:error:404 + @arkzen:import:expo
//          error 500 — @arkzen:native:error:500 + @arkzen:import:expo
//          animation — @arkzen:native:animation:expo  (was :rn for Expo too)
//          script (global) — @arkzen:native:script:expo
//          script (named)  — @arkzen:native:script:expo:name
//        The parser already strips @arkzen:import:expo from block bodies and
//        re-embeds it as /* @arkzen:resolved:import expo */ so builders can
//        detect the target stack without new type fields.
//        Changes in v4.7:
//          • generateNativeAnimationFile() now uses nativeAnimationExpo first,
//            falling back to nativeAnimationRN for backward compatibility.
//          • registerExpoScreens() checks nativeAnimationExpo first too.
//          • generateScreenFile() animImportLine reads nativeAnimationExpo
//            (fallback nativeAnimationRN) — comment source tag updated.
//          • isExpoTargeted() helper added — returns true for blocks that carry
//            /* @arkzen:resolved:import expo */ OR no import marker at all
//            (backward compat for old tatemonos that predate the import line).
//          • nativePages / nativeComponents / nativeLayouts / nativeErrorHandlers
//            now filtered through isExpoTargeted() so RN-only blocks
//            (/* @arkzen:resolved:import rn */) are skipped by Expo builder.
//            Blocks with no marker still pass (backward compat).
//          • generateNativeScriptFile() added — writes nativeScriptExpo to
//            src/arkzen/generated/{name}.native-script.expo.ts.
//            registerExpoScreens() writes it when nativeScriptExpo is present.
//
// v4.6 – FIX: same class of bug as v4.5, for @arkzen:native:style. The `s`
//        styles object is exported from
//        src/arkzen/generated/{tatName}.native-styles.ts and was only
//        imported into the SCREEN file via styleImportLine. Per-component
//        files (EntranceSection.tsx, DemoCard.tsx, etc.) reference `s.xxx`
//        directly with no import — "ReferenceError: Property 's' doesn't
//        exist". generateIndividualNativeComponentFiles() now checks
//        whether each component's declaration references the identifier
//        `s` and, if so, adds
//        `import { s } from '../../../arkzen/generated/{tatName}.native-styles'`
//        (same 3-level-up path as the v4.5 animation hooks fix).
//
// v4.5 – FIX: per-component files couldn't see hooks declared in
//        @arkzen:native:animation:rn (e.g. useFadeIn, useSlideUp,
//        useScaleBloom). Those hooks are exported from
//        src/arkzen/generated/{tatName}.native-animations.ts and were only
//        imported into the SCREEN file (index.tsx) via animImportLine.
//        Per-component files like EntranceSection.tsx call these hooks
//        directly with no import of their own — in the old single-file
//        generation they shared module scope with the screen, so this
//        worked; after the v4.0 per-file split it became
//        "ReferenceError: Property 'useFadeIn' doesn't exist".
//        generateIndividualNativeComponentFiles() now extracts animation
//        hook export names via extractExportNames(nativeAnimationRN.raw),
//        and any component file referencing one of them gets
//        `import { useFadeIn, ... } from '../../../arkzen/generated/{tatName}.native-animations'`
//        (3 levels up from src/screens/{tat}/components/).
//
// v4.4 – FIX: stale .ts/.tsx duplicates in components/ no longer survive
//        regeneration. Earlier versions wrote constants.tsx/utils.tsx/
//        hooks.tsx/types.ts but never removed a same-named file with the
//        OTHER extension left behind by an older generation format (e.g.
//        constants.ts, utils.ts from before per-file splitting switched to
//        .tsx). The final cleanup loop also explicitly whitelisted both
//        extensions of these names, so it never removed them either.
//        Metro resolves .ts before .tsx, so a stale utils.ts would shadow
//        the correct utils.tsx — serving an apiFetch with no `export`
//        keyword and missing its BACKEND_URL/FormState imports, causing
//        screens like inventory-management to fail with
//        "Failed to load inventory" at runtime (ReferenceError inside
//        apiFetch, swallowed by the screen's try/catch).
//        Each of constants/hooks/utils/types now deletes its sibling
//        extension whenever it writes or determines the file should not
//        exist.
//
// v4.3 – FIX: a name that exists in BOTH RN_CORE_COMPONENTS (e.g. 'Image')
//        and an explicit @arkzen:native:components import from a different
//        module (e.g. `import { Image } from 'expo-image'`) was being added
//        to engineNamed['react-native'] AND engineNamed['expo-image'] —
//        producing two `Image` declarations and a Babel "Identifier has
//        already been declared" error. Now namedImportsByModule is computed
//        first; any RN_CORE_COMPONENTS name explicitly claimed by another
//        module's import is excluded from the react-native engineNamed
//        entry, so the explicit import wins.
//
// v4.2 – FIX: extractNativeNamedImportsByModule() and
//        extractNativeNamespaceImports() now normalise @/arkzen/* module
//        specifiers to ../../../arkzen/* at extraction time (and again
//        defensively where their results are merged into engineNamed).
//        Previously, the components-block authStore import
//        ('@/arkzen/core/stores/authStore') and the engineNamed-seeded
//        authStore entry ('../../../arkzen/core/stores/authStore') were
//        treated as two distinct importMap keys, producing two duplicate
//        `import { useAuthStore } from '...'` lines and a Babel
//        "Identifier has already been declared" error. Now both collapse
//        to one canonical key before resolveImports ever sees them.
//
// v4.1 – UNIFIED IMPORT RESOLUTION (mirrors nextjs/router.ts architecture).
//        resolveImports() now accepts engineNamed (module→named[]) and
//        engineNamespaces (alias→module) so ALL engine-required imports
//        (react-native core, expo-router, expo-status-bar, safe-area,
//        authStore, namespace imports) flow through the single importMap
//        dedup pass — eliminating the post-processing ensure*() chain that
//        produced concatenated import lines (missing newlines) and duplicate
//        identifiers.
//        normaliseMod() inside resolveImports() canonicalises @/arkzen/*
//        paths from tatemono source to ../../../arkzen/* before they hit
//        importMap, so user-written @/ alias imports and engine-seeded
//        relative-path imports collapse to the same key and emit one line.
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
import type { ParsedTatemono, ArkzenPage, ArkzenLayout, ArkzenErrorHandler } from '../types'
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
    // module → named exports that the engine always needs, e.g.
    //   { 'react-native': ['KeyboardAvoidingView', 'ScrollView', 'View'] }
    engineNamed?: Record<string, string[]>
    // namespace alias → module, e.g.
    //   { DocumentPicker: 'expo-document-picker' }
    engineNamespaces?: Record<string, string>
    extra?: string
  } = {}
): ResolvedImports {
  const importMap = new Map<string, { defaultImport?: string; named: Set<string> }>()
  const getEntry = (mod: string) => {
    if (!importMap.has(mod)) importMap.set(mod, { named: new Set() })
    return importMap.get(mod)!
  }

  // v10.7 FIX: a tatemono author can write a literal `import { X } from 'mod'`
  // directly inside their own page/layout/component/error block body (not
  // just via @arkzen:native:components). Previously only components-block
  // imports were checked against engineNamed seeds (see
  // `explicitlyImportedNames` below) — a name imported by hand inside the
  // page's own import:expo/import:rn section was invisible to that guard,
  // so e.g. a user-written `import { StatusBar } from 'react-native'`
  // could still collide with the engine's hardcoded
  // `expo-status-bar` → StatusBar seed, producing two import statements
  // declaring the same identifier ("Identifier has already been declared").
  // Fix: pre-scan the raw sources for every literal named import BEFORE
  // engineNamed is seeded, and skip seeding any (name, otherModule) pair
  // the user has already explicitly claimed for a different module — the
  // user's own written import always wins.
  const rawNamedImportRe = /^\s*import\s+(?:[A-Za-z_$][A-Za-z0-9_$]*\s*,\s*)?\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  const rawDefaultImportRe = /^\s*import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:,\s*\{[^}]*\})?\s+from\s+['"]([^'"]+)['"]\s*;?/
  const explicitRawImports = new Map<string, string>() // name → module
  for (const source of sources) {
    for (const rawLine of flattenMultilineImports(source).split('\n')) {
      const line = rawLine.trim()
      const defaultMatch = line.match(rawDefaultImportRe)
      if (defaultMatch && defaultMatch[1] !== 'React') {
        const mod = defaultMatch[2].replace(/^@\/arkzen\//, '../../../arkzen/')
        if (!explicitRawImports.has(defaultMatch[1])) {
          explicitRawImports.set(defaultMatch[1], mod)
        }
      }

      const m = line.match(rawNamedImportRe)
      if (!m) continue
      const [, namedStr, rawMod] = m
      const mod = rawMod.replace(/^@\/arkzen\//, '../../../arkzen/')
      namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
        if (n !== 'React' && !explicitRawImports.has(n)) explicitRawImports.set(n, mod)
      })
    }
  }

  const reactEntry = getEntry('react')
  ;(engineRequired.reactHooks ?? []).forEach(h => reactEntry.named.add(h))

  // Seed engine-required named imports (e.g. react-native core components,
  // expo-router, expo-status-bar, react-native-safe-area-context).
  for (const [mod, names] of Object.entries(engineRequired.engineNamed ?? {})) {
    const entry = getEntry(mod)
    names.forEach(n => {
      const claimedBy = explicitRawImports.get(n)
      if (claimedBy && claimedBy !== mod) return // user's own literal import wins
      entry.named.add(n)
    })
  }

  // Seed engine-required namespace imports (e.g. import * as DocumentPicker from '...')
  for (const [ns, mod] of Object.entries(engineRequired.engineNamespaces ?? {})) {
    getEntry(mod).defaultImport = `* as ${ns}`
  }

  // Normalise module specifiers so @/arkzen/* paths (written by tatemono
  // authors) collapse to the same importMap key as the relative
  // ../../../arkzen/* paths that engineNamed uses.  Without this, a page
  // block that writes `import { useAuthStore } from '@/arkzen/core/stores/authStore'`
  // and the engineNamed entry keyed on '../../../arkzen/core/stores/authStore'
  // end up as two separate entries → two duplicate import lines.
  const normaliseMod = (mod: string): string =>
    mod.replace(/^@\/arkzen\//, '../../../arkzen/')

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
        const [, def, namedStr, rawMod] = m
        const mod = normaliseMod(rawMod)
        const entry = getEntry(mod)
        if (mod !== 'react') entry.defaultImport = def
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      m = line.match(namespaceImportRe)
      if (m) {
        const [, ns, rawMod] = m
        getEntry(normaliseMod(rawMod)).defaultImport = `* as ${ns}`
        continue
      }

      m = line.match(namedImportRe)
      if (m) {
        const [, namedStr, rawMod] = m
        const mod = normaliseMod(rawMod)
        const entry = getEntry(mod)
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') entry.named.add(n)
        })
        continue
      }

      m = line.match(defaultImportRe)
      if (m) {
        const [, def, rawMod] = m
        const mod = normaliseMod(rawMod)
        if (mod === 'react') continue
        getEntry(mod).defaultImport = def
        continue
      }

      m = line.match(sideEffectRe)
      if (m) {
        sideEffects.push(`import '${normaliseMod(m[1])}'`)
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
  const expoComponents = (tatemono.nativeComponents ?? []).filter(c => isExpoTargeted(c.raw))
  for (const component of expoComponents) {
    const stripped = stripTemplateLiterals(component.raw)
    const constMatches = stripped.match(/(?:export\s+)?const\s+([A-Z][A-Za-z0-9_$]*)\s*[=:(]/g) || []
    for (const match of constMatches) {
      const name = match.match(/const\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^[A-Z0-9_]+$/.test(name)) names.add(name)
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
  for (const component of (tatemono.nativeComponents ?? []).filter(c => isExpoTargeted(c.raw))) {
    const stripped = stripTemplateLiterals(component.raw)
    const matches = stripped.match(/^(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*[=:]/gm) || []
    for (const match of matches) {
      const name = match.match(/const\s+([A-Z][A-Z0-9_]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

// Top-level destructured const declarations, e.g.:
//   const { width: SW, height: SH } = Dimensions.get('window')
// These bind multiple names from a single statement and don't fit the
// `const NAME = ...` pattern used by extractNativeSharedConstantNames, so
// splitNativeComponentDeclarations can't isolate them — they'd otherwise be
// silently absorbed into whichever chunk happens to follow them in source
// order. We extract the whole statement verbatim and surface every bound
// name so per-component import resolution (./constants) can pick them up.
function extractNativeDestructuredConstants(tatemono: ParsedTatemono): { names: Set<string>; statements: string[] } {
  const names = new Set<string>()
  const statements: string[] = []
  const seen = new Set<string>()

  for (const component of (tatemono.nativeComponents ?? []).filter(c => isExpoTargeted(c.raw))) {
    const stripped = stripTemplateLiterals(component.raw)
    const lines = stripped.split('\n')
    const re = /^(?:export\s+)?const\s*\{([^}]*)\}\s*=\s*[^;\n]+;?\s*$/

    lines.forEach((line, idx) => {
      const m = line.match(re)
      if (!m) return
      if (seen.has(line.trim())) return
      seen.add(line.trim())

      const bindings = m[1].split(',').map(s => s.trim()).filter(Boolean)
      for (const binding of bindings) {
        // handle `width: SW` (rename) and plain `SW` shorthand
        const bound = binding.includes(':') ? binding.split(':')[1].trim() : binding
        const cleanName = bound.split('=')[0].trim() // drop default values
        if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cleanName)) names.add(cleanName)
      }

      statements.push(line.trim())
    })
  }

  return { names, statements }
}

// Namespace imports declared in @arkzen:native:components blocks, e.g.:
//   import * as DocumentPicker from 'expo-document-picker'
//   import * as ImagePicker    from 'expo-image-picker'
//   import * as FileSystem     from 'expo-file-system/legacy'
//   import * as Sharing        from 'expo-sharing'
// Pre-v4.0, all generated code shared one scope so @arkzen:native:page blocks
// could freely call DocumentPicker.getDocumentAsync(...) etc. without their
// own import. Per-file generation split components out, but page blocks
// still reference these namespaces — so generateScreenFile must detect such
// references and inject the matching `import * as X from 'mod'` itself.
function extractNativeNamespaceImports(tatemono: ParsedTatemono): Map<string, string> {
  const out = new Map<string, string>() // namespace identifier -> module specifier
  const re = /^import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/m

  for (const component of (tatemono.nativeComponents ?? []).filter(c => isExpoTargeted(c.raw))) {
    const stripped = stripTemplateLiterals(component.raw)
    for (const rawLine of stripped.split('\n')) {
      const line = rawLine.trim()
      if (!line.startsWith('import ')) continue
      const m = line.match(re)
      if (m) out.set(m[1], m[2].replace(/^@\/arkzen\//, '../../../arkzen/'))
    }
  }
  return out
}

// Named imports declared in @arkzen:native:components blocks, e.g.:
//   import { Mail, Send, XCircle } from 'lucide-react-native'
// Same root cause as namespace imports above: page blocks may reference
// names (icons, helpers, etc.) that are only imported in the components
// block. extractNativeComponentNames/extractNative*Names only track local
// declarations (const/function/type), not re-exported third-party imports —
// so a name like `Mail` from lucide-react-native falls through every
// existing check. This maps module -> Set<importedName> so generateScreenFile
// can detect references and inject `import { Mail } from 'lucide-react-native'`.
function extractNativeNamedImportsByModule(tatemono: ParsedTatemono): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>() // module specifier -> named imports
  const namedImportRe = /^import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  const mixedImportRe = /^import\s+[A-Za-z_$][A-Za-z0-9_$]*\s*,\s*\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/

  for (const component of (tatemono.nativeComponents ?? []).filter(c => isExpoTargeted(c.raw))) {
    const flattened = flattenMultilineImports(stripTemplateLiterals(component.raw))
    for (const rawLine of flattened.split('\n')) {
      const line = rawLine.trim()
      if (!line.startsWith('import ')) continue

      let m = line.match(mixedImportRe) ?? line.match(namedImportRe)
      if (!m) continue

      const [, namedStr, rawMod] = m
      // Normalise @/arkzen/ aliases so this map's keys always match the
      // canonical relative paths used in engineNamed — prevents two separate
      // entries (and thus two duplicate import lines) for the same module.
      const mod = rawMod.replace(/^@\/arkzen\//, '../../../arkzen/')
      if (!out.has(mod)) out.set(mod, new Set())
      const entry = out.get(mod)!
      namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
        if (n !== 'React') entry.add(n.split(/\s+as\s+/)[0].trim())
      })
    }
  }
  return out
}

function extractNativeCustomHookNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of (tatemono.nativeComponents ?? []).filter(c => isExpoTargeted(c.raw))) {
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
  for (const component of (tatemono.nativeComponents ?? []).filter(c => isExpoTargeted(c.raw))) {
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
  for (const component of (tatemono.nativeComponents ?? []).filter(c => isExpoTargeted(c.raw))) {
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
  'Platform', 'Dimensions', 'StyleSheet', 'Alert', 'Linking', 'Animated', 'Easing',
  'Keyboard', 'RefreshControl',
])

// React hooks that @arkzen:native:page blocks may reference without their
// own 'react' import for the same reason as RN_CORE_COMPONENTS above.
const REACT_HOOKS = new Set([
  'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback',
  'useContext', 'useReducer', 'useLayoutEffect', 'useId',
  'useImperativeHandle', 'useDeferredValue', 'useTransition',
])

// authStore exports a page block may reference without its own import.
const AUTH_STORE_EXPORTS = new Set(['useAuthStore', 'useAuthStoreHydrated', 'arkzenFetch'])

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

function normaliseNativeImports(block: string): string {
  return block.replace(/from\s+'@\/arkzen\//g, `from '../../../arkzen/`)
              .replace(/from\s+"@\/arkzen\//g, `from "../../../arkzen/`)
}

// ─── Stack targeting ───────────────────────────────────────────────────────────
// v4.7: With the new DSL table, Expo/RN/Lynx blocks are identified by the
// resolved import marker the parser embeds at the top of each block body:
//   /* @arkzen:resolved:import expo */  → Expo-only
//   /* @arkzen:resolved:import rn */    → Bare RN-only
//   (no marker)                         → legacy / shared (still used by Expo)
//
// isExpoTargeted() returns true when a block should be processed by the
// Expo builder. Blocks with the RN marker are intentionally skipped.

const RESOLVED_EXPO_MARKER = '/* @arkzen:resolved:import expo */'
const RESOLVED_RN_MARKER   = '/* @arkzen:resolved:import rn */'

function isExpoTargeted(raw: string | undefined): boolean {
  if (!raw) return false
  // Explicitly Expo → include
  if (raw.includes(RESOLVED_EXPO_MARKER)) return true
  // Explicitly RN-only → exclude from Expo builder
  if (raw.includes(RESOLVED_RN_MARKER)) return false
  // No stack marker → legacy block, include for backward compat
  return true
}

function stripResolvedImportMarker(raw: string): string {
  return raw
    .replace(RESOLVED_EXPO_MARKER, '')
    .replace(RESOLVED_RN_MARKER, '')
    .trim()
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
  // v4.7: only process blocks explicitly targeting Expo (or legacy blocks with no stack marker)
  const nativeComponents = (tatemono.nativeComponents ?? []).filter(c => isExpoTargeted(c.raw))
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
  const componentImportsIcon = rawSources.some(source => /<Icon\b/.test(source))
  const componentSource = rawSources.map(stripTemplateLiterals).join('\n')
  const componentImportSources = [
    ...rawSources,
    ...(tatemono.nativePages ?? []).filter(page => isExpoTargeted(page.raw)).map(page => page.raw),
    ...(tatemono.nativeLayouts ?? []).map(layout => layout.raw),
    ...(tatemono.nativeErrorHandlers ?? []).map(handler => handler.raw),
    ...(tatemono.nativeStyleGlobal ? [tatemono.nativeStyleGlobal.raw] : []),
    ...(tatemono.nativeStyles ?? []).map(style => style.raw),
    ...(tatemono.nativeAnimationExpo
      ? [tatemono.nativeAnimationExpo.raw]
      : tatemono.nativeAnimationRN
        ? [tatemono.nativeAnimationRN.raw]
        : []),
    ...(tatemono.nativeScriptExpo ? [tatemono.nativeScriptExpo.raw] : []),
    ...(tatemono.nativeScriptsExpo ?? []).map(script => script.raw),
  ]
  const componentImports = {
    reactHooks: findReferencedNames(componentSource, REACT_HOOKS),
    engineNamed: {
      'react-native': findReferencedNames(componentSource, RN_CORE_COMPONENTS),
      ...(componentImportsIcon
        ? { '../../../arkzen/core/components/Icon': ['Icon'] }
        : {}),
    },
  }
  const { canonicalBlock, strippedSources } = resolveImports(componentImportSources, componentImports)

  // Normalise @/arkzen/* paths — components/components/index.ts is 4 levels deep:
  // src/screens/{tat}/components/{Name}.tsx → 4 levels up = expo root
  // Adjust relative path: ../../../../arkzen/...
  const normalisedCanonicalBlock = canonicalBlock
    .replace(/from\s+'@\/arkzen\//g, `from '../../../../arkzen/`)
    .replace(/from\s+"@\/arkzen\//g, `from "../../../../arkzen/`)
    .replace(/from\s+'\.\.\/\.\.\/\.\.\/arkzen\//g, `from '../../../../arkzen/`)
    .replace(/from\s+"\.\.\/\.\.\/\.\.\/arkzen\//g, `from "../../../../arkzen/`)

  const extractedComponents = extractNativeComponentNames(tatemono)
  const sharedConstants     = extractNativeSharedConstantNames(tatemono)
  const customHooks         = extractNativeCustomHookNames(tatemono)
  const sharedTypes         = extractNativeSharedTypeNames(tatemono)
  const utilityFunctions    = extractNativeUtilityFunctionNames(tatemono)
  const allDeclaredNames    = new Set([...extractedComponents, ...sharedConstants, ...customHooks, ...sharedTypes, ...utilityFunctions])

  // Animation hooks (e.g. useFadeIn, useSlideUp) declared in
  // @arkzen:native:animation:rn live in generated/{tatName}.native-animations.ts,
  // NOT in the components block — so they're absent from customHooks/
  // allDeclaredNames above. Per-component files (e.g. EntranceSection.tsx)
  // call these hooks directly without their own import, relying on the same
  // module-scope availability the original single-file generation provided.
  // Track their names so each component file can import what it uses.
  const animationBlock = tatemono.nativeAnimationExpo ?? tatemono.nativeAnimationRN
  const animationHookNames = new Set(
    animationBlock ? extractExportNames(animationBlock.raw) : []
  )

  // Same issue for @arkzen:native:style — emitted as the `s` export of
  // generated/{tatName}.native-styles.ts and referenced (e.g. `s.demoGrid`)
  // directly by components with no import of their own.
  const hasNativeStyles = !!(tatemono.nativeStyleGlobal || (tatemono.nativeStyles && tatemono.nativeStyles.length > 0))

  // Split each stripped source into per-declaration chunks
  const declarationsByName = new Map<string, string>()
  for (const stripped of strippedSources) {
    for (const [name, code] of splitNativeComponentDeclarations(stripped, allDeclaredNames)) {
      declarationsByName.set(name, code)
    }
  }

  // Top-level destructured consts (e.g. `const { width: SW, height: SH } =
  // Dimensions.get('window')`) bind names that other components reference,
  // but aren't captured by the chunk-splitting above and would otherwise be
  // silently absorbed into whichever chunk happens to follow them in source
  // order. Extract them separately, register their bound names as shared
  // constants, and strip any stray copies that leaked into other chunks.
  const { names: destructuredNames, statements: destructuredStatements } = extractNativeDestructuredConstants(tatemono)
  for (const name of destructuredNames) sharedConstants.add(name)
  if (destructuredStatements.length > 0) {
    for (const [name, code] of declarationsByName) {
      let cleaned = code
      for (const stmt of destructuredStatements) {
        cleaned = cleaned.split(stmt).join('').trim()
      }
      if (cleaned !== code) declarationsByName.set(name, cleaned)
    }
  }

  // ── Shared constants file ──────────────────────────────────────────────────
  const destructuredChunksFixed = destructuredStatements.map(stmt =>
    stmt.startsWith('export ') ? stmt : `export ${stmt}`
  )

  if (sharedConstants.size > 0 || destructuredChunksFixed.length > 0) {
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
    if (constChunks.length > 0 || destructuredChunksFixed.length > 0) {
      // constants.ts lives in components/ — one level deeper than the screen dir
      // where tatemono authors write their require() paths. Prepend one extra ../
      // to all relative require() calls so asset paths resolve correctly.
      // e.g. require('../../../assets/...') → require('../../../../assets/...')
      const fixRequireDepth = (s: string) =>
        s.replace(/require\(['"](\.\.[\/\\])/g, "require('../$1")
      const constChunksFixed      = constChunks.map(fixRequireDepth)
      const canonicalBlockFixed   = fixRequireDepth(normalisedCanonicalBlock)

      const allConstChunks = [...constChunksFixed, ...destructuredChunksFixed]
      const constSource = allConstChunks.join('\n\n')
      const referencedTypes = findReferencedNames(constSource, sharedTypes)
      const typesImport = referencedTypes.length > 0
        ? `import type { ${referencedTypes.sort().join(', ')} } from './types'\n`
        : ''

      const content = `// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — ${tatemono.meta.name} [Expo]
// Source: @arkzen:native:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlockFixed}
${typesImport}

${allConstChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'constants.tsx'), content, 'utf-8')
      console.log(`[Arkzen Expo Router] ✓ Native shared constants: constants.tsx`)

      // Remove a stale constants.ts from an earlier generation format —
      // Metro resolves .ts before .tsx, so a leftover constants.ts would
      // shadow this constants.tsx and serve outdated exports.
      const staleTs = path.join(componentsDir, 'constants.ts')
      if (fs.existsSync(staleTs)) { fs.unlinkSync(staleTs); console.log(`[Arkzen Expo Router] 🧹 Removed stale constants.ts`) }
    }
  } else {
    for (const stale of ['constants.tsx', 'constants.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Expo Router] 🧹 Removed stale ${stale}`) }
    }
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
      const hooksUseZustand = /\bcreate(?:<[^>]+>)?\s*\(/.test(hookChunksJoined)
      const zustandImport = hooksUseZustand && !/from\s+['"]zustand['"]/.test(normalisedCanonicalBlock)
        ? `import { create } from 'zustand'\n`
        : ''

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
${zustandImport}
${hookConstantsImport}${hookTypesImport}
${hookChunksJoined}
`
      fs.writeFileSync(path.join(componentsDir, 'hooks.tsx'), content, 'utf-8')
      console.log(`[Arkzen Expo Router] ✓ Native custom hooks: hooks.tsx (${[...customHooks].join(', ')})`)

      const staleTs = path.join(componentsDir, 'hooks.ts')
      if (fs.existsSync(staleTs)) { fs.unlinkSync(staleTs); console.log(`[Arkzen Expo Router] 🧹 Removed stale hooks.ts`) }
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

      // Remove a stale utils.ts from an earlier generation format — Metro
      // resolves .ts before .tsx, so a leftover utils.ts would shadow this
      // utils.tsx and serve outdated/unexported helpers (e.g. apiFetch
      // missing its `export` and its BACKEND_URL/FormState imports).
      const staleTs = path.join(componentsDir, 'utils.ts')
      if (fs.existsSync(staleTs)) { fs.unlinkSync(staleTs); console.log(`[Arkzen Expo Router] 🧹 Removed stale utils.ts`) }
    }
  } else {
    for (const stale of ['utils.tsx', 'utils.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Expo Router] 🧹 Removed stale ${stale}`) }
    }
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

      const staleTsx = path.join(componentsDir, 'types.tsx')
      if (fs.existsSync(staleTsx)) { fs.unlinkSync(staleTsx); console.log(`[Arkzen Expo Router] 🧹 Removed stale types.tsx`) }
    }
  } else {
    for (const stale of ['types.ts', 'types.tsx']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Expo Router] 🧹 Removed stale ${stale}`) }
    }
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

    // Animation hooks live in src/arkzen/generated/{tatName}.native-animations —
    // three levels up from src/screens/{tat}/components/{Name}.tsx.
    const referencedAnimationHooks = findReferencedNames(declaration, animationHookNames)
    const animationHooksImport = referencedAnimationHooks.length > 0
      ? `import { ${referencedAnimationHooks.sort().join(', ')} } from '../../../arkzen/generated/${tatemono.meta.name}.native-animations'\n`
      : ''

    // Native styles object `s` lives in src/arkzen/generated/{tatName}.native-styles —
    // same 3-level depth as animation hooks above.
    const referencesStyles = hasNativeStyles && findReferencedNames(declaration, new Set(['s'])).length > 0
    const stylesImport = referencesStyles
      ? `import { s } from '../../../arkzen/generated/${tatemono.meta.name}.native-styles'\n`
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
${constantsImport}${hooksImport}${animationHooksImport}${stylesImport}${utilsImport}${typesImport}${siblingImportBlock}
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

// ─── Native layout helpers v11.0 ──────────────────────────────────────────────
// Native layouts use a separate @arkzen:native:layout chain, parallel to web.
// Auth/Guest are built-in guards; custom layouts are resolved via parent chain.

function parseNativeLayoutDecl(raw: string): { guard?: 'auth' | 'guest'; layout?: string } {
  const t = raw.trim()
  const m = t.match(/^\+?(auth|guest)(?::([a-zA-Z0-9_-]+))?$/)
  if (m) return { guard: m[1] as 'auth' | 'guest', layout: m[2] ?? undefined }
  if (t === 'auth')  return { guard: 'auth' }
  if (t === 'guest') return { guard: 'guest' }
  if (t === 'default' || t === '') return {}
  return { layout: t || undefined }
}

function resolveNativeLayoutChain(layoutName: string, allLayouts: ArkzenLayout[]): string[] {
  const chain: string[] = []
  const visited = new Set<string>()
  let current: string | undefined = layoutName
  while (current) {
    if (visited.has(current)) throw new Error(`[Arkzen Expo Router] Native layout chain cycle at: "${current}"`)
    visited.add(current)
    chain.unshift(current)
    current = allLayouts.find(l => l.name === current)?.parent
  }
  return chain
}

function getNativeLayoutImport(layout: string, tatName: string): string {
  switch (layout) {
    case 'auth':  return `import { AuthLayout }  from '@/layouts/AuthLayout'`
    case 'guest': return `import { GuestLayout } from '@/layouts/GuestLayout'`
    default:      return `import { ${toPascalCase(layout)}Layout } from '@/arkzen/core/layouts/custom/${tatName}-${layout}'`
  }
}

function getNativeLayoutComponent(layout: string): string {
  switch (layout) {
    case 'auth':  return 'AuthLayout'
    case 'guest': return 'GuestLayout'
    default:      return `${toPascalCase(layout)}Layout`
  }
}

function buildNativeLayoutJSX(
  page: ArkzenPage,
  tatemono: ParsedTatemono
): { imports: string[]; openTags: string; closeTags: string } {
  const decl   = parseNativeLayoutDecl(page.layout ?? 'default')
  const imports: string[] = []
  const opens:   string[] = []
  const closes:  string[] = []
  const tatName  = tatemono.meta.name

  // native layouts use tatemono.nativeLayouts for chain resolution
  const nativeLayouts = (tatemono as any).nativeLayouts as ArkzenLayout[] ?? []

  if (decl.layout) {
    for (const name of resolveNativeLayoutChain(decl.layout, nativeLayouts)) {
      imports.push(getNativeLayoutImport(name, tatName))
      const comp = getNativeLayoutComponent(name)
      opens.push(`<${comp}>`)
      closes.unshift(`</${comp}>`)
    }
  }
  if (decl.guard) {
    imports.push(getNativeLayoutImport(decl.guard, tatName))
    const comp = getNativeLayoutComponent(decl.guard)
    if (decl.guard === 'auth') {
      opens.push(`<${comp} tatSlug="${tatName}" loginRoute="/${tatName}/login">`)
    } else {
      opens.push(`<${comp} tatSlug="${tatName}" dashboardRoute="/${tatName}/dashboard">`)
    }
    closes.unshift(`</${comp}>`)
  }
  return { imports, openTags: opens.join('\n      '), closeTags: closes.join('\n      ') }
}

// ─── Screen file generator ────────────────────────────────────────────────────
// v4.0: no longer inlines nativeComponents — imports each component individually.

function generateScreenFile(tatemono: ParsedTatemono, page: ArkzenPage): string {
  const tatName  = tatemono.meta.name
  const { imports: nativeLayoutImports, openTags: layoutOpen, closeTags: layoutClose } = buildNativeLayoutJSX(page, tatemono)
  const layoutImport = nativeLayoutImports.join('\n')

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
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
${layoutImport}

export function ${wrapperName}() {
  setActiveTatemono('${tatName}')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ArkzenStatusBar style="dark" />
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

  // ── Resolve imports from ALL native sources ──────────────────────────────
const allSources = [
  page.raw.trim(),
  ...(tatemono.nativePages || []).map(p => p.raw.trim()),
  ...(tatemono.nativeComponents || []).map(c => c.raw.trim()),
  ...(tatemono.nativeLayouts || []).map(l => l.raw.trim()),
  ...(tatemono.nativeErrorHandlers || []).map(e => e.raw.trim()),
  ...(tatemono.nativeStyleGlobal ? [tatemono.nativeStyleGlobal.raw.trim()] : []),
  ...(tatemono.nativeStyles || []).map(s => s.raw.trim()),
  ...(tatemono.nativeAnimationExpo ? [tatemono.nativeAnimationExpo.raw.trim()] : []),
  ...(tatemono.nativeScriptExpo ? [tatemono.nativeScriptExpo.raw.trim()] : []),
  ...(tatemono.nativeScriptsExpo || []).map(s => s.raw.trim()),
].filter(Boolean)

  // v4.7: prefer Expo-specific animation block; fall back to :rn block for legacy tatemonos
  const animBlock = tatemono.nativeAnimationExpo ?? tatemono.nativeAnimationRN
  const animImportLine = animBlock
    ? `import { ${extractExportNames(animBlock.raw).join(', ')} } from '../../arkzen/generated/${tatName}.native-animations'`
    : ''

  const styleImportLine = (tatemono.nativeStyleGlobal || (tatemono.nativeStyles && tatemono.nativeStyles.length > 0))
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
    ...nativeLayoutImports,
    `import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'`,
    animImportLine,
    styleImportLine,
    componentImportLines,
    constantsImportLine,
    hooksImportLine,
    utilsImportLine,
    typesImportLine,
  ].filter(Boolean).join('\n')

  const referencedHookCalls = findReferencedNames(pageStrippedForRefs, REACT_HOOKS)

  // ── Named imports explicitly declared in @arkzen:native:components ─────────
  // Compute this BEFORE rnRequired: if the tatemono explicitly imports a name
  // from a non-react-native module (e.g. `import { Image } from 'expo-image'`),
  // that import wins — the name must NOT also be guessed into react-native's
  // engineNamed entry, or both modules would declare the same identifier and
  // Babel throws "Identifier has already been declared".
  const namedImportsByModule = extractNativeNamedImportsByModule(tatemono)
  const explicitlyImportedNames = new Set<string>()
  for (const [mod, names] of namedImportsByModule) {
    if (mod === 'react-native') continue
    const referencedNamed = findReferencedNames(pageStrippedForRefs, names)
    referencedNamed.forEach(n => explicitlyImportedNames.add(n))
  }

  // ── Collect all engine-required named imports into one map ─────────────────
  // react-native core components the page references (ScrollView always
  // included), excluding any name an explicit non-RN import already claims.
  const referencedRNCore = findReferencedNames(pageStrippedForRefs, RN_CORE_COMPONENTS)
    .filter(n => !explicitlyImportedNames.has(n))
  const rnRequired = Array.from(new Set(['ScrollView', ...referencedRNCore]))

  // expo-router: always inject useRouter
  const expoRouterNamed = ['useRouter']

  // expo-status-bar: always inject StatusBar
  const expoStatusBarNamed: string[] = []

  // react-native-safe-area-context: always inject SafeAreaView
  const safeAreaNamed = ['SafeAreaView']

  // authStore named exports
  const referencedAuthStoreExports = findReferencedNames(pageStrippedForRefs, AUTH_STORE_EXPORTS)
  const authStoreNamed = Array.from(new Set(['setActiveTatemono', ...referencedAuthStoreExports]))

  // Namespace imports declared only in @arkzen:native:components
  const namespaceImports    = extractNativeNamespaceImports(tatemono)
  const referencedNamespaces = findReferencedNames(pageStrippedForRefs, new Set(namespaceImports.keys()))
  const engineNamespaces: Record<string, string> = {}
  for (const ns of referencedNamespaces) {
    engineNamespaces[ns] = namespaceImports.get(ns)!
  }

  // Named imports from components block (e.g. lucide-react-native icons,
  // expo-image's Image, etc.)
  const engineNamed: Record<string, string[]> = {
    'react-native':                    rnRequired,
    'expo-router':                     expoRouterNamed,
    'expo-status-bar':                 expoStatusBarNamed,
    'react-native-safe-area-context':  safeAreaNamed,
    '../../../arkzen/core/stores/authStore': authStoreNamed,
  }
  const declaresIcon = /^(?:export\s+)?(?:const|function|class)\s+Icon\b/m.test(pageStrippedForRefs)
  if (!declaresIcon && findReferencedNames(pageStrippedForRefs, new Set(['Icon'])).length > 0) {
    engineNamed['../../../arkzen/core/components/Icon'] = ['Icon']
  }
  for (const [rawMod, names] of namedImportsByModule) {
    const mod = rawMod.replace(/^@\/arkzen\//, '../../../arkzen/')
    const referencedNamed = findReferencedNames(pageStrippedForRefs, names)
    if (referencedNamed.length > 0) {
      engineNamed[mod] = Array.from(new Set([...(engineNamed[mod] ?? []), ...referencedNamed]))
    }
  }

  let { canonicalBlock, strippedSources } = resolveImports(allSources, {
    extra: extraLines,
    reactHooks: referencedHookCalls,
    engineNamed,
    engineNamespaces,
  })

  canonicalBlock = normaliseNativeImports(canonicalBlock)

  let userCode = strippedSources[0]
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()

  let componentName: string
  let componentDefinition: string

  // Find the last PascalCase top-level const or function — this is the component to mount.
  // Always use full userCode as componentDefinition so helper consts (e.g. NATIVE_PAGES,
  // WEB_PAGES) defined above the component are preserved and in scope.
  const pascalConstMatches = [...userCode.matchAll(/^(?:export\s+)?const\s+([A-Z][A-Za-z0-9_$]*)\s*(?::[^=]*)?\s*=/gm)]
  const pascalFuncMatches  = [...userCode.matchAll(/^(?:export\s+)?function\s+([A-Z][A-Za-z0-9_$]*)\s*[(<]/gm)]
  const allPascalNames     = [...pascalConstMatches, ...pascalFuncMatches]
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  const lastPascal         = allPascalNames[allPascalNames.length - 1]

  if (lastPascal) {
    componentName       = lastPascal[1]
    componentDefinition = userCode
  } else {
    componentName       = toPascalCase(page.name) + 'Content'
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
      <ArkzenStatusBar style="dark" />
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

// ─── Root redirect generator ───────────────────────────────────────────────────

// v4.7: accepts expoPages (already filtered to Expo-targeted) instead of reading
//       tatemono.nativePages directly — avoids showing RN-only pages in Expo routes.
function resolveExpoRootRedirectTarget(tatemono: ParsedTatemono, expoPages?: ArkzenPage[]): ArkzenPage | null {
  const pages = expoPages ?? tatemono.nativePages
  const hasIndex = pages.some(p => p.name === 'index')
  if (hasIndex) return null

  const firstGuest = pages.find(p => p.layout === 'guest')
  const firstAuth  = pages.find(p => p.layout === 'auth')
  const firstPage  = pages[0]

  const target = tatemono.meta.auth
    ? (firstGuest ?? firstAuth ?? firstPage)
    : (firstAuth ?? firstGuest ?? firstPage)

  return target ?? null
}

function generateExpoRootRedirectFile(tatName: string, destination: string): string {
  return `// ============================================================
// ARKZEN EXPO ROUTE — ${tatName}/index (root redirect)
// Visiting /${tatName} redirects to ${destination}
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { Redirect } from 'expo-router'

export default function ArkzenRootRedirect() {
  return <Redirect href="${destination}" />
}
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

function getNativeErrorComponent(source: string, preferredName: string): string {
  const declarations = [...source.matchAll(
    /^(?:export\s+)?(?:const|function)\s+([A-Z][A-Za-z0-9_$]*)\b/gm,
  )]
    .map(match => match[1])
    .filter(name => !/^[A-Z0-9_]+$/.test(name))

  return declarations.includes(preferredName)
    ? preferredName
    : declarations[declarations.length - 1] ?? preferredName
}

// ─── Not-found file generator (+not-found.tsx) ────────────────────────────────

function generateNotFoundFile(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const tatName = tatemono.meta.name

  // Only handler code — components are now imported per-file
  const { canonicalBlock: rawCb, strippedSources } = resolveImports([handler.raw.trim()], {
    engineNamed: {
      'react-native': ['View', 'Text', 'TouchableOpacity'],
      'expo-router':  ['useRouter'],
    },
  })
  const cb = normaliseNativeImports(rawCb)

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
  const notFoundComponent = getNativeErrorComponent(handlerCode, 'NativeNotFoundScreen')

  return `// ============================================================
// ARKZEN EXPO ROUTE — ${tatName}/+not-found
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

${cb}
${componentImportLines}
${handlerCode}

export default ${notFoundComponent}
`
}

// ─── Error boundary file generator ────────────────────────────────────────────

function generateErrorBoundaryFile(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const tatName = tatemono.meta.name

  const { canonicalBlock: rawCb, strippedSources } = resolveImports([handler.raw.trim()], {
    engineNamed: {
      'react-native': ['View', 'Text', 'TouchableOpacity'],
      'expo-router':  ['useRouter'],
    },
  })
  const cb = normaliseNativeImports(rawCb)

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
  const serverErrorComponent = getNativeErrorComponent(handlerCode, 'NativeServerErrorScreen')
  const resetProp = /\(\s*\{[^}]*\breset\b/.test(handlerCode) ? ' reset={this.reset}' : ''

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
      return <${serverErrorComponent}${resetProp} />
    }
    return this.props.children
  }
}

export default ErrorBoundary
`
}

// ─── Native animation file generator ──────────────────────────────────────────
// v4.7: uses nativeAnimationExpo first (new @arkzen:native:animation:expo tag).
//       Falls back to nativeAnimationRN for backward compat with old tatemonos
//       that used :rn for both Expo and Bare RN before the stack split.

function generateNativeAnimationFile(tatemono: ParsedTatemono): string | null {
  // v4.7: prefer Expo-specific animation block; fall back to :rn block
  const animBlock = tatemono.nativeAnimationExpo ?? tatemono.nativeAnimationRN
  if (!animBlock) return null

  const sourceTag = tatemono.nativeAnimationExpo
    ? '@arkzen:native:animation:expo'
    : '@arkzen:native:animation:rn (legacy fallback)'

  const reanimatedExports = new Set([
    'Easing', 'cancelAnimation', 'interpolate', 'interpolateColor',
    'runOnJS', 'runOnUI', 'useAnimatedProps', 'useAnimatedReaction',
    'useAnimatedStyle', 'useSharedValue', 'withDelay', 'withRepeat',
    'withSequence', 'withSpring', 'withTiming',
  ])
  const reactHooks = findReferencedNames(animBlock.raw, REACT_HOOKS)
  const reanimatedImports = findReferencedNames(animBlock.raw, reanimatedExports)
  const { strippedSources, canonicalBlock } = resolveImports([animBlock.raw], {
    reactHooks,
    engineNamed: { 'react-native-reanimated': reanimatedImports },
  })
  const clean = strippedSources[0]
    .replace(/\*\/\s*$/, '')
    .trim()

  if (!clean) return null

  return `// ============================================================
// ARKZEN GENERATED NATIVE ANIMATIONS — ${tatemono.meta.name}
// Source: ${sourceTag}
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
// v4.7: only processes layouts targeting Expo (or legacy no-marker layouts)

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  // v4.7: filter to expo-targeted layouts only
  const expoLayouts = (tatemono.nativeLayouts ?? []).filter(l => isExpoTargeted(l.raw))
  if (expoLayouts.length === 0) return
  ensureDir(NATIVE_LAYOUTS_DIR)

  for (const layout of expoLayouts) {
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(NATIVE_LAYOUTS_DIR, fileName)

    const { canonicalBlock, strippedSources } = resolveImports([normaliseNativeImports(layout.raw ?? '')])
    const content = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name} [Expo]\n\n${canonicalBlock}\n\n${strippedSources[0]}\n`
    writeIfChanged(filePath, content)
    console.log(`[Arkzen Expo Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─── Native script file generator ─────────────────────────────────────────────
// v4.7: @arkzen:native:script:expo — global utility block for Expo stack.
//       Writes src/arkzen/generated/{name}.native-script.expo.ts.
//       Named scripts (@arkzen:native:script:expo:name) are written as
//       {name}.native-script.expo.{scriptName}.ts

function generateNativeScriptFile(tatemono: ParsedTatemono, generatedDir: string): void {
  const tatName = tatemono.meta.name

  // Global script
  if (tatemono.nativeScriptExpo) {
    const { canonicalBlock, strippedSources } = resolveImports([tatemono.nativeScriptExpo.raw])
    const clean = strippedSources[0].trim()
    if (clean) {
      const content = `// ============================================================
// ARKZEN GENERATED NATIVE SCRIPT (GLOBAL) — ${tatName} [Expo]
// Source: @arkzen:native:script:expo
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${clean}
`
      ensureDir(generatedDir)
      const filePath = path.join(generatedDir, `${tatName}.native-script.expo.ts`)
      writeIfChanged(filePath, content)
      console.log(`[Arkzen Expo Router] ✓ Native script (global): ${tatName}.native-script.expo.ts`)
    }
  }

  // Named scripts
  if (tatemono.nativeScriptsExpo && tatemono.nativeScriptsExpo.length > 0) {
    ensureDir(generatedDir)
    for (const script of tatemono.nativeScriptsExpo) {
      const scriptName = script.name ?? 'unnamed'
      const { canonicalBlock, strippedSources } = resolveImports([script.raw])
      const clean = strippedSources[0].trim()
      if (!clean) continue
      const content = `// ============================================================
// ARKZEN GENERATED NATIVE SCRIPT (NAMED) — ${tatName}/${scriptName} [Expo]
// Source: @arkzen:native:script:expo:${scriptName}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${clean}
`
      const filePath = path.join(generatedDir, `${tatName}.native-script.expo.${scriptName}.ts`)
      writeIfChanged(filePath, content)
      console.log(`[Arkzen Expo Router] ✓ Native script (named): ${tatName}.native-script.expo.${scriptName}.ts`)
    }
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
  emitNativeStyles(tatName, tatemono.nativeStyles ?? [], GENERATED_DIR, 'Arkzen Expo Router', tatemono.nativeStyleGlobal)

  // Distribute tatemono assets
  const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
  const assetsPath   = path.join(tatemonosDir, tatName, 'assets')
  const hasAssets    = copyAssetsToExpo(tatName, assetsPath, EXPO_ASSETS_DIR)
  if (!hasAssets) {
    console.log(`[Arkzen Expo Router] No assets folder for ${tatName}`)
  }

  // v3.4 / v4.7: generate native animation file if present
  // Uses nativeAnimationExpo first (new DSL); falls back to nativeAnimationRN for legacy tatemonos
  const hasAnimBlock = tatemono.nativeAnimationExpo ?? tatemono.nativeAnimationRN
  if (hasAnimBlock) {
    ensureDir(GENERATED_DIR)
    const animContent = generateNativeAnimationFile(tatemono)
    if (animContent) {
      const animPath = path.join(GENERATED_DIR, `${tatName}.native-animations.ts`)
      writeIfChanged(animPath, animContent)
      const sourceLabel = tatemono.nativeAnimationExpo ? ':expo' : ':rn (legacy)'
      console.log(`[Arkzen Expo Router] ✓ Native animation file generated: ${tatName}.native-animations.ts (${sourceLabel})`)
    }
  }

  // v4.7: generate native script files (@arkzen:native:script:expo)
  generateNativeScriptFile(tatemono, GENERATED_DIR)

  // v3.5: generate custom native layouts
  generateCustomLayouts(tatemono)

  const existingRoutes = readExistingRoutes().filter(r => r.tatName !== tatName)
  const newRoutes: ExpoRoute[] = []

  // v4.7: only process pages targeting Expo (or legacy pages with no stack marker)
  const expoPages = tatemono.nativePages.filter(p => isExpoTargeted(p.raw))

  for (const page of expoPages) {
    const screenName = page.name
    const routePath  = screenName === 'index' ? `/${tatName}` : `/${tatName}/${screenName}`
    const layout     = page.layout ?? 'default'

    writeIfChanged(path.join(screenDir, `${screenName}.tsx`), generateScreenFile(tatemono, page))
    writeIfChanged(path.join(appDir,    `${screenName}.tsx`), generateExpoRouteFile(tatName, screenName, (tatemono.nativeErrorHandlers ?? []).some(h => h.type === '500')))

    newRoutes.push({ tatName, screenName, routePath, layout, auth: tatemono.meta.auth && layout === 'auth' })
    console.log(`[Arkzen Expo Router] ✓ ${routePath} [${layout}]`)
  }

  // v4.1: root redirect — /${tatName} → first page, if no explicit "index" page exists
  const rootRedirectTarget = resolveExpoRootRedirectTarget(tatemono, expoPages)
  if (rootRedirectTarget) {
    const destination = `/${tatName}/${rootRedirectTarget.name}`
    const layout      = rootRedirectTarget.layout ?? 'default'

    writeIfChanged(path.join(appDir, 'index.tsx'), generateExpoRootRedirectFile(tatName, destination))

    newRoutes.push({
      tatName,
      screenName: 'index',
      routePath:  `/${tatName}`,
      layout,
      auth: tatemono.meta.auth && layout === 'auth',
    })
    console.log(`[Arkzen Expo Router] ✓ /${tatName} → ${destination} [root redirect]`)
  }

  // v3.3 / v4.7: error handlers — only Expo-targeted ones (or legacy no-marker)
  const expoErrorHandlers = (tatemono.nativeErrorHandlers ?? []).filter(h => isExpoTargeted(h.raw))
  for (const handler of expoErrorHandlers) {
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

  // v4.7: clean up native script files
  const globalScriptPath = path.join(GENERATED_DIR, `${tatName}.native-script.expo.ts`)
  if (fs.existsSync(globalScriptPath)) {
    fs.unlinkSync(globalScriptPath)
    console.log(`[Arkzen Expo Router] ✓ Removed native script (global): ${tatName}.native-script.expo.ts`)
  }
  // Named script cleanup — scan generated dir for matching pattern
  if (fs.existsSync(GENERATED_DIR)) {
    const scriptPrefix = `${tatName}.native-script.expo.`
    for (const entry of fs.readdirSync(GENERATED_DIR)) {
      if (entry.startsWith(scriptPrefix) && entry.endsWith('.ts') && entry !== `${tatName}.native-script.expo.ts`) {
        fs.unlinkSync(path.join(GENERATED_DIR, entry))
        console.log(`[Arkzen Expo Router] ✓ Removed native script (named): ${entry}`)
      }
    }
  }

  writeRouteRegistry(readExistingRoutes().filter(r => r.tatName !== tatName))
  console.log(`[Arkzen Expo Router] ✓ Route registry updated`)
}