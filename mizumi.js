#!/usr/bin/env node

// ============================================================
//  みずみ CLI — PLUFF
//  Interactive prompt selector + direct command mode
//  Usage:
//    node mizumi.js              ← interactive picker
//    node mizumi.js start        ← start engine


//    node mizumi.js setup
//    node mizumi.js export <name>
//    node mizumi.js web <stack>  ← switch web stack
//    node mizumi.js app <stack>  ← switch app stack
//    node mizumi.js desktop <stack> ← switch desktop stack
//    node mizumi.js backend <name> ← switch active backend (laravel, express, fastapi, django, spring-boot, aspnet)
//    node mizumi.js deps         ← install / uninstall node_modules
//    node mizumi.js stack        ← show active web + app + desktop stack + backend + database
//    node mizumi.js stacks       ← list all stacks
//    node mizumi.js modules      ← list registered tatemonos
//    node mizumi.js ai           ← Pluffy AI (checkbox options, then your app idea)
//    node mizumi.js scan         ← scan tatemonos into training data
//    node mizumi.js chat         ← open the Pluffy chat window (Electron)
// ============================================================

import { spawn } from 'node:child_process'
import readline from 'node:readline'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_DIR  = path.dirname(fileURLToPath(import.meta.url))
const JSON_PATH = path.join(ROOT_DIR, 'arkzen.json')

// ─── KAOMOJI POOL ─────────────────────────────────────────────
const KAOMOJI_BANNER  = ['(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧','(｡◕‿◕｡)','(*＾▽＾)／','(ﾉ´ヮ`)ﾉ*: ･ﾟ','٩(◕‿◕｡)۶','(づ｡◕‿‿◕｡)づ','✧ヽ(◕ヮ◕ヽ)','(ง •̀_•́)ง']
const KAOMOJI_SUCCESS = ['(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧','٩(◕‿◕｡)۶','(*＾▽＾)／','(づ｡◕‿‿◕｡)づ']
const KAOMOJI_ERROR   = ['(╥﹏╥)','(；一_一)','(>_<)','｡ﾟ(ﾟ´Д｀ﾟ)ﾟ｡']
const KAOMOJI_WAIT    = ['(￣▽￣)ノ','(・・;)','(＞﹏＜)','(・_・;)']
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

// ─── COLORS ───────────────────────────────────────────────────
const c = {
  reset:'\x1b[0m', bold:'\x1b[1m', dim:'\x1b[2m',
  cyan:'\x1b[36m', magenta:'\x1b[35m', yellow:'\x1b[33m',
  green:'\x1b[32m', red:'\x1b[31m', blue:'\x1b[34m',
  white:'\x1b[97m', gray:'\x1b[90m',
}
const paint = (color, str) => `${color}${str}${c.reset}`

// ─── LOGGING ──────────────────────────────────────────────────
const log     = msg => console.log(`  ${paint(c.cyan,    '✦')} ${msg}`)
const success = msg => console.log(`  ${paint(c.green,   '✓')} ${msg} ${paint(c.gray, pick(KAOMOJI_SUCCESS))}`)
const error   = msg => console.log(`  ${paint(c.red,     '✗')} ${msg} ${paint(c.gray, pick(KAOMOJI_ERROR))}`)
const warn    = msg => console.log(`  ${paint(c.yellow,  '⚠')} ${msg}`)
const info    = msg => console.log(`  ${paint(c.gray,    '·')} ${msg}`)
const divider = ()  => console.log(`\n${paint(c.gray, '  ' + '─'.repeat(46))}\n`)

// ─── ARKZEN.JSON ──────────────────────────────────────────────
function readConfig() {
  try { return JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8')) }
  catch { return { engine: '?', activeStack: 'nextjs', activeAppStack: 'expo', activeDesktopStack: null, activeBackend: 'laravel', modules: [], stacks: {} } }
}
function writeConfig(config) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

// ─── STACKS ───────────────────────────────────────────────────
const WEB_STACKS = {
  'nextjs':         'engine/frontend/nextjs',
  'react-vite':     'engine/frontend/react-vite',
  'react-inertia':  'engine/frontend/react-inertia',
  'astro':          'engine/frontend/astro',
  'tanstack-start': 'engine/frontend/tanstack-start',
}
const APP_STACKS = {
  'expo':         'engine/frontend/expo',
  'react-native': 'engine/frontend/react-native',
  'lynx':         'engine/frontend/lynx',
}
const DESKTOP_STACKS = {
  'tauri':    'engine/frontend/tauri',
  'electron': 'engine/frontend/electron',
}
const WEB_LABELS = {
  'nextjs':         'Next.js',
  'react-vite':     'React + Vite',
  'react-inertia':  'React + Inertia (Laravel monolith)',
  'astro':          'Astro',
  'tanstack-start': 'TanStack Start',
}
const APP_LABELS = {
  'expo':         'Expo (SDK 53, Expo Go)',
  'react-native': 'React Native (bare)',
  'lynx':         'Lynx (Rspeedy / ReactLynx)',
}
const DESKTOP_LABELS = {
  'tauri':    'Tauri desktop (wraps the running web stack)',
  'electron': 'Electron desktop (wraps the running web stack)',
}
// Backends that setup.js / deps know how to install today (laravel via composer, express via npm).
const BACKEND_STACKS = {
  'laravel':         'engine/backend/laravel',
  'laravel-inertia': 'engine/backend/laravel-inertia',
  'express':         'engine/backend/express',
}
// Backends you can select as the active one (arkzen.json "activeBackend").
// `variant` is the DSL block suffix the backend reads (names not final, see TEMP_PLUFF_FEATURE_PLAN.md).
// laravel-inertia is not listed: it is forced whenever the web stack is react-inertia.
const BACKEND_TARGETS = {
  'laravel':     { dir: 'engine/backend/laravel',     variant: 'php',  label: 'Laravel (PHP), reference backend' },
  'express':     { dir: 'engine/backend/express',     variant: 'ts',   label: 'Express (TypeScript)' },
  'fastapi':     { dir: 'engine/backend/fastapi',     variant: 'py',   label: 'FastAPI (Python)' },
  'django':      { dir: 'engine/backend/django',      variant: 'py',   label: 'Django (Python)' },
  'spring-boot': { dir: 'engine/backend/spring-boot', variant: 'java', label: 'Spring Boot (Java)' },
  'aspnet':      { dir: 'engine/backend/aspnet',      variant: 'cs',   label: 'ASP.NET Core (C#)' },
}
const BACKEND_ALIASES = {
  php: 'laravel', node: 'express', ts: 'express', spring: 'spring-boot', java: 'spring-boot',
  'asp.net': 'aspnet', dotnet: 'aspnet', csharp: 'aspnet', cs: 'aspnet',
}
const BACKEND_LABELS = {
  'laravel':         'Laravel backend (API for web stacks)',
  'laravel-inertia': 'Laravel + Inertia backend (react-inertia)',
  'express':         BACKEND_TARGETS['express'].label,
  'fastapi':         BACKEND_TARGETS['fastapi'].label,
  'django':          BACKEND_TARGETS['django'].label,
  'spring-boot':     BACKEND_TARGETS['spring-boot'].label,
  'aspnet':          BACKEND_TARGETS['aspnet'].label,
}
const DATABASES = {
  'sqlite': 'SQLite (one .sqlite file per tatemono)',
  'pgsql':  'PostgreSQL (one database per tatemono)',
}
const DB_ALIASES = { sqlite: 'sqlite', pgsql: 'pgsql', postgres: 'pgsql', postgresql: 'pgsql', pg: 'pgsql' }
// Effective backend: react-inertia forces laravel-inertia, otherwise arkzen.json "activeBackend" (default laravel).
const resolveBackend = config =>
  (config.activeStack ?? 'nextjs') === 'react-inertia'
    ? 'laravel-inertia'
    : (BACKEND_TARGETS[config.activeBackend] ? config.activeBackend : 'laravel')
const backendVariant = name => name === 'laravel-inertia' ? 'php' : (BACKEND_TARGETS[name]?.variant ?? '?')
const backendPath = name => {
  const rel = BACKEND_STACKS[name] ?? BACKEND_TARGETS[name]?.dir
  return rel ? path.join(ROOT_DIR, rel) : null
}
const ALL_STACKS = { ...WEB_STACKS, ...APP_STACKS, ...DESKTOP_STACKS, ...BACKEND_STACKS }
const ALL_LABELS = { ...WEB_LABELS, ...APP_LABELS, ...DESKTOP_LABELS, ...BACKEND_LABELS }

function stackDir(stack) {
  return ALL_STACKS[stack] ? path.join(ROOT_DIR, ALL_STACKS[stack]) : null
}

function isBackendBuilt(name) {
  const dir = backendPath(name)
  return !!(dir && fs.existsSync(dir))
}

function isBackendInstalled(name) {
  const dir = backendPath(name)
  if (!dir || !fs.existsSync(dir)) return false
  if (name === 'laravel' || name === 'laravel-inertia') return fs.existsSync(path.join(dir, 'vendor', 'autoload.php'))
  if (name === 'express') return fs.existsSync(path.join(dir, 'node_modules', 'tsx', 'dist', 'cli.mjs')) &&
    fs.existsSync(path.join(dir, 'node_modules', 'better-sqlite3', 'build', 'Release', 'better_sqlite3.node'))
  if (name === 'fastapi' || name === 'django') return fs.existsSync(path.join(dir, '.venv'))
  return true
}

function isStackInstalled(stack) {
  if (BACKEND_STACKS[stack]) return isBackendInstalled(stack)
  const dir = stackDir(stack)
  return !!(dir && fs.existsSync(path.join(dir, 'node_modules')))
}

function hintIfMissing(stack) {
  if (!stack || stack === 'none' || isStackInstalled(stack)) return
  info(`node_modules missing for ${stack}`)
  info(`Install: node mizumi.js deps install ${stack}`)
}

function runSetup(args, extraEnv = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['setup.js', ...args], { cwd: ROOT_DIR, stdio: 'inherit', env: { ...process.env, ...extraEnv } })
    child.on('exit', code => resolve(code ?? 1))
  })
}

