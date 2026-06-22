// ============================================================
// ARKZEN ENGINE — VITE ROUTER v2.1
// React+Vite stack equivalent of router.ts
// Reads same ParsedTatemono, generates Vite-compatible output:
//   src/pages/{tatName}/{pageName}.tsx                  ← page components
//   src/pages/{tatName}/components/{Name}.tsx           ← per-component files (real code)
//   src/pages/{tatName}/components/constants.tsx        ← shared ALL_CAPS constants
//   src/pages/{tatName}/components/hooks.tsx            ← custom hooks
//   src/pages/{tatName}/components/utils.tsx            ← utility functions
//   src/pages/{tatName}/components/types.ts             ← shared TypeScript types
//   src/pages/{tatName}/not-found.tsx                   ← 404 handler (if declared)
//   src/pages/{tatName}/error-boundary.tsx              ← 500 boundary (if declared)
//   src/arkzen/generated/routes.ts                      ← React Router route registry
//   src/arkzen/generated/{name}.animations.ts           ← GSAP animations
//
// v2.1 — full parity with Next.js router.ts per-file component generation:
//   • generateIndividualComponentFiles() now writes REAL code into each
//     component file (not re-exports from a _components.tsx barrel).
//     Mirrors Next.js exactly: constants.tsx, hooks.tsx, utils.tsx, types.ts,
//     plus one {Name}.tsx per component containing its actual declaration.
//   • generateComponentsIndex() removed — no longer needed.
//   • generatePageFile() now uses page sources ONLY (no component inlining).
//     Imports each component via `import { X } from './components/X'`.
//     Smart per-page imports for constants/hooks/utils/types via findReferencedNames().
//     Forwards non-react/framer-motion imports from component blocks that the
//     page references but doesn't itself import (e.g. gsap, ScrollTrigger).
//   • New helpers ported from Next.js router:
//     extractComponentNames, extractSharedConstantNames, extractCustomHookNames,
//     extractSharedTypeNames, extractUtilityFunctionNames,
//     findReferencedNames, splitComponentDeclarations.
//   • stripTemplateLiterals() kept (was already present); now shared by all extractors.
//
// v1.x history preserved below for reference:
//   v1.2: strip double `export default`, normalize animation fn, auto-detect memo/hooks
//   v1.3: ENGINE_OWNED_MODULES framer-motion, unified framer scrape
//   v1.4: @arkzen:error:404 → not-found.tsx, @arkzen:error:500 → error-boundary.tsx
//   v2.0: resolveImports() + flattenMultilineImports() unified import resolver
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage, ArkzenLayout, ArkzenErrorHandler } from '../types'
import { emitTatemonoStyles } from './lib/dsl-style-emitter'
import { copyAssetsToPublic, cleanOldAssets } from './assets'
import { writeSitemap } from './sitemap'
import { getRegistry } from './registry'

const SRC_DIR       = path.resolve(process.cwd(), 'src')
const PAGES_DIR     = path.join(SRC_DIR, 'pages')
const GENERATED_DIR = path.join(SRC_DIR, 'arkzen', 'generated')
const LAYOUTS_DIR   = path.join(process.cwd(), 'arkzen', 'core', 'layouts', 'custom')
const ROUTES_FILE   = path.join(GENERATED_DIR, 'routes.ts')


// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

