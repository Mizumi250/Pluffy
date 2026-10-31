// Orchestrates one tatemono build: validate -> database -> generate -> bundle -> load.
import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as path from 'path'
import { pathToFileURL } from 'url'
import type { Router } from 'express'
import { BACKEND_DIR, ensureDir, Log } from '../runtime/support'
import { ensureDatabase, dropDatabase, connection } from '../runtime/database'
import { modules, registerCommand, unregisterTatemonoCommands } from '../runtime'
import { generate } from './generate'
import { applySchema, applyAuthTables, seedAuthUsers, seedTables } from './schema'

type Any = Record<string, any>
export const routers = new Map<string, Router>()
const GEN_DIR   = path.join(BACKEND_DIR, 'src', 'generated')
const BUILD_DIR = path.join(BACKEND_DIR, '.build')
const RUNTIME   = pathToFileURL(path.join(BACKEND_DIR, 'src', 'runtime', 'index.ts')).href

export function validatePayload(p: Any): string[] {
  const errors: string[] = []
  if (!p.name || typeof p.name !== 'string') errors.push('Missing "name"')
  else if (!/^[a-z0-9][a-z0-9-]*$/.test(p.name)) errors.push(`Invalid tatemono name "${p.name}" (lowercase letters, digits, dashes)`)
  if (p.backendVariant && p.backendVariant !== 'ts') errors.push(`Payload was parsed for the :${p.backendVariant} variant but this backend (express) reads :ts. Switch the active backend and let the watcher rebuild.`)
  const tables = new Set<string>()
  for (const d of p.databases ?? []) { if (!d.table) errors.push('database block without a table'); tables.add(d.table) }
  for (const a of p.apis ?? []) { if (!a.model || !a.controller) errors.push('api block needs model and controller') }
  return errors
}

/** Bundles src/generated/<slug>/index.ts with esbuild (syntax errors in :ts bodies surface here) and loads it. */
export async function loadModule(slug: string): Promise<void> {
  ensureDir(BUILD_DIR)
  for (const f of fs.readdirSync(BUILD_DIR)) if (f.startsWith(`${slug}.`)) fs.rmSync(path.join(BUILD_DIR, f))
  const outfile = path.join(BUILD_DIR, `${slug}.${Date.now()}.mjs`)
  await esbuild.build({
    entryPoints: [path.join(GEN_DIR, slug, 'index.ts')], outfile, bundle: true, platform: 'node', format: 'esm',
    target: 'node20', logLevel: 'silent', packages: 'external',
    plugins: [{ name: 'pluff-runtime', setup(b) { b.onResolve({ filter: /^@pluff\/runtime$/ }, () => ({ path: RUNTIME, external: true })) } }],
  })
  const mod: Any = await import(pathToFileURL(outfile).href)
  routers.set(slug, mod.router)
  modules.set(slug, { name: slug, jobs: mod.jobs, listeners: mod.listeners, events: mod.events, listenerMap: mod.listenerMap })
  unregisterTatemonoCommands(slug)
  for (const C of mod.commands ?? []) registerCommand(slug, C)
}

export async function loadAllGenerated() {
  if (!fs.existsSync(GEN_DIR)) return
  for (const slug of fs.readdirSync(GEN_DIR)) {
    if (!fs.existsSync(path.join(GEN_DIR, slug, 'index.ts'))) continue
    try { await loadModule(slug); Log.info(`Loaded module: ${slug}`) } catch (e: any) { Log.error(`Failed to load ${slug}: ${e.message}`) }
  }
}

export async function buildTatemono(p: Any) {
  const steps: string[] = []; const errors: string[] = []
  const bad = validatePayload(p)
  if (bad.length) return { status: 422, body: { success: false, message: 'Validation failed', errors: bad, steps } }
  const slug: string = p.name
  Log.info(`═══ Building: ${slug} (express) ═══`)

  const run = async (label: string, fn: () => Promise<void> | void) => {
    try { await fn(); steps.push(label) } catch (e: any) { errors.push(`${label}: ${e.message}`); Log.error(`${label}: ${e.message}`) }
  }

  const g = generate(p)
  const hasNotifications = (p.notifications ?? []).length > 0
  const dbs: Any[] = p.databases ?? []

  await run('Database ready', async () => { await ensureDatabase(slug) })
  const db = connection(slug)
  const dbSteps: string[] = []
  await run('Migrations', async () => { await applySchema(db, slug, dbs, dbSteps) })
  if (p.auth) {
    await run('Auth tables', async () => { await applyAuthTables(db, slug, hasNotifications, dbSteps) })
    await run('Auth seed', async () => { await seedAuthUsers(db, slug, p.authSeed, dbSteps) })
  } else if (hasNotifications) {
    await run('Notification table', async () => { await applyAuthTables(db, slug, true, dbSteps) })
  }
  await run('Seeders', async () => { await seedTables(db, slug, dbs, dbSteps) })
  steps.push(...dbSteps)

  await run(`Generate ${Object.keys(g.files).length} files`, () => {
    const dir = path.join(GEN_DIR, slug)
    fs.rmSync(dir, { recursive: true, force: true }); ensureDir(dir)
    for (const [f, content] of Object.entries(g.files)) fs.writeFileSync(path.join(dir, f), content)
  })
  await run('Bundle + load routes', () => loadModule(slug))

  const success = errors.length === 0
  return { status: success ? 200 : 500, body: { success, message: success ? 'Build complete' : 'Build finished with errors', steps, errors, registry: g.registry } }
}

export async function removeTatemono(p: Any) {
  const slug: string = p.name
  const steps: string[] = []
  routers.delete(slug); modules.delete(slug); unregisterTatemonoCommands(slug)
  fs.rmSync(path.join(GEN_DIR, slug), { recursive: true, force: true })
  for (const f of fs.existsSync(BUILD_DIR) ? fs.readdirSync(BUILD_DIR) : []) if (f.startsWith(`${slug}.`)) fs.rmSync(path.join(BUILD_DIR, f))
  fs.rmSync(path.join(BACKEND_DIR, 'database', 'migrations', 'arkzen', slug), { recursive: true, force: true })
  steps.push('Routes + generated files removed')
  await dropDatabase(slug); steps.push('Isolated database dropped')
  return { success: true, message: `Removed ${slug}`, steps, errors: [] as string[] }
}
