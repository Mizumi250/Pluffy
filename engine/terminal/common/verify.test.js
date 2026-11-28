// The verifier must be able to fail. These tests run it against small fake programs that are wrong
// in specific ways.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { verifyCli, verifyPrompts, simulateDefaults } from './verify.js'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-term-verify-'))
let n = 0

// A fake program is a script that decides what to print from its arguments.
function fake(body) {
  const file = path.join(tmp, `fake${n++}.js`)
  fs.writeFileSync(file, body)
  return { cmd: process.execPath, prefix: [file] }
}

const model = (examples = []) => ({
  project: { binary: 'demo', version: '1.2.3' },
  commands: [{ name: 'say', path: ['say'], builtin: null, examples }],
})
const ex = (cmd, over = {}) => ({ cmd, expectExit: 0, expectStdout: null, expectStderr: null, ...over })
const statusOf = (steps, name) => steps.find(s => s.name === name)?.status

const GOOD = `
const a = process.argv.slice(2)
if (a.includes('--version')) console.log('1.2.3')
else if (a.includes('--help')) console.log('Usage: demo [options]')
else if (a[0] === 'say') console.log('said ' + a.slice(1).join(' '))
`

test('a correct program passes every step', async () => {
  const steps = await verifyCli(model([ex('say hi', { expectStdout: 'said hi' })]), fake(GOOD))
  assert.deepEqual(steps.filter(s => s.status !== 'PASS'), [])
  assert.ok(steps.some(s => s.name === 'example: demo say hi'))
})

test('a wrong version fails --version', async () => {
  const steps = await verifyCli(model(), fake(GOOD.replace("'1.2.3'", "'9.9.9'")))
  assert.equal(statusOf(steps, '--version'), 'FAIL')
})

test('help that does not name the program fails --help', async () => {
  const steps = await verifyCli(model(), fake(GOOD.replace('Usage: demo', 'Usage: other')))
  assert.equal(statusOf(steps, '--help'), 'FAIL')
})

test('a wrong exit code fails the example', async () => {
  const steps = await verifyCli(model([ex('say hi', { expectExit: 2 })]), fake(GOOD))
  assert.equal(statusOf(steps, 'example: demo say hi'), 'FAIL')
})

test('missing stdout text fails the example, a regular expression can pass it', async () => {
  const bad = await verifyCli(model([ex('say hi', { expectStdout: 'goodbye' })]), fake(GOOD))
  assert.equal(statusOf(bad, 'example: demo say hi'), 'FAIL')
  const good = await verifyCli(model([ex('say hi', { expectStdout: '/said h./' })]), fake(GOOD))
  assert.equal(statusOf(good, 'example: demo say hi'), 'PASS')
})

test('expect_stderr is checked', async () => {
  const bad = await verifyCli(model([ex('say hi', { expectStderr: 'warning' })]), fake(GOOD))
  assert.equal(statusOf(bad, 'example: demo say hi'), 'FAIL')
  const good = await verifyCli(model([ex('say hi', { expectStderr: 'warning' })]), fake(GOOD + "\nconsole.error('a warning')"))
  assert.equal(statusOf(good, 'example: demo say hi'), 'PASS')
})

test('colored output fails the non-interactive check', async () => {
  const steps = await verifyCli(model(), fake(GOOD.replace("'Usage: demo [options]'", "'\\u001b[31mUsage: demo\\u001b[0m'")))
  assert.equal(statusOf(steps, 'non-interactive run (no TTY, NO_COLOR, TERM=dumb)'), 'FAIL')
})

test('a program that crashes fails instead of being skipped', async () => {
  const steps = await verifyCli(model([ex('say hi')]), fake('throw new Error("boom")'))
  assert.ok(steps.every(s => s.status === 'FAIL'), JSON.stringify(steps.map(s => [s.name, s.status])))
})

test('a program that hangs is stopped and reported', async () => {
  const steps = await verifyCli(model([ex('say hi')]), fake("setTimeout(() => {}, 60000)"), { timeoutMs: 1500 })
  assert.equal(statusOf(steps, 'example: demo say hi'), 'FAIL')
}, { timeout: 30_000 })

test('an example with an unterminated quote is reported, not thrown', async () => {
  const steps = await verifyCli(model([ex('say "oops')]), fake(GOOD))
  assert.equal(statusOf(steps, 'example: demo say "oops'), 'FAIL')
})

// ── prompts ──────────────────────────────────────────────

