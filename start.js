#!/usr/bin/env node

// ============================================================
// PLUFF — START SCRIPT
// Starts Pluff (frontend + backend + queue worker + reverb)
// Usage: node start.js
// ============================================================

import { execSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_DIR   = path.dirname(fileURLToPath(import.meta.url))
const ENGINE_DIR = path.join(ROOT_DIR, 'engine')
const STACKS_DIR = path.join(ENGINE_DIR, 'frontend')

// Active stacks — read from arkzen.json
const arkzenJson  = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'arkzen.json'), 'utf-8'))
const activeStack    = arkzenJson.activeStack    ?? 'nextjs'    // web stack
const activeAppStack = arkzenJson.activeAppStack ?? null        // app stack
const activeDesktopStack = arkzenJson.activeDesktopStack ?? null // desktop stack
const hasAppStack    = !!arkzenJson.activeAppStack

const DESKTOP_STACKS = ['tauri', 'electron']
const isDesktop = activeDesktopStack !== null && DESKTOP_STACKS.includes(activeDesktopStack)
const hasDesktopStack = isDesktop
const WEB_DEV_URL = activeStack === 'react-inertia' ? 'http://localhost:5173' : 'http://localhost:3000'

// Backend dir — Inertia uses its own Laravel instance
const INERTIA_BACKEND_DIR = path.join(ENGINE_DIR, 'backend', 'laravel-inertia')
const BACKEND_DIR = activeStack === 'react-inertia'
  ? INERTIA_BACKEND_DIR
  : path.join(ENGINE_DIR, 'backend', 'laravel')

const WEB_DIR = path.join(STACKS_DIR, activeStack)
const TAURI_DIR = path.join(STACKS_DIR, 'tauri')
const ELECTRON_DIR = path.join(STACKS_DIR, 'electron')
const APP_DIR = activeAppStack ? path.join(STACKS_DIR, activeAppStack) : null

function spawnCli(command, args, options) {
  if (process.platform === 'win32' && (command === 'npm' || command === 'npx')) {
    return spawn(process.env.ComSpec || 'cmd.exe', [
      '/d',
      '/s',
      '/c',
      `${command}.cmd ${args.join(' ')}`,
    ], options)
  }
  return spawn(command, args, options)
}

function log(src, msg) {
  let prefix = ''
  if      (src === 'frontend') prefix = '\x1b[36m[Frontend]  \x1b[0m'
  else if (src === 'backend')  prefix = '\x1b[35m[Backend]   \x1b[0m'
  else if (src === 'queue')    prefix = '\x1b[33m[Queue]     \x1b[0m'
  else if (src === 'reverb')   prefix = '\x1b[35m[Reverb]    \x1b[0m'
  else if (src === 'app')      prefix = '\x1b[32m[App]       \x1b[0m'
  else if (src === 'desktop')  prefix = '\x1b[34m[Desktop]   \x1b[0m'
  console.log(`${prefix} ${msg}`)
}

function checkSetup() {
  const artisan = path.join(BACKEND_DIR, 'artisan')
  if (!fs.existsSync(artisan)) {
    console.log('\n  ✗ Engine not set up yet. Run: node setup.js\n')
    process.exit(1)
  }

  if (!fs.existsSync(path.join(BACKEND_DIR, 'vendor', 'autoload.php'))) {
    console.log('\n  ✗ Laravel packages missing (vendor/autoload.php).')
    console.log('    Frontends were installed, but the PHP backend was not.')
    console.log('    Run:  node setup.js --backend\n')
    process.exit(1)
  }

  if (!fs.existsSync(path.join(WEB_DIR, 'node_modules'))) {
    console.log(`\n  ✗ Web stack packages not installed (${activeStack}). Run: node mizumi.js deps install ${activeStack}\n`)
    process.exit(1)
  }

  if (hasDesktopStack && activeDesktopStack === 'tauri' && !fs.existsSync(path.join(TAURI_DIR, 'node_modules'))) {
    console.log('\n  ✗ Tauri packages not installed. Run: node setup.js\n')
    process.exit(1)
  }

  if (hasDesktopStack && activeDesktopStack === 'electron' && !fs.existsSync(path.join(ELECTRON_DIR, 'node_modules'))) {
    console.log('\n  ✗ Electron packages not installed. Run: node setup.js\n')
    process.exit(1)
  }

  if (hasAppStack && !fs.existsSync(path.join(APP_DIR, 'node_modules'))) {
    console.log(`\n  ✗ App stack packages not installed (${activeAppStack}). Run: node setup.js\n`)
    process.exit(1)
  }
}

