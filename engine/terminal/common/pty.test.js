import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { runInPty, ptyAvailable, KEY } from './pty.js'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-term-pty-'))
let n = 0
const script = body => { const f = path.join(tmp, `s${n++}.js`); fs.writeFileSync(f, body); return f }

async function needPty(t) {
  const can = await ptyAvailable()
  if (!can.ok) { t.skip(can.reason); return false }
  return true
}

test('the program sees a real terminal of the requested size', async t => {
  if (!await needPty(t)) return
  const file = script("console.log(JSON.stringify({ tty: [process.stdin.isTTY, process.stdout.isTTY], size: [process.stdout.columns, process.stdout.rows] }))")
  const r = await runInPty({ cmd: process.execPath, args: [file], cols: 100, rows: 30 })
  assert.equal(r.ok, true)
  assert.equal(r.exitCode, 0)
  assert.deepEqual(JSON.parse(r.text.trim()), { tty: [true, true], size: [100, 30] })
})

test('it answers a question typed in two steps and reports the exit code', async t => {
  if (!await needPty(t)) return
  const file = script(`
    const rl = require('node:readline').createInterface({ input: process.stdin, output: process.stdout })
    rl.question('Name? ', name => rl.question('Age? ', age => { console.log('hello ' + name + ' ' + age); rl.close(); process.exit(7) }))`)
  const r = await runInPty({ cmd: process.execPath, args: [file], steps: [{ expect: 'Name\\?', send: 'ada\r' }, { expect: 'Age\\?', send: '36\r' }] })
  assert.equal(r.ok, true)
  assert.equal(r.error, null)
  assert.match(r.text, /hello ada 36/)
  assert.equal(r.exitCode, 7)
  assert.deepEqual(r.matched, ['Name\\?', 'Age\\?'])
})

test('Ctrl+C reaches the program', async t => {
  if (!await needPty(t)) return
  const file = script("process.on('SIGINT', () => { console.log('got sigint'); process.exit(130) }); console.log('ready'); setInterval(() => {}, 1000)")
  const r = await runInPty({ cmd: process.execPath, args: [file], steps: [{ expect: 'ready', send: KEY.ctrlC }] })
  assert.match(r.text, /got sigint/)
  assert.equal(r.exitCode, 130)
})

test('escape codes are removed before matching, and the raw output keeps them', async t => {
  if (!await needPty(t)) return
  const file = script("process.stdout.write('\\u001b[31mred\\u001b[0m text\\n')")
  const r = await runInPty({ cmd: process.execPath, args: [file], steps: [{ expect: 'red text' }] })
  assert.equal(r.error, null)
  assert.ok(r.output.includes('\u001b[31m'))
  assert.equal(r.text.includes('\u001b'), false)
})

test('a step that never matches is reported, and the program is stopped', async t => {
  if (!await needPty(t)) return
  const file = script("console.log('only this'); setInterval(() => {}, 1000)")
  const r = await runInPty({ cmd: process.execPath, args: [file], steps: [{ expect: 'never appears', timeout: 1 }] })
  assert.match(r.error, /timed out waiting for: never appears/)
  assert.equal(r.exitCode, null)
})

test('a program that exits early is reported, with its output', async t => {
  if (!await needPty(t)) return
  const file = script("console.log('bye'); process.exit(3)")
  const r = await runInPty({ cmd: process.execPath, args: [file], steps: [{ expect: 'hello', timeout: 5 }] })
  assert.match(r.error, /exited while waiting for: hello/)
  assert.equal(r.exitCode, 3)
  assert.match(r.text, /bye/)
})

test('the environment and working folder are passed through', async t => {
  if (!await needPty(t)) return
  const file = script("console.log(process.env.PTY_TEST + ' ' + process.cwd())")
  const r = await runInPty({ cmd: process.execPath, args: [file], cwd: tmp, env: { PTY_TEST: 'yes' } })
  assert.match(r.text, new RegExp(`yes ${tmp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
})
