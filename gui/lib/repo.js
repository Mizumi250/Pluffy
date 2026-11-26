'use strict'
// The four repo commands from mz.cmd, as plain git run from Node (no shell, so no quoting problems):
//
//   install     git clone Pluffy into Documents/Pluffy. If that folder already holds the copy this app
//               unpacked (no .git yet), it is linked to GitHub in place: engine files become GitHub's,
//               your tatemonos, arkzen.json and AI settings stay exactly as they are.
//   push        git add -A, commit, push
//   pull        discard every local change and match GitHub (the app asks you to type YES first)
//   uninstall   delete the folder for good, skipping the Recycle Bin (the app asks you to type DELETE first)
//
// Output goes to a terminal tab through `say`.

const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')

const REPO_URL = 'https://github.com/Mizumi250/Pluffy.git'
const KEEP = ['tatemonos', 'arkzen.json', '.mizumi-ai.json', '.pluffy-review.json']   // same list the app's own engine sync keeps
const has = (...p) => fs.existsSync(path.join(...p))

const C = { cmd: '\x1b[35m', ok: '\x1b[32m', bad: '\x1b[31m', dim: '\x1b[90m', off: '\x1b[0m' }
const crlf = (s) => String(s).replace(/\r?\n/g, '\r\n')
const show = (a) => (/[\s"']/.test(a) ? JSON.stringify(a) : a)

let busy = false

// Runs git. Streams everything to `say`, unless quiet. Always resolves { code, out }.
function git(args, { cwd, say, quiet = false, input } = {}) {
  return new Promise((resolve) => {
    if (say && !quiet) say(`${C.cmd}$ git ${args.map(show).join(' ')}${C.off}\r\n`)
    let out = ''
    let child
    try {
      child = spawn('git', args, { cwd, windowsHide: true, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } })
    } catch (e) { return resolve({ code: -1, out: '' }) }
    const take = (d) => { out += d; if (say && !quiet) say(crlf(d)) }
    child.stdout.on('data', take)
    child.stderr.on('data', (d) => { if (say && !quiet) say(crlf(d)) })
    child.on('error', (e) => {
      if (say) say(`${C.bad}${e.code === 'ENOENT' ? 'git was not found. Install Git for Windows from git-scm.com and restart the app.' : e.message}${C.off}\r\n`)
      resolve({ code: -1, out })
    })
    child.on('close', (code) => resolve({ code: code === null ? -1 : code, out }))
    if (input) child.stdin.write(input)
    child.stdin.end()
  })
}

function info(dir) {
  return { dir, exists: fs.existsSync(dir), installed: has(dir, '.git') }
}

const ok = () => ({ ok: true })
const fail = (msg) => ({ error: msg })

async function install(dir, say) {
  if (has(dir, '.git')) { say(`Already installed at ${dir}\r\n`); return ok() }

  const empty = !fs.existsSync(dir) || fs.readdirSync(dir).length === 0
  if (empty) {
    const r = await git(['clone', '--progress', REPO_URL, dir], { say })
    return r.code === 0 ? ok() : fail('git clone failed. Check your internet connection and read the output in the terminal tab.')
  }

  // The folder already holds an unpacked copy: turn it into a checkout without losing anything of yours.
  say(`${dir} already holds an unpacked copy. Linking it to GitHub; your tatemonos and settings stay as they are.\r\n`)
  const gitDir = path.join(dir, '.git')
  const undo = () => { try { fs.rmSync(gitDir, { recursive: true, force: true }) } catch { /* leave it */ } }
  const step = async (args, opts) => {
    const r = await git(args, { cwd: dir, say, ...opts })
    return r.code === 0 ? r : null
  }

  if (!(await step(['-c', 'init.defaultBranch=main', 'init']))) { undo(); return fail('git init failed.') }
  if (!(await step(['remote', 'add', 'origin', REPO_URL]))) { undo(); return fail('Could not add the GitHub remote.') }
  if (!(await step(['fetch', '--progress', 'origin']))) { undo(); return fail('git fetch failed. Check your internet connection. Nothing was changed.') }

  const head = await git(['ls-remote', '--symref', 'origin', 'HEAD'], { cwd: dir, quiet: true })
  const m = /^ref:\s+refs\/heads\/(\S+)\s+HEAD/m.exec(head.out)
  const branch = m ? m[1] : 'main'

  const done = (await step(['symbolic-ref', 'HEAD', `refs/heads/${branch}`]))
    && (await step(['reset', '--quiet', `origin/${branch}`]))
    // engine files (and anything the bundle left out, like gui/ and Shots/) become GitHub's; your own work stays
    && (await step(['checkout', '--', '.', ...KEEP.map((k) => `:(exclude)${k}`)]))
    && (await step(['branch', `--set-upstream-to=origin/${branch}`, branch]))
  if (!done) { undo(); return fail('Linking the folder to GitHub failed. Nothing was changed.') }

  try {   // the app's own bundle stamp is not part of the repo
    fs.appendFileSync(path.join(gitDir, 'info', 'exclude'), '\n.studio-bundle.json\n')
  } catch { /* not fatal */ }
  say(`${C.dim}Linked to origin/${branch}.${C.off}\r\n`)
  return ok()
}

const missing = (dir) => fail(`Pluffy is not installed at ${dir}. Run Install repo first.`)

async function push(dir, say) {
  if (!has(dir, '.git')) return missing(dir)
  await git(['add', '-A'], { cwd: dir, say })
  await git(['commit', '-m', `mizumi push ${new Date().toLocaleString()}`], { cwd: dir, say })   // "nothing to commit" is fine, push still runs
  const r = await git(['push', '--progress'], { cwd: dir, say })
  return r.code === 0 ? ok() : fail('git push failed. Read the output in the terminal tab (a login or a newer commit on GitHub is the usual reason).')
}

async function pull(dir, say) {
  if (!has(dir, '.git')) return missing(dir)
  const f = await git(['fetch', '--progress', 'origin'], { cwd: dir, say })
  if (f.code !== 0) return fail('git fetch failed. Nothing was changed.')
  const b = await git(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: dir, quiet: true })
  const branch = b.out.trim()
  if (b.code !== 0 || !branch) return fail('Could not read the current branch.')
  const r = await git(['reset', '--hard', `origin/${branch}`], { cwd: dir, say })
  return r.code === 0 ? ok() : fail('git reset failed.')
}

