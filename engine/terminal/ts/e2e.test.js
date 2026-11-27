// Builds the fixtures with the real toolchain (npm install, tsc) in a temp folder, then checks
// behavior the example checks cannot reach. Skipped, with the reason, when the npm registry
// cannot be reached.
import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readTatemono } from '../common/read.js'
import { buildModel } from '../common/model.js'
import { run } from '../common/run.js'
import { verifyCli } from '../common/verify.js'
import { generateTs } from './generator.js'
import { installAndBuild } from './build.js'
import { checkTsImports } from './checks.js'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-term-e2e-'))
const built = {}
let skipReason = null

async function build(name) {
  const read = await readTatemono(name)
  assert.equal(read.valid, true, read.errors.join('\n'))
  const model = buildModel(read.parsed)
  const out = path.join(tmp, name)
  const result = generateTs(model, out)
  const steps = await installAndBuild(out)
  return { model, out, result, steps }
}

before(async () => {
  for (const name of ['term-todo-cli', 'term-cli-features']) {
    built[name] = await build(name)
    const bad = built[name].steps.find(s => s.status !== 'PASS')
    if (bad && bad.status === 'UNVERIFIED') { skipReason = `${bad.name}: ${bad.detail}`; return }
    assert.equal(bad, undefined, JSON.stringify(bad))
  }
}, { timeout: 600_000 })

const cliOf = name => ({ cmd: process.execPath, prefix: [path.join(built[name].out, 'dist/src/cli.js')] })
const exec = (name, args, opts = {}) => run(process.execPath, [...cliOf(name).prefix, ...args], { env: { ...process.env, NO_COLOR: '1', ...(opts.env ?? {}) }, input: opts.input, timeoutMs: 30_000 })

for (const name of ['term-todo-cli', 'term-cli-features']) {
  test(`${name}: every verification step passes`, async t => {
    if (skipReason) return t.skip(skipReason)
    const steps = await verifyCli(built[name].model, cliOf(name))
    const failed = steps.filter(s => s.status !== 'PASS')
    assert.deepEqual(failed, [], JSON.stringify(failed, null, 2))
    assert.ok(steps.length >= 6)
  })
  test(`${name}: npm test passes`, async t => {
    if (skipReason) return t.skip(skipReason)
    const r = await run(process.execPath, [path.join(path.dirname(process.execPath), '..', 'lib/node_modules/npm/bin/npm-cli.js'), 'test'], { cwd: built[name].out })
    assert.equal(r.code, 0, r.stdout + r.stderr)
  })
  test(`${name}: nothing in the output points at Pluffy`, async t => {
    if (skipReason) return t.skip(skipReason)
    assert.deepEqual(checkTsImports(built[name].out), [])
    const text = fs.readFileSync(path.join(built[name].out, 'dist/src/cli.js'), 'utf8')
    assert.equal(/arkzen|pluffy/i.test(text), false)
  })
}

test('the default command runs when no command is given', async t => {
  if (skipReason) return t.skip(skipReason)
  const r = await exec('term-cli-features', [])
  assert.equal(r.code, 0, r.stderr)
  assert.match(r.stdout, /"ok": true/)
})

test('an alias reaches the command', async t => {
  if (skipReason) return t.skip(skipReason)
  const r = await exec('term-todo-cli', ['ls'])
  assert.equal(r.code, 0, r.stderr)
  assert.match(r.stdout, /open items/)
})

test('a nested command and a help-only group work', async t => {
  if (skipReason) return t.skip(skipReason)
  const nested = await exec('term-todo-cli', ['tag', 'add', '1', 'urgent'])
  assert.equal(nested.code, 0, nested.stderr)
  assert.match(nested.stdout, /tagged 1 with urgent/)
  const group = await exec('term-todo-cli', ['tag'])
  assert.match(group.stdout, /Usage: todo tag/)
  assert.match(group.stdout, /add/)
})

