import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readTatemono } from '../common/read.js'
import { buildModel } from '../common/model.js'
import { generateTs, checkSupported, GenerateError } from './generator.js'
import { checkTsImports, importSpecifiers } from './checks.js'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-term-gen-'))
let n = 0
const dir = () => path.join(tmp, `p${n++}`)

async function modelOf(name) {
  const read = await readTatemono(name)
  assert.equal(read.valid, true, read.errors.join('\n'))
  return buildModel(read.parsed, { sourceDir: path.dirname(read.file) })
}

// Writes a throwaway tatemono and returns its model.
async function modelFromSource(source, existing) {
  const d = existing ?? dir()
  fs.mkdirSync(d, { recursive: true })
  fs.writeFileSync(path.join(d, 'core.tsx'), source)
  const read = await readTatemono(d)
  assert.equal(read.valid, true, read.errors.join('\n'))
  return buildModel(read.parsed, { sourceDir: d })
}

const META = '/* @arkzen:meta\nname: t\nversion: 1.0.0\ndescription: t\nauth: false\n*/\n'
const HANDLER = '/* @arkzen:term:handler:ts:run */\nexport default function run() {}\n/* @arkzen:term:handler:ts:run:end */\n'
const CMD = '/* @arkzen:term:command:run\ndescription: Run\n*/\n'

test('generates the expected files for the todo fixture', async () => {
  const model = await modelOf('term-todo-cli')
  const out = dir()
  const result = generateTs(model, out)
  for (const f of ['package.json', 'tsconfig.json', '.gitignore', 'README.md', 'src/cli.ts', 'src/runtime.ts', 'src/commands/add.ts', 'src/commands/list.ts', 'src/commands/tag.add.ts', 'src/scripts/format.ts', 'tests/add.test.ts', 'tests/examples.test.ts']) {
    assert.ok(result.files.includes(f), `missing ${f}`)
    assert.ok(fs.existsSync(path.join(out, f)), `not written: ${f}`)
  }
  assert.match(fs.readFileSync(path.join(out, 'src/commands/add.ts'), 'utf8'), /export default async function add/)
})

test('package.json carries the project identity and a safe engines floor', async () => {
  const model = await modelOf('term-todo-cli')
  const out = dir()
  const result = generateTs(model, out)
  const pkg = JSON.parse(fs.readFileSync(path.join(out, 'package.json'), 'utf8'))
  assert.equal(pkg.name, 'todo')
  assert.equal(pkg.version, '1.0.0')
  assert.equal(pkg.license, 'MIT')
  assert.equal(pkg.type, 'module')
  assert.deepEqual(pkg.bin, { todo: 'dist/src/cli.js' })
  assert.equal(pkg.dependencies.commander, '15.1.0')
  assert.equal(pkg.engines.node, '>=22.12.0')
  assert.match(pkg.scripts.test, /node --test "dist\/tests\/\*\*\/\*\.test\.js"/)
  assert.ok(result.warnings.some(w => /min_version 20 is below/.test(w)), result.warnings.join('\n'))
})

