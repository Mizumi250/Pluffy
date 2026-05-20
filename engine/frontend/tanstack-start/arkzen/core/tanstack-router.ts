// ============================================================
// ARKZEN ENGINE — TANSTACK START ROUTER v1.0
// arkzen/core/tanstack-router.ts
//
// TanStack Start equivalent of vite-router.ts.
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
// KEY DIFFERENCE from vite-router.ts:
//   TanStack Start uses FILE-BASED ROUTING — each page gets its own
//   route file in src/routes/{tatName}/{pageName}.tsx that wraps the
//   page component in createFileRoute(). The routeTree.ts then imports
//   and assembles all routes into the router.
//
// The page component files in src/pages/ are identical to the
// React+Vite stack — only the route wiring layer is different.
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

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// ─── Import resolver (same as vite-router.ts) ────────────────────────────────

const ENGINE_OWNED_MODULES = new Set(['react', 'framer-motion'])

function flattenMultilineImports(src: string): string {
  return src.replace(/^import\s+\{([^}]*)\}\s+from\s+(['"][^'"]+['"])/gm, (_, names, mod) => {
    const flat = names.replace(/\s+/g, ' ').trim()
    return `import { ${flat} } from ${mod}`
  })
}

interface ImportMap { [mod: string]: Set<string> }

function resolveImports(rawParts: string[]): {
  imports: ImportMap
  bodies:  string[]
} {
  const imports: ImportMap = {}
  const bodies: string[]  = []

  for (const raw of rawParts) {
    const flat = flattenMultilineImports(raw)
    for (const line of flat.split('\n')) {
      const m = line.match(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/)
      if (m) {
        const mod   = m[2]
        const names = m[1].split(',').map(s => s.trim()).filter(Boolean)
        if (!imports[mod]) imports[mod] = new Set()
        for (const n of names) imports[mod].add(n)
      } else {
        bodies.push(line)
      }
    }
    bodies.push('')
  }

  for (const mod of ENGINE_OWNED_MODULES) delete imports[mod]
  return { imports, bodies }
}

function emitImportBlock(imports: ImportMap, extras: Record<string, string[]>): string {
  const lines: string[] = []
  for (const [mod, names] of Object.entries(imports)) {
    lines.push(`import { ${[...names].join(', ')} } from '${mod}'`)
  }
  for (const [mod, names] of Object.entries(extras)) {
    lines.push(`import { ${names.join(', ')} } from '${mod}'`)
  }
  return lines.join('\n')
}

// ─── Page file generator ──────────────────────────────────────────────────────

function generatePageFile(
  tatName:  string,
  page:     ArkzenPage,
  tatemono: ParsedTatemono,
): string {
  const pagePascal = toPascalCase(page.name)
  const tatPascal  = toPascalCase(tatName)

  // Detect hooks used in raw
  const raw = page.raw ?? ''
  const hooks: string[] = ['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useReducer', 'useContext']
  const usedHooks = hooks.filter(h => raw.includes(h))

  const reactExports = ['lazy', 'Suspense', ...usedHooks]

  // Detect framer-motion exports
  const fmAll = ['motion', 'AnimatePresence', 'useMotionValue', 'useTransform', 'useScroll', 'useSpring', 'useAnimate', 'useInView']
  const usedFm = fmAll.filter(n => raw.includes(n))
  if (!usedFm.includes('motion') && raw.includes('motion')) usedFm.push('motion')

  const { imports, bodies } = resolveImports([raw])

  // Replace process.env.NEXT_PUBLIC_ → import.meta.env.VITE_
  const cleanBody = bodies.join('\n')
    .replace(/process\.env\.NEXT_PUBLIC_/g, 'import.meta.env.VITE_')

  // Strip existing default export — we re-add with Arkzen wrapper
  const strippedBody = cleanBody.replace(/export\s+default\s+function\s+\w+[^}]*\}/s, '').trim()

  const extras: Record<string, string[]> = {
    'react': reactExports,
    '@/arkzen/core/stores/authStore': ['useAuthStore', 'setActiveTatemono', 'arkzenFetch'],
  }
  if (usedFm.length) extras['framer-motion'] = usedFm

  return `// ============================================================
// ARKZEN GENERATED — ${tatPascal} / ${pagePascal}
// Auto-generated by Arkzen engine (tanstack-router.ts)
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

${emitImportBlock(imports, extras)}
${emitImportBlock({}, { '@/pages/${tatName}/components': ['...'] }).replace(
  `import { ... } from '@/pages/${tatName}/components'`,
  `import * as Components from '@/pages/${tatName}/components'`,
)}

${strippedBody}

// Arkzen-injected: set active tatemono slug for auth store
if (typeof window !== 'undefined') setActiveTatemono('${tatName}')

export default function ${pagePascal}Page() {
  return <${pagePascal} />
}
`
}

// ─── TanStack route file generator ───────────────────────────────────────────

function routePathForPage(tatName: string, page: ArkzenPage): string {
  if (page.name === 'index' || page.name === '__root_redirect') return `/${tatName}`
  if (page.name === 'not-found') return `/${tatName}/$`
  return `/${tatName}/${page.name}`
}

