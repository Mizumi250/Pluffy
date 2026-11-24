#!/usr/bin/env node
// Copies a Pluffy snapshot into gui/resources/pluffy, which the installer ships inside the app.
//
//   node scripts/bundle-repo.js            clone the latest Pluffy from GitHub (default)
//   node scripts/bundle-repo.js --local    use the repo this gui/ folder sits in
//   node scripts/bundle-repo.js <path>     use any Pluffy checkout
//
// Left out: .git, node_modules, gui/, Shots/ (screenshots).

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const GUI = path.resolve(__dirname, '..')
const OUT = path.join(GUI, 'resources', 'pluffy')
const SKIP = new Set(['.git', 'node_modules', 'gui', 'Shots', '.pluffy-review'])
const arg = process.argv[2]
let src, tmp

if (arg === '--local') src = path.resolve(GUI, '..')
else if (arg) src = path.resolve(arg)
else {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-bundle-'))
  console.log('Cloning the latest Pluffy from GitHub ...')
  execFileSync('git', ['clone', '--depth', '1', 'https://github.com/Mizumi250/Pluffy', tmp], { stdio: 'inherit' })
  src = tmp
}

if (!fs.existsSync(path.join(src, 'mizumi.js'))) { console.error('No mizumi.js in ' + src); process.exit(1) }

let commit = '', date = new Date().toISOString()
try {
  const out = execFileSync('git', ['-C', src, 'log', '-1', '--format=%h|%cI'], { encoding: 'utf8' }).trim().split('|')
  commit = out[0]; date = out[1]
} catch { /* not a git folder */ }

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })
fs.cpSync(src, OUT, {
  recursive: true,
  filter: (s) => { const rel = path.relative(src, s); return !rel || !SKIP.has(rel.split(path.sep)[0]) },
})
fs.writeFileSync(path.join(OUT, '.studio-bundle.json'), JSON.stringify({ commit, date, source: 'bundled' }, null, 2))
if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
console.log(`Bundled Pluffy ${commit} (${date}) -> ${path.relative(process.cwd(), OUT)}`)