test('cli.ts wires flags, defaults, aliases and the default command', async () => {
  const model = await modelOf('term-cli-features')
  const out = dir()
  generateTs(model, out)
  const cli = fs.readFileSync(path.join(out, 'src/cli.ts'), 'utf8')
  assert.ok(cli.startsWith('#!/usr/bin/env node'))
  assert.match(cli, /\.command\("status", \{ isDefault: true \}\)/)
  assert.match(cli, /\.command\("old", \{ hidden: true \}\)/)
  assert.match(cli, /\.alias\("m"\)/)
  assert.match(cli, /new Option\("--no-color", "Turn off --color"\)/)
  assert.match(cli, /new Option\("--dry-run", ""\)\.default\(false\)/)
  assert.match(cli, /\.env\("GREET_STYLE"\)/)
  assert.match(cli, /\.makeOptionMandatory\(\)/)
  assert.match(cli, /collect\(parseInteger\)/)
  assert.match(cli, /new Option\('--json'/)
  assert.match(cli, /import handler\d+ from '\.\/commands\/db\.seed\.run\.js'/)
})

test('examples become generated tests with pre-split arguments', async () => {
  const model = await modelOf('term-todo-cli')
  const out = dir()
  generateTs(model, out)
  const text = fs.readFileSync(path.join(out, 'tests/examples.test.ts'), 'utf8')
  assert.match(text, /"args": \[\s*"add",\s*"buy milk"\s*\]/)
  assert.match(text, /const binary = "todo"/)
  assert.match(text, /const version = "1\.0\.0"/)
})

test('a generated project passes its own import check', async () => {
  const model = await modelOf('term-cli-features')
  const out = dir()
  generateTs(model, out)
  assert.deepEqual(checkTsImports(out), [])
})

test('regenerating keeps node_modules and drops stale files', async () => {
  const model = await modelOf('term-todo-cli')
  const out = dir()
  generateTs(model, out)
  fs.mkdirSync(path.join(out, 'node_modules/x'), { recursive: true })
  fs.writeFileSync(path.join(out, 'src/stale.ts'), 'x')
  generateTs(model, out)
  assert.ok(fs.existsSync(path.join(out, 'node_modules/x')))
  assert.equal(fs.existsSync(path.join(out, 'src/stale.ts')), false)
})

test('refuses a tui project instead of generating half a program', async () => {
  const model = await modelOf('term-shelf')
  assert.throws(() => generateTs(model, dir()), err => err instanceof GenerateError && /terminal UI generator, which is not built yet/.test(err.message))
})

test('reports completion and unbuilt blocks as warnings, and leaves the command out', async () => {
  const model = await modelFromSource(META + '/* @arkzen:term:project\nname: t\nbinary: t\nmode: cli\nruntimes: [ts]\n*/\n' + CMD + HANDLER +
    '/* @arkzen:term:command:completion\nbuiltin: completion\n*/\n/* @arkzen:term:config\nfile: t.json\n*/\n')
  const out = dir()
  const result = generateTs(model, out)
  assert.ok(result.warnings.some(w => /builtin: completion/.test(w)))
  assert.ok(result.warnings.some(w => /term:config/.test(w)))
  assert.equal(/"completion"/.test(fs.readFileSync(path.join(out, 'src/cli.ts'), 'utf8')), false)
})

test('a non-commander ts framework is refused', async () => {
  const model = await modelFromSource(META + '/* @arkzen:term:project\nname: t\nbinary: t\nmode: cli\nruntimes: [ts]\n*/\n/* @arkzen:term:runtime:ts\nframework: yargs\n*/\n' + CMD + HANDLER)
  assert.throws(() => generateTs(model, dir()), /framework "yargs" is not supported/)
})

test('a user dependency list is merged and a different commander pin is flagged', async () => {
  const model = await modelFromSource(META + '/* @arkzen:term:project\nname: t\nbinary: t\nmode: cli\nruntimes: [ts]\n*/\n/* @arkzen:term:runtime:ts\ndependencies:\n  chalk: 5.4.1\n  commander: 14.0.0\ndev_dependencies: [vitest]\n*/\n' + CMD + HANDLER)
  const out = dir()
  const result = generateTs(model, out)
  const pkg = JSON.parse(fs.readFileSync(path.join(out, 'package.json'), 'utf8'))
  assert.equal(pkg.dependencies.chalk, '5.4.1')
  assert.equal(pkg.devDependencies.vitest, '*')
  assert.ok(result.warnings.some(w => /pins commander to 14\.0\.0/.test(w)))
})

// ── the import check itself ──────────────────────────────

test('importSpecifiers finds every import form', () => {
  const found = importSpecifiers("import a from 'x'\nimport 'y'\nconst z = await import('w')\nconst r = require('v')\nexport { q } from './q.js'")
  assert.deepEqual(found.sort(), ['./q.js', 'v', 'w', 'x', 'y'])
})

test('the import check catches Pluffy, undeclared packages and missing files', () => {
  const out = dir()
  fs.mkdirSync(path.join(out, 'src'), { recursive: true })
  fs.writeFileSync(path.join(out, 'package.json'), JSON.stringify({ dependencies: { commander: '15.1.0' } }))
  fs.writeFileSync(path.join(out, 'src/a.ts'), [
    "import { Command } from 'commander'", "import fs from 'node:fs'", "import test from 'node:test'", "import path from 'path'",
    "import x from '@arkzen/core'", "import y from 'pluffy-utils'", "import z from 'lodash'", "import q from './missing.js'",
  ].join('\n'))
  const problems = checkTsImports(out)
  assert.equal(problems.length, 4, problems.join('\n'))
  assert.ok(problems.some(p => /@arkzen\/core.*Pluffy/.test(p)))
  assert.ok(problems.some(p => /pluffy-utils.*Pluffy/.test(p)))
  assert.ok(problems.some(p => /lodash.*does not declare/.test(p)))
  assert.ok(problems.some(p => /missing\.js.*does not exist/.test(p)))
})

// ── prompts, scaffolders and assets ──────────────────────

test('a prompt command gets the prompt runtime, its definitions and the inquirer dependency', async () => {
  const model = await modelOf('term-cli-prompts')
  const out = dir()
  generateTs(model, out)
  for (const f of ['src/prompts.ts', 'src/prompt-defs.ts']) assert.ok(fs.existsSync(path.join(out, f)), f)
  assert.equal(fs.existsSync(path.join(out, 'src/scaffold.ts')), false, 'no templates, so no scaffold module')
  assert.equal(fs.existsSync(path.join(out, 'src/assets.ts')), false)
  const pkg = JSON.parse(fs.readFileSync(path.join(out, 'package.json'), 'utf8'))
  assert.equal(pkg.dependencies['@inquirer/prompts'], '8.8.1')
  assert.equal(pkg.engines.node, '>=22.13.0')
  const defs = fs.readFileSync(path.join(out, 'src/prompt-defs.ts'), 'utf8')
  assert.match(defs, /"result": "profile"/)
  assert.match(defs, /"when": \{\s*"color": "red"\s*\}/)
})

test('a project with no prompts does not depend on inquirer', async () => {
  const out = dir()
  generateTs(await modelOf('term-cli-features'), out)
  const pkg = JSON.parse(fs.readFileSync(path.join(out, 'package.json'), 'utf8'))
  assert.equal(pkg.dependencies['@inquirer/prompts'], undefined)
  assert.equal(pkg.engines.node, '>=22.12.0')
  assert.equal(fs.existsSync(path.join(out, 'src/prompts.ts')), false)
})

test('the fallback flags, --no-input and the prompt wrapper are wired into cli.ts', async () => {
  const out = dir()
  generateTs(await modelOf('term-cli-prompts'), out)
  const cli = fs.readFileSync(path.join(out, 'src/cli.ts'), 'utf8')
  assert.match(cli, /new Option\("--name <name>", "Your name"\)\.env\("SURVEY_NAME"\)/)
  assert.match(cli, /new Option\("--age <age>", "Your age"\)\.argParser\(parseNumber\)/)
  assert.match(cli, /new Option\("--color <color>", "Pick a color"\)\.choices\(\["red","green","blue"\]\)/)
  assert.match(cli, /new Option\("--tags <tags>", "Pick tags"\)\.argParser\(collectList\)/)
  assert.match(cli, /new Option\("--ok", "Do you agree"\)/)
  assert.match(cli, /new Option\("--no-ok"/)
  assert.match(cli, /new Option\('--no-input'/)
  assert.match(cli, /withPrompt\(prompts\["survey"\], handler0\)/)
  assert.equal(/SURVEY_SECRET/.test(cli), false, 'an env-only fallback is read at run time, not a flag')
})

test('a prompt command with templates and no handler becomes a scaffolder, with its assets copied', async () => {
  const model = await modelOf('term-create-site')
  const out = dir()
  const result = generateTs(model, out)
  for (const f of ['src/scaffold.ts', 'src/assets.ts', 'assets/templates/index.html']) assert.ok(fs.existsSync(path.join(out, f)), f)
  assert.ok(result.files.includes('assets/templates/index.html'))
  assert.equal(fs.existsSync(path.join(out, 'src/commands')), false, 'there is no handler to write')
  const cli = fs.readFileSync(path.join(out, 'src/cli.ts'), 'utf8')
  assert.match(cli, /withPrompt\(prompts\["site"\], scaffoldHandler\(prompts\["site"\]\.result, \[/)
  assert.match(cli, /"target":"\{\{name\}\}\/index\.html"/)
  assert.match(cli, /new Option\('--force'/)
  const pkg = JSON.parse(fs.readFileSync(path.join(out, 'package.json'), 'utf8'))
  assert.deepEqual(pkg.files, ['dist/src', 'assets'])
  assert.equal(fs.readFileSync(path.join(out, 'assets/templates/index.html'), 'utf8').includes('{{name}}'), true, 'the template is copied untouched')
})

test('embedded assets live inside the code and are not copied', async () => {
  const d = dir()
  fs.mkdirSync(path.join(d, 'assets/templates'), { recursive: true })
  fs.writeFileSync(path.join(d, 'assets/templates/a.txt'), 'hello {{name}}')
  const model = await modelFromSource(META + '/* @arkzen:term:project\nname: t\nbinary: t\nmode: cli\nruntimes: [ts]\n*/\n' +
    '/* @arkzen:term:prompt:p\nsteps:\n  - id: name\n    type: text\n    message: Name\n*/\n/* @arkzen:term:command:make\nprompt: p\n*/\n' +
    '/* @arkzen:term:assets\nembed: true\ntemplates:\n  - source: templates/a.txt\n    target: "{{name}}.txt"\n    variables: [name]\n*/\n', d)
  const out = dir()
  const result = generateTs(model, out)
  assert.equal(fs.existsSync(path.join(out, 'assets')), false)
  assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'package.json'), 'utf8')).files.includes('assets'), false)
  const assets = fs.readFileSync(path.join(out, 'src/assets.ts'), 'utf8')
  assert.ok(assets.includes(Buffer.from('hello {{name}}').toString('base64')))
  assert.equal(result.files.some(f => f.startsWith('assets/')), false)
})

test('two generated commands over one set of templates are refused', async () => {
  const model = await modelFromSource(META + '/* @arkzen:term:project\nname: t\nbinary: t\nmode: cli\nruntimes: [ts]\n*/\n' +
    '/* @arkzen:term:prompt:p\nsteps:\n  - id: name\n    type: text\n    message: Name\n*/\n' +
    '/* @arkzen:term:command:one\nprompt: p\n*/\n/* @arkzen:term:command:two\nprompt: p\n*/\n' +
    '/* @arkzen:term:assets\ntemplates:\n  - source: a.txt\n    target: "{{name}}"\n    variables: [name]\n*/\n', (() => {
      const d = dir(); fs.mkdirSync(path.join(d, 'assets'), { recursive: true }); fs.writeFileSync(path.join(d, 'assets/a.txt'), 'x'); return d
    })())
  assert.throws(() => generateTs(model, dir()), /would both write the same templates/)
})

test('a user handler on a prompt command keeps its handler', async () => {
  const out = dir()
  generateTs(await modelOf('term-cli-prompts'), out)
  assert.ok(fs.existsSync(path.join(out, 'src/commands/survey.ts')))
})

test('an unsafe assets dest is refused', async () => {
  const model = await modelFromSource(META + '/* @arkzen:term:project\nname: t\nbinary: t\nmode: cli\nruntimes: [ts]\n*/\n' + CMD + HANDLER + '/* @arkzen:term:assets\ndest: ../outside\n*/\n', (() => {
    const d = dir(); fs.mkdirSync(d, { recursive: true }); return d
  })())
  assert.throws(() => generateTs(model, dir()), /dest "\.\.\/outside" must be a folder inside the project/)
})

// ── the output folder guard ──────────────────────────────

test('it refuses an output folder that is not empty and not its own', async () => {
  const model = await modelOf('term-todo-cli')
  const out = dir()
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(path.join(out, 'precious.txt'), 'keep me')
  assert.throws(() => generateTs(model, out), /not empty and was not made by this generator/)
  assert.equal(fs.readFileSync(path.join(out, 'precious.txt'), 'utf8'), 'keep me')
})

test('it refuses an output folder that overlaps the tatemono folder', async () => {
  const d = dir()
  fs.mkdirSync(d, { recursive: true })
  const model = await modelFromSource(META + '/* @arkzen:term:project\nname: t\nbinary: t\nmode: cli\nruntimes: [ts]\n*/\n' + CMD + HANDLER, d)
  assert.throws(() => generateTs(model, d), /overlaps the tatemono folder/)
  assert.throws(() => generateTs(model, path.join(d, 'sub')), /overlaps the tatemono folder/)
  assert.throws(() => generateTs(model, path.dirname(d)), /overlaps the tatemono folder/)
  assert.ok(fs.existsSync(path.join(d, 'core.tsx')), 'the source is still there')
})

test('it rebuilds into its own previous output', async () => {
  const model = await modelOf('term-todo-cli')
  const out = dir()
  generateTs(model, out)
  assert.doesNotThrow(() => generateTs(model, out))
})
