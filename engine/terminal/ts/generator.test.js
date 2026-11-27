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
  return buildModel(read.parsed)
}

// Writes a throwaway tatemono and returns its model.
async function modelFromSource(source) {
  const d = dir()
  fs.mkdirSync(d, { recursive: true })
  fs.writeFileSync(path.join(d, 'core.tsx'), source)
  const read = await readTatemono(d)
  assert.equal(read.valid, true, read.errors.join('\n'))
  return buildModel(read.parsed)
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

test('refuses a command that depends on a prompt', async () => {
  const model = await modelOf('term-create-site')
  const { errors } = checkSupported(model)
  assert.ok(errors.some(e => /command "create" uses prompt "site"/.test(e)), errors.join('\n'))
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
