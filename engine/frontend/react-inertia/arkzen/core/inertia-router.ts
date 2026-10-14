// ============================================================
// ARKZEN ENGINE — INERTIA ROUTER v4.0
// Equivalent of vite-router.ts / router.ts for the Inertia stack.
//
// KEY DIFFERENCES from vite-router:
//   1. Pages land in laravel-inertia/resources/js/Pages/{Tat}/{Page}.tsx
//      (inside the Laravel backend folder) NOT in a local src/pages/
//   2. No route registry file — Laravel handles routing via web.php
//      (RouteRegistrar writes routes/modules/{tat}.php)
//   3. No React Router — navigation via Inertia router.visit()
//   4. Page props come from Inertia::render() via usePage<Props>()
//   5. No .arkzen-ready flag — Laravel Vite plugin manages HMR directly
//
// v4.0 — full per-file component generation (parity with vite-router.ts v2.1):
//   • generateIndividualComponentFiles() now writes REAL code into each
//     component file (not re-exports from a _components.tsx barrel).
//     Mirrors Vite exactly: constants.tsx, hooks.tsx, utils.tsx, types.ts,
//     plus one {Name}.tsx per component containing its actual declaration.
//   • generateComponentsIndex() removed — no longer needed.
//   • generateInertiaPageFile() now uses page sources ONLY (no component
//     inlining). Imports each component via `import { X } from './components/X'`.
//     Smart per-page imports for constants/hooks/utils/types via findReferencedNames().
//   • stripTemplateLiterals() fixed to preserve ${...} expression content so
//     identifiers inside expressions remain visible to findReferencedNames.
//   • New helpers ported from vite-router.ts v2.1:
//     extractComponentNames, extractSharedConstantNames, extractCustomHookNames,
//     extractSharedTypeNames, extractUtilityFunctionNames,
//     findReferencedNames, splitComponentDeclarations.
//
// v3.0 history:
//   • resolveImports() + flattenMultilineImports() — unified import resolver.
//   • ENGINE_OWNED_MODULES — 'react' and 'framer-motion' always engine-owned.
//   • generateErrorHandlers() — full 404/500 support.
//   • copyAssetsToPublic / cleanOldAssets — asset distribution.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import * as ts   from 'typescript'
import type { ParsedTatemono, ArkzenPage, ArkzenLayout, ArkzenErrorHandler } from '../types'
import { emitTatemonoStyles } from './lib/dsl-style-emitter'
import { copyAssetsToPublic, cleanOldAssets } from './assets'
import { writeSitemap } from './sitemap'
import { getRegistry } from './registry'

// Pages + generated files land INSIDE the laravel-inertia backend.
// process.cwd() is engine/frontend/react-inertia/ at runtime.
// Three levels up  →  project root (same depth as nextjs/ and react-vite/).
const ROOT_DIR           = path.resolve(process.cwd(), '..', '..', '..')
const BACKEND_DIR        = path.join(ROOT_DIR, 'engine', 'backend', 'laravel-inertia')
const PAGES_DIR          = path.join(BACKEND_DIR, 'resources', 'js', 'Pages')
const GENERATED_DIR      = path.join(BACKEND_DIR, 'resources', 'js', 'arkzen', 'generated')
const LAYOUTS_DIR        = path.join(BACKEND_DIR, 'resources', 'js', 'arkzen', 'core', 'layouts', 'custom')
const ROUTES_DIR         = path.join(BACKEND_DIR, 'routes', 'modules')
const PAGES_REGISTRY     = path.join(GENERATED_DIR, 'pages.ts')

// ─── String helpers ───────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function toSafeComponentName(pageName: string): string {
  const pascal = toPascalCase(pageName)
  return /^\d/.test(pascal) ? `Page${pascal}` : pascal
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

// ─── Code normalizers (mirrors vite-router.ts) ────────────────────────────────

