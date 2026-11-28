// Runs a program inside a pseudo-terminal, so prompts and terminal screens can be driven the way
// a person drives them. Uses Python's standard library `pty` module (python3 required, Linux and
// macOS only). When that is not possible the result says so and callers report UNVERIFIED.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { run } from './run.js'

const DRIVER = path.join(path.dirname(fileURLToPath(import.meta.url)), 'pty_driver.py')

let available
export async function ptyAvailable() {
  if (available !== undefined) return available
  if (process.platform === 'win32') return (available = { ok: false, reason: 'pseudo-terminal runs are not supported on Windows' })
  const r = await run('python3', ['-c', 'import pty, fcntl, termios'], { timeoutMs: 10_000 })
  available = r.code === 0 ? { ok: true } : { ok: false, reason: 'python3 with the pty module is needed for pseudo-terminal runs' }
  return available
}

// spec: { cmd, args, cwd, env, cols, rows, timeout (seconds, overall), steps: [{ expect, send, timeout, delay }] }
//   each step waits until `expect` (a regular expression, matched on the output with escape codes
//   removed, searching forward from the previous match) appears, then types `send`.
// Returns { ok, exitCode, signal, text, output, matched, timedOut, error } or { ok: false, unavailable }.
export async function runInPty(spec) {
  const can = await ptyAvailable()
  if (!can.ok) return { ok: false, unavailable: can.reason }
  const overall = (spec.timeout ?? 30) + 15
  const r = await run('python3', [DRIVER, JSON.stringify({ cols: 80, rows: 24, ...spec })], { timeoutMs: overall * 1000 })
  if (r.error || r.code !== 0) return { ok: false, unavailable: `the pseudo-terminal driver failed: ${r.error?.message ?? r.stderr.trim().split('\n').slice(-3).join(' ')}` }
  try {
    const result = JSON.parse(r.stdout.trim().split('\n').at(-1))
    return { ok: true, ...result }
  } catch {
    return { ok: false, unavailable: `the pseudo-terminal driver printed something unexpected: ${r.stdout.slice(0, 200)}` }
  }
}

// Common keys for `send`.
export const KEY = {
  enter: '\r', ctrlC: '\u0003', ctrlD: '\u0004', escape: '\u001b', tab: '\t', space: ' ', backspace: '\u007f',
  up: '\u001b[A', down: '\u001b[B', right: '\u001b[C', left: '\u001b[D',
}
