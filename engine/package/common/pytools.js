// ============================================================
// PLUFF PACKAGE PYTHON TOOLS v1.0
//
// The PyPI generator builds with the standard Python toolchain (hatchling through `python -m build`)
// and checks the result with twine. Those tools live in their own virtual environment inside
// engine/package/.venv, created by `node mizumi.js deps install package`, so nothing is installed into
// the user's own Python.
//
//   findPython()        a system Python 3 (python3, python, or the Windows `py -3` launcher), or null
//   toolPython()        python inside engine/package/.venv, or null when it has not been created
//   installPyTools()    create the venv and install build, hatchling, twine into it
//   pyToolchain()       what is installed, for `status`
//   makeVenv(dir)       a fresh throwaway venv (with pip) for the verify step
//   venvPython(dir)     the python executable inside any venv
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { run, TOOL_ROOT } from './run.js'

export const PY_TOOLS = ['build', 'hatchling', 'twine']
const TOOL_VENV = path.join(TOOL_ROOT, '.venv')

export const venvPython = dir => path.join(dir, process.platform === 'win32' ? 'Scripts' : 'bin', process.platform === 'win32' ? 'python.exe' : 'python')

let systemPython
export function findPython() {
  if (systemPython !== undefined) return systemPython
  const candidates = [{ cmd: 'python3', args: [] }, { cmd: 'python', args: [] }, { cmd: 'py', args: ['-3'] }]
  systemPython = null
  for (const c of candidates) {
    const r = run(c.cmd, [...c.args, '-c', 'import sys; print("%d.%d.%d" % sys.version_info[:3])'], { timeout: 20000 })
    if (r.ok && /^3\.\d+\.\d+/.test(r.stdout.trim())) {
      const [major, minor] = r.stdout.trim().split('.').map(Number)
      if (major === 3 && minor >= 9) { systemPython = { ...c, version: r.stdout.trim() }; break }
    }
  }
  return systemPython
}

export function toolPython() {
  const py = venvPython(TOOL_VENV)
  return fs.existsSync(py) ? py : null
}

const pipShow = (py, name) => {
  const r = run(py, ['-m', 'pip', 'show', name], { timeout: 60000 })
  const m = r.ok && r.stdout.match(/^Version:\s*(.+)$/m)
  return m ? m[1].trim() : null
}

export function pyToolchain() {
  const sys = findPython()
  const out = [{ name: 'python', ok: !!sys, version: sys?.version ?? null }]
  const py = toolPython()
  for (const name of PY_TOOLS) {
    const version = py ? pipShow(py, name) : null
    out.push({ name: `py:${name}`, ok: !!version, version })
  }
  return out
}

export function makeVenv(dir) {
  const sys = findPython()
  if (!sys) return { ok: false, error: 'no Python 3.9 or newer was found (python3, python, py -3)' }
  const r = run(sys.cmd, [...sys.args, '-m', 'venv', dir], { timeout: 180000 })
  if (!r.ok) return { ok: false, error: (r.stderr || r.stdout).trim().split('\n').slice(-3).join(' ') }
  return { ok: true, python: venvPython(dir) }
}

export function installPyTools({ log = () => {} } = {}) {
  const sys = findPython()
  if (!sys) return { ok: false, error: 'Python 3.9 or newer was not found. Install it from python.org, then run this again. (PyPI packages stay UNVERIFIED without it; npm packages are not affected.)' }
  if (!toolPython()) {
    log(`creating ${path.relative(process.cwd(), TOOL_VENV) || TOOL_VENV} with Python ${sys.version}`)
    const venv = makeVenv(TOOL_VENV)
    if (!venv.ok) return { ok: false, error: `could not create the virtual environment: ${venv.error}` }
  }
  const py = toolPython()
  log(`pip install ${PY_TOOLS.join(' ')}`)
  const r = run(py, ['-m', 'pip', 'install', '--upgrade', '--quiet', '--disable-pip-version-check', ...PY_TOOLS], { timeout: 600000 })
  return r.ok ? { ok: true } : { ok: false, error: (r.stderr || r.stdout).trim().split('\n').slice(-4).join(' ') }
}