function stripNextImports(raw: string): string {
  return raw
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/navigation['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/router['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+Link\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/image['"][ \t]*;?[ \t]*\r?\n?/gm, '')
}

function stripReactRouterImports(raw: string): string {
  return raw
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]react-router-dom['"][ \t]*;?[ \t]*\r?\n?/gm, '')
}

// Convert Next.js router calls to Inertia calls
// router.refresh() → window.location.reload() (full page reload)
// router.replace(path) → router.visit(path, { replace: true })
// Note: router.push(path) already gets converted to router(path) by the hook conversion
function normalizeRouterCalls(raw: string): string {
  return raw
    .replace(/\brouter\.refresh\(\)/g, 'window.location.reload()')
    .replace(/\brouter\.replace\(([^)]+)\)/g, 'router.visit($1, { replace: true })')
}

function normalizeForInertia(raw: string): string {
  return normalizeRouterCalls(
    stripReactRouterImports(
      stripNextImports(raw)
        .replace(/^[ \t]*['"]use client['"][ \t]*;?[ \t]*\r?\n?/gm, '')
        .replace(/\busePathname\(\)/g, 'useArkzenPathname()')
        .replace(/\buseRouter\b/g, 'useArkzenRouter')
        .replace(/\buseNavigate\b/g, 'useArkzenRouter')
        .replace(/process\.env\.NEXT_PUBLIC_(\w+)/g, 'import.meta.env.VITE_$1')
    )
  )
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
  const defaultImportRe   = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/
  const namedImportRe     = /^import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  const mixedImportRe     = /^import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*,\s*\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?/
  const namespaceImportRe = /^import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]\s*;?/
  const sideEffectRe      = /^import\s+['"]([^'"]+)['"]\s*;?/

  const sideEffects: string[] = []

  const importSources = engineRequired.extra ? [...sources, engineRequired.extra] : sources
  for (const source of importSources) {
    const flattened = flattenMultilineImports(source)
    for (const rawLine of flattened.split('\n')) {
      let line = rawLine.trim()
      if (!line.startsWith('import ')) continue
      // Rewrite relative script imports to @/arkzen/generated/ alias so
      // _components.tsx (at Pages/{Tat}/components/) can resolve them correctly
      line = line.replace(
        /from\s+['"]\.\/([\w-]+\.scripts|[\w-]+\.[\w-]+\.script)['"]/,
        `from '@/arkzen/generated/$1'`
      )

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
  if (importMap.has('gsap')) {
    const gsapEntry = importMap.get('gsap')!
    if (gsapEntry.defaultImport === 'gsap') {
      gsapEntry.defaultImport = undefined
      gsapEntry.named.add('gsap')
    }
  }

  // ── Build canonical import block ──────────────────────────
  const lines: string[] = []

  // 1. React always first
  const reactNamed = [...(importMap.get('react')?.named ?? [])]
    .filter(h => h !== 'React')
    .sort()
  // Inertia pages also always need usePage from @inertiajs/react — handled in extra
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

  // 3. All other modules — alphabetical
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
 * Falls back to toSafeComponentName(pageName) + 'Page' if not found.
 */
function extractComponentName(pageName: string, raw: string): string {
  const match = raw.match(/const\s+([A-Za-z_$][A-Za-z0-9_$]*Page)\s*[=:(]/)
  if (match) return match[1]
  return toSafeComponentName(pageName) + 'Page'
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
    if (visited.has(current)) throw new Error(`[Arkzen Inertia Router] Layout chain cycle at: "${current}"`)
    visited.add(current)
    chain.unshift(current)
    current = allLayouts.find(l => l.name === current)?.parent
  }
  return chain
}

function getLayoutImport(layout: string, tatName: string): string {
  switch (layout) {
    case 'auth':  return `import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'`
    case 'guest': return `import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'`
    case 'blank': return `import { BlankLayout } from '@/arkzen/core/layouts/BlankLayout'`
    default:      return `import { ${toPascalCase(layout)}Layout } from '@/arkzen/core/layouts/custom/${tatName}-${layout}'`
  }
}

function getLayoutComponent(layout: string): string {
  switch (layout) {
    case 'auth':  return 'AuthLayout'
    case 'guest': return 'GuestLayout'
    case 'blank': return 'BlankLayout'
    default:      return toPascalCase(layout) + 'Layout'
  }
}

function buildLayoutJSX(
  page: ArkzenPage,
  tatemono: ParsedTatemono
): { imports: string[]; openTags: string; closeTags: string } {
  const decl   = parsePageLayoutDecl(page.layout)
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
  return { imports, openTags: opens.join('\n  '), closeTags: closes.join('\n  ') }
}

// ─── Animation file generator ─────────────────────────────────────────────────
// Writes resources/js/arkzen/generated/{tatName}.animations.ts
// Mirrors vite-router.ts generateAnimationFile() and router.ts exactly.

function generateAnimationFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.animation) return null

  const animFnName = toCamelCase(tatemono.meta.name) + 'Animations'

  // Use resolveImports to strip engine-owned modules from the animation block
  const { strippedSources } = resolveImports([tatemono.animation.raw], {
    reactHooks:  [],
    framerNamed: [],
  })
  let cleanAnimation = strippedSources[0]
    .replace(/gsap\.registerPlugin\(.*\)[;]?\n?/g, '')
    .replace(new RegExp(`\\bexport\\s+const\\s+${animFnName}\\b`), `const ${animFnName}`)
    .replace(`const ${animFnName}`, `export const ${animFnName}`)
    .replace(/\*\/\s*$/, '')
    .trim()

  const hasPageVariants = /export\s+const\s+pageVariants\b/.test(cleanAnimation)
  const pageVariantsBlock = hasPageVariants ? '' : `
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}`

  return `// ============================================================
// ARKZEN GENERATED ANIMATIONS — ${tatemono.meta.name} [React+Inertia]
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

${cleanAnimation}${pageVariantsBlock}
`
}

// ─── Individual component files ───────────────────────────────────────────────
// Mirrors Next.js generateIndividualComponentFiles() exactly.
// Writes Pages/{Tat}/components/_components.tsx + one re-export per component.

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

// ─── Component / declaration name extractors (ported from vite-router.ts v2.1) ─

function getTopLevelDeclarations(tatemono: ParsedTatemono): { name: string; kind: 'variable' | 'function' | 'type' }[] {
  const declarations: { name: string; kind: 'variable' | 'function' | 'type' }[] = []

  for (const component of tatemono.components) {
    const source = ts.createSourceFile('components.tsx', component.raw, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    for (const statement of source.statements) {
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) declarations.push({ name: declaration.name.text, kind: 'variable' })
        }
      } else if (ts.isFunctionDeclaration(statement) && statement.name) {
        declarations.push({ name: statement.name.text, kind: 'function' })
      } else if ((ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) && statement.name) {
        declarations.push({ name: statement.name.text, kind: 'type' })
      }
    }
  }
  return declarations
}

/**
 * Extracts PascalCase component names from @arkzen:components blocks.
 * Skips ALL_CAPS constants and anything inside template literals.
 */
function extractComponentNames(tatemono: ParsedTatemono): Set<string> {
  const names = new Set<string>()
  for (const declaration of getTopLevelDeclarations(tatemono)) {
    if (/^[A-Z][A-Za-z0-9_$]*$/.test(declaration.name) && !/^[A-Z0-9_]+$/.test(declaration.name) && declaration.kind !== 'type') {
      names.add(declaration.name)
    }
  }
  return names
}

/**
 * Extracts ALL_CAPS shared constant names (e.g. NAV_LINKS, CHAPTERS).
 * Written to components/constants.tsx.
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
  for (const declaration of getTopLevelDeclarations(tatemono)) {
    if (declaration.kind !== 'type' && /^[a-z][A-Za-z0-9_$]*$/.test(declaration.name) && !/^use[A-Z]/.test(declaration.name)) {
      names.add(declaration.name)
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
// Full parity with vite-router.ts v2.1 generateIndividualComponentFiles():
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
      console.log(`[Arkzen Inertia Router] 🧹 Removed stale components/ (no @arkzen:components)`)
    }
    return
  }

  fs.mkdirSync(componentsDir, { recursive: true })

  // Resolve imports across ALL component blocks into one canonical block
  const rawSources = tatemono.components.map(c => normalizeForInertia(c.raw.trim()))
  const { canonicalBlock, strippedSources } = resolveImports(rawSources)

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
// ARKZEN GENERATED SHARED CONSTANTS — ${tatemono.meta.name} [React+Inertia]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${constChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'constants.tsx'), content, 'utf-8')
      console.log(`[Arkzen Inertia Router] ✓ Shared constants: constants.tsx`)
    }
  } else {
    for (const stale of ['constants.tsx', 'constants.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Inertia Router] 🧹 Removed stale ${stale}`) }
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
// ARKZEN GENERATED HOOKS — ${tatemono.meta.name} [React+Inertia]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${hookChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'hooks.tsx'), content, 'utf-8')
      console.log(`[Arkzen Inertia Router] ✓ Custom hooks: hooks.tsx (${[...customHooks].join(', ')})`)
    }
  } else {
    for (const stale of ['hooks.tsx', 'hooks.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Inertia Router] 🧹 Removed stale ${stale}`) }
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
// ARKZEN GENERATED UTILITIES — ${tatemono.meta.name} [React+Inertia]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${utilChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'utils.tsx'), content, 'utf-8')
      console.log(`[Arkzen Inertia Router] ✓ Utility functions: utils.tsx (${[...utilityFunctions].join(', ')})`)
    }
  } else {
    for (const stale of ['utils.tsx', 'utils.ts']) {
      const p = path.join(componentsDir, stale)
      if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Inertia Router] 🧹 Removed stale ${stale}`) }
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
// ARKZEN GENERATED TYPES — ${tatemono.meta.name} [React+Inertia]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${typeChunks.join('\n\n')}
`
      fs.writeFileSync(path.join(componentsDir, 'types.ts'), content, 'utf-8')
      console.log(`[Arkzen Inertia Router] ✓ Shared types: types.ts (${[...sharedTypes].join(', ')})`)
    }
  } else {
    const p = path.join(componentsDir, 'types.ts')
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`[Arkzen Inertia Router] 🧹 Removed stale types.ts`) }
  }

  // ── One real file per component containing its actual code ──────────────────
  for (const compName of extractedComponents) {
    const declaration = declarationsByName.get(compName)
    if (!declaration) {
      console.log(`[Arkzen Inertia Router] ⚠ Could not isolate declaration for ${compName}, skipping file`)
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
// ARKZEN GENERATED COMPONENT — ${compName} [React+Inertia]
// Source: @arkzen:components (${tatemono.meta.name})
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}
${cssImport}${constantsImport}${hooksImport}${utilsImport}${typesImport}${siblingImportBlock}
${exportedDeclaration}
`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Inertia Router] ✓ Component: ${fileName}`)
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
        console.log(`[Arkzen Inertia Router] 🧹 Removed stale ${file}`)
        continue
      }
      if (['hooks.ts','hooks.tsx','types.ts','constants.ts','constants.tsx','utils.ts','utils.tsx'].includes(file)) continue
      if (file.endsWith('.tsx') && !extractedComponents.has(base)) {
        fs.unlinkSync(path.join(componentsDir, file))
        console.log(`[Arkzen Inertia Router] 🧹 Removed stale component: ${file}`)
      }
    }
  } catch (e) {
    // ignore
  }
}

// ─── Ensure Arkzen adapter imports ───────────────────────────────────────────
// After resolveImports strips old imports and normalizeForInertia replaces
// usePathname() → useArkzenPathname() and useRouter → useArkzenRouter,
// we must re-inject the imports for the Arkzen adapter hooks. Mirrors Vite's
// ensureRouterDomImports() pattern but for @/arkzen/core/adapters/router.

function ensureArkzenAdapterImports(raw: string): string {
  const needsPathname = /\buseArkzenPathname\s*\(/.test(raw)
  const needsRouter   = /\buseArkzenRouter\s*[\({]/.test(raw)

  if (!needsPathname && !needsRouter) return raw

  const needed = [
    needsPathname && 'useArkzenPathname',
    needsRouter   && 'useArkzenRouter',
  ].filter(Boolean) as string[]

  const importRegex = /^import\s+\{([^}]*)\}\s+from\s+['"]@\/arkzen\/core\/adapters\/router['"][ \t]*;?[ \t]*$/m
  const existing = raw.match(importRegex)

  if (!existing) {
    return `import { ${needed.join(', ')} } from '@/arkzen/core/adapters/router'\n${raw}`
  }

  const existingSpecifiers = existing[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const merged = [...new Set([...existingSpecifiers, ...needed])].sort()
  return raw.replace(importRegex, `import { ${merged.join(', ')} } from '@/arkzen/core/adapters/router'`)
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
    console.log(`[Arkzen Inertia Router] ✓ Named script: ${fileName}`)
  }
}

// ─── CLEANUP SCRIPT FILES ─────────────────────────────────────────────────────

function cleanScriptFiles(generatedDir: string, tatName: string): void {
  const scriptPath = path.join(generatedDir, `${tatName}.scripts.ts`)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath)
    console.log(`[Arkzen Inertia Router] ✓ Global script file removed`)
  }
  try {
    const files = fs.readdirSync(generatedDir)
    for (const file of files) {
      if (file.startsWith(`${tatName}.`) && file.endsWith('.script.ts')) {
        fs.unlinkSync(path.join(generatedDir, file))
        console.log(`[Arkzen Inertia Router] ✓ Named script removed: ${file}`)
      }
    }
  } catch { /* ignore */ }
}

