#!/usr/bin/env node

// ============================================================
// ARKZEN ENGINE — EXPORT SCRIPT v10
//
// Philosophy: COPY EVERYTHING. No cleverness. No rewriting.
// The engine works. The exported project IS the engine output.
// We just isolate one tatemono from the multi-tatemono engine.
//
// Stack is determined by activeStack in arkzen.json.
// Switch stacks before exporting:
//   node mizumi.js web astro
//   node export.js tatemono-name
//
// Stack → backend mapping:
//   react-inertia → engine/backend/laravel-inertia  (monolith — frontend LIVES inside Laravel)
//   all others    → arkzen.json activeBackend      (decoupled — separate frontend process)
//
// Inertia exports land in a SINGLE folder (backend IS the project).
// No frontend/ split for Inertia — pages are inside resources/js/ in Laravel.
// Native exports skip the backend entirely (frontend-only).
// --backend=none exports the frontend only, for any web or desktop stack.
//
// Usage:  node export.js <tatemono-name> [--stack=<name>] [--backend=<name|none>] [--docker] [--openapi] [--api-url=<url>]
// Output: projects/<tatemono-name>/
//
// --openapi  also writes projects/<tatemono-name>/openapi/ (openapi.json + api-docs.html, a Swagger UI page),
//            generated from the tatemono's @arkzen:api / @arkzen:routes / auth blocks. Nothing extra to declare.
// ============================================================

import { execSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { supportsDocker, dockerRejectionMessage, writeDockerFiles, writeDeployGuide } from './export-docker.js'
import { exportOpenApi } from './export-openapi.js'

const ROOT_DIR   = path.dirname(fileURLToPath(import.meta.url))
const ENGINE_DIR = path.join(ROOT_DIR, 'engine')

// Read active stack from arkzen.json — overridable via --stack=<name>
// (used by mizumi.js export wizard so exporting doesn't change the
// live activeStack/activeAppStack used by `node start.js`)
const arkzenJson  = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'arkzen.json'), 'utf-8'))
const stackFlag   = process.argv.find(a => a.startsWith('--stack='))
const activeStack = stackFlag
  ? stackFlag.slice('--stack='.length)
  : (arkzenJson.activeStack ?? 'nextjs')
const backendFlag = process.argv.find(a => a.startsWith('--backend='))
const selectedBackend = backendFlag
  ? backendFlag.slice('--backend='.length)
  : undefined
const isTauri    = activeStack === 'tauri'
const isElectron = activeStack === 'electron'
const isDesktop  = isTauri || isElectron

// --docker: add Dockerfile(s) + docker-compose.yml. Web stacks only — mobile and desktop
// are built with their own tools, so reject it BEFORE doing any work.
const wantsDocker = process.argv.includes('--docker')

// --openapi: also write openapi.json + a Swagger UI page (api-docs.html) for the API the tatemono declares.
// --api-url=<url> sets the server URL written into the spec (default http://localhost:8000).
const wantsOpenApi = process.argv.includes('--openapi')
const apiUrlFlag = process.argv.find(a => a.startsWith('--api-url='))
const openApiServerUrl = apiUrlFlag ? apiUrlFlag.slice('--api-url='.length) : undefined
if (wantsDocker && !supportsDocker(activeStack)) {
  console.log(`\n  ✗ ${dockerRejectionMessage(activeStack)}\n`)
  process.exit(1)
}

// Stack flags
const isInertia = activeStack === 'react-inertia'
const isNative  = activeStack === 'native' || activeStack === 'expo' || activeStack === 'react-native' || activeStack === 'lynx'
// --backend=none: frontend-only export. No backend is copied, installed, migrated or started.
const noBackend = selectedBackend === 'none'
if (noBackend && isInertia) {
  console.error('\n  ✗ react-inertia is a Laravel monolith and cannot be exported without a backend. Pick another stack.\n')
  process.exit(1)
}
// 'none' keeps a real backend key ('laravel') internally so path and docker lookups stay valid.
// Every backend step is gated by hasBackend, which is forced to false below.
const activeBackend = isInertia
  ? 'laravel-inertia'
  : noBackend
    ? 'laravel'
    : (selectedBackend ?? arkzenJson.activeBackend ?? 'laravel')
if (!isInertia && !noBackend && selectedBackend && !fs.existsSync(path.join(ENGINE_DIR, 'backend', selectedBackend))) {
  console.error(`\n  ✗ Unknown export backend: ${selectedBackend} (use a folder name from engine/backend, or "none")\n`)
  process.exit(1)
}
const isExpress = activeBackend === 'express'
const isFastapi = activeBackend === 'fastapi'
const isAspnet = activeBackend === 'aspnet'
const isSpring = activeBackend === 'spring-boot'
const isGo = activeBackend === 'go'
const isRust = activeBackend === 'rust'
// Spring Boot entry point (engine/backend/spring-boot/src/main/java). Adjust if the package changes.
const SPRING_SERVER_CLASS = 'dev.pluff.Server'

// Paths — backend is stack-aware
const FRONTEND_DIR  = path.join(ENGINE_DIR, 'frontend', isDesktop ? 'react-vite' : activeStack)
const BACKEND_DIR   = path.join(ENGINE_DIR, 'backend', activeBackend)
const TATEMONOS_DIR = path.join(ROOT_DIR, 'tatemonos')
// ASP.NET and Spring Boot execute jobs in-process; Go owns its worker in the API process.
const noQueueProcess = isAspnet || isGo || isRust || isSpring

// Database — each tatemono has its own sqlite file or Postgres database
const isPg      = !noBackend && arkzenJson.activeDatabase === 'pgsql'
const engineEnv = fs.existsSync(path.join(BACKEND_DIR, '.env')) ? fs.readFileSync(path.join(BACKEND_DIR, '.env'), 'utf-8') : ''
const engineEnvValue = (key, def) => engineEnv.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim() || def
const PROJECTS_DIR  = path.join(ROOT_DIR, 'projects')

// ─────────────────────────────────────────────
// LOGGING
// ─────────────────────────────────────────────

function log(msg)     { console.log(`\n  ✦ ${msg}`) }
function success(msg) { console.log(`  ✓ ${msg}`) }
function warn(msg)    { console.log(`  ⚠ ${msg}`) }
function skip(msg)    { console.log(`  – ${msg} (skipped)`) }
function divider()    { console.log('\n' + '─'.repeat(50)) }

function findSystemPython() {
  const candidates = process.platform === 'win32'
    ? [['py', ['-3']], ['python', []], ['python3', []]]
    : [['python3', []], ['python', []]]
  for (const [command, prefix] of candidates) {
    const result = spawnSync(command, [...prefix, '--version'], { stdio: 'ignore', windowsHide: true })
    if (!result.error && result.status === 0) return { command, prefix }
  }
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    const installDir = path.join(process.env.LOCALAPPDATA, 'Programs', 'Python')
    if (fs.existsSync(installDir)) {
      const installs = fs.readdirSync(installDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && /^Python\d+$/i.test(entry.name))
        .map(entry => path.join(installDir, entry.name, 'python.exe'))
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
      for (const command of installs) {
        const result = spawnSync(command, ['--version'], { stdio: 'ignore', windowsHide: true })
        if (!result.error && result.status === 0) return { command, prefix: [] }
      }
    }
  }
  return null
}

// ─────────────────────────────────────────────
// VALIDATE INPUT
// ─────────────────────────────────────────────

const tatName = process.argv.slice(2).find(a => !a.startsWith('--'))
if (!tatName) {
  console.log('\n  Usage: node export.js <tatemono-name> [--stack=<name>] [--backend=<name|none>] [--docker] [--openapi] [--api-url=<url>]')
  console.log('         node export.js <tatemono-name> --openapi        (also write openapi.json + Swagger UI page)')
  console.log('         node export.js <tatemono-name> --backend=none   (frontend only, no backend)')
  console.log('         node export.js <godot-tatemono> --stack=godot')
  console.log('         node export.js <unity-tatemono> --stack=unity')
  console.log('         node export.js <unreal-tatemono> --stack=unreal')
  console.log('         node export.js <extension-tatemono> --stack=wxt     (Chrome extension: .zip + unpacked folder)')
  console.log('  Example: node export.js inventory-management\n')
  console.log('  Available tatemonos:')
  if (fs.existsSync(TATEMONOS_DIR)) {
    fs.readdirSync(TATEMONOS_DIR).forEach(f => {
      if (fs.existsSync(path.join(TATEMONOS_DIR, f, 'core.tsx')))
        console.log(`    - ${f}`)
    })
  }
  console.log('')
  process.exit(1)
}

const tatPath = path.join(TATEMONOS_DIR, tatName, 'core.tsx')
if (!fs.existsSync(tatPath)) {
  console.log(`\n  ✗ Tatemono not found: tatemonos/${tatName}/core.tsx\n`)
  process.exit(1)
}

if (activeStack === 'godot') {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(tatName)) {
    console.error('\n  ✗ Godot Tatemono names may contain only lowercase letters, digits, and hyphens.\n')
    process.exit(1)
  }
  try {
    const { generateGodotProject } = await import('./engine/game/godot/generator.js')
    const result = generateGodotProject({
      tatemonoPath: tatPath,
      outputDir: path.join(PROJECTS_DIR, 'godot', tatName),
    })
    divider()
    success(`Godot project generated: ${path.relative(ROOT_DIR, result.outputDir)}`)
    log(`Scenes: ${result.scenes.join(', ')}`)
    log(`Assets copied and arranged: ${result.copiedAssetCount}`)
    if (result.freeFiles.written.length) log(`Free files written: ${result.freeFiles.written.join(', ')}`)
    if (result.freeFiles.overridden.length) warn(`Free files replaced generated files: ${result.freeFiles.overridden.join(', ')}`)
    if (result.missingOptionalAssets.length) {
      warn(`Optional assets not found: ${result.missingOptionalAssets.join(', ')}`)
    }
    log('Open project.godot in Godot 4. The web/backend stack and active Pluff configuration were not used.')
    divider()
  } catch (error) {
    console.error(`\n  ✗ ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  }
  process.exit(0)
}

if (activeStack === 'unity') {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(tatName)) {
    console.error('\n  ✗ Unity Tatemono names may contain only lowercase letters, digits, and hyphens.\n')
    process.exit(1)
  }
  try {
    const { generateUnityProject } = await import('./engine/game/unity/generator.js')
    const result = generateUnityProject({
      tatemonoPath: tatPath,
      outputDir: path.join(PROJECTS_DIR, 'unity', tatName),
    })
    divider()
    success(`Unity project generated: ${path.relative(ROOT_DIR, result.outputDir)}`)
    log(`Unity Editor: ${result.unityVersion}`)
    log(`Scene: ${result.scene}`)
    log(`Declared assets copied: ${result.copiedAssetCount}`)
    if (result.freeFiles.written.length) log(`Free files written: ${result.freeFiles.written.join(', ')}`)
    if (result.freeFiles.overridden.length) warn(`Free files replaced generated files: ${result.freeFiles.overridden.join(', ')}`)
    log('Open this folder in Unity Hub or build it with the included GameCI workflow.')
    divider()
  } catch (error) {
    console.error(`\n  ✗ ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  }
  process.exit(0)
}

