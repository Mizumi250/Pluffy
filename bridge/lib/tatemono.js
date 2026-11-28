// Read, write and check tatemono files for the phone editor.
import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { ROOT, MIZUMI, TATEMONOS } from './paths.js'

const fail = (message, status = 400) => Object.assign(new Error(message), { status })
const MAX_BYTES = 1024 * 1024

export function dirOf(name) {
  if (!/^[A-Za-z0-9][\w.-]*$/.test(name)) throw fail('Not a tatemono name.')
  const dir = path.join(TATEMONOS, name)
  if (!fs.existsSync(path.join(dir, 'core.tsx'))) throw fail(`No tatemono called ${name}.`, 404)
  return dir
}

function fileOf(name, rel) {
  const dir = dirOf(name)
  const clean = path.normalize(String(rel || 'core.tsx')).replace(/\\/g, '/')
  if (clean.startsWith('..') || path.isAbsolute(clean) || clean.split('/').includes('node_modules')) throw fail('That path is not allowed.', 403)
  const full = path.join(dir, clean)
  if (!full.startsWith(dir + path.sep)) throw fail('That path is not allowed.', 403)
  return { dir, full, rel: clean }
}

export function files(name) {
  const dir = dirOf(name), out = []
  const walk = (d, depth) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue
      const full = path.join(d, e.name)
      if (e.isDirectory()) { if (depth < 3) walk(full, depth + 1) } else if (out.length < 200) {
        const st = fs.statSync(full)
        out.push({ path: path.relative(dir, full).replace(/\\/g, '/'), size: st.size })
      }
    }
  }
  walk(dir, 0)
  out.sort((a, b) => (a.path === 'core.tsx' ? -1 : b.path === 'core.tsx' ? 1 : a.path.localeCompare(b.path)))
  return out
}

export function read(name, rel) {
  const { full } = fileOf(name, rel)
  let st
  try { st = fs.statSync(full) } catch { throw fail('That file is not there.', 404) }
  if (st.size > MAX_BYTES) return { binary: true, tooBig: true, size: st.size, mtime: st.mtimeMs }
  const buf = fs.readFileSync(full)
  if (buf.includes(0)) return { binary: true, size: st.size, mtime: st.mtimeMs }
  return { text: buf.toString('utf8'), mtime: st.mtimeMs, size: st.size }
}

// baseMtime guards against overwriting something that changed on the laptop while the phone was editing
export function write(name, rel, text, baseMtime) {
  const { full } = fileOf(name, rel)
  if (typeof text !== 'string' || Buffer.byteLength(text) > MAX_BYTES) throw fail('That file is too big to save from the phone.', 413)
  let st = null
  try { st = fs.statSync(full) } catch { /* new file */ }
  if (st && baseMtime != null && Math.abs(st.mtimeMs - Number(baseMtime)) > 1) throw Object.assign(fail('This file changed on the laptop.', 409), { mtime: st.mtimeMs })
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, text, 'utf8')
  return { mtime: fs.statSync(full).mtimeMs }
}

// Runs `mizumi check <name>` without blocking the server, and pulls the problem lines out of its output.
export function check(name) {
  dirOf(name)
  return new Promise((resolve) => {
    execFile(process.execPath, [MIZUMI, 'check', name], { cwd: ROOT, timeout: 30_000, maxBuffer: 4 * 1024 * 1024, env: { ...process.env, FORCE_COLOR: '0' } }, (_e, stdout, stderr) => {
      const output = `${stdout ?? ''}${stderr ?? ''}`.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')
      const problems = []
      for (const line of output.split(/\r?\n/)) {
        const m = /^\s*(✗|⚠)\s+line (\d+):\s*(.*)$/.exec(line)
        if (m) problems.push({ level: m[1] === '✗' ? 'error' : 'warning', line: Number(m[2]), message: m[3] })
      }
      const sum = /(\d+) error\(s\), (\d+) warning/.exec(output)
      resolve({
        problems,
        errors: sum ? Number(sum[1]) : problems.filter((p) => p.level === 'error').length,
        warnings: sum ? Number(sum[2]) : problems.filter((p) => p.level === 'warning').length,
        output: output.trim().slice(-6000),
      })
    })
  })
}
