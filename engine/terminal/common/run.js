// Process helpers for the terminal engine. No shell is ever used, so quoting never changes what runs.
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

// Runs a program and collects its output. Never throws: failures come back in the result.
export function run(cmd, args = [], { cwd, env, input, timeoutMs = 180_000 } = {}) {
  return new Promise(resolve => {
    let stdout = '', stderr = '', settled = false, timedOut = false
    const done = result => { if (!settled) { settled = true; clearTimeout(timer); resolve({ stdout, stderr, timedOut, ...result }) } }
    let child
    try {
      child = spawn(cmd, args, {
        cwd, env: env ?? process.env, windowsHide: true,
        stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
      })
    } catch (error) {
      resolve({ code: null, signal: null, stdout, stderr, timedOut: false, error })
      return
    }
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL') }, timeoutMs)
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', error => done({ code: null, signal: null, error }))
    child.on('close', (code, signal) => done({ code, signal }))
    if (input !== undefined) child.stdin.end(input)
  })
}

// npm is started through its own JavaScript entry point when it can be found next to node, so
// no shell (and no npm.cmd on Windows) is involved.
function npmCliPath() {
  const candidates = [
    path.join(path.dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ]
  return candidates.find(p => fs.existsSync(p)) ?? null
}

export function runNpm(args, options = {}) {
  const cli = npmCliPath()
  const env = { ...(options.env ?? process.env), npm_config_update_notifier: 'false', npm_config_fund: 'false', npm_config_audit: 'false' }
  return cli
    ? run(process.execPath, [cli, ...args], { ...options, env })
    : run(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, { ...options, env })
}

// True when the failure looks like a network problem rather than a bug.
export function looksOffline(text) {
  return /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|network|getaddrinfo|socket hang up/i.test(text)
}
