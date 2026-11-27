#!/usr/bin/env node
// ============================================================
// Pluffy Package plan, Phase 3: validator accepts `auth` in include / exclude.
//
// Run from the Pluffy repo root:   node engine/package/phase3/apply.mjs   (add --dry to preview)
//
// The sdk and openapi kinds can include the generated auth routes (login, register, me, logout) when
// meta.auth is true, so `include: [notes, auth]` must not be reported as an unknown identifier.
// One anchored insertion in engine/shared/arkzen/engine-core/validator.ts, then the same file is copied
// to the stack copies (shared-sync.ts would do that on the next engine start anyway).
// Safe to run twice; stops before writing anything if the anchor is missing. Delete this folder afterwards.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DRY = process.argv.includes('--dry')
const shared = path.join(ROOT, 'engine/shared/arkzen/engine-core/validator.ts')
if (!fs.existsSync(shared)) { console.error('Run this from the Pluffy repo root (engine/shared/arkzen/engine-core/validator.ts not found).'); process.exit(1) }

const raw = fs.readFileSync(shared, 'utf8')
const eol = raw.includes('\r\n') ? '\r\n' : '\n'
let text = raw.replace(/\r\n/g, '\n')
const DONE = "if (parsed.meta.auth) apiNames.add('auth')"
const ANCHOR = '  const knownIds = [...new Set([...apiNames, ...dbNames])]\n'

if (text.includes(DONE)) console.log('  already done  validator.ts accepts auth')
else {
  const at = text.indexOf(ANCHOR)
  if (at === -1 || text.indexOf(ANCHOR, at + 1) !== -1) {
    console.error(`Phase 3 NOT applied. Nothing was written.\n  ANCHOR ${at === -1 ? 'NOT FOUND' : 'NOT UNIQUE'}: ${ANCHOR.trim()}\nSend this output back: the validator changed since this patch was made.`)
    process.exit(1)
  }
  text = text.slice(0, at) + "  // the generated auth routes (login, register, me, logout) can be included in sdk / openapi packages\n  if (parsed.meta.auth) apiNames.add('auth')\n" + text.slice(at)
  console.log('  edited        validator.ts accepts auth in include / exclude')
}

const copies = []
const scan = dir => {
  if (!fs.existsSync(dir)) return
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.name === 'node_modules' || d.name === '.git') continue
    const p = path.join(dir, d.name)
    if (d.isDirectory()) scan(p)
    else if (d.name === 'validator.ts' && p.includes(`${path.sep}arkzen${path.sep}core${path.sep}`)) copies.push(p)
  }
}
scan(path.join(ROOT, 'engine', 'frontend'))
scan(path.join(ROOT, 'engine', 'backend'))

const write = (file, fileEol) => { if (!DRY) fs.writeFileSync(file, fileEol === '\r\n' ? text.replace(/\n/g, '\r\n') : text) }
write(shared, eol)
for (const copy of copies) {
  const copyEol = fs.readFileSync(copy, 'utf8').includes('\r\n') ? '\r\n' : '\n'
  write(copy, copyEol)
  console.log(`  synced copy   ${path.relative(ROOT, copy)}`)
}
console.log(`\nPhase 3 ${DRY ? 'dry run ok' : 'applied'}.`)
