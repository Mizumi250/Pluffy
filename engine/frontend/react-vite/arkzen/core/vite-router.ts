// ============================================================
// ARKZEN ENGINE — VITE ROUTER v1.0
// React+Vite stack equivalent of router.ts
// Reads same ParsedTatemono, generates Vite-compatible output:
//   src/pages/{tatName}/{pageName}.tsx   ← page components
//   src/arkzen/generated/routes.ts       ← React Router route registry
//   src/arkzen/generated/{name}.animations.ts ← GSAP animations
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage } from '../types'

const SRC_DIR        = path.resolve(process.cwd(), 'src')
const PAGES_DIR      = path.join(SRC_DIR, 'pages')
const GENERATED_DIR  = path.join(SRC_DIR, 'arkzen', 'generated')
const LAYOUTS_DIR    = path.join(SRC_DIR, 'layouts', 'custom')
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

// ─── Layout import for Vite (uses React Router navigate instead of Next redirect) ──

function getLayoutImport(layout: string, tatName: string): string {
  switch (layout) {
    case 'guest': return `import { GuestLayout } from '@/layouts/GuestLayout'`
    case 'auth':  return `import { AuthLayout }  from '@/layouts/AuthLayout'`
    default:      return `import { ${toPascalCase(layout)}Layout } from '@/layouts/custom/${tatName}-${layout}'`
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

function generatePageFile(tatemono: ParsedTatemono, page: ArkzenPage): string {
  const tatName       = tatemono.meta.name
  const layout        = page.layout ?? (tatemono.meta.auth ? 'auth' : 'none')
  const isAuthLayout  = layout === 'auth'
  const isGuestOnly   = layout === 'guest'
  const layoutImport  = layout !== 'none' ? getLayoutImport(layout, tatName) : ''
  const layoutComp    = layout !== 'none' ? getLayoutComponent(layout) : 'React.Fragment'
  const animFnName    = tatemono.animation ? toCamelCase(tatName) + 'Animations' : null
  const animImport    = animFnName
    ? `import { ${animFnName}, pageVariants } from '@/arkzen/generated/${tatName}.animations'`
    : ''

  // Components raw
  const componentCode = tatemono.components
    .map(c => c.raw
      .replace(/\s*import\s+React[,\s]*\{[^}]*\}\s+from\s+['"]react['"]\s*;?\s*\n?/gm, '')
      .replace(/\s*import\s+\{[^}]*React[^}]*\}\s+from\s+['"]react['"]\s*;?\s*\n?/gm, '')
      .replace(/\s*import\s+React\s+from\s+['"]react['"]\s*;?\s*\n?/gm, '')
      .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/navigation['"]\s*;?\s*\n?/gm, '')
      .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/router['"]\s*;?\s*\n?/gm, '')
      .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/link['"]\s*;?\s*\n?/gm, '')
      .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/image['"]\s*;?\s*\n?/gm, '')
      .replace(/^['"]use client['"]\s*;?\s*\n?/gm, '')
      .trim()
    )
    .join('\n\n')

  // Clean page.raw — strip Next.js-specific code not valid in Vite
  const cleanPageRaw = page.raw
    .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/navigation['"]\s*;?\s*\n?/gm, '')
    .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/router['"]\s*;?\s*\n?/gm, '')
    .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/link['"]\s*;?\s*\n?/gm, '')
    .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/image['"]\s*;?\s*\n?/gm, '')
    .replace(/^['"]use client['"]\s*;?\s*\n?/gm, '')
    .replace(/\buseRouter\b/g, 'useNavigate')
    .replace(/\busePathname\b/g, 'useLocation')
    .trim()

  // Extract component name
  const match = page.raw.match(/const\s+([A-Za-z_$][A-Za-z0-9_$]*Page)\s*[=:(]/)
  const componentName = match ? match[1] : toPascalCase(page.name) + 'Page'
  const wrapperName   = `ArkzenPage_${toPascalCase(tatName)}_${toPascalCase(page.name)}`

  return `// ============================================================
// ARKZEN GENERATED PAGE — ${tatName}/${page.name} [React+Vite]
// Layout: ${layout} | Auth: ${isAuthLayout} | Guest-only: ${isGuestOnly}
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
${layoutImport}
${animImport}

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
    .replace(`const ${animFnName}`, `export const ${animFnName}`)
    .trim()

  return `// ============================================================
// ARKZEN GENERATED ANIMATIONS — ${tatemono.meta.name} [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

${clean}
`
}

// ─── Update route registry ─────────────────────────────────────────────────────

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

// ─── Generate custom layouts ───────────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  if (tatemono.layouts.length === 0) return
  ensureDir(LAYOUTS_DIR)

  for (const layout of tatemono.layouts) {
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(LAYOUTS_DIR, fileName)
    const content  = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name} [React+Vite]\n\n${layout.raw}\n`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Vite Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─── Generate shared components file ──────────────────────────────────────────

function generateSharedComponents(tatemono: ParsedTatemono, tatDir: string): void {
  if (tatemono.components.length === 0) return
  ensureDir(tatDir)

  const content = `// ============================================================
// ARKZEN GENERATED SHARED — ${tatemono.meta.name} [React+Vite]
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
// ============================================================

${tatemono.components.map(c => c.raw
    .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/navigation['"]\s*;?\s*\n?/gm, '')
    .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/router['"]\s*;?\s*\n?/gm, '')
    .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/link['"]\s*;?\s*\n?/gm, '')
    .replace(/\s*import\s+\{[^}]*\}\s+from\s+['"]next\/image['"]\s*;?\s*\n?/gm, '')
    .replace(/^['"]use client['"]\s*;?\s*\n?/gm, '')
    .trim()
  ).join('\n\n')}
`
  fs.writeFileSync(path.join(tatDir, '_shared.tsx'), content, 'utf-8')
  console.log(`[Arkzen Vite Router] ✓ Shared components: _shared.tsx`)
}

// ─── Main: register tatemono pages ────────────────────────────────────────────

export function registerVitePages(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name
  const tatDir  = path.join(PAGES_DIR, tatName)
  ensureDir(tatDir)

  // Generate shared components
  generateSharedComponents(tatemono, tatDir)

  // Generate custom layouts
  generateCustomLayouts(tatemono)

  // Generate animation file
  const animContent = generateAnimationFile(tatemono)
  if (animContent) {
    ensureDir(GENERATED_DIR)
    const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
    fs.writeFileSync(animPath, animContent, 'utf-8')
    console.log(`[Arkzen Vite Router] ✓ Animation file generated`)
  }

  // Generate each page
  const existingRoutes = readExistingRoutes().filter(r => r.tatName !== tatName)
  const newRoutes: ViteRoute[] = []

  for (const page of tatemono.pages) {
    const pageContent = generatePageFile(tatemono, page)
    const pagePath    = path.join(tatDir, `${page.name}.tsx`)
    fs.writeFileSync(pagePath, pageContent, 'utf-8')

    const routePath = page.name === 'index'
      ? `/${tatName}`
      : `/${tatName}/${page.name}`

    newRoutes.push({
      tatName,
      pageName: page.name,
      path:     routePath,
      auth:     tatemono.meta.auth,
    })

    console.log(`[Arkzen Vite Router] ✓ /${tatName}${page.name === 'index' ? '' : '/' + page.name} [vite]`)
  }

  // Update route registry
  writeRouteRegistry([...existingRoutes, ...newRoutes])
  console.log(`[Arkzen Vite Router] ✓ Route registry updated: ${newRoutes.length} page(s)`)
}

// ─── Remove tatemono pages ─────────────────────────────────────────────────────

export function unregisterVitePages(tatName: string): void {
  // Remove page files
  const tatDir = path.join(PAGES_DIR, tatName)
  if (fs.existsSync(tatDir)) {
    fs.rmSync(tatDir, { recursive: true, force: true })
    console.log(`[Arkzen Vite Router] ✓ Removed pages: ${tatName}`)
  }

  // Remove animation file
  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.rmSync(animPath)
    console.log(`[Arkzen Vite Router] ✓ Animation file removed`)
  }

  // Remove from route registry
  const routes = readExistingRoutes().filter(r => r.tatName !== tatName)
  writeRouteRegistry(routes)
  console.log(`[Arkzen Vite Router] ✓ Route registry updated`)
}