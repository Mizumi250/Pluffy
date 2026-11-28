// Runs a built command line program the way a user would and reports what happened.
// `launch` is { cmd, prefix }: the program is started as `cmd ...prefix ...args`.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { run } from './run.js'
import { splitArgs, matchesExpectation } from './shell.js'

const clip = text => { const t = text.trim(); return t.length > 400 ? t.slice(0, 400) + ' ...' : t }
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]/

// Every run starts in a fresh empty folder, so a command that writes files cannot disturb the next
// run or the project being verified.
export async function inFreshDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-term-run-'))
  try { return await fn(dir) } finally { fs.rmSync(dir, { recursive: true, force: true }) }
}

function launcher(launch, env, timeoutMs) {
  return args => inFreshDir(cwd => run(launch.cmd, [...launch.prefix, ...args], { cwd, env: { ...process.env, NO_COLOR: '1', ...env }, timeoutMs }))
}

// Returns steps: { name, status: PASS | FAIL, detail }
export async function verifyCli(model, launch, { timeoutMs = 30_000 } = {}) {
  const steps = []
  const exec = launcher(launch, {}, timeoutMs)
  const add = (name, ok, detail) => steps.push({ name, status: ok ? 'PASS' : 'FAIL', detail: ok ? undefined : detail })

  const help = await exec(['--help'])
  add('--help', help.code === 0 && help.stdout.includes(model.project.binary), `exit ${help.code}\n${clip(help.stdout + help.stderr)}`)

  const version = await exec(['--version'])
  add('--version', version.code === 0 && version.stdout.trim() === model.project.version,
    `expected "${model.project.version}", got exit ${version.code} and "${clip(version.stdout + version.stderr)}"`)

  for (const c of model.commands) {
    if (c.builtin === 'completion') continue
    const r = await exec([...c.path, '--help'])
    add(`${c.path.join(' ')} --help`, r.code === 0, `exit ${r.code}\n${clip(r.stdout + r.stderr)}`)
  }

  for (const c of model.commands) {
    for (const e of c.examples) {
      const label = `example: ${model.project.binary} ${e.cmd}`
      let args
      try { args = splitArgs(e.cmd) } catch (error) { add(label, false, error.message); continue }
      const r = await exec(args)
      const problems = []
      if (r.timedOut) problems.push('timed out')
      if (r.code !== e.expectExit) problems.push(`exit code ${r.code}, expected ${e.expectExit}`)
      if (e.expectStdout !== null && !matchesExpectation(r.stdout, e.expectStdout)) problems.push(`stdout did not match ${e.expectStdout}`)
      if (e.expectStderr !== null && !matchesExpectation(r.stderr, e.expectStderr)) problems.push(`stderr did not match ${e.expectStderr}`)
      add(label, problems.length === 0, `${problems.join('; ')}\nstdout: ${clip(r.stdout)}\nstderr: ${clip(r.stderr)}`)
    }
  }

  // No terminal, no color, a dumb TERM: the program must still work and must not print escape codes.
  const plain = await launcher(launch, { TERM: 'dumb', CI: '1' }, timeoutMs)(['--help'])
  add('non-interactive run (no TTY, NO_COLOR, TERM=dumb)', plain.code === 0 && !ANSI.test(plain.stdout + plain.stderr), `exit ${plain.code}${ANSI.test(plain.stdout) ? ', output contains escape codes' : ''}`)

  return steps
}

// ── prompts ──────────────────────────────────────────────

const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function whenHolds(step, answers) {
  if (!step.when) return true
  return Object.entries(step.when).every(([id, expected]) => Array.isArray(answers[id]) ? answers[id].includes(expected) : answers[id] === expected)
}

// Walks a prompt the way a person who only accepts defaults would, and says which questions come up,
// whether every one of them can be answered by pressing Enter, and what the first unanswerable one is.
export function simulateDefaults(prompt, { interactive }) {
  const answers = {}
  const asked = []
  let blocker = null
  for (const step of prompt.steps) {
    if (!whenHolds(step, answers)) continue
    asked.push(step)
    let value
    if (step.default !== undefined) value = step.default
    else if (interactive && step.type === 'confirm') value = true
    else if (interactive && (step.type === 'select' || step.type === 'autocomplete') && step.choices?.length) value = step.choices[0]
    if (step.type === 'autocomplete' && step.choices?.length && interactive) value = step.choices[0]
    if (value === undefined && step.type === 'multiselect' && interactive && !step.required) value = []
    if (value === undefined && step.required) { blocker ??= { step, reason: `"${step.id}" has no default and needs a typed answer` }; continue }
    if (interactive && step.type === 'editor') { blocker ??= { step, reason: `"${step.id}" opens an editor` }; continue }
    if (value !== undefined) answers[step.id] = value
  }
  return { asked, blocker }
}

