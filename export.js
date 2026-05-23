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
//   node export.js tatemono-1
//
// Stack → backend mapping (same as start.js):
//   react-inertia → engine/backend/laravel-inertia  (monolithic, Vite inside Laravel)
//   all others    → engine/backend/laravel
//
// Inertia exports land in a single folder (no frontend/ split).
// Native exports skip the backend entirely.
//
// Usage:  node export.js <tatemono-name>
// Output: projects/<tatemono-name>/
// ============================================================

const { execSync, spawnSync } = require('child_process')
const fs   = require('fs')
const path = require('path')

const ROOT_DIR      = __dirname
const ENGINE_DIR    = path.join(ROOT_DIR, 'engine')

// Read active stack from arkzen.json — same pattern as start.js
const arkzenJson    = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'arkzen.json'), 'utf-8'))
const activeStack   = arkzenJson.activeStack ?? 'nextjs'

// Stack flags
const isInertia     = activeStack === 'react-inertia'
const isNative      = activeStack === 'native'

// Paths — backend is stack-aware (same logic as start.js)
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
const PROJ_BACK   = path.join(PROJECT_DIR, 'backend')

// ─────────────────────────────────────────────
// READ TATEMONO META (minimal — only for start.js flags)
// ─────────────────────────────────────────────

const content     = fs.readFileSync(tatPath, 'utf-8')
const hasBackend  = content.includes('auth: true') || content.includes('@arkzen:api') || content.includes('@arkzen:database:') || content.includes('@arkzen:jobs:') || content.includes('@arkzen:events:') || content.includes('@arkzen:realtime:') || content.includes('@arkzen:notifications:') || content.includes('@arkzen:mail:') || content.includes('@arkzen:console:') || content.includes('@arkzen:routes') || content.includes('@arkzen:store:')
const hasRealtime = content.includes('@arkzen:realtime') || content.includes('@arkzen:notifications')
const hasJobs     = content.includes('@arkzen:jobs') || content.includes('@arkzen:events')
const tatSnake    = tatName.replace(/-/g, '_')   // ← ADDED

divider()
console.log(`\n  ARKZEN — Exporting tatemono: ${tatName}\n`)
divider()
console.log(`  Version:  v9`)
console.log(`  Tatemono: ${tatName}`)
console.log(`  Stack:    ${activeStack}`)
console.log(`  Backend:  ${hasBackend}`)
console.log(`  Realtime: ${hasRealtime}`)
console.log(`  Jobs:     ${hasJobs}`)
if (isInertia) console.log(`  Mode:     Inertia monolith (single folder export)`)
if (isNative)  console.log(`  Mode:     React Native (frontend only)`)

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
// Make sure all generated output is fresh before we copy it.
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

const tsxBin    = path.join(FRONTEND_DIR, 'node_modules', '.bin', 'tsx')
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
// STEP 2 — COPY ENTIRE BACKEND AS-IS (ONLY IF NEEDED)
//
// We copy everything from engine/backend EXCEPT:
//   - vendor/          (too large; will composer install)
//   - .sqlite files    (we handle the specific one below)
//   - engine-internal routes (arkzen.php, routes/modules/)
//   - ArkzenEngineController (engine-only, not needed in export)
//   - ArkzenEngineMiddleware (engine-only)
//
// SKIP ENTIRE STEP IF FRONTEND-ONLY:
//   If tatemono has no @arkzen:api/@arkzen:database/@arkzen:jobs/etc.
//   then it's frontend-only — no backend needed at all.
//
// We do NOT touch:
//   - Namespaces       (keep them exactly as generated)
//   - Table names      (keep prefixes exactly as generated)
//   - DB connections   (keep exactly as generated)
//   - Route prefixes   (keep exactly as generated)
//   - File structure   (keep exactly as generated)
// ─────────────────────────────────────────────

// Native = no backend at all
// Inertia = backend IS the full project (monolith), copy to PROJECT_DIR directly
// Others  = copy to PROJ_BACK as usual

