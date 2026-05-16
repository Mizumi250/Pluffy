// ============================================================
// ARKZEN ENGINE — ASTRO ROUTER v1.0
// Astro stack equivalent of vite-router.ts / router.ts.
// Reads same ParsedTatemono, generates Astro-compatible output:
//
//   src/pages/{tat}/{page}.astro                   ← Astro page shell
//   src/pages/{tat}/components/_components.tsx      ← React island barrel
//   src/pages/{tat}/components/{Name}.tsx           ← per-component re-exports
//   src/pages/{tat}/components/index.ts             ← components index
//   src/pages/{tat}/not-found.astro                 ← 404 handler
//   src/arkzen/generated/routes.ts                  ← route registry
//   src/arkzen/generated/{name}.animations.ts       ← GSAP animations
//
// KEY DIFFERENCES from vite-router / router:
//   • Page shells are .astro files (frontmatter + HTML template)
//   • React components are hydrated as Astro islands (client:load)
//   • No 'use client' directive — Astro owns the hydration boundary
//   • Layout in frontmatter import, not JSX wrapper
//   • Auth token stored in localStorage (no SSR session)
//   • normalizeForAstro() strips Next.js-isms same as Vite does
//
// The React component files (.tsx) are identical to Vite output.
// Only the page shell (.astro) differs in format.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage, ArkzenErrorHandler } from '../types'
import { emitTatemonoStyles }            from './lib/dsl-style-emitter'
import { copyAssetsToPublic, cleanOldAssets } from './assets'

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

