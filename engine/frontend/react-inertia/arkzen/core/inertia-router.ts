// ============================================================
// ARKZEN ENGINE — INERTIA ROUTER v1.0
// React+Inertia.js stack equivalent of router.ts / vite-router.ts
//
// KEY DIFFERENCES from Next.js / React+Vite:
//   - Pages go to resources/js/Pages/{tat}/{page}.tsx (Laravel convention)
//   - No React Router — navigation is Inertia Link + router
//   - useNavigate() → router.visit() from @inertiajs/react
//   - Auth redirects handled server-side by Laravel middleware
//   - Props come from Laravel (Inertia::render('Page', $props))
//   - No layout wrapper injection — layouts are Inertia persistent layouts
//   - Page registry is a flat map (used by resources/js/app.tsx resolver)
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage } from '../types'

// Relative to engine/frontend/react-inertia/
const RESOURCES_DIR  = path.resolve(process.cwd(), 'resources', 'js')
const PAGES_DIR      = path.join(RESOURCES_DIR, 'Pages')
const LAYOUTS_DIR    = path.join(RESOURCES_DIR, 'Layouts', 'custom')
const GENERATED_DIR  = path.join(RESOURCES_DIR, 'arkzen', 'generated')
const REGISTRY_FILE  = path.join(GENERATED_DIR, 'pages.ts')

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

// ─── Generate a single Inertia page file ──────────────────────────────────────
//
// Inertia pages are plain React components that receive props from Laravel.
// Key patterns:
//   - usePage() from @inertiajs/react to access shared props (auth, flash, etc.)
//   - router.visit('/path') instead of navigate()
//   - useForm() from @inertiajs/react for form submissions (no manual fetch needed)
//   - Persistent layouts via static property on the component

function generateInertiaPageFile(tatemono: ParsedTatemono, page: ArkzenPage): string {
  const tatName      = tatemono.meta.name
  const layout       = page.layout ?? (tatemono.meta.auth ? 'auth' : 'none')
  const animFnName   = tatemono.animation ? toCamelCase(tatName) + 'Animations' : null
  const animImport   = animFnName
    ? `import { ${animFnName}, pageVariants } from '@/arkzen/generated/${tatName}.animations'`
    : ''

  // Layout import for Inertia persistent layout pattern
  let layoutImport = ''
  let layoutLine   = ''
  if (layout === 'auth') {
    layoutImport = `import { AuthLayout } from '@/Layouts/AuthLayout'`
    layoutLine   = `\n${toPascalCase(page.name)}Page.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>`
  } else if (layout === 'guest') {
    layoutImport = `import { GuestLayout } from '@/Layouts/GuestLayout'`
    layoutLine   = `\n${toPascalCase(page.name)}Page.layout = (page: React.ReactNode) => <GuestLayout>{page}</GuestLayout>`
  } else if (layout !== 'none') {
    layoutImport = `import { ${toPascalCase(layout)}Layout } from '@/Layouts/custom/${tatName}-${layout}'`
    layoutLine   = `\n${toPascalCase(page.name)}Page.layout = (page: React.ReactNode) => <${toPascalCase(layout)}Layout>{page}</${toPascalCase(layout)}Layout>`
  }

  // Strip React imports from component code (we inject our own)
  const componentCode = tatemono.components
    .map(c => c.raw
      .replace(/\s*import\s+React[,\s]*\{[^}]*\}\s+from\s+['"]react['"]\s*;?\s*\n?/gm, '')
      .replace(/\s*import\s+\{[^}]*React[^}]*\}\s+from\s+['"]react['"]\s*;?\s*\n?/gm, '')
      .replace(/\s*import\s+React\s+from\s+['"]react['"]\s*;?\s*\n?/gm, '')
      .trim()
    )
    .join('\n\n')

  const match = page.raw.match(/const\s+([A-Za-z_$][A-Za-z0-9_$]*Page)\s*[=:(]/)
  const componentName = match ? match[1] : toPascalCase(page.name) + 'Page'

  return `// ============================================================
// ARKZEN GENERATED PAGE — ${tatName}/${page.name} [React+Inertia]
// Layout: ${layout} | Auth: ${layout === 'auth'}
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
//
// INERTIA NOTES:
//   - Props come from Laravel via Inertia::render('${toPascalCase(tatName)}/${toPascalCase(page.name)}', $props)
//   - Use usePage().props to access shared props (auth user, flash, etc.)
//   - Use router.visit('/path') instead of navigate()
//   - Use useForm() for form submissions (no manual fetch/axios needed)
//   - Auth is enforced server-side by Laravel middleware
// ============================================================

import React, { useRef, useEffect, useState } from 'react'
import { usePage, router, useForm, Link } from '@inertiajs/react'
import { motion } from 'framer-motion'
${layoutImport}
${animImport}

// ── Shared components from @arkzen:components:shared ──────────────────────────
${componentCode}

// ── Page component from @arkzen:page:${page.name} ─────────────────────────────
// NOTE: In Inertia, this component receives typed props from Laravel
// Access them via: const { auth, flash, ...props } = usePage().props
${page.raw.trim()}
${layoutLine}

export default ${componentName}
`
}

// ─── Generate animation file (same pattern as vite-router) ─────────────────

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
// ARKZEN GENERATED ANIMATIONS — ${tatemono.meta.name} [React+Inertia]
// DO NOT EDIT — edit tatemono instead
// ============================================================

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

${clean}
`
}

// ─── Page registry (used by app.tsx resolver) ─────────────────────────────────
// Inertia resolves pages by name string ('TatName/PageName')
// We generate a flat map of all registered pages for the resolver

interface InertiaPageEntry {
  tatName:  string
  pageName: string
  filePath: string  // relative import path from app.tsx
}

function readExistingPages(): InertiaPageEntry[] {
  if (!fs.existsSync(REGISTRY_FILE)) return []
  const content = fs.readFileSync(REGISTRY_FILE, 'utf-8')
  const matches = [...content.matchAll(/\/\/ PAGE:([^:]+):([^:]+):([^\n]+)/g)]
  return matches.map(m => ({
    tatName:  m[1],
    pageName: m[2],
    filePath: m[3].trim(),
  }))
}

function writePageRegistry(pages: InertiaPageEntry[]): void {
  ensureDir(GENERATED_DIR)

  const entries = pages.map(p =>
    `  // PAGE:${p.tatName}:${p.pageName}:${p.filePath}\n  '${toPascalCase(p.tatName)}/${toPascalCase(p.pageName)}': () => import('${p.filePath}'),`
  ).join('\n')

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
${entries}
}
`
  fs.writeFileSync(REGISTRY_FILE, content, 'utf-8')
}

// ─── Generate custom layouts ───────────────────────────────────────────────────

function generateCustomLayouts(tatemono: ParsedTatemono): void {
  if (tatemono.layouts.length === 0) return
  ensureDir(LAYOUTS_DIR)

  for (const layout of tatemono.layouts) {
    const fileName = `${tatemono.meta.name}-${layout.name}.tsx`
    const filePath = path.join(LAYOUTS_DIR, fileName)
    const content  = `// ARKZEN CUSTOM LAYOUT — ${tatemono.meta.name}/${layout.name} [Inertia]\n\n${layout.raw}\n`
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`[Arkzen Inertia Router] ✓ Custom layout: ${fileName}`)
  }
}

