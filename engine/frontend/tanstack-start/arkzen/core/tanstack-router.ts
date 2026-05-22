// ============================================================
// ARKZEN ENGINE — TANSTACK START ROUTER v2.0 [PRODUCTION-GRADE]
// arkzen/core/tanstack-router.ts
//
// TanStack Start equivalent of vite-router.ts (full feature parity).
// Reads ParsedTatemono, generates:
//   src/pages/{tatName}/{pageName}.tsx              ← page components
//   src/pages/{tatName}/components/_components.tsx  ← barrel
//   src/pages/{tatName}/components/{Name}.tsx       ← per-component
//   src/pages/{tatName}/components/index.ts         ← index barrel
//   src/pages/{tatName}/not-found.tsx               ← 404 (if declared)
//   src/pages/{tatName}/error-boundary.tsx          ← 500 (if declared)
//   src/routes/{tatName}/{pageName}.tsx             ← TanStack file-based routes
//   src/arkzen/generated/routeTree.ts               ← assembled route tree
//   src/arkzen/generated/{name}.animations.ts       ← GSAP animations
//
// v2.0 — FULL PARITY WITH vite-router.ts v2.0:
//   • resolveImports() + flattenMultilineImports() — unified import resolver
//   • ENGINE_OWNED_MODULES — react + framer-motion always seeded by engine
//   • generateIndividualComponentFiles() — per-component .tsx re-exports
//   • generateComponentsIndex() — components/index.ts barrel
//   • generatePageFile() — production-grade with StrictMode isMounted fix
//   • generateAnimationFile() — with auto-injected pageVariants
//   • generateErrorPages() — 404 wildcard + 500 error boundary
//   • generateCustomLayouts() — with full import resolution
//   • normalizeForTanStack() — converts Next.js/Vite code to TanStack-compatible
//   • generateTanStackRouteFile() — generates complete route files with imports
//   • softUnregisterTanStackPages() — preserve pages during rebuild HMR
//
// KEY DIFFERENCE from vite-router.ts:
//   TanStack Start uses FILE-BASED ROUTING — each page gets its own
//   route file in src/routes/{tatName}/{pageName}.tsx that wraps the
//   page component in createFileRoute(). The routeTree.ts then imports
//   and assembles all routes into the router.
//   All page components in src/pages/ are identical to Vite stack.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage, ArkzenErrorHandler } from '../types'
import { emitTatemonoStyles } from './lib/dsl-style-emitter'
import { copyAssetsToPublic, cleanOldAssets } from './assets'

const SRC_DIR       = path.resolve(process.cwd(), 'src')
const PUBLIC_DIR    = path.resolve(process.cwd(), 'public')
const PAGES_DIR     = path.join(SRC_DIR, 'pages')
const ROUTES_DIR    = path.join(SRC_DIR, 'routes')
const GENERATED_DIR = path.join(SRC_DIR, 'arkzen', 'generated')
const LAYOUTS_DIR   = path.join(process.cwd(), 'arkzen', 'core', 'layouts', 'custom')
const ROUTE_TREE    = path.join(GENERATED_DIR, 'routeTree.ts')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

function toCamelCase(str: string): string {
  const p = toPascalCase(str)
  return p.charAt(0).toLowerCase() + p.slice(1)
}

