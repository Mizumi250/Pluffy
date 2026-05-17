#!/usr/bin/env node

// ============================================================
// ARKZEN CLI — Stack switcher + utilities
// Usage:
//   node arkzen.js switch nextjs
//   node arkzen.js switch react-vite
//   node arkzen.js switch react-inertia
//   node arkzen.js switch native
//   node arkzen.js stack          ← show current stack
//   node arkzen.js stacks         ← list all available stacks
// ============================================================

const fs   = require('fs')
const path = require('path')

const ROOT_DIR   = __dirname
const JSON_PATH  = path.join(ROOT_DIR, 'arkzen.json')
const ENGINE_DIR = path.join(ROOT_DIR, 'engine')

const VALID_STACKS = {
  'nextjs':        path.join(ENGINE_DIR, 'frontend', 'nextjs'),
  'react-vite':    path.join(ENGINE_DIR, 'frontend', 'react-vite'),
  'react-inertia': path.join(ENGINE_DIR, 'frontend', 'react-inertia'),
  'native':        path.join(ENGINE_DIR, 'frontend', 'react-native'),
  'astro':         path.join(ENGINE_DIR, 'frontend', 'astro'),
  'tanstack-start': path.join(ENGINE_DIR, 'frontend', 'tanstack-start'),
}

function readConfig() {
  return JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
}

function writeConfig(config) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

function log(msg) {
  console.log(`\x1b[36m[Arkzen]\x1b[0m ${msg}`)
}

function err(msg) {
  console.error(`\x1b[31m[Arkzen]\x1b[0m ${msg}`)
}

const [,, command, arg] = process.argv

switch (command) {

  case 'switch': {
    const stack = arg
    if (!stack) { err('Usage: node arkzen.js switch <stack>'); process.exit(1) }
    if (!VALID_STACKS[stack]) {
      err(`Unknown stack: "${stack}"`)
      err(`Available: ${Object.keys(VALID_STACKS).join(', ')}`)
      process.exit(1)
    }
    if (!fs.existsSync(VALID_STACKS[stack])) {
      err(`Stack not installed: ${stack}`)
      err(`Expected at: ${VALID_STACKS[stack]}`)
      err(`Run: cd engine/frontend/${stack} && npm install`)
      process.exit(1)
    }

    const config = readConfig()
    const prev   = config.activeStack ?? 'nextjs'

    if (prev === stack) {
      log(`Already on stack: ${stack}`)
      process.exit(0)
    }

    config.activeStack = stack
    writeConfig(config)

    log(`Stack switched: ${prev} → ${stack}`)
    log(`Restart Arkzen to apply: node start.js`)
    log(`Or send signal to running process:`)
    log(`  kill -USR1 $(cat .arkzen.pid 2>/dev/null || echo 0)`)
    break
  }

  case 'stack': {
    const config = readConfig()
    log(`Active stack: ${config.activeStack ?? 'nextjs'}`)
    break
  }

  case 'stacks': {
    const config = readConfig()
    const active = config.activeStack ?? 'nextjs'
    log('Available stacks:')
    for (const [name, dir] of Object.entries(VALID_STACKS)) {
      const installed = fs.existsSync(path.join(dir, 'node_modules'))
      const isCurrent = name === active
      console.log(`  ${isCurrent ? '→' : ' '} ${name.padEnd(14)} ${installed ? '✓ installed' : '✗ not installed'} ${isCurrent ? '(active)' : ''}`)
    }
    break
  }

  default: {
    console.log('\nArkzen CLI\n')
    console.log('  node arkzen.js switch <stack>   Switch active stack')
    console.log('  node arkzen.js stack             Show current stack')
    console.log('  node arkzen.js stacks            List all stacks\n')
    console.log('Available stacks: nextjs, react-vite, react-inertia, native, astro, tanstack-start\n')
  }
}