if (isNative) {
  skip('Backend (React Native — frontend only)')
} else if (isInertia) {
  log('Copying laravel-inertia monolith (single folder export)...')
  fs.cpSync(BACKEND_DIR, PROJECT_DIR, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(BACKEND_DIR, src).replace(/\\/g, '/')
      if (rel.startsWith('vendor/') || rel === 'vendor') return false
      if (rel.startsWith('node_modules') || rel === 'node_modules') return false
      if (src.endsWith('.sqlite')) return false
      if (rel.includes('Controllers/Arkzen/ArkzenEngineController.php')) return false
      if (rel.includes('Middleware/ArkzenEngineMiddleware.php')) return false
      if (rel === 'routes/arkzen.php') return false
      if (rel === 'routes/api.php') return false
      if (rel === 'bootstrap/app.php') return false
      // Only copy this tatemono's Inertia pages
      if (rel.startsWith('resources/js/Pages/') && rel !== 'resources/js/Pages/') {
        if (rel.startsWith(`resources/js/Pages/${tatName}`)) return true
        return false
      }
      return true
    }
  })
  success('laravel-inertia monolith copied')
} else if (hasBackend) {
  log('Copying backend...')
  fs.cpSync(BACKEND_DIR, PROJ_BACK, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(BACKEND_DIR, src).replace(/\\/g, '/')
      if (rel.startsWith('vendor/') || rel === 'vendor') return false
      if (src.endsWith('.sqlite')) return false
      if (rel.includes('Controllers/Arkzen/ArkzenEngineController.php')) return false
      if (rel.includes('Middleware/ArkzenEngineMiddleware.php')) return false
      if (rel === 'routes/arkzen.php') return false
      if (rel === 'routes/api.php') return false
      if (rel === 'bootstrap/app.php') return false
      return true
    }
  })
  success('Backend copied (full structure preserved)')
} else {
  skip('Backend (frontend-only tatemono)')
}

// ─────────────────────────────────────────────
// STEP 3 — COPY FRONTEND AS-IS
//
// Copy everything from engine/frontend EXCEPT:
//   - node_modules/    (too large; copied separately)
//   - .next/           (build cache, not needed)
//   - Engine-only files that only make sense inside the engine:
//       arkzen/core/builder.ts   (builds tatemonos, not needed in export)
//       arkzen/core/watcher.ts   (watches for changes, not needed)
//       arkzen/core/backend-bridge.ts (talks to engine API, not needed)
//       validate.js              (engine validator)
//       tatemono/ dir            (source tatemonos, not needed)
//   - app/ pages for OTHER tatemonos (we copy only this one below)
// ─────────────────────────────────────────────

// Inertia: frontend lives inside the monolith already copied above — skip
// Native:  copy builder output only (no node_modules copy, Expo handles deps)
// Others:  copy full frontend stack

if (isInertia) {
  skip('Frontend copy (Inertia pages already inside monolith)')
} else {
  log('Copying frontend base...')

const ENGINE_ONLY_FRONTEND = new Set([
  'arkzen/core/builder.ts',
  'arkzen/core/watcher.ts',
  'arkzen/core/backend-bridge.ts',
  'arkzen/types/index.ts',
  'validate.js',
  'arkzen.ts',
  'arkzen.config.ts',
])

fs.cpSync(FRONTEND_DIR, PROJ_FRONT, {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(FRONTEND_DIR, src).replace(/\\/g, '/')

    if (rel.startsWith('node_modules') || rel === 'node_modules') return false
    if (rel.startsWith('.next')        || rel === '.next')         return false

    // Skip engine-only files
    if (ENGINE_ONLY_FRONTEND.has(rel)) return false

    // Skip tatemono sources
    if (rel.startsWith('tatemono/')) return false

    // Skip app/ — we copy pages selectively below
    // (root layout kept, but per-tatemono pages scoped)
    if (rel.startsWith('app/') && rel !== 'app/') {
      // Keep root layout.tsx
      if (rel === 'app/layout.tsx') return true
      // Keep ONLY this tatemono's pages
      if (rel.startsWith(`app/${tatName}`)) return true
      // Skip all other tatemono page dirs
      return false
    }

    // Skip arkzen/generated — we write auth-tatemonos.ts below
    if (rel.startsWith('arkzen/generated/')) return false

    return true
  }
})
success('Frontend base copied')

log('Copying node_modules...')
// Native: skip node_modules — Expo/Metro manages deps independently
if (!isNative) {
  fs.cpSync(
    path.join(FRONTEND_DIR, 'node_modules'),
    path.join(PROJ_FRONT, 'node_modules'),
    { recursive: true }
  )
  success('Frontend node_modules copied')
} else {
  skip('node_modules copy (Native — run: npm install inside the exported project)')
}

