// The verifier must be able to fail. These tests run it against small fake programs that are wrong
// in specific ways.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { verifyCli } from './verify.js'

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
