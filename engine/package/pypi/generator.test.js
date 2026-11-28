import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readTatemono } from '../common/read.js'
import { findPython, toolPython } from '../common/pytools.js'
import { buildPyPackage, importNameOf, normalizeDist, pep440, planPyPackage } from './generator.js'

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')
const ready = !!(findPython() && toolPython())
const slow = { skip: ready ? false : 'Python tools not installed (node mizumi.js deps install package)', timeout: 300000 }

function variant(name, edit = s => s) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-py-test-'))
  fs.cpSync(path.join(FIXTURES, name), path.join(dir, name), { recursive: true })
  const file = path.join(dir, name, 'core.tsx')
  fs.writeFileSync(file, edit(fs.readFileSync(file, 'utf8')))
  return { dir, tatemono: readTatemono(file) }
}
function build(name, edit, opts = {}) {
  const v = variant(name, edit)
  try {
    const report = buildPyPackage({ tatemono: v.tatemono, pkg: v.tatemono.packages[0], outDir: path.join(v.dir, 'out'), ...opts })
    return { report, out: path.join(v.dir, 'out'), dir: v.dir }
  } catch (error) { fs.rmSync(v.dir, { recursive: true, force: true }); throw error }
}
const done = r => fs.rmSync(r.dir, { recursive: true, force: true })
const status = (r, name) => r.report.steps.find(s => s.name === name)?.status
const detail = (r, name) => r.report.steps.find(s => s.name === name)?.detail
const plan = (name, edit) => { const v = variant(name, edit); try { return planPyPackage({ tatemono: v.tatemono, pkg: v.tatemono.packages[0] }) } finally { fs.rmSync(v.dir, { recursive: true, force: true }) } }

// ── helpers and planning, no toolchain needed ──
test('names: PEP 503 normalisation and the import name', () => {
  assert.equal(normalizeDist('Demo_Greet.Kit'), 'demo-greet-kit')
  assert.equal(importNameOf('demo-greet-kit'), 'demo_greet_kit')
})

test('versions: semver becomes PEP 440, build metadata is dropped, unknown pre-releases are refused', () => {
  assert.equal(pep440('1.2.3').version, '1.2.3')
  assert.equal(pep440('1.2.3-beta.1').version, '1.2.3b1')
  assert.equal(pep440('1.2.3-rc.2').version, '1.2.3rc2')
  assert.equal(pep440('1.2.3-alpha.4').version, '1.2.3a4')
  assert.equal(pep440('1.2.3-dev.5').version, '1.2.3.dev5')
  assert.match(pep440('1.2.3+build.7').warnings[0], /dropped/)
  assert.throws(() => pep440('1.2.3-banana'), /no PEP 440 form/)
  assert.throws(() => pep440('1.2'), /not a semver/)
})

test('plan: the entry source becomes __init__.py, other sources keep their names', () => {
  const p = plan('greet-py')
  assert.deepEqual(p.files.map(f => f.rel).sort(), ['__init__.py', 'text.py'])
  assert.equal(p.importName, 'demo_greet')
  assert.equal(p.typed, true)
})

test('plan errors say what to change', () => {
  assert.throws(() => plan('greet-py', s => s.replace('kind: library', 'kind: sdk')), /kind: sdk on pypi is not implemented yet/)
  assert.throws(() => plan('greet-py', s => s.replace('name: demo-greet\n', 'name: "bad name!"\n')), /needs name:/)
  assert.throws(() => plan('greet-py', s => s.replace('".": index', '".": nope')), /points at source "nope"/)
  assert.throws(() => plan('greet-py', s => s.replace('version: 1.0.0\ndescription: Greeting', 'version: 1.0\ndescription: Greeting')), /not a semver|version/)
  assert.throws(() => plan('demo-py-cli', s => s.replace('demo-py: cli:main', 'demo-py: nope:main')), /points at source "nope"/)
  assert.throws(() => plan('demo-py-cli', s => s.replace('bin:\n  demo-py: cli:main', 'entries: {}')), /needs exports bin/)
  assert.throws(() => plan('greet-both', s => s.replace('/* @arkzen:pkg:source:py:index\nentry: true\n*/\ndef greet(name: str) -> str:\n    return f"Hello, {name}"\n/* @arkzen:pkg:source:py:index:end */', '')), /needs at least one @arkzen:pkg:source:py/)
  assert.throws(() => plan('greet-py', s => s.replace('typed: true', 'import_name: "1bad"')), /not a valid Python identifier/)
})

