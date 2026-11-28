// Step 1 of the OS plan: scaffold.js knows the `os` family (block builders, naming, lint).
// The extension bundles the same code as vscode-extension/lib/scaffold.mjs, so this tests both.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as osmod from 'node:os'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-ignore: plain JavaScript module
import * as scaffold from '../../../vscode-extension/lib/scaffold.mjs'
import { validateTatemono } from '../common/core/validator'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const sc = scaffold as any

function quiet<T>(fn: () => T): T {
  const log = console.log, err = console.error
  console.log = () => {}
  console.error = () => {}
  try { return fn() } finally { console.log = log; console.error = err }
}

const META = '/* @arkzen:meta\nname: t\nversion: 1.0.0\ndescription: t\nauth: false\n*/\n'
const PROJECT = '/* @arkzen:os:project\nname: t\nkind: kernel\narch: [x86_64]\nlanguage: rs\nlicense: MIT\n*/\n'
const lintErrors = (src: string): string[] => (sc.lintSource(src, {}).errors ?? []).map((f: any) => sc.formatFinding(f))

const osBlocks = (): any[] => sc.BLOCKS.filter((b: any) => b.key.startsWith('os:'))
const build = (key: string, name: string | null, o: { slug?: string; variant?: string | null; flags?: Record<string, unknown> } = {}): string =>
  sc.blockByKey(key).build({ name, slug: o.slug ?? 't', variant: o.variant ?? null, flags: o.flags ?? {} })

test('every os family is registered as a block', () => {
  const keys = osBlocks().map(b => b.key).sort()
  assert.deepEqual(keys, [
    'os:assets', 'os:board', 'os:boot', 'os:config', 'os:distro', 'os:driver', 'os:fs', 'os:image', 'os:interrupts', 'os:memory',
    'os:project', 'os:readme', 'os:run', 'os:scheduler', 'os:shell', 'os:source', 'os:syscall', 'os:target', 'os:test', 'os:userland',
  ])
})

test('every os block builds a block with its own tag', () => {
  for (const b of osBlocks()) {
    const name = b.name ? (b.name.def || 'x') : null
    const out = build(b.key, name, { variant: b.variants ? 'rs' : null })
    assert.ok(out.includes(`@arkzen:${b.tag(name, b.variants ? 'rs' : null)}`), `${b.key} -> ${out.split('\n')[0]}`)
  }
})

test('a kernel assembled from scaffolded blocks lints clean and validates with no errors', () => {
  const src = [
    META.replace('name: t', 'name: scaffolded'),
    build('os:project', null, { slug: 'scaffolded', flags: { mode: 'kernel' } }),
    build('os:target', 'x86_64'), build('os:boot'), build('os:memory'), build('os:image'), build('os:run'),
    build('os:test', 'boots'), build('os:source', 'main', { variant: 'rs' }),
  ].join('\n')
  assert.deepEqual(lintErrors(src), [])
  const dir = fs.mkdtempSync(path.join(osmod.tmpdir(), 'pluffy-os-scaffold-'))
  fs.writeFileSync(path.join(dir, 'core.tsx'), src)
  const r = quiet(() => validateTatemono(path.join(dir, 'core.tsx')))
  assert.deepEqual(r.errors, [])
})

test('each project kind scaffolds a project block that names that kind', () => {
  for (const kind of ['kernel', 'os', 'bootloader', 'bootapp', 'firmware', 'unikernel', 'driver', 'distro', 'desktop']) {
    assert.match(build('os:project', null, { flags: { mode: kind } }), new RegExp(`kind: ${kind}\\b`))
  }
})

test('lint reports os mistakes', () => {
  assert.ok(lintErrors(META + PROJECT + '/* @arkzen:os:memry\nx: 1\n*/\n').some(e => /Unknown operating system block/.test(e)))
  assert.ok(lintErrors(META + PROJECT + '/* @arkzen:os:source:zig:main\npart: kernel\n*/\nx\n/* @arkzen:os:source:zig:main:end */\n').some(e => /unknown language "zig"/.test(e)))
  assert.ok(lintErrors(META + '/* @arkzen:os:memory\nphysical: bitmap\n*/\n').some(e => /@arkzen:os:project is required/.test(e)))
  assert.ok(lintErrors(META + PROJECT + '/* @arkzen:os:source:rs:main\npart: kernel\n*/\nfn x() {}\n').some(e => /missing its closing/.test(e)))
  assert.ok(lintErrors(META + PROJECT + '/* @arkzen:os:memory:foo\nphysical: bitmap\n*/\n').some(e => /takes no name/.test(e)))
  assert.ok(lintErrors(META + PROJECT + '/* @arkzen:os:syscall\nnumber: 1\n*/\n').some(e => /needs a name/.test(e)))
})

test('lint needs no web page for an os tatemono', () => {
  assert.deepEqual(lintErrors(META + PROJECT), [])
})

test('lint warns when a handler names a source that does not exist', () => {
  const r = sc.lintSource(META + PROJECT + '/* @arkzen:os:syscall:w\nnumber: 1\nhandler: ghost::f\n*/\n', {})
  assert.ok((r.warnings ?? []).some((f: any) => /ghost/.test(sc.formatFinding(f))))
})

test('syscall and source names become lowercase snake_case, targets keep the arch', () => {
  const syscall = sc.blockByKey('os:syscall')
  assert.equal(sc.normalizeName(syscall, 'Write File', {}).value, 'write_file')
  assert.equal(sc.normalizeName(syscall, 'write_file', {}).value, 'write_file')
  assert.ok(sc.normalizeName(syscall, 'Write File', { exact: true }).error)
  assert.equal(sc.normalizeName(sc.blockByKey('os:source'), 'Main Loop', {}).value, 'main_loop')
  assert.equal(sc.normalizeName(sc.blockByKey('os:target'), 'x86_64', {}).value, 'x86_64')
  assert.equal(sc.normalizeName(sc.blockByKey('os:target'), 'arm-cortex-m', {}).value, 'arm-cortex-m')
})

test('os blocks other than the project need the project first', () => {
  const memory = sc.blockByKey('os:memory')
  assert.ok(typeof memory.needs === 'function')
  assert.ok(memory.needs(META))
  assert.equal(memory.needs(META + PROJECT), null)
  assert.equal(sc.blockByKey('os:project').needs, undefined)
})

test('the extension bundle and scaffold.js are the same code', () => {
  const root = fs.readFileSync(path.resolve(HERE, '..', '..', '..', 'scaffold.js'), 'utf-8')
  const bundled = fs.readFileSync(path.resolve(HERE, '..', '..', '..', 'vscode-extension', 'lib', 'scaffold.mjs'), 'utf-8')
  assert.ok(bundled.startsWith(root), 'run: node vscode-extension/scripts/sync-scaffold.js')
})
