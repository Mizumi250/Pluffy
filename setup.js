#!/usr/bin/env node

// ============================================================
// PLUFF — SETUP SCRIPT
// Run this ONCE to set up Pluff on your machine.
// Usage: node setup.js
//        node setup.js --backend [laravel|laravel-inertia]
// ============================================================

import { execSync, spawnSync } from 'node:child_process'
import os from 'node:os'
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
let activeDatabase = 'sqlite'
const arkzenJsonPath = path.join(ROOT_DIR, 'arkzen.json')
if (fs.existsSync(arkzenJsonPath)) {
  try {
    const json = JSON.parse(fs.readFileSync(arkzenJsonPath, 'utf-8'))
    activeStack    = json.activeStack    ?? 'nextjs'
    activeAppStack = json.activeAppStack ?? null
    activeDesktopStack = json.activeDesktopStack ?? null
    activeDatabase = json.activeDatabase === 'pgsql' ? 'pgsql' : 'sqlite'
  } catch {}
}

const DESKTOP_STACKS = ['tauri', 'electron']
const isDesktop = activeDesktopStack !== null && DESKTOP_STACKS.includes(activeDesktopStack)

// Stack → backend mapping (setupBackend can retarget this via useBackend)
const ACTIVE_BACKEND = activeStack === 'react-inertia' ? 'laravel-inertia' : 'laravel'
let backendName = ACTIVE_BACKEND
let ACTIVE_BACKEND_DIR = path.join(BACKEND_DIR, backendName)
function useBackend(name) {
  backendName = name
  ACTIVE_BACKEND_DIR = path.join(BACKEND_DIR, name)
}

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

// PHP backends — "installed" means composer vendor/ exists
const BACKEND_STACKS = {
  'laravel':         { category: 'backend', dir: path.join(BACKEND_DIR, 'laravel') },
  'laravel-inertia': { category: 'backend', dir: path.join(BACKEND_DIR, 'laravel-inertia') },
}
const ALL_DEP_STACKS = { ...FRONTEND_STACKS, ...BACKEND_STACKS }

function activeStackSet() {
  return new Set([activeStack, activeAppStack, activeDesktopStack, ACTIVE_BACKEND].filter(Boolean))
}

