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
import { runInPty, ptyAvailable, KEY } from '../common/pty.js'
import { verifyCli, verifyPrompts } from '../common/verify.js'
import { generateTs } from './generator.js'
import { installAndBuild } from './build.js'
import { checkTsImports } from './checks.js'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-term-e2e-'))
const built = {}
let skipReason = null

async function build(name) {
  const read = await readTatemono(name)
  assert.equal(read.valid, true, read.errors.join('\n'))
  const model = buildModel(read.parsed, { sourceDir: path.dirname(read.file) })
  const out = path.join(tmp, 'out', path.basename(name))
  const result = generateTs(model, out)
  const steps = await installAndBuild(out)
  return { model, out, result, steps }
}

before(async () => {
  // a throwaway project: embedded assets (one text template, one binary file), no validation on the name
  const embed = path.join(tmp, 'src-embed')
  fs.mkdirSync(path.join(embed, 'assets/templates'), { recursive: true })
  fs.writeFileSync(path.join(embed, 'assets/templates/a.txt'), 'hello {{name}} {{other}}')
  fs.writeFileSync(path.join(embed, 'assets/templates/bin.dat'), Buffer.from([0, 255, 1, 2, 0, 128]))
  fs.writeFileSync(path.join(embed, 'core.tsx'), [
    '/* @arkzen:meta\nname: embed-demo\nversion: 1.0.0\ndescription: x\nauth: false\n*/',
    '/* @arkzen:term:project\nname: embed-demo\nbinary: embed-demo\nmode: cli\nruntimes: [ts]\n*/',
    '/* @arkzen:term:prompt:p\nsteps:\n  - id: name\n    type: text\n    message: Name\n    required: true\nfallback:\n  name:\n    flag: --name\n*/',
    '/* @arkzen:term:command:make\ndescription: make files\nprompt: p\n*/',
    '/* @arkzen:term:assets\nembed: true\ntemplates:\n  - source: templates/a.txt\n    target: "{{name}}.txt"\n    variables: [name]\n  - source: templates/bin.dat\n    target: "{{name}}.dat"\n    variables: [name]\n*/',
  ].join('\n\n') + '\n')
  for (const name of ['term-todo-cli', 'term-cli-features', 'term-cli-prompts', 'term-create-site', embed]) {
    built[path.basename(name)] = await build(name)
    const key = path.basename(name)
    const bad = built[key].steps.find(s => s.status !== 'PASS')
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

// ── prompts and scaffolders ──────────────────────────────

const ptyOf = (name, args, steps, opts = {}) => {
  const cwd = opts.cwd ?? fs.mkdtempSync(path.join(tmp, 'cwd-'))
  return runInPty({ cmd: process.execPath, args: [...cliOf(name).prefix, ...args], cwd, env: { NO_COLOR: '1', ...(opts.env ?? {}) }, timeout: opts.timeout ?? 40, steps })
    .then(r => ({ ...r, cwd }))
}
async function needPty(t) {
  if (skipReason) { t.skip(skipReason); return false }
  const can = await ptyAvailable()
  if (!can.ok) { t.skip(can.reason); return false }
  return true
}
const lastJson = text => JSON.parse(text.slice(text.indexOf('{\n')))

test('prompt commands pass their automatic checks', async t => {
  if (skipReason) return t.skip(skipReason)
  for (const name of ['term-cli-prompts', 'term-create-site']) {
    const steps = await verifyPrompts(built[name].model, cliOf(name))
    assert.deepEqual(steps.filter(s => s.status === 'FAIL'), [], JSON.stringify(steps, null, 2))
    assert.ok(steps.some(s => /names the missing input/.test(s.name) && s.status === 'PASS'))
  }
})

test('survey: every question type works in a terminal', async t => {
  if (!await needPty(t)) return
  const r = await ptyOf('term-cli-prompts', ['survey'], [
    { expect: 'Your name', send: 'ada\r' },
    { expect: 'A secret word', send: 'hunter2\r' },
    { expect: 'Your age', send: KEY.enter },
    { expect: 'Do you agree', send: KEY.enter },
    { expect: 'Pick a color', send: KEY.down + KEY.enter },
    { expect: 'Pick tags', send: KEY.space + KEY.down + KEY.space + KEY.enter },
    { expect: 'Where to look', send: KEY.enter },
    { expect: 'Pick a language', send: 'p' },
    // the list shows py before the filter has been applied, so give the filter a moment
    { expect: 'py', delay: 0.7, send: KEY.enter },
  ])
  assert.equal(r.error, null)
  assert.equal(r.exitCode, 0)
  assert.deepEqual(lastJson(r.text), { name: 'ada', secret: '***', age: 30, ok: true, color: 'blue', tags: ['a', 'b'], where: '.', lang: 'py' })
  assert.equal(r.text.includes('hunter2'), false, 'the password must not be echoed')
})

test('survey: a "when" question appears only when its condition holds', async t => {
  if (!await needPty(t)) return
  const r = await ptyOf('term-cli-prompts', ['survey'], [
    { expect: 'Your name', send: 'ada\r' },
    { expect: 'A secret word', send: KEY.enter },
    { expect: 'Your age', send: KEY.enter },
    { expect: 'Do you agree', send: KEY.enter },
    { expect: 'Pick a color', send: KEY.up + KEY.enter },
    { expect: 'Why red', send: 'too bright\r' },
    { expect: 'Pick tags', send: KEY.enter },
    { expect: 'Where to look', send: KEY.enter },
    { expect: 'Pick a language', send: KEY.enter },
  ])
  assert.equal(r.error, null, r.text)
  const out = lastJson(r.text)
  assert.equal(out.color, 'red')
  assert.equal(out.extra, 'too bright')
  assert.equal('notes' in out, false)
})

test('survey: an invalid answer is refused with the reason, and the person can fix it', async t => {
  if (!await needPty(t)) return
  const r = await ptyOf('term-cli-prompts', ['survey'], [
    { expect: 'Your name', send: 'BAD\r' },
    { expect: 'does not match \\^\\[a-z\\]\\+\\$', send: KEY.backspace.repeat(3) + 'ada\r' },
    { expect: 'A secret word', send: KEY.enter },
    { expect: 'Your age', send: '200\r' },
    { expect: 'must be at most 120', send: KEY.backspace.repeat(3) + '40\r' },
    { expect: 'Do you agree', send: KEY.enter },
    { expect: 'Pick a color', send: KEY.enter },
    { expect: 'Pick tags', send: KEY.enter },
    { expect: 'Where to look', send: KEY.enter },
    { expect: 'Pick a language', send: KEY.enter },
  ])
  assert.equal(r.error, null, r.text)
  const out = lastJson(r.text)
  assert.equal(out.name, 'ada')
  assert.equal(out.age, 40)
})

test('survey: answering no opens the notes editor', async t => {
  if (!await needPty(t)) return
  const r = await ptyOf('term-cli-prompts', ['survey', '--name', 'ada'], [
    { expect: 'A secret word', send: KEY.enter },
    { expect: 'Your age', send: KEY.enter },
    { expect: 'Do you agree', send: 'n\r' },
    { expect: 'Pick a color', send: KEY.enter },
    { expect: 'Pick tags', send: KEY.enter },
    { expect: 'Where to look', send: KEY.enter },
    { expect: 'Pick a language', send: KEY.enter },
    { expect: 'Notes', send: KEY.enter },
  ], { env: { EDITOR: 'true', VISUAL: 'true' } })
  assert.equal(r.error, null, r.text)
  assert.equal(lastJson(r.text).ok, false)
  assert.equal(/Your name/.test(r.text), false, 'a value given on the command line is not asked again')
})

test('survey: Ctrl+C part way through exits with 130 and prints nothing more', async t => {
  if (!await needPty(t)) return
  const r = await ptyOf('term-cli-prompts', ['survey'], [
    { expect: 'Your name', send: 'ada\r' },
    { expect: 'A secret word', send: KEY.ctrlC },
  ])
  assert.equal(r.exitCode, 130)
  assert.equal(/"name"/.test(r.text), false)
})

test('survey: --no-input never asks, even in a terminal', async t => {
  if (!await needPty(t)) return
  const r = await ptyOf('term-cli-prompts', ['survey', '--name', 'ada', '--no-input'], [])
  assert.equal(r.exitCode, 0, r.text)
  assert.equal(/Your age/.test(r.text), false)
  assert.equal(lastJson(r.text).age, 30)
  const missing = await ptyOf('term-cli-prompts', ['survey', '--no-input'], [])
  assert.equal(missing.exitCode, 1)
  assert.match(missing.text, /missing value for "name": pass --name or set SURVEY_NAME/)
})

test('survey: an environment variable supplies a value without a flag', async t => {
  if (skipReason) return t.skip(skipReason)
  const r = await exec('term-cli-prompts', ['survey'], { env: { SURVEY_NAME: 'grace', SURVEY_SECRET: 'x' } })
  assert.equal(r.code, 0, r.stderr)
  const out = JSON.parse(r.stdout)
  assert.equal(out.name, 'grace')
  assert.equal(out.secret, '***')
})

test('scaffolder: answering in a terminal writes the files with the answers filled in', async t => {
  if (!await needPty(t)) return
  const r = await ptyOf('term-create-site', ['create'], [
    { expect: 'Project name', send: 'my-site\r' },
    { expect: 'Pick a style', send: KEY.down + KEY.enter },
    { expect: 'Page title', send: 'My Site\r' },
  ])
  assert.equal(r.error, null, r.text)
  assert.equal(r.exitCode, 0)
  assert.match(r.text, /created my-site\/index\.html/)
  const html = fs.readFileSync(path.join(r.cwd, 'my-site/index.html'), 'utf8')
  assert.match(html, /data-style="dark"/)
  assert.match(html, /<title>My Site<\/title>/)
  assert.match(html, /<h1>my-site<\/h1>/)
})

test('scaffolder: a skipped question leaves its placeholder empty', async t => {
  if (!await needPty(t)) return
  const r = await ptyOf('term-create-site', ['create'], [
    { expect: 'Project name', send: 'plain-one\r' },
    { expect: 'Pick a style', send: KEY.enter },
  ])
  assert.equal(r.error, null, r.text)
  assert.equal(/Page title/.test(r.text), false)
  assert.match(fs.readFileSync(path.join(r.cwd, 'plain-one/index.html'), 'utf8'), /<title><\/title>/)
})

test('scaffolder: it will not overwrite without --force', async t => {
  if (skipReason) return t.skip(skipReason)
  const cwd = fs.mkdtempSync(path.join(tmp, 'cwd-'))
  const run1 = await run(process.execPath, [...cliOf('term-create-site').prefix, 'create', '--name', 'twice'], { cwd })
  assert.equal(run1.code, 0, run1.stderr)
  fs.writeFileSync(path.join(cwd, 'twice/index.html'), 'edited by hand')
  const run2 = await run(process.execPath, [...cliOf('term-create-site').prefix, 'create', '--name', 'twice'], { cwd })
  assert.equal(run2.code, 1)
  assert.match(run2.stderr, /already exists: twice\/index\.html \(use --force to overwrite\)/)
  assert.equal(fs.readFileSync(path.join(cwd, 'twice/index.html'), 'utf8'), 'edited by hand')
  const run3 = await run(process.execPath, [...cliOf('term-create-site').prefix, 'create', '--name', 'twice', '--force'], { cwd })
  assert.equal(run3.code, 0, run3.stderr)
  assert.match(fs.readFileSync(path.join(cwd, 'twice/index.html'), 'utf8'), /<h1>twice<\/h1>/)
})

test('embedded assets: text templates are filled in, other braces stay, binary files are copied byte for byte', async t => {
  if (skipReason) return t.skip(skipReason)
  const cwd = fs.mkdtempSync(path.join(tmp, 'cwd-'))
  const r = await run(process.execPath, [...cliOf('src-embed').prefix, 'make', '--name', 'demo'], { cwd })
  assert.equal(r.code, 0, r.stderr)
  assert.equal(fs.readFileSync(path.join(cwd, 'demo.txt'), 'utf8'), 'hello demo {{other}}')
  assert.deepEqual([...fs.readFileSync(path.join(cwd, 'demo.dat'))], [0, 255, 1, 2, 0, 128])
  assert.equal(fs.existsSync(path.join(built['src-embed'].out, 'assets')), false, 'nothing is shipped beside the code')
})

test('a template can never write outside the current folder', async t => {
  if (skipReason) return t.skip(skipReason)
  const cwd = fs.mkdtempSync(path.join(tmp, 'cwd-'))
  fs.mkdirSync(path.join(cwd, 'inner'))
  const r = await run(process.execPath, [...cliOf('src-embed').prefix, 'make', '--name', '../escaped'], { cwd: path.join(cwd, 'inner') })
  assert.equal(r.code, 1)
  assert.match(r.stderr, /outside the current folder/)
  assert.equal(fs.existsSync(path.join(cwd, 'escaped.txt')), false)
})
