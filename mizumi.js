#!/usr/bin/env node

// ============================================================
//  みずみ CLI — ARKZEN ENGINE
//  Interactive prompt selector + direct command mode
//  Usage:
//    node mizumi.js              ← interactive picker
//    node mizumi.js start        ← start engine directly
//    node mizumi.js setup        ← setup directly
//    node mizumi.js export <name>← export tatemono directly
//    node mizumi.js switch <stack> ← switch stack directly
//    node mizumi.js stack        ← show current stack
//    node mizumi.js stacks       ← list all stacks
//    node mizumi.js modules      ← list registered tatemonos
// ============================================================

const { execSync, spawn, spawnSync } = require('child_process')
const readline = require('readline')
const fs   = require('fs')
const path = require('path')

const ROOT_DIR  = __dirname
const JSON_PATH = path.join(ROOT_DIR, 'arkzen.json')

// ─── KAOMOJI POOL ─────────────────────────────────────────────────────────────
const KAOMOJI_BANNER = [
  '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
  '(｡◕‿◕｡)',
  '(*＾▽＾)／',
  '(ﾉ´ヮ`)ﾉ*: ･ﾟ',
  '٩(◕‿◕｡)۶',
  '(づ｡◕‿‿◕｡)づ',
  '✧ヽ(◕ヮ◕ヽ)',
  '(ง •̀_•́)ง',
]
const KAOMOJI_SUCCESS = ['(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '٩(◕‿◕｡)۶', '(*＾▽＾)／', '(づ｡◕‿‿◕｡)づ']
const KAOMOJI_ERROR   = ['(╥﹏╥)', '(；一_一)', '(>_<)', '｡ﾟ(ﾟ´Д｀ﾟ)ﾟ｡']
const KAOMOJI_WAIT    = ['(￣▽￣)ノ', '(・・;)', '(＞﹏＜)', '(・_・;)']

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// ─── COLORS ───────────────────────────────────────────────────────────────────
const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  cyan:    '\x1b[36m',
  magenta: '\x1b[35m',
  yellow:  '\x1b[33m',
  green:   '\x1b[32m',
  red:     '\x1b[31m',
  blue:    '\x1b[34m',
  white:   '\x1b[97m',
  gray:    '\x1b[90m',
}

const paint = (color, str) => `${color}${str}${c.reset}`

// ─── LOGGING ──────────────────────────────────────────────────────────────────
const log     = (msg) => console.log(`  ${paint(c.cyan,    '✦')} ${msg}`)
const success = (msg) => console.log(`  ${paint(c.green,   '✓')} ${msg} ${paint(c.gray, pick(KAOMOJI_SUCCESS))}`)
const error   = (msg) => console.log(`  ${paint(c.red,     '✗')} ${msg} ${paint(c.gray, pick(KAOMOJI_ERROR))}`)
const warn    = (msg) => console.log(`  ${paint(c.yellow,  '⚠')} ${msg}`)
const info    = (msg) => console.log(`  ${paint(c.gray,    '·')} ${msg}`)
const divider = ()    => console.log(`\n${paint(c.gray, '  ' + '─'.repeat(46))}\n`)

// ─── ARKZEN.JSON ──────────────────────────────────────────────────────────────
function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
  } catch {
    return { engine: '?', activeStack: 'nextjs', modules: [], stacks: {} }
  }
}

function writeConfig(config) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

// ─── BANNER ───────────────────────────────────────────────────────────────────
function printBanner() {
  const config = readConfig()
  const stack  = config.activeStack ?? 'nextjs'
  const mods   = (config.modules ?? []).length
  const emoji  = pick(KAOMOJI_BANNER)

  console.log()
  console.log(paint(c.magenta, '  ╔══════════════════════════════════════════╗'))
  console.log(paint(c.magenta, '  ║') + paint(c.bold + c.white, '       ✦ アークゼン エンジン ✦            ') + paint(c.magenta, '║'))
  console.log(paint(c.magenta, '  ║') + paint(c.cyan,           `         みずみ CLI  v${config.engine ?? '1.0.0'}              `) + paint(c.magenta, '║'))
  console.log(paint(c.magenta, '  ╚══════════════════════════════════════════╝'))
  console.log()
  console.log(`  ${paint(c.gray, 'スタック / Stack:')}    ${paint(c.cyan + c.bold, stack)}`)
  console.log(`  ${paint(c.gray, 'モジュール / Modules:')} ${paint(c.yellow, String(mods))} tatemonos registered`)
  console.log(`  ${paint(c.gray, emoji)}`)
  console.log()
}