function stripNextImports(raw: string): string {
  return raw
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/navigation['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/router['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+Link\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/image['"][ \t]*;?[ \t]*\r?\n?/gm, '')
}

function normalizeRouterCalls(raw: string): string {
  let out = raw
  const navigateVars = [...out.matchAll(/\bconst\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*useNavigate\(\)/g)]
    .map(m => m[1])

  for (const varName of navigateVars) {
    out = out
      .replace(new RegExp(`\\b${varName}\\.push\\(`, 'g'), `${varName}(`)
      .replace(new RegExp(`\\b${varName}\\.replace\\(`, 'g'), `${varName}(`)
      .replace(new RegExp(`\\b${varName}\\.refresh\\(\\)`, 'g'), `window.location.reload()`)
  }

  return out
}

function normalizeForVite(raw: string): string {
  return normalizeRouterCalls(
    stripNextImports(raw)
      .replace(/^[ \t]*['"]use client['"][ \t]*;?[ \t]*\r?\n?/gm, '')
      .replace(/\busePathname\(\)/g, 'useLocation().pathname')
      .replace(/\buseRouter\b/g, 'useNavigate')
      .replace(/(<Link\b[^>]*?)\bhref=/g, '$1to=')
      .replace(/process\.env\.NEXT_PUBLIC_(\w+)/g, 'import.meta.env.VITE_$1')
  )
}

function ensureRouterDomImports(raw: string): string {
  const needsNavigate = /\buseNavigate\s*\(/.test(raw)
  const needsLocation = /\buseLocation\s*\(/.test(raw)
  const needsLink = /<Link\b/.test(raw)
  const needed = [
    needsNavigate && 'useNavigate',
    needsLocation && 'useLocation',
    needsLink && 'Link',
  ].filter(Boolean) as string[]

  if (needed.length === 0) return raw

  const importRegex = /^import\s+\{([^}]*)\}\s+from\s+['"]react-router['"][ \t]*;?[ \t]*$/m
  const existing = raw.match(importRegex)
  if (!existing) {
    return `import { ${needed.join(', ')} } from 'react-router'\n${raw}`
  }

  const existingSpecifiers = existing[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const merged = [...new Set([...existingSpecifiers, ...needed])].sort()
  return raw.replace(importRegex, `import { ${merged.join(', ')} } from 'react-router'`)
}

// ─── Unified import resolver — v5.1 port ─────────────────────────────────────
//
// Scrapes ALL import statements from any raw code strings,
// deduplicates named exports per module, normalises default
// vs named gsap import, and returns:
//   - canonicalBlock  : the final import block string
//   - strippedSources : the raw code strings with all import
//                       lines and 'use client' removed
//
// Engine-owned modules ('react', 'framer-motion') are always seeded
// from engineRequired and stripped from author sources — one canonical
// line is emitted regardless of what the author wrote.

interface ResolvedImports {
  canonicalBlock: string
  strippedSources: string[]
}

const ENGINE_OWNED_MODULES = new Set([
  'react',
  'framer-motion',
])

function resolveImports(
  sources: string[],
  engineRequired: {
    reactHooks?: string[]        // always-needed React hooks (useRef, useEffect)
    framerNamed?: string[]       // always-needed framer-motion named exports (motion)
    extra?: string               // any extra single-line imports to prepend verbatim
    forceReact?: boolean         // emit an `import React ...` line even if unused (default true)
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
        if (mod === 'react') continue
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
  const forceReact = engineRequired.forceReact ?? true
  if (forceReact || reactNamed.length > 0) {
    lines.push(
      reactNamed.length > 0
        ? `import React, { ${reactNamed.join(', ')} } from 'react'`
        : `import React from 'react'`
    )
  }

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

// ─── Extract component name ───────────────────────────────────────────────────
/**
 * Extracts the React component name from raw page code.
 * Looks for "const XxxPage = " or "const XxxPage: " patterns.
 * Falls back to toPascalCase(pageName) + 'Page' if not found.
 */
function extractComponentName(pageName: string, raw: string): string {
  const match = raw.match(/const\s+([A-Za-z_$][A-Za-z0-9_$]*Page)\s*[=:(]/)
  if (match) return match[1]
  return toPascalCase(pageName) + 'Page'
}

// ─── Layout helpers v11.0 ─────────────────────────────────────────────────────

function parsePageLayoutDecl(raw: string): { guard?: 'auth' | 'guest'; layout?: string } {
  const t = raw.trim()
  const m = t.match(/^\+?(auth|guest)(?::([a-zA-Z0-9_-]+))?$/)
  if (m) return { guard: m[1] as 'auth' | 'guest', layout: m[2] ?? undefined }
  if (t === 'auth')  return { guard: 'auth' }
  if (t === 'guest') return { guard: 'guest' }
  return { layout: t || undefined }
}

function resolveLayoutChain(layoutName: string, allLayouts: ArkzenLayout[]): string[] {
  const chain: string[] = []
  const visited = new Set<string>()
  let current: string | undefined = layoutName
  while (current) {
    if (visited.has(current)) throw new Error(`[Arkzen Vite Router] Layout chain cycle at: "${current}"`)
    visited.add(current)
    chain.unshift(current)
    current = allLayouts.find(l => l.name === current)?.parent
  }
  return chain
}

function getLayoutImport(layout: string, tatName: string): string {
  switch (layout) {
    case 'guest': return `import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'`
    case 'auth':  return `import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'`
    default:      return `import { ${toPascalCase(layout)}Layout } from '@/arkzen/core/layouts/custom/${tatName}-${layout}'`
  }
}

function getLayoutComponent(layout: string): string {
  switch (layout) {
    case 'guest': return 'GuestLayout'
    case 'auth':  return 'AuthLayout'
    default:      return `${toPascalCase(layout)}Layout`
  }
}

function buildLayoutJSX(
  page: ArkzenPage,
  tatemono: ParsedTatemono
): { imports: string[]; openTags: string; closeTags: string } {
  const decl    = parsePageLayoutDecl(page.layout)
  const imports: string[] = []
  const opens:   string[] = []
  const closes:  string[] = []
  const tatName  = tatemono.meta.name

  if (decl.layout) {
    for (const name of resolveLayoutChain(decl.layout, tatemono.layouts)) {
      imports.push(getLayoutImport(name, tatName))
      const comp = getLayoutComponent(name)
      opens.push(`<${comp}>`)
      closes.unshift(`</${comp}>`)
    }
  }
  if (decl.guard) {
    const isGuestOnly = decl.guard === 'guest' && tatemono.meta.auth &&
      ['login', 'register', 'forgot-password', 'reset-password'].includes(page.name)
    imports.push(getLayoutImport(decl.guard, tatName))
    const comp  = getLayoutComponent(decl.guard)
    const props = decl.guard === 'auth' ? ' requireAuth={true}' : isGuestOnly ? ' guestOnly={true}' : ''
    opens.push(`<${comp}${props}>`)
    closes.unshift(`</${comp}>`)
  }
  return { imports, openTags: opens.join('\n    '), closeTags: closes.join('\n    ') }
}

// ─── Template literal stripper ────────────────────────────────────────────────
// Replaces template literal STATIC content char-for-char with whitespace so
// character indices are preserved for splitComponentDeclarations slicing.
// ${...} expression content is kept verbatim so identifiers inside them
// remain visible to findReferencedNames (e.g. REVERB_SCHEME in `${REVERB_SCHEME}://...`).

function stripTemplateLiterals(src: string): string {
  let result = ''
  let i = 0
  while (i < src.length) {
    if (src[i] === '`') {
      result += ' ' // placeholder for opening backtick
      i++ // skip opening backtick
      while (i < src.length) {
        if (src[i] === '\\') { result += '  '; i += 2; continue }  // escaped char — 2 spaces
        if (src[i] === '`') { result += ' '; i++; break }             // closing backtick
        // Preserve ${...} expression content verbatim so identifiers stay visible
        if (src[i] === '$' && src[i + 1] === '{') {
          result += '  ' // placeholders for '${' 
          i += 2
          let depth = 1
          while (i < src.length && depth > 0) {
            if (src[i] === '{') depth++
            else if (src[i] === '}') {
              depth--
              if (depth === 0) { result += '}'; i++; break }
            }
            result += src[i]  // emit verbatim so identifiers remain visible
            i++
          }
          continue
        }
        result += ' ' // replace static text char-for-char with whitespace
        i++
      }
    } else {
      result += src[i]
      i++
    }
  }
  return result
}

// ─── Component / declaration name extractors (ported from Next.js router) ────

/**
 * Extracts PascalCase component names from @arkzen:components blocks.
 * Skips ALL_CAPS constants and anything inside template literals.
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
 * Extracts ALL_CAPS shared constant names (e.g. NAV_LINKS, CHAPTERS).
 * These are written to components/constants.tsx.
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
 * Extracts custom React hook names (use[A-Z]...) from @arkzen:components.
 * Written to components/hooks.tsx.
 */
function extractCustomHookNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const component of tatemono.components) {
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

/**
 * Extracts TypeScript type alias and interface names from @arkzen:components.
 * Written to components/types.ts.
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
    const ifaceMatches = stripped.match(/(?:export\s+)?interface\s+([A-Z][A-Za-z0-9_$]*)\s*[{<]/g) || []
    for (const match of ifaceMatches) {
      const name = match.match(/interface\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name) names.add(name)
    }
  }
  return names
}

/**
 * Extracts camelCase utility function/const names from @arkzen:components.
 * Written to components/utils.tsx. Excludes React components (PascalCase),
 * custom hooks (use[A-Z]...), ALL_CAPS constants, and type/interface names.
 */
function extractUtilityFunctionNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  const componentNames = extractComponentNames(tatemono)
  for (const component of tatemono.components) {
    const stripped = stripTemplateLiterals(component.raw)
    let src = stripped
    for (const compName of componentNames) {
      const esc = compName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      src = src.replace(
        new RegExp(
          `(?:export\\s+)?const\\s+${esc}\\s*=[\\s\\S]*?(?=(?:export\\s+)?(?:const|function|type|interface)\\s+[A-Za-z_$]|$)`,
          'g'
        ),
        ''
      )
    }
    const constMatches = src.match(/(?:export\s+)?const\s+([a-z][A-Za-z0-9_$]*)\s*[=:(]/g) || []
    for (const match of constMatches) {
      const name = match.match(/const\s+([a-z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^use[A-Z]/.test(name)) names.add(name)
    }
    const fnMatches = src.match(/(?:export\s+)?function\s+([a-z][A-Za-z0-9_$]*)\s*[(<]/g) || []
    for (const match of fnMatches) {
      const name = match.match(/function\s+([a-z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^use[A-Z]/.test(name)) names.add(name)
    }
  }
  return names
}

/**
 * Returns the subset of names from the given set that are actually referenced
 * (used, not just declared) somewhere in strippedSource.
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

/**
 * Splits a stripped components-block source into per-declaration chunks keyed
 * by declaration name. Leading comment/blank lines are pulled into each chunk.
 */
function splitComponentDeclarations(rawSource: string, names: Set<string>): Map<string, string> {
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

// ─── Individual component files ───────────────────────────────────────────────
// Full parity with Next.js generateIndividualComponentFiles():
//   • Each component gets its OWN file containing its actual code (not a re-export)
//   • Shared constants → components/constants.tsx
//   • Custom hooks     → components/hooks.tsx
//   • Utility fns      → components/utils.tsx
//   • Shared types     → components/types.ts
//   • Stale _components.tsx / index.ts barrels are cleaned up

function generateIndividualComponentFiles(tatemono: ParsedTatemono, tatDir: string): void {
  const componentsDir = path.join(tatDir, 'components')

  if (tatemono.components.length === 0) {
    if (fs.existsSync(componentsDir)) {
      fs.rmSync(componentsDir, { recursive: true })
      console.log(`[Arkzen Vite Router] 🧹 Removed stale components/ (no @arkzen:components)`)
    }
    return
  }

  fs.mkdirSync(componentsDir, { recursive: true })

  // Resolve imports across ALL component blocks into one canonical block —
  // every per-component file gets this same canonical import set.
  const rawSources = tatemono.components.map(c => normalizeForVite(c.raw.trim()))

  // Detect react-router needs across ALL component sources so Link/useNavigate/useLocation
  // are injected even when the original tatemono imported them from next/link or next/navigation
  // (those are stripped by normalizeForVite, leaving the JSX usage but no import).
  const combinedComponentRaw = rawSources.join('\n')
  const compNeedsNavigate = /\buseNavigate\s*\(/.test(combinedComponentRaw)
  const compNeedsLocation = /\buseLocation\s*\(/.test(combinedComponentRaw)
  const compNeedsLink     = /<Link\b/.test(combinedComponentRaw)
  const routerSpecifiers  = [
    compNeedsNavigate && 'useNavigate',
    compNeedsLocation && 'useLocation',
    compNeedsLink     && 'Link',
  ].filter(Boolean) as string[]
  // Build a synthetic react-router import line and pass it as `extra` so it
  // goes through resolveImports deduplication alongside any explicit react-router
  // imports already in the source. resolveImports scrapes `extra` lines too,
  // so there will be no duplicate — the canonical block merges them.
  const routerImportExtra = routerSpecifiers.length > 0
    ? `import { ${routerSpecifiers.join(', ')} } from 'react-router'`
    : undefined

  // Prepend the router import to rawSources so resolveImports scrapes and
  // deduplicates it together with any explicit react-router imports in author code.
  const sourcesWithRouter = routerImportExtra
    ? [routerImportExtra, ...rawSources]
    : rawSources

  const { canonicalBlock, strippedSources: allStripped } = resolveImports(sourcesWithRouter)
  // Drop the synthetic router-import source from strippedSources — it was only
  // needed for deduplication, not for actual code output.
  const strippedSources = routerImportExtra ? allStripped.slice(1) : allStripped

  // Build CSS-module map
  const stylesByComponent = new Map<string, string>()
  for (const style of tatemono.styles.filter((s): s is typeof s & { name: string } => !!s.name)) {
    stylesByComponent.set(style.name, style.name)
  }

  const extractedComponents = extractComponentNames(tatemono)
  const sharedConstants     = extractSharedConstantNames(tatemono)
  const customHooks         = extractCustomHookNames(tatemono)
  const sharedTypes         = extractSharedTypeNames(tatemono)
  const utilityFunctions    = extractUtilityFunctionNames(tatemono)
  const allDeclaredNames    = new Set([...extractedComponents, ...sharedConstants, ...customHooks, ...sharedTypes, ...utilityFunctions])

  // Split each stripped source into per-declaration chunks
  const declarationsByName = new Map<string, string>()
  for (const stripped of strippedSources) {
    for (const [name, code] of splitComponentDeclarations(stripped, allDeclaredNames)) {
      declarationsByName.set(name, code)
    }
  }

  // ── Shared constants file ────────────────────────────────────────────────────
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
      const content = `// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — ${tatemono.meta.name} [React+Vite]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${constChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'constants.tsx'), content, 'utf-8')
      console.log(`[Arkzen Vite Router] ✓ Shared constants: constants.tsx`)
    }
  } else {
    for (const stale of ['constants.tsx', 'constants.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Vite Router] 🧹 Removed stale ${stale}`) }
    }
  }

  // ── Custom hooks file ────────────────────────────────────────────────────────
  if (customHooks.size > 0) {
    const hookChunks = [...customHooks]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(const|function)(\\s+${esc}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })
    if (hookChunks.length > 0) {
      const content = `// ============================================================
// ARKZEN GENERATED HOOKS — ${tatemono.meta.name} [React+Vite]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${hookChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'hooks.tsx'), content, 'utf-8')
      console.log(`[Arkzen Vite Router] ✓ Custom hooks: hooks.tsx (${[...customHooks].join(', ')})`)
    }
  } else {
    for (const stale of ['hooks.tsx', 'hooks.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Vite Router] 🧹 Removed stale ${stale}`) }
    }
  }

  // ── Utility functions file ───────────────────────────────────────────────────
  if (utilityFunctions.size > 0) {
    const utilChunks = [...utilityFunctions]
      .map(name => ({ name, chunk: declarationsByName.get(name) }))
      .filter((c): c is { name: string; chunk: string } => !!c.chunk)
      .map(({ name, chunk }) => {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return chunk.replace(
          new RegExp(`^(\\s*)(export\\s+)?(const|function)(\\s+${esc}\\b)`, 'm'),
          (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
        )
      })
    if (utilChunks.length > 0) {
      const content = `// ============================================================
// ARKZEN GENERATED UTILITIES — ${tatemono.meta.name} [React+Vite]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${utilChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'utils.tsx'), content, 'utf-8')
      console.log(`[Arkzen Vite Router] ✓ Utility functions: utils.tsx (${[...utilityFunctions].join(', ')})`)
    }
  } else {
    for (const stale of ['utils.tsx', 'utils.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Vite Router] 🧹 Removed stale ${stale}`) }
    }
  }

  // ── Shared types file ────────────────────────────────────────────────────────
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
// ARKZEN GENERATED TYPES — ${tatemono.meta.name} [React+Vite]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${typeChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'types.ts'), content, 'utf-8')
      console.log(`[Arkzen Vite Router] ✓ Shared types: types.ts (${[...sharedTypes].join(', ')})`)
    }
  } else {
    const p = path.join(componentsDir, 'types.ts')
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Vite Router] 🧹 Removed stale types.ts`) }
  }

  // ── One real file per component containing its actual code ──────────────────
  for (const compName of extractedComponents) {
    const declaration = declarationsByName.get(compName)
    if (!declaration) {
      console.log(`[Arkzen Vite Router] ⚠ Could not isolate declaration for ${compName}, skipping file`)
      continue
    }

    const fileName = `${compName}.tsx`
    const filePath = path.join(componentsDir, fileName)

    const cssImport = stylesByComponent.has(compName)
      ? `import styles from '../styles/${compName}.module.css'\n`
      : ''

    // Ensure the declaration is exported
    const escapedName = compName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const exportedDeclaration = declaration.replace(
      new RegExp(`^(\\s*)(export\\s+)?(const|function)(\\s+${escapedName}\\b)`, 'm'),
      (full, indent, exportKw, kw, rest) => exportKw ? full : `${indent}export ${kw}${rest}`
    )

    // Smart per-declaration imports
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
// ARKZEN GENERATED COMPONENT — ${compName} [React+Vite]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}
${cssImport}${constantsImport}${hooksImport}${utilsImport}${typesImport}${siblingImportBlock}
${exportedDeclaration}
`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Vite Router] ✓ Component: ${fileName}`)
  }

  // ── Clean up stale files ─────────────────────────────────────────────────────
  // Remove old _components.tsx / index.ts barrels + any per-component files
  // for components that no longer exist.
  try {
    const files = fs.readdirSync(componentsDir)
    for (const file of files) {
      const base = file.replace(/\.(tsx|ts)$/, '')
      if (file === '_components.tsx' || file === 'index.ts') {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen Vite Router] 🧹 Removed stale ${file}`)
        continue
      }
      if (['hooks.ts','hooks.tsx','types.ts','constants.ts','constants.tsx','utils.ts','utils.tsx'].includes(file)) continue
      if (file.endsWith('.tsx') && !extractedComponents.has(base)) {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen Vite Router] 🧹 Removed stale component: ${file}`)
      }
    }
  } catch (e) {
    // ignore
  }
}

// ─── Generate a single page file ──────────────────────────────────────────────
// Full parity with Next.js generatePageFile():
//   • Page sources ONLY — component code is never inlined into pages.
//   • Per-component imports: one `import { X } from './components/X'` per component.
//   • Smart imports for constants, hooks, utils, types from their dedicated files.
//   • Framer-motion names are scraped from component blocks too so AnimatePresence
//     etc. aren't lost just because the page itself doesn't import them.

function generatePageFile(tatemono: ParsedTatemono, page: ArkzenPage, hasGlobalStyle: boolean): string {
  const tatName      = tatemono.meta.name
  const decl         = parsePageLayoutDecl(page.layout ?? (tatemono.meta.auth ? 'auth' : 'none'))
  const isAuthLayout = decl.guard === 'auth'
  const isGuestLayout = decl.guard === 'guest'
  const { imports: layoutImports, openTags: layoutOpen, closeTags: layoutClose } = buildLayoutJSX(page, tatemono)
  const animFnName   = tatemono.animation ? toCamelCase(tatName) + 'Animations' : null
  const animImport   = animFnName
    ? `import { ${animFnName}, pageVariants } from '@/arkzen/generated/${tatName}.animations'`
    : ''
  const styleImport  = hasGlobalStyle ? `import './styles/global.css'` : ''

  // Page sources ONLY — no component blocks merged in
  const allSources = [normalizeForVite(page.raw.trim())]

  // Scrape framer-motion names from BOTH component and page sources so we don't
  // lose AnimatePresence / useMotionValue used in any block
  const framerNeeded = new Set(['motion'])
  const framerRe = /import\s+\{([^}]*)\}\s+from\s+['"]framer-motion['"]/g
  const framerSources = [...tatemono.components.map(c => c.raw.trim()), ...allSources]
  for (const src of framerSources) {
    let m: RegExpMatchArray | null
    while ((m = framerRe.exec(src)) !== null) {
      m[1].split(',').map(s => s.trim()).filter(Boolean).forEach(n => framerNeeded.add(n))
    }
  }

  // Detect React hooks actually used in the page's own source
  const KNOWN_REACT_HOOKS = [
    'useState', 'useCallback', 'useMemo', 'useContext', 'useReducer',
    'useLayoutEffect', 'useImperativeHandle', 'useTransition', 'useDeferredValue',
    'useId', 'useSyncExternalStore', 'useInsertionEffect',
  ]
  const pageStrippedForHooks = stripTemplateLiterals(normalizeForVite(page.raw))
  const usedReactHooks = KNOWN_REACT_HOOKS.filter(hook =>
    new RegExp(`[^\\w$]${hook}\\s*[(<]`).test(pageStrippedForHooks)
  )

  // Detect react-router needs from page source only
  const needsLocation = /\buseLocation\s*\(/.test(pageStrippedForHooks)
  const needsLink     = /<Link\b/.test(pageStrippedForHooks)
  const routerSpecifiers = [
    'useNavigate',
    needsLocation && 'useLocation',
    needsLink && 'Link',
  ].filter(Boolean).join(', ')
  const routerImportLine = `import { ${routerSpecifiers} } from 'react-router'`

  // Per-component imports — one import line per component file
  const componentNames = extractComponentNames(tatemono)
  const componentImportLines = [...componentNames]
    .sort()
    .map(name => `import { ${name} } from './components/${name}'`)
    .join('\n')

  // Forward non-react/framer-motion imports from component blocks that the page
  // references but doesn't itself import (e.g. gsap, ScrollTrigger)
  const forwardedImportLines = (() => {
    const seen = new Set<string>()
    const lines: string[] = []
    for (const component of tatemono.components) {
      const flattened = flattenMultilineImports(component.raw.trim())
      for (const rawLine of flattened.split('\n')) {
        const line = rawLine.trim()
        if (!line.startsWith('import ')) continue
        if (/from\s+['"](react|framer-motion)['"]/.test(line)) continue

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
          continue
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

  // Smart imports for shared constants / hooks / utils / types this page uses
  const sharedConstants = extractSharedConstantNames(tatemono)
  const pageStrippedForConsts = stripTemplateLiterals(normalizeForVite(page.raw))
  const referencedConstants = findReferencedNames(pageStrippedForConsts, sharedConstants)
  const constantsImportLine = referencedConstants.length > 0
    ? `import { ${referencedConstants.sort().join(', ')} } from './components/constants'`
    : ''

  const customHooks = extractCustomHookNames(tatemono)
  const referencedHooks = findReferencedNames(pageStrippedForHooks, customHooks)
  const hooksImportLine = referencedHooks.length > 0
    ? `import { ${referencedHooks.sort().join(', ')} } from './components/hooks'`
    : ''

  const utilityFunctions = extractUtilityFunctionNames(tatemono)
  const referencedUtils = findReferencedNames(pageStrippedForHooks, utilityFunctions)
  const utilsImportLine = referencedUtils.length > 0
    ? `import { ${referencedUtils.sort().join(', ')} } from './components/utils'`
    : ''

  const sharedTypes = extractSharedTypeNames(tatemono)
  const referencedTypes = findReferencedNames(stripTemplateLiterals(normalizeForVite(page.raw)), sharedTypes)
  const typesImportLine = referencedTypes.length > 0
    ? `import type { ${referencedTypes.sort().join(', ')} } from './components/types'`
    : ''

  const extraLines = [
    ...layoutImports,
    animImport,
    routerImportLine,
    styleImport,
    componentImportLines,
    constantsImportLine,
    hooksImportLine,
    utilsImportLine,
    typesImportLine,
    forwardedImportLines,
  ].filter(Boolean).join('\n')

  const { canonicalBlock: rawCanonicalBlock, strippedSources } = resolveImports(allSources, {
    reactHooks:  ['useRef', 'useEffect', 'useState', ...usedReactHooks],
    framerNamed: [...framerNeeded],
    extra:       extraLines,
  })

  // Rewrite './{name}.scripts' / './{name}.*.script' → '@/arkzen/generated/{name}...'
  const canonicalBlock = rawCanonicalBlock.replace(
    /from\s+['"]\.\/([\w-]+\.scripts|[\w-]+\.[\w-]+\.script)['"]/g,
    `from '@/arkzen/generated/$1'`
  )

  const strippedPageCode = (strippedSources[0] ?? '')
    // FIX v1.2: strip any `export default XxxPage` already in the raw page body
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    // FIX: isMounted cleanup-only useEffect breaks under React StrictMode
    .replace(
      /useEffect\(\(\)\s*=>\s*\{\s*\n?\s*return\s*\(\)\s*=>\s*\{\s*isMounted\.current\s*=\s*false\s*\}\s*\n?\s*\},\s*\[\]\)/g,
      `useEffect(() => {\n    isMounted.current = true\n    return () => { isMounted.current = false }\n  }, [])`
    )
    .trim()

  const componentName = extractComponentName(page.name, page.raw)
  const wrapperName   = `ArkzenPage_${toPascalCase(tatName)}_${toPascalCase(page.name)}`

  return `// ============================================================
// ARKZEN GENERATED PAGE — ${tatName}/${page.name} [React+Vite]
// Layout: ${page.layout} | Auth: ${isAuthLayout} | Guest: ${isGuestLayout}
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

// ── Page component from @arkzen:page:${page.name} ─────────────────────────────
${strippedPageCode}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ${wrapperName} = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    ${animFnName ? `const cleanup = ${animFnName}(pageRef)\n    return cleanup` : '// No animations'}
  }, [])

  return (
    ${layoutOpen}
      <motion.div
        ref={pageRef}
        variants={${animFnName ? 'pageVariants' : '{}'}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <${componentName} />
      </motion.div>
    ${layoutClose}
  )
}

export default ${wrapperName}
`
}

// ─── Generate animation file ───────────────────────────────────────────────────

function generateAnimationFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.animation) return null

  const animFnName = toCamelCase(tatemono.meta.name) + 'Animations'

  // Use resolveImports to cleanly strip all engine-owned imports from the animation block
  const { strippedSources } = resolveImports([tatemono.animation.raw], {
    reactHooks:  [],
    framerNamed: [],
  })
  let clean = strippedSources[0]
    .replace(/gsap\.registerPlugin\(.*\)\s*;?\n?/g, '')
    // FIX v1.2: strip any existing `export` on the fn before re-adding it —
    // prevents `export export const` when tatemono writes `export const animFn`
    .replace(new RegExp(`\\bexport\\s+const\\s+${animFnName}\\b`), `const ${animFnName}`)
    .replace(`const ${animFnName}`, `export const ${animFnName}`)
    // FIX v1.3: strip trailing */ — tatemono wraps animation code in a JS block
    // comment so TS ignores it; the closing */ leaks into raw causing esbuild error
    .replace(/\*\/\s*$/, '')
    .trim()

  // FIX v1.3: auto-inject pageVariants when the tatemono didn't define one.
  const hasPageVariants = /export\s+const\s+pageVariants\b/.test(clean)
  const pageVariantsBlock = hasPageVariants ? '' : `
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}`

  return `// ============================================================
// ARKZEN GENERATED ANIMATIONS — ${tatemono.meta.name} [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

${clean}${pageVariantsBlock}
`
}

// ─── Route registry ────────────────────────────────────────────────────────────

interface ViteRoute {
  tatName:        string
  pageName:       string
  path:           string
  auth:           boolean
  errorBoundary?: string   // PascalCase class name emitted in error-boundary.tsx
}

function readExistingRoutes(): ViteRoute[] {
  if (!fs.existsSync(ROUTES_FILE)) return []
  const content = fs.readFileSync(ROUTES_FILE, 'utf-8')
  const matches = [...content.matchAll(/\/\/ ROUTE:([^:]+):([^:]+):([^:]+):(true|false)(?::([A-Za-z0-9_]*))?/g)]
  return matches.map(m => ({
    tatName:        m[1],
    pageName:       m[2],
    path:           m[3],
    auth:           m[4] === 'true',
    errorBoundary:  m[5] || undefined,
  }))
}

function writeRouteRegistry(routes: ViteRoute[]): void {
  ensureDir(GENERATED_DIR)

  const imports = routes.map(r => {
    const wrapperName = `ArkzenPage_${toPascalCase(r.tatName)}_${toPascalCase(r.pageName)}`
    const filePath    = `@/pages/${r.tatName}/${r.pageName}`
    const boundaryTag = r.errorBoundary ? `:${r.errorBoundary}` : ''
    return `// ROUTE:${r.tatName}:${r.pageName}:${r.path}:${r.auth}${boundaryTag}\nconst ${wrapperName} = lazy(() => import('${filePath}'))`
  }).join('\n')

  const routeArray = routes.map(r => {
    const wrapperName = `ArkzenPage_${toPascalCase(r.tatName)}_${toPascalCase(r.pageName)}`
    return `  { path: '${r.path}', name: '${r.pageName}', tatemono: '${r.tatName}', component: ${wrapperName}, auth: ${r.auth} },`
  }).join('\n')

  const boundaryEntries: string[] = []
  const boundaryImports: string[] = []
  const seen = new Set<string>()
  for (const r of routes) {
    if (r.errorBoundary && !seen.has(r.tatName)) {
      seen.add(r.tatName)
      boundaryImports.push(
        `import { ${r.errorBoundary} } from '@/pages/${r.tatName}/error-boundary'`
      )
      boundaryEntries.push(`  '${r.tatName}': ${r.errorBoundary},`)
    }
  }

  const boundarySection = boundaryImports.length > 0
    ? `\n${boundaryImports.join('\n')}\n\nexport const ARKZEN_ERROR_BOUNDARIES: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {\n${boundaryEntries.join('\n')}\n}\n`
    : `\nexport const ARKZEN_ERROR_BOUNDARIES: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {}\n`

  const content = `// ============================================================
// ARKZEN GENERATED — Route Registry (React+Vite)
// Auto-updated when tatemonos are built/removed
// DO NOT EDIT — managed by Arkzen engine
// ============================================================
import React from 'react'
import { lazy, ComponentType } from 'react'

export interface ArkzenRoute {
  path:      string
  name:      string
  tatemono:  string
  component: ComponentType
  auth:      boolean
}

${imports}
${boundarySection}
export const ARKZEN_ROUTES: ArkzenRoute[] = [
${routeArray}
]
`
  fs.writeFileSync(ROUTES_FILE, content, 'utf-8')
}


// ─── GENERATE GLOBAL SCRIPT FILE — v6.5 ─────────────────────────────────────
// Mirrors generateAnimationFile but for @arkzen:script.
// Exports whatever the author wrote — no forced pageVariants injection.

function generateScriptFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.script) return null

  const { canonicalBlock, strippedSources } = resolveImports([tatemono.script.raw], {
    reactHooks:  [],
    framerNamed: [],
    forceReact:  false,
  })

  const cleanScript = strippedSources[0]
    .replace(/\*\/\s*$/, '')
    .trim()

  const importsBlock = canonicalBlock ? `${canonicalBlock}\n\n` : ''

  return `// ============================================================
// ARKZEN GENERATED SCRIPT — ${tatemono.meta.name}
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${importsBlock}${cleanScript}
`
}