async function uninstall(dir, say, beforeDelete) {
  if (!fs.existsSync(dir)) return missing(dir)
  say(`${C.cmd}$ delete ${dir}${C.off}\r\n`)
  if (beforeDelete) beforeDelete()
  await new Promise((r) => setTimeout(r, 400))   // let closed shells let go of the folder
  try { await fs.promises.rm(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 }) } catch { /* checked below */ }
  if (fs.existsSync(dir)) return fail('Some files could not be deleted. Close editors or terminals using the folder and try again.')
  say(`Deleted.\r\n${C.dim}Restart Pluffy Studio to unpack the bundled copy again, or run Install repo to clone it.${C.off}\r\n`)
  return ok()
}

async function run(op, { dir, say, beforeDelete }) {
  if (busy) return fail('Another repo command is still running.')
  busy = true
  try {
    let r
    if (op === 'install') r = await install(dir, say)
    else if (op === 'push') r = await push(dir, say)
    else if (op === 'pull') r = await pull(dir, say)
    else if (op === 'uninstall') r = await uninstall(dir, say, beforeDelete)
    else r = fail('Unknown repo command: ' + op)
    say(r.error ? `\r\n${C.bad}[failed] ${r.error}${C.off}\r\n` : `\r\n${C.ok}[done]${C.off}\r\n`)
    return r
  } finally { busy = false }
}

module.exports = { run, info, REPO_URL }
