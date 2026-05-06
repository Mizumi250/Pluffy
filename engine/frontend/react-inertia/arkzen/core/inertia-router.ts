// ============================================================
// ARKZEN ENGINE — INERTIA ROUTER v1.0
// Equivalent of vite-router.ts for the Inertia stack.
//
// KEY DIFFERENCES from vite-router:
//   1. Pages land in laravel-inertia/resources/js/Pages/{tat}/{Page}.tsx
//      (inside the Laravel backend folder) NOT in a local src/pages/
//   2. No route registry file — Laravel handles routing via web.php
//      (RouteRegistrar in laravel-inertia writes routes/modules/{tat}.php)
//   3. No React Router — navigation via Inertia router.visit()
//   4. Page props come from Inertia::render() via usePage<Props>()
//   5. No .arkzen-ready flag — Laravel Vite plugin manages HMR directly
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage } from '../types'
import { emitTatemonoStyles } from './lib/dsl-style-emitter'

// Pages land INSIDE the laravel-inertia backend
const ROOT_DIR   = path.resolve(process.cwd(), '..', '..', '..')
const BACKEND_DIR = path.join(ROOT_DIR, 'engine', 'backend', 'laravel-inertia')
const PAGES_DIR  = path.join(BACKEND_DIR, 'resources', 'js', 'Pages')

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

// Strip Next.js-specific imports not valid in Inertia/Vite
function stripNextImports(raw: string): string {
  return raw
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/navigation['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/router['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+Link\s+from\s+['"]next\/link['"][ \t]*;?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]next\/image['"][ \t]*;?[ \t]*\r?\n?/gm, '')
}

// Strip react-router-dom imports — Inertia uses its own router
function stripReactRouterImports(raw: string): string {
  return raw
    .replace(/^[ \t]*import\s+\{[^}]*\}\s+from\s+['"]react-router-dom['"][ \t]*;?[ \t]*\r?\n?/gm, '')
}

// Normalize code to be Inertia-compatible
function normalizeForInertia(raw: string): string {
  return stripReactRouterImports(
    stripNextImports(raw)
      .replace(/^[ \t]*['"]use client['"][ \t]*;?[ \t]*\r?\n?/gm, '')
      // usePathname → useArkzenPathname from adapters
      .replace(/\busePathname\(\)/g, 'useArkzenPathname()')
      // useRouter / useNavigate → useArkzenRouter
      .replace(/\buseRouter\b/g, 'useArkzenRouter')
      .replace(/\buseNavigate\b/g, 'useArkzenRouter')
      // env vars: NEXT_PUBLIC_ → VITE_ (laravel-inertia still uses Vite)
      .replace(/process\.env\.NEXT_PUBLIC_(\w+)/g, 'import.meta.env.VITE_$1')
  )
}

// Get layout import path — adapters live in resources/js/arkzen/core/
function getLayoutImport(layout: string, tatName: string): string {
  const layoutMap: Record<string, string> = {
    auth:  `import { AuthLayout }  from '@/arkzen/core/layouts/AuthLayout'`,
    guest: `import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'`,
    blank: `import { BlankLayout } from '@/arkzen/core/layouts/BlankLayout'`,
  }
  if (layoutMap[layout]) return layoutMap[layout]
  // Custom layout
  const customName = toPascalCase(layout) + 'Layout'
  return `import { ${customName} } from '@/arkzen/core/layouts/custom/${layout}'`
}

function getLayoutComponent(layout: string): string {
  const compMap: Record<string, string> = {
    auth:  'AuthLayout',
    guest: 'GuestLayout',
    blank: 'BlankLayout',
  }
  return compMap[layout] ?? (toPascalCase(layout) + 'Layout')
}

// ─── Generate a single Inertia page file ──────────────────────────────────────

function generateInertiaPageFile(tatemono: ParsedTatemono, page: ArkzenPage, hasGlobalStyle: boolean): string {
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

  const styleImport = hasGlobalStyle ? `import '../styles/global.css'` : ''

  // Normalize component code
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

  const allCode = componentCode + '\n' + cleanPageRaw
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
  const componentName = match ? match[1] : toPascalCase(page.name) + 'Page'
  const wrapperName   = `ArkzenPage_${toPascalCase(tatName)}_${toPascalCase(page.name)}`

  // Inertia page props type — passed from Inertia::render() in controller
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

${componentCode}

${cleanPageRaw}

// ── Arkzen Inertia wrapper ────────────────────────────────────
function ${wrapperName}() {
  const props = usePage<${propsTypeName}>().props
  ${animFnName ? `const animations = ${animFnName}()` : ''}

  const content = (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      ${animFnName ? `variants={pageVariants}` : ''}
    >
      <${componentName} {...props} />
    </motion.div>
  )

  ${layout !== 'none'
    ? `return <${layoutComp}>{content}</${layoutComp}>`
    : `return content`
  }
}

export default ${wrapperName}
`
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function registerInertiaPages(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name
  const tatDir  = path.join(PAGES_DIR, toPascalCase(tatName))  // Pages/InventoryManagement/
  ensureDir(tatDir)

  // Emit CSS styles into the Pages folder
  const styleInfo = emitTatemonoStyles(tatemono, tatDir, { loggerLabel: 'Arkzen Inertia Router' })

  for (const page of tatemono.pages) {
    const pageContent  = generateInertiaPageFile(tatemono, page, styleInfo.hasGlobalStyle)
    const pageName     = toPascalCase(page.name)            // dashboard → Dashboard
    const pagePath     = path.join(tatDir, `${pageName}.tsx`)
    fs.writeFileSync(pagePath, pageContent, 'utf-8')

    const routeHint = page.name === 'index'
      ? `/${tatName}`
      : `/${tatName}/${page.name}`

    console.log(`[Arkzen Inertia Router] ✓ ${routeHint} → Pages/${toPascalCase(tatName)}/${pageName}.tsx`)
  }

  console.log(`[Arkzen Inertia Router] ✓ ${tatemono.pages.length} page(s) written to laravel-inertia`)
}

export function unregisterInertiaPages(tatName: string): void {
  const tatDir = path.join(PAGES_DIR, toPascalCase(tatName))
  if (fs.existsSync(tatDir)) {
    fs.rmSync(tatDir, { recursive: true, force: true })
    console.log(`[Arkzen Inertia Router] ✓ Removed pages: ${tatName}`)
  }
}