// ─── BANNER ───────────────────────────────────────────────────
function printBanner() {
  const config   = readConfig()
  const webStack = config.activeStack    ?? 'nextjs'
  const appStack = config.activeAppStack ?? 'none'
  const deskStack = config.activeDesktopStack ?? 'none'
  const mods     = (config.modules ?? []).length
  const emoji    = pick(KAOMOJI_BANNER)

  console.log()
  console.log(paint(c.magenta, '  ╔══════════════════════════════════════════╗'))
  console.log(paint(c.magenta, '  ║') + paint(c.bold + c.white, '       ✦ アークゼン エンジン ✦            ') + paint(c.magenta, '║'))
  console.log(paint(c.magenta, '  ║') + paint(c.cyan,           `         みずみ CLI  v${config.engine ?? '1.0.0'}              `) + paint(c.magenta, '║'))
  console.log(paint(c.magenta, '  ╚══════════════════════════════════════════╝'))
  console.log()
  console.log(`  ${paint(c.gray, 'Web スタック:')}  ${paint(c.cyan + c.bold, webStack)}  ${paint(c.gray, WEB_LABELS[webStack] ?? '')}`)
  console.log(`  ${paint(c.gray, 'App スタック:')}  ${paint(c.green + c.bold, appStack)}  ${paint(c.gray, APP_LABELS[appStack] ?? '')}`)
  console.log(`  ${paint(c.gray, 'Desktop:')}       ${paint(c.magenta + c.bold, deskStack)}  ${paint(c.gray, DESKTOP_LABELS[deskStack] ?? '')}`)
  const backend = resolveBackend(config)
  const backendNote = !isBackendBuilt(backend) ? paint(c.red, '  (not built)') : (isBackendInstalled(backend) ? '' : paint(c.red, '  (deps missing)'))
  console.log(`  ${paint(c.gray, 'Backend:')}       ${paint(c.yellow + c.bold, backend)}  ${paint(c.gray, `:${backendVariant(backend)}`)}${backendNote}`)
  console.log(`  ${paint(c.gray, 'Database:')}      ${paint(c.cyan + c.bold, config.activeDatabase ?? 'sqlite')}  ${paint(c.gray, DATABASES[config.activeDatabase ?? 'sqlite'] ?? '')}`)
  console.log(`  ${paint(c.gray, 'モジュール:')}    ${paint(c.yellow, String(mods))} tatemonos`)
  console.log(`  ${paint(c.gray, emoji)}`)
  console.log()
}

// ─── PICKER ───────────────────────────────────────────────────
async function picker(question, options) {
  return new Promise((resolve) => {
    let idx = 0
    const total = options.length
    const LINES = total + 1

    const buildBlock = () => {
      const lines = []
      lines.push(`  ${paint(c.cyan + c.bold, '◆')} ${paint(c.white, question)}`)
      options.forEach((opt, i) => {
        const selected = i === idx
        const bullet   = selected ? paint(c.magenta + c.bold, '●') : paint(c.gray, '○')
        const label    = selected ? paint(c.white + c.bold, opt.label) : paint(c.gray, opt.label)
        const sub      = opt.sub ? paint(c.gray, `  ${opt.sub}`) : ''
        lines.push(`  ${bullet} ${label}${sub}`)
      })
      return lines
    }

    const firstDraw = () => buildBlock().forEach(line => process.stdout.write(line + '\n'))
    const redraw    = () => {
      process.stdout.write(`\x1b[${LINES}A`)
      buildBlock().forEach(line => process.stdout.write(`\x1b[2K${line}\n`))
    }

    const rl = readline.createInterface({ input: process.stdin })
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    firstDraw()

    process.stdin.on('data', function handler(key) {
      if      (key === '\u001b[A' || key === '\u001b[D') { idx = (idx - 1 + total) % total; redraw() }
      else if (key === '\u001b[B' || key === '\u001b[C') { idx = (idx + 1) % total; redraw() }
      else if (key === '\r' || key === '\n' || key === ' ') {
        process.stdin.removeListener('data', handler)
        process.stdin.setRawMode(false)
        rl.close()
        console.log()
        resolve(options[idx])
      } else if (key === '\u0003') {
        process.stdin.removeListener('data', handler)
        process.stdin.setRawMode(false)
        rl.close()
        console.log()
        console.log(`  ${paint(c.gray, 'またね！ (Bye!) (￣▽￣)ノ')}`)
        console.log()
        process.exit(0)
      }
    })
  })
}

