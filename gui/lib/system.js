'use strict'
// Small OS helpers: tool detection, open VS Code / a CMD window, and .vsix handling.

const { spawn, execFile } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const win = process.platform === 'win32'
const mac = process.platform === 'darwin'
const q = (a) => (win && /[\s&()^%]/.test(a) ? `"${a}"` : a)

function exec(cmd, args = [], opts = {}) {
  return new Promise((resolve) => {
    execFile(cmd, win ? args.map(q) : args, { timeout: 8000, shell: win, windowsHide: true, maxBuffer: 1 << 22, ...opts },
      (err, stdout, stderr) => resolve({ ok: !err, out: String(stdout || '').trim(), err: String(stderr || '').trim() }))
  })
}

function trySpawn(cmd, args, opts) {
  return new Promise((resolve) => {
    let done = false
    const fin = (v) => { if (!done) { done = true; resolve(v) } }
    try {
      const c = spawn(cmd, args, { detached: true, stdio: 'ignore', ...opts })
      c.once('error', () => fin(false))
      c.unref()
      setTimeout(() => fin(true), 300)
    } catch { fin(false) }
  })
}

let codeCmd = null
async function findCode() {
  if (codeCmd) return codeCmd
  const cands = ['code']
  if (mac) cands.push('/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code')
  for (const c of cands) {
    if (c.startsWith('/') && !fs.existsSync(c)) continue
    const r = await exec(c, ['--version'])
    if (r.ok && r.out) return (codeCmd = c)
  }
  return null
}

async function envCheck() {
  const first = (r) => (r.ok && r.out ? r.out.split(/\r?\n/)[0].replace(/^git version /, '') : null)
  const [node, npm, git, code] = await Promise.all([
    exec('node', ['-v']), exec('npm', ['-v']), exec('git', ['--version']), exec('code', ['--version']),
  ])
  return { node: first(node), npm: first(npm), git: first(git), code: first(code) }
}

async function openVSCode(folder) {
  const code = await findCode()
  if (code) { await trySpawn(win ? q(code) : code, [folder], { shell: win, windowsHide: true }); return { ok: true } }
  if (mac && (await trySpawn('open', ['-a', 'Visual Studio Code', folder]))) return { ok: true }
  return { ok: false, error: 'VS Code was not found. Install it from https://code.visualstudio.com (and enable the "code" command).' }
}

async function openTerminal(folder) {
  if (win) return { ok: await trySpawn('cmd.exe', ['/c', 'start', '', '/D', folder, 'cmd.exe'], { windowsHide: true }) }
  if (mac) return { ok: await trySpawn('open', ['-a', 'Terminal', folder]) }
  const tries = [
    ['x-terminal-emulator', []], ['gnome-terminal', ['--working-directory=' + folder]],
    ['konsole', ['--workdir', folder]], ['xfce4-terminal', ['--working-directory=' + folder]], ['xterm', []],
  ]
  for (const [c, a] of tries) if (await trySpawn(c, a, { cwd: folder })) return { ok: true }
  return { ok: false, error: 'No terminal emulator found.' }
}

function killTree(pid) {
  if (!pid) return
  if (win) { try { spawn('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }) } catch { /* gone */ } return }
  try { process.kill(-pid, 'SIGTERM') } catch { try { process.kill(pid, 'SIGTERM') } catch { /* gone */ } }
}

// ---- .vsix --------------------------------------------------------------------
function parseVsix(file) {
  const m = /^(.+?)-(\d+\.\d+\.\d+(?:[-+][\w.]+)?)\.vsix$/i.exec(path.basename(file))
  return m ? { name: m[1], version: m[2] } : { name: path.basename(file, '.vsix'), version: '' }
}
const verCmp = (a, b) => {
  const x = a.split(/[.-]/).map(Number), y = b.split(/[.-]/).map(Number)
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0)
  return 0
}

function builtinVsix(root) {
  const dir = path.join(root, 'vscode-extension')
  try {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.vsix'))
      .sort((a, b) => verCmp(parseVsix(a).version, parseVsix(b).version))
    return files.length ? path.join(dir, files[files.length - 1]) : null
  } catch { return null }
}

async function installedExtensions() {
  const code = await findCode()
  if (!code) return null
  const r = await exec(code, ['--list-extensions', '--show-versions'])
  return r.ok ? r.out.split(/\r?\n/).filter(Boolean).map((s) => s.toLowerCase()) : []
}

const isInstalled = (list, file) => {
  const { name, version } = parseVsix(file)
  return !!list && list.some((l) => l.endsWith(`.${name}@${version}`.toLowerCase()))
}

async function installVsix(file) {
  const code = await findCode()
  if (!code) return { ok: false, error: 'VS Code (the "code" command) was not found.' }
  const r = await exec(code, ['--install-extension', file, '--force'], { timeout: 120000 })
  return r.ok ? { ok: true } : { ok: false, error: r.err || r.out || 'Install failed.' }
}

module.exports = { exec, findCode, envCheck, openVSCode, openTerminal, killTree, parseVsix, builtinVsix, installedExtensions, isInstalled, installVsix, win }
