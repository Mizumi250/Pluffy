#!/usr/bin/env node
// ============================================================
// Pluffy Package plan, Phase 5: the validator accepts a Python command target (`<source>:<function>`).
//
// Run from the Pluffy repo root:   node engine/package/phase5/apply.mjs   (add --dry to preview)
//
// For PyPI, @arkzen:pkg:exports bin maps a command to `<source name>` or `<source name>:<function>`
// (for example `demo-py: cli:main`). The validator only knew the plain source name.
// One anchored edit in engine/shared/arkzen/engine-core/validator.ts, then the same file is copied to the
// stack copies. Safe to run twice; stops before writing anything if the anchor is missing.
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
const DONE = "!sources.has(src.split(':')[0])"
const ANCHOR = "if (typeof src !== 'string' || !sources.has(src))"

if (text.includes(DONE)) console.log('  already done  validator.ts accepts <source>:<function> in bin')
else {
  const at = text.indexOf(ANCHOR)
  if (at === -1 || text.indexOf(ANCHOR, at + 1) !== -1) {
    console.error(`Phase 5 NOT applied. Nothing was written.\n  ANCHOR ${at === -1 ? 'NOT FOUND' : 'NOT UNIQUE'}: ${ANCHOR}\nSend this output back: the validator changed since this patch was made.`)
    process.exit(1)
  }
  text = text.slice(0, at) + "if (typeof src !== 'string' || !sources.has(src.split(':')[0]))" + text.slice(at + ANCHOR.length)
  console.log("  edited        validator.ts accepts <source>:<function> in bin")
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
  write(copy, fs.readFileSync(copy, 'utf8').includes('\r\n') ? '\r\n' : '\n')
  console.log(`  synced copy   ${path.relative(ROOT, copy)}`)
}
console.log(`\nPhase 5 ${DRY ? 'dry run ok' : 'applied'}.`)
