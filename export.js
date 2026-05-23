#!/usr/bin/env node

// ============================================================
// ARKZEN ENGINE — EXPORT SCRIPT v9
//
// Philosophy: COPY EVERYTHING. No cleverness. No rewriting.
// The engine works. The exported project IS the engine output.
// We just isolate one tatemono from the multi-tatemono engine.
//
// Stack is determined by activeStack in arkzen.json.
// Switch stacks before exporting:
//   node arkzen.js switch astro
//   node export.js tatemono-name
//
// Stack → backend mapping:
//   react-inertia → engine/backend/laravel-inertia  (monolith — frontend LIVES inside Laravel)
//   all others    → engine/backend/laravel           (decoupled — separate frontend process)
//
// Inertia exports land in a SINGLE folder (backend IS the project).
// No frontend/ split for Inertia — pages are inside resources/js/ in Laravel.
// Native exports skip the backend entirely (frontend-only).
//
// Usage:  node export.js <tatemono-name>
// Output: projects/<tatemono-name>/
// ============================================================

const { execSync, spawnSync } = require('child_process')
const fs   = require('fs')
const path = require('path')

const ROOT_DIR   = __dirname
const ENGINE_DIR = path.join(ROOT_DIR, 'engine')

// Read active stack from arkzen.json
const arkzenJson  = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'arkzen.json'), 'utf-8'))
const activeStack = arkzenJson.activeStack ?? 'nextjs'

// Stack flags
const isInertia = activeStack === 'react-inertia'
const isNative  = activeStack === 'native'

// Paths — backend is stack-aware
const FRONTEND_DIR  = path.join(ENGINE_DIR, 'frontend', activeStack)
const BACKEND_DIR   = isInertia
  ? path.join(ENGINE_DIR, 'backend', 'laravel-inertia')
  : path.join(ENGINE_DIR, 'backend', 'laravel')
const TATEMONOS_DIR = path.join(ROOT_DIR, 'tatemonos')
const PROJECTS_DIR  = path.join(ROOT_DIR, 'projects')

// ─────────────────────────────────────────────
// LOGGING
// ─────────────────────────────────────────────

function log(msg)     { console.log(`\n  ✦ ${msg}`) }
function success(msg) { console.log(`  ✓ ${msg}`) }
function warn(msg)    { console.log(`  ⚠ ${msg}`) }
function skip(msg)    { console.log(`  – ${msg} (skipped)`) }
function divider()    { console.log('\n' + '─'.repeat(50)) }

// ─────────────────────────────────────────────
// VALIDATE INPUT
// ─────────────────────────────────────────────

const tatName = process.argv[2]
if (!tatName) {
  console.log('\n  Usage: node export.js <tatemono-name>')
  console.log('  Example: node export.js inventory-management\n')
  console.log('  Available tatemonos:')
  if (fs.existsSync(TATEMONOS_DIR)) {
    fs.readdirSync(TATEMONOS_DIR).forEach(f => {
      if (fs.existsSync(path.join(TATEMONOS_DIR, f, 'core.tsx')))
        console.log(`    - ${f}`)
    })
  }
  console.log('')
  process.exit(1)
}

const tatPath = path.join(TATEMONOS_DIR, tatName, 'core.tsx')
if (!fs.existsSync(tatPath)) {
  console.log(`\n  ✗ Tatemono not found: tatemonos/${tatName}/core.tsx\n`)
  process.exit(1)
}

const PROJECT_DIR = path.join(PROJECTS_DIR, tatName)
const PROJ_FRONT  = path.join(PROJECT_DIR, 'frontend')
// For Inertia: backend IS the project root (monolith — no frontend/ split).
// For others:  backend lives at PROJECT_DIR/backend/
const PROJ_BACK   = isInertia ? PROJECT_DIR : path.join(PROJECT_DIR, 'backend')

// ─────────────────────────────────────────────
// READ TATEMONO META
// ─────────────────────────────────────────────

const content     = fs.readFileSync(tatPath, 'utf-8')
const hasBackend  = content.includes('auth: true')
  || content.includes('@arkzen:api')
  || content.includes('@arkzen:database:')
  || content.includes('@arkzen:jobs:')
  || content.includes('@arkzen:events:')
  || content.includes('@arkzen:realtime:')
  || content.includes('@arkzen:notifications:')
  || content.includes('@arkzen:mail:')
  || content.includes('@arkzen:console:')
  || content.includes('@arkzen:routes')
  || content.includes('@arkzen:store:')
const hasRealtime = content.includes('@arkzen:realtime') || content.includes('@arkzen:notifications')
const hasJobs     = content.includes('@arkzen:jobs') || content.includes('@arkzen:events')
const tatSnake    = tatName.replace(/-/g, '_')

divider()
console.log(`\n  ARKZEN — Exporting tatemono: ${tatName}\n`)
divider()
console.log(`  Version:  v9`)
console.log(`  Tatemono: ${tatName}`)
console.log(`  Stack:    ${activeStack}`)
console.log(`  Backend:  ${hasBackend}`)
console.log(`  Realtime: ${hasRealtime}`)
console.log(`  Jobs:     ${hasJobs}`)
if (isInertia) console.log(`  Mode:     Inertia monolith — backend IS the project (no frontend/ folder)`)
if (isNative)  console.log(`  Mode:     React Native (frontend only, no backend)`)

// ─────────────────────────────────────────────
// CLEAN OUTPUT DIRECTORY
// ─────────────────────────────────────────────

if (fs.existsSync(PROJECT_DIR)) {
  log('Cleaning previous export...')
  fs.rmSync(PROJECT_DIR, { recursive: true, force: true })
}
fs.mkdirSync(PROJECT_DIR, { recursive: true })

// ─────────────────────────────────────────────
// STEP 1 — ENGINE BUILD
// Trigger a fresh build so all generated output is up-to-date
// before we copy. A raw copy of stale output would ship the
// previous build's files — this ensures what we copy is current.
// ─────────────────────────────────────────────

log(`Triggering engine build for ${tatName}...`)

const buildScript = `
import { buildTatemono } from './arkzen/core/builder'
buildTatemono(${JSON.stringify(tatPath)})
  .then(result => {
    if (result.success) { console.log('[export-build] OK'); process.exit(0) }
    else { console.error('[export-build] FAIL:', result.errors.join(', ')); process.exit(1) }
  })
  .catch(err => { console.error('[export-build] FATAL:', err.message); process.exit(1) })
`

