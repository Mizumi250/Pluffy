#!/usr/bin/env node
// ============================================================
// PLUFF PACKAGE CLI v1.0
//
//   node engine/package/cli.js build <tatemono> [--id=<package-id>] [--target=<registry>] [--no-verify]
//                                     [--jsr-dry-run] [--stack=<frontend>] [--backend=<name>] [--api-url=<url>]   (derived kinds)
//   node engine/package/cli.js deps          install the tools (npm install in engine/package)
//   node engine/package/cli.js status        which tools are installed
//
// `node mizumi.js export <tatemono> package` and `node mizumi.js deps install package` call this.
// Output: projects/package/<tatemono>/<package-id>/<registry>/   (gitignored)
// Pluffy never publishes and never stores credentials: publishing stays a manual `npm publish`.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { installPyTools, pyToolchain } from './common/pytools.js'
import { npm, npmToolchain, TOOL_ROOT } from './common/run.js'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const args = process.argv.slice(2)
const flag = name => args.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3)
const positional = args.slice(1).filter(a => !a.startsWith('--'))
const paint = (code, text) => (process.stdout.isTTY ? `\x1b[${code}m${text}\x1b[0m` : text)
const ICON = { passed: paint(32, 'PASS'), failed: paint(31, 'FAIL'), unverified: paint(33, 'UNVERIFIED'), skipped: paint(90, 'skip') }

const DERIVED_KINDS = ['sdk', 'types', 'validators', 'openapi']

const GENERATORS = {
  npm: async () => (await import('./npm/generator.js')).buildNpmPackage,
  // GitHub Packages are npm packages scoped to their owner, published to npm.pkg.github.com
  github: async () => (await import('./npm/generator.js')).buildNpmPackage,
  // jsr.io publishes TypeScript sources: no build, and its own dry run needs Deno (opt in with --jsr-dry-run)
  jsr: async () => (await import('./npm/jsr.js')).buildJsrPackage,
  // PyPI: hatchling through python -m build, verified in a fresh virtual environment
  pypi: async () => (await import('./pypi/generator.js')).buildPyPackage,
}

function printReport(report) {
  console.log(`\n  ${report.package}@${report.version}  (${report.registry})`)
  for (const s of report.steps) {
    const detail = s.detail ? `  ${paint(90, s.detail.split('\n')[0])}` : ''
    console.log(`    ${(ICON[s.status] ?? s.status).padEnd(18)} ${s.name}${detail}`)
    if (s.status === 'failed' && s.detail.includes('\n')) console.log(s.detail.split('\n').slice(1).map(l => `        ${l}`).join('\n'))
  }
  for (const w of report.warnings) console.log(`    ${paint(33, 'warn')}  ${w}`)
  const verdict = { passed: paint(32, 'VERIFIED: built, packed, installed from the archive and imported'), failed: paint(31, 'FAILED'), unverified: paint(33, 'UNVERIFIED: a tool is missing, nothing was claimed as passed'), skipped: paint(90, 'built and packed, verification skipped') }[report.verified]
  console.log(`\n  ${verdict}`)
}

async function build() {
  const name = positional[0]
  if (!name) { console.error('Usage: node engine/package/cli.js build <tatemono> [--id=<package-id>] [--target=<registry>] [--no-verify]'); return 2 }
  const file = path.join(ROOT_DIR, 'tatemonos', name, 'core.tsx')
  if (!fs.existsSync(file)) { console.error(`[pkg] Unknown tatemono "${name}" (no ${path.relative(ROOT_DIR, file)})`); return 2 }

  let readTatemono
  try {
    ;({ readTatemono } = await import('./common/read.js'))
  } catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error
    console.error('[pkg] The package tools are not installed yet. Run: node mizumi.js deps install package')
    return 2
  }
  const tatemono = readTatemono(file)
  const wantedId = flag('id')
  const wantedTarget = flag('target')
  let packages = tatemono.packages
  if (wantedId) packages = packages.filter(p => p.id === wantedId)
  if (packages.length === 0) { console.error(`[pkg] No package with id "${wantedId}". Packages in ${name}: ${tatemono.packages.map(p => p.id).join(', ')}`); return 2 }

  let exit = 0
  for (const pkg of packages) {
    if (pkg.project.workspace_only === true) { console.log(`  skip ${pkg.id}: workspace_only`); continue }
    const registries = (Array.isArray(pkg.project.targets) ? pkg.project.targets : []).filter(r => !wantedTarget || r === wantedTarget)
    if (registries.length === 0) { console.error(`[pkg] Package "${pkg.id}" has no target${wantedTarget ? ` "${wantedTarget}"` : ''}`); exit = 2; continue }
    // sdk, types, validators and openapi are generated from the api and database blocks (read once per package)
    let derived
    if ((registries.includes('npm') || registries.includes('github')) && DERIVED_KINDS.includes(pkg.project.kind)) {
      try {
        const { derivePackage } = await import('./derive/index.js')
        derived = derivePackage({ kind: pkg.project.kind, rootDir: ROOT_DIR, tatName: name, pkg, version: tatemono.meta.version, stack: flag('stack'), backend: flag('backend'), apiUrl: flag('api-url') })
      } catch (error) {
        console.error(`\n  ${paint(31, 'ERROR')} ${pkg.id}: ${error.message}`)
        exit = 1
        continue
      }
    }
    for (const registry of registries) {
      const generator = GENERATORS[registry]
      if (!generator) { console.log(`\n  ${pkg.id} (${registry}): ${paint(33, 'not implemented yet')} (npm, github, jsr and pypi are the registries implemented so far)`); continue }
      const outDir = path.join(ROOT_DIR, 'projects', 'package', name, pkg.id, registry)
      try {
        const buildPackage = await generator()
        const report = buildPackage({ tatemono, pkg, outDir, derived, registry, jsrDryRun: args.includes('--jsr-dry-run'), verify: !args.includes('--no-verify'), log: m => console.log(`  ${paint(90, m)}`) })
        printReport(report)
        console.log(`  ${paint(90, 'output')}  ${path.relative(ROOT_DIR, outDir)}`)
        if (report.verified === 'failed') exit = 1
      } catch (error) {
        console.error(`\n  ${paint(31, 'ERROR')} ${pkg.id} (${registry}): ${error.message}`)
        exit = 1
      }
    }
  }
  return exit
}

function status() {
  console.log('\n  Package tools (engine/package)')
  for (const t of [...npmToolchain(), ...pyToolchain()]) console.log(`    ${t.ok ? paint(32, 'ok     ') : paint(31, 'missing')} ${t.name}${t.version ? ` ${t.version}` : ''}`)
  console.log('\n  Other registries (crates.io, Go, Maven, NuGet, Packagist) are not implemented yet.')
  return 0
}

function deps() {
  console.log(`  npm install in ${path.relative(ROOT_DIR, TOOL_ROOT)}`)
  const r = npm(['install', '--no-audit', '--no-fund'], { cwd: TOOL_ROOT, inherit: true, timeout: 900000 })
  // Python tools for the PyPI generator live in engine/package/.venv. Missing Python only affects PyPI packages.
  const py = installPyTools({ log: m => console.log(`  ${m}`) })
  if (!py.ok) console.log(`  ${paint(33, 'note')}  Python tools were not installed: ${py.error}`)
  return r.ok ? 0 : 1
}

const command = args[0]
const code = command === 'build' ? await build() : command === 'deps' ? deps() : command === 'status' ? status()
  : (console.log('Usage: node engine/package/cli.js <build <tatemono> | deps | status>'), 2)
process.exit(code)