// ─── MINIMAL ARROW-KEY PICKER ─────────────────────────────────────────────────
// Pure Node readline — no external deps
// Uses stdout.write with ANSI erase-line to redraw cleanly on Termux
async function picker(question, options) {
  return new Promise((resolve) => {
    let idx = 0
    const total = options.length
    const LINES = total + 1  // question line + option lines

    // Build the full block as a single string, then write it at once
    const buildBlock = () => {
      const lines = []
      lines.push(`  ${paint(c.cyan + c.bold, '◆')} ${paint(c.white, question)}`)
      options.forEach((opt, i) => {
        const selected = i === idx
        const bullet   = selected ? paint(c.magenta + c.bold, '●') : paint(c.gray, '○')
        const label    = selected
          ? paint(c.white + c.bold, opt.label)
          : paint(c.gray, opt.label)
        const sub      = opt.sub ? paint(c.gray, `  ${opt.sub}`) : ''
        lines.push(`  ${bullet} ${label}${sub}`)
      })
      return lines
    }

    // First draw
    const firstDraw = () => {
      buildBlock().forEach(line => process.stdout.write(line + '\n'))
    }

    // Redraw: move cursor up N lines, then overwrite each line cleanly
    const redraw = () => {
      // Move cursor up LINES rows
      process.stdout.write(`\x1b[${LINES}A`)
      buildBlock().forEach(line => {
        // Erase entire line then write new content
        process.stdout.write(`\x1b[2K${line}\n`)
      })
    }

    const rl = readline.createInterface({ input: process.stdin })
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    firstDraw()

    process.stdin.on('data', function handler(key) {
      if (key === '\u001b[A' || key === '\u001b[D') {          // up / left
        idx = (idx - 1 + total) % total
        redraw()
      } else if (key === '\u001b[B' || key === '\u001b[C') {   // down / right
        idx = (idx + 1) % total
        redraw()
      } else if (key === '\r' || key === '\n' || key === ' ') { // enter / space
        process.stdin.removeListener('data', handler)
        process.stdin.setRawMode(false)
        rl.close()
        console.log()
        resolve(options[idx])
      } else if (key === '\u0003') {                            // ctrl+c
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

// Simple text input prompt
async function prompt(question, defaultVal = '') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const hint = defaultVal ? paint(c.gray, ` (${defaultVal})`) : ''
    rl.question(`  ${paint(c.cyan, '◆')} ${paint(c.white, question)}${hint}: `, (answer) => {
      rl.close()
      resolve(answer.trim() || defaultVal)
    })
  })
}

// ─── VALID STACKS ─────────────────────────────────────────────────────────────
const VALID_STACKS = {
  'nextjs':         'engine/frontend/nextjs',
  'react-vite':     'engine/frontend/react-vite',
  'react-inertia':  'engine/frontend/react-inertia',
  'native':         'engine/frontend/react-native',
  'astro':          'engine/frontend/astro',
  'tanstack-start': 'engine/frontend/tanstack-start',
}

const STACK_LABELS = {
  'nextjs':         'Next.js',
  'react-vite':     'React + Vite',
  'react-inertia':  'React + Inertia (Laravel monolith)',
  'native':         'React Native (Expo)',
  'astro':          'Astro',
  'tanstack-start': 'TanStack Start',
}

// ─── COMMANDS ─────────────────────────────────────────────────────────────────

function cmdStart() {
  console.log()
  log(`エンジン起動中... Starting Arkzen Engine ${paint(c.gray, pick(KAOMOJI_WAIT))}`)
  console.log()
  const child = spawn('node', ['start.js'], { cwd: ROOT_DIR, stdio: 'inherit' })
  child.on('exit', (code) => {
    if (code !== 0) error(`Engine exited with code ${code}`)
  })
}

function cmdSetup() {
  console.log()
  log(`セットアップ中... Running setup ${paint(c.gray, pick(KAOMOJI_WAIT))}`)
  console.log()
  const child = spawn('node', ['setup.js'], { cwd: ROOT_DIR, stdio: 'inherit' })
  child.on('exit', (code) => {
    if (code === 0) success('Setup complete!')
    else error(`Setup exited with code ${code}`)
  })
}

async function cmdExport(tatName) {
  if (!tatName) {
    // Show tatemono picker
    const config  = readConfig()
    const modules = (config.modules ?? []).map(m => m.name)

    if (modules.length === 0) {
      warn('タテモノなし — No tatemonos registered yet.')
      return
    }

    divider()
    const chosen = await picker(
      'どのタテモノ？ Which tatemono to export?',
      modules.map(m => ({ label: m, value: m, sub: '' }))
    )
    tatName = chosen.value
  }

  console.log()
  log(`エクスポート中... Exporting ${paint(c.cyan, tatName)} ${paint(c.gray, pick(KAOMOJI_WAIT))}`)
  console.log()
  const child = spawn('node', ['export.js', tatName], { cwd: ROOT_DIR, stdio: 'inherit' })
  child.on('exit', (code) => {
    if (code === 0) success(`Exported → projects/${tatName}/`)
    else error(`Export failed with code ${code}`)
  })
}

async function cmdSwitch(stackArg) {
  let stack = stackArg

  if (!stack) {
    const config  = readConfig()
    const current = config.activeStack ?? 'nextjs'

    divider()
    const chosen = await picker(
      'スタック切替 — Switch to which stack?',
      Object.entries(VALID_STACKS).map(([key]) => ({
        label: `${key === current ? paint(c.green, '→ ') : '  '}${STACK_LABELS[key] ?? key}`,
        sub:   key === current ? paint(c.green, '(current)') : key,
        value: key,
      }))
    )
    stack = chosen.value
  }

  if (!VALID_STACKS[stack]) {
    error(`Unknown stack: "${stack}"`)
    info(`Available: ${Object.keys(VALID_STACKS).join(', ')}`)
    return
  }

  const stackDir = path.join(ROOT_DIR, VALID_STACKS[stack])
  if (!fs.existsSync(stackDir)) {
    error(`Stack not found: ${stack}`)
    info(`Expected at: ${VALID_STACKS[stack]}`)
    return
  }

  const config = readConfig()
  const prev   = config.activeStack ?? 'nextjs'

  if (prev === stack) {
    warn(`すでに ${stack} です — Already on stack: ${stack}`)
    return
  }

  config.activeStack = stack
  writeConfig(config)

  success(`スタック切替完了！ Stack switched: ${paint(c.yellow, prev)} → ${paint(c.cyan + c.bold, stack)}`)
  info(`Restart engine to apply: node mizumi.js start`)
}

function cmdStack() {
  const config = readConfig()
  const stack  = config.activeStack ?? 'nextjs'
  divider()
  console.log(`  ${paint(c.gray, 'アクティブスタック / Active stack:')}`)
  console.log(`  ${paint(c.cyan + c.bold, '  → ' + stack)}  ${paint(c.gray, STACK_LABELS[stack] ?? '')}`)
  divider()
}

function cmdStacks() {
  const config  = readConfig()
  const current = config.activeStack ?? 'nextjs'
  divider()
  console.log(`  ${paint(c.white + c.bold, 'スタック一覧 / Available stacks:')}`)
  console.log()
  for (const [key, dir] of Object.entries(VALID_STACKS)) {
    const installed = fs.existsSync(path.join(ROOT_DIR, dir, 'node_modules'))
    const isCurrent = key === current
    const arrow     = isCurrent ? paint(c.magenta + c.bold, '→') : ' '
    const name      = isCurrent ? paint(c.cyan + c.bold, key.padEnd(16)) : paint(c.gray, key.padEnd(16))
    const label     = paint(c.gray, STACK_LABELS[key] ?? '')
    const status    = installed
      ? paint(c.green,  '✓ installed')
      : paint(c.red,    '✗ not installed')
    const tag       = isCurrent ? paint(c.magenta, ' (active)') : ''
    console.log(`  ${arrow} ${name} ${status}  ${label}${tag}`)
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
      const status = m.status === 'active'
        ? paint(c.green, '● active')
        : paint(c.gray,  '○ ' + (m.status ?? 'unknown'))
      const pages  = m.pages?.length
        ? paint(c.gray, `${m.pages.length} page${m.pages.length > 1 ? 's' : ''}`)
        : ''
      console.log(`  ${num} ${name} ${status}  ${pages}`)
    })
  }
  divider()
}

// ─── INTERACTIVE MENU ─────────────────────────────────────────────────────────
async function interactiveMenu() {
  printBanner()

  const MENU = [
    { label: 'エンジン起動     Start engine',         sub: 'node start.js',              value: 'start'   },
    { label: 'セットアップ     Setup',                sub: 'node setup.js',              value: 'setup'   },
    { label: 'プロジェクト出力  Export project',       sub: 'node export.js <name>',      value: 'export'  },
    { label: 'スタック切替     Switch stack',          sub: 'node arkzen.js switch',      value: 'switch'  },
    { label: 'スタック情報     Stack info',            sub: 'current + all stacks',       value: 'stacks'  },
    { label: 'タテモノ一覧     List modules',          sub: 'registered tatemonos',       value: 'modules' },
    { label: 'おわり           Exit',                  sub: 'またね！(￣▽￣)ノ',          value: 'exit'    },
  ]

  const chosen = await picker('何をしますか？ What do you want to do?', MENU)

  switch (chosen.value) {
    case 'start':   cmdStart();          break
    case 'setup':   cmdSetup();          break
    case 'export':  await cmdExport();   break
    case 'switch':  await cmdSwitch();   break
    case 'stacks':  cmdStacks();         break
    case 'modules': cmdModules();        break
    case 'exit':
      console.log()
      console.log(`  ${paint(c.gray, 'またね！ See you! (￣▽￣)ノ')}`)
      console.log()
      process.exit(0)
  }
}

// ─── HELP ─────────────────────────────────────────────────────────────────────
function printHelp() {
  printBanner()
  console.log(`  ${paint(c.white + c.bold, 'コマンド / Commands:')}`)
  console.log()
  const cmds = [
    ['mizumi',                  '→ Interactive menu  (インタラクティブメニュー)'],
    ['mizumi start',            '→ Start engine      (エンジン起動)'],
    ['mizumi setup',            '→ Run setup         (セットアップ)'],
    ['mizumi export <name>',    '→ Export tatemono   (プロジェクト出力)'],
    ['mizumi switch <stack>',   '→ Switch stack      (スタック切替)'],
    ['mizumi stack',            '→ Show active stack (アクティブスタック)'],
    ['mizumi stacks',           '→ List all stacks   (スタック一覧)'],
    ['mizumi modules',          '→ List tatemonos    (タテモノ一覧)'],
  ]
  cmds.forEach(([cmd, desc]) => {
    console.log(`  ${paint(c.cyan, cmd.padEnd(28))} ${paint(c.gray, desc)}`)
  })
  console.log()
}

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────
const [,, command, arg] = process.argv

switch (command) {
  case 'start':                            cmdStart();              break
  case 'setup':                            cmdSetup();              break
  case 'export':   cmdExport(arg);         break
  case 'switch':   cmdSwitch(arg);         break
  case 'stack':    cmdStack();             break
  case 'stacks':   cmdStacks();            break
  case 'modules':  cmdModules();           break
  case 'help':
  case '--help':
  case '-h':       printHelp();            break
  case undefined:  interactiveMenu();      break
  default:
    error(`Unknown command: "${command}"`)
    printHelp()
    process.exit(1)
}
