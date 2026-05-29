#!/usr/bin/env node

// ============================================================
// ARKZEN ENGINE — START SCRIPT
// Starts the Arkzen Engine (frontend + backend + queue worker + reverb)
// Usage: node start.js
// ============================================================

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const ROOT_DIR   = __dirname
const ENGINE_DIR = path.join(ROOT_DIR, 'engine')
const STACKS_DIR = path.join(ENGINE_DIR, 'frontend')

// Active stacks — read from arkzen.json
const arkzenJson  = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'arkzen.json'), 'utf-8'))
const activeStack    = arkzenJson.activeStack    ?? 'nextjs'    // web stack
const activeAppStack = arkzenJson.activeAppStack ?? 'expo'      // app stack
const hasAppStack    = !!arkzenJson.activeAppStack

// Backend dir — Inertia uses its own Laravel instance
const INERTIA_BACKEND_DIR = path.join(ENGINE_DIR, 'backend', 'laravel-inertia')
const BACKEND_DIR = activeStack === 'react-inertia'
  ? INERTIA_BACKEND_DIR
  : path.join(ENGINE_DIR, 'backend', 'laravel')

const WEB_DIR = path.join(STACKS_DIR, activeStack)
const APP_DIR = path.join(STACKS_DIR, activeAppStack)

function log(src, msg) {
  let prefix = ''
  if      (src === 'frontend') prefix = '\x1b[36m[Frontend]  \x1b[0m'
  else if (src === 'backend')  prefix = '\x1b[35m[Backend]   \x1b[0m'
  else if (src === 'queue')    prefix = '\x1b[33m[Queue]     \x1b[0m'
  else if (src === 'reverb')   prefix = '\x1b[35m[Reverb]    \x1b[0m'
  else if (src === 'app')      prefix = '\x1b[32m[App]       \x1b[0m'
  console.log(`${prefix} ${msg}`)
}

function checkSetup() {
  const artisan = path.join(BACKEND_DIR, 'artisan')
  if (!fs.existsSync(artisan)) {
    console.log('\n  ✗ Engine not set up yet. Run: node setup.js\n')
    process.exit(1)
  }

  if (!fs.existsSync(path.join(WEB_DIR, 'node_modules'))) {
    console.log(`\n  ✗ Web stack packages not installed (${activeStack}). Run: node setup.js\n`)
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

  const spawnWorker = () => {
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
        log('queue', `Exited with code ${code}, restarting in 3 seconds...`)
        setTimeout(spawnWorker, 3000)
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

function startWebStack() {
  // ── REACT-INERTIA ─────────────────────────────────────────
  if (activeStack === 'react-inertia') {
    log('frontend', 'Starting Inertia Vite (laravel-inertia) on http://localhost:5173')
    const vite = spawn('npm', ['run', 'dev'], {
      cwd: BACKEND_DIR,
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' },
    })
    pipeLog('frontend', '[Vite]', vite)

    log('frontend', 'Starting Inertia builder watcher')
    const watcher = spawn('npm', ['run', 'watch'], {
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
    const astro = spawn('npm', ['run', 'dev'], {
      cwd: WEB_DIR,
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' },
    })
    pipeLog('frontend', '[Astro]', astro)
    return astro
  }

  // ── ALL OTHER WEB STACKS (nextjs, react-vite, tanstack-start) ─
  log('frontend', `Starting ${activeStack} on http://localhost:3000`)
  const proc = spawn('npm', ['run', 'dev'], {
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
  const watcher = spawn('npm', ['run', 'dev'], {
    cwd: APP_DIR,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '1' },
  })
  pipeLog('app', '[Watcher]', watcher)

  // Process 2: metro bundler
  log('app', `Starting ${activeAppStack} (Metro bundler) — scan QR with Expo Go`)
  const metro = spawn('npx', ['expo', 'start', '--clear', '--tunnel'], {
    cwd: APP_DIR,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '1' },
  })
  pipeLog('app', '[Metro]', metro)

  return [watcher, metro]
}

// ── BOOT ──────────────────────────────────────────────────────

console.log('\n╔════════════════════════════════════════╗')
console.log('║         ARKZEN ENGINE STARTING         ║')
console.log('╚════════════════════════════════════════╝\n')

checkSetup()

// Storage symlink
try {
  require('child_process').execSync('php artisan storage:link --force', {
    cwd: BACKEND_DIR,
    stdio: 'pipe'
  })
  console.log('  ✓ Storage symlink created/updated')
} catch (e) {
  console.log('  ⚠ Storage symlink failed (run: php artisan storage:link --force)')
}

// Start backend services
const backend = startBackend()
const queue   = startQueueWorker()
const reverb  = startReverb()

// Start web stack
const web = startWebStack()

// Start app stack (if configured)
let app = null
if (hasAppStack) {
  console.log(`  ✓ Starting app stack: ${activeAppStack}`)
  app = startAppStack()
}

// ── SHUTDOWN ──────────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n\n  Shutting down Arkzen Engine...')
  ;[backend, queue, reverb, web, app].flat().filter(Boolean).forEach(p => p?.kill())
  process.exit(0)
})

// ── FOOTER ────────────────────────────────────────────────────
console.log('\n  Tatemonos folder: tatemonos/your-project/core.tsx')
console.log(`  Web stack:        ${activeStack}  → engine/frontend/${activeStack}/`)
if (hasAppStack) {
  console.log(`  App stack:        ${activeAppStack}  → engine/frontend/${activeAppStack}/`)
}
console.log('  Export project:   node export.js project-name')
console.log('  Switch stacks:    node mizumi.js web / node mizumi.js app\n')