// ─── GENERATE NAMED SCRIPT FILES — v6.5 ─────────────────────────────────────
// Each @arkzen:script:name block → {name}.{scriptName}.script.ts

function generateNamedScriptFiles(tatemono: ParsedTatemono, generatedDir: string): void {
  for (const section of tatemono.scripts) {
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

    const { canonicalBlock, strippedSources } = resolveImports([section.raw], {
      reactHooks:  [],
      framerNamed: [],
      forceReact:  false,
    })

    const cleanScript = strippedSources[0]
      .replace(/\*\/\s*$/, '')
      .trim()

    const importsBlock = canonicalBlock ? `${canonicalBlock}\n\n` : ''

    const fileName = `${tatemono.meta.name}.${scriptName}.script.ts`
    const filePath = path.join(generatedDir, fileName)
    const fileOut  = `// ============================================================
// ARKZEN GENERATED SCRIPT — ${tatemono.meta.name}/${scriptName}
// Source: @arkzen:script:${scriptName}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${importsBlock}${cleanScript}
`
    fs.writeFileSync(filePath, fileOut, 'utf-8')
    console.log(`[Arkzen Vite Router] ✓ Named script: ${fileName}`)
  }
}

// ─── CLEANUP SCRIPT FILES ─────────────────────────────────────────────────────

