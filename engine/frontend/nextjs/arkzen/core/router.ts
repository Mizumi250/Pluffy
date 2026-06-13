// ============================================================
// ARKZEN ENGINE — ROUTER v5.1
// - Pages named "index" are placed directly in tatemono folder (app/name/page.tsx)
// - Other pages go into subfolders (app/name/dashboard/page.tsx)
// - Imports are adjusted accordingly (same folder vs parent folder)
// - Generates sitemap.xml and robots.txt for SEO
// - v5.1: Unified import resolver — engine owns all imports in generated files.
//         Authors write imports freely in any block; engine scrapes, deduplicates,
//         merges, and injects one canonical import block per generated file.
// ============================================================

import * as fs from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage, ArkzenErrorHandler } from '../types'
import { writeSitemap } from './sitemap'
import { getRegistry } from './registry'
import { copyAssetsToPublic, cleanOldAssets } from './assets'
import { emitTatemonoStyles } from './lib/dsl-style-emitter'

const APP_DIR   = path.resolve(process.cwd(), 'app')
const PAGES_DIR = path.resolve(process.cwd(), 'pages')

function detectRouterType(): 'app' | 'pages' {
  if (fs.existsSync(APP_DIR)) return 'app'
  return 'pages'
}

// ─────────────────────────────────────────────
// LAYOUT HELPERS — v5
// ─────────────────────────────────────────────

function getLayoutImport(layout: string, meta: { name: string }): string {
  switch (layout) {
    case 'guest': return `import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'`
    case 'auth':  return `import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'`
    default:
      return `import { ${toPascalCase(layout)}Layout } from '@/arkzen/core/layouts/custom/${meta.name}-${layout}'`
  }
}

function getLayoutComponent(layout: string): string {
  switch (layout) {
    case 'guest': return 'GuestLayout'
    case 'auth':  return 'AuthLayout'
    default:      return `${toPascalCase(layout)}Layout`
  }
}

/**
 * Extracts the React component name from raw page code.
 * Looks for "const XxxPage = " or "const XxxPage: " patterns.
 * Falls back to toSafeComponentName(pageName) if not found.
 */
function extractComponentName(pageName: string, raw: string): string {
  const match = raw.match(/const\s+([A-Za-z_$][A-Za-z0-9_$]*Page)\s*[=:(]/)
  if (match) return match[1]
  return toSafeComponentName(pageName) + 'Page'
}

// ─────────────────────────────────────────────
// UNIFIED IMPORT RESOLVER — v5.1
//
// Scrapes ALL import statements from any raw code strings,
// deduplicates named exports per module, normalises default
// vs named gsap import, and returns:
//   - canonicalImports : the final import block string
//   - stripped sources : the raw code strings with all import
//                        lines and 'use client' removed
// ─────────────────────────────────────────────

interface ResolvedImports {
  canonicalBlock: string
  strippedSources: string[]
}

/**
 * Known modules that the engine always injects itself.
 * These are EXCLUDED from the scraped imports — engine handles them.
 */
const ENGINE_OWNED_MODULES = new Set([
  'react',
  'framer-motion',
])


/**
 * Atomic file write: write to a sibling .tmp file then rename into place.
 * Prevents webpack / Next.js from reading a half-written file when the
 * watcher regenerates a component while the dev server is compiling it.
 */
function atomicWrite(filePath: string, data: string): void {
  const tmp = filePath + '.tmp'
  fs.writeFileSync(tmp, data, 'utf-8')
  fs.renameSync(tmp, filePath)
}

function resolveImports(
  sources: string[],
  engineRequired: {
    reactHooks?: string[]         // always-needed React hooks (useRef, useEffect)
    framerNamed?: string[]        // always-needed framer-motion named exports (motion)
    extra?: string                // any extra single-line imports to prepend verbatim
  } = {}
): ResolvedImports {

  // module → { defaultImport?: string, named: Set<string> }
  const importMap = new Map<string, { defaultImport?: string; named: Set<string> }>()

  const getEntry = (mod: string) => {
    if (!importMap.has(mod)) importMap.set(mod, { named: new Set() })
    return importMap.get(mod)!
  }

  // ── Seed engine-required entries ──────────────────────────
  const reactEntry = getEntry('react')
  ;(engineRequired.reactHooks ?? ['useRef', 'useEffect']).forEach(h => reactEntry.named.add(h))

  const framerEntry = getEntry('framer-motion')
  ;(engineRequired.framerNamed ?? ['motion']).forEach(n => framerEntry.named.add(n))

  // ── Patterns ──────────────────────────────────────────────
  // 1. import DefaultName from 'module'
  const defaultImportRe   = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/
  // 2. import { a, b, c } from 'module'
  const namedImportRe     = /^import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  // 3. import Default, { a, b } from 'module'
  const mixedImportRe     = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*,\s*\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  // 4. import * as Ns from 'module'
  const namespaceImportRe = /^import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/
  // 5. import 'module'  (side-effect)
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
        // For react, treat React as implicit — only track hooks
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
        if (mod === 'react') continue // React default handled separately
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

  // ── Normalise gsap default → named ────────────────────────
  // Some tatemonos write `import gsap from 'gsap'` (default),
  // others write `import { gsap } from 'gsap'` (named).
  // Canonical form is always named: import { gsap } from 'gsap'
  if (importMap.has('gsap')) {
    const gsapEntry = importMap.get('gsap')!
    if (gsapEntry.defaultImport === 'gsap') {
      gsapEntry.defaultImport = undefined
      gsapEntry.named.add('gsap')
    }
  }

  // ── Build canonical import block ──────────────────────────
  const lines: string[] = []

  // 1. React always first — `import React, { hooks } from 'react'`
  const reactNamed = [...(importMap.get('react')?.named ?? [])]
    .filter(h => h !== 'React')
    .sort()
  lines.push(
    reactNamed.length > 0
      ? `import React, { ${reactNamed.join(', ')} } from 'react'`
      : `import React from 'react'`
  )

  // 2. framer-motion always second
  const framerNamed = [...(importMap.get('framer-motion')?.named ?? [])].sort()
  if (framerNamed.length > 0) {
    lines.push(`import { ${framerNamed.join(', ')} } from 'framer-motion'`)
  }

  // 3. All other modules — alphabetical by module name
  const otherModules = [...importMap.keys()]
    .filter(m => m !== 'react' && m !== 'framer-motion')
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

  // 4. Side-effects last
  sideEffects.forEach(s => lines.push(s))

  // 5. Verbatim extra (e.g. layout import, animation import)
  if (engineRequired.extra) {
    lines.push(engineRequired.extra)
  }

  const canonicalBlock = lines.filter(Boolean).join('\n')

  // ── Strip all imports + 'use client' from raw sources ─────
  const stripRaw = (src: string) =>
    src
      .replace(/^\s*['"]use client['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '') // side-effect imports
      .trim()

  const strippedSources = sources.map(stripRaw)

  return { canonicalBlock, strippedSources }
}




function flattenMultilineImports(code: string): string {
  const lines = code.split('\n')
  const out: string[] = []
  let inImport = false
  let buffer = ''
  let depth = 0

  // Does a string (after collapsing whitespace) look like a full import?
  const isCompleteImport = (s: string): boolean =>
    /^import\s+(?:(?:[\w*\s{},]+)\s+from\s+['"][^'"]+['"]|['"][^'"]+['"])\s*;?\s*$/.test(s)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!inImport && /^\s*import\s/.test(line)) {
      inImport = true
      buffer = trimmed
      depth += (trimmed.match(/\{/g) || []).length
      depth -= (trimmed.match(/\}/g) || []).length
      // Collapse whitespace and test immediately (single‑line import)
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
      }
      continue
    }

    out.push(line)
  }

  if (inImport && buffer.trim()) {
    out.push(buffer.replace(/\s+/g, ' '))
  }

  return out.join('\n')
}