// Strip Next.js-specific imports (same as Vite normalizer)
function stripNextImports(raw: string): string {
  return raw
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/navigation['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/router['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+Link\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/image['"][ \t]*;?[ \t]*\r?\n?/gm, '')
}

// Normalize raw tatemono code for Astro context (React islands)
// Same transformations as Vite, since React island code is identical
function normalizeForAstro(raw: string): string {
  return stripNextImports(raw)
    .replace(/^[ \t]*['"]use client['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/\busePathname\(\)/g, 'useLocation().pathname')
    .replace(/\buseRouter\b/g, 'useNavigate')
    .replace(/(<Link\b[^>]*?)\bhref=/g, '$1to=')
    .replace(/process\.env\.NEXT_PUBLIC_(\w+)/g, 'import.meta.env.PUBLIC_$1')
    // Astro uses PUBLIC_ prefix instead of Vite's VITE_
}

// ─── Import Resolver (mirrors router.ts / vite-router.ts) ────────────────────

interface ResolvedImports {
  canonicalBlock: string
  strippedSources: string[]
}

const ENGINE_OWNED_MODULES = new Set(['react', 'framer-motion'])

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
  if (inImport && buffer.trim()) out.push(buffer.replace(/\s+/g, ' '))
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
  const importMap = new Map<string, { defaultImport?: string; named: Set<string> }>()
  const getEntry = (mod: string) => {
    if (!importMap.has(mod)) importMap.set(mod, { named: new Set() })
    return importMap.get(mod)!
  }

  const reactEntry = getEntry('react')
  ;(engineRequired.reactHooks ?? ['useRef', 'useEffect']).forEach(h => reactEntry.named.add(h))

  const framerEntry = getEntry('framer-motion')
  ;(engineRequired.framerNamed ?? ['motion']).forEach(n => framerEntry.named.add(n))

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
        namedStr.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
          if (n !== 'React') getEntry(mod).named.add(n)
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
      if (m) { sideEffects.push(`import '${m[1]}'`); continue }
    }
  }

  // Normalise gsap: import gsap from 'gsap' → import { gsap } from 'gsap'
  if (importMap.has('gsap')) {
    const gsapEntry = importMap.get('gsap')!
    if (gsapEntry.defaultImport === 'gsap') {
      gsapEntry.defaultImport = undefined
      gsapEntry.named.add('gsap')
    }
  }

  const lines: string[] = []

  const reactNamed = [...(importMap.get('react')?.named ?? [])].filter(h => h !== 'React').sort()
  lines.push(
    reactNamed.length > 0
      ? `import React, { ${reactNamed.join(', ')} } from 'react'`
      : `import React from 'react'`
  )

  const framerNamed = [...(importMap.get('framer-motion')?.named ?? [])].sort()
  if (framerNamed.length > 0) {
    lines.push(`import { ${framerNamed.join(', ')} } from 'framer-motion'`)
  }

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

  sideEffects.forEach(s => lines.push(s))
  if (engineRequired.extra) lines.push(engineRequired.extra)

  const canonicalBlock = lines.filter(Boolean).join('\n')

  const stripRaw = (src: string) =>
    src
      .replace(/^\s*['"]use client['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*\n?/gm, '')
      .trim()

  const strippedSources = sources.map(stripRaw)
  return { canonicalBlock, strippedSources }
}

// ─── Component files (identical to vite-router) ──────────────────────────────

function generateIndividualComponentFiles(tatemono: ParsedTatemono, baseDir: string): void {
  if (tatemono.components.length === 0) return

  const componentsDir = path.join(baseDir, 'components')
  ensureDir(componentsDir)

  const rawSources = tatemono.components.map(c => normalizeForAstro(c.raw.trim()))
  const { canonicalBlock, strippedSources } = resolveImports(rawSources)

  const content = `// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — ${tatemono.meta.name}
// React island components — rendered with client:load in .astro pages
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

${strippedSources.join('\n\n')}
`
  fs.writeFileSync(path.join(componentsDir, '_components.tsx'), content, 'utf-8')
  console.log(`[Arkzen Astro Router] ✓ Utilities: _components.tsx`)

  const stylesByComponent = new Map<string, string>()
  for (const style of tatemono.styles.filter(s => s.name)) {
    stylesByComponent.set(style.name, style.name)
  }

  const extractedComponents = new Set<string>()
  for (const component of tatemono.components) {
    const componentMatches = component.raw.match(/(?:export\s+)?const\s+([A-Z][A-Za-z0-9_$]*)\s*[=:(]/g) || []
    for (const match of componentMatches) {
      const name = match.match(/const\s+([A-Z][A-Za-z0-9_$]*)/)?.[1]
      if (name && !/^[A-Z_]+$/.test(name)) extractedComponents.add(name)
    }
  }

  for (const compName of extractedComponents) {
    const fileName = `${compName}.tsx`
    const filePath = path.join(componentsDir, fileName)
    const cssImport = stylesByComponent.has(compName)
      ? `import styles from '../styles/${compName}.module.css'\n`
      : ''
    const fileContent = `// ============================================================
// ARKZEN GENERATED COMPONENT — ${compName}
// Re-exported from _components.tsx
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${cssImport}export { ${compName} } from './_components'
`
    fs.writeFileSync(filePath, fileContent, 'utf-8')
    console.log(`[Arkzen Astro Router] ✓ Component: ${fileName}`)
  }

  // Clean stale component files
  try {
    const files = fs.readdirSync(componentsDir)
    for (const file of files) {
      if (file.endsWith('.tsx') && !file.startsWith('_') && !extractedComponents.has(file.replace('.tsx', ''))) {
        fs.unlinkSync(path.join(componentsDir, file))
      }
    }
  } catch (e) { /* ignore */ }
}

function generateComponentsIndex(tatemono: ParsedTatemono, baseDir: string): void {
  if (tatemono.components.length === 0) return

  const content = `// ============================================================
// ARKZEN GENERATED COMPONENTS INDEX — ${tatemono.meta.name}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

export * from './_components'
`
  fs.writeFileSync(path.join(baseDir, 'components', 'index.ts'), content, 'utf-8')
  console.log(`[Arkzen Astro Router] ✓ Components index: index.ts`)
}

// ─── React island TSX file (the actual component, no page shell) ──────────────

function generateIslandFile(
  tatemono: ParsedTatemono,
  page: ArkzenPage,
  animationFnName: string | null
): string {
  const componentName = extractComponentName(page.name, page.raw)
  const isAuthLayout  = page.layout === 'auth'
  const isGuestOnly   = page.layout === 'guest' &&
    (tatemono.meta.auth && ['login', 'register', 'forgot-password', 'reset-password'].includes(page.name))

  const allSources = [
    ...tatemono.components.map(c => normalizeForAstro(c.raw.trim())),
    normalizeForAstro(page.raw.trim()),
  ]

  const framerNeeded = new Set(['motion'])
  const framerRe = /import\s+\{([^}]*)\}\s+from\s+['"]framer-motion['"]/g
  for (const src of allSources) {
    let m: RegExpMatchArray | null
    while ((m = framerRe.exec(src)) !== null) {
      m[1].split(',').map(s => s.trim()).filter(Boolean).forEach(n => framerNeeded.add(n))
    }
  }

  const animImportLine = animationFnName
    ? `import { ${animationFnName}, pageVariants } from '@/arkzen/generated/${tatemono.meta.name}.animations'`
    : ''

  const layoutImport = getLayoutImport(page.layout, tatemono.meta)
  const layoutComp   = getLayoutComponent(page.layout)
  const extraLines   = [layoutImport, animImportLine].filter(Boolean).join('\n')

  const { canonicalBlock, strippedSources } = resolveImports(allSources, {
    reactHooks:  ['useRef', 'useEffect'],
    framerNamed: [...framerNeeded],
    extra:       extraLines,
  })

  const strippedComponentCode = strippedSources.slice(0, tatemono.components.length).join('\n\n')
  const strippedPageCode      = (strippedSources[tatemono.components.length] ?? '')
    .replace(
      /useEffect\(\(\)\s*=>\s*\{\s*\n?\s*return\s*\(\)\s*=>\s*\{\s*isMounted\.current\s*=\s*false\s*\}\s*\n?\s*\},\s*\[\]\)/g,
      `useEffect(() => {\n    isMounted.current = true\n    return () => { isMounted.current = false }\n  }, [])`
    )

  return `// ============================================================
// ARKZEN GENERATED ISLAND — ${tatemono.meta.name}/${page.name}
// React island component. Hydrated with client:load in .astro page shell.
// Layout: ${page.layout} | Auth guard: ${isAuthLayout} | Guest-only: ${isGuestOnly}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

${canonicalBlock}

// Utilities, types, and helper functions from @arkzen:components
${strippedComponentCode}

// Page component code (from @arkzen:page:${page.name})
${strippedPageCode}

// Wrapper for animation + layout — exported as default for Astro client:load
const ArkzenIsland_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)} = () => {
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

export default ArkzenIsland_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)}
`
}

// ─── Astro page shell (.astro) ────────────────────────────────────────────────
//
// Each Astro page is a thin shell that:
//   1. Imports the React island component
//   2. Sets the HTML title from tatemono meta
//   3. Renders the island with client:load (full client-side hydration)
//
// This is exactly what makes Astro different from Next.js/Vite —
// the page itself is just an HTML shell, React only loads where needed.

function generateAstroPageShell(
  tatemono: ParsedTatemono,
  page: ArkzenPage,
  islandImportPath: string
): string {
  const islandName = `ArkzenIsland_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)}`
  const title      = `${toPascalCase(tatemono.meta.name)} — ${toPascalCase(page.name)}`
  const globalCss  = tatemono.styles.some(s => !s.name)
    ? `import '../styles/global.css'` : ''

  return `---
// ============================================================
// ARKZEN GENERATED PAGE — ${tatemono.meta.name}/${page.name}
// Astro page shell. All UI lives in the React island below.
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: ${new Date().toISOString()}
// ============================================================

import ${islandName} from '${islandImportPath}'
${globalCss}
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <!--
      client:load — React island hydrates immediately on page load.
      Change to client:idle for non-critical pages (better performance).
      Change to client:visible for below-the-fold sections.
    -->
    <${islandName} client:load />
  </body>
</html>
`
}

// ─── Animation file (identical to vite-router) ───────────────────────────────

function generateAnimationFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.animation) return null

  const animFnName = toCamelCase(tatemono.meta.name) + 'Animations'

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

// ─── Custom layouts ───────────────────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  if (tatemono.layouts.length === 0) return

  ensureDir(LAYOUTS_DIR)

  for (const layout of tatemono.layouts) {
    const { canonicalBlock, strippedSources } = resolveImports(
      [normalizeForAstro(layout.raw)],
      { reactHooks: [], framerNamed: [] }
    )
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const content  = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name}
// Generated from tatemono: ${tatemono.meta.name}

${canonicalBlock}

${strippedSources[0]}
`
    fs.writeFileSync(path.join(LAYOUTS_DIR, fileName), content, 'utf-8')
    console.log(`[Arkzen Astro Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─── 404 handler ─────────────────────────────────────────────────────────────

function generateNotFoundPage(tatemono: ParsedTatemono, handler: ArkzenErrorHandler): string {
  const islandName = `ArkzenNotFound_${toPascalCase(tatemono.meta.name)}`
  const raw        = normalizeForAstro(handler.raw).replace(/'use client'[;]?\n?/, '').trim()

  // Generate the React island tsx file
  const islandContent = `// ARKZEN GENERATED 404 ISLAND — ${tatemono.meta.name}
// DO NOT EDIT DIRECTLY.

import React from 'react'
import { ErrorScreen } from './components'

${raw}

export default NotFoundPage
`

  const islandPath = path.join(PAGES_DIR, tatemono.meta.name, '_NotFound.tsx')
  fs.writeFileSync(islandPath, islandContent, 'utf-8')

  // Return the Astro shell
  return `---
// ARKZEN GENERATED 404 PAGE — ${tatemono.meta.name}
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:404 block in the tatemono instead.
import NotFoundIsland from './_NotFound'
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Not Found — ${toPascalCase(tatemono.meta.name)}</title>
  </head>
  <body>
    <NotFoundIsland client:load />
  </body>
</html>
`
}

// ─── Route registry ───────────────────────────────────────────────────────────
// Astro doesn't need a client-side route registry the same way Vite does —
// Astro's file-system routing handles it. But we write one for the Hub UI
// and for any client-side navigation logic.

interface AstroRoute {
  name:   string
  path:   string
  layout: string
}

function writeRouteRegistry(allRoutes: AstroRoute[]): void {
  ensureDir(GENERATED_DIR)

  const routeLines = allRoutes
    .map(r => `  { name: '${r.name}', path: '${r.path}', layout: '${r.layout}' }`)
    .join(',\n')

  const content = `// ============================================================
// ARKZEN GENERATED ROUTE REGISTRY — Astro stack
// Auto-generated by arkzen/core/astro-router.ts
// DO NOT EDIT DIRECTLY.
// Generated: ${new Date().toISOString()}
// ============================================================

export interface AstroRouteEntry {
  name:   string
  path:   string
  layout: string
}

export const ARKZEN_ROUTES: AstroRouteEntry[] = [
${routeLines}
]

export const ARKZEN_ROUTE_MAP = new Map(
  ARKZEN_ROUTES.map(r => [r.name, r])
)
`
  fs.writeFileSync(ROUTES_FILE, content, 'utf-8')
  console.log(`[Arkzen Astro Router] ✓ Route registry written: routes.ts (${allRoutes.length} routes)`)
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

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

function extractComponentName(pageName: string, raw: string): string {
  const match = raw.match(/const\s+([A-Za-z_$][A-Za-z0-9_$]*Page)\s*[=:(]/)
  if (match) return match[1]
  const pascal = toPascalCase(pageName)
  return (/^\d/.test(pascal) ? `Page${pascal}` : pascal) + 'Page'
}

// ─── REGISTER (main export) ───────────────────────────────────────────────────

// In-memory registry of all routes across tatemonos (for writeRouteRegistry)
const _allRoutes: AstroRoute[] = []

export function registerAstroPages(tatemono: ParsedTatemono): void {
  const animFnName = tatemono.animation
    ? toCamelCase(tatemono.meta.name) + 'Animations'
    : null

  console.log(`[Arkzen Astro Router] Registering ${tatemono.pages.length} page(s) for: ${tatemono.meta.name}`)

  // Animation file
  if (tatemono.animation) {
    ensureDir(GENERATED_DIR)
    const animContent = generateAnimationFile(tatemono)
    if (animContent) {
      fs.writeFileSync(
        path.join(GENERATED_DIR, `${tatemono.meta.name}.animations.ts`),
        animContent, 'utf-8'
      )
      console.log(`[Arkzen Astro Router] ✓ Animation file generated`)
    }
  }

  // Custom layouts
  generateCustomLayouts(tatemono)

  const tatemonoDir = path.join(PAGES_DIR, tatemono.meta.name)
  ensureDir(tatemonoDir)

  // Component files (same as Vite — .tsx React islands)
  generateIndividualComponentFiles(tatemono, tatemonoDir)
  generateComponentsIndex(tatemono, tatemonoDir)

  // Style files
  emitTatemonoStyles(tatemono, tatemonoDir, { loggerLabel: 'Arkzen Astro Router' })

  // 404 handler
  if (tatemono.errorHandlers) {
    for (const handler of tatemono.errorHandlers) {
      if (handler.type === '404') {
        const content = generateNotFoundPage(tatemono, handler)
        fs.writeFileSync(path.join(tatemonoDir, '404.astro'), content, 'utf-8')
        console.log(`[Arkzen Astro Router] ✓ 404 handler: 404.astro → /${tatemono.meta.name}/**`)
      }
    }
  }

  // Remove routes for this tatemono from the in-memory list (rebuild)
  const existingIdx = _allRoutes.findIndex(r => r.name.startsWith(tatemono.meta.name + '/'))
  if (existingIdx >= 0) {
    _allRoutes.splice(existingIdx, 1)
  }

  // Generate each page
  for (const page of tatemono.pages) {
    const isIndex   = page.name === 'index'
    const routePath = isIndex
      ? `/${tatemono.meta.name}`
      : `/${tatemono.meta.name}/${page.name}`

    // 1. React island .tsx file
    const islandFileName = isIndex ? 'index.tsx' : `${page.name}.tsx`
    const islandPath     = path.join(tatemonoDir, islandFileName)
    const islandContent  = generateIslandFile(tatemono, page, animFnName)
    fs.writeFileSync(islandPath, islandContent, 'utf-8')

    // 2. Astro page shell .astro file
    const astroFileName  = isIndex ? 'index.astro' : `${page.name}.astro`
    const astroPath      = path.join(tatemonoDir, astroFileName)
    const islandImport   = `./${isIndex ? 'index' : page.name}`
    const islandName     = `ArkzenIsland_${toPascalCase(tatemono.meta.name)}_${toPascalCase(page.name)}`
    const astroContent   = generateAstroPageShell(tatemono, page, islandImport)
    fs.writeFileSync(astroPath, astroContent, 'utf-8')

    console.log(`[Arkzen Astro Router] ✓ ${routePath} [${page.layout}] → ${astroFileName} + ${islandFileName}`)

    _allRoutes.push({ name: `${tatemono.meta.name}/${page.name}`, path: routePath, layout: page.layout })
  }

  // Assets
  try {
    const tatemonosDir = path.resolve(process.cwd(), '..', '..', '..', 'tatemonos')
    const assetsPath   = path.join(tatemonosDir, tatemono.meta.name, 'assets')
    const publicDir    = path.resolve(process.cwd(), 'public')
    cleanOldAssets(tatemono.meta.name, publicDir)
    copyAssetsToPublic(tatemono.meta.name, assetsPath, publicDir)
  } catch (e) {
    console.log(`[Arkzen Assets] ⚠ Asset distribution skipped: ${e}`)
  }

  writeRouteRegistry(_allRoutes)
  console.log(`[Arkzen Astro Router] ✓ All pages registered for: ${tatemono.meta.name}`)
}

export function unregisterAstroPages(tatName: string): void {
  console.log(`[Arkzen Astro Router] Unregistering: ${tatName}`)

  const tatemonoDir = path.join(PAGES_DIR, tatName)
  if (fs.existsSync(tatemonoDir)) {
    fs.rmSync(tatemonoDir, { recursive: true })
    console.log(`[Arkzen Astro Router] ✓ Removed: ${tatemonoDir}`)
  }

  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.unlinkSync(animPath)
    console.log(`[Arkzen Astro Router] ✓ Animation file removed`)
  }

  // Remove from in-memory routes
  const idx = _allRoutes.findIndex(r => r.name.startsWith(tatName + '/'))
  while (idx >= 0) {
    _allRoutes.splice(idx, 1)
  }
  writeRouteRegistry(_allRoutes)
}

export function softUnregisterAstroPages(tatName: string): void {
  console.log(`[Arkzen Astro Router] Soft-unregistering (rebuild): ${tatName}`)

  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.unlinkSync(animPath)
  }
}