const tmpScript = path.join(FRONTEND_DIR, '__export_build_tmp.ts')
fs.writeFileSync(tmpScript, buildScript)

const tsxBin = path.join(FRONTEND_DIR, 'node_modules', '.bin', 'tsx')
const buildResult = spawnSync(tsxBin, [tmpScript], {
  cwd:     FRONTEND_DIR,
  stdio:   'pipe',
  env:     { ...process.env, ARKZEN_BACKEND_URL: 'http://localhost:8000', ARKZEN_ENGINE_SECRET: 'arkzen-engine-secret' },
  timeout: 60000,
})

if (fs.existsSync(tmpScript)) fs.unlinkSync(tmpScript)

const buildOut = (buildResult.stdout || '').toString()
const buildErr = (buildResult.stderr || '').toString()

if (buildResult.status === 0 && buildOut.includes('[export-build] OK')) {
  success('Engine build complete')
} else {
  warn('Engine build had issues — proceeding with existing output')
  if (buildErr) warn(buildErr.split('\n').filter(l => l.trim()).slice(0, 6).join(' | '))
}

// ─────────────────────────────────────────────
// STEP 2 — COPY ENTIRE BACKEND
//
// Copy the full backend folder exactly as the engine produced it.
// We exclude only:
//   - vendor/                       (too large; reinstalled fresh below)
//   - *.sqlite                      (tatemono's DB handled separately in step 4)
//   - ArkzenEngineController.php    (engine-internal only, not needed standalone)
//   - ArkzenEngineMiddleware.php    (engine-internal only)
//   - routes/arkzen.php             (engine's multi-module route registrar, replaced below)
//   - routes/api.php                (engine's combined api routes, replaced below)
//   - bootstrap/app.php             (engine registers ALL tatemono DBs, replaced below)
//
// Everything else — namespaces, table prefixes, DB connections,
// route prefixes, file structure — is kept exactly as generated.
//
// Stack rules:
//   Native  → skip entirely (no backend)
//   Inertia → copy to PROJECT_DIR root (it IS the full project)
//   Others  → copy to PROJECT_DIR/backend/
// ─────────────────────────────────────────────

const BACKEND_EXCLUDE_FILTER = (src) => {
  const rel = path.relative(BACKEND_DIR, src).replace(/\\/g, '/')
  if (rel.startsWith('vendor/')  || rel === 'vendor')  return false
  if (src.endsWith('.sqlite'))                          return false
  if (rel.includes('Controllers/Arkzen/ArkzenEngineController.php')) return false
  if (rel.includes('Middleware/ArkzenEngineMiddleware.php'))          return false
  if (rel === 'routes/arkzen.php')                      return false
  if (rel === 'routes/api.php')                         return false
  if (rel === 'bootstrap/app.php')                      return false
  return true
}

if (isNative) {
  skip('Backend (React Native — frontend only, no backend needed)')
} else if (isInertia) {
  // Inertia: backend IS the project. Copy to PROJECT_DIR root directly.
  // There is no frontend/ folder — React pages live inside resources/js/
  // inside this same Laravel project. Only copy this tatemono's Inertia pages.
  log('Copying laravel-inertia monolith to project root...')
  fs.cpSync(BACKEND_DIR, PROJECT_DIR, {
    recursive: true,
    filter: (src) => {
      if (!BACKEND_EXCLUDE_FILTER(src)) return false
      const rel = path.relative(BACKEND_DIR, src).replace(/\\/g, '/')
      // Scope Inertia pages to this tatemono only
      if (rel.startsWith('resources/js/Pages/') && rel !== 'resources/js/Pages/') {
        return rel.startsWith(`resources/js/Pages/${tatName}`)
      }
      // node_modules inside laravel-inertia (Vite deps) — skip, reinstalled later
      if (rel.startsWith('node_modules') || rel === 'node_modules') return false
      return true
    }
  })
  success('laravel-inertia monolith copied to project root')
} else if (hasBackend) {
  log('Copying backend...')
  fs.cpSync(BACKEND_DIR, PROJ_BACK, {
    recursive: true,
    filter: BACKEND_EXCLUDE_FILTER
  })
  success('Backend copied')
} else {
  skip('Backend (frontend-only tatemono)')
}

// ─────────────────────────────────────────────
// STEP 3 — COPY ENTIRE FRONTEND
//
// Copy the full frontend folder exactly as the engine produced it.
// We exclude only:
//   - node_modules/              (copied separately to avoid filter overhead)
//   - .next/                     (build cache, irrelevant in export)
//   - arkzen/core/builder.ts     (builds tatemonos — engine-only, not needed)
//   - arkzen/core/watcher.ts     (watches for changes — engine-only)
//   - arkzen/core/backend-bridge.ts (calls engine API — engine-only)
//   - arkzen/types/index.ts      (engine type defs — not needed standalone)
//   - validate.js                (engine validator — not needed standalone)
//   - arkzen.ts / arkzen.config.ts (engine entry — not needed standalone)
//   - tatemono/                  (source DSL files — not needed in export)
//   - arkzen/generated/          (written fresh below in step 8)
//   - app/                       (pages scoped per-tatemono in step 3a below)
//
// Stack rules:
//   Inertia → skip (frontend already inside the monolith copied in step 2)
//   Native  → copy builder output only (no node_modules — Expo handles deps)
//   Others  → copy full frontend stack
// ─────────────────────────────────────────────

const ENGINE_ONLY_FRONTEND = new Set([
  'arkzen/core/builder.ts',
  'arkzen/core/watcher.ts',
  'arkzen/core/backend-bridge.ts',
  'arkzen/types/index.ts',
  'validate.js',
  'arkzen.ts',
  'arkzen.config.ts',
])