test('plan: the cli command points at module:function', () => {
  assert.deepEqual(plan('demo-py-cli').scripts, { 'demo-py': 'demo_py_cli:main' })   // a single source is the package's __init__.py
  const two = plan('demo-py-cli', s => s.replace('/* @arkzen:pkg:exports', '/* @arkzen:pkg:source:py:helpers\n*/\ndef helper():\n    return 1\n/* @arkzen:pkg:source:py:helpers:end */\n\n/* @arkzen:pkg:exports').replace('demo-py: cli:main', 'demo-py: cli:main'))
  assert.equal(two.scripts['demo-py'].startsWith('demo_py_cli'), true)
})

// ── full runs ──
test('library: builds sdist and wheel, twine passes, installs and imports in a fresh venv, tests run against the wheel', slow, () => {
  const r = build('greet-py')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    for (const name of ['build', 'pack', 'twine check', 'pack contents', 'install wheel', 'import in a fresh venv', 'tests (unittest, against the installed wheel)']) assert.equal(status(r, name), 'passed', name)
    const toml = fs.readFileSync(path.join(r.out, 'pyproject.toml'), 'utf8')
    assert.match(toml, /name = "demo-greet"/)
    assert.match(toml, /"Typing :: Typed"/)
    assert.ok(fs.existsSync(r.report.archivePath) && r.report.archivePath.endsWith('.whl'))
  } finally { done(r) }
})

test('cli: the command pip creates runs with the expected output', slow, () => {
  const r = build('demo-py-cli')
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.equal(detail(r, 'commands run (installed wheel)'), '3 command run(s)')
    assert.match(fs.readFileSync(path.join(r.out, 'pyproject.toml'), 'utf8'), /\[project\.scripts\]\ndemo-py = "demo_py_cli:main"/)
  } finally { done(r) }
})

test('dependencies are written as requirements and installed from PyPI', slow, () => {
  const r = build('greet-py', s => s
    .replace('typed: true', 'typed: true\ndependencies:\n  six: ">=1.10"')
    .replace('__version__ = "1.0.0"', 'import six\n\n__version__ = "1.0.0"'))
  try {
    assert.equal(r.report.verified, 'passed', JSON.stringify(r.report.steps, null, 1))
    assert.match(fs.readFileSync(path.join(r.out, 'pyproject.toml'), 'utf8'), /dependencies = \["six>=1\.10"\]/)
  } finally { done(r) }
})

test('one tatemono builds for both registries', slow, () => {
  const v = variant('greet-both')
  try {
    const pkg = v.tatemono.packages[0]
    const py = buildPyPackage({ tatemono: v.tatemono, pkg, outDir: path.join(v.dir, 'py') })
    assert.equal(py.verified, 'passed', JSON.stringify(py.steps, null, 1))
    assert.equal(py.registry, 'pypi')
  } finally { fs.rmSync(v.dir, { recursive: true, force: true }) }
})

// ── verify has teeth ──
test('verify has teeth: a symbol the package does not export fails the import step', slow, () => {
  const r = build('greet-py', s => s.replace('import: [greet, shout]', 'import: [greet, ghost]'))
  try {
    assert.equal(r.report.verified, 'failed')
    assert.match(detail(r, 'import in a fresh venv'), /not exported by demo_greet: ghost/)
  } finally { done(r) }
})

test('verify has teeth: a module that cannot be imported fails (the wheel is what loads)', slow, () => {
  const r = build('greet-py', s => s.replace('from .text import shout', 'from .missing_module import shout'))
  try {
    assert.equal(r.report.verified, 'failed')
    assert.equal(status(r, 'import in a fresh venv'), 'failed')
    assert.match(detail(r, 'import in a fresh venv'), /missing_module/)
  } finally { done(r) }
})

test('verify has teeth: a failing unit test fails the run', slow, () => {
  const r = build('greet-py', s => s.replace('"Hello, Ana")', '"Goodbye, Ana")'))
  try {
    assert.equal(r.report.verified, 'failed')
    assert.equal(status(r, 'tests (unittest, against the installed wheel)'), 'failed')
  } finally { done(r) }
})

test('verify has teeth: wrong command output and a crash on start both fail', slow, () => {
  const wrong = build('demo-py-cli', s => s.replace('contains: "1.0.0"', 'contains: "9.9.9"'))
  try { assert.equal(wrong.report.verified, 'failed'); assert.match(detail(wrong, 'commands run (installed wheel)'), /does not contain "9.9.9"/) } finally { done(wrong) }
  const crash = build('demo-py-cli', s => s.replace('import sys\n', 'import sys\nimport does_not_exist_anywhere\n'))
  try { assert.equal(crash.report.verified, 'failed') } finally { done(crash) }
})

test('without the Python tools the build is UNVERIFIED, not passed', () => {
  if (ready) return
  const r = build('greet-py', undefined)
  try { assert.equal(r.report.verified, 'unverified') } finally { done(r) }
})