// ─────────────────────────────────────────────
// STEP 3b — INLINE SHARED ARKZEN/CORE
// ─────────────────────────────────────────────

log('Inlining shared arkzen/core...')

const SHARED_CORE    = path.join(ENGINE_DIR, 'shared', 'arkzen', 'core')
const STACK_ADAPTERS = path.join(FRONTEND_DIR, 'arkzen', 'core', 'adapters')
const PROJ_CORE      = path.join(PROJ_FRONT, 'arkzen', 'core')

if (fs.existsSync(SHARED_CORE)) {
  fs.cpSync(SHARED_CORE, PROJ_CORE, { recursive: true })
  success('shared/arkzen/core → frontend/arkzen/core')
} else {
  warn('engine/shared/arkzen/core not found — skipping shared inline')
}

if (fs.existsSync(STACK_ADAPTERS)) {
  fs.mkdirSync(path.join(PROJ_CORE, 'adapters'), { recursive: true })
  fs.cpSync(STACK_ADAPTERS, path.join(PROJ_CORE, 'adapters'), { recursive: true })
  success(`${activeStack}/adapters → frontend/arkzen/core/adapters`)
}

// Patch vite.config.ts alias for stacks that use it
if (activeStack === 'react-vite' || activeStack === 'tanstack-start') {
  const vcPath = path.join(PROJ_FRONT, 'vite.config.ts')
  if (fs.existsSync(vcPath)) {
    let vc = fs.readFileSync(vcPath, 'utf-8')
    vc = vc.replace(
      /replacement:\s*path\.resolve\(__dirname,\s*['"]\.\.\/\.\.\/shared\/arkzen\/core['"]\)/,
      `replacement: path.resolve(__dirname, './arkzen/core')`
    )
    fs.writeFileSync(vcPath, vc)
    success('vite.config.ts alias patched (shared → local)')
  }
}

} // end if (!isInertia) frontend block

// ─────────────────────────────────────────────
// STEP 4 — COPY TATEMONO'S SQLITE FILE
// Skip for Native (no backend) — Inertia uses its own DB path
// ─────────────────────────────────────────────

// For Inertia, dest is PROJECT_DIR (monolith root), not PROJ_BACK
const backendRoot = isInertia ? PROJECT_DIR : PROJ_BACK

if (!isNative && hasBackend) {
  log('Copying SQLite database...')

  const engSqlite  = path.join(BACKEND_DIR, 'database', 'arkzen', `${tatName}.sqlite`)
  const destDbDir  = path.join(backendRoot, 'database', 'arkzen')
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
// STEP 4b — COPY TATEMONO'S ASSETS
//
// If the tatemono has an assets/ folder, copy it to the exported
// project's public/assets/ folder, categorized by file type.
// ─────────────────────────────────────────────

log('Checking for tatemono assets...')

// Assets always go to the frontend public folder
// For Inertia: public/ is inside the monolith (PROJECT_DIR/public)
// For Native: assets/ sits at project root (no public/)
const assetsDestBase = isInertia
  ? path.join(PROJECT_DIR, 'public', 'assets', tatName)
  : isNative
    ? path.join(PROJECT_DIR, 'assets', tatName)
    : path.join(PROJ_FRONT, 'public', 'assets', tatName)

const srcAssetsPath = path.join(TATEMONOS_DIR, tatName, 'assets')
if (fs.existsSync(srcAssetsPath)) {
  try {
    const destAssetsDir = assetsDestBase
    fs.mkdirSync(destAssetsDir, { recursive: true })

    // Read source assets and categorize by file type
    const FILE_TYPE_MAP = {
      images: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp', '.tiff'],
      videos: ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.m4v', '.mpg', '.mpeg'],
      audio: ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.wma'],
      documents: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.csv', '.ppt', '.pptx'],
      fonts: ['.woff', '.woff2', '.ttf', '.otf', '.eot', '.fnt'],
      archives: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
      data: ['.json', '.xml', '.yaml', '.yml', '.toml', '.csv'],
      code: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h'],
    }

    const getFileType = (filename) => {
      const ext = path.extname(filename).toLowerCase()
      for (const [type, exts] of Object.entries(FILE_TYPE_MAP)) {
        if (exts.includes(ext)) return type
      }
      return 'other'
    }

    const srcFiles = fs.readdirSync(srcAssetsPath)
    for (const file of srcFiles) {
      const srcFile = path.join(srcAssetsPath, file)
      if (!fs.statSync(srcFile).isDirectory() && !file.startsWith('.')) {
        const fileType = getFileType(file)
        const typeDir = path.join(destAssetsDir, fileType)
        fs.mkdirSync(typeDir, { recursive: true })
        fs.copyFileSync(srcFile, path.join(typeDir, file))
      }
    }
    success(`Assets copied: /public/assets/${tatName}/`)
  } catch (err) {
    warn(`Could not copy assets: ${err.message}`)
  }
} else {
  success('No assets folder found (optional)')
}



// ─────────────────────────────────────────────
// STEP 5 — WRITE STANDALONE BOOTSTRAP/APP.PHP
// Skip for Native (no backend) and Inertia (monolith has its own)
// ─────────────────────────────────────────────

if (!isNative && !isInertia && hasBackend) {
  log('Writing standalone bootstrap/app.php...')

  fs.mkdirSync(path.join(backendRoot, 'bootstrap'), { recursive: true })
  fs.writeFileSync(path.join(backendRoot, 'bootstrap', 'app.php'), `<?php

use Illuminate\\Foundation\\Application;
use Illuminate\\Foundation\\Configuration\\Exceptions;
use Illuminate\\Foundation\\Configuration\\Middleware;

\$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web:      __DIR__.'/../routes/web.php',
        channels: __DIR__.'/../routes/channels.php',
        commands: __DIR__.'/../routes/console.php',
        health:   '/up',
    )
    ->withMiddleware(function (Middleware \$middleware): void {
        \$middleware->prepend(\\App\\Http\\Middleware\\ArkzenSanctumTokenResolver::class);
    })
    ->withExceptions(function (Exceptions \$exceptions): void {
        \$exceptions->shouldRenderJsonWhen(fn(\$request) => \$request->is('api/*'));
    })->create();

\$app->booted(function () {
    \\Illuminate\\Support\\Facades\\Config::set('database.connections.${tatSnake}', [
        'driver'   => 'sqlite',
        'database' => base_path('database/arkzen/${tatName}.sqlite'),
        'prefix'   => '',
        'foreign_key_constraints' => true,
    ]);
});

return \$app;
`)
  success('bootstrap/app.php (connection registered via booted callback)')
} else {
  skip('bootstrap/app.php' + (isInertia ? ' (Inertia monolith manages its own)' : isNative ? ' (Native)' : ''))
}

// ─────────────────────────────────────────────
// STEP 6 — MODULE ROUTE PROVIDER
// Skip for Native (no backend) and Inertia (routes handled by Laravel-Inertia)
// ─────────────────────────────────────────────

if (!isNative && !isInertia && hasBackend) {
  log('Writing module route service provider...')

  const routeFilePath = `routes/modules/${tatName}.php`

  const providerDir  = path.join(backendRoot, 'app', 'Providers')
  const providerPath = path.join(providerDir, 'ModuleRouteServiceProvider.php')
  fs.mkdirSync(providerDir, { recursive: true })

  fs.writeFileSync(providerPath, `<?php

namespace App\\Providers;

use Illuminate\\Support\\ServiceProvider;
use Illuminate\\Support\\Facades\\Route;

class ModuleRouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        \$routeFile = base_path('${routeFilePath}');
        if (file_exists(\$routeFile)) {
            Route::middleware(['api'])
                ->group(\$routeFile);
        }
    }
}
`)
  success(`app/Providers/ModuleRouteServiceProvider.php → loads ${routeFilePath}`)

  const providersPath = path.join(backendRoot, 'bootstrap', 'providers.php')
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
  skip('Module route provider' + (isInertia ? ' (Inertia)' : isNative ? ' (Native)' : ''))
}

// ─────────────────────────────────────────────
// STEP 7 — WRITE .ENV
// Skip for Native. Inertia .env goes to PROJECT_DIR (monolith root).
// ─────────────────────────────────────────────

if (!isNative && hasBackend) {
  log('Writing .env...')

  const envExPath = path.join(backendRoot, '.env.example')
  let env = fs.existsSync(envExPath)
    ? fs.readFileSync(envExPath, 'utf-8')
    : ''

  const relativeSqlitePath = `database/arkzen/${tatName}.sqlite`
  // Inertia serves on 8000 (Vite dev) + 8001 (Laravel), non-Inertia on 8001
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

  fs.writeFileSync(path.join(backendRoot, '.env'), env)
  success(`.env (DB → ${relativeSqlitePath})`)
} else {
  skip('.env (Native)')
}

// ─────────────────────────────────────────────
// STEP 8 — WRITE FRONTEND GLUE FILES
//
// Only the minimum needed to make the standalone project work:
//   - auth-tatemonos.ts  (scoped to this one tatemono)
//   - app/page.tsx       (root redirect)
//   - next.config.js     (proxy to backend on 8001)
//   - package.json       (rename + fix scripts)
// middleware.ts is already copied from engine — it works as-is.
// ─────────────────────────────────────────────

log('Writing frontend glue files...')

// ── auth-tatemonos.ts
// Inertia: lives inside monolith resources/js/arkzen/generated
// Native:  lives at project root (no arkzen/generated concept)
// Others:  frontend/arkzen/generated
const genDir = isInertia
  ? path.join(PROJECT_DIR, 'resources', 'js', 'arkzen', 'generated')
  : isNative
    ? path.join(PROJECT_DIR, 'arkzen', 'generated')
    : path.join(PROJ_FRONT, 'arkzen', 'generated')

fs.mkdirSync(genDir, { recursive: true })

const engAuthTatemonos = path.join(FRONTEND_DIR,
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
success('auth-tatemonos.ts')

// ── Copy other generated files
const engGenDir = path.join(FRONTEND_DIR,
  isInertia ? 'resources/js/arkzen/generated' : 'arkzen/generated'
)
if (fs.existsSync(engGenDir)) {
  fs.readdirSync(engGenDir).forEach(f => {
    if (f === 'auth-tatemonos.ts') return
    const src = path.join(engGenDir, f)
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(genDir, f))
      success(`generated/${f}`)
    }
  })
}

// ── Stack-specific glue
if (activeStack === 'nextjs') {

  fs.mkdirSync(path.join(PROJ_FRONT, 'app'), { recursive: true })
  fs.writeFileSync(path.join(PROJ_FRONT, 'app', 'page.tsx'),
    `'use client'\nimport { redirect } from 'next/navigation'\nexport default function ArkzenRoot() { redirect('/${tatName}') }\n`
  )
  success(`app/page.tsx → redirects to /${tatName}`)

  fs.writeFileSync(path.join(PROJ_FRONT, 'next.config.js'), `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { forceSwcTransforms: false },
  async rewrites() {
    return [
      { source: '/storage/:path*', destination: 'http://127.0.0.1:8001/storage/:path*' },
      { source: '/api/:path*', destination: 'http://127.0.0.1:8001/api/:path*' },
    ]
  },
}
module.exports = nextConfig
`)
  success('next.config.js')

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
    success('package.json')
  }

  if (hasRealtime) {
    fs.writeFileSync(path.join(PROJ_FRONT, '.env.local'), [
      'NEXT_PUBLIC_REVERB_HOST=localhost',
      'NEXT_PUBLIC_REVERB_PORT=8081',
      'NEXT_PUBLIC_REVERB_SCHEME=ws',
      'NEXT_PUBLIC_REVERB_APP_KEY=arkzen-key',
    ].join('\n'))
    success('frontend/.env.local (Reverb config)')
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
    success('package.json (vite scripts)')
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
    success('.env (Reverb config for Vite)')
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
    success('package.json (astro scripts)')
  }

  // Patch vite proxy inside astro.config if it exists
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
    success('.env (Reverb config for Astro)')
  }

} else if (activeStack === 'tanstack-start') {

  const pkgPath = path.join(PROJ_FRONT, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = {
      dev:     'vite dev --port 3001',
      build:   'vite build',
      start:   'vite preview --port 3001',
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (tanstack scripts)')
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
    success('.env (Reverb config for TanStack)')
  }

} else if (isInertia) {

  // package.json scripts live inside the monolith (PROJECT_DIR)
  const pkgPath = path.join(PROJECT_DIR, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = { dev: 'vite', build: 'vite build' }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (inertia scripts)')
  }

} else if (isNative) {

  // React Native: Expo manages everything, just rename the package
  const pkgPath = path.join(PROJECT_DIR, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name = tatName
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (native — run: npx expo start)')
  }

}

// ─────────────────────────────────────────────
// STEP 8b — STRIP TATEMONO PREFIX FROM FRONTEND PAGE URLS
//
// Renames app/tatName/ → app/ (merging into root)
// Replaces all page-level /${tatName} references in .tsx/.ts/.js files
// Leaves /api/${tatName}/... untouched — API prefix stays as-is
// ─────────────────────────────────────────────

log(`Stripping page URL prefix /${tatName} from frontend...`)

// 1. Move app/tatName/* up to app/
const tatAppDir  = path.join(PROJ_FRONT, 'app', tatName)
const rootAppDir = path.join(PROJ_FRONT, 'app')

if (fs.existsSync(tatAppDir)) {
  const entries = fs.readdirSync(tatAppDir)
  for (const entry of entries) {
    const src  = path.join(tatAppDir, entry)
    const dest = path.join(rootAppDir, entry)
    fs.renameSync(src, dest)
  }
  fs.rmdirSync(tatAppDir)
  success(`app/${tatName}/ → app/ (folder hoisted)`)
} else {
  warn(`app/${tatName}/ not found — skipping folder hoist`)
}

// 2. Root page is already app/page.tsx after hoisting — no redirect needed
success('app/page.tsx → already hoisted from app/${tatName}/page.tsx')

// 3. Find all .tsx/.ts/.js files in frontend (skip node_modules, .next)
function getAllFiles(dir, exts, results = []) {
  if (!fs.existsSync(dir)) return results
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (entry === 'node_modules' || entry === '.next') continue
    if (fs.statSync(full).isDirectory()) {
      getAllFiles(full, exts, results)
    } else if (exts.some(e => full.endsWith(e))) {
      results.push(full)
    }
  }
  return results
}

