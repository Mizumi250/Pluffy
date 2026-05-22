// ============================================================
// ARKZEN SITEMAP GENERATOR
// Generates sitemap.xml for all registered tatemonos
// Runs on every rebuild via each stack's router.
//
// Env var priority (stack-agnostic):
//   ARKZEN_SITE_URL          — preferred, works on all stacks
//   NEXT_PUBLIC_SITE_URL     — Next.js fallback
//   VITE_SITE_URL            — Vite / TanStack / Astro / Inertia fallback
//   http://localhost:3000    — last resort
// ============================================================

import * as fs from 'fs'
import * as path from 'path'
import type { ArkzenRegistry } from '../types'

const DOMAIN =
  process.env.ARKZEN_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VITE_SITE_URL ||
  'http://localhost:3000'

export function generateSitemap(registry: ArkzenRegistry): string {
  const urls: string[] = []

  // Add root
  urls.push({
    loc: DOMAIN,
    changefreq: 'weekly',
    priority: 1.0,
  })

  // Add each registered tatemono's pages
  for (const module of registry.modules) {
    if (module.status !== 'active' || !module.pages) continue

    for (const page of module.pages) {
      const route = page === 'index' ? `/${module.name}` : `/${module.name}/${page}`
      urls.push({
        loc: `${DOMAIN}${route}`,
        changefreq: 'weekly',
        priority: 0.8,
      })
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

  return xml
}

export function writeSitemap(registry: ArkzenRegistry, publicDir?: string): void {
  const xml = generateSitemap(registry)
  const targetDir = publicDir ?? path.resolve(process.cwd(), 'public')
  fs.mkdirSync(targetDir, { recursive: true })

  const sitemapPath = path.join(targetDir, 'sitemap.xml')
  fs.writeFileSync(sitemapPath, xml, 'utf-8')
  console.log(`[Arkzen Router] ✓ Sitemap generated: ${sitemapPath}`)
}