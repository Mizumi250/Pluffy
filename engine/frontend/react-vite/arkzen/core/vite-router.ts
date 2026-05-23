// ============================================================
// ARKZEN ENGINE — VITE ROUTER v2.0
// React+Vite stack equivalent of router.ts
// Reads same ParsedTatemono, generates Vite-compatible output:
//   src/pages/{tatName}/{pageName}.tsx            ← page components
//   src/pages/{tatName}/components/_components.tsx ← shared components barrel
//   src/pages/{tatName}/components/{Name}.tsx      ← per-component re-exports
//   src/pages/{tatName}/components/index.ts        ← components index
//   src/pages/{tatName}/not-found.tsx             ← 404 handler (if declared)
//   src/pages/{tatName}/error-boundary.tsx        ← 500 boundary (if declared)
//   src/arkzen/generated/routes.ts                ← React Router route registry
//   src/arkzen/generated/{name}.animations.ts     ← GSAP animations
//
// v1.2 fixes (uniform with Next.js router):
//   • Strip any existing `export default` from page raw before
//     appending the Arkzen wrapper — prevents double default export
//   • Normalize animation fn: strip existing `export` before adding
//     it back — prevents `export export const` when tatemono already
//     writes `export const joPayrollAnimations`
//   • Auto-detect memo/useCallback/useReducer/useContext/useMemo
//     and add to React import
//   • Replace process.env.NEXT_PUBLIC_* → import.meta.env.VITE_*
//
// v1.3 fixes:
//   • ENGINE_OWNED_MODULES — framer-motion is now engine-owned:
//     scrape all named exports from page + component raw, merge with
//     engine-required ['motion'], emit ONE canonical import line.
//     Prevents "Identifier 'motion' has already been declared" when
//     tatemono page body already imports from framer-motion.
//
// v1.4 fixes:
//   • @arkzen:error:404 → generates not-found.tsx + wildcard route /{tat}/*
//     Mirrors Next.js segment not-found.tsx. Catches any unmatched sub-path
//     under the tatemono prefix and renders the tatemono's NotFoundPage.
//   • @arkzen:error:500 → generates error-boundary.tsx class component.
//     Mirrors Next.js segment error.tsx. App.tsx wraps tatemono routes with
//     the boundary via ARKZEN_ERROR_BOUNDARIES exported from routes.ts.
//   • ViteRoute gains optional `errorBoundary` field; writeRouteRegistry
//     emits ARKZEN_ERROR_BOUNDARIES map so App.tsx can wrap per-tatemono.
//
// v2.0 — full parity with router.ts (Next.js v5.1):
//   • resolveImports() + flattenMultilineImports() — unified import resolver.
//     Engine owns all imports in generated files. Authors write imports freely
//     in any block; engine scrapes, deduplicates, merges, and injects one
//     canonical import block per generated file. Replaces the simpler
//     resolveFramerImports / stripFramerImports approach.
//   • ENGINE_OWNED_MODULES — 'react' and 'framer-motion' are always seeded
//     by the engine and stripped from raw author code before being re-emitted.
//   • generateIndividualComponentFiles() — per-component .tsx re-exports
//     + _components.tsx barrel. Mirrors Next.js exactly.
//     Replaces generateSharedComponents() / _shared.tsx.
//   • generateComponentsIndex() — index.ts barrel for the components folder.
//   • generateCustomLayouts() now uses resolveImports for clean import handling.
//   • generatePageFile() now uses resolveImports instead of manual regex chains.
//   • generateAnimationFile() now uses resolveImports for clean stripping.
//   • softUnregisterVitePages() — mirrors Next.js softUnregisterPage():
//     removes animation file + routes only, leaves pages dir intact so
//     Vite HMR doesn't cache a 404 mid-rebuild.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage, ArkzenErrorHandler } from '../types'
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

  const importRegex = /^import\s+\{([^}]*)\}\s+from\s+['"]react-router-dom['"][ \t]*;?[ \t]*$/m
  const existing = raw.match(importRegex)
  if (!existing) {
    return `import { ${needed.join(', ')} } from 'react-router-dom'\n${raw}`
  }

  const existingSpecifiers = existing[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const merged = [...new Set([...existingSpecifiers, ...needed])].sort()
  return raw.replace(importRegex, `import { ${merged.join(', ')} } from 'react-router-dom'`)
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

// ─── Layout helpers ────────────────────────────────────────────────────────────

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

// ─── Individual component files ───────────────────────────────────────────────
// Mirrors Next.js generateIndividualComponentFiles() exactly.
// Writes src/pages/{tat}/components/_components.tsx + one re-export per component.
// Replaces the old generateSharedComponents() / _shared.tsx approach.

function generateIndividualComponentFiles(tatemono: ParsedTatemono, tatDir: string): void {
  if (tatemono.components.length === 0) return

  const componentsDir = path.join(tatDir, 'components')
  fs.mkdirSync(componentsDir, { recursive: true })

  // Resolve imports across ALL component blocks into one canonical block
  const rawSources = tatemono.components.map(c => normalizeForVite(c.raw.trim()))
  const { canonicalBlock, strippedSources } = resolveImports(rawSources)

  // Ensure every top-level const/function/class declaration is exported so
  // per-component re-export files can safely do `export { X } from './_components'`
  const ensureExports = (src: string): string =>
    src.replace(
      /^(const|function|class|type|interface|enum)\s+([A-Z])/gm,
      'export $1 $2'
    )

  const exportedSources = strippedSources.map(ensureExports)

  const componentsFile = path.join(componentsDir, '_components.tsx')
  const componentsContent = `// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — ${tatemono.meta.name} [React+Vite]
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${exportedSources.join('\n\n')}
`
  fs.writeFileSync(componentsFile, componentsContent, 'utf-8')
  console.log(`[Arkzen Vite Router] ✓ Utilities: _components.tsx`)

  // Build a map of component names that have CSS Modules (from named styles)
  const stylesByComponent = new Map<string, string>()
  for (const style of tatemono.styles.filter(s => s.name)) {
    stylesByComponent.set(style.name, style.name)
  }

  // Extract PascalCase component names — skip types and ALL_CAPS constants
  const extractedComponents = new Set<string>()
  for (const component of tatemono.components) {
    const componentMatches = component.raw.match(/(?:export\s+)?const\s+([A-Z][A-Za-z0-9_$]*)\s*[=:(]/g) || []
    for (const match of componentMatches) {
      const name = match.match(/const\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^[A-Z_]+$/.test(name)) {
        extractedComponents.add(name)
      }
    }
  }

  // Generate individual component files that re-export from _components
  for (const compName of extractedComponents) {
    const fileName = `${compName}.tsx`
    const filePath = path.join(componentsDir, fileName)

    const cssImport = stylesByComponent.has(compName)
      ? `import styles from '../styles/${compName}.module.css'\n`
      : ''

    const content = `// ============================================================
// ARKZEN GENERATED COMPONENT — ${compName} [React+Vite]
// Re-exported from _components.tsx
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${cssImport}export { ${compName} } from './_components'
`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Vite Router] ✓ Component: ${fileName}`)
  }

  // Clean up old loose files
  try {
    const files = fs.readdirSync(componentsDir)
    for (const file of files) {
      if (file.endsWith('.tsx') && !file.startsWith('_') && !extractedComponents.has(file.replace('.tsx', ''))) {
        fs.unlinkSync(path.join(componentsDir, file))
      }
    }
  } catch (e) {
    // ignore
  }
}

// ─── Components index file ────────────────────────────────────────────────────

function generateComponentsIndex(tatemono: ParsedTatemono, tatDir: string): void {
  if (tatemono.components.length === 0) return

  const componentsDir = path.join(tatDir, 'components')
  const indexPath = path.join(componentsDir, 'index.ts')

  const content = `// ============================================================
// ARKZEN GENERATED COMPONENTS INDEX — ${tatemono.meta.name} [React+Vite]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

export * from './_components'
`
  fs.writeFileSync(indexPath, content, 'utf-8')
  console.log(`[Arkzen Vite Router] ✓ Components index: index.ts`)
}

// ─── Generate a single page file ──────────────────────────────────────────────

function generatePageFile(tatemono: ParsedTatemono, page: ArkzenPage, hasGlobalStyle: boolean): string {
  const tatName       = tatemono.meta.name
  const layout        = page.layout ?? (tatemono.meta.auth ? 'auth' : 'none')
  const isAuthLayout  = layout === 'auth'
  const isGuestLayout = layout === 'guest'
  const isGuestOnly   = isGuestLayout && (
    (page as { guestOnly?: boolean }).guestOnly === true ||
    (tatemono.meta.auth && ['login', 'register', 'forgot-password', 'reset-password'].includes(page.name))
  )
  const layoutImport = layout !== 'none' ? getLayoutImport(layout, tatName) : ''
  const layoutComp   = layout !== 'none' ? getLayoutComponent(layout) : 'React.Fragment'
  const animFnName   = tatemono.animation ? toCamelCase(tatName) + 'Animations' : null
  const animImport   = animFnName
    ? `import { ${animFnName}, pageVariants } from '@/arkzen/generated/${tatName}.animations'`
    : ''
  const styleImport  = hasGlobalStyle ? `import './styles/global.css'` : ''

  // Collect all sources: all component blocks + this page's raw code
  const allSources = [
    ...tatemono.components.map(c => normalizeForVite(c.raw.trim())),
    normalizeForVite(page.raw.trim()),
  ]

  // Scrape framer-motion named exports from all sources so we don't lose
  // AnimatePresence, useMotionValue etc. that the tatemono uses
  const framerNeeded = new Set(['motion'])
  const framerRe = /import\s+\{([^}]*)\}\s+from\s+['"]framer-motion['"]/g
  for (const src of allSources) {
    let m: RegExpMatchArray | null
    while ((m = framerRe.exec(src)) !== null) {
      m[1].split(',').map(s => s.trim()).filter(Boolean).forEach(n => framerNeeded.add(n))
    }
  }

  // Detect react-router-dom needs before resolveImports so we can inject them
  const combinedRaw    = allSources.join('\n')
  const needsLocation  = /\buseLocation\s*\(/.test(combinedRaw)
  const needsLink      = /<Link\b/.test(combinedRaw)

  const routerDomSpecifiers = [
    'useNavigate',
    needsLocation && 'useLocation',
    needsLink && 'Link',
  ].filter(Boolean).join(', ')
  const routerDomImportLine = `import { ${routerDomSpecifiers} } from 'react-router-dom'`

  const extraLines = [layoutImport, animImport, routerDomImportLine, styleImport]
    .filter(Boolean).join('\n')

  // Detect extra React hooks
  const needsMemo    = /\bmemo\s*\(/.test(combinedRaw)
  const needsCb      = /\buseCallback\s*\(/.test(combinedRaw)
  const needsReducer = /\buseReducer\s*\(/.test(combinedRaw)
  const needsCtx     = /\buseContext\s*\(/.test(combinedRaw)
  const needsUseMemo = /\buseMemo\s*\(/.test(combinedRaw)

  const reactHooks = [
    'useRef',
    'useEffect',
    'useState',
    needsMemo    && 'memo',
    needsCb      && 'useCallback',
    needsReducer && 'useReducer',
    needsCtx     && 'useContext',
    needsUseMemo && 'useMemo',
  ].filter(Boolean) as string[]

  const { canonicalBlock: rawCanonicalBlock, strippedSources } = resolveImports(allSources, {
    reactHooks,
    framerNamed: [...framerNeeded],
    extra:       extraLines,
  })

  // Pages live at src/pages/{tat}/{page}.tsx but .scripts/.script files are at src/arkzen/generated/
  // Rewrite any './{name}.scripts' or './{name}.*.script' to '@/arkzen/generated/{name}...'
  const canonicalBlock = rawCanonicalBlock.replace(
    /from\s+['"]\.\/([\w-]+\.scripts|[\w-]+\.[\w-]+\.script)['"]/g,
    `from '@/arkzen/generated/$1'`
  )

  const strippedComponentCode = strippedSources.slice(0, tatemono.components.length).join('\n\n')
  const strippedPageCode = (strippedSources[tatemono.components.length] ?? '')
    // FIX v1.2: strip any `export default XxxPage` already in the raw page body
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    // FIX: isMounted cleanup-only useEffect breaks under React StrictMode
    .replace(
      /useEffect\(\(\)\s*=>\s*\{\s*\n?\s*return\s*\(\)\s*=>\s*\{\s*isMounted\.current\s*=\s*false\s*\}\s*\n?\s*\},\s*\[\]\)/g,
      `useEffect(() => {\n    isMounted.current = true\n    return () => { isMounted.current = false }\n  }, [])`
    )
    .trim()

  // Extract the page component name from raw
  const componentName = extractComponentName(page.name, page.raw)
  const wrapperName   = `ArkzenPage_${toPascalCase(tatName)}_${toPascalCase(page.name)}`

  return `// ============================================================
// ARKZEN GENERATED PAGE — ${tatName}/${page.name} [React+Vite]
// Layout: ${layout} | Auth: ${isAuthLayout} | Guest-only: ${isGuestOnly}
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

// ── Shared components from @arkzen:components ─────────────────────────────────
${strippedComponentCode}

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
    <${layoutComp}${isAuthLayout ? ' requireAuth={true}' : ''}${isGuestOnly ? ' guestOnly={true}' : ''}>
      <motion.div
        ref={pageRef}
        variants={${animFnName ? 'pageVariants' : '{}'}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <${componentName} />
      </motion.div>
    </${layoutComp}>
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

  const { strippedSources } = resolveImports([tatemono.script.raw], {
    reactHooks:  [],
    framerNamed: [],
  })

  const cleanScript = strippedSources[0]
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

    const { strippedSources } = resolveImports([section.raw], {
      reactHooks:  [],
      framerNamed: [],
    })

    const cleanScript = strippedSources[0]
      .replace(/\*\/\s*$/, '')
      .trim()

    const fileName = `${tatemono.meta.name}.${scriptName}.script.ts`
    const filePath = path.join(generatedDir, fileName)
    const fileOut  = `// ============================================================
// ARKZEN GENERATED SCRIPT — ${tatemono.meta.name}/${scriptName}
// Source: @arkzen:script:${scriptName}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${cleanScript}
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
    // Ensure react-router-dom imports are present in the stripped body
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
import { ErrorScreen } from './components'

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
import { ErrorScreen } from './components'

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
import { Navigate } from 'react-router-dom'

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

  // Individual component files (mirrors Next.js — replaces old _shared.tsx)
  generateIndividualComponentFiles(tatemono, tatDir)
  generateComponentsIndex(tatemono, tatDir)
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

// ─── Write robots.txt ─────────────────────────────────────────────────────────

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