'use strict'
// Finds, unpacks and updates the Pluffy repo ("the engine") that the CLI runs from.
//
//  dev (gui/ sits inside the repo)  -> the live parent repo is used as is
//  packaged app                     -> resources/pluffy is unpacked to Documents/Pluffy (writable),
//                                      and re-synced when the app ships a newer snapshot.
//  Your own work is never overwritten: tatemonos you already have, arkzen.json and .mizumi-ai.json stay.

const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { spawnSync } = require('node:child_process')
const { Readable } = require('node:stream')
const { pipeline } = require('node:stream/promises')

const REPO = 'Mizumi250/Pluffy'
const BRANCH = 'main'
const SKIP_TOP = new Set(['.git', 'node_modules', 'gui', 'Shots', '.pluffy-review'])
const KEEP_FILES = new Set(['arkzen.json', '.mizumi-ai.json', '.pluffy-review.json'])
const STAMP = '.studio-bundle.json'

const has = (...p) => fs.existsSync(path.join(...p))

function resolveRoot(app, settings = {}) {
  if (process.env.PLUFFY_ROOT) return path.resolve(process.env.PLUFFY_ROOT)
  if (settings.root && has(settings.root, 'mizumi.js')) return settings.root
  if (!app.isPackaged) {
    const parent = path.resolve(__dirname, '..', '..')
    if (has(parent, 'mizumi.js')) return parent
  }
  return path.join(app.getPath('documents'), 'Pluffy')
}

function bundleDir(app) {
  const p = app.isPackaged ? path.join(process.resourcesPath, 'pluffy') : path.join(__dirname, '..', 'resources', 'pluffy')
  return has(p, 'mizumi.js') ? p : null
}

function readStamp(dir) {
  try { return JSON.parse(fs.readFileSync(path.join(dir, STAMP), 'utf8')) } catch { return null }
}

async function syncRepo(src, dst) {
  fs.mkdirSync(dst, { recursive: true })
  await fs.promises.cp(src, dst, {
    recursive: true, force: true,
    filter: (s, d) => {
      const rel = path.relative(src, s)
      if (!rel) return true
      const parts = rel.split(path.sep)
      if (SKIP_TOP.has(parts[0])) return false
      if (KEEP_FILES.has(rel) && fs.existsSync(d)) return false
      if (parts[0] === 'tatemonos' && parts.length >= 2 && fs.existsSync(d)) return false
      return true
    },
  })
}

async function ensure(root, bundle, onMsg = () => {}) {
  if (has(root, '.git')) return { synced: false, live: true }          // a real checkout: never touch it
  const missing = !has(root, 'mizumi.js')
  if (!bundle) return { synced: false, error: missing ? 'No bundled Pluffy copy found. Run "npm run bundle" in gui/, or use Engine > Update from GitHub.' : null }
  const b = readStamp(bundle), d = readStamp(root)
  const newer = b && (!d || Date.parse(b.date) > Date.parse(d.date))
  if (!missing && !newer) return { synced: false }
  onMsg(missing ? `Unpacking Pluffy into ${root} ...` : 'Updating engine files ...')
  await syncRepo(bundle, root)
  return { synced: true }
}

async function forceSync(root, bundle, onMsg = () => {}) {
  if (has(root, '.git')) throw new Error('This engine folder is a git checkout. Use git pull there.')
  if (!bundle) throw new Error('This build has no bundled copy.')
  onMsg('Re-syncing bundled files ...')
  await syncRepo(bundle, root)
}

async function updateFromGitHub(root, onMsg = () => {}) {
  if (has(root, '.git')) throw new Error('This engine folder is a git checkout. Use git pull there instead.')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-'))
  const headers = { 'User-Agent': 'pluffy-studio' }
  try {
    onMsg('Checking the latest commit ...')
    let commit = '', date = new Date().toISOString()
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/commits/${BRANCH}`, { headers })
      if (r.ok) { const j = await r.json(); commit = String(j.sha).slice(0, 7); date = j.commit.committer.date }
    } catch { /* offline for the API only: keep going */ }
    onMsg('Downloading Pluffy from GitHub ...')
    const res = await fetch(`https://codeload.github.com/${REPO}/tar.gz/refs/heads/${BRANCH}`, { headers })
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`)
    const file = path.join(tmp, 'repo.tar.gz')
    await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(file))
    onMsg('Unpacking ...')
    const t = spawnSync('tar', ['-xzf', file, '-C', tmp])
    if (t.status !== 0) throw new Error('Could not unpack the download (is "tar" available?)')
    const dir = fs.readdirSync(tmp).map((n) => path.join(tmp, n)).find((p) => fs.statSync(p).isDirectory())
    if (!dir) throw new Error('The download was empty.')
    onMsg('Updating engine files ...')
    await syncRepo(dir, root)
    fs.writeFileSync(path.join(root, STAMP), JSON.stringify({ commit, date, source: 'github' }, null, 2))
    return { commit }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
}

function info(root) {
  const live = has(root, '.git')
  const st = readStamp(root)
  let commit = st && st.commit, date = st && st.date
  if (live) {
    const g = spawnSync('git', ['-C', root, 'log', '-1', '--format=%h|%cI'], { encoding: 'utf8' })
    if (g.status === 0) [commit, date] = g.stdout.trim().split('|')
  }
  return { root, live, commit: commit || null, date: date || null, source: live ? 'git checkout' : (st && st.source) || 'bundled' }
}

function listTatemonos(root) {
  const dir = path.join(root, 'tatemonos')
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && has(dir, e.name, 'core.tsx'))
      .map((e) => ({ name: e.name, t: fs.statSync(path.join(dir, e.name, 'core.tsx')).mtimeMs }))
      .sort((a, b) => b.t - a.t).map((e) => e.name)
  } catch { return [] }
}

function listProjects(root) {
  const dir = path.join(root, 'projects')
  try { return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() } catch { return [] }
}

module.exports = { resolveRoot, bundleDir, ensure, forceSync, updateFromGitHub, info, listTatemonos, listProjects, SKIP_TOP, STAMP }