// Multi-select: ↑/↓ move, SPACE toggles, ENTER confirms. Returns array of selected values.
async function checkboxPicker(question, options) {
  return new Promise((resolve) => {
    let idx = 0
    const total = options.length
    const LINES = total + 2
    const checked = options.map(o => !!o.checked)

    const buildBlock = () => {
      const lines = []
      lines.push(`  ${paint(c.cyan + c.bold, '◆')} ${paint(c.white, question)}`)
      options.forEach((opt, i) => {
        const here = i === idx
        const box  = checked[i] ? paint(c.green + c.bold, '[x]') : paint(c.gray, '[ ]')
        const ptr  = here ? paint(c.magenta + c.bold, '›') : ' '
        const label = here ? paint(c.white + c.bold, opt.label) : paint(c.gray, opt.label)
        const sub  = opt.sub ? paint(c.gray, `  ${opt.sub}`) : ''
        lines.push(`  ${ptr} ${box} ${label}${sub}`)
      })
      lines.push(`  ${paint(c.gray, '  space = toggle   enter = start')}`)
      return lines
    }

    const firstDraw = () => buildBlock().forEach(line => process.stdout.write(line + '\n'))
    const redraw    = () => {
      process.stdout.write(`\x1b[${LINES}A`)
      buildBlock().forEach(line => process.stdout.write(`\x1b[2K${line}\n`))
    }

    const rl = readline.createInterface({ input: process.stdin })
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    firstDraw()

    process.stdin.on('data', function handler(key) {
      if      (key === '\u001b[A') { idx = (idx - 1 + total) % total; redraw() }
      else if (key === '\u001b[B') { idx = (idx + 1) % total; redraw() }
      else if (key === ' ')        { checked[idx] = !checked[idx]; redraw() }
      else if (key === '\r' || key === '\n') {
        process.stdin.removeListener('data', handler)
        process.stdin.setRawMode(false)
        rl.close()
        console.log()
        resolve(options.filter((_, i) => checked[i]).map(o => o.value))
      } else if (key === '\u0003') {
        process.stdin.removeListener('data', handler)
        process.stdin.setRawMode(false)
        rl.close()
        console.log()
        console.log(`  ${paint(c.gray, 'またね！ (Bye!) (￣▽￣)ノ')}`)
        console.log()
        process.exit(0)
      }
    })
  })
}

// "Start engine" from the menu: choose which platforms to activate this run.
async function cmdStartPicker() {
  const config = readConfig()
  const options = [
    { label: 'Web',     sub: config.activeStack ?? 'nextjs',        value: 'web',     checked: true },
  ]
  if (config.activeAppStack)     options.push({ label: 'App',     sub: config.activeAppStack,     value: 'app',     checked: true })
  if (config.activeDesktopStack) options.push({ label: 'Desktop', sub: config.activeDesktopStack, value: 'desktop', checked: true })

  divider()
  const picked = await checkboxPicker('どのプラットフォーム？ Which platforms to activate?', options)
  if (picked.length === 0) { warn('Nothing selected — not starting.'); return }
  cmdStart([`--only=${picked.join(',')}`])
}

async function prompt(question, defaultVal = '') {
  return new Promise((resolve) => {
    const rl   = readline.createInterface({ input: process.stdin, output: process.stdout })
    const hint = defaultVal ? paint(c.gray, ` (${defaultVal})`) : ''
    rl.question(`  ${paint(c.cyan, '◆')} ${paint(c.white, question)}${hint}: `, (answer) => {
      rl.close()
      resolve(answer.trim() || defaultVal)
    })
  })
}

// ─── COMMANDS ─────────────────────────────────────────────────

function cmdStart(extraArgs = []) {
  console.log()
  log(`エンジン起動中... Starting Pluff ${paint(c.gray, pick(KAOMOJI_WAIT))}`)
  console.log()
  const child = spawn(process.execPath, ['start.js', ...extraArgs], { cwd: ROOT_DIR, stdio: 'inherit' })
  child.on('exit', code => { if (code !== 0) error(`Engine exited with code ${code}`) })
}

function cmdSetup() {
  console.log()
  log(`セットアップ中... Running setup ${paint(c.gray, pick(KAOMOJI_WAIT))}`)
  console.log()
  const child = spawn(process.execPath, ['setup.js'], { cwd: ROOT_DIR, stdio: 'inherit' })
  child.on('exit', code => {
    if (code === 0) success('Setup complete!')
    else error(`Setup exited with code ${code}`)
  })
}

async function cmdExport(tatName, stackArg) {
  const config = readConfig()

  // Step 1 — pick tatemono
  if (!tatName) {
    const modules = (config.modules ?? []).map(m => m.name)
    if (modules.length === 0) { warn('タテモノなし — No tatemonos registered yet.'); return }
    divider()
    const chosen = await picker('どのタテモノ？ Which tatemono to export?', modules.map(m => ({ label: m, value: m })))
    tatName = chosen.value
  }

  // Step 2 — pick platform (web, app, or desktop), Step 3 — pick stack for that platform
  // This is purely for export.js's --stack=<name> override — it does NOT
  // touch arkzen.json, so the live activeStack/activeAppStack/activeDesktopStack used by
  // `node start.js` / `node mizumi.js start` is left untouched.
  let stack = stackArg
  if (!stack) {
    divider()
    const platform = await picker('どのプラットフォーム？ Export for which platform?', [
      { label: 'Web',     sub: `current: ${config.activeStack ?? 'nextjs'}`,         value: 'web' },
      { label: 'App',     sub: `current: ${config.activeAppStack ?? 'expo'}`,        value: 'app' },
      { label: 'Desktop', sub: `current: ${config.activeDesktopStack ?? 'none'}`,    value: 'desktop' },
    ])

    const STACKS = platform.value === 'web' ? WEB_STACKS : (platform.value === 'app' ? APP_STACKS : DESKTOP_STACKS)
    const LABELS = platform.value === 'web' ? WEB_LABELS : (platform.value === 'app' ? APP_LABELS : DESKTOP_LABELS)
    const current = platform.value === 'web' ? (config.activeStack ?? 'nextjs') : (platform.value === 'app' ? (config.activeAppStack ?? 'expo') : (config.activeDesktopStack ?? 'none'))

    divider()
    const chosenStack = await picker(
      `${platform.value === 'web' ? 'Web' : platform.value === 'app' ? 'App' : 'Desktop'} スタック — Export with which stack?`,
      Object.entries(STACKS).map(([key]) => ({
        label: `${key === current ? '→ ' : '  '}${LABELS[key] ?? key}`,
        sub:   key === current ? '(active)' : key,
        value: key,
      }))
    )
    stack = chosenStack.value
  }

  console.log()
  log(`エクスポート中... Exporting ${paint(c.cyan, tatName)} ${paint(c.gray, `(${stack})`)} ${paint(c.gray, pick(KAOMOJI_WAIT))}`)
  console.log()
  const child = spawn(process.execPath, ['export.js', tatName, `--stack=${stack}`], { cwd: ROOT_DIR, stdio: 'inherit' })
  child.on('exit', code => {
    if (code === 0) success(`Exported → projects/${tatName}/  ${paint(c.gray, `(${stack})`)}`)
    else error(`Export failed with code ${code}`)
  })
}