const step = (id, over = {}) => ({ id, type: 'text', message: `Q ${id}`, required: false, default: undefined, choices: null, validate: null, when: null, ...over })
const prompt = steps => ({ name: 'p', result: 'answers', steps, fallback: {} })

test('simulateDefaults follows "when" with the default answers', () => {
  const p = prompt([
    step('color', { type: 'select', choices: ['red', 'blue'], default: 'blue' }),
    step('why', { when: { color: 'red' }, required: true }),
    step('shade', { when: { color: 'blue' }, default: 'navy' }),
  ])
  const r = simulateDefaults(p, { interactive: true })
  assert.deepEqual(r.asked.map(s => s.id), ['color', 'shade'])
  assert.equal(r.blocker, null)
})

test('simulateDefaults names the first question that needs a typed answer', () => {
  const p = prompt([step('a', { default: 'x' }), step('b', { required: true }), step('c', { required: true })])
  const r = simulateDefaults(p, { interactive: true })
  assert.equal(r.blocker.step.id, 'b')
  assert.match(r.blocker.reason, /"b" has no default/)
})

test('simulateDefaults treats an editor as unanswerable and a select as answerable', () => {
  assert.match(simulateDefaults(prompt([step('n', { type: 'editor' })]), { interactive: true }).blocker.reason, /opens an editor/)
  assert.equal(simulateDefaults(prompt([step('s', { type: 'select', choices: ['a', 'b'], required: true })]), { interactive: true }).blocker, null)
  assert.equal(simulateDefaults(prompt([step('s', { type: 'select', choices: ['a', 'b'], required: true })]), { interactive: false }).blocker.step.id, 's')
})

const promptModel = steps => ({
  project: { binary: 'demo', version: '1.0.0' },
  prompts: [prompt(steps)],
  commands: [{ name: 'ask', path: ['ask'], builtin: null, prompt: 'p', args: [], flags: [], examples: [] }],
})
const statusFor = (steps, part) => steps.find(s => s.name.includes(part))?.status

test('a program that ignores missing input fails the prompt check', async () => {
  const model = promptModel([step('name', { required: true })])
  const steps = await verifyPrompts(model, fake("console.log('done')"), { timeoutMs: 3000 })
  assert.equal(statusFor(steps, 'names the missing input'), 'FAIL')
  assert.equal(statusFor(steps, 'Ctrl+C'), 'FAIL', 'it never showed the question')
})

test('a program that names the missing input and shows the question passes', async () => {
  const model = promptModel([step('name', { required: true })])
  const good = `
    if (!process.stdin.isTTY) { console.error('error: missing value for "name": pass --name'); process.exit(1) }
    process.on('SIGINT', () => process.exit(130))
    console.log('Q name'); setInterval(() => {}, 1000)`
  const steps = await verifyPrompts(model, fake(good), { timeoutMs: 5000 })
  assert.equal(statusFor(steps, 'names the missing input'), 'PASS')
  assert.equal(statusFor(steps, 'Ctrl+C'), 'PASS')
  assert.equal(statusFor(steps, 'accepting every default'), 'UNVERIFIED')
})

test('a prompt program that dies on Ctrl+C with the wrong code fails', async () => {
  const model = promptModel([step('name', { required: true })])
  const bad = `
    if (!process.stdin.isTTY) { console.error('missing value for "name"'); process.exit(1) }
    process.on('SIGINT', () => process.exit(1))
    console.log('Q name'); setInterval(() => {}, 1000)`
  const steps = await verifyPrompts(model, fake(bad), { timeoutMs: 5000 })
  assert.equal(statusFor(steps, 'Ctrl+C'), 'FAIL')
})

test('all-default prompts must run without a terminal and complete in one', async () => {
  const model = promptModel([step('a', { default: 'x' })])
  const ok = `
    if (process.stdin.isTTY) { console.log('Q a'); process.stdin.once('data', () => { console.log('done'); process.exit(0) }); process.stdin.setRawMode(true); process.on('SIGINT', () => process.exit(130)) }
    else console.log('done')`
  const steps = await verifyPrompts(model, fake(ok), { timeoutMs: 5000 })
  assert.equal(statusFor(steps, 'runs on defaults'), 'PASS')
  assert.equal(statusFor(steps, 'accepting every default'), 'PASS')
})

test('a command with required arguments is reported UNVERIFIED, not failed', async () => {
  const model = promptModel([step('a', { default: 'x' })])
  model.commands[0].args = [{ required: true }]
  const steps = await verifyPrompts(model, fake('process.exit(0)'), { timeoutMs: 3000 })
  assert.deepEqual(steps.map(s => s.status), ['UNVERIFIED'])
})