function startBackend() {
  log('backend', 'Starting Laravel on http://localhost:8000')

  const proc = spawn('php', ['artisan', 'serve', '--host=0.0.0.0', '--port=8000'], {
    cwd: BACKEND_DIR,
    stdio: 'pipe',
  })

  proc.stdout.on('data', (data) => {
    String(data).trim().split('\n').forEach(line => {
      if (line.trim()) log('backend', line.trim())
    })
  })
  proc.stderr.on('data', (data) => {
    String(data).trim().split('\n').forEach(line => {
      if (line.trim()) log('backend', line.trim())
    })
  })
  proc.on('exit', (code) => {
    if (code !== 0) log('backend', `Exited with code ${code}`)
  })

  return proc
}

function startQueueWorker() {
  log('queue', 'Starting queue worker (php artisan queue:work --queue=default,heavy --sleep=3 --tries=3)')

  let crashes = 0
  const spawnWorker = () => {
    const startedAt = Date.now()
    const proc = spawn('php', ['artisan', 'queue:work', '--queue=default,heavy', '--sleep=3', '--tries=3'], {
      cwd: BACKEND_DIR,
      stdio: 'pipe',
      env: process.env,
    })

    proc.stdout.on('data', (data) => {
      String(data).trim().split('\n').forEach(line => {
        if (line.trim()) log('queue', line.trim())
      })
    })
    proc.stderr.on('data', (data) => {
      String(data).trim().split('\n').forEach(line => {
        if (line.trim()) log('queue', line.trim())
      })
    })
    proc.on('exit', (code) => {
      if (code !== 0) {
        crashes += 1
        const instant = Date.now() - startedAt < 4000
        if (instant && crashes >= 3) {
          log('queue', 'Stopped restarting. Laravel is not booting — run: node setup.js --backend')
          return
        }
        log('queue', `Exited with code ${code}, restarting in 3 seconds...`)
        setTimeout(spawnWorker, 3000)
      } else {
        crashes = 0
      }
    })

    return proc
  }

  return spawnWorker()
}

function startReverb() {
  log('reverb', 'Starting Laravel Reverb WebSocket server on port 8080')

  const proc = spawn('php', ['artisan', 'reverb:start', '--host=0.0.0.0', '--port=8080', '--debug'], {
    cwd: BACKEND_DIR,
    stdio: 'pipe',
    env: process.env,
  })

  proc.stdout.on('data', (data) => {
    String(data).trim().split('\n').forEach(line => {
      if (line.trim()) log('reverb', line.trim())
    })
  })
  proc.stderr.on('data', (data) => {
    String(data).trim().split('\n').forEach(line => {
      if (line.trim()) log('reverb', line.trim())
    })
  })
  proc.on('exit', (code) => {
    if (code !== 0) log('reverb', `Exited with code ${code}`)
  })

  return proc
}

function pipeLog(src, tag, proc) {
  proc.stdout.on('data', (data) => {
    String(data).trim().split('\n').forEach(line => {
      if (line.trim()) log(src, `${tag} ${line.trim()}`)
    })
  })
  proc.stderr.on('data', (data) => {
    String(data).trim().split('\n').forEach(line => {
      if (line.trim()) log(src, `${tag} ${line.trim()}`)
    })
  })
  proc.on('exit', (code) => {
    if (code !== 0) log(src, `${tag} Exited with code ${code}`)
  })
}

function startDesktopStack() {
  const desktopEnv = {
    ...process.env,
    FORCE_COLOR: '1',
    DESKTOP_DEV_URL: WEB_DEV_URL,
  }

  if (activeDesktopStack === 'tauri') {
    log('desktop', `Starting Tauri window → ${WEB_DEV_URL}`)
    const tauri = spawnCli('npm', ['run', 'dev'], {
      cwd: TAURI_DIR,
      stdio: 'pipe',
      env: desktopEnv,
    })
    pipeLog('desktop', '[Tauri]', tauri)
    return tauri
  }

  log('desktop', `Starting Electron window → ${WEB_DEV_URL}`)
  const electron = spawnCli('npm', ['run', 'dev'], {
    cwd: ELECTRON_DIR,
    stdio: 'pipe',
    env: desktopEnv,
  })
  pipeLog('desktop', '[Electron]', electron)
  return electron
}

function startWebStack() {
  // ── REACT-INERTIA ─────────────────────────────────────────
  if (activeStack === 'react-inertia') {
    log('frontend', 'Starting Inertia Vite (laravel-inertia) on http://localhost:5173')
    const vite = spawnCli('npm', ['run', 'dev'], {
      cwd: BACKEND_DIR,
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' },
    })
    pipeLog('frontend', '[Vite]', vite)

    log('frontend', 'Starting Inertia builder watcher')
    const watcher = spawnCli('npm', ['run', 'watch'], {
      cwd: WEB_DIR,
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' },
    })
    pipeLog('frontend', '[Watcher]', watcher)

    return [vite, watcher]
  }

  // ── ASTRO ─────────────────────────────────────────────────
  if (activeStack === 'astro') {
    log('frontend', 'Starting Astro on http://localhost:3000')
    const astro = spawnCli('npm', ['run', 'dev'], {
      cwd: WEB_DIR,
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' },
    })
    pipeLog('frontend', '[Astro]', astro)
    return astro
  }

  // ── ALL OTHER WEB STACKS (nextjs, react-vite, tanstack-start) ─
  log('frontend', `Starting ${activeStack} on http://localhost:3000`)
  const proc = spawnCli('npm', ['run', 'dev'], {
    cwd: WEB_DIR,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '1' },
  })
  pipeLog('frontend', '', proc)
  return proc
}