async function cmdSwitchWeb(stackArg) {
  let stack = stackArg
  if (!stack) {
    const config  = readConfig()
    const current = config.activeStack ?? 'nextjs'
    divider()
    const chosen = await picker(
      'Web スタック切替 — Switch web stack?',
      Object.entries(WEB_STACKS).map(([key]) => ({
        label: `${key === current ? paint(c.cyan, '→ ') : '  '}${WEB_LABELS[key] ?? key}`,
        sub:   key === current ? paint(c.cyan, '(current)') : key,
        value: key,
      }))
    )
    stack = chosen.value
  }
  if (!WEB_STACKS[stack]) { error(`Unknown web stack: "${stack}"`); return }
  const stackDir = path.join(ROOT_DIR, WEB_STACKS[stack])
  if (!fs.existsSync(stackDir)) { error(`Stack not found at: ${WEB_STACKS[stack]}`); return }

  const config = readConfig()
  const prev   = config.activeStack ?? 'nextjs'
  if (prev === stack) { warn(`すでに ${stack} です — Already on web stack: ${stack}`); return }
  config.activeStack = stack
  writeConfig(config)
  success(`Web スタック切替完了！ ${paint(c.yellow, prev)} → ${paint(c.cyan + c.bold, stack)}`)
  if (stack === 'react-inertia' && (config.activeBackend ?? 'laravel') !== 'laravel') {
    warn(`react-inertia is a Laravel monolith. Backend runs as laravel-inertia while this stack is active (saved backend: ${config.activeBackend}).`)
  }
  hintIfMissing(stack)
  info(`Restart: node mizumi.js start  (runs web + app together)`)
}

async function cmdSwitchApp(stackArg) {
  let stack = stackArg
  if (!stack) {
    const config  = readConfig()
    const current = config.activeAppStack ?? 'none'
    divider()
    const chosen = await picker(
      'App スタック切替 — Switch app stack?',
      [
        ...Object.entries(APP_STACKS).map(([key]) => ({
          label: `${key === current ? paint(c.green, '→ ') : '  '}${APP_LABELS[key] ?? key}`,
          sub:   key === current ? paint(c.green, '(current)') : key,
          value: key,
        })),
        { label: 'None', sub: 'app off', value: 'none' },
      ]
    )
    stack = chosen.value
  }
  if (stack === 'none' || stack === 'off') {
    const config = readConfig()
    const prev = config.activeAppStack ?? 'none'
    config.activeAppStack = null
    writeConfig(config)
    success(`App スタックオフ！ ${paint(c.yellow, prev)} → ${paint(c.gray, 'none')}`)
    info(`Restart: node mizumi.js start  (runs web + desktop)`)
    return
  }
  if (!APP_STACKS[stack]) { error(`Unknown app stack: "${stack}"`); return }
  const stackDir = path.join(ROOT_DIR, APP_STACKS[stack])
  if (!fs.existsSync(stackDir)) { error(`Stack not found at: ${APP_STACKS[stack]}`); return }

  const config = readConfig()
  const prev   = config.activeAppStack ?? 'none'
  if (prev === stack) { warn(`すでに ${stack} です — Already on app stack: ${stack}`); return }
  config.activeAppStack = stack
  writeConfig(config)
  success(`App スタック切替完了！ ${paint(c.yellow, prev)} → ${paint(c.green + c.bold, stack)}`)
  hintIfMissing(stack)
  info(`Restart: node mizumi.js start  (runs web + app + desktop together)`)
}

async function cmdSwitchDesktop(stackArg) {
  let stack = stackArg
  if (!stack) {
    const config  = readConfig()
    const current = config.activeDesktopStack ?? 'none'
    divider()
    const chosen = await picker(
      'Desktop スタック切替 — Switch desktop stack?',
      [
        ...Object.entries(DESKTOP_STACKS).map(([key]) => ({
          label: `${key === current ? paint(c.cyan, '→ ') : '  '}${DESKTOP_LABELS[key] ?? key}`,
          sub:   key === current ? paint(c.cyan, '(current)') : key,
          value: key,
        })),
        { label: 'None', sub: 'desktop off', value: 'none' },
      ]
    )
    stack = chosen.value
  }
  if (stack === 'none' || stack === 'off') {
    const config = readConfig()
    const prev = config.activeDesktopStack ?? 'none'
    config.activeDesktopStack = null
    writeConfig(config)
    success(`Desktop スタックオフ！ ${paint(c.yellow, prev)} → ${paint(c.gray, 'none')}`)
    info(`Restart: node mizumi.js start  (runs web + app)`)
    return
  }
  if (!DESKTOP_STACKS[stack]) { error(`Unknown desktop stack: "${stack}"`); return }
  const stackDir = path.join(ROOT_DIR, DESKTOP_STACKS[stack])
  if (!fs.existsSync(stackDir)) { error(`Stack not found at: ${DESKTOP_STACKS[stack]}`); return }

  const config = readConfig()
  const prev   = config.activeDesktopStack ?? 'none'
  if (prev === stack) { warn(`すでに ${stack} です — Already on desktop stack: ${stack}`); return }
  config.activeDesktopStack = stack
  writeConfig(config)
  success(`Desktop スタック切替完了！ ${paint(c.yellow, prev)} → ${paint(c.magenta + c.bold, stack)}`)
  hintIfMissing(stack)
  info(`Restart: node mizumi.js start  (runs web + app + desktop together)`)
}