function cleanScriptFiles(generatedDir: string, tatName: string): void {
  const scriptPath = path.join(generatedDir, `${tatName}.scripts.ts`)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath)
    console.log(`[Arkzen Vite Router] ✓ Global script file removed`)
  }
  try {
    const files = fs.readdirSync(generatedDir)
    for (const file of files) {
      if (file.startsWith(`${tatName}.`) && file.endsWith('.script.ts')) {
        fs.unlinkSync(path.join(generatedDir, file))
        console.log(`[Arkzen Vite Router] ✓ Named script removed: ${file}`)
      }
    }
  } catch { /* ignore */ }
}

// ─── Custom layouts ────────────────────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  if (tatemono.layouts.length === 0) return
  ensureDir(LAYOUTS_DIR)

  for (const layout of tatemono.layouts) {
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(LAYOUTS_DIR, fileName)

    // Use resolveImports for clean canonical import handling
    const { canonicalBlock, strippedSources } = resolveImports(
      [normalizeForVite(layout.raw.trim())],
      { reactHooks: [], framerNamed: [] }
    )
    // Ensure react-router imports are present in the stripped body
    const bodyWithRouterDom = ensureRouterDomImports(strippedSources[0])
    const content = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name} [React+Vite]\n\n${canonicalBlock}\n\n${bodyWithRouterDom}\n`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Vite Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─── Error pages ──────────────────────────────────────────────────────────────

function generateErrorPages(
  tatemono: ParsedTatemono,
  tatDir: string,
): { has404: boolean; has500: boolean; boundaryClassName: string | null } {
  let has404 = false
  let has500 = false
  let boundaryClassName: string | null = null

  for (const handler of tatemono.errorHandlers) {
    const { strippedSources } = resolveImports(
      [normalizeForVite(handler.raw)],
      { reactHooks: [], framerNamed: [] }
    )
    const cleanRaw = strippedSources[0].trim()

    // ── 404 ──────────────────────────────────────────────────────────────────
    if (handler.type === '404') {
      has404 = true

      const content = `// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/not-found [React+Vite]