// ─── Custom layouts ───────────────────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  if (tatemono.layouts.length === 0) return
  ensureDir(LAYOUTS_DIR)

  for (const layout of tatemono.layouts) {
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(LAYOUTS_DIR, fileName)

    // Resolve imports in the layout block itself
    const { canonicalBlock, strippedSources } = resolveImports(
      [normalizeForInertia(layout.raw)],
      { reactHooks: [], framerNamed: [] }
    )

    // Ensure Arkzen adapter imports are present in the stripped body
    const bodyWithAdapterImports = ensureArkzenAdapterImports(strippedSources[0])

    const content = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name} [React+Inertia]
// Generated from tatemono: ${tatemono.meta.name}

${canonicalBlock}

${bodyWithAdapterImports}
`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Inertia Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─── Error handler files — @arkzen:error:404 and @arkzen:error:500 ────────────
//
// Mirrors vite-router.ts generateErrorPages() and Next.js generateErrorHandlers().
//   @arkzen:error:404 → Pages/{Tat}/NotFound.tsx + PHP catch-all route
//   @arkzen:error:500 → Pages/{Tat}/ErrorBoundary.tsx (class component)
//
// PHP catch-all is appended to the tatemono's route file instead of a
// separate file, consistent with how generatePageRouteFile() works.

function generateNotFoundFile(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const { strippedSources } = resolveImports(
    [normalizeForInertia(handler.raw)],
    { reactHooks: [], framerNamed: [] }
  )
  const cleanRaw = ensureArkzenAdapterImports(strippedSources[0])

  return `// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/NotFound.tsx [React+Inertia]
