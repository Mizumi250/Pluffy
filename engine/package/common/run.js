// ============================================================
// PLUFF PACKAGE PROCESS HELPERS v1.0
//
// run(cmd, args, opts)  -> { ok, code, stdout, stderr }   never throws, never uses a shell
//                          unless the command cannot be found any other way (npm on a
//                          machine where npm-cli.js is not next to node).
// npm(args, opts)       -> run npm through node + npm-cli.js (works the same on Windows,
//                          macOS and Linux, no .cmd shim)
// toolBin(pkg, bin)     -> absolute path of a CLI shipped by a tool dependency of
//                          engine/package (tsdown, typescript, tsx), read from its package.json
// toolVersion(pkg)      -> the installed version of such a dependency, or null
//
// Tools are always resolved from engine/package/node_modules, never from a stack.
// ============================================================

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const TOOL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// The environment child tools run in. NODE_TEST_CONTEXT is dropped so a `node --test` child
// (tsx --test inside a package build) runs as its own test run and reports its own exit code,
// even when this code itself is running under the node test runner.
function childEnv(extra) {
  const env = { ...process.env, NO_UPDATE_NOTIFIER: '1', NPM_CONFIG_UPDATE_NOTIFIER: 'false', FORCE_COLOR: '0', NO_COLOR: '1', ...extra }
  delete env.NODE_TEST_CONTEXT
  return env
}

export function run(cmd, args, { cwd, env, timeout = 300000, input, inherit = false } = {}) {
  const result = spawnSync(cmd, args, {
    cwd, input, timeout, stdio: inherit ? 'inherit' : 'pipe', encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024,
    env: childEnv(env),
  })
  const timedOut = result.error && result.error.code === 'ETIMEDOUT'
  return {
    ok: result.status === 0 && !result.error,
    code: result.status,
    stdout: result.stdout ?? '',
    stderr: (result.stderr ?? '') + (result.error ? `\n${timedOut ? 'timed out' : result.error.message}` : ''),
  }
}

let npmCli
function findNpmCli() {
  if (npmCli !== undefined) return npmCli
  const nodeDir = path.dirname(process.execPath)
  const candidates = [
    path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),                 // Windows installer layout
    path.join(nodeDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),    // macOS / Linux layout
    path.join(nodeDir, '..', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ]
  if (process.env.npm_execpath && /npm-cli\.c?js$/.test(process.env.npm_execpath)) candidates.unshift(process.env.npm_execpath)
  npmCli = candidates.find(file => fs.existsSync(file)) ?? null
  return npmCli
}

export function npm(args, options = {}) {
  const cli = findNpmCli()
  if (cli) return run(process.execPath, [cli, ...args], options)
  // Last resort: let the shell find npm (npm.cmd on Windows).
  const quoted = args.map(a => (/[\s"]/.test(a) ? JSON.stringify(a) : a))
  const result = spawnSync(`npm ${quoted.join(' ')}`, { ...options, shell: true, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024, env: childEnv(options.env) })
  return { ok: result.status === 0, code: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' }
}

export function toolDir(pkg) {
  const dir = path.join(TOOL_ROOT, 'node_modules', pkg)
  return fs.existsSync(path.join(dir, 'package.json')) ? dir : null
}

export function toolVersion(pkg) {
  try { return JSON.parse(fs.readFileSync(path.join(TOOL_ROOT, 'node_modules', pkg, 'package.json'), 'utf8')).version } catch { return null }
}

export function toolBin(pkg, bin = pkg) {
  const dir = path.join(TOOL_ROOT, 'node_modules', pkg)
  let manifest
  try { manifest = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')) } catch { return null }
  const rel = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[bin]
  if (!rel) return null
  const file = path.join(dir, rel)
  return fs.existsSync(file) ? file : null
}

// Which of the tools the npm generator needs are installed.
export function npmToolchain() {
  const node = { name: 'node', ok: true, version: process.version }
  const npmVersion = npm(['--version'])
  const tools = ['tsdown', 'typescript', 'tsx'].map(name => ({ name, ok: toolVersion(name) !== null, version: toolVersion(name) }))
  return [node, { name: 'npm', ok: npmVersion.ok, version: npmVersion.ok ? npmVersion.stdout.trim() : null }, ...tools]
}