if (activeStack === 'unreal') {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(tatName)) {
    console.error('\n  ✗ Unreal Tatemono names may contain only lowercase letters, digits, and hyphens.\n')
    process.exit(1)
  }
  try {
    const { generateUnrealProject } = await import('./engine/game/unreal/generator.js')
    const result = generateUnrealProject({
      tatemonoPath: tatPath,
      outputDir: path.join(PROJECTS_DIR, 'unreal', tatName),
    })
    divider()
    success(`Unreal project generated: ${path.relative(ROOT_DIR, result.outputDir)}`)
    log(`Unreal Engine: ${result.unrealVersion} (module ${result.moduleName})`)
    log(`Scenes: ${result.scenes.join(', ')} (starts in ${result.scene})`)
    if (result.freeFiles.written.length) log(`Free files written: ${result.freeFiles.written.join(', ')}`)
    if (result.freeFiles.overridden.length) warn(`Free files replaced generated files: ${result.freeFiles.overridden.join(', ')}`)
    log(`Open ${result.moduleName}.uproject in Unreal Engine ${result.unrealVersion}; it offers to build the C++ module. Packaging scripts are in Scripts/.`)
    divider()
  } catch (error) {
    console.error(`\n  ✗ ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  }
  process.exit(0)
}

// ─────────────────────────────────────────────
// BROWSER EXTENSION (wxt)
//
// Emits the @arkzen:ext blocks into engine/frontend/wxt, builds them with WXT and copies the result to
// projects/extension/<tatemono>/. Like the game exports, it does not use the web/backend stack or arkzen.json.
//   chrome-mv3/        the unpacked extension (chrome://extensions > Developer mode > Load unpacked)
//   <name>-<version>-chrome.zip   the package for the Chrome Web Store (when zip is not false)
// ─────────────────────────────────────────────
if (activeStack === 'wxt' || activeStack === 'extension') {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(tatName)) {
    console.error('\n  ✗ Extension Tatemono names may contain only lowercase letters, digits, and hyphens.\n')
    process.exit(1)
  }
  const EXT_STACK_DIR = path.join(ENGINE_DIR, 'frontend', 'wxt')
  const npmCommand    = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const run = (command, args, label) => {
    const result = spawnSync(command, args, { cwd: EXT_STACK_DIR, stdio: 'inherit', shell: process.platform === 'win32' && command === npmCommand })
    if (result.error || result.status !== 0) throw new Error(`${label} failed`)
  }
  try {
    if (!fs.existsSync(path.join(EXT_STACK_DIR, 'node_modules', 'wxt', 'package.json'))) {
      log('Installing the extension stack (first export only)...')
      run(npmCommand, ['install', '--no-audit', '--no-fund'], 'npm install in engine/frontend/wxt')
    }
    const tsxCli = path.join(EXT_STACK_DIR, 'node_modules', 'tsx', 'dist', 'cli.mjs')
    const wxtCli = path.join(EXT_STACK_DIR, 'node_modules', 'wxt', 'bin', 'wxt.mjs')

    log(`Emitting ${tatName}`)
    run(process.execPath, [tsxCli, 'arkzen/emit.ts', tatPath], 'The extension emitter')
    const settings = JSON.parse(fs.readFileSync(path.join(EXT_STACK_DIR, 'arkzen', 'generated', 'ext.json'), 'utf-8'))

    const outDir = path.join(PROJECTS_DIR, 'extension', tatName)
    fs.rmSync(outDir, { recursive: true, force: true })
    fs.mkdirSync(outDir, { recursive: true })
    fs.rmSync(path.join(EXT_STACK_DIR, '.output'), { recursive: true, force: true })

    const built = []
    for (const browser of settings.browsers) {
      log(`Building for ${browser}`)
      // Firefox defaults to Manifest V2 in WXT, so Manifest V3 is always asked for explicitly.
      const mv = browser === 'firefox' ? ['--mv3'] : []
      run(process.execPath, [wxtCli, 'build', '-b', browser, ...mv], `WXT build (${browser})`)
      fs.cpSync(path.join(EXT_STACK_DIR, '.output', `${browser}-mv3`), path.join(outDir, `${browser}-mv3`), { recursive: true })
      built.push(`${browser}-mv3/`)
      if (settings.zip) {
        run(process.execPath, [wxtCli, 'zip', '-b', browser, ...mv], `WXT zip (${browser})`)
        const zipFile = `${settings.zipName}-${settings.version}-${browser}.zip`
        fs.copyFileSync(path.join(EXT_STACK_DIR, '.output', zipFile), path.join(outDir, zipFile))
        built.push(zipFile)
      }
    }
    // Firefox reviewers ask for the source code of a bundled extension. Written once, next to the zips.
    const sourcesZip = `${settings.zipName}-${settings.version}-sources.zip`
    if (settings.sourcesZip && fs.existsSync(path.join(EXT_STACK_DIR, '.output', sourcesZip))) {
      fs.copyFileSync(path.join(EXT_STACK_DIR, '.output', sourcesZip), path.join(outDir, sourcesZip))
      built.push(sourcesZip)
    }
    fs.writeFileSync(path.join(outDir, 'INSTALL.md'), [
      `# ${settings.name} ${settings.version}`,
      '',
      ...(settings.browsers.includes('chrome') ? [
        '## Try it in Chrome',
        '1. Open chrome://extensions and turn on Developer mode.',
        '2. Choose "Load unpacked" and select the `chrome-mv3` folder next to this file.',
        '',
      ] : []),
      ...(settings.browsers.includes('firefox') ? [
        '## Try it in Firefox',
        '1. Open about:debugging#/runtime/this-firefox.',
        '2. Choose "Load Temporary Add-on" and select `manifest.json` inside the `firefox-mv3` folder.',
        '   (A temporary add-on is removed when Firefox closes.)',
        '',
      ] : []),
      ...(settings.zip ? [
        '## Publish',
        ...(settings.browsers.includes('chrome') ? [`- Chrome Web Store: upload \`${settings.zipName}-${settings.version}-chrome.zip\` in the Developer Dashboard.`] : []),
        ...(settings.browsers.includes('firefox') ? [`- Firefox Add-ons: upload \`${settings.zipName}-${settings.version}-firefox.zip\`. Reviewers ask for the source of a bundled extension, so set \`sources_zip: true\` in @arkzen:ext:export to get a \`${settings.zipName}-${settings.version}-sources.zip\` as well.`] : []),
        '',
      ] : []),
    ].join('\n'))

    divider()
    success(`Extension built: ${path.relative(ROOT_DIR, outDir)}`)
    log(`Contains: ${built.join(', ')}`)
    log('See INSTALL.md in that folder for how to load it in each browser. The web/backend stack and active Pluff configuration were not used.')
    divider()
  } catch (error) {
    console.error(`\n  ✗ ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  }
  process.exit(0)
}

const PROJECT_DIR = path.join(PROJECTS_DIR, tatName)
const PROJ_FRONT  = path.join(PROJECT_DIR, 'frontend')
// For Inertia: backend IS the project root (monolith — no frontend/ split).
// For others:  backend lives at PROJECT_DIR/backend/
const PROJ_BACK   = isInertia ? PROJECT_DIR : path.join(PROJECT_DIR, 'backend')

// ─────────────────────────────────────────────
// SINGLE-TATEMONO SCOPING HELPERS
//
// The engine folders hold EVERY tatemono. An export must keep only the one being exported,
// so the copy filters / cleanup steps below use these helpers to tell "mine" from "other".
// ─────────────────────────────────────────────

// --site-url=https://example.com → used by the generated sitemap.xml / robots.txt
const siteUrlFlag = process.argv.find(a => a.startsWith('--site-url='))

const ALL_TATEMONO_NAMES = fs.existsSync(TATEMONOS_DIR)
  ? fs.readdirSync(TATEMONOS_DIR).filter(f => fs.existsSync(path.join(TATEMONOS_DIR, f, 'core.tsx')))
  : []

// "crud-test" / "CrudTest" / "crud_test" all normalize to "crudtest"
const normName = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')

// true when `rel` is <base>/<tatName> (folder, or <tatName>.ext file) or something inside it.
// Exact match, so exporting "shan-shan" no longer also keeps "shan-shan-2".
function isThisTatemono(rel, base) {
  const head = `${base}/${tatName}`
  if (rel === head) return true
  if (!rel.startsWith(head)) return false
  const next = rel[head.length]
  return next === '/' || next === '.'
}

// Which tatemono a generated file/folder name belongs to ("shan-shan.animations.ts",
// "crud-test_index.tsx", "crud-test"). Longest tatemono name wins. null = shared file.
function ownerOfGenerated(name) {
  let owner = null
  for (const t of ALL_TATEMONO_NAMES) {
    if (name === t || name.startsWith(`${t}.`) || name.startsWith(`${t}_`)) {
      if (!owner || t.length > owner.length) owner = t
    }
  }
  return owner
}
// <tatemono>.animations.ts / .scripts.ts / .<x>.script.ts — always per-tatemono
const PER_TATEMONO_GENERATED = /\.(animations|scripts|script)\.(ts|tsx|js)$/
const belongsToOtherTatemono = (name) => {
  const owner = ownerOfGenerated(name)
  if (owner) return owner !== tatName
  // A tatemono that was removed from tatemonos/ can leave generated files behind in the engine
  // folders; they still carry its name as a prefix, so they are "other" too.
  if (PER_TATEMONO_GENERATED.test(name)) return !name.startsWith(`${tatName}.`)
  return false
}

// The engine's arkzen.json registers every tatemono. An export gets a registry with only its own.
function scopeArkzenJson(file) {
  if (!fs.existsSync(file)) return
  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf-8'))
    if (Array.isArray(json.modules)) json.modules = json.modules.filter(m => m.name === tatName)
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n')
    success(`${path.relative(PROJECT_DIR, file).replace(/\\/g, '/')} (registry scoped to ${tatName})`)
  } catch (error) {
    warn(`Could not scope ${path.basename(file)}: ${error.message}`)
  }
}

// Move every entry of <dir>/<tatName>/ up into <dir>/ (used to drop the /<tatName> URL prefix)
function hoistTatemonoDir(parentDir, label) {
  const tatDir = path.join(parentDir, tatName)
  if (!fs.existsSync(tatDir)) {
    warn(`${label}/${tatName}/ not found — skipping folder hoist`)
    return
  }
  for (const entry of fs.readdirSync(tatDir)) {
    const dest = path.join(parentDir, entry)
    if (fs.existsSync(dest)) {
      warn(`${label}/${entry} already exists — not overwritten by hoist`)
      continue
    }
    fs.renameSync(path.join(tatDir, entry), dest)
  }
  fs.rmSync(tatDir, { recursive: true, force: true })
  success(`${label}/${tatName}/ → ${label}/ (folder hoisted)`)
}

// Patch a copied engine file. Warns (never throws) when the expected code is not there.
function patchExportFile(file, patches, label) {
  if (!fs.existsSync(file)) return false
  const before = fs.readFileSync(file, 'utf-8')
  let src = before
  for (const [from, to] of patches) src = src.replace(from, to)
  if (src === before) {
    warn(`${label}: expected code not found — not patched`)
    return false
  }
  fs.writeFileSync(file, src)
  success(label)
  return true
}

// ─────────────────────────────────────────────
// READ TATEMONO META
// ─────────────────────────────────────────────

const content     = fs.readFileSync(tatPath, 'utf-8')
const tatUsesBackend = content.includes('auth: true')
  || content.includes('@arkzen:api')
  || content.includes('@arkzen:database:')
  || content.includes('@arkzen:jobs:')
  || content.includes('@arkzen:events:')
  || content.includes('@arkzen:realtime:')
  || content.includes('@arkzen:notifications:')
  || content.includes('@arkzen:mail:')
  || content.includes('@arkzen:console:')
  || content.includes('@arkzen:routes')
// With --backend=none every backend flag is off, so the export takes the same frontend-only path
// a tatemono without backend blocks already takes.
const hasBackend  = !noBackend && tatUsesBackend
const hasRealtime = !noBackend && (content.includes('@arkzen:realtime') || content.includes('@arkzen:notifications'))
const hasJobs     = !noBackend && (content.includes('@arkzen:jobs') || content.includes('@arkzen:events') || content.includes('@arkzen:console:'))
const tatSnake    = tatName.replace(/-/g, '_')
const pgDatabaseName = `${engineEnvValue('ARKZEN_DB_PREFIX', 'pluff')}_${tatSnake}`.toLowerCase()

divider()
console.log(`\n  ARKZEN — Exporting tatemono: ${tatName}\n`)
divider()
console.log(`  Version:  v10`)
console.log(`  Tatemono: ${tatName}`)
console.log(`  Stack:    ${activeStack}`)
console.log(`  Backend:  ${hasBackend}`)
console.log(`  Backend target: ${noBackend ? 'none (frontend only)' : activeBackend}`)
if (noBackend && tatUsesBackend) {
  console.log('  ⚠ This tatemono uses backend features (auth / api / database / jobs / realtime).')
  console.log('    They are NOT exported. Pages that call /api/* will fail until you add your own backend.')
}
console.log(`  Realtime: ${hasRealtime}`)
console.log(`  Jobs:     ${hasJobs}`)
if (isInertia) console.log(`  Mode:     Inertia monolith — backend IS the project (no frontend/ folder)`)
if (isNative)  console.log(`  Mode:     React Native (frontend only, no backend)`)
if (noBackend) console.log(`  Mode:     Frontend only (--backend=none)`)
if (isTauri)    console.log(`  Mode:     Tauri desktop — React+Vite renderer`)
if (isElectron) console.log(`  Mode:     Electron desktop — React+Vite renderer`)

// ─────────────────────────────────────────────
// CLEAN OUTPUT DIRECTORY
// ─────────────────────────────────────────────

if (fs.existsSync(PROJECT_DIR)) {
  log('Cleaning previous export...')
  fs.rmSync(PROJECT_DIR, { recursive: true, force: true })
}
fs.mkdirSync(PROJECT_DIR, { recursive: true })

// ─────────────────────────────────────────────
// STEP 1 — ENGINE BUILD
// Trigger a fresh build so all generated output is up-to-date
// before we copy. A raw copy of stale output would ship the
// previous build's files — this ensures what we copy is current.
// ─────────────────────────────────────────────

log(`Triggering engine build for ${tatName}...`)

// Stack → builder file + function name mapping
// nextjs has no prefix (builder.ts / buildTatemono)
// all other stacks use a prefixed file (vite-builder.ts / buildViteTatemono, etc.)
const BUILDER_MAP = {
  'nextjs':        { file: './arkzen/core/builder',        fn: 'buildTatemono'        },
  'react-vite':    { file: './arkzen/core/vite-builder',   fn: 'buildViteTatemono'    },
  'tauri':         { file: './arkzen/core/vite-builder',   fn: 'buildViteTatemono'    },
  'electron':      { file: './arkzen/core/vite-builder',   fn: 'buildViteTatemono'    },
  'react-inertia': { file: './arkzen/core/inertia-builder',fn: 'buildInertiaTatemono' },
  'astro':         { file: './arkzen/core/astro-builder',  fn: 'buildAstroTatemono'   },
  'tanstack-start':{ file: './arkzen/core/tanstack-builder',fn:'buildTanstackTatemono'},
  'expo':          { file: './arkzen/core/expo-builder',   fn: 'buildExpoTatemono'    },
  'react-native':  { file: './arkzen/core/native-builder', fn: 'buildNativeTatemono'  },
}
const builderEntry = BUILDER_MAP[activeStack] ?? BUILDER_MAP['nextjs']

const buildScript = `
import { ${builderEntry.fn} } from '${builderEntry.file}'
${builderEntry.fn}(${JSON.stringify(tatPath)})
  .then(result => {
    if (result.success) { console.log('[export-build] OK'); process.exit(0) }
    else { console.error('[export-build] FAIL:', result.errors.join(', ')); process.exit(1) }
  })
  .catch(err => { console.error('[export-build] FATAL:', err.message); process.exit(1) })
`

const tmpScript = path.join(FRONTEND_DIR, '__export_build_tmp.ts')
fs.writeFileSync(tmpScript, buildScript)

const tsxCli = path.join(FRONTEND_DIR, 'node_modules', 'tsx', 'dist', 'cli.mjs')
const buildResult = spawnSync(process.execPath, [tsxCli, tmpScript], {
  cwd:     FRONTEND_DIR,
  stdio:   'pipe',
  env:     { ...process.env, ARKZEN_BACKEND_URL: 'http://localhost:8000', ARKZEN_ENGINE_SECRET: 'arkzen-engine-secret' },
  timeout: 60000,
})

if (fs.existsSync(tmpScript)) fs.unlinkSync(tmpScript)

const buildOut = (buildResult.stdout || '').toString()
const buildErr = (buildResult.stderr || '').toString()

if (buildResult.status === 0 && buildOut.includes('[export-build] OK')) {
  success('Engine build complete')
} else {
  warn('Engine build had issues — proceeding with existing output')
  if (buildErr) warn(buildErr.split('\n').filter(l => l.trim()).slice(0, 6).join(' | '))
}

// ─────────────────────────────────────────────
// STEP 2 — COPY ENTIRE BACKEND
//
// Copy the full backend folder exactly as the engine produced it.
// We exclude only:
//   - vendor/                       (too large; reinstalled fresh below)
//   - *.sqlite                      (tatemono's DB handled separately in step 4)
//   - ArkzenEngineController.php    (engine-internal only, not needed standalone)
//   - ArkzenEngineMiddleware.php    (engine-internal only)
//   - routes/arkzen.php             (engine's multi-module route registrar, replaced below)
//   - routes/api.php                (engine's combined api routes, replaced below)
//   - bootstrap/app.php             (engine registers ALL tatemono DBs, replaced below)
//
// Everything else — namespaces, table prefixes, DB connections,
// route prefixes, file structure — is kept exactly as generated.
//
// Stack rules:
//   Native  → skip entirely (no backend)
//   Inertia → copy to PROJECT_DIR root (it IS the full project)
//   Others  → copy to PROJECT_DIR/backend/
// ─────────────────────────────────────────────

const BACKEND_EXCLUDE_FILTER = (src) => {
  const rel = path.relative(BACKEND_DIR, src).replace(/\\/g, '/')
  if (rel.startsWith('vendor/')  || rel === 'vendor')  return false
  if (rel.startsWith('.venv/') || rel === '.venv')       return false
  if (rel.split('/').includes('__pycache__'))            return false
  if (isSpring && (rel === 'target' || rel.startsWith('target/'))) return false
  if (isRust && (rel === 'target' || rel.startsWith('target/'))) return false
  if (rel === '.env')                                   return false
  if (src.endsWith('.sqlite'))                          return false
  if (rel.includes('Controllers/Arkzen/ArkzenEngineController.php')) return false
  if (rel.includes('Middleware/ArkzenEngineMiddleware.php'))          return false
  if (rel === 'routes/arkzen.php')                      return false
  if (rel === 'routes/api.php')                         return false
  if (rel === 'bootstrap/app.php')                      return false
    if (rel === 'public/storage')                         return false
  try { if (fs.lstatSync(src).isSymbolicLink()) return false } catch {}
  return true
}

if (isNative) {
  skip('Backend (React Native — frontend only, no backend needed)')
} else if (isInertia) {
  // Inertia: backend IS the project. Copy to PROJECT_DIR root directly.
  // There is no frontend/ folder — React pages live inside resources/js/
  // inside this same Laravel project. Only copy this tatemono's Inertia pages.
  log('Copying laravel-inertia monolith to project root...')
  fs.cpSync(BACKEND_DIR, PROJECT_DIR, {
    recursive: true,
    filter: (src) => {
      if (!BACKEND_EXCLUDE_FILTER(src)) return false
      const rel = path.relative(BACKEND_DIR, src).replace(/\\/g, '/')
      // Scope Inertia pages to this tatemono only.
      // Page folders are PascalCase (Pages/CrudTest) while tatemono names are kebab-case
      // (crud-test), so compare normalized names. Pages/Hub.tsx (engine hub) is dropped too.
      if (rel.startsWith('resources/js/Pages/') && rel !== 'resources/js/Pages/') {
        return normName(rel.split('/')[3]) === normName(tatName)
      }
      // Engine sitemap/robots list every tatemono — regenerated for this one in step 15
      if (rel === 'public/sitemap.xml' || rel === 'public/robots.txt') return false
      // Other tatemonos' public assets
      if (rel.startsWith('public/tatemonos/') && !isThisTatemono(rel, 'public/tatemonos')) return false
      // bootstrap/app.php registers EVERY file in routes/modules — keep only <tatName>.php /
      // <tatName>.pages.php. Drops other tatemonos' routes and the engine's hub.pages.php.
      if (rel.startsWith('routes/modules/') && rel !== 'routes/modules/') {
        return path.basename(rel).startsWith(`${tatName}.`)
      }
      // Other tatemonos' generated animations/scripts
      if (rel.startsWith('resources/js/arkzen/generated/')) {
        const generatedEntry = rel.split('/')[4]
        if (generatedEntry && belongsToOtherTatemono(generatedEntry)) return false
      }
      // node_modules inside laravel-inertia (Vite deps) — skip, reinstalled later
      if (rel.startsWith('node_modules') || rel === 'node_modules') return false
      return true
    }
  })
  success('laravel-inertia monolith copied to project root')
  scopeArkzenJson(path.join(PROJECT_DIR, 'arkzen.json'))
} else if (hasBackend) {
  log(`Copying ${activeBackend} backend...`)
  fs.cpSync(BACKEND_DIR, PROJ_BACK, {
    recursive: true,
    filter: BACKEND_EXCLUDE_FILTER
  })
  success('Backend copied')
} else {
  skip('Backend (frontend-only tatemono)')
}

// ─────────────────────────────────────────────
// STEP 3 — COPY ENTIRE FRONTEND
//
// Copy the full frontend folder exactly as the engine produced it.
// We exclude only:
//   - node_modules/              (copied separately to avoid filter overhead)
//   - .next/                     (build cache, irrelevant in export)
//   - arkzen/core/builder.ts     (builds tatemonos — engine-only, not needed)
//   - arkzen/core/watcher.ts     (watches for changes — engine-only)
//   - arkzen/core/backend-bridge.ts (calls engine API — engine-only)
//   - validate.js                (engine validator — not needed standalone)
//   - arkzen.ts / arkzen.config.ts (engine entry — not needed standalone)
//   - tatemono/                  (source DSL files — not needed in export)
//   - arkzen/generated/          (written fresh below in step 8)
//   - app/                       (pages scoped per-tatemono in step 3a below)
//
// Stack rules:
//   Inertia → skip (frontend already inside the monolith copied in step 2)
//   Native  → copy builder output only (no node_modules — Expo handles deps)
//   Others  → copy full frontend stack
// ─────────────────────────────────────────────

const ENGINE_ONLY_FRONTEND = new Set([
  // nextjs (no prefix)
  'arkzen/core/builder.ts',
  'arkzen/core/watcher.ts',
  // react-vite
  'arkzen/core/vite-builder.ts',
  'arkzen/core/vite-watcher.ts',
  'arkzen/core/vite-router.ts',
  // react-inertia
  'arkzen/core/inertia-builder.ts',
  'arkzen/core/inertia-watcher.ts',
  // astro
  'arkzen/core/astro-builder.ts',
  'arkzen/core/astro-watcher.ts',
  // tanstack-start
  'arkzen/core/tanstack-builder.ts',
  'arkzen/core/tanstack-watcher.ts',
  // shared engine-only
  'arkzen/core/backend-bridge.ts',
  'arkzen/core/parser.ts',
  'arkzen/core/validator.ts',
  'validate.js',
  'arkzen.ts',
  'arkzen.config.ts',
])

if (isInertia) {
  skip('Frontend copy (Inertia — React pages already inside the monolith at resources/js/)')
} else {
  log('Copying frontend base...')

  fs.cpSync(FRONTEND_DIR, PROJ_FRONT, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(FRONTEND_DIR, src).replace(/\\/g, '/')
      if (rel.startsWith('node_modules') || rel === 'node_modules') return false
      if (rel.startsWith('.next')        || rel === '.next')         return false
      if (ENGINE_ONLY_FRONTEND.has(rel))                             return false
      if (rel.startsWith('tatemono/'))                               return false
      if (rel.startsWith('arkzen/generated/'))                       return false
      // The engine's sitemap.xml / robots.txt list EVERY tatemono (and use /<tatName>/ URLs that
      // no longer exist after the hoist). Never copy them — step 15 writes ones for this tatemono.
      if (rel === 'public/sitemap.xml' || rel === 'public/robots.txt') return false
      // Scope public tatemono assets — exclude other tatemonos' assets entirely
      if (rel.startsWith('public/tatemonos/') && !isThisTatemono(rel, 'public/tatemonos')) return false
      // app/ pages — scope to this tatemono only
      // Next.js:    keep app/layout.tsx (root layout)
      // Expo:       keep app/_layout.tsx (root layout) + app/${tatName}/ routes
      // Others:     keep app/${tatName}/ only
      if (rel.startsWith('app/') && rel !== 'app/') {
        if (rel === 'app/layout.tsx')               return true   // Next.js root layout
        if (rel === 'app/_layout.tsx')              return true   // Expo root layout
        if (isThisTatemono(rel, 'app'))             return true   // this tatemono's routes
        return false
      }
      // React-Vite / others: src/pages/ — only this tatemono's pages kept
      if (rel.startsWith('src/pages/') && rel !== 'src/pages/') {
        if (isThisTatemono(rel, 'src/pages')) return true
        return false
      }
      // Expo: src/screens/ — only this tatemono's screens kept
      if (rel.startsWith('src/screens/') && rel !== 'src/screens/') {
        if (isThisTatemono(rel, 'src/screens')) return true
        return false
      }
      // TanStack Start: file routes live in src/routes/<tatName>/. Other tatemonos' routes import
      // pages that are not in the export (build error), and src/routes/index.tsx + api/ are the
      // engine hub and its registry endpoint. routeTree.gen.ts is rebuilt by the TanStack plugin
      // from whatever routes remain, so the engine's all-tatemono copy must not ship.
      if (activeStack === 'tanstack-start') {
        if (rel.startsWith('src/routes/') && rel !== 'src/routes/') {
          if (rel === 'src/routes/__root.tsx') return true
          return isThisTatemono(rel, 'src/routes')
        }
        if (rel === 'src/routeTree.gen.ts')                  return false
        if (rel === 'src/arkzen/generated/routeTree.ts')     return false
      }
      // src/arkzen/generated/ (Astro / TanStack / Vite): drop other tatemonos' animations,
      // scripts, islands, components and styles, plus the Astro hub island.
      if (rel.startsWith('src/arkzen/generated/')) {
        const gen = rel.split('/')            // src, arkzen, generated, <entry>, <child>
        if (gen[3] && belongsToOtherTatemono(gen[3])) return false
        // islands/<tatName>_<page>.tsx, components/<tatName>/, styles/<tatName>/ — keep only this tatemono's
        // (this also drops islands/hub.tsx and leftovers of tatemonos that no longer exist)
        if (gen[4] && ['islands', 'components', 'styles'].includes(gen[3])) {
          const mine = gen[3] === 'islands' ? gen[4].startsWith(`${tatName}_`) : gen[4] === tatName
          if (!mine) return false
        }
      }
      return true
    }
  })
  success('Frontend base copied')

  // The engine arkzen.json registers every tatemono — keep only this one
  scopeArkzenJson(path.join(PROJ_FRONT, 'arkzen.json'))

  // Astro: the route registry lists every tatemono's routes — keep only this tatemono's lines
  if (activeStack === 'astro') {
    const astroRoutesTs = path.join(PROJ_FRONT, 'src', 'arkzen', 'generated', 'routes.ts')
    if (fs.existsSync(astroRoutesTs)) {
      const kept = fs.readFileSync(astroRoutesTs, 'utf-8').split('\n')
        .filter(line => !/^\s*\{ name: '/.test(line) || line.includes(`{ name: '${tatName}/`))
      fs.writeFileSync(astroRoutesTs, kept.join('\n'))
      success(`astro routes.ts scoped to ${tatName}`)
    }
  }

  if (isTauri) {
    const engineTauriDir = path.join(ENGINE_DIR, 'frontend', 'tauri', 'src-tauri')
    const projectTauriDir = path.join(PROJ_FRONT, 'src-tauri')
    fs.cpSync(engineTauriDir, projectTauriDir, { recursive: true })

    const configPath = path.join(projectTauriDir, 'tauri.conf.json')
    const tauriConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    const desktopWindow = arkzenJson.modules
      ?.find(module => module.name === tatName && module.status === 'active')
      ?.desktopConfig?.window ?? {}
    tauriConfig.productName = tatName
    tauriConfig.identifier = `com.pluff.${tatName.replace(/[^A-Za-z0-9.-]/g, '-')}`
    tauriConfig.build = {
      ...tauriConfig.build,
      beforeDevCommand: { script: 'npm run dev', cwd: '..', wait: false },
      devUrl: 'http://localhost:3001',
      beforeBuildCommand: { script: 'npm run build', cwd: '..' },
      frontendDist: '../dist',
    }
    if (tauriConfig.app?.windows?.[0]) {
      const tauriWindow = tauriConfig.app.windows[0]
      tauriWindow.title = desktopWindow.title ?? tatName
      const windowProperties = {
        width: 'width',
        height: 'height',
        min_width: 'minWidth',
        min_height: 'minHeight',
        resizable: 'resizable',
      }
      for (const [dslProperty, tauriProperty] of Object.entries(windowProperties)) {
        if (desktopWindow[dslProperty] !== undefined) {
          tauriWindow[tauriProperty] = desktopWindow[dslProperty]
        }
      }
      if (desktopWindow.fullscreenable === false) {
        warn('Tauri cannot portably disable the platform fullscreen controls')
      }
    }
    fs.writeFileSync(
      path.join(projectTauriDir, 'desktop-config.json'),
      JSON.stringify({
        modules: Object.keys(desktopWindow).length
          ? [{ name: tatName, status: 'active', desktopConfig: { window: desktopWindow } }]
          : [],
      }, null, 2)
    )
    fs.writeFileSync(configPath, JSON.stringify(tauriConfig, null, 2))

    // v15.0: @arkzen:desktop:frame:tauri — ship this Tatemono's frame with the shell.
    // build.rs reads desktop-frame.rs next to Cargo.toml; no block, no file.
    const tauriFrameSource = fs.readFileSync(tatPath, 'utf-8')
    const tauriFrameOpen = tauriFrameSource.search(/\/\* @arkzen:desktop:frame:tauri(?=\s|\*\/)/)
    if (tauriFrameOpen !== -1) {
      const openingEnd = tauriFrameSource.indexOf('*/', tauriFrameOpen) + 2
      const closeAt = tauriFrameSource.indexOf('/* @arkzen:desktop:frame:tauri:end */', openingEnd)
      const frameBody = closeAt === -1 ? '' : tauriFrameSource.slice(openingEnd, closeAt).trim()
      if (frameBody) {
        fs.writeFileSync(path.join(projectTauriDir, 'desktop-frame.rs'), frameBody + '\n')
        success('Tauri frame included (@arkzen:desktop:frame:tauri)')
      }
    }
    success('Tauri shell copied and configured for this exported Tatemono')
  }

  if (isElectron) {
    const engineElectronDir = path.join(ENGINE_DIR, 'frontend', 'electron')
    const projectElectronDir = path.join(PROJ_FRONT, 'electron-shell')
    fs.cpSync(engineElectronDir, projectElectronDir, {
      recursive: true,
      filter: (src) => !src.includes('node_modules'),
    })
    success('Electron shell copied for this exported Tatemono')
  }

  // ── Regenerate src/arkzen/generated/routes.ts for this tatemono only
  // Parse the engine's routes.ts to extract only this tatemono's ROUTE entries,
  // then regenerate the file from scratch — no other tatemono imports, no
  // ARKZEN_ERROR_BOUNDARIES for tatemonos that don't exist in this export.
  const projRoutesTs = path.join(PROJ_FRONT, 'src', 'arkzen', 'generated', 'routes.ts')
  // Astro's routes.ts has a different format ({ name, path, layout }, no // ROUTE: markers) and is
  // scoped above — regenerating it here produced an empty React-Router style file.
  if (fs.existsSync(projRoutesTs) && activeStack !== 'astro') {
    const routeSrc   = fs.readFileSync(projRoutesTs, 'utf-8')

    // Extract only ROUTE lines for this tatemono
    // Format: // ROUTE:<tat>:<page>:<path>:<auth>[:<ErrorBoundaryClass>]
    const routeRegex = new RegExp(`^// ROUTE:${tatName}:(.+)$`, 'gm')
    const lazyRegex  = new RegExp(`^(const ArkzenPage_[A-Za-z0-9_]+ = lazy\(\(\) => import\('@/pages/${tatName}/[^']+'\)\))$`, 'gm')

    // Collect lazy imports for this tatemono
    const lazyLines = []
    const routeEntries = []
    let errorBoundaryClass = null

    // Walk line by line to preserve ROUTE+lazy pairing
    const allLines = routeSrc.split('\n')
    let i = 0
    while (i < allLines.length) {
      const line = allLines[i]
      if (line.startsWith(`// ROUTE:${tatName}:`)) {
        // Parse: // ROUTE:<tat>:<page>:<path>:<auth>[:<BoundaryClass>]
        // Paths can contain '/' so we match auth/boundary from the END
        const withoutPrefix    = line.slice('// ROUTE:'.length) // tat:page:path:auth[:boundary]
        const abMatch          = withoutPrefix.match(/:(true|false)(?::([A-Za-z0-9_]+))?$/)
        const auth             = abMatch ? abMatch[1] === 'true' : false
        const boundary         = abMatch ? (abMatch[2] || null) : null
        const beforeAuth       = withoutPrefix.slice(0, withoutPrefix.length - (abMatch ? abMatch[0].length : 0))
        const fc               = beforeAuth.indexOf(':')
        const afterTat         = beforeAuth.slice(fc + 1)  // page:path
        const sc               = afterTat.indexOf(':')
        const page             = afterTat.slice(0, sc)
        const rpath            = afterTat.slice(sc + 1)

        // Next line should be the lazy import
        const nextLine = allLines[i + 1] || ''
        if (nextLine.includes('lazy(')) {
          // Rewrite path: remove tatemono prefix
          const rewritten = nextLine
            .replace(new RegExp(`@/pages/${tatName}/`), '@/pages/')
          lazyLines.push(rewritten)

          // Extract component name
          const compMatch = nextLine.match(/^const (ArkzenPage_\S+) =/)
          if (compMatch) {
            // Rewrite route path: strip /<tatName> prefix
            const cleanPath = rpath === `/${tatName}`
              ? '/'
              : rpath.replace(new RegExp(`^/${tatName}`), '')
            routeEntries.push(
              `  { path: '${cleanPath}', name: '${page}', tatemono: '${tatName}', component: ${compMatch[1]}, auth: ${auth} },`
            )
          }
          i += 2
          continue
        }
      }
      i++
    }

    // Check if this tatemono has an error-boundary.tsx
    const hasBoundary = errorBoundaryClass &&
      fs.existsSync(path.join(PROJ_FRONT, 'src', 'pages', 'error-boundary.tsx'))

    const boundaryBlock = hasBoundary
      ? `\nimport { ${errorBoundaryClass} } from '@/pages/error-boundary'\n\nexport const ARKZEN_ERROR_BOUNDARIES: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {\n  '${tatName}': ${errorBoundaryClass},\n}\n`
      : `\nexport const ARKZEN_ERROR_BOUNDARIES: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {}\n`

    const newRoutes = [
      `// ============================================================`,
      `// ARKZEN GENERATED — Route Registry (React+Vite)`,
      `// Scoped to: ${tatName} (exported standalone)`,
      `// ============================================================`,
      `import React from 'react'`,
      `import { lazy, ComponentType } from 'react'`,
      ``,
      `export interface ArkzenRoute {`,
      `  path:      string`,
      `  name:      string`,
      `  tatemono:  string`,
      `  component: ComponentType`,
      `  auth:      boolean`,
      `}`,
      ``,
      ...lazyLines,
      boundaryBlock,
      `export const ARKZEN_ROUTES: ArkzenRoute[] = [`,
      ...routeEntries,
      `]`,
      ``,
    ].join('\n')

    fs.writeFileSync(projRoutesTs, newRoutes)
    success(`routes.ts regenerated for ${tatName} (${routeEntries.length} route(s))`)
  }

  // Remove other tatemonos' generated files (animations, scripts, etc.)
  const projGenDir = path.join(PROJ_FRONT, 'src', 'arkzen', 'generated')
  if (fs.existsSync(projGenDir)) {
    // Only remove entries that belong to ANOTHER tatemono. The old rule ("anything not named
    // <tatName>.*") also deleted Astro's islands/, components/ and styles/ folders, which the
    // exported pages import — an Astro export could never build.
    fs.readdirSync(projGenDir).forEach(f => {
      if (f === 'routes.ts' || f === '.arkzen-ready' || f === 'auth-tatemonos.ts') return
      if (belongsToOtherTatemono(f)) {
        fs.rmSync(path.join(projGenDir, f), { recursive: true, force: true })
      }
    })
    success(`generated/ cleaned (other tatemonos' files removed, ${tatName} kept)`)
  }


  // node_modules — copy as-is (Native: skip, Expo manages its own deps)
  if (!isNative && !isDesktop) {
    log('Copying node_modules...')
    fs.cpSync(
      path.join(FRONTEND_DIR, 'node_modules'),
      path.join(PROJ_FRONT, 'node_modules'),
      { recursive: true }
    )
    success('Frontend node_modules copied')
  } else if (isDesktop) {
    skip('node_modules (Desktop export — run npm install in frontend)')
  } else {
    skip('node_modules (Native — run: npm install inside exported project)')
  }

  // ── Step 3a — Finalize standalone Arkzen core
  // The shared core is synced into each frontend stack's arkzen/core before
  // export, so copying FRONTEND_DIR above already includes the standalone files.
  log('Finalizing standalone Arkzen core...')

  const STACK_ADAPTERS = path.join(FRONTEND_DIR, 'arkzen', 'core', 'adapters')
  const PROJ_CORE      = path.join(PROJ_FRONT, 'arkzen', 'core')

  if (fs.existsSync(STACK_ADAPTERS)) {
    fs.mkdirSync(path.join(PROJ_CORE, 'adapters'), { recursive: true })
    fs.cpSync(STACK_ADAPTERS, path.join(PROJ_CORE, 'adapters'), { recursive: true })
    success(`${activeStack}/adapters → frontend/arkzen/core/adapters`)
  }

  // Patch vite.config.ts alias to point at local copy instead of ../../../shared
  if (activeStack === 'react-vite' || activeStack === 'tanstack-start' || isDesktop) {
    const vcPath = path.join(PROJ_FRONT, 'vite.config.ts')
    if (fs.existsSync(vcPath)) {
      let vc = fs.readFileSync(vcPath, 'utf-8')
      vc = vc.replace(
        /replacement:\s*path\.resolve\(__dirname,\s*['"]\.\.\/(\.\.\/)*shared\/arkzen\/core['"]\)/,
        `replacement: path.resolve(__dirname, './arkzen/core')`
      )
      fs.writeFileSync(vcPath, vc)
      success('vite.config.ts alias patched (shared → local)')
    }
  }
}

// ─────────────────────────────────────────────
// STEP 4 — COPY TATEMONO'S SQLITE FILE
//
// The engine's pre-built sqlite already has the tatemono's tables
// from its last migration run. We copy it so the export starts with
// a working database. Laravel system tables (cache, sessions,
// failed_jobs) are added by `php artisan migrate` in step 12.
//
// If the sqlite doesn't exist or is empty, we create a blank file
// and let migrate build everything from scratch.
//
// Inertia: dest is PROJECT_DIR (monolith root)
// Others:  dest is PROJ_BACK
// Native:  skip (no backend)
// ─────────────────────────────────────────────

if (!isNative && hasBackend && isPg) {
  skip(`SQLite copy (PostgreSQL — export uses database ${pgDatabaseName})`)
} else if (!isNative && hasBackend) {
  log('Copying SQLite database...')

  const databaseRelativeDir = isGo ? path.join('storage', 'databases') : path.join('database', 'arkzen')
  const engSqlite  = path.join(BACKEND_DIR, databaseRelativeDir, `${tatName}.sqlite`)
  const destDbDir  = path.join(PROJ_BACK, databaseRelativeDir)
  const destSqlite = path.join(destDbDir, `${tatName}.sqlite`)

  fs.mkdirSync(destDbDir, { recursive: true })

  if (fs.existsSync(engSqlite) && fs.statSync(engSqlite).size > 0) {
    fs.copyFileSync(engSqlite, destSqlite)
    success(`${databaseRelativeDir}/${tatName}.sqlite copied (pre-built, already migrated)`)
  } else {
    fs.writeFileSync(destSqlite, '')
    warn(`${databaseRelativeDir}/${tatName}.sqlite not found in engine — created empty; the backend build will configure its schema`)
  }
} else {
  skip('SQLite copy' + (isNative ? ' (Native)' : ' (frontend-only)'))
}

// ─────────────────────────────────────────────
// STEP 4b — COPY TATEMONO ASSETS
//
// If tatemonos/<name>/assets/ exists, copy files into the exported
// project's public/assets/<name>/ categorized by file type.
// Inertia: public/ is inside the monolith root
// Native:  assets/ at project root (no public/)
// Others:  frontend/public/assets/<name>/
// ─────────────────────────────────────────────

log('Checking for tatemono assets...')

// Mirror the exact engine path: tatemonos/<name>/assets/ → public/tatemonos/<name>/assets/
// This keeps all paths in code (e.g. /tatemonos/shan-shan/assets/images/photo.jpg) working as-is.
const srcAssetsPath = path.join(TATEMONOS_DIR, tatName, 'assets')
if (fs.existsSync(srcAssetsPath)) {
  try {
    const assetsDestBase = isInertia
      ? path.join(PROJECT_DIR, 'public', 'tatemonos', tatName, 'assets')
      : isNative
        ? path.join(PROJECT_DIR, 'assets', tatName)
        : path.join(PROJ_FRONT, 'public', 'tatemonos', tatName, 'assets')
    fs.cpSync(srcAssetsPath, assetsDestBase, { recursive: true })
    success(`Assets copied → public/tatemonos/${tatName}/assets/`)
  } catch (err) {
    warn(`Could not copy assets: ${err.message}`)
  }
} else {
  success('No assets folder found (optional)')
}

// ─────────────────────────────────────────────
// Free files (@arkzen:file)
// custom/<name>/ holds every file the tatemono wrote with the default
// (no-prefix) path. Files written with {frontend} / {backend} / {app} /
// {desktop} already live inside those stack folders and travel with them.
// Files written to the project root with a leading "/" are NOT exported.
// ─────────────────────────────────────────────
const srcCustomPath = path.join(ROOT_DIR, 'custom', tatName)
if (fs.existsSync(srcCustomPath)) {
  try {
    const customDest = path.join(PROJECT_DIR, 'custom', tatName)
    fs.cpSync(srcCustomPath, customDest, { recursive: true })
    success(`Free files copied → custom/${tatName}/`)
  } catch (err) {
    warn(`Could not copy free files: ${err.message}`)
  }
}

// ─────────────────────────────────────────────
// STEP 5 — WRITE STANDALONE backend bootstrap
//
// WHY: The engine's bootstrap/app.php registers DB connections for
// ALL tatemonos dynamically. A standalone export only needs the one
// connection for this tatemono — and the engine's file would try to
// load other tatemonos' connections that don't exist here.
//
// We write a minimal app.php that registers only this tatemono's
// SQLite connection via a booted() callback.
//
// Skip: Native (no backend), Inertia (monolith manages its own)
// ─────────────────────────────────────────────

if (!isNative && !isInertia && hasBackend && !isExpress && !isFastapi && !isAspnet && !isSpring && !isGo && !isRust) {
  log('Writing standalone bootstrap/app.php...')

  fs.mkdirSync(path.join(PROJ_BACK, 'bootstrap'), { recursive: true })
  const dbConnectionPhp = isPg
    ? `config('database.connections.pgsql')`
    : `[
        'driver'   => 'sqlite',
        'database' => base_path('database/arkzen/${tatName}.sqlite'),
        'prefix'   => '',
        'foreign_key_constraints' => true,
    ]`
  fs.writeFileSync(path.join(PROJ_BACK, 'bootstrap', 'app.php'), `<?php

use Illuminate\\Foundation\\Application;
use Illuminate\\Foundation\\Configuration\\Exceptions;
use Illuminate\\Foundation\\Configuration\\Middleware;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web:      __DIR__.'/../routes/web.php',
        channels: __DIR__.'/../routes/channels.php',
        commands: __DIR__.'/../routes/console.php',
        health:   '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(\\App\\Http\\Middleware\\ArkzenSanctumTokenResolver::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn($request) => $request->is('api/*'));
    })->create();

$app->booted(function () {
    \\Illuminate\\Support\\Facades\\Config::set('database.connections.${tatSnake}', ${dbConnectionPhp});
});

return $app;
`)
  success('bootstrap/app.php (single tatemono DB connection registered)')
} else {
  skip('bootstrap/app.php' + (isInertia ? ' (Inertia monolith manages its own)' : isExpress ? ' (Express backend)' : isFastapi ? ' (FastAPI backend)' : isAspnet ? ' (ASP.NET Core backend)' : isSpring ? ' (Spring Boot backend)' : isGo ? ' (Go backend)' : isRust ? ' (Rust backend)' : isNative ? ' (Native)' : ''))
}

// ─────────────────────────────────────────────
// STEP 6 — MODULE ROUTE SERVICE PROVIDER
//
// WHY: The engine uses RouteRegistrar to load routes for ALL tatemonos
// dynamically. In a standalone export we only need this one tatemono's
// route file loaded. We write a simple ServiceProvider that loads
// routes/modules/<tatName>.php and register it in bootstrap/providers.php.
//
// Skip: Native (no backend), Inertia (Laravel-Inertia handles routes)
// ─────────────────────────────────────────────

if (!isNative && !isInertia && hasBackend && !isExpress && !isFastapi && !isAspnet && !isSpring && !isGo && !isRust) {
  log('Writing ModuleRouteServiceProvider...')

  const routeFilePath = `routes/modules/${tatName}.php`
  const providerDir   = path.join(PROJ_BACK, 'app', 'Providers')
  const providerPath  = path.join(providerDir, 'ModuleRouteServiceProvider.php')
  fs.mkdirSync(providerDir, { recursive: true })

  fs.writeFileSync(providerPath, `<?php

namespace App\\Providers;

use Illuminate\\Support\\ServiceProvider;
use Illuminate\\Support\\Facades\\Route;

class ModuleRouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $routeFile = base_path('${routeFilePath}');
        if (file_exists($routeFile)) {
            Route::middleware(['api'])
                ->group($routeFile);
        }
    }
}
`)
  success(`app/Providers/ModuleRouteServiceProvider.php → loads ${routeFilePath}`)

  // Register in bootstrap/providers.php
  const providersPath = path.join(PROJ_BACK, 'bootstrap', 'providers.php')
  if (fs.existsSync(providersPath)) {
    let provContent = fs.readFileSync(providersPath, 'utf-8')
    provContent = provContent.replace(
      /(\s*\]\s*;?\s*)$/,
      `    App\\Providers\\ModuleRouteServiceProvider::class,\n$1`
    )
    fs.writeFileSync(providersPath, provContent)
    success('bootstrap/providers.php → ModuleRouteServiceProvider registered')
  }
} else {
  skip('ModuleRouteServiceProvider' + (isInertia ? ' (Inertia)' : isExpress ? ' (Express backend)' : isFastapi ? ' (FastAPI backend)' : isAspnet ? ' (ASP.NET Core backend)' : isSpring ? ' (Spring Boot backend)' : isGo ? ' (Go backend)' : isRust ? ' (Rust backend)' : isNative ? ' (Native)' : ''))
}

// ─────────────────────────────────────────────
// STEP 7 — STRIP ENGINE-ONLY PROVIDERS from bootstrap/providers.php
//
// WHY: ArkzenServiceProvider depends on RegistryReader which manages
// ALL tatemonos via arkzen.json. It would crash in a standalone
// single-tatemono project. AppServiceProvider is also engine-specific.
// Both are stripped — ModuleRouteServiceProvider (written above) is
// the only Arkzen-related provider needed in the export.
//
// Skip: Native (no backend), Inertia (monolith has its own providers)
// ─────────────────────────────────────────────

if (!isNative && !isInertia && hasBackend && !isExpress && !isFastapi && !isAspnet && !isSpring && !isGo && !isRust) {
  const provPath = path.join(PROJ_BACK, 'bootstrap', 'providers.php')
  if (fs.existsSync(provPath)) {
    log('Stripping engine-only providers...')
    let prov = fs.readFileSync(provPath, 'utf-8')
    prov = prov
      .replace(/\s*App\\Providers\\Arkzen\\ArkzenServiceProvider::class,?\n?/g, '\n')
      .replace(/\s*App\\Providers\\AppServiceProvider::class,?\n?/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
    fs.writeFileSync(provPath, prov)
    success('bootstrap/providers.php — ArkzenServiceProvider + AppServiceProvider stripped')
  }
}

// ─────────────────────────────────────────────
// STEP 8 — WRITE .ENV
//
// WHY: The engine's .env has APP_URL on port 8000 (shared dev server),
// multi-tatemono DB config, and engine-level keys. The export needs:
//   - APP_NAME scoped to this tatemono
//   - APP_URL on port 8001 (standalone backend port)
//   - DB_DATABASE pointing at this tatemono's sqlite file
//   - Reverb keys if realtime is used
//
// Inertia .env goes to PROJECT_DIR root (monolith).
// Others .env goes to PROJ_BACK.
// Skip: Native.
// ─────────────────────────────────────────────

if (!isNative && hasBackend) {
  log('Writing .env...')

  const envExPath = path.join(PROJ_BACK, '.env.example')
  let env = fs.existsSync(envExPath) ? fs.readFileSync(envExPath, 'utf-8') : ''

  const relativeSqlitePath = `database/arkzen/${tatName}.sqlite`
  const backendDatabasePath = isGo ? `storage/databases/${tatName}.sqlite` : relativeSqlitePath
  const backendPort = isInertia ? '8000' : '8001'

  if (isExpress) {
    env = [
      `PORT=${backendPort}`,
      `APP_URL=http://localhost:${backendPort}`,
      `ARKZEN_DB_DRIVER=${isPg ? 'pgsql' : 'sqlite'}`,
      `ARKZEN_DB_PREFIX=${tatSnake}`,
      'QUEUE_CONNECTION=database',
      hasRealtime ? 'REVERB_PORT=8081' : '',
      hasRealtime ? 'REVERB_APP_KEY=arkzen-key' : '',
      hasRealtime ? 'REVERB_APP_SECRET=arkzen-secret' : '',
    ].filter(Boolean).join('\n') + '\n'
  } else if (isFastapi) {
    env = [
      `PORT=${backendPort}`,
      `APP_URL=http://localhost:${backendPort}`,
      'ARKZEN_ENGINE_SECRET=arkzen-engine-secret',
      `ARKZEN_DB_DRIVER=${isPg ? 'pgsql' : 'sqlite'}`,
      `ARKZEN_DB_PREFIX=${engineEnvValue('ARKZEN_DB_PREFIX', 'pluff')}`,
      'QUEUE_CONNECTION=database',
      hasRealtime ? 'REVERB_PORT=8080' : '',
      hasRealtime ? 'REVERB_APP_KEY=pluff-key' : '',
      hasRealtime ? 'REVERB_APP_SECRET=pluff-secret' : '',
      ...(isPg ? [
        `DB_HOST=${engineEnvValue('DB_HOST', '127.0.0.1')}`,
        `DB_PORT=${engineEnvValue('DB_PORT', '5432')}`,
        `DB_DATABASE=${pgDatabaseName}`,
        `DB_USERNAME=${engineEnvValue('DB_USERNAME', 'postgres')}`,
        `DB_PASSWORD=${engineEnvValue('DB_PASSWORD', '')}`,
      ] : []),
    ].filter(Boolean).join('\n') + '\n'
  } else if (isSpring) {
    env = [
      `PORT=${backendPort}`,
      `APP_URL=http://localhost:${backendPort}`,
      'ARKZEN_ENGINE_SECRET=arkzen-engine-secret',
      `ARKZEN_DB_DRIVER=${isPg ? 'pgsql' : 'sqlite'}`,
      `ARKZEN_DB_PREFIX=${engineEnvValue('ARKZEN_DB_PREFIX', 'pluff')}`,
      'QUEUE_CONNECTION=database',
      'MAIL_MAILER=log',
      ...(isPg ? [
        `DB_HOST=${engineEnvValue('DB_HOST', '127.0.0.1')}`,
        `DB_PORT=${engineEnvValue('DB_PORT', '5432')}`,
        `DB_DATABASE=${pgDatabaseName}`,
        `DB_USERNAME=${engineEnvValue('DB_USERNAME', 'postgres')}`,
        `DB_PASSWORD=${engineEnvValue('DB_PASSWORD', '')}`,
      ] : []),
    ].join('\n') + '\n'
  } else if (isAspnet) {
    env = [
      `ASPNETCORE_URLS=http://0.0.0.0:${backendPort}`,
      'ARKZEN_ENGINE_SECRET=arkzen-engine-secret',
      `ARKZEN_DB_DRIVER=${isPg ? 'pgsql' : 'sqlite'}`,
      `ARKZEN_DB_PREFIX=${engineEnvValue('ARKZEN_DB_PREFIX', 'pluff')}`,
      ...(isPg ? [
        `DB_HOST=${engineEnvValue('DB_HOST', '127.0.0.1')}`,
        `DB_PORT=${engineEnvValue('DB_PORT', '5432')}`,
        `DB_DATABASE=${pgDatabaseName}`,
        `DB_USERNAME=${engineEnvValue('DB_USERNAME', 'postgres')}`,
        `DB_PASSWORD=${engineEnvValue('DB_PASSWORD', '')}`,
      ] : []),
    ].join('\n') + '\n'
  } else if (isGo) {
    env = [
      `PORT=${backendPort}`,
      'ARKZEN_ENGINE_SECRET=arkzen-engine-secret',
      'PLUFF_STORAGE_DIR=storage',
      `ARKZEN_DB_DRIVER=${isPg ? 'pgsql' : 'sqlite'}`,
      `ARKZEN_DB_PREFIX=${engineEnvValue('ARKZEN_DB_PREFIX', 'pluff')}`,
      hasRealtime ? 'REVERB_PORT=8080' : '',
      hasRealtime ? 'REVERB_APP_KEY=arkzen-key' : '',
      hasRealtime ? 'REVERB_APP_SECRET=arkzen-secret' : '',
      ...(isPg ? [
        `DB_HOST=${engineEnvValue('DB_HOST', '127.0.0.1')}`,
        `DB_PORT=${engineEnvValue('DB_PORT', '5432')}`,
        `DB_DATABASE=${pgDatabaseName}`,
        `DB_USERNAME=${engineEnvValue('DB_USERNAME', 'postgres')}`,
        `DB_PASSWORD=${engineEnvValue('DB_PASSWORD', '')}`,
      ] : []),
    ].filter(Boolean).join('\n') + '\n'
  } else if (isRust) {
    env = [
      `PORT=${backendPort}`,
      'ARKZEN_ENGINE_SECRET=arkzen-engine-secret',
      'ARKZEN_MODULE_DIR=storage/arkzen-modules',
      'ARKZEN_DATABASE_DIR=database/arkzen',
      `ARKZEN_DB_DRIVER=${isPg ? 'pgsql' : 'sqlite'}`,
      `ARKZEN_DB_PREFIX=${engineEnvValue('ARKZEN_DB_PREFIX', 'pluff')}`,
      ...(isPg ? [
        `DB_HOST=${engineEnvValue('DB_HOST', '127.0.0.1')}`,
        `DB_PORT=${engineEnvValue('DB_PORT', '5432')}`,
        `DB_DATABASE=${pgDatabaseName}`,
        `DB_USERNAME=${engineEnvValue('DB_USERNAME', 'postgres')}`,
        `DB_PASSWORD=${engineEnvValue('DB_PASSWORD', '')}`,
      ] : []),
    ].join('\n') + '\n'
  } else env = env
    .replace(/APP_NAME=.*/,             `APP_NAME=${tatName}`)
    .replace(/APP_ENV=.*/,              'APP_ENV=local')
    .replace(/APP_DEBUG=.*/,            'APP_DEBUG=true')
    .replace(/APP_URL=.*/,              `APP_URL=http://localhost:${backendPort}`)
    .replace(/DB_CONNECTION=.*/,        'DB_CONNECTION=sqlite')
    .replace(/#?\s*DB_HOST=.*/,         '# DB_HOST=127.0.0.1')
    .replace(/#?\s*DB_PORT=.*/,         '# DB_PORT=3306')
    .replace(/#?\s*DB_DATABASE=.*/,     `DB_DATABASE=${relativeSqlitePath}`)
    .replace(/#?\s*DB_USERNAME=.*/,     '# DB_USERNAME=root')
    .replace(/#?\s*DB_PASSWORD=.*/,     '# DB_PASSWORD=')
    .replace(/QUEUE_CONNECTION=.*/,     'QUEUE_CONNECTION=database')
    .replace(/SESSION_DRIVER=.*/,       'SESSION_DRIVER=file')
    .replace(/CACHE_STORE=.*/,          'CACHE_STORE=file')
    .replace(/BROADCAST_CONNECTION=.*/, hasRealtime ? 'BROADCAST_CONNECTION=reverb' : 'BROADCAST_CONNECTION=log')

  if (isPg && !isExpress && !isFastapi && !isAspnet && !isSpring && !isGo && !isRust) {
    env = env
      .replace(/^DB_CONNECTION=.*$/m,       'DB_CONNECTION=pgsql')
      .replace(/^#?[ \t]*DB_HOST=.*$/m,     `DB_HOST=${engineEnvValue('DB_HOST', '127.0.0.1')}`)
      .replace(/^#?[ \t]*DB_PORT=.*$/m,     `DB_PORT=${engineEnvValue('DB_PORT', '5432')}`)
      .replace(/^#?[ \t]*DB_DATABASE=.*$/m, `DB_DATABASE=${pgDatabaseName}`)
      .replace(/^#?[ \t]*DB_USERNAME=.*$/m, `DB_USERNAME=${engineEnvValue('DB_USERNAME', 'postgres')}`)
      .replace(/^#?[ \t]*DB_PASSWORD=.*$/m, () => `DB_PASSWORD=${engineEnvValue('DB_PASSWORD', '')}`)
    env += '\nARKZEN_DB_DRIVER=pgsql\n'
  }

  if (hasRealtime && !isExpress && !isFastapi && !isAspnet && !isSpring && !isGo && !isRust && !env.includes('REVERB_APP_ID=')) {
    env += [
      '',
      'REVERB_APP_ID=arkzen',
      'REVERB_APP_KEY=arkzen-key',
      'REVERB_APP_SECRET=arkzen-secret',
      'REVERB_HOST=localhost',
      'REVERB_PORT=8081',
      'REVERB_SCHEME=http',
    ].join('\n')
  }

  fs.writeFileSync(path.join(PROJ_BACK, '.env'), env)
  success(`.env written (${isExpress ? 'Express' : isFastapi ? 'FastAPI' : isAspnet ? 'ASP.NET Core' : isSpring ? 'Spring Boot' : isGo ? 'Go' : isRust ? 'Rust' : 'Laravel'}; DB → ${isPg ? `pgsql ${pgDatabaseName}` : backendDatabasePath}, port → ${backendPort})`)
} else {
  skip('.env (Native)')
}

// ─────────────────────────────────────────────
// STEP 9 — WRITE FRONTEND GLUE FILES
//
// WHY: These files exist in the engine but reference all tatemonos or
// the engine's multi-tatemono port (8000). In a standalone export each
// must be scoped to this one tatemono and point at port 8001.
//
//   auth-tatemonos.ts  — engine version lists all auth tatemonos.
//                        Export version lists only this one.
//   app/page.tsx       — root redirect to this tatemono's entry page.
//   next.config.js     — proxy to backend on 8001 (engine uses 8000).
//   package.json       — rename + fix dev scripts.
//   .env.local         — Reverb config for frontend (if realtime).
//
// middleware.ts is already copied from engine — it works as-is.
// Skip: Inertia (no separate frontend), Native (handled per-stack below).
// ─────────────────────────────────────────────

log('Writing frontend glue files...')

// ── auth-tatemonos.ts
// Engine version lists every auth tatemono. Export version lists only this one.
const genDir = isInertia
  ? path.join(PROJECT_DIR, 'resources', 'js', 'arkzen', 'generated')
  : isNative
    ? path.join(PROJECT_DIR, 'arkzen', 'generated')
    : path.join(PROJ_FRONT, 'arkzen', 'generated')

fs.mkdirSync(genDir, { recursive: true })

const engAuthTatemonos = path.join(
  FRONTEND_DIR,
  isInertia ? 'resources/js/arkzen/generated' : 'arkzen/generated',
  'auth-tatemonos.ts'
)

if (fs.existsSync(engAuthTatemonos)) {
  const hasAuth = content.includes('@arkzen:meta') &&
    fs.readFileSync(engAuthTatemonos, 'utf-8').includes(`'${tatName}'`)
  fs.writeFileSync(path.join(genDir, 'auth-tatemonos.ts'),
    `// Auto-generated by export.js v10 for: ${tatName}\nexport const AUTH_TATEMONOS: string[] = ${hasAuth ? JSON.stringify([tatName]) : '[]'}\n`
  )
} else {
  const hasAuthMeta = /auth:\s*true/.test(content)
  fs.writeFileSync(path.join(genDir, 'auth-tatemonos.ts'),
    `// Auto-generated by export.js v10 for: ${tatName}\nexport const AUTH_TATEMONOS: string[] = ${hasAuthMeta ? JSON.stringify([tatName]) : '[]'}\n`
  )
}
success('arkzen/generated/auth-tatemonos.ts (scoped to this tatemono)')

// Copy other generated files (route-registry, etc.) from engine as-is
const engGenDir = path.join(
  FRONTEND_DIR,
  isInertia ? 'resources/js/arkzen/generated' : 'arkzen/generated'
)
if (fs.existsSync(engGenDir)) {
  fs.readdirSync(engGenDir).forEach(f => {
    if (f === 'auth-tatemonos.ts') return // already written above
    if (belongsToOtherTatemono(f)) return // another tatemono's animations/scripts — not part of this export
    const src = path.join(engGenDir, f)
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(genDir, f))
      success(`generated/${f}`)
    }
  })
}

// ── Stack-specific glue
if (activeStack === 'nextjs') {

  // Root page redirect
  fs.mkdirSync(path.join(PROJ_FRONT, 'app'), { recursive: true })
  fs.writeFileSync(path.join(PROJ_FRONT, 'app', 'page.tsx'),
    `'use client'\nimport { redirect } from 'next/navigation'\nexport default function ArkzenRoot() { redirect('/${tatName}') }\n`
  )
  success(`app/page.tsx → redirects to /${tatName}`)

  // next.config.js — proxy points at 8001 (engine uses 8000). No proxy when there is no backend.
  if (noBackend) {
    fs.writeFileSync(path.join(PROJ_FRONT, 'next.config.js'), `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { forceSwcTransforms: false },
}
export default nextConfig
`)
    success('next.config.js (no backend proxy)')
  } else {
    fs.writeFileSync(path.join(PROJ_FRONT, 'next.config.js'), `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { forceSwcTransforms: false },
  async rewrites() {
    return [
      { source: '/storage/:path*', destination: 'http://127.0.0.1:8001/storage/:path*' },
      { source: '/api/:path*',     destination: 'http://127.0.0.1:8001/api/:path*' },
    ]
  },
}
export default nextConfig
`)
    success('next.config.js (proxy → localhost:8001)')
  }

  // package.json — rename + standalone dev scripts
  const pkgPath = path.join(PROJ_FRONT, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = {
      dev:   'NEXT_IGNORE_INCORRECT_LOCKFILE=1 NEXT_DISABLE_SWC=1 next dev --webpack --port 3001',
      build: 'next build',
      start: 'next start --port 3001',
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name + scripts updated)')
  }

  if (hasRealtime) {
    fs.writeFileSync(path.join(PROJ_FRONT, '.env.local'), [
      'NEXT_PUBLIC_REVERB_HOST=localhost',
      'NEXT_PUBLIC_REVERB_PORT=8081',
      'NEXT_PUBLIC_REVERB_SCHEME=ws',
      'NEXT_PUBLIC_REVERB_APP_KEY=arkzen-key',
    ].join('\n'))
    success('.env.local (Reverb config)')
  }

} else if (activeStack === 'react-vite' || isDesktop) {

  const pkgPath = path.join(PROJ_FRONT, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = {
      dev:     'vite --port 3001',
      build:   'vite build',
      preview: 'vite preview --port 3001',
    }
    if (isTauri) {
      pkg.scripts['tauri:dev'] = 'tauri dev'
      pkg.scripts['tauri:build'] = 'tauri build'
      pkg.devDependencies = {
        ...pkg.devDependencies,
        '@tauri-apps/cli': '^2.5.0',
      }
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name + scripts updated)')
  }

  // Patch vite.config.ts for standalone export:
  //   1. proxy port 8000 → 8001
  //   2. remove arkzenReadyPlugin entirely (engine-only, polls for watcher flag)
  //   3. remove arkzenApiPlugin entirely (engine-only, handles /api/arkzen/* internally)
  const vcPath = path.join(PROJ_FRONT, 'vite.config.ts')
  if (fs.existsSync(vcPath)) {
    // Normalize CRLF first. On Windows the engine file has CRLF line endings, and the ^}\n
    // patterns below silently fail on them, leaving arkzenApiPlugin (and its import of
    // src/api/arkzen/registry) in the exported config.
    let vc = fs.readFileSync(vcPath, 'utf-8').replace(/\r\n/g, '\n')
    // Patch proxy port
    vc = vc.replace(/target:\s*['"]http:\/\/127\.0\.0\.1:8000['"]/, `target: 'http://127.0.0.1:8001'`)
    // Remove arkzenReadyPlugin and arkzenApiPlugin function definitions + usages
    vc = vc.replace(/\/\/ PROCESS_START_TS[\s\S]*?(?=\nexport default)/m, '')
    vc = vc.replace(/const PROCESS_START_TS[^\n]*\n/, '')
    vc = vc.replace(/const READY_FLAG[^\n]*\n/, '')
    vc = vc.replace(/function isFreshReadyFlag[\s\S]*?^}\n/m, '')
    vc = vc.replace(/function arkzenReadyPlugin[\s\S]*?^}\n/m, '')
    vc = vc.replace(/function arkzenApiPlugin[\s\S]*?^}\n/m, '')
    vc = vc.replace(/\s*arkzenReadyPlugin\(\),/g, '')
    vc = vc.replace(/\s*arkzenApiPlugin\(\),/g, '')
    fs.writeFileSync(vcPath, vc)
    success('vite.config.ts patched (port + engine plugins removed)')
  }

  // The engine hub is dev-only. src/api/arkzen/registry.ts reads arkzen.json and imports
  // engine/shared/arkzen/hub, and src/App.tsx imports the same shared Hub. Neither folder exists
  // in an export, so the build fails with "Could not resolve ../shared/arkzen/hub/...".
  // Remove the registry endpoint and replace App.tsx with a version that has no hub.
  const projApiDir = path.join(PROJ_FRONT, 'src', 'api', 'arkzen')
  if (fs.existsSync(projApiDir)) {
    fs.rmSync(projApiDir, { recursive: true, force: true })
    const apiParent = path.join(PROJ_FRONT, 'src', 'api')
    if (fs.existsSync(apiParent) && fs.readdirSync(apiParent).length === 0) fs.rmdirSync(apiParent)
    success('src/api/arkzen removed (engine-only registry endpoint)')
  }

  // Routes are React.lazy chunks, so a Suspense boundary is required — but its fallback is null:
  // no "Loading..." flash screen in the exported app.
  const standaloneApp = `// ============================================================
// ${tatName} — App Router (standalone export, no engine hub)
// ============================================================
import * as React from 'react'
import { Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { ARKZEN_ROUTES, ARKZEN_ERROR_BOUNDARIES } from '@/arkzen/generated/routes'

function NotFoundScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#f5f5f0', fontFamily: 'system-ui',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>404</div>
      <div style={{ fontSize: '14px', color: '#aaa' }}>Page not found</div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {ARKZEN_ROUTES.map(route => {
          const Boundary = ARKZEN_ERROR_BOUNDARIES[route.tatemono]
          const element  = Boundary
            ? <Boundary><route.component /></Boundary>
            : <route.component />
          return <Route key={route.path} path={route.path} element={element} />
        })}
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </Suspense>
  )
}
`
  fs.writeFileSync(path.join(PROJ_FRONT, 'src', 'App.tsx'), standaloneApp)
  success('src/App.tsx (standalone router, hub removed)')

  if (hasRealtime) {
    fs.writeFileSync(path.join(PROJ_FRONT, '.env'), [
      'VITE_REVERB_HOST=localhost',
      'VITE_REVERB_PORT=8081',
      'VITE_REVERB_SCHEME=ws',
      'VITE_REVERB_APP_KEY=arkzen-key',
    ].join('\n'))
    success('.env (Reverb config)')
  }

} else if (activeStack === 'astro') {

  const pkgPath = path.join(PROJ_FRONT, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = {
      dev:     'astro dev --port 3001',
      build:   'astro build',
      preview: 'astro preview --port 3001',
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name + scripts updated)')
  }

  const astroConfig = path.join(PROJ_FRONT, 'astro.config.mjs')
  if (fs.existsSync(astroConfig)) {
    let ac = fs.readFileSync(astroConfig, 'utf-8')
    ac = ac.replace(/target:\s*['"]http:\/\/127\.0\.0\.1:8000['"]/g, `target: 'http://127.0.0.1:8001'`)
    fs.writeFileSync(astroConfig, ac)
    success('astro.config.mjs proxy port patched (8000 → 8001)')
  }

  if (hasRealtime) {
    fs.writeFileSync(path.join(PROJ_FRONT, '.env'), [
      'PUBLIC_REVERB_HOST=localhost',
      'PUBLIC_REVERB_PORT=8081',
      'PUBLIC_REVERB_SCHEME=ws',
      'PUBLIC_REVERB_APP_KEY=arkzen-key',
    ].join('\n'))
    success('.env (Reverb config)')
  }

} else if (activeStack === 'tanstack-start') {

  const pkgPath = path.join(PROJ_FRONT, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = {
      dev:   'vite dev --port 3001',
      build: 'vite build',
      start: 'vite preview --port 3001',
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name + scripts updated)')
  }

  const vcPath = path.join(PROJ_FRONT, 'vite.config.ts')
  if (fs.existsSync(vcPath)) {
    let vc = fs.readFileSync(vcPath, 'utf-8')
    vc = vc.replace(/target:\s*['"]http:\/\/127\.0\.0\.1:8000['"]/g, `target: 'http://127.0.0.1:8001'`)
    fs.writeFileSync(vcPath, vc)
    success('vite.config.ts proxy port patched (8000 → 8001)')
  }

  if (hasRealtime) {
    fs.writeFileSync(path.join(PROJ_FRONT, '.env'), [
      'VITE_REVERB_HOST=localhost',
      'VITE_REVERB_PORT=8081',
      'VITE_REVERB_SCHEME=ws',
      'VITE_REVERB_APP_KEY=arkzen-key',
    ].join('\n'))
    success('.env (Reverb config)')
  }

} else if (isInertia) {

  // Inertia: package.json lives at PROJECT_DIR root (inside the monolith)
  const pkgPath = path.join(PROJECT_DIR, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name    = tatName
    pkg.scripts = { dev: 'vite', build: 'vite build' }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name + scripts updated — Inertia monolith)')
  }

} else if (isNative) {

  const pkgPath = path.join(PROJECT_DIR, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name = tatName
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    success('package.json (name updated — run: npx expo start)')
  }

}

// ─────────────────────────────────────────────
// STEP 9b — RUNTIME BACKEND BEHAVIOUR OF THE COPIED CORE HOOKS
//
// 1. useWebSocket reads process.env.NEXT_PUBLIC_REVERB_*. That only exists on Next.js. On Vite /
//    TanStack / Astro (and desktop) `process` is undefined in the browser, and the VITE_/PUBLIC_
//    REVERB_* values written to .env above were never read — so the export connected to the
//    engine defaults (localhost:8080 / "arkzen") instead of the exported backend (8081 / arkzen-key).
//    Point the hook at the env names this export actually writes.
// 2. --backend=none (static frontend): there is no server, so the hooks must not keep calling one.
//    The realtime hook never opens a socket (it used to retry every 3s forever) and useQuery stops
//    retrying / refetching on every window focus.
// ─────────────────────────────────────────────

if (!isInertia && !isNative) {
  const hookDir = path.join(PROJ_FRONT, 'arkzen', 'core', 'hooks')
  const wsHook  = path.join(hookDir, 'useWebSocket.ts')

  if (activeStack !== 'nextjs') {
    const envPrefix = activeStack === 'astro' ? 'PUBLIC' : 'VITE'
    patchExportFile(
      wsHook,
      ['HOST', 'PORT', 'SCHEME', 'APP_KEY'].map(key => [
        new RegExp(`process\\.env\\.NEXT_PUBLIC_REVERB_${key}`),
        `(import.meta as any).env.${envPrefix}_REVERB_${key}`,
      ]),
      `useWebSocket reads ${envPrefix}_REVERB_* (was NEXT_PUBLIC_REVERB_*)`
    )
  }

  if (noBackend) {
    patchExportFile(
      wsHook,
      [
        [/(\n)(const REVERB_HOST)/, `$1// Static export (--backend=none): there is no realtime server to connect to.\nconst STATIC_NO_BACKEND = true\n$2`],
        [/(if \(wsRef\.current\?\.readyState === WebSocket\.OPEN\) return\n)/, `$1    if (STATIC_NO_BACKEND) { setIsConnecting(false); return }\n`],
      ],
      'useWebSocket disabled (--backend=none, no socket / no 3s reconnect loop)'
    )
    patchExportFile(
      path.join(hookDir, 'useQuery.ts'),
      [
        [/(retry\s*=\s*)3,/, (_match, lead) => `${lead}0,`],
        [/(refetchOnFocus\s*=\s*)true,/, (_match, lead) => `${lead}false,`],
      ],
      'useQuery defaults: retry 0, no refetch on focus (--backend=none)'
    )
  }
}

// ─────────────────────────────────────────────
// STEP 10 — STRIP TATEMONO URL PREFIX FROM FRONTEND PAGES
//
// WHY: In the engine, pages live at app/<tatName>/... because multiple
// tatemonos coexist under their own URL namespace. In a standalone export
// there is only one tatemono, so the prefix is unnecessary.
//
// We hoist app/<tatName>/* up to app/* and then strip all /<tatName>/
// references from .tsx/.ts/.js files — EXCEPT /api/<tatName>/... which
// must stay (the backend API prefix is part of Laravel's route definition
// and should not be changed).
//
// Skip: Inertia (pages live in resources/js/Pages, not app/)
// ─────────────────────────────────────────────

// Expo: hoist app/<tatName>/ → app/ and src/screens/<tatName>/ → src/screens/
// Expo Router uses app/ for file-based routing, screens live in src/screens/
if (isNative) {
  log(`Hoisting Expo routes and screens for ${tatName}...`)

  // Hoist app/<tatName>/* → app/*
  const tatAppDir  = path.join(PROJECT_DIR, 'app', tatName)
  const rootAppDir = path.join(PROJECT_DIR, 'app')
  if (fs.existsSync(tatAppDir)) {
    for (const entry of fs.readdirSync(tatAppDir)) {
      fs.renameSync(path.join(tatAppDir, entry), path.join(rootAppDir, entry))
    }
    fs.rmdirSync(tatAppDir)
    success(`app/${tatName}/ → app/ (Expo routes hoisted)`)
  }

  // Hoist src/screens/<tatName>/* → src/screens/*
  const tatScreensDir  = path.join(PROJECT_DIR, 'src', 'screens', tatName)
  const rootScreensDir = path.join(PROJECT_DIR, 'src', 'screens')
  if (fs.existsSync(tatScreensDir)) {
    for (const entry of fs.readdirSync(tatScreensDir)) {
      fs.renameSync(path.join(tatScreensDir, entry), path.join(rootScreensDir, entry))
    }
    fs.rmdirSync(tatScreensDir)
    success(`src/screens/${tatName}/ → src/screens/ (Expo screens hoisted)`)
  }

  // Rewrite /<tatName>/ route refs in all screen/app files
  function getAllNativeFiles(dir, results = []) {
    if (!fs.existsSync(dir)) return results
    for (const entry of fs.readdirSync(dir)) {
      if (entry === 'node_modules') continue
      const full = path.join(dir, entry)
      if (fs.statSync(full).isDirectory()) getAllNativeFiles(full, results)
      else if (['.tsx', '.ts', '.js', '.jsx'].some(e => full.endsWith(e))) results.push(full)
    }
    return results
  }

  const nativeFiles = getAllNativeFiles(PROJECT_DIR)
  let nativeReplaced = 0
  for (const file of nativeFiles) {
    let src = fs.readFileSync(file, 'utf-8')
    const before = src
    src = src.replace(new RegExp(`(/${tatName})/`, 'g'), '/')
    src = src.replace(new RegExp(`(/${tatName})(['"\`\)])`, 'g'), '/$2')
    if (src !== before) { fs.writeFileSync(file, src); nativeReplaced++ }
  }
  success(`Rewrote /${tatName}/ route refs in ${nativeReplaced} file(s)`)
}

if (!isInertia && !isNative) {
  log(`Stripping page URL prefix /${tatName} from frontend...`)

  // Next.js: hoist app/<tatName>/* → app/*
  if (activeStack === 'nextjs') {
    const tatAppDir  = path.join(PROJ_FRONT, 'app', tatName)
    const rootAppDir = path.join(PROJ_FRONT, 'app')
    if (fs.existsSync(tatAppDir)) {
      for (const entry of fs.readdirSync(tatAppDir)) {
        fs.renameSync(path.join(tatAppDir, entry), path.join(rootAppDir, entry))
      }
      fs.rmdirSync(tatAppDir)
      success(`app/${tatName}/ → app/ (folder hoisted)`)
    } else {
      warn(`app/${tatName}/ not found — skipping folder hoist`)
    }
    // Remove the root redirect we wrote in step 9 (hoisting makes it redundant)
    const rootPage = path.join(PROJ_FRONT, 'app', 'page.tsx')
    if (!fs.existsSync(path.join(PROJ_FRONT, 'app', tatName)) && fs.existsSync(rootPage)) {
      success('app/page.tsx → hoisted from app/${tatName}/page.tsx (redirect removed)')
    }
  }

  // React-Vite / others: hoist src/pages/<tatName>/* → src/pages/*
  if (activeStack !== 'nextjs' && activeStack !== 'react-inertia') {
    const tatPagesDir  = path.join(PROJ_FRONT, 'src', 'pages', tatName)
    const rootPagesDir = path.join(PROJ_FRONT, 'src', 'pages')
    if (fs.existsSync(tatPagesDir)) {
      for (const entry of fs.readdirSync(tatPagesDir)) {
        fs.renameSync(path.join(tatPagesDir, entry), path.join(rootPagesDir, entry))
      }
      fs.rmdirSync(tatPagesDir)
      success(`src/pages/${tatName}/ → src/pages/ (folder hoisted)`)
    } else {
      warn(`src/pages/${tatName}/ not found — skipping folder hoist`)
    }
  }

  // TanStack Start: file routes live in src/routes/<tatName>/ — hoist to src/routes/ so the
  // exported site serves them at / (the engine hub that owned src/routes/index.tsx is not copied).
  if (activeStack === 'tanstack-start') {
    hoistTatemonoDir(path.join(PROJ_FRONT, 'src', 'routes'), 'src/routes')
  }

  // Astro: islands import @/arkzen/generated/components/<tatName>/… and styles/<tatName>/….
  // The prefix rewrite below turns those into …/components/… and …/styles/…, so hoist the folders.
  if (activeStack === 'astro') {
    for (const sub of ['components', 'styles']) {
      const subDir = path.join(PROJ_FRONT, 'src', 'arkzen', 'generated', sub)
      if (fs.existsSync(path.join(subDir, tatName))) hoistTatemonoDir(subDir, `src/arkzen/generated/${sub}`)
    }
  }


  // Rewrite /<tatName>/ references in all .tsx/.ts/.js/.jsx files
  // but leave /api/<tatName>/... untouched
  function getAllFiles(dir, exts, results = []) {
    if (!fs.existsSync(dir)) return results
    for (const entry of fs.readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.next') continue
      const full = path.join(dir, entry)
      if (fs.statSync(full).isDirectory()) {
        getAllFiles(full, exts, results)
      } else if (exts.some(e => full.endsWith(e))) {
        results.push(full)
      }
    }
    return results
  }

  const frontendFiles = getAllFiles(PROJ_FRONT, ['.tsx', '.ts', '.js', '.jsx'])
  let replacedCount = 0

  for (const file of frontendFiles) {
    let src = fs.readFileSync(file, 'utf-8')
    const before = src

    // /<tatName>/something → /something   (skip /api/<tatName>/ and /tatemonos/<tatName>/)
    src = src.replace(new RegExp(`(?<!/api)(?<!/tatemonos)(/${tatName})/`, 'g'), '/')
    // /<tatName>' or /<tatName>" or /<tatName>`  (end of string refs)
    src = src.replace(new RegExp(`(?<!/api)(?<!/tatemonos)(/${tatName})(['"\`])`, 'g'), '/$2')
    // /<tatName>)  — e.g. router.push('/<tatName>')
    src = src.replace(new RegExp(`(?<!/api)(?<!/tatemonos)(/${tatName})\\)`, 'g'), '/)')

    if (src !== before) {
      fs.writeFileSync(file, src)
      replacedCount++
    }
  }
  success(`Page URL prefix stripped from ${replacedCount} files`)

  // Exported web routes are hoisted to the root, so auth layouts can no
  // longer infer the Tatemono slug from the first URL segment.
  for (const fileName of ['AuthLayout.tsx', 'GuestLayout.tsx']) {
    const file = path.join(PROJ_FRONT, 'arkzen', 'core', 'layouts', fileName)
    if (!fs.existsSync(file)) continue

    let src = fs.readFileSync(file, 'utf-8')
    src = src.replace(/const tatemono\s*=\s*segments\[0\]\s*\?\?\s*''/g, "const tatemono = ''")
    src = src.replace(
      /useAuthStoreHydrated\(tatemono\)/g,
      `useAuthStoreHydrated(${JSON.stringify(tatName)})`
    )
    src = src.replace(
      /if\s*\(tatemono\)\s*setActiveTatemono\(tatemono\)/g,
      `setActiveTatemono(${JSON.stringify(tatName)})`
    )
    fs.writeFileSync(file, src)
  }
}

// ─────────────────────────────────────────────
// STEP 11 — BACKEND DEPENDENCIES
//
// Laravel uses Composer; Express uses npm. Dependency folders are
// excluded from the copy and installed fresh in the exported project.
// ─────────────────────────────────────────────

if (!isNative && hasBackend && isSpring) {
  log('Resolving Spring Boot (Maven) dependencies...')
  try {
    execSync('mvn -B -q dependency:build-classpath -Dmdep.outputFile=target/classpath.txt', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('Maven dependencies resolved (target/classpath.txt)')
  } catch (e) {
    warn('Maven resolve failed — run manually: cd backend && mvn -B dependency:build-classpath -Dmdep.outputFile=target/classpath.txt')
    const msg = (e.stdout || e.stderr || e.message || '').toString().trim()
    msg.split('\n').slice(0, 5).forEach(l => l.trim() && warn('  ' + l))
  }
} else if (!isNative && hasBackend && isAspnet) {
  log('Restoring ASP.NET Core dependencies...')
  try {
    execSync('dotnet restore Pluff.AspNet.csproj', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('dotnet restore complete')
  } catch (e) {
    warn('dotnet restore failed — run manually: cd backend && dotnet restore Pluff.AspNet.csproj')
    const msg = (e.stdout || e.stderr || e.message || '').toString().trim()
    msg.split('\n').slice(0, 5).forEach(l => l.trim() && warn('  ' + l))
  }
} else if (!isNative && hasBackend && isExpress) {
  log('Installing Express dependencies...')
  try {
    execSync('npm install --no-audit --no-fund', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('npm install complete')
  } catch (e) {
    warn('npm install failed — run manually: cd backend && npm install')
    const msg = (e.stdout || e.stderr || e.message || '').toString().trim()
    msg.split('\n').slice(0, 5).forEach(l => l.trim() && warn('  ' + l))
  }
} else if (!isNative && hasBackend && isFastapi) {
  log('Creating FastAPI virtual environment...')
  const systemPython = findSystemPython()
  if (!systemPython) {
    warn('Python 3 was not found — install Python 3, then run `python -m venv .venv` and `pip install -r requirements.txt` in backend/')
  } else {
    const venv = spawnSync(systemPython.command, [...systemPython.prefix, '-m', 'venv', '.venv'], {
      cwd: PROJ_BACK, stdio: 'pipe', windowsHide: true,
    })
    const python = path.join(PROJ_BACK, '.venv', process.platform === 'win32' ? 'Scripts' : 'bin',
      process.platform === 'win32' ? 'python.exe' : 'python')
    if (venv.error || venv.status !== 0 || !fs.existsSync(python)) {
      warn('Could not create the FastAPI virtual environment; run `python -m venv .venv` in backend/')
    } else {
      const installed = spawnSync(python, ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
        cwd: PROJ_BACK, stdio: 'pipe', windowsHide: true,
      })
      if (installed.error || installed.status !== 0) {
        const pythonCommand = path.join('.venv', process.platform === 'win32' ? 'Scripts' : 'bin',
          process.platform === 'win32' ? 'python.exe' : 'python')
        warn(`FastAPI dependency installation failed — run manually: cd backend && "${pythonCommand}" -m pip install -r requirements.txt`)
      } else {
        success('FastAPI dependencies installed')
      }
    }
  }
} else if (!isNative && hasBackend && isGo) {
  log('Downloading Go dependencies...')
  try {
    execSync('go mod download', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('Go dependencies downloaded')
  } catch (e) {
    warn('Go dependency download failed — run manually: cd backend && go mod download')
    const msg = (e.stdout || e.stderr || e.message || '').toString().trim()
    msg.split('\n').slice(0, 5).forEach(l => l.trim() && warn('  ' + l))
  }
} else if (!isNative && hasBackend && isRust) {
  log('Downloading Rust dependencies...')
  try {
    execSync('cargo fetch', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('Rust dependencies downloaded')
  } catch (e) {
    warn('Rust dependency download failed — run manually: cd backend && cargo fetch')
    const msg = (e.stdout || e.stderr || e.message || '').toString().trim()
    msg.split('\n').slice(0, 5).forEach(l => l.trim() && warn('  ' + l))
  }
} else if (!isNative && hasBackend && !isAspnet && !isSpring && !isGo && !isRust) {
  log('Installing Composer dependencies...')
  try {
    execSync('composer install --no-interaction --prefer-dist --optimize-autoloader --quiet', {
      cwd: PROJ_BACK, stdio: 'pipe'
    })
    success('composer install complete')
  } catch (e) {
    warn('composer install failed — run manually: cd backend && composer install')
    const msg = (e.stdout || e.stderr || e.message || '').toString().trim()
    msg.split('\n').slice(0, 5).forEach(l => l.trim() && warn('  ' + l))
  }

  // ─────────────────────────────────────────────
  // STEP 12 — APP KEY + STORAGE LINK
  // ─────────────────────────────────────────────

  log('Generating app key...')
  try {
    execSync('php artisan key:generate --force', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('App key generated')
  } catch { warn('App key failed — run: php artisan key:generate') }

  try {
    execSync('php artisan storage:link --force', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('Storage symlink created')
  } catch { warn('Storage link failed — run: php artisan storage:link') }

  // ─────────────────────────────────────────────
  // STEP 13 — MIGRATIONS
  //
  // WHY: Even though the copied sqlite already has the tatemono's tables
  // (from the engine's last migration run), it does NOT have Laravel's own
  // system tables: cache, sessions, failed_jobs, jobs, personal_access_tokens.
  // Running migrate adds those. Existing tatemono tables are skipped (idempotent).
  // ─────────────────────────────────────────────

  log('Running migrations...')
  try {
    const out = execSync('php artisan migrate --force 2>&1', { cwd: PROJ_BACK }).toString()
    success('Migrations complete')
    out.trim().split('\n').filter(l => l.trim()).forEach(l => success('  ' + l))
  } catch (e) {
    warn('Migrations failed — run manually: php artisan migrate')
    const msg = (e.stdout || e.message || '').toString().trim()
    msg.split('\n').slice(0, 8).forEach(l => l.trim() && warn('  ' + l))
  }

  log('Running seeders...')
  try {
    execSync('php artisan db:seed --force', { cwd: PROJ_BACK, stdio: 'pipe' })
    success('Seeders complete')
  } catch { warn('Seeders skipped or none exist — run: php artisan db:seed') }
} else {
  skip('Backend setup (frontend-only or Native tatemono)')
}

// ─────────────────────────────────────────────
// STEP 14 — WRITE start.js
//
// Spawns only the services this tatemono actually uses:
//   - backend  (always, if hasBackend)
//   - queue    (only if hasJobs)
//   - reverb   (only if hasRealtime)
//   - frontend (always, except Native uses Expo)
//
// Inertia: frontend is served by Vite inside Laravel (npm run dev),
//          no separate frontend/ folder or port 3001.
// Native:  npx expo start instead of npm run dev.
// ─────────────────────────────────────────────

log('Writing start.js...')

const startLines = [
  isSpring ? `import { spawn, execSync } from 'node:child_process'` : `import { spawn } from 'node:child_process'`,
  isSpring || isGo || isRust ? `import fs from 'node:fs'` : null,
  `import path from 'node:path'`,
  `import { fileURLToPath } from 'node:url'`,
  `const __dirname = path.dirname(fileURLToPath(import.meta.url))`,
  !isInertia && !isNative ? `const FRONT = path.join(__dirname, 'frontend')` : null,
  hasBackend && !isInertia ? `const BACK  = path.join(__dirname, 'backend')` : null,
  hasBackend && (isGo || isRust) ? `const BACKEND_ENV = { ...process.env, PLUFF_ROOT: __dirname }` : null,
  hasBackend && (isGo || isRust) ? `const envPath = path.join(BACK, '.env')` : null,
  hasBackend && (isGo || isRust) ? `if (fs.existsSync(envPath)) for (const line of fs.readFileSync(envPath, 'utf-8').split(/\\r?\\n/)) { const match = line.match(/^\\s*([A-Za-z_][A-Za-z0-9_]*)\\s*=\\s*(.*?)\\s*$/); if (match && process.env[match[1]] === undefined) BACKEND_ENV[match[1]] = match[2].replace(/^(['"])(.*)\\1$/, '$2') }` : null,
  hasBackend && isSpring ? `const springCp = () => [path.join(BACK, 'target', 'classes'), fs.readFileSync(path.join(BACK, 'target', 'classpath.txt'), 'utf-8').trim()].join(path.delimiter)` : null,
  hasBackend && isSpring ? `try { execSync('mvn -B -q compile', { cwd: BACK, stdio: 'inherit' }) } catch { console.log('  Spring Boot compile failed - fix the errors above, then run node start.js again'); process.exit(1) }` : null,
  hasBackend && isFastapi ? `const PYTHON = path.join(BACK, '.venv', process.platform === 'win32' ? 'Scripts' : 'bin', process.platform === 'win32' ? 'python.exe' : 'python')` : null,
  ``,
  `function run(label, cmd, args, cwd, color, env = process.env) {`,
  `  const colors = { frontend:'\\x1b[36m', backend:'\\x1b[35m', queue:'\\x1b[33m', reverb:'\\x1b[34m' }`,
  `  const c = colors[color] || '', r = '\\x1b[0m'`,
  `  const windowsScript = process.platform === 'win32' && (cmd === 'npm' || cmd === 'npx')`,
  `  const executable = windowsScript ? (process.env.ComSpec || 'cmd.exe') : cmd`,
  `  const commandArgs = windowsScript ? ['/d', '/s', '/c', cmd + '.cmd ' + args.map(arg => JSON.stringify(arg)).join(' ')] : args`,
  `  const p = spawn(executable, commandArgs, { cwd, stdio: 'pipe', env: { ...env, FORCE_COLOR: '1'${isFastapi ? `, PYTHONUTF8: process.env.PYTHONUTF8 || '1'` : ''} } })`,
  `  const out = d => String(d).trim().split('\\n').forEach(l => l && console.log(\`\${c}[\${label}]\${r} \${l}\`))`,
  `  p.stdout?.on('data', out)`,
  `  p.stderr?.on('data', out)`,
  `  p.on('exit', code => code && code !== 0 && console.log(\`\${c}[\${label}]\${r} exited \${code}\`))`,
  `  return p`,
  `}`,
  ``,
  `console.log('\\n  Starting ${tatName}...')`,
  hasBackend && !isInertia ? `console.log('  Backend:  http://localhost:8001')` : null,
  isInertia               ? `console.log('  App:      http://localhost:8000 (Laravel + Inertia + Vite)')` : null,
  hasBackend && hasJobs && !isGo && !isAspnet && !isSpring ? `console.log('  Queue:    enabled')` : null,
  isGo && hasJobs ? `console.log('  Queue:    SQLite-backed worker + cron scheduler (in backend)')` : null,
  isAspnet && hasJobs ? `console.log('  Queue:    in-process jobs/events (not durable); cron scheduling unavailable')` : null,
  isSpring && hasJobs ? `console.log('  Queue:    in-process jobs + cron scheduler (not durable)')` : null,
  hasBackend && hasRealtime && !isRust ? `console.log('  ${isSpring || isAspnet || isExpress || isFastapi || isGo ? 'Realtime: ws://localhost:8080' : 'Reverb:   ws://localhost:8081'}')` : null,
  isRust && hasJobs ? `console.log('  WARNING: Rust queue/scheduler support is not implemented yet')` : null,
  isRust && hasRealtime ? `console.log('  WARNING: Rust realtime support is not implemented yet')` : null,
  isTauri ? `console.log('  Desktop:  Tauri window\\n')` : null,
  !isInertia && !isNative && !isTauri ? `console.log('  Frontend: http://localhost:3001\\n')` : null,
  isNative                ? `console.log('  ${activeStack === 'react-native' ? 'Metro:    scan QR code / press a (Android) or i (iOS)' : 'Expo:     scan QR code in terminal'}\\n')` : null,
  ``,
  // Backend process
  hasBackend && !isInertia
    ? (isExpress
      ? `const backend  = run('backend',  'npm', ['start'], BACK, 'backend')`
      : isSpring
        ? `const backend  = run('backend',  'java', ['-cp', springCp(), '${SPRING_SERVER_CLASS}'], BACK, 'backend')`
      : isAspnet
        ? `const backend  = run('backend',  'dotnet', ['run', '--no-restore', '--project', 'Pluff.AspNet.csproj'], BACK, 'backend')`
      : isGo
        ? `const backend  = run('backend', 'go', ['run', './cmd/server'], BACK, 'backend', BACKEND_ENV)`
      : isRust
        ? `const backend  = run('backend', 'cargo', ['run'], BACK, 'backend', BACKEND_ENV)`
        : isFastapi
          ? `const backend  = run('backend', PYTHON, ['-m', 'uvicorn', 'pluff.server:app', '--host', '0.0.0.0', '--port', '8001'], BACK, 'backend')`
          : `const backend  = run('backend',  'php', ['artisan', 'serve', '--port=8001'], BACK, 'backend')`)
    : null,
  // Inertia: php artisan serve from project root, Vite runs alongside
  isInertia && hasBackend  ? `const backend  = run('backend',  'php', ['artisan', 'serve', '--port=8000'], __dirname, 'backend')` : null,
  hasBackend && hasJobs && !isInertia && !noQueueProcess
    ? (isExpress
      ? `const queue    = run('queue',    'npm', ['run', 'queue'], BACK, 'queue')`
      : isFastapi
        ? `const queue    = run('queue', PYTHON, ['-m', 'pluff.worker'], BACK, 'queue')`
        : `const queue    = run('queue',    'php', ['artisan', 'queue:work', '--queue=default,heavy', '--sleep=3', '--tries=3'], BACK, 'queue')`)
    : null,
  hasBackend && hasJobs && isInertia
    ? `const queue    = run('queue',    'php', ['artisan', 'queue:work', '--queue=default,heavy', '--sleep=3', '--tries=3'], __dirname, 'queue')` : null,
  hasBackend && hasRealtime && !isInertia && !isAspnet && !isFastapi && !isSpring && !isGo && !isRust
    ? (isExpress
      ? null
      : `const reverb   = run('reverb',   'php', ['artisan', 'reverb:start', '--host=0.0.0.0', '--port=8081', '--debug'], BACK, 'reverb')`)
    : null,
  hasBackend && hasRealtime && isInertia
    ? `const reverb   = run('reverb',   'php', ['artisan', 'reverb:start', '--host=0.0.0.0', '--port=8081', '--debug'], __dirname, 'reverb')` : null,
  // Frontend process
  isInertia
    ? `const frontend = run('frontend', 'npm',  ['run', 'dev'], __dirname, 'frontend')` : null,
  isNative && activeStack === 'react-native'
    ? `const frontend = run('frontend', 'npx', ['react-native', 'start'], __dirname, 'frontend')` : null,
  isNative && activeStack !== 'react-native'
    ? `const frontend = run('frontend', 'npx', ['expo', 'start'], __dirname, 'frontend')` : null,
  isTauri
    ? `const frontend = run('desktop', 'npm', ['run', 'tauri:dev'], FRONT, 'frontend')` : null,
  !isInertia && !isNative && !isTauri
    ? `const frontend = run('frontend', 'npm',  ['run', 'dev'], FRONT, 'frontend')` : null,
  ``,
  `const services = [${hasBackend ? ' backend,' : ''}${hasBackend && hasJobs && !noQueueProcess ? ' queue,' : ''}${hasBackend && hasRealtime && !isExpress && !isFastapi && !isAspnet && !isSpring && !isGo && !isRust ? ' reverb,' : ''} frontend].filter(Boolean)`,
  ``,
  `process.on('SIGINT', () => {`,
  `  services.forEach(s => s && s.kill())`,
  `  process.exit(0)`,
  `})`,
].filter(l => l !== null).join('\n')

fs.writeFileSync(path.join(PROJECT_DIR, 'start.js'), startLines)
success('start.js')

const projectPackagePath = path.join(PROJECT_DIR, 'package.json')
const projectPackage = fs.existsSync(projectPackagePath)
  ? JSON.parse(fs.readFileSync(projectPackagePath, 'utf-8'))
  : { private: true }
projectPackage.type = 'module'
fs.writeFileSync(projectPackagePath, JSON.stringify(projectPackage, null, 2))
success('package.json (ES module project scripts)')

// ─────────────────────────────────────────────
// STEP 15 — SITEMAP GENERATION
// ─────────────────────────────────────────────

// The engine's sitemap.xml / robots.txt (all tatemonos, /<tatName>/… URLs) are not copied into
// the export (see the copy filters). This step writes ones for THIS tatemono only, using the
// exported root URLs (pages are hoisted, so /<tatName>/login is just /login).
//
// The old version imported the engine's sitemap.ts with plain node (cannot load .ts) and called
// writeSitemap(publicDir) with the wrong arguments, and an empty catch hid the failure — so the
// stale engine sitemap was shipped. Generated directly here instead.
//
// Site URL: --site-url=https://example.com, else ARKZEN_SITE_URL / NEXT_PUBLIC_SITE_URL /
// VITE_SITE_URL, else the exported dev server (localhost:3001, Inertia: localhost:8000).
// ─────────────────────────────────────────────

if (isNative || isDesktop) {
  skip('Sitemap (native / desktop export has no website)')
} else {
  try {
    const siteUrl = (
      (siteUrlFlag ? siteUrlFlag.slice('--site-url='.length) : '') ||
      process.env.ARKZEN_SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VITE_SITE_URL ||
      `http://localhost:${isInertia ? 8000 : 3001}`
    ).replace(/\/+$/, '')

    const tatModule = (arkzenJson.modules ?? []).find(m => m.name === tatName)
    const pageNames = Array.isArray(tatModule?.pages) && tatModule.pages.length ? tatModule.pages : ['index']
    // Web stacks hoist pages to the root: 'index' → '/', everything else → '/<page>'.
    // Inertia is NOT hoisted (Laravel keeps Route::get('/<tatName>/…')), so it keeps the prefix.
    // Skip dynamic routes (/[id], /:id) — not crawlable.
    const prefix = isInertia ? `/${tatName}` : ''
    const routes = [...new Set(
      pageNames
        .filter(page => !/[\[\]:]/.test(page))
        .map(page => (page === 'index' ? (prefix || '/') : `${prefix}/${page}`))
    )]
    const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${xmlEscape(siteUrl + route)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`
    const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`

    const publicDir = isInertia ? path.join(PROJECT_DIR, 'public') : path.join(PROJ_FRONT, 'public')
    fs.mkdirSync(publicDir, { recursive: true })
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml)
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt)
    success(`public/sitemap.xml + robots.txt (${routes.length} URL(s), only ${tatName}, base ${siteUrl})`)
  } catch (error) {
    warn(`Sitemap generation failed: ${error.message}`)
  }
}

// ─────────────────────────────────────────────
// STEP 16 — README + .GITIGNORE
// ─────────────────────────────────────────────

const inertiaNote = isInertia
  ? `\n> **Inertia stack:** This is a monolithic project. Laravel serves the app and Vite handles\n> the React frontend — both run from the same folder. There is no separate \`frontend/\` directory.\n`
  : ''

const nativeNote = isNative
  ? `\n> **React Native stack:** No backend in this export. Run \`npm install\` then \`npx expo start\`.\n`
  : ''
const noBackendNote = noBackend
  ? `\n> **Frontend only:** This export has no backend. Run \`node start.js\` to start the frontend. ${tatUsesBackend ? 'The tatemono defined backend features (auth, API, database, jobs or realtime) that were not exported, so pages that call \`/api/*\` will not work until you connect your own backend.' : ''}\n`
  : ''
const tauriNote = isTauri
  ? `\n> **Tauri desktop:** Install Node.js, Rust, and the platform's Tauri prerequisites. Run \`npm install\` in \`frontend/\`, then \`node start.js\` to launch the desktop app.\n`
  : ''
const aspnetNote = isAspnet
  ? `\n> **ASP.NET Core status:** Auth, CRUD validation, update/delete policies, C# endpoint/middleware variants, and Pusher-compatible realtime are supported. Jobs/events run through an in-process queue (not durable across restarts); cron scheduling and file storage are not implemented.\n`
  : ''
const springNote = isSpring
  ? `\n> **Spring Boot status:** JDK 17+ and Apache Maven are required. Jobs use in-process workers and commands use an in-process cron scheduler; queued work is not durable across restarts. Pusher-compatible realtime is supported.\n`
  : ''
const fastapiNote = isFastapi
  ? `\n> **FastAPI backend:** Python 3 is required. The exported backend uses a local virtual environment; install Ollama separately if this Tatemono uses Ollama Studio.\n`
  : ''
const goNote = isGo
  ? `\n> **Go backend:** Go 1.22+ is required. Common CRUD, SQLite, module auth, restricted CRUD update/delete policies, Pusher-compatible realtime, a database-backed job queue with retries, and cron scheduling are supported. SQLite and PostgreSQL are both supported (set \`ARKZEN_DB_DRIVER=sqlite\` or \`pgsql\` in \`backend/.env\`). Job and console execution currently emulates the built-in \`job-test\` and \`scheduler-test\` variants; arbitrary custom \`:go\` handlers and custom middleware are not available yet.\n`
  : ''
const rustNote = isRust
  ? `\n> **Rust backend:** Install rustup with Cargo. Common CRUD API routes, module auth, and schema setup are supported on both SQLite and PostgreSQL (set \`ARKZEN_DB_DRIVER=sqlite\` or \`pgsql\` plus the \`DB_*\` values in \`backend/.env\`; PostgreSQL needs a user allowed to create databases). Custom \`:rs\` handlers, middleware/auth policies, queues, and realtime are not available yet.\n`
  : ''

fs.writeFileSync(path.join(PROJECT_DIR, 'README.md'), `# ${tatName}

Generated by Arkzen export.js v10.
${inertiaNote}${nativeNote}${noBackendNote}${tauriNote}${fastapiNote}${aspnetNote}${springNote}${goNote}${rustNote}
## Start

\`\`\`bash
node start.js
\`\`\`

| Service  | URL                                          |
|----------|----------------------------------------------|${hasBackend && !isInertia ? '\n| Backend  | http://localhost:8001                        |' : ''}${isInertia ? '\n| App      | http://localhost:8000 (Laravel + Vite)       |' : ''}${isTauri ? '\n| Desktop  | Tauri window                                  |' : ''}${!isInertia && !isNative && !isTauri ? '\n| Frontend | http://localhost:3001                        |' : ''}${hasBackend && hasRealtime && !isAspnet && !isSpring && !isGo && !isRust ? `\n| Realtime | ws://localhost:${isExpress || isFastapi ? '8080' : '8081'}                          |` : ''}
${hasBackend && !isInertia ? `
## Manual backend setup (if needed)

\`\`\`bash
cd backend
${isExpress ? 'npm install\nnpm start' : isFastapi ? 'python -m venv .venv\n.venv/bin/python -m pip install -r requirements.txt\n# Windows: .venv\\\\Scripts\\\\python.exe -m pip install -r requirements.txt' : isAspnet ? 'dotnet restore Pluff.AspNet.csproj\ndotnet run --project Pluff.AspNet.csproj' : isSpring ? 'mvn -B dependency:build-classpath -Dmdep.outputFile=target/classpath.txt\nmvn -B compile\n# then run: java -cp "target/classes:$(cat target/classpath.txt)" ${SPRING_SERVER_CLASS}   (Windows uses ; instead of :)' : isGo ? 'go mod download\ncd ..\nnode start.js   # loads backend/.env and starts both services' : isRust ? 'cargo fetch\ncargo run' : 'composer install\nphp artisan key:generate\nphp artisan migrate\nphp artisan db:seed   # if seeders exist'}
\`\`\`
` : ''}`)

// ─────────────────────────────────────────────
// STEP 16b — DOCKER (--docker, web stacks only) + DEPLOY.md (always)
// ─────────────────────────────────────────────

const deployCtx = {
  projectDir: PROJECT_DIR, projBack: PROJ_BACK, projFront: PROJ_FRONT,
  tatName, stack: activeStack, backend: activeBackend,
  isPg, hasBackend: isInertia ? true : (!isNative && hasBackend), hasRealtime, hasJobs, pgDatabaseName,
  dbPrefix: engineEnvValue('ARKZEN_DB_PREFIX', 'pluff'),
  docker: wantsDocker, springServerClass: SPRING_SERVER_CLASS,
  pg: {
    host: engineEnvValue('DB_HOST', '127.0.0.1'), port: engineEnvValue('DB_PORT', '5432'),
    user: engineEnvValue('DB_USERNAME', 'postgres'), password: engineEnvValue('DB_PASSWORD', ''),
  },
  log: { success, warn },
}
if (wantsDocker) {
  log('Writing Docker files...')
  writeDockerFiles(deployCtx)
}
log('Writing DEPLOY.md...')
writeDeployGuide(deployCtx)
fs.appendFileSync(path.join(PROJECT_DIR, 'README.md'), `
## Deploy

Step-by-step instructions for this exact setup: **[DEPLOY.md](DEPLOY.md)**.${wantsDocker ? `

Quick start with Docker (then open http://localhost:8080):

\`\`\`bash
docker compose --env-file deploy.env up -d --build
\`\`\`
` : ''}
`)

fs.writeFileSync(path.join(PROJECT_DIR, '.gitignore'), [
  '**/node_modules/',
  '**/vendor/',
  '**/.next/',
  '**/.env',
  '**/.env.local',
  'deploy.env',
  ...(isGo ? ['backend/storage/'] : []),
  ...(isRust ? ['backend/target/'] : []),
  '*.log',
  '.DS_Store',
].join('\n'))

// ─────────────────────────────────────────────
// STEP 16c — OPENAPI (--openapi): openapi.json + api-docs.html from the tatemono's API blocks
// A failure here only warns — it never fails the export.
// ─────────────────────────────────────────────

let openApiResult = null
if (wantsOpenApi) {
  log('Generating OpenAPI docs...')
  openApiResult = exportOpenApi({
    rootDir: ROOT_DIR,
    tatName,
    outDir: path.join(PROJECT_DIR, 'openapi'),
    stack: activeStack,
    backend: activeBackend,
    apiUrl: openApiServerUrl,
  })
  if (openApiResult.ok) {
    success(`OpenAPI: ${openApiResult.operations} operations, ${openApiResult.schemas} schemas → openapi/openapi.json + openapi/api-docs.html`)
    fs.appendFileSync(path.join(PROJECT_DIR, 'README.md'), `
## API docs

\`openapi/openapi.json\` is an OpenAPI 3.1 spec (import it into Postman, Insomnia or a client generator).
Open \`openapi/api-docs.html\` in a browser for an interactive Swagger UI page.
`)
  } else if (openApiResult.skipped) {
    skip(`OpenAPI — ${openApiResult.reason}`)
  } else {
    warn(`OpenAPI docs not generated: ${openApiResult.reason}`)
  }
}

// ─────────────────────────────────────────────
// DONE
// ─────────────────────────────────────────────

divider()
console.log(`\n  ✓ EXPORTED: ${tatName}`)
console.log(`  Version:  v10`)
console.log(`  Stack:    ${activeStack}`)
if (noBackend) console.log(`  Backend:  none (frontend only)`)
if (hasBackend) console.log(`  DB:       ${isPg ? `PostgreSQL database ${pgDatabaseName}` : `${isInertia ? '' : 'backend/'}${isGo ? `storage/databases/${tatName}.sqlite` : `database/arkzen/${tatName}.sqlite`}`}`)
console.log(`  Run:      cd projects/${tatName} && node start.js`)
console.log(`  Deploy:   projects/${tatName}/DEPLOY.md${wantsDocker ? '  (Docker: docker compose --env-file deploy.env up -d --build)' : ''}`)
if (openApiResult?.ok) console.log(`  API docs: projects/${tatName}/openapi/api-docs.html  (spec: openapi/openapi.json)`)
divider()
