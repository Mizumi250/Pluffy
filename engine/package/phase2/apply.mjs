#!/usr/bin/env node
// ============================================================
// Pluffy Package plan, Phase 2: wire the package tools into mizumi.js.
//
// Run from the Pluffy repo root:   node engine/package/phase2/apply.mjs   (add --dry to preview)
//
// Adds to mizumi.js:
//   node mizumi.js export <tatemono> package [--id=<package-id>] [--target=<registry>] [--no-verify]
//   node mizumi.js deps install package
// Small anchored insertions only; safe to run twice; stops before writing if an anchor is missing.
// Delete engine/package/phase2/ afterwards.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DRY = process.argv.includes('--dry')
const file = path.join(ROOT, 'mizumi.js')
if (!fs.existsSync(file)) { console.error('Run this from the Pluffy repo root (mizumi.js not found).'); process.exit(1) }
const raw = fs.readFileSync(file, 'utf8')
const eol = raw.includes('\r\n') ? '\r\n' : '\n'
let text = raw.replace(/\r\n/g, '\n')
const log = []
let failed = false

function edit(done, anchor, replacement, mode = 'after') {
  if (text.includes(done)) { log.push(`  already done  ${done.slice(0, 60)}`); return }
  const at = text.indexOf(anchor)
  if (at === -1) { log.push(`  ANCHOR NOT FOUND  ${anchor.split('\n')[0].slice(0, 100)}`); failed = true; return }
  if (text.indexOf(anchor, at + 1) !== -1) { log.push(`  ANCHOR NOT UNIQUE  ${anchor.split('\n')[0].slice(0, 100)}`); failed = true; return }
  text = mode === 'before' ? text.slice(0, at) + replacement + text.slice(at)
       : mode === 'replace' ? text.slice(0, at) + replacement + text.slice(at + anchor.length)
       : text.slice(0, at + anchor.length) + replacement + text.slice(at + anchor.length)
  log.push(`  edited        ${done.slice(0, 60)}`)
}

// 1. helper that runs engine/package/cli.js
edit('function runPackageCli(', 'async function cmdExport(tatName, stackArg, dockerFlag = false, backendArg, openapiFlag = false, apiUrlArg) {',
`// Package tools (engine/package): build, pack and verify packages for npm (more registries later).
function runPackageCli(cliArgs) {
  const child = spawn(process.execPath, [path.join(ROOT_DIR, 'engine', 'package', 'cli.js'), ...cliArgs], { cwd: ROOT_DIR, stdio: 'inherit' })
  child.on('exit', code => { process.exitCode = code ?? 1 })
}

`, 'before')

// 2. mizumi export <tat> package
edit("if (positional[1] === 'package')", "    cmdExport(positional[0], positional[1], args.includes('--docker'), backendArg, args.includes('--openapi'), apiUrlArg)\n    break\n",
"    if (positional[1] === 'package') {\n      runPackageCli(['build', ...(positional[0] ? [positional[0]] : []), ...args.slice(1).filter(a => a.startsWith('--') && a !== '--docker')])\n      break\n    }\n" +
"    cmdExport(positional[0], positional[1], args.includes('--docker'), backendArg, args.includes('--openapi'), apiUrlArg)\n    break\n", 'replace')

// 3. mizumi deps install package
edit("stackArg === 'package'", 'async function cmdDeps(actionArg, stackArg) {\n',
"  if (actionArg === 'install' && stackArg === 'package') { runPackageCli(['deps']); return }\n", 'after')

// 4. help lines
edit("'mizumi export <tat> package'", "    ['mizumi deps uninstall <stack>',",
"    ['mizumi deps install package', '→ Install the package tools (tsdown, typescript, tsx) used by `export <tat> package`'],\n    ['mizumi export <tat> package', '→ Build, pack and verify the tatemono\\'s packages (--id=<package-id> --target=npm --no-verify)'],\n", 'before')

if (failed) { console.error('\nPhase 2 NOT applied. Nothing was written.\n' + log.join('\n')); process.exit(1) }
if (!DRY) fs.writeFileSync(file, eol === '\r\n' ? text.replace(/\n/g, '\r\n') : text)
console.log(log.join('\n'))
console.log(`\nPhase 2 ${DRY ? 'dry run ok' : 'applied'}.`)