// ─────────────────────────────────────────────
// GENERATE INDIVIDUAL COMPONENT FILES
// ─────────────────────────────────────────────

// Strips template literal content from source so the component-name extractor
// doesn't match declarations inside backtick strings (e.g. code-demo strings).
function stripTemplateLiterals(src: string): string {
  let result = ''
  let i = 0
  while (i < src.length) {
    if (src[i] === '`') {
      // Enter template literal — strip static string portions but KEEP
      // ${...} expression content so identifiers inside them remain visible
      // to findReferencedNames (e.g. REVERB_SCHEME in `${REVERB_SCHEME}://...`).
      i++ // skip opening backtick
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue }  // escaped char
        if (src[i] === '`') { i++; break }           // closing backtick
        // Preserve ${...} expression content verbatim
        if (src[i] === '$' && src[i + 1] === '{') {
          i += 2 // skip '${' 
          let depth = 1
          while (i < src.length && depth > 0) {
            if (src[i] === '{') depth++
            else if (src[i] === '}') { depth--; if (depth === 0) { i++; break } }
            result += src[i]  // emit so identifiers stay visible
            i++
          }
          continue
        }
        result += ' ' // replace static text with whitespace
        i++
      }
    } else {
      result += src[i]
      i++
    }
  }
  return result
}

/**
 * Extracts PascalCase component (and other top-level exported declaration)
 * names declared inside @arkzen:components blocks. Skips types, ALL_CAPS
 * constants, and anything inside template literals (e.g. code-demo strings).
 */
function extractComponentNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of tatemono.components) {
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

/**
 * Extracts ALL_CAPS top-level const declarations from @arkzen:components
 * blocks (e.g. NAV_LINKS, CHAPTERS) — shared data constants referenced by
 * both generated components and pages. These are written to a single
 * components/constants.ts file rather than duplicated per-file.
 */
function extractSharedConstantNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of tatemono.components) {
    const stripped = stripTemplateLiterals(component.raw)
    const matches = stripped.match(/^(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*[=:]/gm) || []
    for (const match of matches) {
      const name = match.match(/const\s+([A-Z][A-Z0-9_]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

/**
 * Extracts custom React hook names (use[A-Z]...) declared inside
 * @arkzen:components blocks. Hooks are camelCase starting with 'use'.
 */
function extractCustomHookNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of tatemono.components) {
    const stripped = stripTemplateLiterals(component.raw)
    // Match: function useXxx( or const useXxx =
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

/**
 * Extracts TypeScript type alias and interface names declared inside
 * @arkzen:components blocks (e.g. `type ProbeResult = {...}`, `interface Foo {}`).
 */
function extractSharedTypeNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of tatemono.components) {
    const stripped = stripTemplateLiterals(component.raw)
    const typeMatches = stripped.match(/(?:export\s+)?type\s+([A-Z][A-Za-z0-9_$]*)\s*[=<{]/g) || []
    for (const match of typeMatches) {
      const name = match.match(/type\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
    const interfaceMatches = stripped.match(/(?:export\s+)?interface\s+([A-Z][A-Za-z0-9_$]*)\s*[{<]/g) || []
    for (const match of interfaceMatches) {
      const name = match.match(/interface\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

/**
 * Extracts camelCase utility function/const names from @arkzen:components blocks.
 * These are exported helpers that aren't React components (PascalCase), custom
 * hooks (use[A-Z]...), ALL_CAPS constants, or type/interface declarations —
 * e.g. fmtTime, calcDistance, formatCurrency.
 * They are written to components/utils.ts so pages can import them.
 */
function extractUtilityFunctionNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  // Collect component names first so we can strip their bodies before scanning.
  // Without this, inner declarations like `handleSend`, `inputRef`, `val` defined
  // inside a memo() body get mistakenly identified as shared utilities and end up
  // imported from ./utils in every component file that references those names.
  const componentNames = extractComponentNames(tatemono)

  for (const component of tatemono.components) {
    const stripped = stripTemplateLiterals(component.raw)

    // Remove each component's body from the source so only top-level declarations
    // remain visible to the utility scanner.
    let src = stripped
    for (const compName of componentNames) {
      const esc = compName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // Match from the component declaration to the end of the string — the
      // component is always the last (or only) declaration in its chunk, so
      // trimming from its `const Name =` onward safely removes the body without
      // touching preceding top-level utilities like `dot`, `formatDate`, etc.
      src = src.replace(new RegExp(`(?:export\\s+)?const\\s+${esc}\\s*=[\\s\\S]*`), '')
    }

    // camelCase const: starts lowercase, not all-caps, not use[A-Z] hook
    const constMatches = src.match(/(?:export\s+)?const\s+([a-z][A-Za-z0-9_$]*)\s*[=:(]/g) || []
    for (const match of constMatches) {
      const name = match.match(/const\s+([a-z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^use[A-Z]/.test(name)) names.add(name)
    }
    // camelCase function: starts lowercase
    const fnMatches = src.match(/(?:export\s+)?function\s+([a-z][A-Za-z0-9_$]*)\s*[(<]/g) || []
    for (const match of fnMatches) {
      const name = match.match(/function\s+([a-z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^use[A-Z]/.test(name)) names.add(name)
    }
  }
  return names
}

/**
 * Given a set of names (component or constant names) and a stripped source,
 * returns the subset of names that are actually referenced (used, not just
 * declared) somewhere in that source — i.e. they appear as a standalone
 * identifier at least once.
 */
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


function splitComponentDeclarations(rawSource: string, names: Set<string>): Map<string, string> {
  const out = new Map<string, string>()
  if (names.size === 0) return out

  // Scan on the template-literal-stripped version so static string content
  // (e.g. a displayName assignment or a JSX string) doesn't confuse the
  // declaration-boundary regex.  But SLICE from rawSource so template literal
  // expressions are preserved verbatim and chunk lengths are correct.
  const scanSource = stripTemplateLiterals(rawSource)

  const nameAlt = [...names].map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const re = new RegExp(`^(?:export\\s+)?(const|function)\\s+(${nameAlt})\\b`, 'gm')

  const starts: { index: number; name: string }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(scanSource)) !== null) {
    starts.push({ index: m.index, name: m[2] })
  }
  if (starts.length === 0) return out

  for (let i = 0; i < starts.length; i++) {
    const { index, name } = starts[i]

    // Pull in any leading comment/blank lines directly above the declaration.
    // Use scanSource for line-boundary maths (same indices as the regex above).
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

    // chunkEnd: next declaration's start index in scanSource, or end of rawSource.
    // scanSource and rawSource share line structure outside template literals so
    // these indices are valid for slicing rawSource too.
    const chunkEnd = i + 1 < starts.length ? starts[i + 1].index : rawSource.length
    out.set(name, rawSource.slice(chunkStart, chunkEnd).trim())
  }

  return out
}

function generateIndividualComponentFiles(tatemono: ParsedTatemono, baseDir: string): void {
  const componentsDir = path.join(baseDir, 'components')

  if (tatemono.components.length === 0) {
    // No @arkzen:components — remove stale components dir entirely if present
    if (fs.existsSync(componentsDir)) {
      fs.rmSync(componentsDir, { recursive: true })
      console.log(`[Arkzen Router] 🧹 Removed stale components/ (no @arkzen:components)`)
    }
    return
  }

  fs.mkdirSync(componentsDir, { recursive: true })

  // Resolve imports across ALL component blocks into one canonical block —
  // every per-component file gets this same canonical import set, since we
  // don't statically know which imports each declaration individually needs.
  const rawSources = tatemono.components.map(c => c.raw.trim())
  const { canonicalBlock, strippedSources } = resolveImports(rawSources)

  // Build a map of component names that have CSS Modules (from named styles)
  const stylesByComponent = new Map<string, string>()
  for (const style of tatemono.styles.filter((s): s is typeof s & { name: string } => !!s.name)) {
    stylesByComponent.set(style.name, style.name)
  }

  const extractedComponents = extractComponentNames(tatemono)
  const sharedConstants = extractSharedConstantNames(tatemono)
  const customHooks = extractCustomHookNames(tatemono)
  const sharedTypes = extractSharedTypeNames(tatemono)
  const utilityFunctions = extractUtilityFunctionNames(tatemono)
  const allDeclaredNames = new Set([...extractedComponents, ...sharedConstants, ...customHooks, ...sharedTypes, ...utilityFunctions])

  // Split each stripped components-block source into per-declaration chunks.
  // Use the combined name set so constant declarations (e.g. CHAPTERS) form
  // their own chunk boundaries instead of being swallowed by a neighbor.
  const declarationsByName = new Map<string, string>()
  for (const stripped of strippedSources) {
    for (const [name, code] of splitComponentDeclarations(stripped, allDeclaredNames)) {
      declarationsByName.set(name, code)
    }
  }

  // ── Shared constants file (components/constants.ts) ──────────────────
  if (sharedConstants.size > 0) {
    const constChunks = [...sharedConstants]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(const)(\\s+${escapedName}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })

    if (constChunks.length > 0) {
      const constantsContent = `// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — ${tatemono.meta.name}
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${constChunks.join('\n\n')}
`
      atomicWrite(path.join(componentsDir, 'constants.ts'), constantsContent)
      console.log(`[Arkzen Router] ✓ Shared constants: constants.ts`)
    }
  } else {
    const constantsPath = path.join(componentsDir, 'constants.ts')
    if (fs.existsSync(constantsPath)) {
      fs.unlinkSync(constantsPath)
      console.log(`[Arkzen Router] 🧹 Removed stale constants.ts`)
    }
  }

  // ── Custom hooks file (components/hooks.ts) ──────────────────────────
  if (customHooks.size > 0) {
    const hookChunks = [...customHooks]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(const|function)(\\s+${escapedName}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })

    if (hookChunks.length > 0) {
      const hooksContent = `'use client'\n// ============================================================\n// ARKZEN GENERATED HOOKS — ${tatemono.meta.name}\n// Source: @arkzen:components (${tatemono.meta.name})\n// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.\n// Generated: ${new Date().toISOString()}\n// ============================================================\n\n${canonicalBlock}\n\n${hookChunks.join('\n\n')}\n`
      atomicWrite(path.join(componentsDir, 'hooks.ts'), hooksContent)
      console.log(`[Arkzen Router] ✓ Custom hooks: hooks.ts (${[...customHooks].join(', ')})`)
    }
  } else {
    const hooksPath = path.join(componentsDir, 'hooks.ts')
    if (fs.existsSync(hooksPath)) {
      fs.unlinkSync(hooksPath)
      console.log(`[Arkzen Router] 🧹 Removed stale hooks.ts`)
    }
  }

  // ── Utility functions file (components/utils.ts) ─────────────────────
  if (utilityFunctions.size > 0) {
    const utilChunks = [...utilityFunctions]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(const|function)(\\s+${escapedName}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })

    if (utilChunks.length > 0) {
      const utilsContent = `// ============================================================\n// ARKZEN GENERATED UTILITIES — ${tatemono.meta.name}\n// Source: @arkzen:components (${tatemono.meta.name})\n// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.\n// Generated: ${new Date().toISOString()}\n// ============================================================\n\n${canonicalBlock}\n\n${utilChunks.join('\n\n')}\n`
      atomicWrite(path.join(componentsDir, 'utils.ts'), utilsContent)
      console.log(`[Arkzen Router] ✓ Utility functions: utils.ts (${[...utilityFunctions].join(', ')})`)
    }
  } else {
    const utilsPath = path.join(componentsDir, 'utils.ts')
    if (fs.existsSync(utilsPath)) {
      fs.unlinkSync(utilsPath)
      console.log(`[Arkzen Router] 🧹 Removed stale utils.ts`)
    }
  }

  // ── Shared types file (components/types.ts) ──────────────────────────
  if (sharedTypes.size > 0) {
    const typeChunks = [...sharedTypes]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(type|interface)(\\s+${escapedName}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })

    if (typeChunks.length > 0) {
      const typesContent = `// ============================================================\n// ARKZEN GENERATED TYPES — ${tatemono.meta.name}\n// Source: @arkzen:components (${tatemono.meta.name})\n// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.\n// Generated: ${new Date().toISOString()}\n// ============================================================\n\n${typeChunks.join('\n\n')}\n`
      atomicWrite(path.join(componentsDir, 'types.ts'), typesContent)
      console.log(`[Arkzen Router] ✓ Shared types: types.ts (${[...sharedTypes].join(', ')})`)
    }
  } else {
    const typesPath = path.join(componentsDir, 'types.ts')
    if (fs.existsSync(typesPath)) {
      fs.unlinkSync(typesPath)
      console.log(`[Arkzen Router] 🧹 Removed stale types.ts`)
    }
  }


  // Write one real file per component, containing its actual code
  for (const compName of extractedComponents) {
    const declaration = declarationsByName.get(compName)
    if (!declaration) {
      console.log(`[Arkzen Router] ⚠ Could not isolate declaration for ${compName}, skipping file`)
      continue
    }

    const fileName = `${compName}.tsx`
    const filePath = path.join(componentsDir, fileName)

    const cssImport = stylesByComponent.has(compName)
      ? `import styles from '../styles/${compName}.module.css'\n`
      : ''

    // Ensure the declaration is exported so pages can import it by name.
    // The chunk may start with leading comment lines, so find the actual
    // `const Name` / `function Name` / `export const Name` / `export function Name`
    // line for this component and prepend `export ` only if missing.
    const escapedName = compName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const exportedDeclaration = declaration.replace(
      new RegExp(`^(\\s*)(export\\s+)?(const|function)(\\s+${escapedName}\\b)`, 'm'),
      (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
    )

    // If this component references any shared constants (e.g. CHAPTERS),
    // import them from the generated constants.ts file.
    const referencedConstants = findReferencedNames(declaration, sharedConstants)
    const constantsImport = referencedConstants.length > 0
      ? `import { ${referencedConstants.sort().join(', ')} } from './constants'\n`
      : ''

    // If this component references custom hooks (e.g. useToast),
    // import them from the generated hooks.ts file.
    const referencedHooks = findReferencedNames(declaration, customHooks)
    const hooksImport = referencedHooks.length > 0
      ? `import { ${referencedHooks.sort().join(', ')} } from './hooks'\n`
      : ''

    // If this component references shared types (e.g. ProbeResult),
    // import them from the generated types.ts file.
    const referencedTypes = findReferencedNames(declaration, sharedTypes)
    const typesImport = referencedTypes.length > 0
      ? `import type { ${referencedTypes.sort().join(', ')} } from './types'\n`
      : ''

    // If this component references other generated components (e.g. Chapter
    // uses ChapterCover, ChapterHead, ...), import them from their own files.
    const otherComponents = new Set(extractedComponents)
    otherComponents.delete(compName)
    const referencedComponents = findReferencedNames(declaration, otherComponents)
    const siblingComponentImports = referencedComponents
      .sort()
      .map(name => `import { ${name} } from './${name}'`)
      .join('\n')
    const siblingImportBlock = siblingComponentImports ? `${siblingComponentImports}\n` : ''

    // If this component references utility functions (e.g. fmtTime, calcDistance),
    // import them from the generated utils.ts file.
    const referencedUtils = findReferencedNames(declaration, utilityFunctions)
    const utilsImport = referencedUtils.length > 0
      ? `import { ${referencedUtils.sort().join(', ')} } from './utils'\n`
      : ''

    const content = `'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ${compName}
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}
${cssImport}${constantsImport}${hooksImport}${utilsImport}${typesImport}${siblingImportBlock}
${exportedDeclaration}
`
    atomicWrite(filePath, content)
    console.log(`[Arkzen Router] ✓ Component: ${fileName}`)
  }

  // Clean up stale files: old _components.tsx / index.ts barrel, and any
  // per-component files for components that no longer exist.
  try {
    const files = fs.readdirSync(componentsDir)
    for (const file of files) {
      const base = file.replace(/\.(tsx|ts)$/, '')
      if (file === '_components.tsx' || file === 'index.ts') {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen Router] 🧹 Removed stale ${file}`)
        continue
      }
      // hooks.ts, types.ts, utils.ts and constants.ts are managed above — skip them here
      if (file === 'hooks.ts' || file === 'types.ts' || file === 'constants.ts' || file === 'utils.ts') continue
      if (file.endsWith('.tsx') && !extractedComponents.has(base)) {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen Router] 🧹 Removed stale component: ${file}`)
      }
    }
  } catch (e) {
    // ignore
  }
}

// ─────────────────────────────────────────────
// GENERATE PAGE FILE — one per route
// ─────────────────────────────────────────────

function generatePageFile(
  tatemono: ParsedTatemono,
  page: ArkzenPage,
  animationFnName: string | null,
  componentsImportPath: string
): string {
  const componentName = extractComponentName(page.name, page.raw)
  const layoutImport  = getLayoutImport(page.layout, tatemono.meta)
  const layoutComp    = getLayoutComponent(page.layout)
  const isAuthLayout  = page.layout === 'auth'
  const isGuestLayout = page.layout === 'guest'

  const isGuestOnly = isGuestLayout && (
    (page as any).guestOnly === true ||
    (tatemono.meta.auth && ['login', 'register', 'forgot-password', 'reset-password'].includes(page.name))
  )

  // Page sources only — component code no longer gets inlined into pages.
  const allSources = [page.raw.trim()]

  // Scrape framer-motion named exports from page + component sources so we
  // don't lose AnimatePresence, useMotionValue etc. that the tatemono uses
  const framerNeeded = new Set(['motion'])
  const framerRe = /import\s+\{([^}]*)\}\s+from\s+['"]framer-motion['"]/g
  const framerSources = [...tatemono.components.map(c => c.raw.trim()), ...allSources]
  for (const src of framerSources) {
    let m: RegExpMatchArray | null
    while ((m = framerRe.exec(src)) !== null) {
      m[1].split(',').map(s => s.trim()).filter(Boolean).forEach(n => framerNeeded.add(n))
    }
  }

  const animImportLine = animationFnName
    ? `import { ${animationFnName}, pageVariants } from '@/arkzen/generated/${tatemono.meta.name}.animations'`
    : ''

  // Detect React hooks actually called in the page's own source (e.g. useState,
  // useCallback, useMemo, useContext) so we don't lose them now that component
  // blocks no longer get merged in. useRef/useEffect are always seeded below.
  const KNOWN_REACT_HOOKS = [
    'useState', 'useCallback', 'useMemo', 'useContext', 'useReducer',
    'useLayoutEffect', 'useImperativeHandle', 'useTransition', 'useDeferredValue',
    'useId', 'useSyncExternalStore', 'useInsertionEffect',
  ]
  const pageStrippedForHooks = stripTemplateLiterals(page.raw)
  const usedReactHooks = KNOWN_REACT_HOOKS.filter(hook =>
    new RegExp(`[^\\w$]${hook}\\s*[(<]`).test(pageStrippedForHooks)
  )

  // Per-component imports — one import line per file, e.g.
  //   import { MyButton } from './components/MyButton'
  const componentNames = extractComponentNames(tatemono)
  const componentImportLines = [...componentNames]
    .sort()
    .map(name => `import { ${name} } from '${componentsImportPath}/${name}'`)
    .join('\n')

  // Forward non-react/framer-motion import lines from the components block
  // (e.g. `import { gsap } from 'gsap'`, `import { ScrollTrigger } from
  // 'gsap/ScrollTrigger'`) when the page's own code references the imported
  // identifier(s) but doesn't import them itself. The components block no
  // longer gets merged into the page, so these would otherwise be lost.
  const forwardedImportLines = (() => {
    const seen = new Set<string>()
    const lines: string[] = []
    for (const component of tatemono.components) {
      const flattened = flattenMultilineImports(component.raw.trim())
      for (const rawLine of flattened.split('\n')) {
        const line = rawLine.trim()
        if (!line.startsWith('import ')) continue
        if (/from\s+['"](react|framer-motion)['"]/.test(line)) continue

        // Extract identifiers this import line brings into scope
        const idents: string[] = []
        let m = line.match(/^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*,\s*\{([^}]*)\}\s+from/)
        if (m) {
          idents.push(m[1], ...m[2].split(',').map(s => s.trim()).filter(Boolean))
        } else if ((m = line.match(/^import\s+\{([^}]*)\}\s+from/))) {
          idents.push(...m[1].split(',').map(s => s.trim()).filter(Boolean))
        } else if ((m = line.match(/^import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from/))) {
          idents.push(m[1])
        } else if ((m = line.match(/^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from/))) {
          idents.push(m[1])
        } else {
          continue // side-effect import — skip forwarding
        }

        const referenced = idents.some(ident =>
          new RegExp(`[^\\w$]${ident.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(' ' + pageStrippedForHooks)
        )
        if (referenced && !seen.has(line)) {
          seen.add(line)
          lines.push(line)
        }
      }
    }
    return lines.join('\n')
  })()

  // Shared constants (e.g. NAV_LINKS, CHAPTERS) — only import the ones this
  // page's own code actually references.
  const sharedConstants = extractSharedConstantNames(tatemono)
  const pageStrippedForConsts = stripTemplateLiterals(page.raw)
  const referencedConstants = findReferencedNames(pageStrippedForConsts, sharedConstants)
  const constantsImportLine = referencedConstants.length > 0
    ? `import { ${referencedConstants.sort().join(', ')} } from '${componentsImportPath}/constants'`
    : ''

  // Custom hooks (e.g. useToast) — only import the ones this page references.
  const customHooks = extractCustomHookNames(tatemono)
  const referencedHooks = findReferencedNames(pageStrippedForHooks, customHooks)
  const hooksImportLine = referencedHooks.length > 0
    ? `import { ${referencedHooks.sort().join(', ')} } from '${componentsImportPath}/hooks'`
    : ''

  // Utility functions (e.g. fmtTime, calcDistance) — only import ones this page references.
  const utilityFunctions = extractUtilityFunctionNames(tatemono)
  const referencedUtils = findReferencedNames(pageStrippedForHooks, utilityFunctions)
  const utilsImportLine = referencedUtils.length > 0
    ? `import { ${referencedUtils.sort().join(', ')} } from '${componentsImportPath}/utils'`
    : ''

  // Shared types (e.g. ProbeResult, Stats) — only import the ones this page references.
  const sharedTypes = extractSharedTypeNames(tatemono)
  const referencedTypes = findReferencedNames(stripTemplateLiterals(page.raw), sharedTypes)
  const typesImportLine = referencedTypes.length > 0
    ? `import type { ${referencedTypes.sort().join(', ')} } from '${componentsImportPath}/types'`
    : ''

  const extraLines = [layoutImport, animImportLine, componentImportLines, constantsImportLine, hooksImportLine, utilsImportLine, typesImportLine, forwardedImportLines].filter(Boolean).join('\n')

  const { canonicalBlock: rawCanonicalBlock, strippedSources } = resolveImports(allSources, {
    reactHooks:   ['useRef', 'useEffect', ...usedReactHooks],
    framerNamed:  [...framerNeeded],
    extra:        extraLines,
  })

  // Pages live at pages/{tat}/{page}.tsx but .scripts/.script files are at arkzen/generated/
  // Rewrite any './{name}.scripts' or './{name}.*.script' to '@/arkzen/generated/{name}...'
  const canonicalBlock = rawCanonicalBlock.replace(
    /from\s+['"]\.\/([\w-]+\.scripts|[\w-]+\.[\w-]+\.script)['"]/g,
    `from '@/arkzen/generated/$1'`
  )

  const strippedPageCode = (strippedSources[0] ?? '')
    // FIX: isMounted cleanup-only useEffect breaks under React StrictMode —
    // StrictMode remounts components in dev, firing the cleanup and permanently
    // setting isMounted.current = false before load() runs, leaving the page
    // stuck on "Loading...". Rewrite to reset isMounted.current = true on mount
    // so the ref is always correct after a remount.
    .replace(
      /useEffect\(\(\)\s*=>\s*\{\s*\n?\s*return\s*\(\)\s*=>\s*\{\s*isMounted\.current\s*=\s*false\s*\}\s*\n?\s*\},\s*\[\]\)/g,
      `useEffect(() => {\n    isMounted.current = true\n    return () => { isMounted.current = false }\n  }, [])`
    )

  return `'use client'
// ============================================================
// ARKZEN GENERATED PAGE — ${tatemono.meta.name}/${page.name}
// Layout: ${page.layout} | Auth guard: ${isAuthLayout} | Guest-only: ${isGuestOnly}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

// Page component code (from @arkzen:page:${page.name})
${strippedPageCode}

// Wrapper for animation + layout
const ArkzenPage_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)} = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    ${animationFnName ? `const cleanup = ${animationFnName}(pageRef)\n    return cleanup` : '// No animations'}
  }, [])

  return (
    <${layoutComp}${isAuthLayout ? ' requireAuth={true}' : ''}${isGuestOnly ? ' guestOnly={true}' : ''}>
      <motion.div
        ref={pageRef}
        variants={${animationFnName ? 'pageVariants' : '{}'}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <${componentName} />
      </motion.div>
    </${layoutComp}>
  )
}

export default ArkzenPage_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)}
`
}

// ─────────────────────────────────────────────
// GENERATE ANIMATION FILE
// ─────────────────────────────────────────────

function generateAnimationFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.animation) return null

  const animFnName = toCamelCase(tatemono.meta.name) + 'Animations'

  // Resolve imports from animation block — engine owns gsap + ScrollTrigger + React
  const { strippedSources } = resolveImports([tatemono.animation.raw], {
    reactHooks:  [],
    framerNamed: [],
  })
  let cleanAnimation = strippedSources[0]
    .replace(/gsap\.registerPlugin\(.*\)[;]?\n?/g, '')
    // strip existing `export` before re-adding — prevents `export export const`
    .replace(new RegExp(`\\bexport\\s+const\\s+${animFnName}\\b`), `const ${animFnName}`)
    .replace(`const ${animFnName}`, `export const ${animFnName}`)
    // strip trailing */ — tatemono wraps animation in block comment; closing */ leaks
    .replace(/\*\/\s*$/, '')
    .trim()

  // Auto-inject pageVariants when the tatemono didn't define one.
  const hasPageVariants = /export\s+const\s+pageVariants\b/.test(cleanAnimation)
  const pageVariantsBlock = hasPageVariants ? '' : `
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}`

  return `// ============================================================
// ARKZEN GENERATED ANIMATIONS — ${tatemono.meta.name}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

${cleanAnimation}${pageVariantsBlock}
`
}

// ─────────────────────────────────────────────
// GENERATE GLOBAL SCRIPT FILE — v6.5
// Mirrors generateAnimationFile but for @arkzen:script.
// Exports whatever the author wrote — no forced pageVariants injection.
// The engine strips existing imports and re-emits a clean canonical block.
// ─────────────────────────────────────────────

function generateScriptFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.script) return null

  const { strippedSources } = resolveImports([tatemono.script.raw], {
    reactHooks:  [],
    framerNamed: [],
  })

  const cleanScript = strippedSources[0]
    // strip trailing */ leak (tatemono wraps in block comment)
    .replace(/\*\/\s*$/, '')
    .trim()

  return `// ============================================================
// ARKZEN GENERATED SCRIPT — ${tatemono.meta.name}
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${cleanScript}
`
}

// ─────────────────────────────────────────────
// GENERATE NAMED SCRIPT FILES — v6.5
// Each @arkzen:script:name block → {name}.{scriptName}.script.ts
// Named scripts are imported individually by components or pages that need them.
// ─────────────────────────────────────────────

function generateNamedScriptFiles(tatemono: ParsedTatemono, generatedDir: string): string[] {
  const written: string[] = []

  for (const section of tatemono.scripts) {
    // Re-extract the name from the raw content position in the full file
    // extractAllNamedSections stores the raw between open comment and :end
    // We need to recover the identifier by scanning the original file content
    const fileContent = fs.readFileSync(tatemono.filePath, 'utf-8')
    const openPattern = `/* @arkzen:script:`
    let searchFrom = 0
    let scriptName: string | null = null

    while (true) {
      const openIdx = fileContent.indexOf(openPattern, searchFrom)
      if (openIdx === -1) break
      if (openIdx === section.start) {
        const afterOpen = fileContent.slice(openIdx + openPattern.length)
        const identMatch = afterOpen.match(/^([a-zA-Z0-9_-]+)/)
        if (identMatch && identMatch[1] !== 'end') {
          scriptName = identMatch[1]
        }
        break
      }
      searchFrom = openIdx + openPattern.length
    }

    if (!scriptName) continue

    const { strippedSources } = resolveImports([section.raw], {
      reactHooks:  [],
      framerNamed: [],
    })

    const cleanScript = strippedSources[0]
      .replace(/\*\/\s*$/, '')
      .trim()

    const fileName = `${tatemono.meta.name}.${scriptName}.script.ts`
    const filePath = path.join(generatedDir, fileName)
    const fileOut = `// ============================================================
// ARKZEN GENERATED SCRIPT — ${tatemono.meta.name}/${scriptName}
// Source: @arkzen:script:${scriptName}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${cleanScript}
`
    atomicWrite(filePath, fileOut)
    console.log(`[Arkzen Router] ✓ Named script: ${fileName}`)
    written.push(fileName)
  }

  return written
}

// ─────────────────────────────────────────────
// GENERATE CUSTOM LAYOUTS
// ─────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono, baseDir: string): void {
  if (tatemono.layouts.length === 0) return

  const customLayoutDir = path.join(
    path.resolve(process.cwd(), 'arkzen', 'core', 'layouts', 'custom')
  )
  fs.mkdirSync(customLayoutDir, { recursive: true })

  for (const layout of tatemono.layouts) {
    // Resolve imports in the layout block itself
    const { canonicalBlock, strippedSources } = resolveImports([layout.raw], {
      reactHooks:  [],
      framerNamed: [],
    })

    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(customLayoutDir, fileName)
    const content  = `'use client'
// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name}
// Generated from tatemono: ${tatemono.meta.name}

${canonicalBlock}

${strippedSources[0]}
`
    atomicWrite(filePath, content)
    console.log(`[Arkzen Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─────────────────────────────────────────────
// GENERATE ERROR HANDLER FILES — v6
// ─────────────────────────────────────────────

function generateNotFoundFile(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const { canonicalBlock, strippedSources } = resolveImports([handler.raw], {
    reactHooks:  [],
    framerNamed: [],
    extra: `import { ErrorScreen } from './components/ErrorScreen'`,
  })
  const strippedRaw = strippedSources[0].trim()

  return `// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/not-found.tsx
// Next.js segment-scoped 404 handler.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:404 block in the tatemono instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${strippedRaw}

export default NotFoundPage
`
}

function generateErrorFile(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const { canonicalBlock, strippedSources } = resolveImports([handler.raw], {
    reactHooks:  [],
    framerNamed: [],
    extra: `import { ErrorScreen } from './components/ErrorScreen'`,
  })
  const strippedRaw = strippedSources[0].trim()

  return `'use client'
// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/error.tsx
// Next.js segment-scoped runtime error boundary.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:500 block in the tatemono instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${strippedRaw}

export default function ArkzenError_${toPascalCase(tatemono.meta.name)}({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ServerErrorPage reset={reset} />
}
`
}

function generateCatchAllRoute(tatemono: ParsedTatemono, tatemonoDir: string): void {
  const catchAllDir = path.join(tatemonoDir, '[...catchAll]')
  fs.mkdirSync(catchAllDir, { recursive: true })
  const content = `import { notFound } from 'next/navigation'

export default function CatchAllPage() {
  notFound()
}
`
  atomicWrite(path.join(catchAllDir, 'page.tsx'), content)
  console.log(`[Arkzen Router] ✓ Catch-all route created for ${tatemono.meta.name}`)
}

function generateErrorHandlers(tatemono: ParsedTatemono, tatemonoDir: string): void {
  if (!tatemono.errorHandlers || tatemono.errorHandlers.length === 0) return

  let has404 = false
  for (const handler of tatemono.errorHandlers) {
    if (handler.type === '404') {
      has404 = true
      const content = generateNotFoundFile(tatemono, handler)
      atomicWrite(path.join(tatemonoDir, 'not-found.tsx'), content)
      console.log(`[Arkzen Router] ✓ Error handler: not-found.tsx → /${tatemono.meta.name}/**`)
    } else if (handler.type === '500') {
      const content = generateErrorFile(tatemono, handler)
      atomicWrite(path.join(tatemonoDir, 'error.tsx'), content)
      console.log(`[Arkzen Router] ✓ Error handler: error.tsx → /${tatemono.meta.name}/**`)
    }
  }
  if (has404) {
    generateCatchAllRoute(tatemono, tatemonoDir)
  }
}

// ─────────────────────────────────────────────
// GENERATE TATEMONO LAYOUT — v9.0
// Injects full head metadata from @arkzen:meta:web into Next.js layout.tsx
// Covers: title, description, favicon, OG tags, Twitter cards.
// Falls back to meta.favicon (deprecated) for old tatemonos.
// ─────────────────────────────────────────────

function generateTatemonoLayout(tatemono: ParsedTatemono, tatemonoDir: string): void {
  const hasGlobalStyle = tatemono.styles.some(s => !s.name)
  const webMeta        = tatemono.webMeta
  const meta           = tatemono.meta

  // Resolve values — webMeta takes priority, meta is fallback
  const favicon     = webMeta?.favicon ?? meta.favicon
  const title       = webMeta?.title ?? webMeta?.label ?? meta.name
  const description = webMeta?.description ?? meta.description
  const og          = webMeta?.og
  const twitter     = webMeta?.twitter

  const hasAnyMeta = !!(favicon || title || description || og || twitter || webMeta)

  if (!hasAnyMeta && !hasGlobalStyle) {
    const stale = path.join(tatemonoDir, 'layout.tsx')
    if (fs.existsSync(stale)) {
      fs.unlinkSync(stale)
      console.log(`[Arkzen Router] 🧹 Removed stale layout.tsx (no meta:web or global style)`)
    }
    return
  }

  const globalImport   = hasGlobalStyle ? `import './styles/global.css'\n` : ''
  const metadataImport = hasAnyMeta ? `import type { Metadata } from 'next'\n` : ''

  // Build icons block
  const iconsBlock = favicon
    ? (() => {
        const isEmoji = [...favicon].length <= 2
        if (isEmoji) {
          return `  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${favicon}</text></svg>" },\n`
        }
        return `  icons: { icon: '${favicon}' },\n`
      })()
    : ''

  // Build openGraph block
  const ogBlock = (og || title || description)
    ? `  openGraph: {\n` +
      (og?.type        ? `    type: '${og.type}',\n` : `    type: 'website',\n`) +
      `    title: '${(og?.title ?? title).replace(/'/g, "\\'")}',\n` +
      (og?.description || description ? `    description: '${((og?.description ?? description) ?? '').replace(/'/g, "\\'")}',\n` : '') +
      (og?.image ? `    images: ['${og.image}'],\n` : '') +
      (og?.url   ? `    url: '${og.url}',\n` : '') +
      `  },\n`
    : ''

  // Build twitter block
  const twitterBlock = twitter
    ? `  twitter: {\n` +
      `    card: '${twitter.card ?? 'summary_large_image'}',\n` +
      (twitter.title       || title       ? `    title: '${((twitter.title ?? title) ?? '').replace(/'/g, "\\'")}',\n` : '') +
      (twitter.description || description ? `    description: '${((twitter.description ?? description) ?? '').replace(/'/g, "\\'")}',\n` : '') +
      (twitter.image ? `    images: ['${twitter.image}'],\n` : '') +
      `  },\n`
    : ''

  const metadataCode = hasAnyMeta
    ? `export const metadata: Metadata = {\n` +
      `  title: '${title.replace(/'/g, "\\'")}',\n` +
      (description ? `  description: '${description.replace(/'/g, "\\'")}',\n` : '') +
      iconsBlock +
      ogBlock +
      twitterBlock +
      `}\n`
    : ''

  const content = `// ============================================================
// ARKZEN GENERATED LAYOUT — ${meta.name} [Next.js]
// Auto-generated from @arkzen:meta:web — do not edit directly.
// ============================================================
${metadataImport}${globalImport}
${hasAnyMeta ? metadataCode + '\n' : ''}export default function ${toPascalCase(meta.name)}Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
`
  atomicWrite(path.join(tatemonoDir, 'layout.tsx'), content)
  if (hasGlobalStyle)  console.log(`[Arkzen Router] ✓ Global style imported in layout`)
  if (favicon)         console.log(`[Arkzen Router] ✓ Favicon: ${favicon}`)
  if (description)     console.log(`[Arkzen Router] ✓ Description meta injected`)
  if (og)              console.log(`[Arkzen Router] ✓ Open Graph meta injected`)
  if (twitter)         console.log(`[Arkzen Router] ✓ Twitter card meta injected`)
}

// ─────────────────────────────────────────────
// GENERATE CSS STYLES (shared emitter)
// ─────────────────────────────────────────────

function generateStyleFiles(tatemono: ParsedTatemono, tatemonoDir: string): void {
  emitTatemonoStyles(tatemono, tatemonoDir, { loggerLabel: 'Arkzen Router' })
}

// ─────────────────────────────────────────────
// GENERATE ROOT REDIRECT — v5.1
// ─────────────────────────────────────────────

function generateRootRedirect(tatemono: ParsedTatemono): string {
  const pages    = tatemono.pages
  const hasIndex = pages.some(p => p.name === 'index')
  if (hasIndex) return ''

  const firstGuest = pages.find(p => p.layout === 'guest')
  const firstAuth  = pages.find(p => p.layout === 'auth')
  const firstPage  = pages[0]

  const target = tatemono.meta.auth
    ? (firstGuest ?? firstAuth ?? firstPage)
    : (firstAuth  ?? firstGuest ?? firstPage)

  if (!target) return ''

  const destination = `/${tatemono.meta.name}/${target.name}`

  return `// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — ${tatemono.meta.name}
// Visiting /${tatemono.meta.name} redirects to ${destination}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

import { redirect } from 'next/navigation'

export default function ArkzenRoot_${toPascalCase(tatemono.meta.name)}() {
  redirect('${destination}')
}
`
}

export function registerPage(tatemono: ParsedTatemono): void {
  const routerType = detectRouterType()
  const animFnName = tatemono.animation
    ? toCamelCase(tatemono.meta.name) + 'Animations'
    : null

  console.log(`[Arkzen Router] Registering ${tatemono.pages.length} page(s) for: ${tatemono.meta.name}`)

  // Generate animation file if present
  if (tatemono.animation) {
    const generatedDir = path.resolve(process.cwd(), 'arkzen', 'generated')
    fs.mkdirSync(generatedDir, { recursive: true })
    const animContent = generateAnimationFile(tatemono)
    if (animContent) {
      const animPath = path.join(generatedDir, `${tatemono.meta.name}.animations.ts`)
      atomicWrite(animPath, animContent)
      console.log(`[Arkzen Router] ✓ Animation file generated`)
    }
  }

  // v6.5: Generate global script file if present
  if (tatemono.script) {
    const generatedDir = path.resolve(process.cwd(), 'arkzen', 'generated')
    fs.mkdirSync(generatedDir, { recursive: true })
    const scriptContent = generateScriptFile(tatemono)
    if (scriptContent) {
      const scriptPath = path.join(generatedDir, `${tatemono.meta.name}.scripts.ts`)
      atomicWrite(scriptPath, scriptContent)
      console.log(`[Arkzen Router] ✓ Global script file generated`)
    }
  }

  // v6.5: Generate named script files if present
  if (tatemono.scripts && tatemono.scripts.length > 0) {
    const generatedDir = path.resolve(process.cwd(), 'arkzen', 'generated')
    fs.mkdirSync(generatedDir, { recursive: true })
    generateNamedScriptFiles(tatemono, generatedDir)
  }

  // Generate custom layouts
  generateCustomLayouts(tatemono, '')

  if (routerType === 'app') {
    const tatemonoDir = path.join(APP_DIR, tatemono.meta.name)
    fs.mkdirSync(tatemonoDir, { recursive: true })

    generateIndividualComponentFiles(tatemono, tatemonoDir)
    generateErrorHandlers(tatemono, tatemonoDir)
    generateTatemonoLayout(tatemono, tatemonoDir)
    generateStyleFiles(tatemono, tatemonoDir)

    const rootRedirect = generateRootRedirect(tatemono)
    if (rootRedirect) {
      atomicWrite(path.join(tatemonoDir, 'page.tsx'), rootRedirect)
      const target = tatemono.meta.auth
        ? (tatemono.pages.find(p => p.layout === 'guest') ?? tatemono.pages[0])
        : tatemono.pages[0]
      console.log(`[Arkzen Router] ✓ /${tatemono.meta.name} → redirect to /${tatemono.meta.name}/${target?.name}`)
    }

    for (const page of tatemono.pages) {
      if (page.name === 'index') {
        const pagePath = path.join(tatemonoDir, 'page.tsx')
        const pageContent = generatePageFile(tatemono, page, animFnName, './components')
        atomicWrite(pagePath, pageContent)
        console.log(`[Arkzen Router] ✓ /${tatemono.meta.name} [${page.layout}]`)
      } else {
        const pageDir = path.join(tatemonoDir, page.name)
        fs.mkdirSync(pageDir, { recursive: true })
        const pageContent = generatePageFile(tatemono, page, animFnName, '../components')
        atomicWrite(path.join(pageDir, 'page.tsx'), pageContent)
        console.log(`[Arkzen Router] ✓ /${tatemono.meta.name}/${page.name} [${page.layout}]`)
      }
    }
  } else {
    const tatemonoDir = path.join(PAGES_DIR, tatemono.meta.name)
    fs.mkdirSync(tatemonoDir, { recursive: true })

    generateIndividualComponentFiles(tatemono, tatemonoDir)
    generateErrorHandlers(tatemono, tatemonoDir)
    generateStyleFiles(tatemono, tatemonoDir)

    const rootRedirectPages = generateRootRedirect(tatemono)
    if (rootRedirectPages) {
      atomicWrite(path.join(tatemonoDir, 'index.tsx'), rootRedirectPages)
      const target = tatemono.meta.auth
        ? (tatemono.pages.find(p => p.layout === 'guest') ?? tatemono.pages[0])
        : tatemono.pages[0]
      console.log(`[Arkzen Router] ✓ /${tatemono.meta.name} → redirect to /${tatemono.meta.name}/${target?.name}`)
    }

    for (const page of tatemono.pages) {
      if (page.name === 'index') {
        const pagePath = path.join(tatemonoDir, 'index.tsx')
        const pageContent = generatePageFile(tatemono, page, animFnName, './components')
        atomicWrite(pagePath, pageContent)
        console.log(`[Arkzen Router] ✓ /${tatemono.meta.name} [${page.layout}]`)
      } else {
        const pageDir = path.join(tatemonoDir, page.name)
        fs.mkdirSync(pageDir, { recursive: true })
        const pageContent = generatePageFile(tatemono, page, animFnName, '../components')
        atomicWrite(path.join(pageDir, 'index.tsx'), pageContent)
        console.log(`[Arkzen Router] ✓ /${tatemono.meta.name}/${page.name} [${page.layout}]`)
      }
    }
  }

  console.log(`[Arkzen Router] ✓ All pages registered for: ${tatemono.meta.name}`)

  try {
    const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
    const assetsPath = path.join(tatemonosDir, tatemono.meta.name, 'assets')
    const publicDir = path.resolve(process.cwd(), 'public')
    cleanOldAssets(tatemono.meta.name, publicDir)
    const hasAssets = copyAssetsToPublic(tatemono.meta.name, assetsPath, publicDir)
    if (!hasAssets) {
      console.log(`[Arkzen Assets] No assets folder for ${tatemono.meta.name}`)
    }
  } catch (e) {
    console.log(`[Arkzen Assets] ⚠ Asset distribution skipped: ${e}`)
  }

  try {
    const registry = getRegistry()
    writeSitemap(registry)
    writeRobotsTxt()
  } catch (e) {
    console.log(`[Arkzen Router] ⚠ Sitemap generation skipped`)
  }
}

// ─────────────────────────────────────────────
// WRITE ROBOTS.TXT
// ─────────────────────────────────────────────

function writeRobotsTxt(): void {
  const publicDir = path.resolve(process.cwd(), 'public')
  fs.mkdirSync(publicDir, { recursive: true })

  const robotsPath = path.join(publicDir, 'robots.txt')
  const content = `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap.xml
`
  atomicWrite(robotsPath, content)
  console.log(`[Arkzen Router] ✓ robots.txt generated`)
}

// ─────────────────────────────────────────────
// UNREGISTER — two modes
// ─────────────────────────────────────────────

export function softUnregisterPage(tatemononName: string): void {
  console.log(`[Arkzen Router] Soft-unregistering (rebuild): ${tatemononName}`)
  const generatedDir = path.resolve(process.cwd(), 'arkzen', 'generated')

  const animationPath = path.join(generatedDir, `${tatemononName}.animations.ts`)
  if (fs.existsSync(animationPath)) {
    fs.unlinkSync(animationPath)
    console.log(`[Arkzen Router] ✓ Animation file removed`)
  }

  // v6.5: clean up global script file
  const scriptPath = path.join(generatedDir, `${tatemononName}.scripts.ts`)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath)
    console.log(`[Arkzen Router] ✓ Global script file removed`)
  }

  // v6.5: clean up named script files
  try {
    const files = fs.readdirSync(generatedDir)
    for (const file of files) {
      if (file.startsWith(`${tatemononName}.`) && file.endsWith('.script.ts')) {
        fs.unlinkSync(path.join(generatedDir, file))
        console.log(`[Arkzen Router] ✓ Named script removed: ${file}`)
      }
    }
  } catch { /* ignore */ }
}

export function unregisterPage(tatemononName: string): void {
  console.log(`[Arkzen Router] Unregistering: ${tatemononName}`)
  const routerType = detectRouterType()

  if (routerType === 'app') {
    const tatemonoDir = path.join(APP_DIR, tatemononName)
    if (fs.existsSync(tatemonoDir)) {
      fs.rmSync(tatemonoDir, { recursive: true })
      console.log(`[Arkzen Router] ✓ Removed: ${tatemonoDir}`)
    }
  } else {
    const tatemonoDir = path.join(PAGES_DIR, tatemononName)
    if (fs.existsSync(tatemonoDir)) {
      fs.rmSync(tatemonoDir, { recursive: true })
      console.log(`[Arkzen Router] ✓ Removed: ${tatemonoDir}`)
    }
  }

  const animationPath = path.resolve(
    process.cwd(), 'arkzen', 'generated', `${tatemononName}.animations.ts`
  )
  if (fs.existsSync(animationPath)) {
    fs.unlinkSync(animationPath)
    console.log(`[Arkzen Router] ✓ Animation file removed`)
  }

  // v6.5: clean up global script + named script files
  const generatedDir = path.resolve(process.cwd(), 'arkzen', 'generated')
  const scriptPath = path.join(generatedDir, `${tatemononName}.scripts.ts`)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath)
    console.log(`[Arkzen Router] ✓ Global script file removed`)
  }
  try {
    const files = fs.readdirSync(generatedDir)
    for (const file of files) {
      if (file.startsWith(`${tatemononName}.`) && file.endsWith('.script.ts')) {
        fs.unlinkSync(path.join(generatedDir, file))
        console.log(`[Arkzen Router] ✓ Named script removed: ${file}`)
      }
    }
  } catch { /* ignore */ }
}

// ─────────────────────────────────────────────
// STRING HELPERS
// ─────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

function toCamelCase(str: string): string {
  const p = toPascalCase(str)
  return p.charAt(0).toLowerCase() + p.slice(1)
}

function toSafeComponentName(pageName: string): string {
  const pascal = toPascalCase(pageName)
  return /^\d/.test(pascal) ? `Page${pascal}` : pascal
}