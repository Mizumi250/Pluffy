#!/usr/bin/env node

// ============================================================
//  みずみ CLI — ARKZEN ENGINE
//  Interactive prompt selector + direct command mode
//  Usage:
//    node mizumi.js              ← interactive picker
//    node mizumi.js start        ← start engine


//    node mizumi.js setup
//    node mizumi.js export <name>
//    node mizumi.js web <stack>  ← switch web stack
//    node mizumi.js app <stack>  ← switch app stack
//    node mizumi.js stack        ← show active web + app stack
//    node mizumi.js stacks       ← list all stacks
//    node mizumi.js modules      ← list registered tatemonos
// ============================================================

const { spawn } = require('child_process')
const readline  = require('readline')
const fs        = require('fs')
const path      = require('path')

const ROOT_DIR  = __dirname
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
  catch { return { engine: '?', activeStack: 'nextjs', activeAppStack: 'expo', modules: [], stacks: {} } }
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

// ─── BANNER ───────────────────────────────────────────────────
function printBanner() {
  const config   = readConfig()
  const webStack = config.activeStack    ?? 'nextjs'
  const appStack = config.activeAppStack ?? 'expo'
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

function cmdStart() {
  console.log()
  log(`エンジン起動中... Starting Arkzen Engine ${paint(c.gray, pick(KAOMOJI_WAIT))}`)
  console.log()
  const child = spawn('node', ['start.js'], { cwd: ROOT_DIR, stdio: 'inherit' })
  child.on('exit', code => { if (code !== 0) error(`Engine exited with code ${code}`) })
}

function cmdSetup() {
  console.log()
  log(`セットアップ中... Running setup ${paint(c.gray, pick(KAOMOJI_WAIT))}`)
  console.log()
  const child = spawn('node', ['setup.js'], { cwd: ROOT_DIR, stdio: 'inherit' })
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

  // Step 2 — pick platform (web or app), Step 3 — pick stack for that platform
  // This is purely for export.js's --stack=<name> override — it does NOT
  // touch arkzen.json, so the live activeStack/activeAppStack used by
  // `node start.js` / `node mizumi.js start` is left untouched.
  let stack = stackArg
  if (!stack) {
    divider()
    const platform = await picker('どのプラットフォーム？ Export for which platform?', [
      { label: 'Web',  sub: `current: ${config.activeStack ?? 'nextjs'}`,     value: 'web' },
      { label: 'App',  sub: `current: ${config.activeAppStack ?? 'expo'}`,    value: 'app' },
    ])

    const STACKS = platform.value === 'web' ? WEB_STACKS : APP_STACKS
    const LABELS = platform.value === 'web' ? WEB_LABELS : APP_LABELS
    const current = platform.value === 'web' ? (config.activeStack ?? 'nextjs') : (config.activeAppStack ?? 'expo')

    divider()
    const chosenStack = await picker(
      `${platform.value === 'web' ? 'Web' : 'App'} スタック — Export with which stack?`,
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
  const child = spawn('node', ['export.js', tatName, `--stack=${stack}`], { cwd: ROOT_DIR, stdio: 'inherit' })
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
  info(`Restart: node mizumi.js start  (runs web + app together)`)
}

async function cmdSwitchApp(stackArg) {
  let stack = stackArg
  if (!stack) {
    const config  = readConfig()
    const current = config.activeAppStack ?? 'expo'
    divider()
    const chosen = await picker(
      'App スタック切替 — Switch app stack?',
      Object.entries(APP_STACKS).map(([key]) => ({
        label: `${key === current ? paint(c.green, '→ ') : '  '}${APP_LABELS[key] ?? key}`,
        sub:   key === current ? paint(c.green, '(current)') : key,
        value: key,
      }))
    )
    stack = chosen.value
  }
  if (!APP_STACKS[stack]) { error(`Unknown app stack: "${stack}"`); return }
  const stackDir = path.join(ROOT_DIR, APP_STACKS[stack])
  if (!fs.existsSync(stackDir)) { error(`Stack not found at: ${APP_STACKS[stack]}`); return }

  const config = readConfig()
  const prev   = config.activeAppStack ?? 'expo'
  if (prev === stack) { warn(`すでに ${stack} です — Already on app stack: ${stack}`); return }
  config.activeAppStack = stack
  writeConfig(config)
  success(`App スタック切替完了！ ${paint(c.yellow, prev)} → ${paint(c.green + c.bold, stack)}`)
  info(`Restart: node mizumi.js start  (runs web + app together)`)
}

function cmdStack() {
  const config   = readConfig()
  const webStack = config.activeStack    ?? 'nextjs'
  const appStack = config.activeAppStack ?? 'expo'
  divider()
  console.log(`  ${paint(c.gray, 'Web スタック:')}  ${paint(c.cyan + c.bold, webStack)}  ${paint(c.gray, WEB_LABELS[webStack] ?? '')}`)
  console.log(`  ${paint(c.gray, 'App スタック:')}  ${paint(c.green + c.bold, appStack)}  ${paint(c.gray, APP_LABELS[appStack] ?? '')}`)
  divider()
}

function cmdStacks() {
  const config   = readConfig()
  const activeWeb = config.activeStack    ?? 'nextjs'
  const activeApp = config.activeAppStack ?? 'expo'
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
  divider()
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
async function interactiveMenu() {
  printBanner()

  const MENU = [
    { label: 'エンジン起動     Start engine',           sub: 'web + app simultaneously',  value: 'start'      },
    
    { label: 'セットアップ     Setup',                   sub: 'node setup.js',             value: 'setup'      },
    { label: 'プロジェクト出力  Export project',          sub: 'tatemono → web/app → stack',value: 'export'     },
    { label: 'Webスタック切替  Switch web stack',        sub: 'nextjs / vite / astro ...',  value: 'web'        },
    { label: 'Appスタック切替  Switch app stack',        sub: 'expo / react-native',        value: 'app'        },
    { label: 'スタック情報     Stack info',              sub: 'web + app active stacks',    value: 'stacks'     },
    { label: 'タテモノ一覧     List modules',            sub: 'registered tatemonos',       value: 'modules'    },
    { label: 'おわり           Exit',                    sub: 'またね！(￣▽￣)ノ',           value: 'exit'       },
  ]

  const chosen = await picker('何をしますか？ What do you want to do?', MENU)

  switch (chosen.value) {
    case 'start':     cmdStart();              break
    
    case 'setup':     cmdSetup();              break
    case 'export':    await cmdExport();       break
    case 'web':       await cmdSwitchWeb();    break
    case 'app':       await cmdSwitchApp();    break
    case 'stacks':    cmdStacks();             break
    case 'modules':   cmdModules();            break
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
    ['mizumi start',             '→ Start engine (web mode)'],


    ['mizumi setup',             '→ Run setup'],
    ['mizumi export',            '→ Export wizard (tatemono → web/app → stack)'],
    ['mizumi export <name>',     '→ Export tatemono (then pick platform/stack)'],
    ['mizumi export <name> <stack>', '→ Export directly with given stack'],
    ['mizumi web <stack>',       '→ Switch web stack'],
    ['mizumi app <stack>',       '→ Switch app stack'],
    ['mizumi stack',             '→ Show active web + app stack'],
    ['mizumi stacks',            '→ List all stacks'],
    ['mizumi modules',           '→ List tatemonos'],
  ]
  cmds.forEach(([cmd, desc]) => {
    console.log(`  ${paint(c.cyan, cmd.padEnd(30))} ${paint(c.gray, desc)}`)
  })
  console.log()
  console.log(`  ${paint(c.gray, 'Web:')} nextjs, react-vite, react-inertia, astro, tanstack-start`)
  console.log(`  ${paint(c.gray, 'App:')} expo, react-native, lynx`)
  console.log()
}

// ─── ENTRY POINT ──────────────────────────────────────────────
const args    = process.argv.slice(2)
const command = args[0]
const arg     = args[1]

switch (command) {
  case 'start':   cmdStart();     break
  case 'setup':   cmdSetup();                  break
  case 'export':  cmdExport(arg, args[2]);     break
  case 'web':     cmdSwitchWeb(arg);           break
  case 'app':     cmdSwitchApp(arg);           break
  case 'stack':   cmdStack();                  break
  case 'stacks':  cmdStacks();                 break
  case 'modules': cmdModules();                break
  case 'help':
  case '--help':
  case '-h':      printHelp();                 break
  case undefined: interactiveMenu();           break
  default:
    error(`Unknown command: "${command}"`)
    printHelp()
    process.exit(1)
}