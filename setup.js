#!/usr/bin/env node

// ============================================================
// PLUFF — SETUP SCRIPT
// Run this ONCE to set up Pluff on your machine.
// Usage: node setup.js
// ============================================================

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ─────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────

const ROOT_DIR      = path.dirname(fileURLToPath(import.meta.url))
const ENGINE_DIR    = path.join(ROOT_DIR, 'engine')
const FRONTEND_DIR  = path.join(ENGINE_DIR, 'frontend')
const BACKEND_DIR   = path.join(ENGINE_DIR, 'backend')
const TATEMONOS_DIR = path.join(ROOT_DIR, 'tatemonos')

// Read active stack from arkzen.json (default: nextjs)
let activeStack = 'nextjs'
let activeAppStack = null
let activeDesktopStack = null
const arkzenJsonPath = path.join(ROOT_DIR, 'arkzen.json')
if (fs.existsSync(arkzenJsonPath)) {
  try {
    const json = JSON.parse(fs.readFileSync(arkzenJsonPath, 'utf-8'))
    activeStack    = json.activeStack    ?? 'nextjs'
    activeAppStack = json.activeAppStack ?? null
    activeDesktopStack = json.activeDesktopStack ?? null
  } catch {}
}

const DESKTOP_STACKS = ['tauri', 'electron']
const isDesktop = activeDesktopStack !== null && DESKTOP_STACKS.includes(activeDesktopStack)

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
      const finder = process.platform === 'win32' ? 'where' : 'command -v'
      execSync(`${finder} ${cmd}`, { stdio: 'ignore', shell: true })
      return true
    } catch {
      return false
    }
  }
}

const FRONTEND_STACKS = {
  'nextjs':         { category: 'web',     dir: path.join(FRONTEND_DIR, 'nextjs') },
  'react-vite':     { category: 'web',     dir: path.join(FRONTEND_DIR, 'react-vite') },
  'react-inertia':  { category: 'web',     dir: path.join(FRONTEND_DIR, 'react-inertia') },
  'astro':          { category: 'web',     dir: path.join(FRONTEND_DIR, 'astro') },
  'tanstack-start': { category: 'web',     dir: path.join(FRONTEND_DIR, 'tanstack-start') },
  'expo':           { category: 'app',     dir: path.join(FRONTEND_DIR, 'expo') },
  'react-native':   { category: 'app',     dir: path.join(FRONTEND_DIR, 'react-native') },
  'lynx':           { category: 'app',     dir: path.join(FRONTEND_DIR, 'lynx') },
  'tauri':          { category: 'desktop', dir: path.join(FRONTEND_DIR, 'tauri') },
  'electron':       { category: 'desktop', dir: path.join(FRONTEND_DIR, 'electron') },
}

function activeStackSet() {
  return new Set([activeStack, activeAppStack, activeDesktopStack].filter(Boolean))
}

function cacheDirsFor(stack) {
  const meta = FRONTEND_STACKS[stack]
  if (!meta) return []
  const dirs = [path.join(meta.dir, 'node_modules')]
  if (stack === 'nextjs') dirs.push(path.join(meta.dir, '.next'))
  if (stack === 'react-inertia') {
    dirs.push(path.join(BACKEND_DIR, 'laravel-inertia', 'node_modules'))
  }
  if (stack === 'tauri') dirs.push(path.join(meta.dir, 'src-tauri', 'target'))
  return dirs
}

function dirSize(dir) {
  if (!fs.existsSync(dir)) return 0
  let total = 0
  const stack = [dir]
  while (stack.length) {
    const cur = stack.pop()
    let entries
    try { entries = fs.readdirSync(cur, { withFileTypes: true }) } catch { continue }
    for (const entry of entries) {
      const full = path.join(cur, entry.name)
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) stack.push(full)
      else if (entry.isFile()) {
        try { total += fs.statSync(full).size } catch {}
      }
    }
  }
  return total
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

function stackInstalled(stack) {
  const meta = FRONTEND_STACKS[stack]
  return !!(meta && fs.existsSync(path.join(meta.dir, 'node_modules')))
}

function stackCacheSize(stack) {
  return cacheDirsFor(stack).reduce((sum, dir) => sum + dirSize(dir), 0)
}

function removeDir(dir) {
  if (!fs.existsSync(dir)) return 0
  const size = dirSize(dir)
  try {
    fs.rmSync(dir, { recursive: true, force: true })
    return size
  } catch (e) {
    warn(`Could not remove ${dir}: ${e.message}`)
    return 0
  }
}

function installNpm(dir, label) {
  const pkgPath = path.join(dir, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    warn(`No package.json in ${label} — skipping`)
    return false
  }
  log(`Installing npm packages for ${label}...`)
  const ok = run('npm install --no-fund --no-audit --legacy-peer-deps', dir)
  if (!ok) {
    const ok2 = run('npm install --force --no-fund --no-audit --legacy-peer-deps', dir)
    if (!ok2) {
      error(`npm install failed for ${label}`)
      return false
    }
  }
  success(`Installed ${label}`)
  return true
}