test('a missing required argument is a usage error', async t => {
  if (skipReason) return t.skip(skipReason)
  const r = await exec('term-todo-cli', ['add'])
  assert.notEqual(r.code, 0)
  assert.match(r.stderr, /missing required argument 'title'/)
})

test('standard input reaches the handler', async t => {
  if (skipReason) return t.skip(skipReason)
  const r = await exec('term-cli-features', ['upper'], { input: 'hello there' })
  assert.equal(r.code, 0, r.stderr)
  assert.equal(r.stdout, 'HELLO THERE')
})

test('a flag can come from its environment variable, and a bad value is rejected', async t => {
  if (skipReason) return t.skip(skipReason)
  const ok = await exec('term-cli-features', ['greet'], { env: { GREET_STYLE: 'fancy' } })
  assert.match(ok.stdout, /style: fancy/)
  const flagWins = await exec('term-cli-features', ['greet', '--style', 'plain'], { env: { GREET_STYLE: 'fancy' } })
  assert.match(flagWins.stdout, /style: plain/)
  const bad = await exec('term-cli-features', ['greet'], { env: { GREET_STYLE: 'weird' } })
  assert.notEqual(bad.code, 0)
})

test('boolean flags are real booleans, and a default-on switch can be turned off', async t => {
  if (skipReason) return t.skip(skipReason)
  const on = await exec('term-cli-features', ['greet'])
  assert.match(on.stdout, /color: true/)
  const off = await exec('term-cli-features', ['greet', '--no-color'])
  assert.match(off.stdout, /color: false/)
  const migrate = await exec('term-cli-features', ['db', 'migrate'])
  assert.match(migrate.stdout, /dry=false/)
})

test('repeatable flags collect and typed values are parsed', async t => {
  if (skipReason) return t.skip(skipReason)
  const r = await exec('term-cli-features', ['greet', '--tag', 'x', '--tag', 'y', '-n', '2'])
  assert.match(r.stdout, /tags: x,y/)
  assert.equal(r.stdout.match(/hello, world/g).length, 2)
  const bad = await exec('term-cli-features', ['greet', '-n', 'many'])
  assert.notEqual(bad.code, 0)
  assert.match(bad.stderr, /Expected a whole number/)
})

test('a hidden command is not in the help but still runs', async t => {
  if (skipReason) return t.skip(skipReason)
  const help = await exec('term-cli-features', ['--help'])
  assert.equal(/\bold\b/.test(help.stdout), false, help.stdout)
  assert.match(help.stdout, /greet/)
  const r = await exec('term-cli-features', ['old'])
  assert.equal(r.code, 0)
  assert.match(r.stderr, /deprecated: use status instead/)
})

test('help carries the examples, the exit codes and the stdin note', async t => {
  if (skipReason) return t.skip(skipReason)
  const deploy = await exec('term-cli-features', ['deploy', '--help'])
  assert.match(deploy.stdout, /Exit codes:/)
  assert.match(deploy.stdout, /1 {2}usage error/)
  assert.match(deploy.stdout, /\$ features deploy --env prod/)
  const upper = await exec('term-cli-features', ['upper', '--help'])
  assert.match(upper.stdout, /Reads standard input\./)
})

test('declared output kinds: table by default, JSON with --json', async t => {
  if (skipReason) return t.skip(skipReason)
  const table = await exec('term-cli-features', ['people'])
  assert.match(table.stdout, /^name +age\n/)
  const json = await exec('term-cli-features', ['people', '--json'])
  assert.deepEqual(JSON.parse(json.stdout), [{ name: 'Ada', age: 36 }, { name: 'Grace', age: 45 }])
})

test('an exit code can be returned or set with ctx.exit', async t => {
  if (skipReason) return t.skip(skipReason)
  assert.equal((await exec('term-cli-features', ['fail'])).code, 3)
  assert.equal((await exec('term-cli-features', ['die'])).code, 4)
})

test('a closed pipe is not an error', async t => {
  if (skipReason) return t.skip(skipReason)
  const r = await exec('term-cli-features', ['--help'])
  assert.equal(r.code, 0)
})