// ─── Main: register tatemono pages ────────────────────────────────────────────

export function registerInertiaPages(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name
  const tatDir  = path.join(PAGES_DIR, toPascalCase(tatName))
  ensureDir(tatDir)

  // Generate custom layouts
  generateCustomLayouts(tatemono)

  // Generate animation file
  const animContent = generateAnimationFile(tatemono)
  if (animContent) {
    ensureDir(GENERATED_DIR)
    const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
    fs.writeFileSync(animPath, animContent, 'utf-8')
    console.log(`[Arkzen Inertia Router] ✓ Animation file generated`)
  }

  // Generate each page
  const existingPages = readExistingPages().filter(p => p.tatName !== tatName)
  const newPages: InertiaPageEntry[] = []

  for (const page of tatemono.pages) {
    const pageContent = generateInertiaPageFile(tatemono, page)
    const fileName    = `${toPascalCase(page.name)}.tsx`
    const pagePath    = path.join(tatDir, fileName)
    fs.writeFileSync(pagePath, pageContent, 'utf-8')

    const importPath = `@/Pages/${toPascalCase(tatName)}/${toPascalCase(page.name)}`
    newPages.push({ tatName, pageName: page.name, filePath: importPath })

    console.log(`[Arkzen Inertia Router] ✓ ${toPascalCase(tatName)}/${toPascalCase(page.name)} [inertia]`)
  }

  writePageRegistry([...existingPages, ...newPages])
  console.log(`[Arkzen Inertia Router] ✓ Page registry updated: ${newPages.length} page(s)`)
}

// ─── Remove tatemono pages ─────────────────────────────────────────────────────

export function unregisterInertiaPages(tatName: string): void {
  const tatDir = path.join(PAGES_DIR, toPascalCase(tatName))
  if (fs.existsSync(tatDir)) {
    fs.rmSync(tatDir, { recursive: true, force: true })
    console.log(`[Arkzen Inertia Router] ✓ Removed pages: ${tatName}`)
  }

  const animPath = path.join(GENERATED_DIR, `${tatName}.animations.ts`)
  if (fs.existsSync(animPath)) {
    fs.rmSync(animPath)
    console.log(`[Arkzen Inertia Router] ✓ Animation file removed`)
  }

  const pages = readExistingPages().filter(p => p.tatName !== tatName)
  writePageRegistry(pages)
  console.log(`[Arkzen Inertia Router] ✓ Page registry updated`)
}