// Inertia page rendered for unmatched sub-routes under this tatemono.
// Registered as a catch-all route in routes/modules/${tatemono.meta.name}.pages.php
// DO NOT EDIT — edit the @arkzen:error:404 block in the tatemono instead.
// Generated: ${new Date().toISOString()}
// ============================================================

import React from 'react'
import { ErrorScreen } from './components/ErrorScreen'

${cleanRaw}

export default NotFoundPage
`
}

function generateErrorBoundaryFile(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const boundaryClassName = `ArkzenErrorBoundary_${toPascalCase(tatemono.meta.name)}`
  const { strippedSources } = resolveImports(
    [normalizeForInertia(handler.raw)],
    { reactHooks: [], framerNamed: [] }
  )
  const cleanRaw = ensureArkzenAdapterImports(strippedSources[0])

  return `// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/ErrorBoundary.tsx [React+Inertia]
// Class-based React ErrorBoundary wrapping all Inertia pages in this tatemono.
// DO NOT EDIT — edit the @arkzen:error:500 block in the tatemono instead.
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
}

function generateErrorHandlers(tatemono: ParsedTatemono, tatDir: string): boolean {
  if (!tatemono.errorHandlers || tatemono.errorHandlers.length === 0) return false

  let has404 = false
  for (const handler of tatemono.errorHandlers) {
    if (handler.type === '404') {
      has404 = true
      const content = generateNotFoundFile(tatemono, handler)
      fs.writeFileSync(path.join(tatDir, 'NotFound.tsx'), content, 'utf-8')
      console.log(`[Arkzen Inertia Router] ✓ Error handler: NotFound.tsx → /${tatemono.meta.name}/**`)
    } else if (handler.type === '500') {
      const content = generateErrorBoundaryFile(tatemono, handler)
      fs.writeFileSync(path.join(tatDir, 'ErrorBoundary.tsx'), content, 'utf-8')
      console.log(`[Arkzen Inertia Router] ✓ Error handler: ErrorBoundary.tsx → /${tatemono.meta.name}/**`)
    }
  }
  return has404
}


// ─── Root redirect ────────────────────────────────────────────────────────────

function generateRootRedirect(tatemono: ParsedTatemono): string | null {
  const hasIndex = tatemono.pages.some(p => p.name === 'index')
  if (hasIndex) return null

  const firstGuest = tatemono.pages.find(p => p.layout === 'guest')
  const firstAuth  = tatemono.pages.find(p => p.layout === 'auth')
  const firstPage  = tatemono.pages[0]

  const target = tatemono.meta.auth
    ? (firstGuest ?? firstAuth ?? firstPage)
    : (firstAuth  ?? firstGuest ?? firstPage)

  if (!target) return null
  return `/${tatemono.meta.name}/${target.name}`
}

// ─── Single Inertia page file ─────────────────────────────────────────────────