const needsInput = c => c.args.some(a => a.required) || c.flags.some(f => f.required)

// Returns steps: { name, status: PASS | FAIL | UNVERIFIED, detail }
export async function verifyPrompts(model, launch, { timeoutMs = 30_000 } = {}) {
  const steps = []
  const { runInPty, ptyAvailable, KEY } = await import('./pty.js')
  for (const c of model.commands) {
    const prompt = c.prompt && !c.builtin ? model.prompts.find(p => p.name === c.prompt) : null
    if (!prompt) continue
    const label = c.path.join(' ')
    const add = (what, status, detail) => steps.push({ name: `${label}: ${what}`, status, detail })
    if (needsInput(c)) {
      add('prompt checks', 'UNVERIFIED', 'the command has required arguments or flags, so it cannot be started without them')
      continue
    }

    // 1. No terminal and no answers: it must not hang, and it must say what is missing.
    const plain = simulateDefaults(prompt, { interactive: false })
    const r = await inFreshDir(cwd => run(launch.cmd, [...launch.prefix, ...c.path], { cwd, env: { ...process.env, NO_COLOR: '1' }, timeoutMs }))
    if (plain.blocker) {
      const ok = !r.timedOut && r.code !== 0 && r.stderr.includes(`missing value for "${plain.blocker.step.id}"`)
      add('without a terminal it names the missing input', ok ? 'PASS' : 'FAIL', `expected a non-zero exit and "missing value for \\"${plain.blocker.step.id}\\"", got exit ${r.code}${r.timedOut ? ' (timed out)' : ''}\nstderr: ${clip(r.stderr)}`)
    } else {
      add('without a terminal it runs on defaults', !r.timedOut && r.code === 0 ? 'PASS' : 'FAIL', `exit ${r.code}${r.timedOut ? ' (timed out)' : ''}\nstderr: ${clip(r.stderr)}`)
    }

    // 2 and 3. In a terminal: the first question appears and Ctrl+C leaves cleanly; then accept every default.
    const can = await ptyAvailable()
    const interactive = simulateDefaults(prompt, { interactive: true })
    if (!can.ok) { add('interactive run', 'UNVERIFIED', can.reason); continue }
    if (interactive.asked.length === 0) { add('interactive run', 'UNVERIFIED', 'no question applies without answers'); continue }
    const first = interactive.asked[0]
    const cancel = await inFreshDir(cwd => runInPty({ cmd: launch.cmd, args: [...launch.prefix, ...c.path], cwd, env: { NO_COLOR: '1' }, timeout: timeoutMs / 1000, steps: [{ expect: escapeRegExp(first.message), send: KEY.ctrlC }] }))
    add('the first question appears and Ctrl+C exits with 130', cancel.ok ? (cancel.exitCode === 130 && !cancel.error ? 'PASS' : 'FAIL') : 'UNVERIFIED',
      cancel.ok ? `exit ${cancel.exitCode}${cancel.error ? `, ${cancel.error}` : ''}\n${clip(cancel.text)}` : cancel.unavailable)
    if (interactive.blocker) { add('accepting every default', 'UNVERIFIED', interactive.blocker.reason); continue }
    const full = await inFreshDir(cwd => runInPty({
      cmd: launch.cmd, args: [...launch.prefix, ...c.path], cwd, env: { NO_COLOR: '1' }, timeout: timeoutMs / 1000,
      steps: interactive.asked.map(s => ({ expect: escapeRegExp(s.message), send: KEY.enter })),
    }))
    add('accepting every default completes', full.ok ? (full.exitCode === 0 && !full.error ? 'PASS' : 'FAIL') : 'UNVERIFIED',
      full.ok ? `exit ${full.exitCode}${full.error ? `, ${full.error}` : ''}\n${clip(full.text)}` : full.unavailable)
  }
  return steps
}