function cacheDirsFor(stack) {
  if (BACKEND_STACKS[stack]) {
    const dir = BACKEND_STACKS[stack].dir
    return [path.join(dir, 'vendor'), path.join(dir, 'node_modules')]
  }
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
  if (BACKEND_STACKS[stack]) return fs.existsSync(path.join(BACKEND_STACKS[stack].dir, 'vendor', 'autoload.php'))
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

function installBackend(name, { force = false } = {}) {
  if (stackInstalled(name) && !force) {
    success(`${name} already installed — skip (use --force to reinstall)`)
    return true
  }
  checkRequirements()
  useBackend(name)
  setupBackend()
  if (name === 'laravel-inertia' && activeStack === 'react-inertia') {
    const nm = path.join(ACTIVE_BACKEND_DIR, 'node_modules')
    if (!fs.existsSync(nm) || force) installNpm(ACTIVE_BACKEND_DIR, 'laravel-inertia')
  }
  return true
}

function installStack(stack, { force = false } = {}) {
  if (BACKEND_STACKS[stack]) return installBackend(stack, { force })
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
  const meta = ALL_DEP_STACKS[stack]
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
  else success(`${stack} had no ${BACKEND_STACKS[stack] ? 'vendor / node_modules' : 'node_modules / cache'} to remove`)
  if (freed > 0 && BACKEND_STACKS[stack]) console.log(`  · .env, database and app code kept. Reinstall: node setup.js --install ${stack}`)
  return freed
}

function printDepsStatus() {
  divider()
  console.log('\n  Package status (frontend node_modules + backend vendor)\n')
  const keep = activeStackSet()
  let total = 0
  let unused = 0
  for (const [stack, meta] of Object.entries(ALL_DEP_STACKS)) {
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
  log('Pruning deps for stacks that are not active...')
  let freed = 0
  for (const stack of Object.keys(ALL_DEP_STACKS)) {
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
    } else if (a === '--backend' || a === 'backend' || a.startsWith('--backend=')) {
      flags.backendOnly = true
      flags.fullSetup = false
      if (a.includes('=')) flags.backendName = a.split('=')[1]
      else if (argv[i + 1] && !argv[i + 1].startsWith('-')) flags.backendName = argv[++i]
    } else if (a === '--database' || a === 'database') {
      flags.databaseOnly = true
      flags.fullSetup = false
    } else if (a === '--help' || a === '-h') {
      flags.help = true
      flags.fullSetup = false
    }
  }
  if (flags.install.length || flags.uninstall.length || flags.pruneUnused || flags.depsStatus || flags.backendOnly || flags.databaseOnly) {
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
    node setup.js --backend                    (active backend)
    node setup.js --backend laravel-inertia
    node setup.js --database          (apply sqlite / pgsql from arkzen.json to installed backends)

  Package manager:
    node setup.js --deps-status
    node setup.js --install nextjs expo electron laravel
    node setup.js --uninstall astro react-vite tanstack-start laravel-inertia
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

// ─────────────────────────────────────────────
// DATABASE (sqlite | pgsql) — arkzen.json "activeDatabase"
// Each tatemono gets its own isolated database either way:
//   sqlite → database/arkzen/<name>.sqlite
//   pgsql  → Postgres database <ARKZEN_DB_PREFIX>_<name>
// ─────────────────────────────────────────────

function getEnvValue(content, key) {
  const m = content.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return m ? m[1].trim().replace(/^"(.*)"$/, '$1') : null
}

function setEnvValue(content, key, value) {
  const re   = new RegExp(`^#?[ \\t]*${key}=.*$`, 'm')
  const safe = value !== null && /[\s#"']/.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value
  const line = value === null ? `# ${key}=` : `${key}=${safe}`
  return re.test(content) ? content.replace(re, () => line) : `${content.replace(/\s*$/, '')}\n${line}\n`
}

function phpHasExtension(name) {
  try {
    return execSync('php -m', { encoding: 'utf-8' }).toLowerCase().split(/\r?\n/).map(l => l.trim()).includes(name)
  } catch {
    return false
  }
}

function pgSettings(envContent) {
  const wasPg = getEnvValue(envContent, 'DB_CONNECTION') === 'pgsql'
  const cur   = key => (wasPg ? getEnvValue(envContent, key) : null)
  return {
    host:     process.env.PLUFF_DB_HOST     || cur('DB_HOST')     || '127.0.0.1',
    port:     process.env.PLUFF_DB_PORT     || cur('DB_PORT')     || '5432',
    database: process.env.PLUFF_DB_DATABASE || cur('DB_DATABASE') || 'pluff',
    username: process.env.PLUFF_DB_USERNAME || cur('DB_USERNAME') || 'postgres',
    password: process.env.PLUFF_DB_PASSWORD ?? cur('DB_PASSWORD') ?? '',
  }
}

function ensurePgDatabase(pg) {
  const script = path.join(os.tmpdir(), `pluff-pg-${process.pid}.php`)
  fs.writeFileSync(script, `<?php
try {
    $pdo = new PDO('pgsql:host=' . getenv('PG_HOST') . ';port=' . getenv('PG_PORT') . ';dbname=postgres',
        getenv('PG_USER'), getenv('PG_PASS'), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $db = getenv('PG_DB');
    $st = $pdo->prepare('select 1 from pg_database where datname = ?');
    $st->execute([$db]);
    if ($st->fetchColumn()) { echo "exists"; exit(0); }
    $pdo->exec('create database "' . str_replace('"', '""', $db) . '"');
    echo "created";
} catch (Throwable $e) {
    fwrite(STDERR, $e->getMessage());
    exit(1);
}
`)
  const res = spawnSync('php', [script], {
    encoding: 'utf-8',
    env: { ...process.env, PG_HOST: pg.host, PG_PORT: pg.port, PG_USER: pg.username, PG_PASS: pg.password, PG_DB: pg.database },
  })
  fs.rmSync(script, { force: true })
  if (res.status === 0) {
    success(`Postgres database "${pg.database}" ${res.stdout.trim() === 'created' ? 'created' : 'ready'}`)
    return true
  }
  error(`Could not connect to PostgreSQL at ${pg.host}:${pg.port} as "${pg.username}"`)
  error((res.stderr || res.error?.message || '').trim())
  error('Is PostgreSQL running and is the password right? Re-enter it with: node mizumi.js db postgresql')
  return false
}

function configureDatabase() {
  const envPath = path.join(ACTIVE_BACKEND_DIR, '.env')
  let env = fs.readFileSync(envPath, 'utf-8')

  if (activeDatabase === 'pgsql') {
    if (!phpHasExtension('pdo_pgsql')) {
      error('PHP extension pdo_pgsql is not enabled.')
      error('Enable it in php.ini (remove the ";"):  extension=pdo_pgsql  and  extension=pgsql')
      process.exit(1)
    }
    const pg = pgSettings(env)
    env = setEnvValue(env, 'DB_CONNECTION', 'pgsql')
    env = setEnvValue(env, 'DB_HOST', pg.host)
    env = setEnvValue(env, 'DB_PORT', pg.port)
    env = setEnvValue(env, 'DB_DATABASE', pg.database)
    env = setEnvValue(env, 'DB_USERNAME', pg.username)
    env = setEnvValue(env, 'DB_PASSWORD', pg.password)
    env = setEnvValue(env, 'ARKZEN_DB_DRIVER', 'pgsql')
    fs.writeFileSync(envPath, env)
    success(`.env configured for PostgreSQL (${pg.username}@${pg.host}:${pg.port}/${pg.database})`)
    if (!ensurePgDatabase(pg)) process.exit(1)
    return
  }

  const dbPath = path.join(ACTIVE_BACKEND_DIR, 'database', 'database.sqlite')
  env = setEnvValue(env, 'DB_CONNECTION', 'sqlite')
  env = setEnvValue(env, 'DB_HOST', null)
  env = setEnvValue(env, 'DB_PORT', null)
  env = setEnvValue(env, 'DB_DATABASE', dbPath.replace(/\\/g, '/'))
  env = setEnvValue(env, 'DB_USERNAME', null)
  env = setEnvValue(env, 'DB_PASSWORD', null)
  env = setEnvValue(env, 'ARKZEN_DB_DRIVER', 'sqlite')
  fs.writeFileSync(envPath, env)
  success('.env configured for SQLite')

  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    fs.writeFileSync(dbPath, '')
    success('SQLite database file created')
  }
}

function setupBackend() {
  divider()
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

  // Gitignored dirs Laravel needs before composer's package:discover runs
  for (const dir of [
    ['bootstrap', 'cache'],
    ['storage', 'framework', 'cache', 'data'],
    ['storage', 'framework', 'sessions'],
    ['storage', 'framework', 'views'],
    ['storage', 'logs'],
  ]) {
    fs.mkdirSync(path.join(ACTIVE_BACKEND_DIR, ...dir), { recursive: true })
  }

  const envPath   = path.join(ACTIVE_BACKEND_DIR, '.env')
  const envExPath = path.join(ACTIVE_BACKEND_DIR, '.env.example')

  if (!fs.existsSync(envPath) && fs.existsSync(envExPath)) {
    fs.copyFileSync(envExPath, envPath)
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

  if (/^APP_KEY=base64:/m.test(fs.readFileSync(envPath, 'utf-8'))) {
    success('App key already set')
  } else {
    log('Generating Laravel app key...')
    run('php artisan key:generate --force', ACTIVE_BACKEND_DIR)
    success('App key generated')
  }

  let envContent = fs.readFileSync(envPath, 'utf-8')
  if (!envContent.includes('ARKZEN_ENGINE_SECRET')) {
    envContent += '\nARKZEN_ENGINE_SECRET=arkzen-secret-123\n'
    fs.writeFileSync(envPath, envContent)
  }

  configureDatabase()

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
  if (cli.backendName && !BACKEND_STACKS[cli.backendName]) {
    error(`Unknown backend: ${cli.backendName} (use: ${Object.keys(BACKEND_STACKS).join(', ')})`)
    process.exit(1)
  }
  checkRequirements()
  useBackend(cli.backendName ?? ACTIVE_BACKEND)
  setupBackend()
  process.exit(0)
}

if (cli.databaseOnly) {
  divider()
  log(`Database: ${activeDatabase === 'pgsql' ? 'PostgreSQL' : 'SQLite'} (one isolated database per tatemono)`)
  const installed = Object.keys(BACKEND_STACKS).filter(name =>
    fs.existsSync(path.join(BACKEND_STACKS[name].dir, 'vendor', 'autoload.php')) &&
    fs.existsSync(path.join(BACKEND_STACKS[name].dir, '.env')))
  if (!installed.length) {
    warn(`No backend installed yet. The database is applied when you run: node mizumi.js deps install ${ACTIVE_BACKEND}`)
    process.exit(0)
  }
  for (const name of installed) {
    useBackend(name)
    log(`Applying to ${name}...`)
    configureDatabase()
    run('php artisan config:clear', ACTIVE_BACKEND_DIR)
    run('php artisan migrate --force', ACTIVE_BACKEND_DIR)
  }
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
      if (!ALL_DEP_STACKS[stack]) { error(`Unknown stack: ${stack}`); process.exit(1) }
      installStack(stack, { force: cli.force })
    }
  }
  if (cli.uninstall.length) {
    for (const stack of cli.uninstall) {
      if (!ALL_DEP_STACKS[stack]) { error(`Unknown stack: ${stack}`); process.exit(1) }
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