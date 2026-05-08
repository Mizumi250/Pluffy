// ============================================================
// ARKZEN ENGINE — INERTIA ROUTER v2.0
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
// v2.0 — full parity with vite-router.ts + router.ts:
//   • generateAnimationFile() — writes arkzen/generated/{tat}.animations.ts
//     (was missing entirely — caused Vite import resolution crash)
//   • generateRootRedirect() — PHP Route::redirect for tatemonos with no
//     index page (was missing — Hub clicking /{tat} returned 404)
//   • generateSharedComponents() — writes Pages/{Tat}/_shared.tsx
//   • generateCustomLayouts() — writes arkzen/core/layouts/custom/{tat}-{layout}.tsx
//   • softUnregisterInertiaPages() — removes animation file only, leaves
//     Pages dir intact so Vite HMR doesn't cache a 404 mid-rebuild
//   • normalizeRouterCalls() — fixes navigate.push() → useArkzenRouter()
//   • Full React hook auto-detection (memo, useCallback, useReducer,
//     useContext, useMemo) matching vite-router behaviour
//   • styleImport path fixed — uses relative './styles/global.css' so
//     it resolves from the page file's own directory, not a parent
//   • animFn wrapper uses pageRef + useEffect (matches vite/next pattern)
//     instead of the broken animFn() with no args
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage } from '../types'
import { emitTatemonoStyles } from './lib/dsl-style-emitter'

// Pages + generated files land INSIDE the laravel-inertia backend
const ROOT_DIR      = path.resolve(process.cwd(), '..', '..', '..')
const BACKEND_DIR   = path.join(ROOT_DIR, 'engine', 'backend', 'laravel-inertia')
const PAGES_DIR     = path.join(BACKEND_DIR, 'resources', 'js', 'Pages')
const GENERATED_DIR = path.join(BACKEND_DIR, 'resources', 'js', 'arkzen', 'generated')
const LAYOUTS_DIR   = path.join(BACKEND_DIR, 'resources', 'js', 'arkzen', 'core', 'layouts', 'custom')
const ROUTES_DIR    = path.join(BACKEND_DIR, 'routes', 'modules')

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