async function cmdSwitchBackend(backendArg) {
  const config  = readConfig()
  const current = config.activeBackend ?? 'laravel'
  let backend = backendArg ? backendArg.toLowerCase() : null
  if (backend && BACKEND_ALIASES[backend]) backend = BACKEND_ALIASES[backend]

  if (backend === 'laravel-inertia') {
    error('laravel-inertia is picked automatically when the web stack is react-inertia')
    return
  }
  if (backend && !BACKEND_TARGETS[backend]) {
    error(`Unknown backend: "${backendArg}" (use: ${Object.keys(BACKEND_TARGETS).join(', ')})`)
    return
  }
  if (!backend) {
    divider()
    const chosen = await picker('Backend 切替 — Which backend?',
      Object.entries(BACKEND_TARGETS).map(([key, t]) => ({
        label: `${key === current ? paint(c.yellow, '→ ') : '  '}${t.label}`,
        sub:   `${key}  :${t.variant}${key === current ? paint(c.yellow, '  (current)') : ''}${isBackendBuilt(key) ? '' : paint(c.red, '  (not built)')}`,
        value: key,
      }))
    )
    backend = chosen.value
  }

  const webStack = config.activeStack ?? 'nextjs'
  if (webStack === 'react-inertia' && backend !== 'laravel') {
    error('react-inertia is a Laravel monolith. Switch the web stack first: node mizumi.js web <stack>')
    return
  }
  if (current === backend) { warn(`すでに ${backend} です — Already on backend: ${backend}`); return }

  config.activeBackend = backend
  writeConfig(config)
  success(`Backend 切替完了！ ${paint(c.yellow, current)} → ${paint(c.yellow + c.bold, backend)}  ${paint(c.gray, `:${backendVariant(backend)}`)}`)
  if (!isBackendBuilt(backend)) {
    warn(`${BACKEND_TARGETS[backend].dir} does not exist yet (backend not built)`)
  } else if (!isBackendInstalled(backend)) {
    info(`Dependencies missing for ${backend}`)
  }
  if (backend === 'express') info('start.js and setup.js handle Express. export.js still targets Laravel.')
  else if (backend !== 'laravel') info('start.js refuses to run this backend until it is built')
  info(`Tatemonos without a :${backendVariant(backend)} variant will be inactive on this backend`)
}

function cmdStack() {
  const config   = readConfig()
  const webStack = config.activeStack    ?? 'nextjs'
  const appStack = config.activeAppStack ?? 'none'
  const desktopStack = config.activeDesktopStack ?? 'none'
  divider()
  console.log(`  ${paint(c.gray, 'Web スタック:')}  ${paint(c.cyan + c.bold, webStack)}  ${paint(c.gray, WEB_LABELS[webStack] ?? '')}`)
  console.log(`  ${paint(c.gray, 'App スタック:')}  ${paint(c.green + c.bold, appStack)}  ${paint(c.gray, APP_LABELS[appStack] ?? '')}`)
  console.log(`  ${paint(c.gray, 'Desktop スタック:')}  ${paint(c.magenta + c.bold, desktopStack)}  ${paint(c.gray, DESKTOP_LABELS[desktopStack] ?? '')}`)
  const backend = resolveBackend(config)
  console.log(`  ${paint(c.gray, 'Backend:')}  ${paint(c.yellow + c.bold, backend)}  ${paint(c.gray, `:${backendVariant(backend)}  ${BACKEND_LABELS[backend] ?? ''}`)}`)
  console.log(`  ${paint(c.gray, 'Database:')}  ${paint(c.cyan + c.bold, config.activeDatabase ?? 'sqlite')}  ${paint(c.gray, DATABASES[config.activeDatabase ?? 'sqlite'] ?? '')}`)
  divider()
}

function cmdStacks() {
  const config   = readConfig()
  const activeWeb = config.activeStack    ?? 'nextjs'
  const activeApp = config.activeAppStack ?? 'none'
  const activeDesktop = config.activeDesktopStack ?? 'none'
  divider()
  console.log(`  ${paint(c.white + c.bold, 'Web スタック:')}`)
  console.log()
  for (const [key, dir] of Object.entries(WEB_STACKS)) {
    const installed = fs.existsSync(path.join(ROOT_DIR, dir, 'node_modules'))
    const isCurrent = key === activeWeb
    const arrow  = isCurrent ? paint(c.cyan + c.bold, '→') : ' '
    const name   = isCurrent ? paint(c.cyan + c.bold, key.padEnd(18)) : paint(c.gray, key.padEnd(18))
    const status = installed ? paint(c.green, '✓') : paint(c.red, '✗')
    const tag    = isCurrent ? paint(c.cyan, ' (active)') : ''
    console.log(`  ${arrow} ${name} ${status}  ${paint(c.gray, WEB_LABELS[key] ?? '')}${tag}`)
  }
  console.log()
  console.log(`  ${paint(c.white + c.bold, 'App スタック:')}`)
  console.log()
  for (const [key, dir] of Object.entries(APP_STACKS)) {
    const installed = fs.existsSync(path.join(ROOT_DIR, dir, 'node_modules'))
    const isCurrent = key === activeApp
    const arrow  = isCurrent ? paint(c.green + c.bold, '→') : ' '
    const name   = isCurrent ? paint(c.green + c.bold, key.padEnd(18)) : paint(c.gray, key.padEnd(18))
    const status = installed ? paint(c.green, '✓') : paint(c.red, '✗')
    const tag    = isCurrent ? paint(c.green, ' (active)') : ''
    console.log(`  ${arrow} ${name} ${status}  ${paint(c.gray, APP_LABELS[key] ?? '')}${tag}`)
  }
  console.log()
  console.log(`  ${paint(c.white + c.bold, 'Desktop スタック:')}`)
  console.log()
  for (const [key, dir] of Object.entries(DESKTOP_STACKS)) {
    const installed = fs.existsSync(path.join(ROOT_DIR, dir, 'node_modules'))
    const isCurrent = key === activeDesktop
    const arrow  = isCurrent ? paint(c.magenta + c.bold, '→') : ' '
    const name   = isCurrent ? paint(c.magenta + c.bold, key.padEnd(18)) : paint(c.gray, key.padEnd(18))
    const status = installed ? paint(c.green, '✓') : paint(c.red, '✗')
    const tag    = isCurrent ? paint(c.magenta, ' (active)') : ''
    console.log(`  ${arrow} ${name} ${status}  ${paint(c.gray, DESKTOP_LABELS[key] ?? '')}${tag}`)
  }
  console.log()
  console.log(`  ${paint(c.white + c.bold, 'Backend:')}`)
  console.log()
  const activeBackend = resolveBackend(config)
  for (const key of [...Object.keys(BACKEND_TARGETS), 'laravel-inertia']) {
    const isCurrent = key === activeBackend
    const arrow  = isCurrent ? paint(c.yellow + c.bold, '→') : ' '
    const name   = isCurrent ? paint(c.yellow + c.bold, key.padEnd(18)) : paint(c.gray, key.padEnd(18))
    const status = isBackendInstalled(key) ? paint(c.green, '✓') : paint(c.red, '✗')
    const tag    = isCurrent ? paint(c.yellow, ' (active)') : ''
    const built  = isBackendBuilt(key) ? '' : paint(c.red, ' (not built)')
    console.log(`  ${arrow} ${name} ${status}  ${paint(c.gray, `:${backendVariant(key).padEnd(5)} ${BACKEND_LABELS[key] ?? ''}`)}${tag}${built}`)
  }
  divider()
}