if (isInertia) {
  skip('Frontend copy (Inertia — React pages already inside the monolith at resources/js/)')
} else {
  log('Copying frontend base...')

  fs.cpSync(FRONTEND_DIR, PROJ_FRONT, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(FRONTEND_DIR, src).replace(/\\/g, '/')
      if (rel.startsWith('node_modules') || rel === 'node_modules') return false
      if (rel.startsWith('.next')        || rel === '.next')         return false
      if (ENGINE_ONLY_FRONTEND.has(rel))                             return false
      if (rel.startsWith('tatemono/'))                               return false
      if (rel.startsWith('arkzen/generated/'))                       return false
      // app/ pages — root layout.tsx kept, only this tatemono's pages kept
      if (rel.startsWith('app/') && rel !== 'app/') {
        if (rel === 'app/layout.tsx')               return true
        if (rel.startsWith(`app/${tatName}`))       return true
        return false
      }
      return true
    }
  })
  success('Frontend base copied')

  // node_modules — copy as-is (Native: skip, Expo manages its own deps)
  if (!isNative) {
    log('Copying node_modules...')
    fs.cpSync(
      path.join(FRONTEND_DIR, 'node_modules'),
      path.join(PROJ_FRONT, 'node_modules'),
      { recursive: true }
    )
    success('Frontend node_modules copied')
  } else {
    skip('node_modules (Native — run: npm install inside exported project)')
  }

  // ── Step 3a — Inline engine/shared/arkzen/core
  // The shared core (useArkzenRouter, arkzenFetch, authStore, etc.) lives at
  // engine/shared/arkzen/core and is symlinked/aliased in the engine.
  // In the export it must be a real copy so the project is fully standalone.
  log('Inlining shared arkzen/core...')

  const SHARED_CORE    = path.join(ENGINE_DIR, 'shared', 'arkzen', 'core')
  const STACK_ADAPTERS = path.join(FRONTEND_DIR, 'arkzen', 'core', 'adapters')
  const PROJ_CORE      = path.join(PROJ_FRONT, 'arkzen', 'core')

  if (fs.existsSync(SHARED_CORE)) {
    fs.cpSync(SHARED_CORE, PROJ_CORE, { recursive: true })
    success('engine/shared/arkzen/core → frontend/arkzen/core')
  } else {
    warn('engine/shared/arkzen/core not found — skipping shared inline')
  }

  if (fs.existsSync(STACK_ADAPTERS)) {
    fs.mkdirSync(path.join(PROJ_CORE, 'adapters'), { recursive: true })
    fs.cpSync(STACK_ADAPTERS, path.join(PROJ_CORE, 'adapters'), { recursive: true })
    success(`${activeStack}/adapters → frontend/arkzen/core/adapters`)
  }

  // Patch vite.config.ts alias to point at local copy instead of ../../../shared
  if (activeStack === 'react-vite' || activeStack === 'tanstack-start') {
    const vcPath = path.join(PROJ_FRONT, 'vite.config.ts')
    if (fs.existsSync(vcPath)) {
      let vc = fs.readFileSync(vcPath, 'utf-8')
      vc = vc.replace(
        /replacement:\s*path\.resolve\(__dirname,\s*['"]\.\.\/(\.\.\/)*shared\/arkzen\/core['"]\)/,
        `replacement: path.resolve(__dirname, './arkzen/core')`
      )
      fs.writeFileSync(vcPath, vc)
      success('vite.config.ts alias patched (shared → local)')
    }
  }
}

// ─────────────────────────────────────────────
// STEP 4 — COPY TATEMONO'S SQLITE FILE
//
// The engine's pre-built sqlite already has the tatemono's tables
// from its last migration run. We copy it so the export starts with
// a working database. Laravel system tables (cache, sessions,
// failed_jobs) are added by `php artisan migrate` in step 12.
//
// If the sqlite doesn't exist or is empty, we create a blank file
// and let migrate build everything from scratch.
//
// Inertia: dest is PROJECT_DIR (monolith root)
// Others:  dest is PROJ_BACK
// Native:  skip (no backend)
// ─────────────────────────────────────────────

if (!isNative && hasBackend) {
  log('Copying SQLite database...')

  const engSqlite  = path.join(BACKEND_DIR, 'database', 'arkzen', `${tatName}.sqlite`)
  const destDbDir  = path.join(PROJ_BACK, 'database', 'arkzen')
  const destSqlite = path.join(destDbDir, `${tatName}.sqlite`)

  fs.mkdirSync(destDbDir, { recursive: true })

  if (fs.existsSync(engSqlite) && fs.statSync(engSqlite).size > 0) {
    fs.copyFileSync(engSqlite, destSqlite)
    success(`database/arkzen/${tatName}.sqlite copied (pre-built, already migrated)`)
  } else {
    fs.writeFileSync(destSqlite, '')
    warn(`database/arkzen/${tatName}.sqlite not found in engine — created empty, will migrate`)
  }
} else {
  skip('SQLite copy' + (isNative ? ' (Native)' : ' (frontend-only)'))
}

// ─────────────────────────────────────────────
// STEP 4b — COPY TATEMONO ASSETS
//
// If tatemonos/<name>/assets/ exists, copy files into the exported
// project's public/assets/<name>/ categorized by file type.
// Inertia: public/ is inside the monolith root
// Native:  assets/ at project root (no public/)
// Others:  frontend/public/assets/<name>/
// ─────────────────────────────────────────────

log('Checking for tatemono assets...')

const assetsDestBase = isInertia
  ? path.join(PROJECT_DIR, 'public', 'assets', tatName)
  : isNative
    ? path.join(PROJECT_DIR, 'assets', tatName)
    : path.join(PROJ_FRONT, 'public', 'assets', tatName)

const srcAssetsPath = path.join(TATEMONOS_DIR, tatName, 'assets')
if (fs.existsSync(srcAssetsPath)) {
  try {
    fs.mkdirSync(assetsDestBase, { recursive: true })

    const FILE_TYPE_MAP = {
      images:    ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp', '.tiff'],
      videos:    ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.m4v', '.mpg', '.mpeg'],
      audio:     ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.wma'],
      documents: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.csv', '.ppt', '.pptx'],
      fonts:     ['.woff', '.woff2', '.ttf', '.otf', '.eot', '.fnt'],
      archives:  ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
      data:      ['.json', '.xml', '.yaml', '.yml', '.toml'],
      code:      ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h'],
    }

    const getFileType = (filename) => {
      const ext = path.extname(filename).toLowerCase()
      for (const [type, exts] of Object.entries(FILE_TYPE_MAP)) {
        if (exts.includes(ext)) return type
      }
      return 'other'
    }

    for (const file of fs.readdirSync(srcAssetsPath)) {
      const srcFile = path.join(srcAssetsPath, file)
      if (!fs.statSync(srcFile).isDirectory() && !file.startsWith('.')) {
        const typeDir = path.join(assetsDestBase, getFileType(file))
        fs.mkdirSync(typeDir, { recursive: true })
        fs.copyFileSync(srcFile, path.join(typeDir, file))
      }
    }
    success(`Assets copied → public/assets/${tatName}/`)
  } catch (err) {
    warn(`Could not copy assets: ${err.message}`)
  }
} else {
  success('No assets folder found (optional)')
}

// ─────────────────────────────────────────────
// STEP 5 — WRITE STANDALONE bootstrap/app.php
//
// WHY: The engine's bootstrap/app.php registers DB connections for
// ALL tatemonos dynamically. A standalone export only needs the one
// connection for this tatemono — and the engine's file would try to
// load other tatemonos' connections that don't exist here.
//
// We write a minimal app.php that registers only this tatemono's
// SQLite connection via a booted() callback.
//
// Skip: Native (no backend), Inertia (monolith manages its own)
// ─────────────────────────────────────────────

if (!isNative && !isInertia && hasBackend) {
  log('Writing standalone bootstrap/app.php...')

  fs.mkdirSync(path.join(PROJ_BACK, 'bootstrap'), { recursive: true })
  fs.writeFileSync(path.join(PROJ_BACK, 'bootstrap', 'app.php'), `<?php

use Illuminate\\Foundation\\Application;
use Illuminate\\Foundation\\Configuration\\Exceptions;
use Illuminate\\Foundation\\Configuration\\Middleware;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web:      __DIR__.'/../routes/web.php',
        channels: __DIR__.'/../routes/channels.php',
        commands: __DIR__.'/../routes/console.php',
        health:   '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(\\App\\Http\\Middleware\\ArkzenSanctumTokenResolver::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn($request) => $request->is('api/*'));
    })->create();

$app->booted(function () {
    \\Illuminate\\Support\\Facades\\Config::set('database.connections.${tatSnake}', [
        'driver'   => 'sqlite',
        'database' => base_path('database/arkzen/${tatName}.sqlite'),
        'prefix'   => '',
        'foreign_key_constraints' => true,
    ]);
});

return $app;
`)
  success('bootstrap/app.php (single tatemono DB connection registered)')
} else {
  skip('bootstrap/app.php' + (isInertia ? ' (Inertia monolith manages its own)' : isNative ? ' (Native)' : ''))
}

// ─────────────────────────────────────────────
// STEP 6 — MODULE ROUTE SERVICE PROVIDER
//
// WHY: The engine uses RouteRegistrar to load routes for ALL tatemonos
// dynamically. In a standalone export we only need this one tatemono's
// route file loaded. We write a simple ServiceProvider that loads
// routes/modules/<tatName>.php and register it in bootstrap/providers.php.
//
// Skip: Native (no backend), Inertia (Laravel-Inertia handles routes)
// ─────────────────────────────────────────────

if (!isNative && !isInertia && hasBackend) {
  log('Writing ModuleRouteServiceProvider...')

  const routeFilePath = `routes/modules/${tatName}.php`
  const providerDir   = path.join(PROJ_BACK, 'app', 'Providers')
  const providerPath  = path.join(providerDir, 'ModuleRouteServiceProvider.php')
  fs.mkdirSync(providerDir, { recursive: true })

  fs.writeFileSync(providerPath, `<?php

namespace App\\Providers;

use Illuminate\\Support\\ServiceProvider;
use Illuminate\\Support\\Facades\\Route;

class ModuleRouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $routeFile = base_path('${routeFilePath}');
        if (file_exists($routeFile)) {
            Route::middleware(['api'])
                ->group($routeFile);
        }
    }
}
`)
  success(`app/Providers/ModuleRouteServiceProvider.php → loads ${routeFilePath}`)

  // Register in bootstrap/providers.php
  const providersPath = path.join(PROJ_BACK, 'bootstrap', 'providers.php')
  if (fs.existsSync(providersPath)) {
    let provContent = fs.readFileSync(providersPath, 'utf-8')
    provContent = provContent.replace(
      /(\s*\]\s*;?\s*)$/,
      `    App\\Providers\\ModuleRouteServiceProvider::class,\n$1`
    )
    fs.writeFileSync(providersPath, provContent)
    success('bootstrap/providers.php → ModuleRouteServiceProvider registered')
  }
} else {
  skip('ModuleRouteServiceProvider' + (isInertia ? ' (Inertia)' : isNative ? ' (Native)' : ''))
}

