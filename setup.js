#!/usr/bin/env node

// ============================================================
// ARKZEN ENGINE — SETUP SCRIPT
// Run this ONCE to set up the Arkzen Engine on your machine.
// Usage: node setup.js
// ============================================================

const { execSync } = require('child_process')
const fs   = require('fs')
const path = require('path')

// ─────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────

const ROOT_DIR      = __dirname
const ENGINE_DIR    = path.join(ROOT_DIR, 'engine')
const FRONTEND_DIR  = path.join(ENGINE_DIR, 'frontend')
const BACKEND_DIR   = path.join(ENGINE_DIR, 'backend')
const TATEMONOS_DIR = path.join(ROOT_DIR, 'tatemonos')

// Read active stack from arkzen.json (default: nextjs)
let activeStack = 'nextjs'
let activeAppStack = null
const arkzenJsonPath = path.join(ROOT_DIR, 'arkzen.json')
if (fs.existsSync(arkzenJsonPath)) {
  try {
    const json = JSON.parse(fs.readFileSync(arkzenJsonPath, 'utf-8'))
    activeStack    = json.activeStack    ?? 'nextjs'
    activeAppStack = json.activeAppStack ?? null
  } catch {}
}

// Mobile stacks — no backend needed
const MOBILE_STACKS = ['expo', 'react-native', 'lynx']
const isMobile = MOBILE_STACKS.includes(activeStack)

// Stack → backend mapping
const ACTIVE_BACKEND_DIR = activeStack === 'react-inertia'
  ? path.join(BACKEND_DIR, 'laravel-inertia')
  : path.join(BACKEND_DIR, 'laravel')

const ACTIVE_FRONTEND_DIR = path.join(FRONTEND_DIR, activeStack)

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function log(msg)     { console.log(`\n  ✦ ${msg}`) }
function success(msg) { console.log(`  ✓ ${msg}`) }
function warn(msg)    { console.log(`  ⚠ ${msg}`) }
function error(msg)   { console.log(`  ✗ ${msg}`) }
function divider()    { console.log('\n' + '─'.repeat(50)) }

function run(cmd, cwd = ROOT_DIR) {
  try {
    execSync(cmd, { cwd, stdio: 'inherit' })
    return true
  } catch {
    return false
  }
}

function commandExists(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' })
    return true
  } catch {
    try {
      execSync(`command -v ${cmd}`, { stdio: 'ignore', shell: true })
      return true
    } catch {
      return false
    }
  }
}

// ─────────────────────────────────────────────
// CHECKS
// ─────────────────────────────────────────────

function checkRequirements() {
  divider()
  console.log('\n  ARKZEN ENGINE — SETUP\n')
  console.log(`  Active Stack: ${activeStack}`)
  divider()

  log('Checking requirements...')

  const checks = [
    { cmd: 'node', name: 'Node.js' },
    { cmd: 'npm',  name: 'npm' },
  ]

  // Backend requirements only for web stacks
  if (!isMobile) {
    checks.push({ cmd: 'php',      name: 'PHP' })
    checks.push({ cmd: 'composer', name: 'Composer' })
  }

  let allGood = true
  for (const check of checks) {
    if (commandExists(check.cmd)) {
      success(`${check.name} found`)
    } else {
      error(`${check.name} not found — please install it first`)
      allGood = false
    }
  }

  if (!allGood) {
    console.log('\n  Setup cannot continue. Install missing requirements first.\n')
    process.exit(1)
  }
}

// ─────────────────────────────────────────────
// ENSURE STRUCTURE
// ─────────────────────────────────────────────

function ensureStructure() {
  divider()
  log('Ensuring Arkzen folder structure...')

  const dirs = [ENGINE_DIR, FRONTEND_DIR, BACKEND_DIR, TATEMONOS_DIR]
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true })
  }

  success('Folder structure ready')
}

function ensureExpoPlaceholderAssets(dir) {
  const assetsDir = path.join(dir, 'assets')
  fs.mkdirSync(assetsDir, { recursive: true })
  // minimal 1x1 transparent PNG
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  )
  for (const file of ['icon.png', 'splash-icon.png', 'adaptive-icon.png']) {
    const filePath = path.join(assetsDir, file)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, png)
      success(`Created placeholder: assets/${file}`)
    }
  }
}