const frontendFiles = getAllFiles(PROJ_FRONT, ['.tsx', '.ts', '.js', '.jsx'])

// 4. Replace page-level /${tatName} but NOT /api/${tatName}
//    Strategy: replace /${tatName}/ and /${tatName}' and /${tatName}"
//    but skip anything preceded by /api
let replacedCount = 0
for (const file of frontendFiles) {
  let content = fs.readFileSync(file, 'utf-8')
  const before = content

  // Replace /${tatName}/something → /something  (but not /api/${tatName}/something)
  content = content.replace(
    new RegExp(`(?<!/api)(/${tatName})/`, 'g'),
    '/'
  )
  // Replace /${tatName}' or /${tatName}" or /${tatName}` (end of string refs)
  content = content.replace(
    new RegExp(`(?<!/api)(/${tatName})(['"\`])`, 'g'),
    '/$2'
  )
  // Replace /${tatName}) — router.push('/tatName')
  content = content.replace(
    new RegExp(`(?<!/api)(/${tatName})\\)`, 'g'),
    '/)'
  )

  if (content !== before) {
    fs.writeFileSync(file, content)
    replacedCount++
  }
}
success(`Page URL prefix stripped from ${replacedCount} files`)

// ─────────────────────────────────────────────
// STEP 9 — STRIP ENGINE-ONLY PROVIDERS
//
// ArkzenServiceProvider depends on RegistryReader which manages
// ALL tatemonos. Not needed (or useful) in a single-tatemono export.
// AppServiceProvider is also engine-specific. Strip both.
// (ONLY FOR BACKEND-ENABLED TATEMONOS)
// ─────────────────────────────────────────────