// ─────────────────────────────────────────────
// STEP 7 — STRIP ENGINE-ONLY PROVIDERS from bootstrap/providers.php
//
// WHY: ArkzenServiceProvider depends on RegistryReader which manages
// ALL tatemonos via arkzen.json. It would crash in a standalone
// single-tatemono project. AppServiceProvider is also engine-specific.
// Both are stripped — ModuleRouteServiceProvider (written above) is
// the only Arkzen-related provider needed in the export.
//
// Skip: Native (no backend), Inertia (monolith has its own providers)
// ─────────────────────────────────────────────

if (!isNative && !isInertia && hasBackend) {
  const provPath = path.join(PROJ_BACK, 'bootstrap', 'providers.php')
  if (fs.existsSync(provPath)) {
    log('Stripping engine-only providers...')
    let prov = fs.readFileSync(provPath, 'utf-8')
    prov = prov
      .replace(/\s*App\\Providers\\Arkzen\\ArkzenServiceProvider::class,?\n?/g, '\n')
      .replace(/\s*App\\Providers\\AppServiceProvider::class,?\n?/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
    fs.writeFileSync(provPath, prov)
    success('bootstrap/providers.php — ArkzenServiceProvider + AppServiceProvider stripped')
  }
}

// ─────────────────────────────────────────────
// STEP 8 — WRITE .ENV
//
// WHY: The engine's .env has APP_URL on port 8000 (shared dev server),
// multi-tatemono DB config, and engine-level keys. The export needs:
//   - APP_NAME scoped to this tatemono
//   - APP_URL on port 8001 (standalone backend port)
//   - DB_DATABASE pointing at this tatemono's sqlite file
//   - Reverb keys if realtime is used
//
// Inertia .env goes to PROJECT_DIR root (monolith).
// Others .env goes to PROJ_BACK.
// Skip: Native.
// ─────────────────────────────────────────────

if (!isNative && hasBackend) {
  log('Writing .env...')

  const envExPath = path.join(PROJ_BACK, '.env.example')
  let env = fs.existsSync(envExPath) ? fs.readFileSync(envExPath, 'utf-8') : ''

  const relativeSqlitePath = `database/arkzen/${tatName}.sqlite`
  const backendPort = isInertia ? '8000' : '8001'

  env = env
    .replace(/APP_NAME=.*/,             `APP_NAME=${tatName}`)
    .replace(/APP_ENV=.*/,              'APP_ENV=local')
    .replace(/APP_DEBUG=.*/,            'APP_DEBUG=true')
    .replace(/APP_URL=.*/,              `APP_URL=http://localhost:${backendPort}`)
    .replace(/DB_CONNECTION=.*/,        'DB_CONNECTION=sqlite')
    .replace(/#?\s*DB_HOST=.*/,         '# DB_HOST=127.0.0.1')
    .replace(/#?\s*DB_PORT=.*/,         '# DB_PORT=3306')
    .replace(/#?\s*DB_DATABASE=.*/,     `DB_DATABASE=${relativeSqlitePath}`)
    .replace(/#?\s*DB_USERNAME=.*/,     '# DB_USERNAME=root')
    .replace(/#?\s*DB_PASSWORD=.*/,     '# DB_PASSWORD=')
    .replace(/QUEUE_CONNECTION=.*/,     'QUEUE_CONNECTION=database')
    .replace(/SESSION_DRIVER=.*/,       'SESSION_DRIVER=file')
    .replace(/CACHE_STORE=.*/,          'CACHE_STORE=file')
    .replace(/BROADCAST_CONNECTION=.*/, hasRealtime ? 'BROADCAST_CONNECTION=reverb' : 'BROADCAST_CONNECTION=log')

  if (hasRealtime && !env.includes('REVERB_APP_ID=')) {
    env += [
      '',
      'REVERB_APP_ID=arkzen',
      'REVERB_APP_KEY=arkzen-key',
      'REVERB_APP_SECRET=arkzen-secret',
      'REVERB_HOST=localhost',
      'REVERB_PORT=8081',
      'REVERB_SCHEME=http',
    ].join('\n')
  }

  fs.writeFileSync(path.join(PROJ_BACK, '.env'), env)
  success(`.env written (DB → ${relativeSqlitePath}, port → ${backendPort})`)
} else {
  skip('.env (Native)')
}

// ─────────────────────────────────────────────
// STEP 9 — WRITE FRONTEND GLUE FILES
//
// WHY: These files exist in the engine but reference all tatemonos or
// the engine's multi-tatemono port (8000). In a standalone export each
// must be scoped to this one tatemono and point at port 8001.
//
//   auth-tatemonos.ts  — engine version lists all auth tatemonos.
//                        Export version lists only this one.
//   app/page.tsx       — root redirect to this tatemono's entry page.
//   next.config.js     — proxy to backend on 8001 (engine uses 8000).
//   package.json       — rename + fix dev scripts.
//   .env.local         — Reverb config for frontend (if realtime).
//
// middleware.ts is already copied from engine — it works as-is.
// Skip: Inertia (no separate frontend), Native (handled per-stack below).
// ─────────────────────────────────────────────

log('Writing frontend glue files...')

// ── auth-tatemonos.ts
// Engine version lists every auth tatemono. Export version lists only this one.
const genDir = isInertia
  ? path.join(PROJECT_DIR, 'resources', 'js', 'arkzen', 'generated')
  : isNative
    ? path.join(PROJECT_DIR, 'arkzen', 'generated')
    : path.join(PROJ_FRONT, 'arkzen', 'generated')

fs.mkdirSync(genDir, { recursive: true })

const engAuthTatemonos = path.join(
  FRONTEND_DIR,
  isInertia ? 'resources/js/arkzen/generated' : 'arkzen/generated',
  'auth-tatemonos.ts'
)

if (fs.existsSync(engAuthTatemonos)) {
  const hasAuth = content.includes('@arkzen:meta') &&
    fs.readFileSync(engAuthTatemonos, 'utf-8').includes(`'${tatName}'`)
  fs.writeFileSync(path.join(genDir, 'auth-tatemonos.ts'),
    `// Auto-generated by export.js v9 for: ${tatName}\nexport const AUTH_TATEMONOS: string[] = ${hasAuth ? JSON.stringify([tatName]) : '[]'}\n`
  )
} else {
  const hasAuthMeta = /auth:\s*true/.test(content)
  fs.writeFileSync(path.join(genDir, 'auth-tatemonos.ts'),
    `// Auto-generated by export.js v9 for: ${tatName}\nexport const AUTH_TATEMONOS: string[] = ${hasAuthMeta ? JSON.stringify([tatName]) : '[]'}\n`
  )
}
success('arkzen/generated/auth-tatemonos.ts (scoped to this tatemono)')

// Copy other generated files (route-registry, etc.) from engine as-is
const engGenDir = path.join(
  FRONTEND_DIR,
  isInertia ? 'resources/js/arkzen/generated' : 'arkzen/generated'
)
if (fs.existsSync(engGenDir)) {
  fs.readdirSync(engGenDir).forEach(f => {
    if (f === 'auth-tatemonos.ts') return // already written above
    const src = path.join(engGenDir, f)
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(genDir, f))
      success(`generated/${f}`)
    }
  })
}

// ── Stack-specific glue
if (activeStack === 'nextjs') {

  // Root page redirect
  fs.mkdirSync(path.join(PROJ_FRONT, 'app'), { recursive: true })
  fs.writeFileSync(path.join(PROJ_FRONT, 'app', 'page.tsx'),
    `'use client'\nimport { redirect } from 'next/navigation'\nexport default function ArkzenRoot() { redirect('/${tatName}') }\n`
  )
  success(`app/page.tsx → redirects to /${tatName}`)

  // next.config.js — proxy points at 8001 (engine uses 8000)
  fs.writeFileSync(path.join(PROJ_FRONT, 'next.config.js'), `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { forceSwcTransforms: false },
  async rewrites() {
    return [
      { source: '/storage/:path*', destination: 'http://127.0.0.1:8001/storage/:path*' },
      { source: '/api/:path*',     destination: 'http://127.0.0.1:8001/api/:path*' },
    ]
  },
}
module.exports = nextConfig
`)
  success('next.config.js (proxy → localhost:8001)')

  // package.json — rename + standalone dev scripts
  const pkgPath = path.join(PROJ_FRONT, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = {
      dev:   'NEXT_IGNORE_INCORRECT_LOCKFILE=1 NEXT_DISABLE_SWC=1 next dev --webpack --port 3001',
      build: 'next build',
      start: 'next start --port 3001',
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name + scripts updated)')
  }

  if (hasRealtime) {
    fs.writeFileSync(path.join(PROJ_FRONT, '.env.local'), [
      'NEXT_PUBLIC_REVERB_HOST=localhost',
      'NEXT_PUBLIC_REVERB_PORT=8081',
      'NEXT_PUBLIC_REVERB_SCHEME=ws',
      'NEXT_PUBLIC_REVERB_APP_KEY=arkzen-key',
    ].join('\n'))
    success('.env.local (Reverb config)')
  }

} else if (activeStack === 'react-vite') {

  const pkgPath = path.join(PROJ_FRONT, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = {
      dev:     'vite --port 3001',
      build:   'vite build',
      preview: 'vite preview --port 3001',
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name + scripts updated)')
  }

  // Patch vite proxy port from engine's 8000 to standalone 8001
  const vcPath = path.join(PROJ_FRONT, 'vite.config.ts')
  if (fs.existsSync(vcPath)) {
    let vc = fs.readFileSync(vcPath, 'utf-8')
    vc = vc.replace(/target:\s*['"]http:\/\/127\.0\.0\.1:8000['"]/g, `target: 'http://127.0.0.1:8001'`)
    fs.writeFileSync(vcPath, vc)
    success('vite.config.ts proxy port patched (8000 → 8001)')
  }

  if (hasRealtime) {
    fs.writeFileSync(path.join(PROJ_FRONT, '.env'), [
      'VITE_REVERB_HOST=localhost',
      'VITE_REVERB_PORT=8081',
      'VITE_REVERB_SCHEME=ws',
      'VITE_REVERB_APP_KEY=arkzen-key',
    ].join('\n'))
    success('.env (Reverb config)')
  }

} else if (activeStack === 'astro') {

  const pkgPath = path.join(PROJ_FRONT, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = {
      dev:     'astro dev --port 3001',
      build:   'astro build',
      preview: 'astro preview --port 3001',
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name + scripts updated)')
  }

  const astroConfig = path.join(PROJ_FRONT, 'astro.config.mjs')
  if (fs.existsSync(astroConfig)) {
    let ac = fs.readFileSync(astroConfig, 'utf-8')
    ac = ac.replace(/target:\s*['"]http:\/\/127\.0\.0\.1:8000['"]/g, `target: 'http://127.0.0.1:8001'`)
    fs.writeFileSync(astroConfig, ac)
    success('astro.config.mjs proxy port patched (8000 → 8001)')
  }

  if (hasRealtime) {
    fs.writeFileSync(path.join(PROJ_FRONT, '.env'), [
      'PUBLIC_REVERB_HOST=localhost',
      'PUBLIC_REVERB_PORT=8081',
      'PUBLIC_REVERB_SCHEME=ws',
      'PUBLIC_REVERB_APP_KEY=arkzen-key',
    ].join('\n'))
    success('.env (Reverb config)')
  }

} else if (activeStack === 'tanstack-start') {

  const pkgPath = path.join(PROJ_FRONT, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = {
      dev:   'vite dev --port 3001',
      build: 'vite build',
      start: 'vite preview --port 3001',
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name + scripts updated)')
  }

  const vcPath = path.join(PROJ_FRONT, 'vite.config.ts')
  if (fs.existsSync(vcPath)) {
    let vc = fs.readFileSync(vcPath, 'utf-8')
    vc = vc.replace(/target:\s*['"]http:\/\/127\.0\.0\.1:8000['"]/g, `target: 'http://127.0.0.1:8001'`)
    fs.writeFileSync(vcPath, vc)
    success('vite.config.ts proxy port patched (8000 → 8001)')
  }

  if (hasRealtime) {
    fs.writeFileSync(path.join(PROJ_FRONT, '.env'), [
      'VITE_REVERB_HOST=localhost',
      'VITE_REVERB_PORT=8081',
      'VITE_REVERB_SCHEME=ws',
      'VITE_REVERB_APP_KEY=arkzen-key',
    ].join('\n'))
    success('.env (Reverb config)')
  }

} else if (isInertia) {

  // Inertia: package.json lives at PROJECT_DIR root (inside the monolith)
  const pkgPath = path.join(PROJECT_DIR, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = { dev: 'vite', build: 'vite build' }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name + scripts updated — Inertia monolith)')
  }

} else if (isNative) {

  const pkgPath = path.join(PROJECT_DIR, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name = tatName
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name updated — run: npx expo start)')
  }

}

// ─────────────────────────────────────────────
// STEP 10 — STRIP TATEMONO URL PREFIX FROM FRONTEND PAGES
//
// WHY: In the engine, pages live at app/<tatName>/... because multiple
// tatemonos coexist under their own URL namespace. In a standalone export
// there is only one tatemono, so the prefix is unnecessary.
//
// We hoist app/<tatName>/* up to app/* and then strip all /<tatName>/
// references from .tsx/.ts/.js files — EXCEPT /api/<tatName>/... which
// must stay (the backend API prefix is part of Laravel's route definition
// and should not be changed).
//
// Skip: Inertia (pages live in resources/js/Pages, not app/)
//       Native  (no app/ directory)
// ─────────────────────────────────────────────

if (!isInertia && !isNative) {
  log(`Stripping page URL prefix /${tatName} from frontend...`)

  const tatAppDir  = path.join(PROJ_FRONT, 'app', tatName)
  const rootAppDir = path.join(PROJ_FRONT, 'app')

  if (fs.existsSync(tatAppDir)) {
    for (const entry of fs.readdirSync(tatAppDir)) {
      fs.renameSync(path.join(tatAppDir, entry), path.join(rootAppDir, entry))
    }
    fs.rmdirSync(tatAppDir)
    success(`app/${tatName}/ → app/ (folder hoisted)`)
  } else {
    warn(`app/${tatName}/ not found — skipping folder hoist`)
  }

  // Root page.tsx is now hoisted — remove the redirect we wrote in step 9
  // (Next.js only: we wrote a redirect in step 9 but hoisting makes it redundant)
  if (activeStack === 'nextjs') {
    const rootPage = path.join(PROJ_FRONT, 'app', 'page.tsx')
    // Only remove redirect if hoisting succeeded (tatAppDir had a page.tsx)
    if (!fs.existsSync(tatAppDir) && fs.existsSync(rootPage)) {
      success('app/page.tsx → hoisted from app/${tatName}/page.tsx (redirect removed)')
    }
  }

  // Rewrite /<tatName>/ references in all .tsx/.ts/.js/.jsx files
  // but leave /api/<tatName>/... untouched
  function getAllFiles(dir, exts, results = []) {
    if (!fs.existsSync(dir)) return results
    for (const entry of fs.readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.next') continue
      const full = path.join(dir, entry)
      if (fs.statSync(full).isDirectory()) {
        getAllFiles(full, exts, results)
      } else if (exts.some(e => full.endsWith(e))) {
        results.push(full)
      }
    }
    return results
  }

  const frontendFiles = getAllFiles(PROJ_FRONT, ['.tsx', '.ts', '.js', '.jsx'])
  let replacedCount = 0

  for (const file of frontendFiles) {
    let src = fs.readFileSync(file, 'utf-8')
    const before = src

    // /<tatName>/something → /something   (skip /api/<tatName>/something)
    src = src.replace(new RegExp(`(?<!/api)(/${tatName})/`, 'g'), '/')
    // /<tatName>' or /<tatName>" or /<tatName>`  (end of string refs)
    src = src.replace(new RegExp(`(?<!/api)(/${tatName})(['"\`])`, 'g'), '/$2')
    // /<tatName>)  — e.g. router.push('/<tatName>')
    src = src.replace(new RegExp(`(?<!/api)(/${tatName})\\)`, 'g'), '/)')

    if (src !== before) {
      fs.writeFileSync(file, src)
      replacedCount++
    }
  }
  success(`Page URL prefix stripped from ${replacedCount} files`)
}

// ─────────────────────────────────────────────
// STEP 11 — COMPOSER INSTALL
//
// WHY: vendor/ is excluded from the copy (absolute paths baked in,
// too large to copy). We run composer install fresh so autoloader
// paths are correct for the exported project's location.
// ─────────────────────────────────────────────

if (!isNative && hasBackend) {
  log('Installing Composer dependencies...')
  try {
    execSync('composer install --no-interaction --prefer-dist --optimize-autoloader --quiet', {
      cwd: PROJ_BACK, stdio: 'pipe'
    })
    success('composer install complete')
  } catch (e) {
    warn('composer install failed — run manually: cd backend && composer install')
    const msg = (e.stdout || e.stderr || e.message || '').toString().trim()
    msg.split('\n').slice(0, 5).forEach(l => l.trim() && warn('  ' + l))
  }

  // ─────────────────────────────────────────────
  // STEP 12 — APP KEY + STORAGE LINK
  // ─────────────────────────────────────────────

  log('Generating app key...')
  try {
    execSync('php artisan key:generate --force', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('App key generated')
  } catch { warn('App key failed — run: php artisan key:generate') }

  try {
    execSync('php artisan storage:link --force', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('Storage symlink created')
  } catch { warn('Storage link failed — run: php artisan storage:link') }

  // ─────────────────────────────────────────────
  // STEP 13 — MIGRATIONS
  //
  // WHY: Even though the copied sqlite already has the tatemono's tables
  // (from the engine's last migration run), it does NOT have Laravel's own
  // system tables: cache, sessions, failed_jobs, jobs, personal_access_tokens.
  // Running migrate adds those. Existing tatemono tables are skipped (idempotent).
  // ─────────────────────────────────────────────

  log('Running migrations...')
  try {
    const out = execSync('php artisan migrate --force 2>&1', { cwd: PROJ_BACK }).toString()
    success('Migrations complete')
    out.trim().split('\n').filter(l => l.trim()).forEach(l => success('  ' + l))
  } catch (e) {
    warn('Migrations failed — run manually: php artisan migrate')
    const msg = (e.stdout || e.message || '').toString().trim()
    msg.split('\n').slice(0, 8).forEach(l => l.trim() && warn('  ' + l))
  }

  log('Running seeders...')
  try {
    execSync('php artisan db:seed --force', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('Seeders complete')
  } catch { warn('Seeders skipped or none exist — run: php artisan db:seed') }
} else {
  skip('Backend setup (frontend-only or Native tatemono)')
}

// ─────────────────────────────────────────────
// STEP 14 — WRITE start.js
//
// Spawns only the services this tatemono actually uses:
//   - backend  (always, if hasBackend)
//   - queue    (only if hasJobs)
//   - reverb   (only if hasRealtime)
//   - frontend (always, except Native uses Expo)
//
// Inertia: frontend is served by Vite inside Laravel (npm run dev),
//          no separate frontend/ folder or port 3001.
// Native:  npx expo start instead of npm run dev.
// ─────────────────────────────────────────────

log('Writing start.js...')

const startLines = [
  `const { spawn } = require('child_process')`,
  `const path      = require('path')`,
  !isInertia && !isNative ? `const FRONT = path.join(__dirname, 'frontend')` : null,
  hasBackend && !isInertia ? `const BACK  = path.join(__dirname, 'backend')` : null,
  ``,
  `function run(label, cmd, args, cwd, color) {`,
  `  const colors = { frontend:'\\x1b[36m', backend:'\\x1b[35m', queue:'\\x1b[33m', reverb:'\\x1b[34m' }`,
  `  const c = colors[color] || '', r = '\\x1b[0m'`,
  `  const p = spawn(cmd, args, { cwd, stdio: 'pipe', env: { ...process.env, FORCE_COLOR: '1' } })`,
  `  const out = d => String(d).trim().split('\\n').forEach(l => l && console.log(\`\${c}[\${label}]\${r} \${l}\`))`,
  `  p.stdout?.on('data', out)`,
  `  p.stderr?.on('data', out)`,
  `  p.on('exit', code => code && code !== 0 && console.log(\`\${c}[\${label}]\${r} exited \${code}\`))`,
  `  return p`,
  `}`,
  ``,
  `console.log('\\n  Starting ${tatName}...')`,
  hasBackend && !isInertia ? `console.log('  Backend:  http://localhost:8001')` : null,
  isInertia               ? `console.log('  App:      http://localhost:8000 (Laravel + Inertia + Vite)')` : null,
  hasBackend && hasJobs   ? `console.log('  Queue:    enabled')` : null,
  hasBackend && hasRealtime ? `console.log('  Reverb:   ws://localhost:8081')` : null,
  !isInertia && !isNative ? `console.log('  Frontend: http://localhost:3001\\n')` : null,
  isNative                ? `console.log('  Expo:     scan QR code in terminal\\n')` : null,
  ``,
  // Backend process
  hasBackend && !isInertia ? `const backend  = run('backend',  'php', ['artisan', 'serve', '--port=8001'], BACK, 'backend')` : null,
  // Inertia: php artisan serve from project root, Vite runs alongside
  isInertia && hasBackend  ? `const backend  = run('backend',  'php', ['artisan', 'serve', '--port=8000'], __dirname, 'backend')` : null,
  hasBackend && hasJobs && !isInertia
    ? `const queue    = run('queue',    'php', ['artisan', 'queue:work', '--queue=default,heavy', '--sleep=3', '--tries=3'], BACK, 'queue')` : null,
  hasBackend && hasJobs && isInertia
    ? `const queue    = run('queue',    'php', ['artisan', 'queue:work', '--queue=default,heavy', '--sleep=3', '--tries=3'], __dirname, 'queue')` : null,
  hasBackend && hasRealtime && !isInertia
    ? `const reverb   = run('reverb',   'php', ['artisan', 'reverb:start', '--host=0.0.0.0', '--port=8081', '--debug'], BACK, 'reverb')` : null,
  hasBackend && hasRealtime && isInertia
    ? `const reverb   = run('reverb',   'php', ['artisan', 'reverb:start', '--host=0.0.0.0', '--port=8081', '--debug'], __dirname, 'reverb')` : null,
  // Frontend process
  isInertia
    ? `const frontend = run('frontend', 'npm',  ['run', 'dev'], __dirname, 'frontend')` : null,
  isNative
    ? `const frontend = run('frontend', 'npx', ['expo', 'start'], __dirname, 'frontend')` : null,
  !isInertia && !isNative
    ? `const frontend = run('frontend', 'npm',  ['run', 'dev'], FRONT, 'frontend')` : null,
  ``,
  `const services = [${hasBackend ? ' backend,' : ''}${hasBackend && hasJobs ? ' queue,' : ''}${hasBackend && hasRealtime ? ' reverb,' : ''} frontend].filter(Boolean)`,
  ``,
  `process.on('SIGINT', () => {`,
  `  services.forEach(s => s && s.kill())`,
  `  process.exit(0)`,
  `})`,
].filter(l => l !== null).join('\n')

fs.writeFileSync(path.join(PROJECT_DIR, 'start.js'), startLines)
success('start.js')

// ─────────────────────────────────────────────
// STEP 15 — SITEMAP GENERATION
// ─────────────────────────────────────────────

try {
  const sitemapPath = isInertia
    ? path.join(PROJECT_DIR, 'resources', 'js', 'arkzen', 'core', 'sitemap.ts')
    : path.join(PROJ_FRONT, 'arkzen', 'core', 'sitemap.ts')

  if (fs.existsSync(sitemapPath)) {
    delete require.cache[require.resolve(sitemapPath)]
    const sitemapModule = require(sitemapPath)
    if (sitemapModule.writeSitemap) {
      const publicDir = isInertia
        ? path.join(PROJECT_DIR, 'public')
        : path.join(PROJ_FRONT, 'public')
      sitemapModule.writeSitemap(publicDir)
      success('Sitemap generated → public/sitemap.xml')
    }
  }
} catch {
  // Sitemap is non-critical — skip silently
}

// ─────────────────────────────────────────────
// STEP 16 — README + .GITIGNORE
// ─────────────────────────────────────────────

const inertiaNote = isInertia
  ? `\n> **Inertia stack:** This is a monolithic project. Laravel serves the app and Vite handles\n> the React frontend — both run from the same folder. There is no separate \`frontend/\` directory.\n`
  : ''

const nativeNote = isNative
  ? `\n> **React Native stack:** No backend in this export. Run \`npm install\` then \`npx expo start\`.\n`
  : ''

fs.writeFileSync(path.join(PROJECT_DIR, 'README.md'), `# ${tatName}

Generated by Arkzen export.js v9.
${inertiaNote}${nativeNote}
## Start

\`\`\`bash
node start.js
\`\`\`

| Service  | URL                                          |
|----------|----------------------------------------------|${hasBackend && !isInertia ? '\n| Backend  | http://localhost:8001                        |' : ''}${isInertia ? '\n| App      | http://localhost:8000 (Laravel + Vite)       |' : ''}${!isInertia && !isNative ? '\n| Frontend | http://localhost:3001                        |' : ''}${hasBackend && hasRealtime ? '\n| Reverb   | ws://localhost:8081                          |' : ''}
${hasBackend && !isInertia ? `
## Manual backend setup (if needed)

\`\`\`bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed   # if seeders exist
\`\`\`
` : ''}`)

fs.writeFileSync(path.join(PROJECT_DIR, '.gitignore'), [
  '**/node_modules/',
  '**/vendor/',
  '**/.next/',
  '**/.env',
  '**/.env.local',
  '*.log',
  '.DS_Store',
].join('\n'))

// ─────────────────────────────────────────────
// DONE
// ─────────────────────────────────────────────

divider()
console.log(`\n  ✓ EXPORTED: ${tatName}`)
console.log(`  Version:  v9`)
console.log(`  Stack:    ${activeStack}`)
if (hasBackend) console.log(`  DB:       ${isInertia ? '' : 'backend/'}database/arkzen/${tatName}.sqlite`)
console.log(`  Run:      cd projects/${tatName} && node start.js`)
divider()