// ─────────────────────────────────────────────
// FRONTEND SETUP — active stack only
// ─────────────────────────────────────────────

function setupFrontend() {
  divider()
  log(`Setting up frontend stack: ${activeStack}...`)

  if (!fs.existsSync(ACTIVE_FRONTEND_DIR)) {
    error(`Frontend stack folder not found: engine/frontend/${activeStack}`)
    error('Check your engine/frontend/ folder and arkzen.json activeStack value.')
    process.exit(1)
  }

  const pkgPath = path.join(ACTIVE_FRONTEND_DIR, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    warn(`No package.json found in engine/frontend/${activeStack} — skipping npm install`)
    return
  }

  const nodeModulesPath = path.join(ACTIVE_FRONTEND_DIR, 'node_modules')
  if (fs.existsSync(nodeModulesPath)) {
    log('Cleaning old node_modules...')
    fs.rmSync(nodeModulesPath, { recursive: true, force: true })
  }

  // Expo: ensure placeholder assets exist before install
  if (activeStack === 'expo') {
    ensureExpoPlaceholderAssets(ACTIVE_FRONTEND_DIR)
  }

  log(`Installing npm packages for ${activeStack}...`)
  const ok = run('npm install --no-fund --no-audit --legacy-peer-deps', ACTIVE_FRONTEND_DIR)
  if (!ok) {
    const ok2 = run('npm install --force --no-fund --no-audit --legacy-peer-deps', ACTIVE_FRONTEND_DIR)
    if (!ok2) {
      error(`npm install failed for ${activeStack}. Try manually: cd engine/frontend/${activeStack} && npm install --legacy-peer-deps`)
      process.exit(1)
    }
  }

  success(`Frontend packages installed for ${activeStack}`)

  // react-inertia: also install laravel-inertia npm deps
  if (activeStack === 'react-inertia') {
    log('Installing laravel-inertia npm packages (Vite + Inertia monolith)...')
    const inertiaBackendPkg = path.join(BACKEND_DIR, 'laravel-inertia', 'package.json')
    if (fs.existsSync(inertiaBackendPkg)) {
      const ok3 = run('npm install --no-fund --no-audit --legacy-peer-deps', path.join(BACKEND_DIR, 'laravel-inertia'))
      if (ok3) {
        success('laravel-inertia npm packages installed')
      } else {
        warn('laravel-inertia npm install failed — try manually: cd engine/backend/laravel-inertia && npm install --legacy-peer-deps')
      }
    } else {
      warn('laravel-inertia/package.json not found — skipping')
    }
  }
}

// ─────────────────────────────────────────────
// APP STACK SETUP — activeAppStack (expo / react-native / lynx)
// Separate from the web activeStack — app stacks never need the PHP
// backend, only their own npm packages installed.
// ─────────────────────────────────────────────

function setupAppStack() {
  if (!activeAppStack) return
  if (activeAppStack === activeStack) return // already installed above (legacy single-stack setups)

  divider()
  log(`Setting up app stack: ${activeAppStack}...`)

  const appDir = path.join(FRONTEND_DIR, activeAppStack)
  if (!fs.existsSync(appDir)) {
    warn(`App stack folder not found: engine/frontend/${activeAppStack} — skipping`)
    return
  }

  const pkgPath = path.join(appDir, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    warn(`No package.json found in engine/frontend/${activeAppStack} — skipping npm install`)
    return
  }

  const nodeModulesPath = path.join(appDir, 'node_modules')
  if (fs.existsSync(nodeModulesPath)) {
    log('Cleaning old node_modules...')
    fs.rmSync(nodeModulesPath, { recursive: true, force: true })
  }

  if (activeAppStack === 'expo') {
    ensureExpoPlaceholderAssets(appDir)
  }

  log(`Installing npm packages for ${activeAppStack}...`)
  const ok = run('npm install --no-fund --no-audit --legacy-peer-deps', appDir)
  if (!ok) {
    const ok2 = run('npm install --force --no-fund --no-audit --legacy-peer-deps', appDir)
    if (!ok2) {
      error(`npm install failed for ${activeAppStack}. Try manually: cd engine/frontend/${activeAppStack} && npm install --legacy-peer-deps`)
      return
    }
  }

  success(`App stack packages installed for ${activeAppStack}`)
}