if (hasBackend) {
  const provPath = path.join(PROJ_BACK, 'bootstrap', 'providers.php')
  if (fs.existsSync(provPath)) {
    let prov = fs.readFileSync(provPath, 'utf-8')
    prov = prov
      .replace(/\s*App\\Providers\\Arkzen\\ArkzenServiceProvider::class,?\n?/g, '\n')
      .replace(/\s*App\\Providers\\AppServiceProvider::class,?\n?/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
    fs.writeFileSync(provPath, prov)
    success('bootstrap/providers.php (engine-only providers stripped)')
  }
}

// ─────────────────────────────────────────────
// STEP 10 — INSTALL VENDOR / COMPOSER CLASSMAP
//
// The engine's vendor/ is NOT copied (too large and has absolute paths).
// Run composer install fresh in the exported project so paths are correct.
// (ONLY FOR BACKEND-ENABLED TATEMONOS)
// ─────────────────────────────────────────────

if (hasBackend) {
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
  // STEP 11 — APP KEY + STORAGE LINK
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
  // STEP 12 — MIGRATIONS
  //
  // ALWAYS run migrations. Even though the engine's pre-built sqlite has
  // tatemono tables, it lacks Laravel system tables (cache, sessions, 
  // failed_jobs, etc.) created by Laravel's own migrations.
  // The --step flag allows idempotent runs — existing tables are skipped.
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

  // Seeders only needed when DB was empty (no else check needed anymore)
  log('Running seeders...')
  try {
    execSync('php artisan db:seed --force', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('Seeders complete')
  } catch { warn('Seeders failed (or none exist) — run: php artisan db:seed') }
} else {
  skip('Backend setup (frontend-only tatemono)')
}

// ─────────────────────────────────────────────
// STEP 13 — WRITE START.JS
// ─────────────────────────────────────────────

log('Writing start.js...')

const startLines = [
  `const { spawn } = require('child_process')`,
  `const path      = require('path')`,
  `const FRONT     = path.join(__dirname, 'frontend')`,
  `const BACK      = path.join(__dirname, 'backend')`,
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
  hasBackend ? `console.log('  Backend:  http://localhost:8001')` : null,
  hasBackend && hasJobs ? `console.log('  Queue:    enabled')` : null,
  hasBackend && hasRealtime ? `console.log('  Reverb:   ws://localhost:8081')` : null,
  `console.log('  Frontend: http://localhost:3001\\n')`,
  ``,
  hasBackend ? `const backend  = run('backend',  'php', ['artisan', 'serve', '--port=8001'], BACK, 'backend')` : null,
  hasBackend && hasJobs ? `const queue    = run('queue',    'php', ['artisan', 'queue:work', '--queue=default,heavy', '--sleep=3', '--tries=3'], BACK, 'queue')` : null,
  hasBackend && hasRealtime ? `const reverb   = run('reverb',   'php', ['artisan', 'reverb:start', '--host=0.0.0.0', '--port=8081', '--debug'], BACK, 'reverb')` : null,
  `const frontend = run('frontend', 'npm',  ['run', 'dev'], FRONT, 'frontend')`,
  ``,
  `const services = [${hasBackend ? ` backend,` : ''}${hasBackend && hasJobs ? ` queue,` : ''}${hasBackend && hasRealtime ? ` reverb,` : ''} frontend].filter(Boolean)`,
  ``,
  `process.on('SIGINT', () => {`,
  `  services.forEach(s => s && s.kill())`,
  `  process.exit(0)`,
  `})`,
].filter(l => l !== null).join('\n')

fs.writeFileSync(path.join(PROJECT_DIR, 'start.js'), startLines)
success('start.js')

// ─────────────────────────────────────────────
// STEP 14 — README + GITIGNORE
// ─────────────────────────────────────────────

fs.writeFileSync(path.join(PROJECT_DIR, 'README.md'), `# ${tatName}

Generated by Arkzen export.js v8.

## Start

\`\`\`bash
node start.js
\`\`\`

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3001  |${hasBackend ? '\n| Backend  | http://localhost:8001  |' : ''}
| Queue    | Background jobs        |
| Reverb   | ws://localhost:8081    |

## Manual setup (if needed)

\`\`\`bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed   # if seeders exist
\`\`\`
`)

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
// GENERATE SITEMAP FOR EXPORTED PROJECT
// ─────────────────────────────────────────────

try {
  const sitemapPath = path.join(PROJECTS_DIR, tatName, 'frontend', 'arkzen', 'core', 'sitemap.ts')
  if (fs.existsSync(sitemapPath)) {
    // Dynamically require the sitemap module
    delete require.cache[require.resolve(sitemapPath)]
    const sitemapModule = require(sitemapPath)
    if (sitemapModule.writeSitemap) {
      const publicDir = path.join(PROJECTS_DIR, tatName, 'frontend', 'public')
      sitemapModule.writeSitemap(publicDir)
      console.log(`\n  ✓ Sitemap generated: projects/${tatName}/frontend/public/sitemap.xml`)
    }
  }
} catch (err) {
  // Silently skip if sitemap generation fails (it's not critical for export)
}

// ─────────────────────────────────────────────
// DONE
// ─────────────────────────────────────────────

divider()
console.log(`\n  ✓ EXPORTED: ${tatName}`)
console.log(`  Version: v8 (copy-everything, engine‑style routing)`)
console.log(`  DB:      database/arkzen/${tatName}.sqlite`)
console.log(`  Run:     cd projects/${tatName} && node start.js`)
console.log(`  SEO:     Visit /public/sitemap.xml and submit to Google Console`)
divider()