// Rendered by the wildcard route /${tatemono.meta.name}/* for any
// unmatched sub-path under this tatemono prefix.
// DO NOT EDIT — edit @arkzen:error:404 in tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import React from 'react'
import { ErrorScreen } from './components/ErrorScreen'

${cleanRaw}

export default NotFoundPage
`
      fs.writeFileSync(path.join(tatDir, 'not-found.tsx'), content, 'utf-8')
      console.log(`[Arkzen Vite Router] ✓ Not-found page: /${tatemono.meta.name}/* → not-found.tsx`)
    }

    // ── 500 ──────────────────────────────────────────────────────────────────
    if (handler.type === '500') {
      has500 = true
      boundaryClassName = `ArkzenErrorBoundary_${toPascalCase(tatemono.meta.name)}`

      const content = `// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/error-boundary [React+Vite]
// Class-based React ErrorBoundary wrapping all routes for this tatemono.
// App.tsx imports it via ARKZEN_ERROR_BOUNDARIES from routes.ts.
// DO NOT EDIT — edit @arkzen:error:500 in tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import React, { Component, ReactNode } from 'react'
import { ErrorScreen } from './components/ErrorScreen'

${cleanRaw}

interface ArkzenErrorBoundaryState { hasError: boolean }

export class ${boundaryClassName} extends Component<
  { children: ReactNode },
  ArkzenErrorBoundaryState
> {
  state: ArkzenErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ArkzenErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[Arkzen] ${tatemono.meta.name} error boundary caught:', error, info)
  }

  reset = (): void => {
    this.setState({ hasError: false })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ServerErrorPage reset={this.reset} />
    }
    return this.props.children
  }
}
`
      fs.writeFileSync(path.join(tatDir, 'error-boundary.tsx'), content, 'utf-8')
      console.log(`[Arkzen Vite Router] ✓ Error boundary: ${tatemono.meta.name}/error-boundary.tsx`)
    }
  }

  return { has404, has500, boundaryClassName }
}

function generateRootRedirectPage(tatemono: ParsedTatemono): { fileName: string; routePath: string } | null {
  const hasIndex = tatemono.pages.some(p => p.name === 'index')
  if (hasIndex) return null

  const firstGuest = tatemono.pages.find(p => p.layout === 'guest')
  const firstAuth  = tatemono.pages.find(p => p.layout === 'auth')
  const firstPage  = tatemono.pages[0]

  const target = tatemono.meta.auth
    ? (firstGuest ?? firstAuth ?? firstPage)
    : (firstAuth ?? firstGuest ?? firstPage)

  if (!target) return null

  const destination  = `/${tatemono.meta.name}/${target.name}`
  const fileName     = '__root_redirect'
  const componentName = `ArkzenRootRedirect_${toPascalCase(tatemono.meta.name)}`
  const content = `// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — ${tatemono.meta.name} [React+Vite]
// Visiting /${tatemono.meta.name} redirects to ${destination}
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import React from 'react'
import { Navigate } from 'react-router'

const ${componentName} = () => {
  return <Navigate to="${destination}" replace />
}

export default ${componentName}
`

  const tatDir = path.join(PAGES_DIR, tatemono.meta.name)
  fs.writeFileSync(path.join(tatDir, `${fileName}.tsx`), content, 'utf-8')
  console.log(`[Arkzen Vite Router] ✓ Root redirect: /${tatemono.meta.name} → ${destination}`)

  return { fileName, routePath: `/${tatemono.meta.name}` }
}

// ─── Main: register tatemono pages ────────────────────────────────────────────

export function registerVitePages(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name
  const tatDir  = path.join(PAGES_DIR, tatName)
  ensureDir(tatDir)

  console.log(`[Arkzen Vite Router] Registering ${tatemono.pages.length} page(s) for: ${tatName}`)

  // Individual component files — full parity with Next.js (real code per file)
  generateIndividualComponentFiles(tatemono, tatDir)
  generateCustomLayouts(tatemono)

  const { has404, has500, boundaryClassName } = generateErrorPages(tatemono, tatDir)
  const styleInfo = emitTatemonoStyles(tatemono, tatDir, { loggerLabel: 'Arkzen Vite Router' })

  const animContent = generateAnimationFile(tatemono)
  if (animContent) {
    ensureDir(GENERATED_DIR)
    const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
    fs.writeFileSync(animPath, animContent, 'utf-8')
    console.log(`[Arkzen Vite Router] ✓ Animation file generated`)
  }

  // v6.5: Global script file
  if (tatemono.script) {
    ensureDir(GENERATED_DIR)
    const scriptContent = generateScriptFile(tatemono)
    if (scriptContent) {
      fs.writeFileSync(path.join(GENERATED_DIR, `${tatName}.scripts.ts`), scriptContent, 'utf-8')
      console.log(`[Arkzen Vite Router] ✓ Global script file generated`)
    }
  }

  // v6.5: Named script files
  if (tatemono.scripts && tatemono.scripts.length > 0) {
    ensureDir(GENERATED_DIR)
    generateNamedScriptFiles(tatemono, GENERATED_DIR)
  }

  const existingRoutes = readExistingRoutes().filter(r => r.tatName !== tatName)
  const newRoutes: ViteRoute[] = []

  for (const page of tatemono.pages) {
    const pageContent = generatePageFile(tatemono, page, styleInfo.hasGlobalStyle)
    const pagePath    = path.join(tatDir, `${page.name}.tsx`)
    fs.writeFileSync(pagePath, pageContent, 'utf-8')

    const routePath = page.name === 'index'
      ? `/${tatName}`
      : `/${tatName}/${page.name}`

    newRoutes.push({
      tatName,
      pageName:      page.name,
      path:          routePath,
      auth:          tatemono.meta.auth,
      errorBoundary: boundaryClassName ?? undefined,
    })
    console.log(`[Arkzen Vite Router] ✓ /${tatName}${page.name === 'index' ? '' : '/' + page.name} [vite]`)
  }

  // Wildcard 404 — must be registered AFTER all real pages
  if (has404) {
    newRoutes.push({
      tatName,
      pageName: 'not-found',
      path:     `/${tatName}/*`,
      auth:     false,
    })
    console.log(`[Arkzen Vite Router] ✓ Wildcard 404 route: /${tatName}/* → not-found.tsx`)
  }

  const rootRedirect = generateRootRedirectPage(tatemono)
  if (rootRedirect) {
    newRoutes.push({
      tatName,
      pageName: rootRedirect.fileName,
      path:     rootRedirect.routePath,
      auth:     tatemono.meta.auth,
    })
  }

  writeRouteRegistry([...existingRoutes, ...newRoutes])
  console.log(`[Arkzen Vite Router] ✓ Route registry updated: ${newRoutes.length} page(s)`)

  // v9.0: inject meta:web into index.html
  generateViteIndexHtml(tatemono)

  // ── Sitemap + robots.txt ──────────────────────────────────────────────────────
  try {
    const registry = getRegistry()
    writeSitemap(registry)
    writeRobotsTxt()
  } catch (e) {
    console.log(`[Arkzen Vite Router] ⚠ Sitemap generation skipped`)
  }

  // ── Asset distribution ────────────────────────────────────────────────────────
  // process.cwd() = engine/frontend/react-vite/
  // Three levels up → project root → tatemonos/{tat}/assets
  try {
    const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
    const assetsPath   = path.join(tatemonosDir, tatName, 'assets')
    const publicDir    = path.resolve(process.cwd(), 'public')
    cleanOldAssets(tatName, publicDir)
    const hasAssets = copyAssetsToPublic(tatName, assetsPath, publicDir)
    if (!hasAssets) {
      console.log(`[Arkzen Assets] No assets folder for ${tatName}`)
    }
  } catch (e) {
    console.log(`[Arkzen Assets] ⚠ Asset distribution skipped: ${e}`)
  }
}

// ─────────────────────────────────────────────
// GENERATE VITE INDEX.HTML — v9.0
// Injects title, description, favicon, OG, Twitter from @arkzen:meta:web
// into the root index.html. Multi-tatemono: uses the LAST registered
// tatemono's webMeta (or falls back to "Arkzen" title).
// Called from registerVitePages() on every save.
// ─────────────────────────────────────────────

function generateViteIndexHtml(tatemono: ParsedTatemono): void {
  const indexPath  = path.resolve(process.cwd(), 'index.html')
  const webMeta    = tatemono.webMeta
  const meta       = tatemono.meta

  const title       = webMeta?.title ?? webMeta?.label ?? meta.name
  const description = webMeta?.description ?? meta.description ?? ''
  const favicon     = webMeta?.favicon ?? meta.favicon
  const og          = webMeta?.og
  const twitter     = webMeta?.twitter

  // Build favicon tag
  let faviconTag = ''
  if (favicon) {
    const isEmoji = [...favicon].length <= 2
    faviconTag = isEmoji
      ? `  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${favicon}</text></svg>" />`
      : `  <link rel="icon" href="${favicon}" />`
  }

  // Build meta tags
  const metaTags: string[] = []
  if (description) {
    metaTags.push(`  <meta name="description" content="${description}" />`)
  }
  // OG
  metaTags.push(`  <meta property="og:title" content="${og?.title ?? title}" />`)
  if (description || og?.description) {
    metaTags.push(`  <meta property="og:description" content="${og?.description ?? description}" />`)
  }
  if (og?.image) metaTags.push(`  <meta property="og:image" content="${og.image}" />`)
  if (og?.url)   metaTags.push(`  <meta property="og:url" content="${og.url}" />`)
  metaTags.push(`  <meta property="og:type" content="${og?.type ?? 'website'}" />`)
  // Twitter
  if (twitter) {
    metaTags.push(`  <meta name="twitter:card" content="${twitter.card ?? 'summary_large_image'}" />`)
    metaTags.push(`  <meta name="twitter:title" content="${twitter.title ?? title}" />`)
    if (twitter.description || description) {
      metaTags.push(`  <meta name="twitter:description" content="${twitter.description ?? description}" />`)
    }
    if (twitter.image) metaTags.push(`  <meta name="twitter:image" content="${twitter.image}" />`)
  }

  const headContent = [
    `  <meta charset="UTF-8" />`,
    `  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />`,
    `  <title>${title}</title>`,
    faviconTag,
    ...metaTags,
  ].filter(Boolean).join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
${headContent}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  fs.writeFileSync(indexPath, html, 'utf-8')
  console.log(`[Arkzen Vite Router] ✓ index.html updated — title: "${title}"`)
}

function writeRobotsTxt(): void {
  const publicDir = path.resolve(process.cwd(), 'public')
  fs.mkdirSync(publicDir, { recursive: true })
  const robotsPath = path.join(publicDir, 'robots.txt')
  const content = `User-agent: *
Allow: /

Sitemap: ${process.env.VITE_SITE_URL || 'http://localhost:5173'}/sitemap.xml
`
  fs.writeFileSync(robotsPath, content, 'utf-8')
  console.log(`[Arkzen Vite Router] ✓ robots.txt generated`)
}

// ─── Soft unregister — used during REBUILD ────────────────────────────────────
// Mirrors Next.js softUnregisterPage():
//   Remove animation file + purge routes only — leave pages dir intact so
//   Vite HMR doesn't see a deleted route mid-write and serve a cached 404.

export function softUnregisterVitePages(tatName: string): void {
  console.log(`[Arkzen Vite Router] Soft-unregistering (rebuild): ${tatName}`)

  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.rmSync(animPath)
    console.log(`[Arkzen Vite Router] ✓ Animation file removed`)
  }

  // v6.5: clean up script files
  cleanScriptFiles(GENERATED_DIR, tatName)

  const routes = readExistingRoutes().filter(r => r.tatName !== tatName)
  writeRouteRegistry(routes)
  console.log(`[Arkzen Vite Router] ✓ Routes purged from registry`)
}

// ─── Full unregister — used during REMOVE ─────────────────────────────────────

export function unregisterVitePages(tatName: string): void {
  console.log(`[Arkzen Vite Router] Unregistering: ${tatName}`)

  const tatDir = path.join(PAGES_DIR, tatName)
  if (fs.existsSync(tatDir)) {
    fs.rmSync(tatDir, { recursive: true, force: true })
    console.log(`[Arkzen Vite Router] ✓ Removed pages: ${tatName}`)
  }

  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.rmSync(animPath)
    console.log(`[Arkzen Vite Router] ✓ Animation file removed`)
  }

  // v6.5: clean up script files
  cleanScriptFiles(GENERATED_DIR, tatName)

  // Custom layout files belonging to this tatemono
  if (fs.existsSync(LAYOUTS_DIR)) {
    const prefix = `${tatName}-`
    fs.readdirSync(LAYOUTS_DIR)
      .filter(f => f.startsWith(prefix) && f.endsWith('.tsx'))
      .forEach(f => {
        fs.rmSync(path.join(LAYOUTS_DIR, f), { force: true })
        console.log(`[Arkzen Vite Router] ✓ Removed custom layout: ${f}`)
      })
  }

  const routes = readExistingRoutes().filter(r => r.tatName !== tatName)
  writeRouteRegistry(routes)
  console.log(`[Arkzen Vite Router] ✓ Route registry updated`)
}