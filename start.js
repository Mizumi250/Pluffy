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

// Active stack — read from arkzen.json
const arkzenJson  = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'arkzen.json'), 'utf-8'))
const activeStack = arkzenJson.activeStack ?? 'nextjs'

// CHANGE 1: BACKEND_DIR is stack-aware — Inertia uses its own Laravel instance
const INERTIA_BACKEND_DIR = path.join(ENGINE_DIR, 'backend', 'laravel-inertia')
const BACKEND_DIR = activeStack === 'react-inertia'
  ? INERTIA_BACKEND_DIR
  : path.join(ENGINE_DIR, 'backend', 'laravel')

const FRONTEND_DIR = path.join(STACKS_DIR, activeStack)

function log(src, msg) {
  let prefix = ''
  if (src === 'frontend') prefix = '\x1b[36m[Frontend]  \x1b[0m'
  else if (src === 'backend') prefix = '\x1b[35m[Backend]  \x1b[0m'
  else if (src === 'queue') prefix = '\x1b[33m[Queue]    \x1b[0m'
  else if (src === 'reverb') prefix = '\x1b[35m[Reverb]   \x1b[0m'
  console.log(`${prefix} ${msg}`)
}

function checkSetup() {
  const artisan    = path.join(BACKEND_DIR, 'artisan')
  const nodeModules = path.join(FRONTEND_DIR, 'node_modules')

  if (!fs.existsSync(artisan)) {
    console.log('\n  ✗ Engine not set up yet. Run: node setup.js\n')
    process.exit(1)
  }

  if (!fs.existsSync(nodeModules)) {
    console.log('\n  ✗ Frontend packages not installed. Run: node setup.js\n')
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

// CHANGE 2: startFrontend() — Inertia needs TWO processes, Astro needs both astro dev + arkzen watcher
function startFrontend() {
  if (activeStack === 'react-inertia') {
    // Process 1: Vite runs FROM INSIDE laravel-inertia (serves React pages via Laravel Vite plugin)
    log('frontend', 'Starting Inertia Vite (laravel-inertia) on http://localhost:5173')
    const vite = spawn('npm', ['run', 'dev'], {
      cwd: BACKEND_DIR,  // laravel-inertia
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' },
    })

    vite.stdout.on('data', (data) => {
      String(data).trim().split('\n').forEach(line => {
        if (line.trim()) log('frontend', `[Vite] ${line.trim()}`)
      })
    })
    vite.stderr.on('data', (data) => {
      String(data).trim().split('\n').forEach(line => {
        if (line.trim()) log('frontend', `[Vite] ${line.trim()}`)
      })
    })
    vite.on('exit', (code) => {
      if (code !== 0) log('frontend', `[Vite] Exited with code ${code}`)
    })

    // Process 2: Builder watcher writes pages into laravel-inertia/resources/js/Pages/
    log('frontend', 'Starting Inertia builder watcher')
    const watcher = spawn('npm', ['run', 'watch'], {
      cwd: path.join(STACKS_DIR, 'react-inertia'),
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' },
    })

    watcher.stdout.on('data', (data) => {
      String(data).trim().split('\n').forEach(line => {
        if (line.trim()) log('frontend', `[Watcher] ${line.trim()}`)
      })
    })
    watcher.stderr.on('data', (data) => {
      String(data).trim().split('\n').forEach(line => {
        if (line.trim()) log('frontend', `[Watcher] ${line.trim()}`)
      })
    })
    watcher.on('exit', (code) => {
      if (code !== 0) log('frontend', `[Watcher] Exited with code ${code}`)
    })

    return [vite, watcher]
  }

  if (activeStack === 'astro') {
    // Astro: Run astro dev + arkzen watcher
    log('frontend', 'Starting Astro on http://localhost:3000')
    const astro = spawn('npm', ['run', 'dev'], {
      cwd: FRONTEND_DIR,
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' },
    })

    astro.stdout.on('data', (data) => {
      String(data).trim().split('\n').forEach(line => {
        if (line.trim()) log('frontend', `[Astro] ${line.trim()}`)
      })
    })
    astro.stderr.on('data', (data) => {
      String(data).trim().split('\n').forEach(line => {
        if (line.trim()) log('frontend', `[Astro] ${line.trim()}`)
      })
    })
    astro.on('exit', (code) => {
      if (code !== 0) log('frontend', `[Astro] Exited with code ${code}`)
    })

    return astro
  }

  // All other stacks (nextjs, react-vite, native)
  log('frontend', `Starting ${activeStack} on http://localhost:3000`)

  const proc = spawn('npm', ['run', 'dev'], {
    cwd: FRONTEND_DIR,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '1' },
  })

  proc.stdout.on('data', (data) => {
    String(data).trim().split('\n').forEach(line => {
      if (line.trim()) log('frontend', line.trim())
    })
  })

  proc.stderr.on('data', (data) => {
    String(data).trim().split('\n').forEach(line => {
      if (line.trim()) log('frontend', line.trim())
    })
  })

  proc.on('exit', (code) => {
    if (code !== 0) log('frontend', `Exited with code ${code}`)
  })

  return proc
}

console.log('\n╔════════════════════════════════════════╗')
console.log('║         ARKZEN ENGINE STARTING         ║')
console.log('╚════════════════════════════════════════╝\n')

checkSetup()

// Create storage symlink
const publicStorageLink = path.join(BACKEND_DIR, 'public', 'storage')
if (!fs.existsSync(publicStorageLink)) {
  try {
    require('child_process').execSync('php artisan storage:link --force', {
      cwd: BACKEND_DIR,
      stdio: 'pipe'
    })
    console.log('  ✓ Storage symlink created')
  } catch (e) {
    console.log('  ⚠ Storage symlink failed (run: php artisan storage:link)')
  }
}

const backend  = startBackend()
const queue    = startQueueWorker()
const reverb   = startReverb()
const frontend = startFrontend()

// CHANGE 3: .flat() handles both single process and [vite, watcher] array from Inertia
process.on('SIGINT', () => {
  console.log('\n\n  Shutting down Arkzen Engine...')
  ;[backend, queue, reverb, frontend].flat().forEach(p => p?.kill())
  process.exit(0)
})

// ── Stack switcher — triggered by: node arkzen.js switch <stack>
process.on('SIGUSR1', () => {
  const json     = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'arkzen.json'), 'utf-8'))
  const newStack = json.activeStack ?? 'nextjs'
  if (newStack === activeStack) {
    log('frontend', `Already on stack: ${activeStack}`)
    return
  }
  log('frontend', `Switching stack: ${activeStack} → ${newStack}...`)
  ;[frontend].flat().forEach(p => p?.kill())
  setTimeout(() => {
    const newFrontendDir = path.join(ENGINE_DIR, 'frontend', newStack)
    const newProc = spawn('npm', ['run', 'dev'], {
      cwd: newFrontendDir,
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' },
    })
    newProc.stdout.on('data', (data) => {
      String(data).trim().split('\n').forEach(line => {
        if (line.trim()) log('frontend', line.trim())
      })
    })
    newProc.stderr.on('data', (data) => {
      String(data).trim().split('\n').forEach(line => {
        if (line.trim()) log('frontend', line.trim())
      })
    })
    log('frontend', `✓ Switched to: ${newStack}`)
  }, 1000)
})

console.log('\n  Tatemonos folder: tatemonos/your-project/core.tsx')
console.log(`  Engine watches:   engine/frontend/${activeStack}/`)
console.log(`  Active stack:     ${activeStack} (change in arkzen.json or: node arkzen.js switch <stack>)`)
console.log('  Export project:   node export.js project-name\n')