async function cmdDeps(actionArg, stackArg) {
  const config = readConfig()
  const active = new Set([config.activeStack, config.activeAppStack, config.activeDesktopStack, resolveBackend(config)].filter(Boolean))
  const stackOptions = Object.keys(ALL_STACKS).map(key => ({
    label: `${isStackInstalled(key) ? '✓' : '✗'}  ${ALL_LABELS[key] ?? key}`,
    sub:   `${key}${active.has(key) ? '  (active)' : isStackInstalled(key) ? '  installed' : '  not installed'}`,
    value: key,
  }))

  let action = actionArg
  if (!action) {
    divider()
    const chosen = await picker('node_modules — install / free disk space?', [
      { label: 'Show disk usage',                 sub: 'which stacks are installed', value: 'status' },
      { label: 'Install a stack',                 sub: 'npm install (frontend, express) / composer install (laravel)', value: 'install' },
      { label: 'Uninstall a stack',               sub: 'delete node_modules (frontend, express) / vendor (laravel)', value: 'uninstall' },
      { label: 'Prune unused',                    sub: 'keep only active web + app + desktop + backend', value: 'prune' },
    ])
    action = chosen.value
  }

  if (action === 'status') {
    await runSetup(['--deps-status'])
    return
  }

  if (action === 'prune') {
    console.log()
    log('Removing deps from stacks that are not active...')
    info(`Keeping: ${[...active].join(', ') || '(none)'}`)
    await runSetup(['--prune-unused'])
    return
  }

  if (action === 'install' || action === 'uninstall') {
    let stack = stackArg
    if (!stack) {
      divider()
      const chosen = await picker(
        action === 'install' ? 'どのスタックをインストール？ Install which stack?' : 'どのスタックを削除？ Uninstall which stack?',
        stackOptions
      )
      stack = chosen.value
    }
    if (!ALL_STACKS[stack]) { error(`Unknown stack: "${stack}"`); return }
    if (action === 'uninstall' && active.has(stack)) {
      warn(`${stack} is active. Switch away first, or run: node setup.js --uninstall ${stack} --force`)
      return
    }
    console.log()
    const code = await runSetup(action === 'install' ? ['--install', stack] : ['--uninstall', stack])
    if (action === 'install' && code === 0) {
      const next = readConfig()
      if (APP_STACKS[stack] && !next.activeAppStack) {
        next.activeAppStack = stack
        writeConfig(next)
        success(`App stack was none — now using ${stack}`)
      }
      if (DESKTOP_STACKS[stack] && !next.activeDesktopStack) {
        next.activeDesktopStack = stack
        writeConfig(next)
        success(`Desktop stack was none — now using ${stack}`)
      }
    }
    return
  }

  error(`Unknown deps action: "${action}"`)
  info('Use: deps status | deps install <stack> | deps uninstall <stack> | deps prune')
}

function cmdModules() {
  const config  = readConfig()
  const modules = config.modules ?? []
  divider()
  console.log(`  ${paint(c.white + c.bold, 'タテモノ一覧 / Registered tatemonos:')}`)
  console.log()
  if (modules.length === 0) {
    warn('タテモノなし — No tatemonos registered yet.')
  } else {
    modules.forEach((m, i) => {
      const num    = paint(c.gray, String(i + 1).padStart(2) + '.')
      const name   = paint(c.cyan, m.name.padEnd(28))
      const status = m.status === 'active' ? paint(c.green, '● active') : paint(c.gray, '○ ' + (m.status ?? 'unknown'))
      const pages  = m.pages?.length ? paint(c.gray, `${m.pages.length} page${m.pages.length > 1 ? 's' : ''}`) : ''
      console.log(`  ${num} ${name} ${status}  ${pages}`)
    })
  }
  divider()
}

// ─── INTERACTIVE MENU ─────────────────────────────────────────
function readEnvFile(file) {
  const out = {}
  if (!fs.existsSync(file)) return out
  for (const line of fs.readFileSync(file, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) out[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1')
  }
  return out
}

async function cmdSwitchDatabase(dbArg) {
  let db = dbArg ? DB_ALIASES[dbArg.toLowerCase()] : null
  if (dbArg && !db) { error(`Unknown database: "${dbArg}" (use: sqlite, postgresql)`); return }
  const config  = readConfig()
  const current = config.activeDatabase ?? 'sqlite'
  if (!db) {
    divider()
    const chosen = await picker('Database 切替 — Which database?',
      Object.entries(DATABASES).map(([key, label]) => ({
        label: `${key === current ? paint(c.cyan, '→ ') : '  '}${label}`,
        sub:   key === current ? paint(c.cyan, '(current)') : key,
        value: key,
      }))
    )
    db = chosen.value
  }

  const env = {}
  if (db === 'pgsql') {
    const backend = resolveBackend(config)
    const cur     = readEnvFile(path.join(backendPath(backend), '.env'))
    const wasPg   = cur.DB_CONNECTION === 'pgsql'
    info('PostgreSQL connection — press Enter to keep the value in brackets')
    env.PLUFF_DB_HOST     = await prompt('Host', (wasPg && cur.DB_HOST) || '127.0.0.1')
    env.PLUFF_DB_PORT     = await prompt('Port', (wasPg && cur.DB_PORT) || '5432')
    env.PLUFF_DB_USERNAME = await prompt('Username', (wasPg && cur.DB_USERNAME) || 'postgres')
    const curPw           = (wasPg && cur.DB_PASSWORD) || ''
    env.PLUFF_DB_PASSWORD = (await prompt(curPw ? 'Password (Enter = keep current)' : 'Password', '')) || curPw
    env.PLUFF_DB_DATABASE = await prompt('Main database name', (wasPg && cur.DB_DATABASE) || 'pluff')
  }

  config.activeDatabase = db
  writeConfig(config)
  success(`Database 切替完了！ ${paint(c.yellow, current)} → ${paint(c.cyan + c.bold, db)}`)
  const code = await runSetup(['--database'], env)
  if (code === 0) info('Restart: node mizumi.js start  (each tatemono gets its database on the next build)')
}

// ─── AI + TRAINING DATA ───────────────────────────────────────
const AI_PREFS_PATH = path.join(ROOT_DIR, '.mizumi-ai.json')   // remembers your toggles (never the API key)
const AI_PERSIST    = ['ref', 'guide', 'tries', 'server', 'model']

// Each option = one pluffy-ai.js flag. `fixed` = on/off toggle, `ask` = needs a value.
const AI_OPTIONS = [
  { key: 'ref',    flag: '--ref',    label: 'Reference snippets', fixed: 'on',   sub: 'similar tatemono blocks + guideline section' },
  { key: 'guide',  flag: '--guide',  label: 'Full guideline',     fixed: 'full', sub: 'whole PLUFF_GUIDELINES in every request (needs num_ctx 32768)' },
  { key: 'tables', flag: '--tables', label: 'Set tables',         ask: 'Tables, e.g. tasks(title:string,done:boolean);notes(body:text)', sub: 'skip auto-plan' },
  { key: 'pages',  flag: '--pages',  label: 'Set pages',          ask: 'Pages, comma separated, e.g. index,admin' },
  { key: 'slug',   flag: '--slug',   label: 'Set tatemono name',  ask: 'Tatemono folder name (kebab-case)' },
  { key: 'tries',  flag: '--tries',  label: 'Retries per block',  ask: 'Max tries per block', def: '3' },
  { key: 'server', flag: '--server', label: 'Server URL',         ask: 'Model server URL (Colab tunnel URL or http://127.0.0.1:8080)' },
  { key: 'model',  flag: '--model',  label: 'Model name',         ask: 'Model name', def: 'pluffy-v11' },
  { key: 'key',    flag: '--key',    label: 'API key',            ask: 'API key', secret: true },
]

function runNode(script, scriptArgs = []) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script, ...scriptArgs], { cwd: ROOT_DIR, stdio: 'inherit' })
    child.on('exit', code => resolve(code ?? 1))
  })
}