// Normalize useNavigate().push/replace → plain call — mirrors vite-router.ts
function normalizeRouterCalls(raw: string): string {
  let out = raw
  const navigateVars = [...out.matchAll(/\bconst\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*useArkzenRouter\(\)/g)]
    .map(m => m[1])
  for (const varName of navigateVars) {
    out = out
      .replace(new RegExp(`\\b${varName}\\.push\\(`, 'g'), `${varName}(`)
      .replace(new RegExp(`\\b${varName}\\.replace\\(`, 'g'), `${varName}(`)
  }
  return out
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

// ─── Layout helpers ───────────────────────────────────────────────────────────

function getLayoutImport(layout: string, tatName: string): string {
  switch (layout) {
    case 'auth':  return `import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'`
    case 'guest': return `import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'`
    case 'blank': return `import { BlankLayout } from '@/arkzen/core/layouts/BlankLayout'`
    default: {
      const customName = toPascalCase(layout) + 'Layout'
      return `import { ${customName} } from '@/arkzen/core/layouts/custom/${tatName}-${layout}'`
    }
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

// ─── Animation file generator ─────────────────────────────────────────────────
// Writes resources/js/arkzen/generated/{tatName}.animations.ts
// Mirrors vite-router.ts generateAnimationFile() and next router.ts exactly.

function generateAnimationFile(tatemono: ParsedTatemono): string | null {
  if (!tatemono.animation) return null

  const animFnName = toCamelCase(tatemono.meta.name) + 'Animations'
  const clean = tatemono.animation.raw
    .replace(/import.*from ['"]gsap['"]\s*;?\n?/g, '')
    .replace(/import.*from ['"]gsap\/ScrollTrigger['"]\s*;?\n?/g, '')
    .replace(/import React.*from ['"]react['"]\s*;?\n?/g, '')
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

  return `// ============================================================
// ARKZEN GENERATED ANIMATIONS — ${tatemono.meta.name} [React+Inertia]
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

// ─── Shared components ────────────────────────────────────────────────────────
// Mirrors vite-router.ts generateSharedComponents()

function generateSharedComponents(tatemono: ParsedTatemono, tatDir: string): void {
  if (tatemono.components.length === 0) return
  ensureDir(tatDir)

  const sharedBody = tatemono.components
    .map(c => normalizeForInertia(c.raw)
      .replace(/^[ \t]*import\s+React[,\s]*\{[^}]*\}\s+from\s+['"]react['"][ \t]*;?[ \t]*\r?\n?/gm, '')
      .replace(/^[ \t]*import\s+\{[^}]*React[^}]*\}\s+from\s+['"]react['"][ \t]*;?[ \t]*\r?\n?/gm, '')
      .replace(/^[ \t]*import\s+React\s+from\s+['"]react['"][ \t]*;?[ \t]*\r?\n?/gm, '')
      .trim()
    )
    .join('\n\n')

  const content = `// ============================================================
// ARKZEN GENERATED SHARED — ${tatemono.meta.name} [React+Inertia]
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

${sharedBody}
`
  fs.writeFileSync(path.join(tatDir, '_shared.tsx'), content, 'utf-8')
  console.log(`[Arkzen Inertia Router] ✓ Shared components: _shared.tsx`)
}

// ─── Custom layouts ───────────────────────────────────────────────────────────
// Mirrors vite-router.ts generateCustomLayouts()

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  if (tatemono.layouts.length === 0) return
  ensureDir(LAYOUTS_DIR)

  for (const layout of tatemono.layouts) {
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(LAYOUTS_DIR, fileName)
    let normalized = normalizeForInertia(layout.raw).trim()

    // Auto-inject @/arkzen/core/adapters/router import if needed
    const usesRouter = /\b(useArkzenRouter|useArkzenPathname)\s*\(/.test(normalized)
    const hasRouterImport = /from\s+['"]@\/arkzen\/core\/adapters\/router['"]/.test(normalized)

    if (usesRouter && !hasRouterImport) {
      // Find the last import statement and inject after it
      const lastImportMatch = normalized.match(/^([\s\S]*?)(\nimport\s+[^;\n]+;)(?![\s\S]*\nimport\s)/m)
      const insertPos = lastImportMatch ? lastImportMatch[0].length : 0
      const routerImport = `\nimport { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'`

      if (insertPos > 0) {
        normalized = normalized.slice(0, insertPos) + routerImport + normalized.slice(insertPos)
      } else {
        // No imports found, add at top after 'use client' or at very beginning
        normalized = routerImport + '\n\n' + normalized
      }
    }

    const content = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name} [React+Inertia]\n\n${normalized}\n`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Inertia Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─── Root redirect ────────────────────────────────────────────────────────────
// Mirrors Next.js generateRootRedirect() and Vite generateRootRedirectPage().
// Returns the destination path string, or null if an index page already exists.
// The caller injects a PHP Route::redirect() into the route file.
//
// Landing page priority (same as vite/next):
//   auth tatemonos  → first guest page (login) → first auth page → first page
//   public tatemonos → first auth page → first guest page → first page

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
  const layout        = page.layout ?? (tatemono.meta.auth ? 'auth' : 'none')
  const isAuthLayout  = layout === 'auth'
  const isGuestLayout = layout === 'guest'
  const isGuestOnly   = isGuestLayout && (
    (page as { guestOnly?: boolean }).guestOnly === true ||
    (tatemono.meta.auth && ['login', 'register', 'forgot-password', 'reset-password'].includes(page.name))
  )

  const layoutImport = layout !== 'none' ? getLayoutImport(layout, tatName) : ''
  const layoutComp   = layout !== 'none' ? getLayoutComponent(layout) : 'React.Fragment'

  const animFnName = tatemono.animation ? toCamelCase(tatName) + 'Animations' : null
  const animImport = animFnName
    ? `import { ${animFnName}, pageVariants } from '@/arkzen/generated/${tatName}.animations'`
    : ''

  // Page lives at Pages/{TatPascal}/{Page}.tsx
  // styles live at Pages/{TatPascal}/styles/global.css → relative path is ./styles/global.css
  const styleImport = hasGlobalStyle ? `import './styles/global.css'` : ''

  const componentCode = tatemono.components
    .map(c => normalizeForInertia(c.raw)
      .replace(/^[ \t]*import\s+React[,\s]*\{[^}]*\}\s+from\s+['"]react['"][ \t]*;?[ \t]*\r?\n?/gm, '')
      .replace(/^[ \t]*import\s+\{[^}]*React[^}]*\}\s+from\s+['"]react['"][ \t]*;?[ \t]*\r?\n?/gm, '')
      .replace(/^[ \t]*import\s+React\s+from\s+['"]react['"][ \t]*;?[ \t]*\r?\n?/gm, '')
      .trim()
    )
    .join('\n\n')

  const cleanPageRaw = normalizeForInertia(page.raw)
    .replace(/^export\s+default\s+\w[\w]*\s*;?\s*$/gm, '')
    .trim()

  const allCode      = componentCode + '\n' + cleanPageRaw
  const needsMemo    = /\bmemo\s*\(/.test(allCode)
  const needsCb      = /\buseCallback\s*\(/.test(allCode)
  const needsReducer = /\buseReducer\s*\(/.test(allCode)
  const needsCtx     = /\buseContext\s*\(/.test(allCode)
  const needsUseMemo = /\buseMemo\s*\(/.test(allCode)

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

  const match         = page.raw.match(/const\s+([A-Za-z_$][A-Za-z0-9_$]*Page)\s*[=:(]/)
  const componentName = match ? match[1] : toSafeComponentName(page.name) + 'Page'
  const wrapperName   = `ArkzenPage_${toPascalCase(tatName)}_${toPascalCase(page.name)}`
  const propsTypeName = `${toPascalCase(tatName)}${toPascalCase(page.name)}Props`

  return `// ============================================================
// ARKZEN GENERATED PAGE — ${tatName}/${page.name} [React+Inertia]
// Layout: ${layout} | Auth: ${isAuthLayout} | Guest-only: ${isGuestOnly}
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import React, { ${reactHooks} } from 'react'
import { motion } from 'framer-motion'
import { usePage, router } from '@inertiajs/react'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
${layoutImport}
${animImport}
${styleImport}

// Props passed from Laravel via Inertia::render()
export type ${propsTypeName} = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Shared components from @arkzen:components:shared ──────────────────────────
${componentCode}

// ── Page component from @arkzen:page:${page.name} ─────────────────────────────
${cleanPageRaw}

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ${wrapperName}() {
  const props   = usePage<${propsTypeName}>().props
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    ${animFnName ? `const cleanup = ${animFnName}(pageRef)\n    return cleanup` : '// No animations'}
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

  ${layout !== 'none'
    ? `return <${layoutComp}${isAuthLayout ? ' requireAuth={true}' : ''}${isGuestOnly ? ' guestOnly={true}' : ''}>{content}</${layoutComp}>`
    : `return content`
  }
}

export default ${wrapperName}
`
}

// ─── PHP route file ───────────────────────────────────────────────────────────
// Writes routes/modules/{tatName}.pages.php
// Injects Route::redirect when no index page exists — mirrors the root redirect
// behaviour of Next.js (redirect() in page.tsx) and Vite (<Navigate replace />)

function generatePageRouteFile(tatemono: ParsedTatemono): string {
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

  lines.push(`});`)
  lines.push(``)

  return lines.join('\n')
}

// ─── Hub route ────────────────────────────────────────────────────────────────

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

// ─── Public API ───────────────────────────────────────────────────────────────

export function registerInertiaPages(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name
  const tatDir  = path.join(PAGES_DIR, toPascalCase(tatName))
  ensureDir(tatDir)
  ensureDir(ROUTES_DIR)

  // Custom layouts — written before pages so imports resolve immediately
  generateCustomLayouts(tatemono)

  // Shared components (_shared.tsx in the tatemono's Pages folder)
  generateSharedComponents(tatemono, tatDir)

  // CSS styles — global.css + CSS Modules in Pages/{Tat}/styles/
  const styleInfo = emitTatemonoStyles(tatemono, tatDir, { loggerLabel: 'Arkzen Inertia Router' })

  // Animation file — resources/js/arkzen/generated/{tat}.animations.ts
  const animContent = generateAnimationFile(tatemono)
  if (animContent) {
    ensureDir(GENERATED_DIR)
    const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
    fs.writeFileSync(animPath, animContent, 'utf-8')
    console.log(`[Arkzen Inertia Router] ✓ Animation file written: arkzen/generated/${tatName}.animations.ts`)
  }

  // React page files — one per @arkzen:page:*
  for (const page of tatemono.pages) {
    const pageContent = generateInertiaPageFile(tatemono, page, styleInfo.hasGlobalStyle)
    const pageName    = toPascalCase(page.name)
    const pagePath    = path.join(tatDir, `${pageName}.tsx`)
    fs.writeFileSync(pagePath, pageContent, 'utf-8')

    const routeHint = page.name === 'index'
      ? `/${tatName}`
      : `/${tatName}/${page.name}`
    console.log(`[Arkzen Inertia Router] ✓ ${routeHint} → Pages/${toPascalCase(tatName)}/${pageName}.tsx`)
  }

  // Log root redirect (mirrors vite/next console output)
  const redirectDest = generateRootRedirect(tatemono)
  if (redirectDest) {
    console.log(`[Arkzen Inertia Router] ✓ /${tatName} → redirect to ${redirectDest}`)
  }

  // PHP page route file (includes root redirect when needed)
  const pageRouteFile = path.join(ROUTES_DIR, `${tatName}.pages.php`)
  fs.writeFileSync(pageRouteFile, generatePageRouteFile(tatemono), 'utf-8')
  console.log(`[Arkzen Inertia Router] ✓ Page routes written: routes/modules/${tatName}.pages.php`)

  console.log(`[Arkzen Inertia Router] ✓ ${tatemono.pages.length} page(s) written to laravel-inertia`)

  // Hub route — idempotent, only writes if missing
  ensureHubRoute()
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
}