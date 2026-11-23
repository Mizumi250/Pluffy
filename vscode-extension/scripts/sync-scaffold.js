#!/usr/bin/env node
// Copies Pluffy's scaffold.js into the extension as lib/scaffold.mjs so the
// extension and `node mizumi.js check|block` always share one implementation
// (block builders, name rules, cross-checks, lint).
//
//   node scripts/sync-scaffold.js [path/to/scaffold.js]
//
// scaffold.js does not have to export the block registry. If the exports the
// extension needs are missing, they are appended to the bundled copy only.
const fs = require('fs')
const path = require('path')

const src = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'scaffold.js'))
const out = path.join(__dirname, '..', 'lib', 'scaffold.mjs')
if (!fs.existsSync(src)) {
  console.error(`scaffold.js not found at ${src}\nUsage: node scripts/sync-scaffold.js <path-to-scaffold.js>`)
  process.exit(1)
}

let code = fs.readFileSync(src, 'utf8')
const NEEDED = ['BLOCKS', 'blockByKey', 'normalizeName', 'crossCheck', 'candidatesFor', 'hasTag', 'eolOf', 'closest', 'BACKENDS', 'BACKEND_LABEL']
const alreadyExported = name =>
  new RegExp(`export\\s+(?:async\\s+)?(?:const|let|function)\\s+${name}\\b`).test(code) ||
  new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`).test(code)
const declared = name =>
  new RegExp(`(?:^|\\n)\\s*(?:const|let|function)\\s+${name}\\b`).test(code)

const missing = NEEDED.filter(n => !alreadyExported(n))
const unknown = missing.filter(n => !declared(n))
if (unknown.length) {
  console.error(`scaffold.js no longer declares: ${unknown.join(', ')}\nThe extension needs these. Update scripts/sync-scaffold.js or restore them.`)
  process.exit(1)
}
if (missing.length) code += `\n\n// ── appended by pluff-tatemono/scripts/sync-scaffold.js ──\nexport { ${missing.join(', ')} }\n`

fs.writeFileSync(out, code)
console.log(`synced ${path.relative(process.cwd(), src)} -> ${path.relative(process.cwd(), out)}  (+${missing.length} exports)`)