function installStack(stack, { force = false } = {}) {
  const meta = FRONTEND_STACKS[stack]
  if (!meta) { error(`Unknown stack: ${stack}`); return false }
  if (!fs.existsSync(meta.dir)) { error(`Stack folder missing: engine/frontend/${stack}`); return false }

  if (stack === 'expo') ensureExpoPlaceholderAssets(meta.dir)

  const nm = path.join(meta.dir, 'node_modules')
  if (fs.existsSync(nm) && !force) {
    success(`${stack} already installed — skip (use --force to reinstall)`)
  } else {
    if (force && fs.existsSync(nm)) fs.rmSync(nm, { recursive: true, force: true })
    if (!installNpm(meta.dir, stack)) return false
  }

  if (stack === 'react-inertia') {
    const inertiaDir = path.join(BACKEND_DIR, 'laravel-inertia')
    if (fs.existsSync(path.join(inertiaDir, 'package.json'))) {
      const inertiaNm = path.join(inertiaDir, 'node_modules')
      if (!fs.existsSync(inertiaNm) || force) {
        installNpm(inertiaDir, 'laravel-inertia')
      }
    }
  }
  return true
}

function uninstallStack(stack, { force = false } = {}) {
  const meta = FRONTEND_STACKS[stack]
  if (!meta) { error(`Unknown stack: ${stack}`); return 0 }
  if (!force && activeStackSet().has(stack)) {
    warn(`Skip ${stack} — it is currently active. Switch away first, or pass --force.`)
    return 0
  }
  let freed = 0
  for (const dir of cacheDirsFor(stack)) {
    if (!fs.existsSync(dir)) continue
    log(`Removing ${dir.replace(ROOT_DIR + path.sep, '')}...`)
    freed += removeDir(dir)
  }
  if (freed > 0) success(`Uninstalled ${stack} (${formatBytes(freed)} freed)`)
  else success(`${stack} had no node_modules / cache to remove`)
  return freed
}

function printDepsStatus() {
  divider()
  console.log('\n  Frontend package status (node_modules + rebuild caches)\n')
  const keep = activeStackSet()
  let total = 0
  let unused = 0
  for (const [stack, meta] of Object.entries(FRONTEND_STACKS)) {
    const size = stackCacheSize(stack)
    total += size
    const installed = stackInstalled(stack)
    const isActive = keep.has(stack)
    if (installed && !isActive) unused += size
    const mark = installed ? '✓' : '✗'
    const tag = isActive ? 'active' : (installed ? 'unused' : 'not installed')
    console.log(`    ${mark}  ${stack.padEnd(16)} ${meta.category.padEnd(8)} ${formatBytes(size).padStart(10)}  ${tag}`)
  }
  console.log(`\n  Total:  ${formatBytes(total)}`)
  console.log(`  Unused: ${formatBytes(unused)}  (prune with: node setup.js --prune-unused)\n`)
  divider()
}

function pruneUnusedStacks({ force = false } = {}) {
  divider()
  log('Pruning node_modules for stacks that are not active...')
  let freed = 0
  for (const stack of Object.keys(FRONTEND_STACKS)) {
    if (activeStackSet().has(stack)) continue
    if (!cacheDirsFor(stack).some(fs.existsSync)) continue
    freed += uninstallStack(stack, { force: true })
  }
  success(`Prune complete — ${formatBytes(freed)} freed`)
  console.log(`  Kept active: ${[...activeStackSet()].join(', ') || '(none)'}\n`)
  return freed
}

function parseCli(argv) {
  const flags = {
    install: [],
    uninstall: [],
    pruneUnused: false,
    depsStatus: false,
    force: false,
    fullSetup: true,
  }
  const takeNames = (i) => {
    const names = []
    let j = i + 1
    while (j < argv.length && !argv[j].startsWith('-')) {
      names.push(argv[j])
      j++
    }
    return { names, next: j - 1 }
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--force') flags.force = true
    else if (a === '--prune-unused' || a === 'prune') {
      flags.pruneUnused = true
      flags.fullSetup = false
    } else if (a === '--deps-status' || a === 'status') {
      flags.depsStatus = true
      flags.fullSetup = false
    } else if (a === '--install' || a === 'install') {
      const { names, next } = takeNames(i)
      flags.install.push(...names)
      flags.fullSetup = false
      i = next
    } else if (a === '--uninstall' || a === 'uninstall') {
      const { names, next } = takeNames(i)
      flags.uninstall.push(...names)
      flags.fullSetup = false
      i = next
    } else if (a === '--backend' || a === 'backend') {
      flags.backendOnly = true
      flags.fullSetup = false
    } else if (a === '--help' || a === '-h') {
      flags.help = true
      flags.fullSetup = false
    }
  }
  if (flags.install.length || flags.uninstall.length || flags.pruneUnused || flags.depsStatus || flags.backendOnly) {
    flags.fullSetup = argv.includes('--with-setup')
  }
  if ((argv.includes('--install') || argv.includes('install')) && flags.install.length === 0) {
    flags.emptyInstall = true
    flags.fullSetup = false
  }
  if ((argv.includes('--uninstall') || argv.includes('uninstall')) && flags.uninstall.length === 0) {
    flags.emptyUninstall = true
    flags.fullSetup = false
  }
  return flags
}