function loadAiPrefs() {
  try { return JSON.parse(fs.readFileSync(AI_PREFS_PATH, 'utf8')) } catch { return {} }
}
function saveAiPrefs(sel) {
  const out = {}
  for (const k of AI_PERSIST) if (sel[k] !== undefined) out[k] = sel[k]
  try { fs.writeFileSync(AI_PREFS_PATH, JSON.stringify(out, null, 2) + '\n') } catch { /* not fatal */ }
}
const aiArgs = sel => AI_OPTIONS.filter(o => sel[o.key] !== undefined).flatMap(o => [o.flag, String(sel[o.key])])

// Numbered checkbox menu: type numbers (e.g. "1 2") to toggle, Enter to continue.
async function aiOptionsMenu(sel) {
  while (true) {
    console.log()
    console.log(`  ${paint(c.cyan + c.bold, '◆')} ${paint(c.white, 'AI options')} ${paint(c.gray, '— type numbers to toggle (e.g. 1 2), Enter to continue')}`)
    AI_OPTIONS.forEach((o, i) => {
      const on  = sel[o.key] !== undefined
      const box = on ? paint(c.green + c.bold, '[x]') : paint(c.gray, '[ ]')
      const val = on && !o.fixed ? paint(c.yellow, `  = ${o.secret ? '••••' : sel[o.key]}`) : ''
      const sub = o.sub ? paint(c.gray, `  ${o.sub}`) : ''
      console.log(`  ${paint(c.gray, String(i + 1).padStart(2))}. ${box} ${paint(on ? c.white : c.gray, o.label)} ${paint(c.gray, o.flag)}${val}${sub}`)
    })
    const ans = await prompt('Toggle')
    if (!ans) return sel
    for (const tok of ans.split(/[\s,]+/).filter(Boolean)) {
      const o = AI_OPTIONS[Number(tok) - 1]
      if (!o) { warn(`No option "${tok}"`); continue }
      if (o.fixed) {                                   // on/off checkbox
        if (sel[o.key] !== undefined) delete sel[o.key]; else sel[o.key] = o.fixed
        continue
      }
      const cur = sel[o.key] ?? o.def ?? ''            // value option: ask, "-" turns it off
      const v   = await prompt(`${o.ask} ${paint(c.gray, '(- = off)')}`, o.secret ? '' : cur)
      if (v === '-') delete sel[o.key]
      else if (v) sel[o.key] = v
    }
  }
}

async function cmdScan() {
  console.log()
  log(`訓練データをスキャン中... Scanning tatemonos for training data ${paint(c.gray, pick(KAOMOJI_WAIT))}`)
  console.log()
  if (!fs.existsSync(path.join(ROOT_DIR, 'scan.js'))) { error('scan.js not found in the repo root'); return }
  const code = await runNode('scan.js')
  console.log()
  if (code === 0) {
    success('Scan finished')
    info('Wrote: dataset.jsonl, block-dataset.jsonl, blocks.jsonl, descriptions.json, scan-report.txt')
    info('If the summary shows missing descriptions, fill them in descriptions.json and scan again.')
    info('If it says "Engine validator available: no", run: node mizumi.js deps install <your web stack>, then scan again.')
    info('Next: git push, then run Colab Cell 2 to train.')
  } else error(`scan.js exited with code ${code}`)
}

// `mizumi ai`                         → options menu + request loop
// `mizumi ai "an idea" --ref on ...`  → straight to pluffy-ai.js with your flags
async function cmdAi(rest = []) {
  if (!fs.existsSync(path.join(ROOT_DIR, 'pluffy-ai.js'))) { error('pluffy-ai.js not found in the repo root'); return }
  if (rest.length) { process.exitCode = await runNode('pluffy-ai.js', rest); return }

  const sel = loadAiPrefs()
  divider()
  info('Start the model first (Colab Cell 1 prints the server URL), then set it below.')
  while (true) {
    await aiOptionsMenu(sel)
    saveAiPrefs(sel)
    const idea = await prompt('アイデア What should the AI build? (blank = back)')
    if (!idea) return
    console.log()
    const code = await runNode('pluffy-ai.js', [idea, ...aiArgs(sel)])
    console.log()
    if (code === 0) success('Done — check the Engine validator line above')
    else error(`pluffy-ai.js exited with code ${code} (is the model server running and the URL right?)`)
    for (const k of ['tables', 'pages', 'slug']) delete sel[k]   // per-request options reset
    divider()
  }
}

// `mizumi review`                       → asks folder / task / mode, then runs pluffy-review.js
// `mizumi review engine --task "..."`   → straight to pluffy-review.js with your flags
// A SECOND (hosted) model reviews the repo. Config: .pluffy-review.json or PLUFFY_REVIEW_* env vars.
async function cmdReview(rest = []) {
  if (!fs.existsSync(path.join(ROOT_DIR, 'pluffy-review.js'))) { error('pluffy-review.js not found in the repo root'); return }
  if (rest.length) { process.exitCode = await runNode('pluffy-review.js', rest); return }
  if (!process.stdin.isTTY) { error('No keyboard here. Use: mizumi review <folder> [--task "..."] [--dry-run]'); process.exitCode = 1; return }

  divider()
  info('A second AI reviews your folder. Set it up in .pluffy-review.json (provider, server, model, key).')
  const folder = (await prompt('フォルダ Folder to review (blank = whole repo)')) || ''
  const task   = (await prompt('タスク What should it look for? (blank = general review)')) || ''
  const apply  = ((await prompt('Let it propose edits too? y/N')) || '').trim().toLowerCase() === 'y'
  const flags  = [...(folder ? [folder] : []), ...(task ? ['--task', task] : []), ...(apply ? ['--apply'] : [])]
  console.log()
  const dry = await runNode('pluffy-review.js', [...flags, '--dry-run'])
  if (dry !== 0) { error(`pluffy-review.js exited with code ${dry}`); return }
  const go = ((await prompt('Send these files to the review API? y/N')) || '').trim().toLowerCase() === 'y'
  if (!go) return
  console.log()
  const code = await runNode('pluffy-review.js', flags)
  if (code === 0) success('Review done. The report is in .pluffy-review/')
  else error(`pluffy-review.js exited with code ${code}`)
}

async function cmdChat(rest = []) {
  if (!fs.existsSync(path.join(ROOT_DIR, 'chat.js'))) { error('chat.js not found in the repo root'); return }
  process.exitCode = await runNode('chat.js', rest)
}

