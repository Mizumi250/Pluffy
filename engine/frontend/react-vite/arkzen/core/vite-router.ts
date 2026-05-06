// ============================================================
// ARKZEN ENGINE — VITE ROUTER v1.2
// React+Vite stack equivalent of router.ts
// Reads same ParsedTatemono, generates Vite-compatible output:
//   src/pages/{tatName}/{pageName}.tsx   ← page components
//   src/arkzen/generated/routes.ts       ← React Router route registry
//   src/arkzen/generated/{name}.animations.ts ← GSAP animations
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
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage } from '../types'
import { emitTatemonoStyles } from './lib/dsl-style-emitter'

const SRC_DIR        = path.resolve(process.cwd(), 'src')
const PAGES_DIR      = path.join(SRC_DIR, 'pages')
const GENERATED_DIR  = path.join(SRC_DIR, 'arkzen', 'generated')
const LAYOUTS_DIR    = path.join(process.cwd(), 'arkzen', 'core', 'layouts', 'custom')
const ROUTES_FILE    = path.join(GENERATED_DIR, 'routes.ts')

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
  const layoutImport  = layout !== 'none' ? getLayoutImport(layout, tatName) : ''
  const layoutComp    = layout !== 'none' ? getLayoutComponent(layout) : 'React.Fragment'
  const animFnName    = tatemono.animation ? toCamelCase(tatName) + 'Animations' : null
  const animImport    = animFnName
    ? `import { ${animFnName}, pageVariants } from '@/arkzen/generated/${tatName}.animations'`
    : ''
  const styleImport = hasGlobalStyle ? `import './styles/global.css'` : ''

  // Components raw — strip React/Next imports, they come from the page header
  const componentCode = tatemono.components
    .map(c => normalizeForVite(c.raw)
      .replace(/^[ \t]*import\s+React[,\s]*\{[^}]*\}\s+from\s+['"]react['"][ \t]*;?[ \t]*\r?\n?/gm, '')
      .replace(/^[ \t]*import\s+\{[^}]*React[^}]*\}\s+from\s+['"]react['"][ \t]*;?[ \t]*\r?\n?/gm, '')
      .replace(/^[ \t]*import\s+React\s+from\s+['"]react['"][ \t]*;?[ \t]*\r?\n?/gm, '')
      .trim()
    )
    .join('\n\n')

  // Clean page.raw — strip Next.js-specific code not valid in Vite
  const cleanPageRaw = normalizeForVite(page.raw)
    // FIX v1.2: strip any `export default XxxPage` already in the raw page body
    // so the Arkzen wrapper below is the only default export in the file
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()

  // Detect which React hooks are actually used in the combined output
  const allCode       = componentCode + '\n' + cleanPageRaw
  const needsMemo     = /\bmemo\s*\(/.test(allCode)
  const needsCb       = /\buseCallback\s*\(/.test(allCode)
  const needsReducer  = /\buseReducer\s*\(/.test(allCode)
  const needsCtx      = /\buseContext\s*\(/.test(allCode)
  const needsUseMemo  = /\buseMemo\s*\(/.test(allCode)
  const needsLocation = /\buseLocation\s*\(/.test(allCode)
  const needsLink     = /<Link\b/.test(allCode)

  const reactHooks = [
    'useRef',
    'useEffect',
    'useState',
    needsMemo    && 'memo',
    needsCb      && 'useCallback',
    needsReducer && 'useReducer',
    needsCtx     && 'useContext',
    needsUseMemo && 'useMemo',
  ].filter(Boolean).join(', ')

  // Extract the page component name from raw
  const match         = page.raw.match(/const\s+([A-Za-z_$][A-Za-z0-9_$]*Page)\s*[=:(]/)
  const componentName = match ? match[1] : toPascalCase(page.name) + 'Page'
  const wrapperName   = `ArkzenPage_${toPascalCase(tatName)}_${toPascalCase(page.name)}`

  const routerDomSpecifiers = [
    'useNavigate',
    needsLocation && 'useLocation',
    needsLink && 'Link',
  ].filter(Boolean).join(', ')
  const routerDomImport = `import { ${routerDomSpecifiers} } from 'react-router-dom'`

  return `// ============================================================
// ARKZEN GENERATED PAGE — ${tatName}/${page.name} [React+Vite]
// Layout: ${layout} | Auth: ${isAuthLayout} | Guest-only: ${isGuestOnly}
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import React, { ${reactHooks} } from 'react'
import { motion } from 'framer-motion'
${routerDomImport}
${layoutImport}
${animImport}
${styleImport}

// ── Shared components from @arkzen:components:shared ──────────────────────────
${componentCode}

// ── Page component from @arkzen:page:${page.name} ─────────────────────────────
${cleanPageRaw}

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
  const clean = tatemono.animation.raw
    .replace(/import.*from ['"]gsap['"]\s*;?\n?/g, '')
    .replace(/import.*from ['"]gsap\/ScrollTrigger['"]\s*;?\n?/g, '')
    .replace(/import React.*from ['"]react['"]\s*;?\n?/g, '')
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
  // Both stacks always import { animFn, pageVariants } from the animation file.
  // If pageVariants is missing, esbuild hard-fails. Tatemono-defined takes priority.
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
  tatName:  string
  pageName: string
  path:     string
  auth:     boolean
}

function readExistingRoutes(): ViteRoute[] {
  if (!fs.existsSync(ROUTES_FILE)) return []
  const content = fs.readFileSync(ROUTES_FILE, 'utf-8')
  const matches = [...content.matchAll(/\/\/ ROUTE:([^:]+):([^:]+):([^:]+):(true|false)/g)]
  return matches.map(m => ({
    tatName:  m[1],
    pageName: m[2],
    path:     m[3],
    auth:     m[4] === 'true',
  }))
}

function writeRouteRegistry(routes: ViteRoute[]): void {
  ensureDir(GENERATED_DIR)

  const imports = routes.map(r => {
    const wrapperName = `ArkzenPage_${toPascalCase(r.tatName)}_${toPascalCase(r.pageName)}`
    const filePath    = `@/pages/${r.tatName}/${r.pageName}`
    return `// ROUTE:${r.tatName}:${r.pageName}:${r.path}:${r.auth}\nconst ${wrapperName} = lazy(() => import('${filePath}'))`
  }).join('\n')

  const routeArray = routes.map(r => {
    const wrapperName = `ArkzenPage_${toPascalCase(r.tatName)}_${toPascalCase(r.pageName)}`
    return `  { path: '${r.path}', name: '${r.pageName}', tatemono: '${r.tatName}', component: ${wrapperName}, auth: ${r.auth} },`
  }).join('\n')

  const content = `// ============================================================
// ARKZEN GENERATED — Route Registry (React+Vite)
// Auto-updated when tatemonos are built/removed
// DO NOT EDIT — managed by Arkzen engine
// ============================================================
import { lazy, ComponentType } from 'react'

export interface ArkzenRoute {
  path:      string
  name:      string
  tatemono:  string
  component: ComponentType
  auth:      boolean
}

${imports}

export const ARKZEN_ROUTES: ArkzenRoute[] = [
${routeArray}
]
`
  fs.writeFileSync(ROUTES_FILE, content, 'utf-8')
}

// ─── Custom layouts ────────────────────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  if (tatemono.layouts.length === 0) return
  ensureDir(LAYOUTS_DIR)

  for (const layout of tatemono.layouts) {
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(LAYOUTS_DIR, fileName)
    const normalizedLayout = ensureRouterDomImports(normalizeForVite(layout.raw).trim())
    const content  = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name} [React+Vite]\n\n${normalizedLayout}\n`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Vite Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─── Shared components ─────────────────────────────────────────────────────────

function generateSharedComponents(tatemono: ParsedTatemono, tatDir: string): void {
  if (tatemono.components.length === 0) return
  ensureDir(tatDir)

  const sharedBody = tatemono.components.map(c => normalizeForVite(c.raw).trim()).join('\n\n')
  const normalizedSharedBody = ensureRouterDomImports(sharedBody)

  const content = `// ============================================================
// ARKZEN GENERATED SHARED — ${tatemono.meta.name} [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

${normalizedSharedBody}
`
  fs.writeFileSync(path.join(tatDir, '_shared.tsx'), content, 'utf-8')
  console.log(`[Arkzen Vite Router] ✓ Shared components: _shared.tsx`)
}

function generateRootRedirectPage(tatemono: ParsedTatemono): { fileName: string; routePath: string } | null {
  const hasIndex = tatemono.pages.some(p => p.name === 'index')
  if (hasIndex) return null

  const firstGuest = tatemono.pages.find(p => p.layout === 'guest')
  const firstAuth = tatemono.pages.find(p => p.layout === 'auth')
  const firstPage = tatemono.pages[0]

  const target = tatemono.meta.auth
    ? (firstGuest ?? firstAuth ?? firstPage)
    : (firstAuth ?? firstGuest ?? firstPage)

  if (!target) return null

  const destination = `/${tatemono.meta.name}/${target.name}`
  const fileName = '__root_redirect'
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

  return {
    fileName,
    routePath: `/${tatemono.meta.name}`,
  }
}

// ─── Main: register tatemono pages ────────────────────────────────────────────

export function registerVitePages(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name
  const tatDir  = path.join(PAGES_DIR, tatName)
  ensureDir(tatDir)

  generateSharedComponents(tatemono, tatDir)
  generateCustomLayouts(tatemono)
  const styleInfo = emitTatemonoStyles(tatemono, tatDir, { loggerLabel: 'Arkzen Vite Router' })

  const animContent = generateAnimationFile(tatemono)
  if (animContent) {
    ensureDir(GENERATED_DIR)
    const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
    fs.writeFileSync(animPath, animContent, 'utf-8')
    console.log(`[Arkzen Vite Router] ✓ Animation file generated`)
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

    newRoutes.push({ tatName, pageName: page.name, path: routePath, auth: tatemono.meta.auth })
    console.log(`[Arkzen Vite Router] ✓ /${tatName}${page.name === 'index' ? '' : '/' + page.name} [vite]`)
  }

  const rootRedirect = generateRootRedirectPage(tatemono)
  if (rootRedirect) {
    newRoutes.push({
      tatName,
      pageName: rootRedirect.fileName,
      path: rootRedirect.routePath,
      auth: tatemono.meta.auth,
    })
  }

  writeRouteRegistry([...existingRoutes, ...newRoutes])
  console.log(`[Arkzen Vite Router] ✓ Route registry updated: ${newRoutes.length} page(s)`)
}

// ─── Remove tatemono pages ─────────────────────────────────────────────────────

export function unregisterVitePages(tatName: string): void {
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

  const routes = readExistingRoutes().filter(r => r.tatName !== tatName)
  writeRouteRegistry(routes)
  console.log(`[Arkzen Vite Router] ✓ Route registry updated`)
}