function toSafeComponentName(name: string): string {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// ─── TanStack-specific normalizations ──────────────────────────────────────────

function normalizeForTanStack(raw: string): string {
  // Remove Next.js imports that don't apply to TanStack
  let out = raw
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/navigation['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/router['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+Link\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/image['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    // Remove 'use client' directive (TanStack handles server/client implicitly)
    .replace(/^[ \t]*['"]use client['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    // Normalize router calls for React Router (which TanStack uses)
    .replace(/\buseRouter\(\)/g, 'useNavigate()')
    .replace(/\busePathname\(\)/g, 'useLocation().pathname')
    .replace(/(<Link\b[^>]*?)\bhref=/g, '$1to=')
    .replace(/process\.env\.NEXT_PUBLIC_(\w+)/g, 'import.meta.env.VITE_$1')

  // Normalize useRouter().push/replace/refresh to useNavigate()
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

// ─── Production-grade import resolver (based on Next.js) ──────────────────────

const ENGINE_OWNED_MODULES = new Set(['react', 'framer-motion'])

interface ResolvedImports {
  canonicalBlock: string
  strippedSources: string[]
}

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

function resolveImports(
  sources: string[],
  engineRequired: {
    reactHooks?: string[]
    framerNamed?: string[]
    extra?: string
  } = {}
): ResolvedImports {
  // module → { defaultImport?: string, named: Set<string> }
  const importMap = new Map<string, { defaultImport?: string; named: Set<string> }>()

  const getEntry = (mod: string) => {
    if (!importMap.has(mod)) importMap.set(mod, { named: new Set() })
    return importMap.get(mod)!
  }

  // Seed engine-required entries
  const reactEntry = getEntry('react')
  ;(engineRequired.reactHooks ?? ['useRef', 'useEffect']).forEach(h => reactEntry.named.add(h))

  const framerEntry = getEntry('framer-motion')
  ;(engineRequired.framerNamed ?? ['motion']).forEach(n => framerEntry.named.add(n))

  // Patterns
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

  // Build canonical import block
  const lines: string[] = []

  // 1. React always first
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

  // 4. Side-effects
  sideEffects.forEach(s => lines.push(s))

  // 5. Extra imports
  if (engineRequired.extra) {
    lines.push(engineRequired.extra)
  }

  const canonicalBlock = lines.filter(Boolean).join('\n')

  // Strip all imports + 'use client' from sources
  const stripRaw = (src: string) =>
    src
      .replace(/^\s*['"]use client['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .trim()

  const strippedSources = sources.map(stripRaw)

  return { canonicalBlock, strippedSources }
}

// ─── Page file generator (production-grade, based on Next.js) ────────────────

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

function getLayoutImport(layout: string, tatName: string): string {
  switch (layout) {
    case 'guest': return `import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'`
    case 'auth':  return `import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'`
    default:
      return `import { ${toPascalCase(layout)}Layout } from '@/arkzen/core/layouts/custom/${tatName}-${layout}'`
  }
}

function getLayoutComponent(layout: string): string {
  switch (layout) {
    case 'guest': return 'GuestLayout'
    case 'auth':  return 'AuthLayout'
    default:      return `${toPascalCase(layout)}Layout`
  }
}

function generatePageFile(
  tatemono: ParsedTatemono,
  page: ArkzenPage,
  animationFnName: string | null,
): string {
  const componentName = extractComponentName(page.name, page.raw)
  const layoutImport  = getLayoutImport(page.layout, tatemono.meta.name)
  const layoutComp    = getLayoutComponent(page.layout)
  const isAuthLayout  = page.layout === 'auth'
  const isGuestLayout = page.layout === 'guest'

  const isGuestOnly = isGuestLayout && (
    (page as any).guestOnly === true ||
    (tatemono.meta.auth && ['login', 'register', 'forgot-password', 'reset-password'].includes(page.name))
  )

  // Collect all sources: all component blocks + this page's raw code
  // FIRST: normalize each source to remove Next.js/Vite imports that don't apply
  const allSources = [
    ...tatemono.components.map(c => normalizeForTanStack(c.raw.trim())),
    normalizeForTanStack(page.raw.trim()),
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

  // BEFORE resolveImports: detect what TanStack adapter imports are needed
  // (Vite pattern: scan combined code and add to extraLines)
  const combinedRaw = allSources.join('\n')
  const needsNavigate = /\buseNavigate\s*\(/.test(combinedRaw)
  const needsLocation = /\buseLocation\s*\(/.test(combinedRaw)
  const needsLink = /<Link\b/.test(combinedRaw)

  const tanstackAdapterSpecifiers = [
    needsNavigate && 'useNavigate',
    needsLocation && 'useLocation',
  ].filter(Boolean).join(', ')

  const tanstackAdapterImportLine = tanstackAdapterSpecifiers
    ? `import { ${tanstackAdapterSpecifiers} } from '@/arkzen/core/adapters/router'`
    : ''

  const linkImportLine = needsLink
    ? `import { Link } from '@/arkzen/core/adapters/Link'`
    : ''

  const animImportLine = animationFnName
    ? `import { ${animationFnName}, pageVariants } from '@/arkzen/generated/${tatemono.meta.name}.animations'`
    : ''

  const extraLines = [layoutImport, animImportLine, tanstackAdapterImportLine, linkImportLine]
    .filter(Boolean).join('\n')

  const { canonicalBlock, strippedSources } = resolveImports(allSources, {
    reactHooks:   ['useRef', 'useEffect'],
    framerNamed:  [...framerNeeded],
    extra:        extraLines,
  })

  // strippedSources: [comp0, comp1, ..., pageRaw]
  const strippedComponentCode = strippedSources.slice(0, tatemono.components.length).join('\n\n')
  const strippedPageCode      = (strippedSources[tatemono.components.length] ?? '')
    // FIX: isMounted cleanup-only useEffect breaks under React StrictMode —
    // StrictMode remounts components in dev, firing the cleanup and permanently
    // setting isMounted.current = false before load() runs, leaving the page
    // stuck on "Loading...". Rewrite to reset isMounted.current = true on mount
    // so the ref is always correct after a remount.
    .replace(
      /useEffect\(\(\)\s*=>\s*\{\s*\n?\s*return\s*\(\)\s*=>\s*\{\s*isMounted\.current\s*=\s*false\s*\}\s*\n?\s*\},\s*\[\]\)/g,
      `useEffect(() => {\n    isMounted.current = true\n    return () => { isMounted.current = false }\n  }, [])`
    )

  return `// ============================================================
// ARKZEN GENERATED PAGE — ${tatemono.meta.name}/${page.name}
// Layout: ${page.layout} | Auth guard: ${isAuthLayout} | Guest-only: ${isGuestOnly}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

// Utilities, types, and helper functions from @arkzen:components
${strippedComponentCode}

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

// ─── TanStack route file generator ────────────────────────────────────────────

function routePathForPage(tatName: string, page: ArkzenPage): string {
  if (page.name === 'index' || page.name === '__root_redirect') return `/${tatName}`
  if (page.name === 'not-found') return `/${tatName}/$`
  return `/${tatName}/${page.name}`
}

function generateTanStackRouteFile(
  tatName: string,
  page: ArkzenPage,
  errorBoundaryClass?: string,
): string {
  if (!page.name) {
    throw new Error(`[TanStack] Page missing name in ${tatName}`)
  }

  const routePath = routePathForPage(tatName, page)
  const importPath = `@/pages/${tatName}/${page.name}`

  if (!routePath) {
    throw new Error(`[TanStack] Cannot generate route path for ${tatName}/${page.name}`)
  }

  const errorComponentBlock = errorBoundaryClass
    ? `  errorComponent: lazyRouteComponent(() =>\n    import('@/pages/${tatName}/error-boundary').then(m => ({ default: m.${errorBoundaryClass} }))\n  ),\n`
    : ''

  return `// ============================================================
// ARKZEN GENERATED — TanStack Route: ${routePath}
// Auto-generated by Arkzen engine (tanstack-router.ts)
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('${routePath}')({
  component: lazyRouteComponent(() =>
    import('${importPath}').then(m => ({ default: m.default }))
  ),
${errorComponentBlock}})
`
}

// ─── Error pages ──────────────────────────────────────────────────────────────

function generateErrorPages(
  tatemono: ParsedTatemono,
  tatDir: string,
): { has404: boolean; has500: boolean } {
  let has404 = false
  let has500 = false

  for (const handler of tatemono.errorHandlers) {
    const { strippedSources } = resolveImports(
      [normalizeForTanStack(handler.raw)],
      { reactHooks: [], framerNamed: [] }
    )
    const cleanRaw = strippedSources[0].trim()

    // ── 404 ──────────────────────────────────────────────────────────────────
    if (handler.type === '404') {
      has404 = true

      const content = `// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/not-found [TanStack]
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
      console.log(`[Arkzen TanStack] ✓ Not-found page: /${tatemono.meta.name}/* → not-found.tsx`)
    }

    // ── 500 ──────────────────────────────────────────────────────────────────
    if (handler.type === '500') {
      has500 = true
      const boundaryClassName = `ArkzenErrorBoundary_${toPascalCase(tatemono.meta.name)}`

      const content = `// ============================================================
// ARKZEN GENERATED — ${tatemono.meta.name}/error-boundary [TanStack]
// Class-based React ErrorBoundary wrapping all routes for this tatemono.
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
      console.log(`[Arkzen TanStack] ✓ Error boundary: ${tatemono.meta.name}/error-boundary.tsx`)
    }
  }

  return { has404, has500 }
}

// ─── Custom layouts ───────────────────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  if (tatemono.layouts.length === 0) return
  ensureDir(LAYOUTS_DIR)

  for (const layout of tatemono.layouts) {
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(LAYOUTS_DIR, fileName)

    const normalizedRaw = normalizeForTanStack(layout.raw.trim())

    const { canonicalBlock, strippedSources } = resolveImports(
      [normalizedRaw],
      { reactHooks: [], framerNamed: [] }
    )

    // Inject adapter import for useNavigate / useLocation if the layout uses them
    const needsNavigate = /\buseNavigate\s*\(/.test(normalizedRaw)
    const needsLocation = /\buseLocation\s*\(/.test(normalizedRaw)
    const adapterSpecifiers = [
      needsNavigate && 'useNavigate',
      needsLocation && 'useLocation',
    ].filter(Boolean).join(', ')
    const adapterImport = adapterSpecifiers
      ? `import { ${adapterSpecifiers} } from '../../adapters/router'`
      : ''

    const content = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name} [TanStack]\n\n${canonicalBlock}${adapterImport ? '\n' + adapterImport : ''}\n\n${strippedSources[0]}\n`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen TanStack] ✓ Custom layout: ${fileName}`)
  }
}

// ─── Root redirect ────────────────────────────────────────────────────────────

function generateRootRedirectPage(tatemono: ParsedTatemono): { fileName: string; routePath: string } | null {
  const hasIndex = tatemono.pages.some(p => p.name === 'index')
  if (hasIndex) return null

  const firstGuest = tatemono.pages.find(p => p.layout === 'guest')
  const firstAuth  = tatemono.pages.find(p => p.layout === 'auth')
  const firstPage  = tatemono.pages[0]

  // Auth tatemonos: redirect to login (guest) first
  // Non-auth tatemonos: redirect to first available page
  const target = tatemono.meta.auth
    ? (firstGuest ?? firstAuth ?? firstPage)
    : (firstGuest ?? firstAuth ?? firstPage)

  if (!target) return null

  const tatName     = tatemono.meta.name
  const destination = `/${tatName}/${target.name}`
  const fileName    = '__root_redirect'

  // Write the TanStack route file directly into ROUTES_DIR.
  // Uses beforeLoad: () => redirect() — the correct TanStack pattern.
  // No page component needed; react-router-dom's <Navigate> does nothing
  // inside TanStack Router's render tree.
  const routeContent = `// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — ${tatName} [TanStack]
// Visiting /${tatName} redirects to ${destination}
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/${tatName}')({
  beforeLoad: () => {
    throw redirect({ to: '${destination}', replace: true })
  },
})
`

  const routeDir = path.join(ROUTES_DIR, tatName)
  ensureDir(routeDir)
  fs.writeFileSync(path.join(routeDir, `${fileName}.tsx`), routeContent, 'utf-8')
  console.log(`[Arkzen TanStack] ✓ Root redirect: /${tatName} → ${destination}`)

  return { fileName, routePath: `/${tatName}` }
}

// ─── Route tree writer ────────────────────────────────────────────────────────

interface RouteEntry {
  tatName:  string
  page:     ArkzenPage
  routeVar: string
  filePath: string  // relative to src/routes/
}

interface RouteTree {
  routes: RouteEntry[]
  authTatemonos: string[]
}

function readExistingRouteTree(): RouteTree {
  if (!fs.existsSync(ROUTE_TREE)) {
    return { routes: [], authTatemonos: [] }
  }

  const content = fs.readFileSync(ROUTE_TREE, 'utf-8')
  
  // Extract auth tatemonos from the file
  const authMatch = content.match(/export const AUTH_TATEMONOS.*?\[([\s\S]*?)\]/)
  const authTatemonos = authMatch
    ? authMatch[1]
        .split('\n')
        .map(line => line.trim().replace(/[",]/g, ''))
        .filter(Boolean)
    : []

  // For now, we'll rebuild the complete list by scanning generated route files
  // This ensures consistency even if the file was manually edited
  const routes: RouteEntry[] = []
  
  if (fs.existsSync(ROUTES_DIR)) {
    const tatDirs = fs.readdirSync(ROUTES_DIR)
    for (const tatName of tatDirs) {
      const tatRoutesDir = path.join(ROUTES_DIR, tatName)
      const stat = fs.statSync(tatRoutesDir)
      if (!stat.isDirectory()) continue

      const files = fs.readdirSync(tatRoutesDir)
      for (const file of files) {
        if (file.endsWith('.tsx')) {
          const pageName = file.replace('.tsx', '')
          routes.push({
            tatName,
            page: { name: pageName, layout: 'none', raw: '' } as ArkzenPage,
            routeVar: `Route_${toPascalCase(tatName)}_${toPascalCase(pageName)}`,
            filePath: `${tatName}/${pageName}`,
          })
        }
      }
    }
  }

  return { routes, authTatemonos }
}

function writeRouteTree(entries: RouteEntry[], authTatemonos: string[]): void {
  if (!fs.existsSync(ROUTE_TREE)) {
    console.error(`[Arkzen TanStack] ✗ Route tree file not found: ${ROUTE_TREE}`)
    throw new Error(`Route tree file not found: ${ROUTE_TREE}`)
  }
  
  let content = fs.readFileSync(ROUTE_TREE, 'utf-8')

  // Build import block
  const importLines = entries.map(e => {
    if (!e.tatName || !e.routeVar || !e.page?.name) {
      throw new Error(`Invalid route entry: tatName=${e.tatName}, routeVar=${e.routeVar}, page.name=${e.page?.name}`)
    }
    return `import { Route as ${e.routeVar} } from '../../routes/${e.tatName}/${e.page.name}'`
  }).join('\n')

  // Build children block
  const childrenLines = entries.map(e => `  ${e.routeVar},`).join('\n')

  // Build auth tatemonos
  const authList = authTatemonos.map(t => `  "${t}",`).join('\n')

  content = content
    .replace(
      /\/\/ TANSTACK_ROUTE_IMPORTS_START[\s\S]*?\/\/ TANSTACK_ROUTE_IMPORTS_END/,
      `// TANSTACK_ROUTE_IMPORTS_START\n${importLines}\n// TANSTACK_ROUTE_IMPORTS_END`,
    )
    .replace(
      /\/\/ TANSTACK_ROUTE_CHILDREN_START[\s\S]*?\/\/ TANSTACK_ROUTE_CHILDREN_END/,
      `// TANSTACK_ROUTE_CHILDREN_START\n${childrenLines}\n  // TANSTACK_ROUTE_CHILDREN_END`,
    )
    .replace(
      /\/\/ TANSTACK_AUTH_TATEMONOS_START[\s\S]*?\/\/ TANSTACK_AUTH_TATEMONOS_END/,
      `// TANSTACK_AUTH_TATEMONOS_START\nexport const AUTH_TATEMONOS: string[] = [\n${authList}\n]\n// TANSTACK_AUTH_TATEMONOS_END`,
    )

  fs.writeFileSync(ROUTE_TREE, content, 'utf-8')
}

// ─── Individual component files ───────────────────────────────────────────────
// Mirrors Next.js/Vite generateIndividualComponentFiles() exactly.
// Writes src/pages/{tat}/components/_components.tsx + one re-export per component.

function generateIndividualComponentFiles(tatemono: ParsedTatemono, tatDir: string): void {
  if (tatemono.components.length === 0) return

  const componentsDir = path.join(tatDir, 'components')
  fs.mkdirSync(componentsDir, { recursive: true })

  // Resolve imports across ALL component blocks into one canonical block
  const rawSources = tatemono.components.map(c => normalizeForTanStack(c.raw.trim()))
  const { canonicalBlock, strippedSources } = resolveImports(rawSources)

  // Ensure every top-level const/function/class declaration is exported
  const ensureExports = (src: string): string =>
    src.replace(
      /^(const|function|class|type|interface|enum)\s+([A-Z])/gm,
      'export $1 $2'
    )

  const exportedSources = strippedSources.map(ensureExports)

  const componentsFile = path.join(componentsDir, '_components.tsx')
  const componentsContent = `// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — ${tatemono.meta.name} [TanStack]
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${exportedSources.join('\n\n')}
`
  fs.writeFileSync(componentsFile, componentsContent, 'utf-8')
  console.log(`[Arkzen TanStack] ✓ Utilities: _components.tsx`)

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
// ARKZEN GENERATED COMPONENT — ${compName} [TanStack]
// Re-exported from _components.tsx
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${cssImport}export { ${compName} } from './_components'
`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen TanStack] ✓ Component: ${fileName}`)
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
// ARKZEN GENERATED COMPONENTS INDEX — ${tatemono.meta.name} [TanStack]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

export * from './_components'
`
  fs.writeFileSync(indexPath, content, 'utf-8')
  console.log(`[Arkzen TanStack] ✓ Components index: index.ts`)
}

// ─── Animation file generator ────────────────────────────────────────────────

function generateAnimationFile(tatName: string, tatemono: ParsedTatemono): void {
  const fnName = `${toCamelCase(tatName)}Animations`
  const raw    = tatemono.animations ?? ''

  const stripped = raw
    .replace(/export\s+const\s+\w+\s*=/, '')
    .replace(/export\s+function\s+\w+/, 'function _inner')
    .trim()

  const content = `// ARKZEN GENERATED — ${tatName} animations\nimport { gsap } from 'gsap'\nimport { ScrollTrigger } from 'gsap/ScrollTrigger'\n\nexport const ${fnName} = ${stripped || '() => {}'}\n`
  const outPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  fs.writeFileSync(outPath, content, 'utf-8')
}

// ─── Main exports ─────────────────────────────────────────────────────────────

// ─── Main: register tatemono pages (production-grade) ─────────────────────────

export function registerTanStackPages(tatemono: ParsedTatemono): RouteEntry[] {
  const tatName = tatemono.meta.name
  const tatDir  = path.join(PAGES_DIR, tatName)
  ensureDir(tatDir)

  console.log(`[Arkzen TanStack] Registering ${tatemono.pages.length} page(s) for: ${tatName}`)

  // Individual component files (mirrors Next.js/Vite)
  generateIndividualComponentFiles(tatemono, tatDir)
  generateComponentsIndex(tatemono, tatDir)
  generateCustomLayouts(tatemono)

  const { has404, has500 } = generateErrorPages(tatemono, tatDir)
  const styleInfo = emitTatemonoStyles(tatemono, tatDir, { loggerLabel: 'Arkzen TanStack Router' })

  // Generate animation file
  const animFnName = tatemono.animation ? toCamelCase(tatName) + 'Animations' : null
  if (tatemono.animation && animFnName) {
    ensureDir(GENERATED_DIR)
    const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
    
    const { strippedSources } = resolveImports([tatemono.animation.raw], {
      reactHooks:  [],
      framerNamed: [],
    })
    let clean = strippedSources[0]
      .replace(/gsap\.registerPlugin\(.*\)\s*;?\n?/g, '')
      .replace(new RegExp(`\\bexport\\s+const\\s+${animFnName}\\b`), `const ${animFnName}`)
      .replace(`const ${animFnName}`, `export const ${animFnName}`)
      .replace(/\*\/\s*$/, '')
      .trim()

    const hasPageVariants = /export\s+const\s+pageVariants\b/.test(clean)
    const pageVariantsBlock = hasPageVariants ? '' : `
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}`

    const animContent = `// ============================================================
// ARKZEN GENERATED ANIMATIONS — ${tatName} [TanStack]
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

${clean}${pageVariantsBlock}
`
    fs.writeFileSync(animPath, animContent, 'utf-8')
    console.log(`[Arkzen TanStack] ✓ Animation file generated`)
  }

  const routeEntries: RouteEntry[] = []

  // Derive error boundary class name once (null if no @arkzen:error:500)
  const errorBoundaryClass = has500
    ? `ArkzenErrorBoundary_${toPascalCase(tatName)}`
    : undefined

  for (const page of tatemono.pages) {
    // Generate page component file
    const pageContent = generatePageFile(tatemono, page, animFnName)
    const pagePath    = path.join(tatDir, `${page.name}.tsx`)
    fs.writeFileSync(pagePath, pageContent, 'utf-8')

    // Generate TanStack route file — wire errorComponent when a 500 boundary exists
    const routeFile = path.join(ROUTES_DIR, tatName, `${page.name}.tsx`)
    ensureDir(path.dirname(routeFile))
    fs.writeFileSync(routeFile, generateTanStackRouteFile(tatName, page, errorBoundaryClass), 'utf-8')

    // Track route entry
    const routeVar = `Route_${toPascalCase(tatName)}_${toPascalCase(page.name)}`
    routeEntries.push({
      tatName,
      page,
      routeVar,
      filePath: `${tatName}/${page.name}`,
    })

    const routePath = page.name === 'index' ? `/${tatName}` : `/${tatName}/${page.name}`
    console.log(`[Arkzen TanStack] ✓ ${routePath} [tanstack]`)
  }

  // Wildcard 404 — route file MUST be named $.tsx (TanStack catch-all file convention)
  if (has404) {
    const wildcardRouteFile = path.join(ROUTES_DIR, tatName, '$.tsx')
    ensureDir(path.dirname(wildcardRouteFile))
    const wildcardPage = { name: 'not-found', layout: 'none', raw: '' } as ArkzenPage
    fs.writeFileSync(wildcardRouteFile, generateTanStackRouteFile(tatName, wildcardPage, errorBoundaryClass), 'utf-8')
    routeEntries.push({
      tatName,
      page: wildcardPage,
      routeVar: `Route_${toPascalCase(tatName)}_NotFound`,
      filePath: `${tatName}/not-found`,
    })
    console.log(`[Arkzen TanStack] ✓ Wildcard 404 route: /${tatName}/* → $.tsx`)
  }

  // Root redirect
  const rootRedirect = generateRootRedirectPage(tatemono)
  if (rootRedirect) {
    routeEntries.push({
      tatName,
      page: { name: rootRedirect.fileName, layout: 'none', raw: '' } as ArkzenPage,
      routeVar: `Route_${toPascalCase(tatName)}_RootRedirect`,
      filePath: `${tatName}/${rootRedirect.fileName}`,
    })
  }

  // Asset distribution
  try {
    const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
    const assetsPath   = path.join(tatemonosDir, tatName, 'assets')
    cleanOldAssets(tatName, PUBLIC_DIR)
    const hasAssets = copyAssetsToPublic(tatName, assetsPath, PUBLIC_DIR)
    if (!hasAssets) {
      console.log(`[Arkzen Assets] No assets folder for ${tatName}`)
    }
  } catch (e) {
    console.log(`[Arkzen Assets] ⚠ Asset distribution skipped: ${e}`)
  }

  console.log(`[Arkzen TanStack] ✓ Generated ${routeEntries.length} route(s)`)
  return routeEntries
}

// ─── Soft unregister — used during REBUILD ────────────────────────────────────
// Remove animation file + purge routes only — leave pages dir intact so
// TanStack dev server doesn't cache a 404 mid-write

export function softUnregisterTanStackPages(tatName: string): void {
  console.log(`[Arkzen TanStack] Soft-unregistering (rebuild): ${tatName}`)

  // Remove animation file
  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.rmSync(animPath)
    console.log(`[Arkzen TanStack] ✓ Animation file removed`)
  }

  // Remove route files but keep page files for HMR
  const routeDir = path.join(ROUTES_DIR, tatName)
  if (fs.existsSync(routeDir)) {
    fs.rmSync(routeDir, { recursive: true, force: true })
  }

  // Overwrite TanStack's auto-generated routeTree.gen.ts with a minimal valid stub.
  // Deleting it causes router.tsx to crash at SSR import time ("Does the file exist?").
  // Writing a stub with only the always-present root + index routes lets the server start,
  // then TanStack's router plugin regenerates the full file at configResolved.
  const routeTreeGen = path.join(SRC_DIR, 'routeTree.gen.ts')
  const routeTreeStub = `/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols
// ARKZEN STUB — regenerated by TanStack router plugin on next Vite start

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

interface FileRoutesByPath {}
interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByPath
  fullPaths: '/'
  fileRoutesByTo: FileRoutesByPath
  to: '/'
  id: '__root__' | '/'
  fileRoutesById: { '__root__': typeof rootRouteImport; '/': typeof IndexRoute }
}

interface RootRouteChildren { IndexRoute: typeof IndexRoute }
const rootRouteChildren: RootRouteChildren = { IndexRoute }
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register { ssr: true; router: Awaited<ReturnType<typeof getRouter>> }
}
`
  fs.writeFileSync(routeTreeGen, routeTreeStub, 'utf-8')
  console.log(`[Arkzen TanStack] ✓ routeTree.gen.ts stubbed — will regenerate on next start`)

  cleanOldAssets(tatName, PUBLIC_DIR)
  console.log(`[Arkzen TanStack] ✓ Routes purged from tree`)
}

// Legacy export name for backward compatibility
export const buildTanStackPages = registerTanStackPages
export { writeRouteTree, type RouteEntry, type RouteTree }