// ─────────────────────────────────────────────
// BACKEND SETUP (web stacks only)
// ─────────────────────────────────────────────

function setupBackend() {
  divider()
  const backendName = activeStack === 'react-inertia' ? 'laravel-inertia' : 'laravel'
  log(`Setting up backend: ${backendName}...`)

  const artisanPath = path.join(ACTIVE_BACKEND_DIR, 'artisan')

  if (!fs.existsSync(artisanPath)) {
    log(`Installing Laravel into engine/backend/${backendName}...`)
    run(`composer create-project laravel/laravel _laravel_tmp --prefer-dist --quiet`, BACKEND_DIR)

    const tmpDir = path.join(BACKEND_DIR, '_laravel_tmp')
    if (!fs.existsSync(tmpDir)) {
      error('Laravel installation failed.')
      process.exit(1)
    }

    for (const file of fs.readdirSync(tmpDir)) {
      const src  = path.join(tmpDir, file)
      const dest = path.join(ACTIVE_BACKEND_DIR, file)
      if (!fs.existsSync(dest)) {
        fs.cpSync(src, dest, { recursive: true })
      }
    }

    fs.rmSync(tmpDir, { recursive: true, force: true })
    success(`Laravel installed into engine/backend/${backendName}`)
  } else {
    success(`Laravel already installed in engine/backend/${backendName}`)
  }

  log('Installing composer packages...')
  run('composer install --quiet', ACTIVE_BACKEND_DIR)
  success('Composer packages installed')

  log('Generating Laravel app key...')
  run('php artisan key:generate --force', ACTIVE_BACKEND_DIR)
  success('App key generated')

  const envPath   = path.join(ACTIVE_BACKEND_DIR, '.env')
  const envExPath = path.join(ACTIVE_BACKEND_DIR, '.env.example')
  const dbPath    = path.join(ACTIVE_BACKEND_DIR, 'database', 'database.sqlite')

  if (!fs.existsSync(envPath) && fs.existsSync(envExPath)) {
    fs.copyFileSync(envExPath, envPath)
  }

  let envContent = fs.readFileSync(envPath, 'utf-8')
  envContent = envContent
    .replace(/DB_CONNECTION=.*/,  'DB_CONNECTION=sqlite')
    .replace(/DB_HOST=.*/,        '# DB_HOST=')
    .replace(/DB_PORT=.*/,        '# DB_PORT=')
    .replace(/DB_DATABASE=.*/,    `DB_DATABASE=${dbPath}`)
    .replace(/DB_USERNAME=.*/,    '# DB_USERNAME=')
    .replace(/DB_PASSWORD=.*/,    '# DB_PASSWORD=')

  if (!envContent.includes('ARKZEN_ENGINE_SECRET')) {
    envContent += '\nARKZEN_ENGINE_SECRET=arkzen-secret-123\n'
  }

  fs.writeFileSync(envPath, envContent)
  success('.env configured for SQLite')

  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    fs.writeFileSync(dbPath, '')
    success('SQLite database file created')
  }

  registerServiceProvider()
  fixAppPhp()

  const dirs = [
    path.join(ACTIVE_BACKEND_DIR, 'routes', 'modules'),
    path.join(ACTIVE_BACKEND_DIR, 'database', 'migrations', 'arkzen'),
    path.join(ACTIVE_BACKEND_DIR, 'database', 'seeders'),
    path.join(ACTIVE_BACKEND_DIR, 'app', 'Models', 'Arkzen'),
  ]
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true })
  }
  success('Required backend directories created')

  log('Running base migrations...')
  run('php artisan migrate --force', ACTIVE_BACKEND_DIR)
  success('Base migrations complete')
}

