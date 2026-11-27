// Runs a built command line program the way a user would and reports what happened.
// `launch` is { cmd, prefix }: the program is started as `cmd ...prefix ...args`.
import { run } from './run.js'
import { splitArgs, matchesExpectation } from './shell.js'

const clip = text => { const t = text.trim(); return t.length > 400 ? t.slice(0, 400) + ' ...' : t }
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]/

function launcher(launch, env, timeoutMs) {
  return args => run(launch.cmd, [...launch.prefix, ...args], { env: { ...process.env, NO_COLOR: '1', ...env }, timeoutMs })
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
