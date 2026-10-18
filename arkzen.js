#!/usr/bin/env node

// ============================================================
// PLUFF CLI — Stack switcher + utilities
// Usage:
//   node arkzen.js switch web nextjs
//   node arkzen.js switch app expo
//   node arkzen.js switch desktop electron
//   node arkzen.js stack          ← show current stacks
//   node arkzen.js stacks         ← list all stacks
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_DIR   = path.dirname(fileURLToPath(import.meta.url))
const JSON_PATH  = path.join(ROOT_DIR, 'arkzen.json')
const ENGINE_DIR = path.join(ROOT_DIR, 'engine')

const VALID_STACKS = {
  'nextjs':        path.join(ENGINE_DIR, 'frontend', 'nextjs'),
  'react-vite':    path.join(ENGINE_DIR, 'frontend', 'react-vite'),
  'react-inertia': path.join(ENGINE_DIR, 'frontend', 'react-inertia'),
  'native':        path.join(ENGINE_DIR, 'frontend', 'react-native'),
  'expo':          path.join(ENGINE_DIR, 'frontend', 'expo'),
  'react-native':  path.join(ENGINE_DIR, 'frontend', 'react-native'),
  'astro':         path.join(ENGINE_DIR, 'frontend', 'astro'),
  'tanstack-start': path.join(ENGINE_DIR, 'frontend', 'tanstack-start'),
  'tauri':          path.join(ENGINE_DIR, 'frontend', 'tauri'),
  'electron':      path.join(ENGINE_DIR, 'frontend', 'electron'),
  'lynx':          path.join(ENGINE_DIR, 'frontend', 'lynx'),
}

const STACK_CATEGORIES = {
  'web': ['nextjs', 'react-vite', 'react-inertia', 'astro', 'tanstack-start'],
  'app': ['expo', 'react-native', 'lynx'],
  'desktop': ['tauri', 'electron']
}

function readConfig() {
  return JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
}

function writeConfig(config) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

function log(msg) {
  console.log(`\x1b[36m[Pluff]\x1b[0m ${msg}`)
}

function err(msg) {
  console.error(`\x1b[31m[Pluff]\x1b[0m ${msg}`)
}

const [,, command, arg, arg2] = process.argv

function categoryForStack(stack) {
  return Object.keys(STACK_CATEGORIES).find(cat => STACK_CATEGORIES[cat].includes(stack)) ?? null
}

switch (command) {

  case 'switch': {
    let category = arg
    let stack = arg2

    // Support: node arkzen.js switch electron
    //      or: node arkzen.js switch desktop electron
    if (arg && !arg2 && categoryForStack(arg)) {
      category = categoryForStack(arg)
      stack = arg
    }
    
    if (!category || !stack) { 
      err('Usage: node arkzen.js switch <category> <stack>')
      err('Categories: web, app, desktop')
      err('Example: node arkzen.js switch web nextjs')
      err('         node arkzen.js switch app expo')
      err('         node arkzen.js switch desktop electron')
      process.exit(1) 
    }
    
    if (!STACK_CATEGORIES[category]) {
      err(`Unknown category: "${category}"`)
      err(`Available categories: ${Object.keys(STACK_CATEGORIES).join(', ')}`)
      process.exit(1)
    }
    
    if (!STACK_CATEGORIES[category].includes(stack)) {
      err(`Unknown stack "${stack}" for category "${category}"`)
      err(`Available stacks in ${category}: ${STACK_CATEGORIES[category].join(', ')}`)
      process.exit(1)
    }
    
    if (!VALID_STACKS[stack]) {
      err(`Stack not found: ${stack}`)
      process.exit(1)
    }
    
    if (!fs.existsSync(VALID_STACKS[stack])) {
      err(`Stack not installed: ${stack}`)
      err(`Expected at: ${VALID_STACKS[stack]}`)
      err(`Run: cd engine/frontend/${stack} && npm install`)
      process.exit(1)
    }

    const config = readConfig()
    let prev = 'none'
    
    // Set the appropriate stack property based on category
    if (category === 'web') {
      prev = config.activeStack ?? 'nextjs'
      config.activeStack = stack
    } else if (category === 'app') {
      prev = config.activeAppStack ?? 'none'
      config.activeAppStack = stack
    } else if (category === 'desktop') {
      prev = config.activeDesktopStack ?? 'none'
      config.activeDesktopStack = stack
    }

    writeConfig(config)

    log(`${category} stack switched: ${prev} → ${stack}`)
    log(`Restart the engine with: node start.js  (web + app + desktop together)`)
    break
  }

  case 'stack': {
    const config = readConfig()
    log(`Web stack:    ${config.activeStack ?? 'nextjs'}`)
    log(`App stack:     ${config.activeAppStack ?? 'none'}`)
    log(`Desktop stack: ${config.activeDesktopStack ?? 'none'}`)
    break
  }

  case 'stacks': {
    const config = readConfig()
    const activeWeb = config.activeStack ?? 'nextjs'
    const activeApp = config.activeAppStack ?? 'none'
    const activeDesktop = config.activeDesktopStack ?? 'none'
    
    log('Available stacks:')
    log('\n  WEB:')
    for (const stack of STACK_CATEGORIES.web) {
      const dir = VALID_STACKS[stack]
      const installed = fs.existsSync(path.join(dir, 'node_modules'))
      const isCurrent = stack === activeWeb
      console.log(`    ${isCurrent ? '→' : ' '} ${stack.padEnd(14)} ${installed ? '✓' : '✗'} ${isCurrent ? '(active)' : ''}`)
    }
    log('\n  APP:')
    for (const stack of STACK_CATEGORIES.app) {
      const dir = VALID_STACKS[stack]
      const installed = fs.existsSync(path.join(dir, 'node_modules'))
      const isCurrent = stack === activeApp
      console.log(`    ${isCurrent ? '→' : ' '} ${stack.padEnd(14)} ${installed ? '✓' : '✗'} ${isCurrent ? '(active)' : ''}`)
    }
    log('\n  DESKTOP:')
    for (const stack of STACK_CATEGORIES.desktop) {
      const dir = VALID_STACKS[stack]
      const installed = fs.existsSync(path.join(dir, 'node_modules'))
      const isCurrent = stack === activeDesktop
      console.log(`    ${isCurrent ? '→' : ' '} ${stack.padEnd(14)} ${installed ? '✓' : '✗'} ${isCurrent ? '(active)' : ''}`)
    }
    break
  }

  default: {
    console.log('\nPluff CLI\n')
    console.log('  node arkzen.js switch <category> <stack>   Switch active stack')
    console.log('  node arkzen.js stack                         Show current stacks')
    console.log('  node arkzen.js stacks                        List all stacks\n')
    console.log('Categories: web, app, desktop')
    console.log('Web stacks: nextjs, react-vite, react-inertia, astro, tanstack-start')
    console.log('App stacks: expo, react-native, lynx')
    console.log('Desktop stacks: tauri, electron\n')
  }
}