function printSetupHelp() {
  console.log(`
  PLUFF setup / deps

  Full setup (active stacks only — does not install every frontend):
    node setup.js

  PHP backend only (composer vendor):
    node setup.js --backend

  Package manager:
    node setup.js --deps-status
    node setup.js --install nextjs expo electron
    node setup.js --uninstall astro react-vite tanstack-start
    node setup.js --prune-unused
    node setup.js --uninstall astro --force
`)
}

// ─────────────────────────────────────────────
// CHECKS
// ─────────────────────────────────────────────

function checkRequirements() {
  divider()
  console.log('\n  PLUFF — SETUP\n')
  console.log(`  Active Stack: ${activeStack}`)
  divider()

  log('Checking requirements...')

  const checks = [
    { cmd: 'node', name: 'Node.js' },
    { cmd: 'npm',  name: 'npm' },
    { cmd: 'php',      name: 'PHP' },
    { cmd: 'composer', name: 'Composer' },
  ]

  if (isDesktop && activeDesktopStack === 'tauri') {
    checks.push({ cmd: 'rustc', name: 'Rust compiler' })
    checks.push({ cmd: 'cargo', name: 'Cargo' })
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
  log('Ensuring Pluff folder structure...')

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

  if (!installStack(activeStack)) process.exit(1)
}

function setupDesktopStack() {
  if (!activeDesktopStack) return
  divider()
  log(`Setting up desktop stack: ${activeDesktopStack}...`)
  if (!installStack(activeDesktopStack)) process.exit(1)
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

  installStack(activeAppStack)
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
  const composerOk = run('composer install --no-interaction', ACTIVE_BACKEND_DIR)
    || run('composer update --no-interaction --with-all-dependencies', ACTIVE_BACKEND_DIR)
  if (!composerOk || !fs.existsSync(path.join(ACTIVE_BACKEND_DIR, 'vendor', 'autoload.php'))) {
    error('Composer install failed. Laravel vendor/ is missing.')
    error(`Try manually: cd engine/backend/${backendName} && composer update`)
    process.exit(1)
  }
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
    .replace(/DB_DATABASE=.*/,    `DB_DATABASE=${dbPath.replace(/\\/g, '/')}`)
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
        'tauri':          'engine/frontend/tauri',
        'electron':       'engine/frontend/electron',
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
  ✓ PLUFF SETUP COMPLETE

  Active Stack: ${activeStack}

  Web Stacks:
    engine/frontend/nextjs/         ← Next.js
    engine/frontend/react-vite/     ← React + Vite
    engine/frontend/react-inertia/  ← Inertia builder/watcher
    engine/frontend/astro/          ← Astro
    engine/frontend/tanstack-start/ ← TanStack Start

  Desktop:
    engine/frontend/tauri/          ← Tauri desktop shell
    engine/frontend/electron/       ← Electron desktop shell

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

  Packages: only the active web / app / desktop stacks are installed.
  Free space from unused frontends:
    node mizumi.js deps
    node setup.js --prune-unused
  `)
  divider()
}

// ─────────────────────────────────────────────
// RUN
// ─────────────────────────────────────────────

const cli = parseCli(process.argv.slice(2))

if (cli.help) {
  printSetupHelp()
  process.exit(0)
}

if (cli.depsStatus) {
  printDepsStatus()
  process.exit(0)
}

if (cli.backendOnly) {
  checkRequirements()
  setupBackend()
  process.exit(0)
}

if (cli.emptyInstall || cli.emptyUninstall) {
  error(cli.emptyInstall ? 'Usage: node setup.js --install <stack> [stack...]' : 'Usage: node setup.js --uninstall <stack> [stack...]')
  printSetupHelp()
  process.exit(1)
}

if (cli.install.length || cli.uninstall.length || cli.pruneUnused) {
  if (cli.install.length) {
    for (const stack of cli.install) {
      if (!FRONTEND_STACKS[stack]) { error(`Unknown stack: ${stack}`); process.exit(1) }
      installStack(stack, { force: cli.force })
    }
  }
  if (cli.uninstall.length) {
    for (const stack of cli.uninstall) {
      if (!FRONTEND_STACKS[stack]) { error(`Unknown stack: ${stack}`); process.exit(1) }
      uninstallStack(stack, { force: cli.force })
    }
  }
  if (cli.pruneUnused) pruneUnusedStacks({ force: cli.force })
  if (!cli.fullSetup) process.exit(0)
}

checkRequirements()
ensureStructure()
initRegistry()
setupFrontend()
if (activeDesktopStack) setupDesktopStack()
if (activeAppStack) setupAppStack()
setupBackend()
if (cli.pruneUnused) pruneUnusedStacks({ force: true })
printDone()