async function interactiveMenu() {
  printBanner()

  const MENU = [
    { label: 'エンジン起動     Start engine',           sub: 'pick which platforms: web / app / desktop',  value: 'start'      },
    
    { label: 'セットアップ     Setup',                   sub: 'node setup.js',             value: 'setup'      },
    { label: 'プロジェクト出力  Export project',          sub: 'tatemono → web/app/desktop → stack',value: 'export'     },
    { label: 'Webスタック切替  Switch web stack',        sub: 'nextjs / vite / astro ...',  value: 'web'        },
    { label: 'Appスタック切替  Switch app stack',        sub: 'expo / react-native',        value: 'app'        },
    { label: 'Desktopスタック切替 Switch desktop stack', sub: 'tauri / electron',            value: 'desktop'    },
    { label: 'Backend切替      Switch backend',          sub: 'laravel / express / fastapi / django / spring-boot / aspnet', value: 'backend' },
    { label: 'Database切替     Switch database',         sub: 'sqlite / postgresql',          value: 'db'         },
    { label: 'パッケージ管理    Install / uninstall deps', sub: 'frontend node_modules + backend vendor', value: 'deps' },
    { label: 'スタック情報     Stack info',              sub: 'web + app + desktop active stacks',    value: 'stacks'     },
    { label: 'タテモノ一覧     List modules',            sub: 'registered tatemonos',       value: 'modules'    },
    { label: 'AI生成           Pluffy AI',               sub: 'generate a tatemono with your model (toggle options)', value: 'ai' },
    { label: 'レビュー         Review project',          sub: 'a second AI reviews the whole folder', value: 'review' },
    { label: 'チャット         Pluffy chat',             sub: 'open the chat window (sessions saved in SQLite)', value: 'chat' },
    { label: '訓練データ       Scan training data',      sub: 'node scan.js → dataset.jsonl',  value: 'scan'       },
    { label: 'おわり           Exit',                    sub: 'またね！(￣▽￣)ノ',           value: 'exit'       },
  ]

  const chosen = await picker('何をしますか？ What do you want to do?', MENU)

  switch (chosen.value) {
    case 'start':     await cmdStartPicker();  break
    
    case 'setup':     cmdSetup();              break
    case 'export':    await cmdExport();       break
    case 'web':       await cmdSwitchWeb();    break
    case 'app':       await cmdSwitchApp();    break
    case 'desktop':   await cmdSwitchDesktop(); break
    case 'backend':   await cmdSwitchBackend(); break
    case 'db':        await cmdSwitchDatabase(); break
    case 'deps':      await cmdDeps();         break
    case 'stacks':    cmdStacks();             break
    case 'modules':   cmdModules();            break
    case 'ai':        await cmdAi();           break
    case 'scan':      await cmdScan();         break
    case 'chat':      await cmdChat();         break
    case 'review':    await cmdReview();       break
    case 'exit':
      console.log()
      console.log(`  ${paint(c.gray, 'またね！ See you! (￣▽￣)ノ')}`)
      console.log()
      process.exit(0)
  }
}

// ─── HELP ─────────────────────────────────────────────────────
function printHelp() {
  printBanner()
  console.log(`  ${paint(c.white + c.bold, 'コマンド / Commands:')}`)
  console.log()
  const cmds = [
    ['mizumi',                   '→ Interactive menu'],
    ['mizumi start',             '→ Start engine (web + app + desktop)'],


    ['mizumi setup',             '→ Run setup'],
    ['mizumi export',            '→ Export wizard (tatemono → web/app → stack)'],
    ['mizumi export <name>',     '→ Export tatemono (then pick platform/stack)'],
    ['mizumi export <name> <stack>', '→ Export directly with given stack'],
    ['mizumi web <stack>',       '→ Switch web stack'],
    ['mizumi start --only=web,app', '→ Start only chosen platforms (web / app / desktop)'],
    ['mizumi start --skip=desktop',  '→ Start everything except chosen platforms'],
    ['mizumi app <stack>',       '→ Switch app stack'],
    ['mizumi desktop <stack>',   '→ Switch desktop stack (tauri / electron)'],
    ['mizumi backend <name>',   '→ Switch backend (laravel, express, fastapi, django, spring-boot, aspnet)'],
    ['mizumi db <sqlite|postgresql>', '→ Switch database (one isolated DB per tatemono)'],
    ['mizumi deps',              '→ Install / uninstall deps (frontend + backend)'],
    ['mizumi deps prune',        '→ Delete deps of unused stacks'],
    ['mizumi deps install <stack>', '→ Install one stack (e.g. nextjs, laravel)'],
    ['mizumi deps uninstall <stack>', '→ Remove one stack\'s node_modules / vendor'],
    ['mizumi stack',             '→ Show active web + app + desktop stacks'],
    ['mizumi stacks',            '→ List all stacks'],
    ['mizumi modules',           '→ List tatemonos'],
    ['mizumi ai',                '→ Pluffy AI: option checkboxes, then ask for apps'],
    ['mizumi ai "idea" --ref on','→ Pluffy AI direct (flags go to pluffy-ai.js)'],
    ['mizumi scan',              '→ Scan tatemonos → training data (scan.js)'],
    ['mizumi chat',              '→ Open the Pluffy chat window (Electron)'],
    ['mizumi review',            '→ Second AI reviews the repo (menu), report in .pluffy-review/'],
    ['mizumi review engine --apply', '→ Review one folder and approve edits one by one'],
  ]
  cmds.forEach(([cmd, desc]) => {
    console.log(`  ${paint(c.cyan, cmd.padEnd(30))} ${paint(c.gray, desc)}`)
  })
  console.log()
  console.log(`  ${paint(c.gray, 'Web:')} nextjs, react-vite, react-inertia, astro, tanstack-start`)
  console.log(`  ${paint(c.gray, 'App:')} expo, react-native, lynx`)
  console.log(`  ${paint(c.gray, 'Desktop:')} tauri, electron`)
  console.log(`  ${paint(c.gray, 'Backend:')} laravel, express, fastapi, django, spring-boot, aspnet  (laravel-inertia is automatic with react-inertia)`)
  console.log()
}

// ─── ENTRY POINT ──────────────────────────────────────────────
const args    = process.argv.slice(2)
const command = args[0]
const arg     = args[1]

switch (command) {
  case 'start':   cmdStart(args.slice(1)); break
  case 'setup':   cmdSetup();                  break
  case 'export':  cmdExport(arg, args[2]);     break
  case 'web':     cmdSwitchWeb(arg);           break
  case 'app':     cmdSwitchApp(arg);           break
  case 'desktop': cmdSwitchDesktop(arg);       break
  case 'backend': cmdSwitchBackend(arg);       break
  case 'db':
  case 'database': cmdSwitchDatabase(arg);     break
  case 'deps':    cmdDeps(arg, args[2]);       break
  case 'stack':   cmdStack();                  break
  case 'stacks':  cmdStacks();                 break
  case 'modules': cmdModules();                break
  case 'ai':      cmdAi(args.slice(1));        break
  case 'scan':    cmdScan();                   break
  case 'chat':    cmdChat(args.slice(1));      break
  case 'review':  cmdReview(args.slice(1));    break
  case 'help':
  case '--help':
  case '-h':      printHelp();                 break
  case undefined: interactiveMenu();           break
  default:
    error(`Unknown command: "${command}"`)
    printHelp()
    process.exit(1)
}