function generateTanStackRouteFile(
  tatName:  string,
  page:     ArkzenPage,
): string {
  if (!page.name) {
    console.error(`[Arkzen TanStack] ✗ ERROR: Page has no name in tatemono ${tatName}`, page)
    throw new Error(`Page missing name in ${tatName}`)
  }
  
  const pagePascal    = toPascalCase(page.name)
  const tatPascal     = toPascalCase(tatName)
  const routePath     = routePathForPage(tatName, page)
  const componentName = `${tatPascal}${pagePascal}Page`
  const importPath    = `@/pages/${tatName}/${page.name}`

  if (!routePath) {
    console.error(`[Arkzen TanStack] ✗ ERROR: routePath is null/undefined for ${tatName}/${page.name}`)
    throw new Error(`Cannot generate route path for ${tatName}/${page.name}`)
  }

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
})
`
}

// ─── Route tree writer ────────────────────────────────────────────────────────

interface RouteEntry {
  tatName:  string
  page:     ArkzenPage
  routeVar: string
  filePath: string  // relative to src/routes/
}

function writeRouteTree(entries: RouteEntry[], authTatemonos: string[]): void {
  let content = fs.readFileSync(ROUTE_TREE, 'utf-8')

  // Build import block
  const importLines = entries.map(e =>
    `import { Route as ${e.routeVar} } from '../../routes/${e.tatName}/${e.page.name}'`
  ).join('\n')

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

// ─── Component file generators (mirrors vite-router.ts exactly) ──────────────

function generateComponentsIndex(tatName: string, components: string[]): string {
  return components.map(c => `export * from './${c}'`).join('\n') + '\n'
}

function generateIndividualComponentFiles(
  tatName:    string,
  components: { name: string; raw: string }[],
): void {
  const dir = path.join(PAGES_DIR, tatName, 'components')
  ensureDir(dir)

  const barrelExports: string[] = []

  for (const comp of components) {
    const compName = toPascalCase(comp.name)
    barrelExports.push(compName)

    const filePath = path.join(dir, `${compName}.tsx`)
    if (!fs.existsSync(filePath)) {
      const { imports, bodies } = resolveImports([comp.raw])
      const extras: Record<string, string[]> = {
        'react': ['useState', 'useEffect', 'useRef'],
        'framer-motion': ['motion', 'AnimatePresence'],
      }
      const fileContent = `// ARKZEN GENERATED — ${compName} component\nimport React from 'react'\n${emitImportBlock(imports, extras)}\n\n${bodies.join('\n')}\n`
      fs.writeFileSync(filePath, fileContent, 'utf-8')
    }
  }

  // _components.tsx barrel
  const barrelPath = path.join(dir, '_components.tsx')
  const barrel = barrelExports.map(n => `export { ${n} } from './${n}'`).join('\n') + '\n'
  fs.writeFileSync(barrelPath, barrel, 'utf-8')

  // index.ts
  const indexPath = path.join(dir, 'index.ts')
  fs.writeFileSync(indexPath, generateComponentsIndex(tatName, barrelExports), 'utf-8')
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

export function buildTanStackPages(tatemono: ParsedTatemono): void {
  const tatName = tatemono.name
  const tatDir  = path.join(PAGES_DIR, tatName)
  const routeDir = path.join(ROUTES_DIR, tatName)
  ensureDir(tatDir)
  ensureDir(routeDir)
  ensureDir(GENERATED_DIR)

  // Generate page component files (src/pages/)
  for (const page of tatemono.pages) {
    const pageFile = path.join(tatDir, `${page.name}.tsx`)
    fs.writeFileSync(pageFile, generatePageFile(tatName, page, tatemono), 'utf-8')

    // Generate TanStack route file (src/routes/)
    const routeFile = path.join(routeDir, `${page.name}.tsx`)
    fs.writeFileSync(routeFile, generateTanStackRouteFile(tatName, page), 'utf-8')
  }

  // Components
  if (tatemono.components?.length) {
    generateIndividualComponentFiles(tatName, tatemono.components)
  } else {
    // Ensure empty components dir exists
    ensureDir(path.join(tatDir, 'components'))
    fs.writeFileSync(path.join(tatDir, 'components', 'index.ts'), '// no components\n', 'utf-8')
    fs.writeFileSync(path.join(tatDir, 'components', '_components.tsx'), '// no components\n', 'utf-8')
  }

  // Animations
  generateAnimationFile(tatName, tatemono)

  // Styles
  emitTatemonoStyles(tatName, tatemono)

  // Assets
  copyAssetsToPublic(tatName, tatemono)

  console.log(`[Arkzen TanStack] ✓ Built ${tatName} (${tatemono.pages.length} pages)`)
}

export function softUnregisterTanStackPages(tatName: string): void {
  // Remove route files and animation file only — leave pages dir so no HMR 404
  const routeDir = path.join(ROUTES_DIR, tatName)
  if (fs.existsSync(routeDir)) {
    fs.rmSync(routeDir, { recursive: true, force: true })
  }

  const animFile = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animFile)) fs.unlinkSync(animFile)

  cleanOldAssets(tatName, PUBLIC_DIR)

  console.log(`[Arkzen TanStack] ✗ Unregistered ${tatName}`)
}

export { writeRouteTree }
export type { RouteEntry }