// ─────────────────────────────────────────────
// FIX APP.PHP
// ─────────────────────────────────────────────

function fixAppPhp() {
  const appPath = path.join(ACTIVE_BACKEND_DIR, 'bootstrap', 'app.php')
  const content = `<?php
use Illuminate\\Foundation\\Application;
use Illuminate\\Foundation\\Configuration\\Exceptions;
use Illuminate\\Foundation\\Configuration\\Middleware;
use Illuminate\\Support\\Facades\\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('api')
                ->prefix('arkzen')
                ->group(base_path('routes/arkzen.php'));

            // Load all Arkzen module routes
            $modulesPath = base_path('routes/modules');
            if (is_dir($modulesPath)) {
                foreach (glob($modulesPath . '/*.php') as $routeFile) {
                    require $routeFile;
                }
            }
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'arkzen.engine' => \\App\\Http\\Middleware\\ArkzenEngineMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
`
  fs.writeFileSync(appPath, content)
  success('app.php configured')
}

// ─────────────────────────────────────────────
// REGISTER SERVICE PROVIDER
// ─────────────────────────────────────────────

function registerServiceProvider() {
  const providersPath = path.join(ACTIVE_BACKEND_DIR, 'bootstrap', 'providers.php')

  if (!fs.existsSync(providersPath)) {
    warn('bootstrap/providers.php not found — skipping provider registration')
    return
  }

  let content = fs.readFileSync(providersPath, 'utf-8')

  if (content.includes('ArkzenServiceProvider')) {
    success('ArkzenServiceProvider already registered')
    return
  }

  content = content.replace(
    /return \[/,
    `return [\n    App\\Providers\\Arkzen\\ArkzenServiceProvider::class,`
  )

  fs.writeFileSync(providersPath, content)
  success('ArkzenServiceProvider registered')
}

// ─────────────────────────────────────────────
// INIT arkzen.json
// ─────────────────────────────────────────────

function initRegistry() {
  if (!fs.existsSync(arkzenJsonPath)) {
    const registry = {
      engine: '1.0.0',
      modules: [],
      activeStack: 'nextjs',
      stacks: {
        'nextjs':         'engine/frontend/nextjs',
        'react-vite':     'engine/frontend/react-vite',
        'react-inertia':  'engine/frontend/react-inertia',
        'astro':          'engine/frontend/astro',
        'tanstack-start': 'engine/frontend/tanstack-start',
        'expo':           'engine/frontend/expo',
        'react-native':   'engine/frontend/react-native',
      },
    }
    fs.writeFileSync(arkzenJsonPath, JSON.stringify(registry, null, 2))
    success('arkzen.json initialized')
  } else {
    success('arkzen.json already exists')
  }
}

// ─────────────────────────────────────────────
// DONE
// ─────────────────────────────────────────────

function printDone() {
  divider()
  console.log(`
  ✓ ARKZEN ENGINE SETUP COMPLETE

  Active Stack: ${activeStack}

  Web Stacks:
    engine/frontend/nextjs/         ← Next.js
    engine/frontend/react-vite/     ← React + Vite
    engine/frontend/react-inertia/  ← Inertia builder/watcher
    engine/frontend/astro/          ← Astro
    engine/frontend/tanstack-start/ ← TanStack Start

  Mobile Stacks:
    engine/frontend/expo/           ← Expo (SDK 53, Expo Go)
    engine/frontend/react-native/   ← React Native (bare)

  Backend:
    engine/backend/laravel/         ← Laravel (all web stacks)
    engine/backend/laravel-inertia/ ← Laravel + Inertia monolith

  Tatemonos:
    tatemonos/                      ← your tatemono DSL files

  To start:
    node start.js

  To switch stack (edit arkzen.json → activeStack), then:
    node setup.js
  `)
  divider()
}

// ─────────────────────────────────────────────
// RUN
// ─────────────────────────────────────────────

checkRequirements()
ensureStructure()
initRegistry()
setupFrontend()
setupAppStack()
if (!isMobile) setupBackend()
printDone()