function startAppStack() {
  // Process 1: sync shared core + start arkzen watcher
  // (dev script = "npm run sync:shared && npm run arkzen")
  log('app', `Starting ${activeAppStack} dev (sync + watcher)`)
  const watcher = spawnCli('npm', ['run', 'dev'], {
    cwd: APP_DIR,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '1' },
  })
  pipeLog('app', '[Watcher]', watcher)

  // Process 2: platform bundler / dev server — command differs per app stack
  // Expo:               `npx expo start`        (Metro — scan QR with Expo Go)
  // React Native (bare): `npx react-native start` (plain Metro — launch the
  //                       app separately with `npm run android` / `npm run ios`)
  // Lynx:                `npx rspeedy dev`        (Rsbuild dev server — scan QR
  //                       with the LynxExplorer app)
  let bundlerArgs
  let bundlerLabel
  const bundlerEnv = { ...process.env, FORCE_COLOR: '1' }

  if (activeAppStack === 'expo') {
    bundlerArgs  = ['expo', 'start', '--clear', '--lan']
    bundlerLabel = 'Metro bundler — scan QR with Expo Go'
  } else if (activeAppStack === 'lynx') {
    // Lynx's `npm run dev` already invokes rspeedy dev and binds the dev
    // server port — spawning a second `npx rspeedy dev` causes EADDRINUSE.
    // The watcher process IS the bundler for Lynx; nothing else to start.
    log('app', 'Lynx (Rspeedy dev server already running via watcher)')
    return [watcher]
  } else {
    bundlerArgs  = ['react-native', 'start']
    bundlerLabel = `run "npm run android" in another shell to launch the app`
  }

  log('app', `Starting ${activeAppStack} (${bundlerLabel})`)
  const bundler = spawnCli('npx', bundlerArgs, {
    cwd: APP_DIR,
    stdio: 'pipe',
    env: bundlerEnv,
  })
  pipeLog('app', '[Bundler]', bundler)

  return [watcher, bundler]
}

// ── BOOT ──────────────────────────────────────────────────────

console.log('\n╔════════════════════════════════════════╗')
console.log('║            PLUFF STARTING              ║')
console.log('╚════════════════════════════════════════╝\n')

checkSetup()

// Storage symlink
try {
  execSync('php artisan storage:link --force', {
    cwd: BACKEND_DIR,
    stdio: 'pipe'
  })
  console.log('  ✓ Storage symlink created/updated')
} catch (e) {
  console.log('  ⚠ Storage symlink failed (run: php artisan storage:link --force)')
}

// Start backend services for the web stack (app + desktop run alongside it)
let backend = null
let queue = null
let reverb = null
backend = startBackend()
queue   = startQueueWorker()
reverb  = startReverb()

// Start web stack
const web = startWebStack()

// Start app stack (if configured)
let app = null
if (hasAppStack) {
  console.log(`  ✓ Starting app stack: ${activeAppStack}`)
  app = startAppStack()
}

// Start desktop shell (if configured) — wraps the running web URL
let desktop = null
if (hasDesktopStack) {
  console.log(`  ✓ Starting desktop stack: ${activeDesktopStack}`)
  desktop = startDesktopStack()
}

// ── SHUTDOWN ──────────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n\n  Shutting down Pluff...')
  ;[backend, queue, reverb, web, app, desktop].flat().filter(Boolean).forEach(p => p?.kill())
  process.exit(0)
})

// ── FOOTER ────────────────────────────────────────────────────
console.log('\n  Tatemonos folder: tatemonos/your-project/core.tsx')
console.log(`  Web stack:        ${activeStack}  → engine/frontend/${activeStack}/  (${WEB_DEV_URL})`)
if (hasAppStack) {
  console.log(`  App stack:        ${activeAppStack}  → engine/frontend/${activeAppStack}/`)
}
if (hasDesktopStack) {
  console.log(`  Desktop stack:    ${activeDesktopStack}  → engine/frontend/${activeDesktopStack}/`)
}
console.log('  Export project:   node export.js project-name')
console.log('  Switch stacks:    node mizumi.js web / node mizumi.js app / node mizumi.js desktop\n')