function generateInertiaPageFile(
  tatemono: ParsedTatemono,
  page: ArkzenPage,
  hasGlobalStyle: boolean,
): string {
  const tatName       = tatemono.meta.name
  const decl          = parsePageLayoutDecl(page.layout ?? (tatemono.meta.auth ? 'auth' : 'none'))
  const isAuthLayout  = decl.guard === 'auth'
  const isGuestLayout = decl.guard === 'guest'
  const isGuestOnly   = isGuestLayout && (
    (page as { guestOnly?: boolean }).guestOnly === true ||
    (tatemono.meta.auth && ['login', 'register', 'forgot-password', 'reset-password'].includes(page.name))
  )
  const { imports: layoutImports, openTags: layoutOpen, closeTags: layoutClose } = buildLayoutJSX(page, tatemono)

  const animFnName = tatemono.animation ? toCamelCase(tatName) + 'Animations' : null
  const hasAnimationFunction = !!animFnName && !!tatemono.animation?.raw.match(
    new RegExp(`(?:export\\s+)?(?:const|function)\\s+${animFnName}\\b`)
  )

  // Page sources ONLY — no component blocks merged in
  const allSources = [normalizeForInertia(page.raw.trim())]

  // Scrape framer-motion named exports from BOTH component and page sources
  const framerNeeded = new Set(['motion'])
  const framerRe = /import\s+\{([^}]*)\}\s+from\s+['"]framer-motion['"]/g
  const framerSources = [...tatemono.components.map(c => c.raw.trim()), ...allSources]
  for (const src of framerSources) {
    let m: RegExpMatchArray | null
    while ((m = framerRe.exec(src)) !== null) {
      m[1].split(',').map(s => s.trim()).filter(Boolean).forEach(n => framerNeeded.add(n))
    }
  }

  const animImportLine = animFnName
    ? `import { ${hasAnimationFunction ? `${animFnName}, ` : ''}pageVariants } from '@/arkzen/generated/${tatName}.animations'`
    : ''

  // Inertia-specific imports always injected by engine
  const inertiaImportLine = `import { usePage, router } from '@inertiajs/react'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'`

  const styleImportLine = hasGlobalStyle ? `import './styles/global.css'` : ''

  // Per-component imports — one import line per component file
  const componentNames = extractComponentNames(tatemono)
  const componentImportLines = [...componentNames]
    .sort()
    .map(name => `import { ${name} } from './components/${name}'`)
    .join('\n')

  // Detect React hooks used in the page's own source
  const KNOWN_REACT_HOOKS = [
    'useState', 'useCallback', 'useMemo', 'useContext', 'useReducer',
    'useLayoutEffect', 'useImperativeHandle', 'useTransition', 'useDeferredValue',
    'useId', 'useSyncExternalStore', 'useInsertionEffect',
  ]
  const pageStrippedForHooks = stripTemplateLiterals(normalizeForInertia(page.raw))
  const usedReactHooks = KNOWN_REACT_HOOKS.filter(hook =>
    new RegExp(`[^\\w$]${hook}\\s*[(<]`).test(pageStrippedForHooks)
  )

  // Smart imports for shared constants / hooks / utils / types this page uses
  const sharedConstants = extractSharedConstantNames(tatemono)
  const pageStrippedForConsts = stripTemplateLiterals(normalizeForInertia(page.raw))
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
  const referencedTypes = findReferencedNames(stripTemplateLiterals(normalizeForInertia(page.raw)), sharedTypes)
  const typesImportLine = referencedTypes.length > 0
    ? `import type { ${referencedTypes.sort().join(', ')} } from './components/types'`
    : ''

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
        if (/from\s+['\"](react|framer-motion)['\"]/.test(line)) continue

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

  const extraLines = [
    ...layoutImports,
    animImportLine,
    inertiaImportLine,
    styleImportLine,
    componentImportLines,
    constantsImportLine,
    hooksImportLine,
    utilsImportLine,
    typesImportLine,
    forwardedImportLines,
  ].filter(Boolean).join('\n')

  const { canonicalBlock, strippedSources } = resolveImports(allSources, {
    reactHooks:  ['useRef', 'useEffect', 'useState', ...usedReactHooks],
    framerNamed: [...framerNeeded],
    extra:       extraLines,
  })

  // Rewrite relative script imports to @/ alias
  const fixedCanonicalBlock = canonicalBlock.replace(
    /from\s+['"]\.\/([\w-]+\.scripts|[\w-]+\.[\w-]+\.script)['"]/g,
    `from '@/arkzen/generated/$1'`
  )

  const strippedPageCode = (strippedSources[0] ?? '')
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    // FIX: isMounted cleanup-only useEffect breaks under React StrictMode
    .replace(
      /useEffect\(\(\)\s*=>\s*\{\s*\n?\s*return\s*\(\)\s*=>\s*\{\s*isMounted\.current\s*=\s*false\s*\}\s*\n?\s*\},\s*\[\]\)/g,
      `useEffect(() => {\n    isMounted.current = true\n    return () => { isMounted.current = false }\n  }, [])`
    )
    .trim()

  const componentName = extractComponentName(page.name, page.raw)
  const wrapperName   = `ArkzenPage_${toPascalCase(tatName)}_${toPascalCase(page.name)}`
  const propsTypeName = `${toPascalCase(tatName)}${toPascalCase(page.name)}Props`

  return `// ============================================================
// ARKZEN GENERATED PAGE — ${tatName}/${page.name} [React+Inertia]
// Layout: ${decl.layout ?? decl.guard ?? 'none'} | Auth: ${isAuthLayout} | Guest-only: ${isGuestOnly}
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

${fixedCanonicalBlock}

// Props passed from Laravel via Inertia::render()
export type ${propsTypeName} = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Page component from @arkzen:page:${page.name} ─────────────────────────────
${strippedPageCode}

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ${wrapperName}() {
  const props   = usePage<${propsTypeName}>().props
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    ${hasAnimationFunction ? `const cleanup = ${animFnName}(pageRef)\n    return cleanup` : '// No animation initializer'}
  }, [])

  const content = (
    <motion.div
      ref={pageRef}
      variants={${animFnName ? 'pageVariants' : '{}'}}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <${componentName} {...props} />
    </motion.div>
  )

  ${layoutOpen ? `return (\n    ${layoutOpen}\n    {content}\n    ${layoutClose}\n  )` : `return content`}
}

export default ${wrapperName}
`
}

// ─── PHP route file ───────────────────────────────────────────────────────────

function generatePageRouteFile(tatemono: ParsedTatemono, has404: boolean): string {
  const tatName      = tatemono.meta.name
  const tatPascal    = toPascalCase(tatName)
  const redirectDest = generateRootRedirect(tatemono)
  const lines: string[] = []

  lines.push(`<?php`)
  lines.push(`// ============================================================`)
  lines.push(`// ARKZEN GENERATED PAGE ROUTES — ${tatName} [Inertia/Web]`)
  lines.push(`// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.`)
  lines.push(`// Generated: ${new Date().toISOString()}`)
  lines.push(`// Pages: ${tatemono.pages.map(p => p.name).join(', ')}`)
  lines.push(`// ============================================================`)
  lines.push(``)
  lines.push(`use Illuminate\\Support\\Facades\\Route;`)
  lines.push(``)
  lines.push(`// ── Inertia Page Routes ──────────────────────────────────────`)
  lines.push(`Route::middleware(['web'])->group(function () {`)

  if (redirectDest) {
    lines.push(`    // No index page — redirect root to first landing page (mirrors vite/next behaviour)`)
    lines.push(`    Route::redirect('/${tatName}', '${redirectDest}');`)
    lines.push(``)
  }

  for (const page of tatemono.pages) {
    const pagePascal = toPascalCase(page.name)
    const routePath  = page.name === 'index' ? `/${tatName}` : `/${tatName}/${page.name}`
    lines.push(`    // Page: ${page.name}`)
    lines.push(`    Route::get('${routePath}', function () {`)
    lines.push(`        return \\Inertia\\Inertia::render('${tatPascal}/${pagePascal}');`)
    lines.push(`    });`)
    lines.push(``)
  }

  // Catch-all for 404 — mirrors vite-router wildcard route and Next.js [...catchAll]
  if (has404) {
    lines.push(`    // Catch-all 404 — mirrors Next.js [...catchAll] and Vite wildcard route`)
    lines.push(`    Route::get('/${tatName}/{any}', function () {`)
    lines.push(`        return \\Inertia\\Inertia::render('${tatPascal}/NotFound');`)
    lines.push(`    })->where('any', '.*');`)
    lines.push(``)
  }

  lines.push(`});`)
  lines.push(``)

  return lines.join('\n')
}

// ─── Hub route ────────────────────────────────────────────────────────────────

// ─── Inertia page registry ────────────────────────────────────────────────────
// Writes resources/js/arkzen/generated/pages.ts — the map app.tsx uses to
// resolve Inertia page names to dynamic imports. Each entry looks like:
//   'InventoryManagement/Index': () => import('../../Pages/InventoryManagement/Index')
// The path is relative from generated/ to Pages/ — always two levels up.

interface InertiaPageEntry {
  tatName:  string   // e.g. 'InventoryManagement'
  pageName: string   // e.g. 'Index'  (PascalCase)
}

function readExistingRegistry(): InertiaPageEntry[] {
  if (!fs.existsSync(PAGES_REGISTRY)) return []
  const content = fs.readFileSync(PAGES_REGISTRY, 'utf-8')
  const matches = [...content.matchAll(/\/\/ PAGE:([^/]+)\/([^\s]+)/g)]
  return matches.map(m => ({ tatName: m[1], pageName: m[2] }))
}

function writePageRegistry(entries: InertiaPageEntry[]): void {
  ensureDir(GENERATED_DIR)

  const lines = entries.map(e => {
    const key  = `${e.tatName}/${e.pageName}`
    // pages.ts lives at resources/js/arkzen/generated/
    // Pages live at resources/js/Pages/
    // So relative path is always ../../Pages/{Tat}/{Page}
    const rel  = `../../Pages/${e.tatName}/${e.pageName}`
    return `  // PAGE:${key}\n  '${key}': () => import('${rel}'),`
  }).join('\n')

  const content = `// ============================================================
// ARKZEN GENERATED — Inertia Page Registry
// Auto-updated when tatemonos are built/removed
// DO NOT EDIT — managed by Arkzen engine
//
// Used in resources/js/app.tsx to resolve Inertia page names
// Laravel sends: Inertia::render('TatName/PageName', $props)
// This map resolves that string to the correct React component
// ============================================================

export type InertiaPageResolver = Record<string, () => Promise<{ default: React.ComponentType }>>

export const ARKZEN_INERTIA_PAGES: InertiaPageResolver = {
${lines}
}
`
  fs.writeFileSync(PAGES_REGISTRY, content, 'utf-8')
}

function ensureHubRoute(): void {
  const hubRouteFile = path.join(ROUTES_DIR, 'hub.pages.php')
  const hubPageFile  = path.join(PAGES_DIR, 'Hub.tsx')

  if (!fs.existsSync(hubRouteFile)) {
    const content = [
      `<?php`,
      `// ============================================================`,
      `// ARKZEN ENGINE — HUB ROUTE [Inertia/Web]`,
      `// Serves the Arkzen Hub at GET /`,
      `// Equivalent of app/page.tsx (Next) and App.tsx hub (Vite).`,
      `// DO NOT EDIT — engine-managed file.`,
      `// ============================================================`,
      ``,
      `use Illuminate\\Support\\Facades\\Route;`,
      ``,
      `Route::middleware(['web'])->group(function () {`,
      `    Route::get('/', function () {`,
      `        return \\Inertia\\Inertia::render('Hub');`,
      `    });`,
      `});`,
      ``,
    ].join('\n')

    fs.mkdirSync(ROUTES_DIR, { recursive: true })
    fs.writeFileSync(hubRouteFile, content, 'utf-8')
    console.log('[Arkzen Inertia Router] ✓ Hub route written: routes/modules/hub.pages.php')
  }

  if (!fs.existsSync(hubPageFile)) {
    console.warn('[Arkzen Inertia Router] ⚠ Hub.tsx missing — copy it to resources/js/Pages/Hub.tsx')
  }
}

// ─── CSS style files ──────────────────────────────────────────────────────────

function generateStyleFiles(tatemono: ParsedTatemono, tatDir: string): { hasGlobalStyle: boolean } {
  return emitTatemonoStyles(tatemono, tatDir, { loggerLabel: 'Arkzen Inertia Router' })
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function registerInertiaPages(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name
  const tatDir  = path.join(PAGES_DIR, toPascalCase(tatName))
  ensureDir(tatDir)
  ensureDir(ROUTES_DIR)

  console.log(`[Arkzen Inertia Router] Registering ${tatemono.pages.length} page(s) for: ${tatName}`)

  // Custom layouts — written before pages so imports resolve immediately
  generateCustomLayouts(tatemono)

  // Animation file — resources/js/arkzen/generated/{tat}.animations.ts
  if (tatemono.animation) {
    const animContent = generateAnimationFile(tatemono)
    if (animContent) {
      ensureDir(GENERATED_DIR)
      const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
      fs.writeFileSync(animPath, animContent, 'utf-8')
      console.log(`[Arkzen Inertia Router] ✓ Animation file written: arkzen/generated/${tatName}.animations.ts`)
    }
  }

  // v6.5: Global script file
  if (tatemono.script) {
    const scriptContent = generateScriptFile(tatemono)
    if (scriptContent) {
      ensureDir(GENERATED_DIR)
      fs.writeFileSync(path.join(GENERATED_DIR, `${tatName}.scripts.ts`), scriptContent, 'utf-8')
      console.log(`[Arkzen Inertia Router] ✓ Global script file generated`)
    }
  }

  // v6.5: Named script files
  if (tatemono.scripts && tatemono.scripts.length > 0) {
    ensureDir(GENERATED_DIR)
    generateNamedScriptFiles(tatemono, GENERATED_DIR)
  }

  // Individual component files (mirrors Vite v2.1 — real code per file, no _components.tsx barrel)
  generateIndividualComponentFiles(tatemono, tatDir)

  // Error handlers — 404 / 500 (mirrors vite-router and Next.js)
  const has404 = generateErrorHandlers(tatemono, tatDir)

  // CSS styles — global.css + CSS Modules in Pages/{Tat}/styles/
  const styleInfo = generateStyleFiles(tatemono, tatDir)

  // React page files — one per @arkzen:page:*
  for (const page of tatemono.pages) {
    const pageName    = toPascalCase(page.name)
    const pageContent = generateInertiaPageFile(tatemono, page, styleInfo.hasGlobalStyle)
    const pagePath    = path.join(tatDir, `${pageName}.tsx`)
    fs.writeFileSync(pagePath, pageContent, 'utf-8')

    const routeHint = page.name === 'index'
      ? `/${tatName}`
      : `/${tatName}/${page.name}`
    console.log(`[Arkzen Inertia Router] ✓ ${routeHint} → Pages/${toPascalCase(tatName)}/${pageName}.tsx`)
  }

  // Log root redirect
  const redirectDest = generateRootRedirect(tatemono)
  if (redirectDest) {
    console.log(`[Arkzen Inertia Router] ✓ /${tatName} → redirect to ${redirectDest}`)
  }

  // PHP page route file (includes root redirect + catch-all when needed)
  const pageRouteFile = path.join(ROUTES_DIR, `${tatName}.pages.php`)
  fs.writeFileSync(pageRouteFile, generatePageRouteFile(tatemono, has404), 'utf-8')
  console.log(`[Arkzen Inertia Router] ✓ Page routes written: routes/modules/${tatName}.pages.php`)

  // ── Inertia page registry — resources/js/arkzen/generated/pages.ts ───────
  // Keeps ARKZEN_INERTIA_PAGES in sync so app.tsx can resolve page names
  // sent by Laravel (e.g. 'InventoryManagement/Index') to dynamic imports.
  const tatPascal2        = toPascalCase(tatName)
  const existingEntries   = readExistingRegistry().filter(e => e.tatName !== tatPascal2)
  const newEntries: InertiaPageEntry[] = tatemono.pages.map(page => ({
    tatName:  tatPascal2,
    pageName: toPascalCase(page.name),
  }))
  writePageRegistry([...existingEntries, ...newEntries])
  console.log(`[Arkzen Inertia Router] ✓ Page registry updated: ${newEntries.length} page(s) → arkzen/generated/pages.ts`)

  console.log(`[Arkzen Inertia Router] ✓ ${tatemono.pages.length} page(s) written to laravel-inertia`)

  // ── Asset distribution (mirrors vite-router + Next.js router) ────────────
  // process.cwd() = engine/frontend/react-inertia/
  // Three levels up → project root → tatemonos/{tat}/assets
  try {
    const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
    const assetsPath   = path.join(tatemonosDir, tatName, 'assets')
    const publicDir    = path.join(BACKEND_DIR, 'public')
    cleanOldAssets(tatName, publicDir)
    const hasAssets = copyAssetsToPublic(tatName, assetsPath, publicDir)
    if (!hasAssets) {
      console.log(`[Arkzen Assets] No assets folder for ${tatName}`)
    }
  } catch (e) {
    console.log(`[Arkzen Assets] ⚠ Asset distribution skipped: ${e}`)
  }

  // Hub route — idempotent, only writes if missing
  ensureHubRoute()

  // ── Sitemap + robots.txt ──────────────────────────────────────────────────────
  // Inertia/Laravel serves public/ from the backend directory.
  try {
    const registry  = getRegistry()
    const publicDir = path.join(BACKEND_DIR, 'public')
    writeSitemap(registry, publicDir)
    writeRobotsTxt()
  } catch (e) {
    console.log(`[Arkzen Inertia Router] ⚠ Sitemap generation skipped`)
  }

  // v9.0: inject meta:web into app.blade.php
  generateInertiaBlade(tatemono)
}

// ─────────────────────────────────────────────
// GENERATE INERTIA app.blade.php — v9.0
// Injects full head metadata from @arkzen:meta:web into app.blade.php.
// Static global tags (description, OG, Twitter, favicon) go here.
// Per-page title is handled by Inertia's <Head> component in each page file.
// ─────────────────────────────────────────────

function generateInertiaBlade(tatemono: ParsedTatemono): void {
  const bladePath  = path.join(BACKEND_DIR, 'resources', 'views', 'app.blade.php')
  const webMeta    = tatemono.webMeta
  const meta       = tatemono.meta

  const title       = webMeta?.title ?? webMeta?.label ?? meta.name
  const description = webMeta?.description ?? meta.description ?? ''
  const favicon     = webMeta?.favicon ?? meta.favicon
  const og          = webMeta?.og
  const twitter     = webMeta?.twitter

  let faviconTag = ''
  if (favicon) {
    const isEmoji = [...favicon].length <= 2
    faviconTag = isEmoji
      ? `    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${favicon}</text></svg>" />`
      : `    <link rel="icon" href="${favicon}" />`
  }

  const metaTags: string[] = []
  if (description)    metaTags.push(`    <meta name="description" content="${description}" />`)
  // OG
  metaTags.push(`    <meta property="og:title" content="${og?.title ?? title}" />`)
  if (og?.description || description) {
    metaTags.push(`    <meta property="og:description" content="${og?.description ?? description}" />`)
  }
  if (og?.image) metaTags.push(`    <meta property="og:image" content="${og.image}" />`)
  if (og?.url)   metaTags.push(`    <meta property="og:url" content="${og.url}" />`)
  metaTags.push(`    <meta property="og:type" content="${og?.type ?? 'website'}" />`)
  // Twitter
  if (twitter) {
    metaTags.push(`    <meta name="twitter:card" content="${twitter.card ?? 'summary_large_image'}" />`)
    metaTags.push(`    <meta name="twitter:title" content="${twitter.title ?? title}" />`)
    if (twitter.description || description) {
      metaTags.push(`    <meta name="twitter:description" content="${twitter.description ?? description}" />`)
    }
    if (twitter.image) metaTags.push(`    <meta name="twitter:image" content="${twitter.image}" />`)
  }

  const content = `{{-- ============================================================ --}}
{{-- ARKZEN GENERATED BLADE — [Laravel Inertia]                   --}}
{{-- Auto-generated from @arkzen:meta:web — do not edit directly. --}}
{{-- ============================================================ --}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', '${title}') }}</title>

${faviconTag ? faviconTag + '\n' : ''}${metaTags.length ? metaTags.join('\n') + '\n' : ''}
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Scripts + Styles via Laravel Vite plugin -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])

        <!-- Inertia head (title, meta tags from InertiaHead component) -->
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
`
  fs.writeFileSync(bladePath, content, 'utf-8')
  console.log(`[Arkzen Inertia Router] ✓ app.blade.php updated — title: "${title}"`)
}

// ─── Write robots.txt ─────────────────────────────────────────────────────────

function writeRobotsTxt(): void {
  const publicDir = path.join(BACKEND_DIR, 'public')
  fs.mkdirSync(publicDir, { recursive: true })
  const robotsPath = path.join(publicDir, 'robots.txt')
  const content = `User-agent: *
Allow: /

Sitemap: ${process.env.VITE_SITE_URL || 'http://localhost:8000'}/sitemap.xml
`
  fs.writeFileSync(robotsPath, content, 'utf-8')
  console.log(`[Arkzen Inertia Router] ✓ robots.txt generated`)
}

// softUnregisterInertiaPages — used during REBUILD
// Mirrors next router softUnregisterPage():
//   Remove animation file only — leave Pages/{Tat}/ intact so Vite HMR
//   doesn't see a deleted route mid-write and serve a cached 404.
export function softUnregisterInertiaPages(tatName: string): void {
  console.log(`[Arkzen Inertia Router] Soft-unregistering (rebuild): ${tatName}`)

  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.rmSync(animPath, { force: true })
    console.log(`[Arkzen Inertia Router] ✓ Animation file removed`)
  }

  // v6.5: clean up script files
  cleanScriptFiles(GENERATED_DIR, tatName)
}

// unregisterInertiaPages — used during full REMOVE
// Deletes Pages folder, route file, animation file, and custom layouts.
export function unregisterInertiaPages(tatName: string): void {
  console.log(`[Arkzen Inertia Router] Unregistering: ${tatName}`)

  // React pages
  const tatDir = path.join(PAGES_DIR, toPascalCase(tatName))
  if (fs.existsSync(tatDir)) {
    fs.rmSync(tatDir, { recursive: true, force: true })
    console.log(`[Arkzen Inertia Router] ✓ Removed pages: ${tatName}`)
  }

  // PHP route file
  const pageRouteFile = path.join(ROUTES_DIR, `${tatName}.pages.php`)
  if (fs.existsSync(pageRouteFile)) {
    fs.rmSync(pageRouteFile, { force: true })
    console.log(`[Arkzen Inertia Router] ✓ Removed page routes: ${tatName}.pages.php`)
  }

  // Animation file
  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.rmSync(animPath, { force: true })
    console.log(`[Arkzen Inertia Router] ✓ Removed animation file: ${tatName}.animations.ts`)
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
        console.log(`[Arkzen Inertia Router] ✓ Removed custom layout: ${f}`)
      })
  }

  // Inertia page registry
  const remaining = readExistingRegistry().filter(e => e.tatName !== toPascalCase(tatName))
  writePageRegistry(remaining)
  console.log(`[Arkzen Inertia Router] ✓ Page registry cleaned: removed ${toPascalCase(tatName)}/* entries`)
}