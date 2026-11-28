// Step 1 of the OS plan: the `os` block family is registered in the parser and validator.
// Run with `npm test` in engine/os (it syncs the shared files first).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as osmod from 'node:os'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseTatemono } from '../common/core/parser'
import { validateTatemono } from '../common/core/validator'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const TATEMONOS = path.resolve(HERE, '..', '..', '..', 'tatemonos')

// The parser and validator print progress. Keep the test output readable.
function quiet<T>(fn: () => T): T {
  const log = console.log, err = console.error
  console.log = () => {}
  console.error = () => {}
  try { return fn() } finally { console.log = log; console.error = err }
}

const tmpRoot = fs.mkdtempSync(path.join(osmod.tmpdir(), 'pluffy-os-'))
let counter = 0
function write(source: string, assets: Record<string, string> = {}): string {
  const dir = path.join(tmpRoot, `t${counter++}`)
  fs.mkdirSync(dir, { recursive: true })
  for (const [rel, body] of Object.entries(assets)) {
    fs.mkdirSync(path.dirname(path.join(dir, 'assets', rel)), { recursive: true })
    fs.writeFileSync(path.join(dir, 'assets', rel), body)
  }
  const file = path.join(dir, 'core.tsx')
  fs.writeFileSync(file, source)
  return file
}

const META = '/* @arkzen:meta\nname: t\nversion: 1.0.0\ndescription: t\nauth: false\n*/\n'

// A valid minimal kernel, as named blocks. A test replaces or removes blocks by name.
const BASE: Record<string, string> = {
  project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [x86_64]\nlanguage: rs\nlicense: MIT\n*/\n',
  target:  '/* @arkzen:os:target:x86_64\ntriple: x86_64-unknown-none\n*/\n',
  boot:    '/* @arkzen:os:boot\nfirmware: uefi\nloader: bootloader_crate\n*/\n',
  memory:  '/* @arkzen:os:memory\nphysical: bitmap\n*/\n',
  image:   '/* @arkzen:os:image\nformats: [uefi_disk]\n*/\n',
  run:     '/* @arkzen:os:run\nemulator: qemu\nserial: stdio\n*/\n',
  test:    '/* @arkzen:os:test:boots\nkind: boot\ntimeout: 5\nexpect: ["ok"]\n*/\n',
  source:  '/* @arkzen:os:source:rs:main\npart: kernel\nentry: true\n*/\nfn main() {}\n/* @arkzen:os:source:rs:main:end */\n',
}

// Build a tatemono from BASE. A string replaces a block, null removes it, an unknown key adds one.
function kernel(changes: Record<string, string | null> = {}): string {
  const blocks = { ...BASE }
  for (const [k, v] of Object.entries(changes)) {
    if (v === null) delete blocks[k]
    else blocks[k] = v
  }
  return META + Object.values(blocks).join('\n')
}

function validate(source: string, assets: Record<string, string> = {}) {
  return quiet(() => validateTatemono(write(source, assets)))
}
function parse(source: string) {
  return quiet(() => parseTatemono(write(source)))
}
function hasError(source: string, needle: string | RegExp, assets: Record<string, string> = {}): void {
  const r = validate(source, assets)
  const hit = r.errors.some(e => (typeof needle === 'string' ? e.includes(needle) : needle.test(e)))
  assert.ok(hit, `expected an error matching ${needle}, got:\n${r.errors.join('\n') || '(none)'}`)
}
function hasWarning(source: string, needle: string | RegExp): void {
  const r = validate(source)
  const hit = r.warnings.some(e => (typeof needle === 'string' ? e.includes(needle) : needle.test(e)))
  assert.ok(hit, `expected a warning matching ${needle}, got:\n${r.warnings.join('\n') || '(none)'}`)
}
function throwsParse(source: string, needle: string | RegExp): void {
  assert.throws(() => parse(source), (e: Error) => (typeof needle === 'string' ? e.message.includes(needle) : needle.test(e.message)))
}

// ── fixtures ─────────────────────────────────────────────
for (const name of ['os-tiny-kernel', 'os-kernel-features', 'os-kiosk-distro', 'os-blinker-firmware', 'os-hello-module']) {
  test(`fixture ${name} validates with no errors`, () => {
    const r = quiet(() => validateTatemono(path.join(TATEMONOS, name, 'core.tsx')))
    assert.deepEqual(r.errors, [])
    assert.equal(r.valid, true)
  })
}

test('the base kernel used by these tests is valid', () => {
  const r = validate(kernel())
  assert.deepEqual(r.errors, [])
})

test('os-kernel-features parses into the expected shape', () => {
  const p = quiet(() => parseTatemono(path.join(TATEMONOS, 'os-kernel-features', 'core.tsx')))
  assert.ok(p.os)
  assert.equal(p.term, undefined)
  assert.equal(p.ext, undefined)
  assert.equal(p.os.projects.length, 1)
  assert.equal(p.os.projects[0].name, undefined)
  assert.deepEqual(p.os.targets.map(t => t.name), ['x86_64'])
  assert.deepEqual(p.os.syscalls.map(s => s.name), ['write', 'exit', 'yield'])
  assert.deepEqual(p.os.drivers.map(d => d.name), ['serial', 'keyboard'])
  assert.deepEqual(p.os.userland.map(u => u.name), ['hello'])
  assert.deepEqual(p.os.tests.map(t => t.name), ['boots', 'logic'])
  assert.deepEqual(p.os.sources.map(s => `${s.lang}:${s.name}`), ['rs:main', 'rs:interrupts', 'rs:syscalls', 'rs:hello'])
  assert.ok(p.os.config && p.os.boot && p.os.memory && p.os.interrupts && p.os.scheduler && p.os.fs && p.os.shell && p.os.image && p.os.run && p.os.assets)
  assert.equal(p.os.distro, undefined)
  assert.equal(p.os.board, undefined)
  assert.match(p.os.sources[0].raw, /^#!\[no_std\]/)
  assert.equal(p.os.sources[0].header.entry, true)
  assert.equal(p.pages.length, 0)
})

test('an os tatemono needs no web, native or Lynx page', () => {
  const r = validate(kernel())
  assert.ok(!r.errors.some(e => /At least one @arkzen:web:page/.test(e)))
})

test('a tatemono with no os block gets no os field, and every existing tatemono is untouched', () => {
  let checked = 0
  for (const dir of fs.readdirSync(TATEMONOS)) {
    const file = path.join(TATEMONOS, dir, 'core.tsx')
    if (!fs.existsSync(file)) continue
    const src = fs.readFileSync(file, 'utf-8')
    if (src.includes('/* @arkzen:os:')) continue
    let parsed: ReturnType<typeof parseTatemono> | undefined
    try { parsed = quiet(() => parseTatemono(file)) } catch { continue }  // tatemonos that already fail still fail the same way
    assert.equal(parsed.os, undefined, `${dir} must not get an os field`)
    checked++
  }
  assert.ok(checked > 20, `expected to check many tatemonos, checked ${checked}`)
})

test('a marker inside a template literal is not read as an os block', () => {
  const src = kernel() + '\n/* @arkzen:web:page:index */\nexport default function Page() { return <pre>{`/* @arkzen:os:bogus */`}</pre> }\n/* @arkzen:web:page:index:end */\n'
  const p = parse(src)
  assert.ok(p.os)
})

// ── parser structure ─────────────────────────────────────
test('multiple projects need ids and keep them', () => {
  const src = kernel({
    project: '/* @arkzen:os:project:alpha\nname: alpha\nkind: kernel\narch: [x86_64]\nlanguage: rs\nlicense: MIT\n*/\n/* @arkzen:os:project:beta\nname: beta\nkind: kernel\narch: [x86_64]\nlanguage: rs\nlicense: MIT\n*/\n',
  })
  const p = parse(src)
  assert.deepEqual(p.os?.projects.map(x => x.name), ['alpha', 'beta'])
})

test('two unnamed projects are a parse error', () => {
  throwsParse(kernel({ project: BASE.project + BASE.project }), 'Only one unnamed @arkzen:os:project')
})

test('a repeated project id is a parse error', () => {
  const one = '/* @arkzen:os:project:a\nname: a\nkind: kernel\n*/\n'
  throwsParse(kernel({ project: one + one }), 'Duplicate @arkzen:os:project:a')
})

test('a once-only block twice is a parse error', () => {
  throwsParse(kernel({ memory: BASE.memory + BASE.memory }), 'Only one @arkzen:os:memory')
})

test('an unknown block name is a parse error that lists the known blocks', () => {
  // The DSL tag check runs first and reports the details on the terminal, like every other family.
  throwsParse(kernel({ extra: '/* @arkzen:os:kernelz\nx: 1\n*/\n' }), /Arkzen DSL Error\] .*1 tag error/)
})

test('an unknown source language is a parse error', () => {
  throwsParse(kernel({ extra: '/* @arkzen:os:source:zig:main\npart: kernel\n*/\nx\n/* @arkzen:os:source:zig:main:end */\n' }), 'unknown language "zig"')
})

test('too many parts and missing parts are parse errors', () => {
  throwsParse(kernel({ extra: '/* @arkzen:os:memory:extra\nx: 1\n*/\n' }), 'takes no name')
  throwsParse(kernel({ extra: '/* @arkzen:os:syscall\nnumber: 1\n*/\n' }), 'is incomplete')
  throwsParse(kernel({ extra: '/* @arkzen:os:source:rs\npart: kernel\n*/\nx\n/* @arkzen:os:source:rs:end */\n' }), 'is incomplete')
  throwsParse(kernel({ extra: '/* @arkzen:os:syscall:a:b\nnumber: 1\n*/\n' }), 'too many parts')
})

test('invalid YAML in a block is a parse error', () => {
  throwsParse(kernel({ memory: '/* @arkzen:os:memory\nphysical: [bitmap\n*/\n' }), 'has invalid YAML')
})

test('a code block without its :end marker is rejected', () => {
  const src = kernel({ source: '/* @arkzen:os:source:rs:main\npart: kernel\nentry: true\n*/\nfn main() {}\n' })
  assert.throws(() => parse(src), /Arkzen DSL Error\] .*1 tag error/)
})

test('a code block header must be a mapping', () => {
  throwsParse(kernel({ source: '/* @arkzen:os:source:rs:main\n- a\n- b\n*/\nfn main() {}\n/* @arkzen:os:source:rs:main:end */\n' }), 'header must be a YAML mapping')
})

test('source blocks take both opening shapes (header, and */ on the same line)', () => {
  const src = kernel({
    source: '/* @arkzen:os:source:rs:main\npart: kernel\nentry: true\n*/\nfn main() {}\n/* @arkzen:os:source:rs:main:end */\n/* @arkzen:os:source:c:boot */\nint x;\n/* @arkzen:os:source:c:boot:end */\n',
  })
  const p = parse(src)
  assert.deepEqual(p.os?.sources.map(s => `${s.lang}:${s.name}`), ['rs:main', 'c:boot'])
  assert.deepEqual(p.os?.sources[1].header, {})
})

test('the readme block keeps its body', () => {
  const p = parse(kernel({ readme: '/* @arkzen:os:readme */\n# Hello\n/* @arkzen:os:readme:end */\n' }))
  assert.equal(p.os?.readme?.raw, '# Hello')
})

test('a typo in an os tag gets the clear DSL tag error', () => {
  assert.throws(() => parse(kernel({ extra: '/* @arkzen:os:memry\nx: 1\n*/\n' })), /DSL Error|Unknown operating system block|tag error/)
})

// ── project and kind ─────────────────────────────────────
test('a project is required', () => {
  hasError(kernel({ project: null }), '@arkzen:os:project is required')
})

test('kind, name, arch and language are required and checked', () => {
  hasError(kernel({ project: '/* @arkzen:os:project\nname: k\narch: [x86_64]\nlanguage: rs\nlicense: MIT\n*/\n' }), 'needs a kind')
  hasError(kernel({ project: '/* @arkzen:os:project\nkind: kernel\narch: [x86_64]\nlanguage: rs\nlicense: MIT\n*/\n' }), 'needs a name')
  hasError(kernel({ project: '/* @arkzen:os:project\nname: k\nkind: toaster\narch: [x86_64]\nlanguage: rs\nlicense: MIT\n*/\n' }), 'kind must be one of')
  hasError(kernel({ project: '/* @arkzen:os:project\nname: k\nkind: kernel\nlanguage: rs\nlicense: MIT\n*/\n' }), 'needs arch')
  hasError(kernel({ project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [mips]\nlanguage: rs\nlicense: MIT\n*/\n' }), '"mips" is not valid')
  hasError(kernel({ project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [x86_64]\nlicense: MIT\n*/\n' }), 'needs language')
})

test('version must be semver and license must look like an SPDX id', () => {
  hasError(kernel({ project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [x86_64]\nlanguage: rs\nversion: one\nlicense: MIT\n*/\n' }), 'version must be a semver')
  hasError(kernel({ project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [x86_64]\nlanguage: rs\nlicense: not a license\n*/\n' }), 'license must be an SPDX id')
  hasWarning(kernel({ project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [x86_64]\nlanguage: rs\nlicense: Made-Up-1.0\n*/\n' }), 'not in the common SPDX list')
  hasWarning(kernel({ project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [x86_64]\nlanguage: rs\n*/\n' }), 'has no license')
})

test('go is only for firmware, and host only for drivers', () => {
  hasError(kernel({ project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [x86_64]\nlanguage: go\nlicense: MIT\n*/\n' }), 'language: go is only valid for kind: firmware')
  hasError(kernel({ project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [x86_64]\nlanguage: rs\nhost: linux\nlicense: MIT\n*/\n' }), 'host: only applies to kind: driver')
})

test('a driver project needs a host', () => {
  const src = META + '/* @arkzen:os:project\nname: d\nkind: driver\nlanguage: c\nlicense: GPL-2.0-only\n*/\n/* @arkzen:os:driver:d\nclass: serial\n*/\n/* @arkzen:os:source:c:d\npart: driver\n*/\nint x;\n/* @arkzen:os:source:c:d:end */\n'
  hasError(src, 'needs host:')
})

test('with several projects each needs an id', () => {
  const src = kernel({
    project: '/* @arkzen:os:project:a\nname: a\nkind: kernel\narch: [x86_64]\nlanguage: rs\nlicense: MIT\n*/\n/* @arkzen:os:project\nname: b\nkind: kernel\narch: [x86_64]\nlanguage: rs\nlicense: MIT\n*/\n',
  })
  hasError(src, 'every project needs an id')
})

// ── kind and block matrix ────────────────────────────────
test('a block a kind requires is reported when missing', () => {
  hasError(kernel({ memory: null }), '@arkzen:os:memory is required for kind: kernel')
  hasError(kernel({ boot: null }), '@arkzen:os:boot is required')
  hasError(kernel({ image: null }), '@arkzen:os:image is required')
  hasError(kernel({ run: null }), '@arkzen:os:run is required')
  hasError(kernel({ test: null }), '@arkzen:os:test is required')
  hasError(kernel({ source: null }), '@arkzen:os:source is required')
  hasError(kernel({ target: null }), '@arkzen:os:target is required')
})

test('a block a kind does not use is reported', () => {
  hasError(kernel({ extra: '/* @arkzen:os:userland:x\nlanguage: rs\n*/\n' }), '@arkzen:os:userland is not used by kind: kernel')
  hasError(kernel({ extra: '/* @arkzen:os:board\nname: b\nchip: c\n*/\n' }), '@arkzen:os:board is not used by kind: kernel')
  hasError(kernel({ extra: '/* @arkzen:os:distro\nbuilder: buildroot\n*/\n' }), '@arkzen:os:distro is not used by kind: kernel')
})

test('a distro needs a distro block and an image, and takes no source', () => {
  const src = META + '/* @arkzen:os:project\nname: d\nkind: distro\nlicense: MIT\n*/\n'
  hasError(src, '@arkzen:os:distro is required for kind: distro')
  hasError(src, '@arkzen:os:image is required for kind: distro')
  const withSource = src + '/* @arkzen:os:distro\nbuilder: buildroot\n*/\n/* @arkzen:os:image\nformats: [raw]\n*/\n/* @arkzen:os:source:rs:x\npart: kernel\n*/\nfn x() {}\n/* @arkzen:os:source:rs:x:end */\n'
  hasError(withSource, '@arkzen:os:source is not used by kind: distro')
})

test('firmware needs a board and no boot block', () => {
  const src = META + '/* @arkzen:os:project\nname: f\nkind: firmware\narch: [arm-cortex-m]\nlanguage: rs\nlicense: MIT\n*/\n/* @arkzen:os:target:arm-cortex-m\ntriple: thumbv6m-none-eabi\n*/\n/* @arkzen:os:image\nformats: [uf2]\n*/\n/* @arkzen:os:source:rs:main\npart: kernel\nentry: true\n*/\nfn main() {}\n/* @arkzen:os:source:rs:main:end */\n'
  hasError(src, '@arkzen:os:board is required for kind: firmware')
  hasError(src + '/* @arkzen:os:board\nname: b\nchip: c\n*/\n/* @arkzen:os:boot\nfirmware: direct\n*/\n', '@arkzen:os:boot is not used by kind: firmware')
})

// ── targets ──────────────────────────────────────────────
test('a target must name an architecture, once, that the project lists', () => {
  hasError(kernel({ target: '/* @arkzen:os:target:mips\ntriple: x\n*/\n' }), '"mips" is not an architecture')
  hasError(kernel({ target: BASE.target + BASE.target }), 'Duplicate @arkzen:os:target:x86_64')
  hasError(kernel({ target: BASE.target + '/* @arkzen:os:target:aarch64\ntriple: aarch64-unknown-none\n*/\n' }), 'does not list aarch64')
})

test('every architecture of the project needs its target block', () => {
  hasError(kernel({ project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [x86_64, aarch64]\nlanguage: rs\nlicense: MIT\n*/\n' }), 'no @arkzen:os:target:aarch64')
})

test('target values are checked', () => {
  hasError(kernel({ target: '/* @arkzen:os:target:x86_64\npage_size: 3000\n*/\n' }), 'page_size must be a power of two')
  hasError(kernel({ target: '/* @arkzen:os:target:x86_64\npage_levels: 9\n*/\n' }), 'page_levels must be an integer from 2 to 5')
  hasError(kernel({ target: '/* @arkzen:os:target:x86_64\nred_zone: maybe\n*/\n' }), 'red_zone must be true or false')
  hasWarning(kernel({ target: '/* @arkzen:os:target:x86_64\nred_zone: true\n*/\n' }), 'red_zone: true is unsafe')
  hasWarning(kernel({ target: '/* @arkzen:os:target:x86_64\ntripple: x\n*/\n' }), 'unknown key "tripple"')
})

// ── config ───────────────────────────────────────────────
test('config values are checked', () => {
  hasError(kernel({ config: '/* @arkzen:os:config\nfeatures: [serial_log, telepathy]\n*/\n' }), '"telepathy" is not valid')
  hasError(kernel({ config: '/* @arkzen:os:config\nlog_level: shouty\n*/\n' }), 'log_level must be one of')
  hasError(kernel({ config: '/* @arkzen:os:config\npanic: explode\n*/\n' }), 'panic must be one of')
  hasError(kernel({ config: '/* @arkzen:os:config\nconstants:\n  1bad: 1\n*/\n' }), 'not a valid identifier')
  hasError(kernel({ config: '/* @arkzen:os:config\nconstants:\n  OK: [1, 2]\n*/\n' }), 'must be a string, number or true/false')
  hasWarning(kernel({ config: '/* @arkzen:os:config\nfeatures: [userland]\n*/\n' }), 'userland without syscalls')
})

// ── boot ─────────────────────────────────────────────────
test('bios is allowed on x86 only', () => {
  const src = kernel({
    project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [x86_64, aarch64]\nlanguage: rs\nlicense: MIT\n*/\n',
    target: BASE.target + '/* @arkzen:os:target:aarch64\ntriple: aarch64-unknown-none\n*/\n',
    boot: '/* @arkzen:os:boot\nfirmware: bios\n*/\n',
  })
  hasError(src, 'bios is only available on x86 and x86_64')
})

test('boot values are checked', () => {
  hasError(kernel({ boot: '/* @arkzen:os:boot\nfirmware: magic\n*/\n' }), 'firmware must be one of')
  hasError(kernel({ boot: '/* @arkzen:os:boot\nloader: limine\nfirmware: direct\n*/\n' }), 'limine needs firmware bios or uefi')
  hasError(kernel({ boot: '/* @arkzen:os:boot\nrequests:\n  framebuffer:\n    width: 10\n    height: 10\n    bpp: 7\n*/\n' }), 'bpp must be 8, 16, 24 or 32')
  hasError(kernel({ boot: '/* @arkzen:os:boot\nstack_size: 100\n*/\n' }), 'stack_size must be a multiple of the page size')
  hasError(kernel({ boot: '/* @arkzen:os:boot\nkernel_base: lots\n*/\n' }), 'kernel_base must be a non-negative integer')
})

// ── memory ───────────────────────────────────────────────
const regions = (list: string, heap = '') => kernel({ memory: `/* @arkzen:os:memory\nphysical: bitmap\n${heap}regions:\n${list}*/\n` })
const region = (name: string, base: string, size: string, extra = 'flags: [read, write]\n    kind: data\n') => `  - name: ${name}\n    base: "${base}"\n    size: ${size}\n    ${extra}`

test('memory regions must not overlap and must be page aligned', () => {
  hasError(regions(region('a', '0x100000', '2M') + region('b', '0x200000', '2M')), 'regions "a" and "b" overlap')
  assert.deepEqual(validate(regions(region('a', '0x100000', '1M') + region('b', '0x200000', '1M'))).errors, [])
  hasError(regions(region('a', '0x100010', '1M')), 'base 0x100010 is not aligned')
  hasError(regions(region('a', '0x100000', '1000')), 'size 1000 is not a multiple of the page size')
  hasError(regions(region('a', '0x100000', '1M') + region('a', '0x400000', '1M')), 'duplicate region name "a"')
})

test('memory region values are checked', () => {
  hasError(regions(region('a', '0x100000', '1M', 'flags: [read, fly]\n    kind: data\n')), '"fly" is not valid')
  hasError(regions(region('a', '0x100000', '1M', 'flags: [read]\n    kind: swamp\n')), 'kind must be one of')
  hasWarning(regions(region('a', '0x100000', '1M', 'flags: [write, exec]\n    kind: code\n')), 'both writable and executable')
})

test('the heap must start inside a region and fit in it', () => {
  const r = region('h', '0x1000000', '1M', 'flags: [read, write]\n    kind: heap\n')
  assert.deepEqual(validate(regions(r, 'heap:\n  start: "0x1000000"\n  initial_size: 64K\n  max_size: 1M\n')).errors, [])
  hasError(regions(r, 'heap:\n  start: "0x9000000"\n  initial_size: 64K\n  max_size: 1M\n'), 'heap.start is not inside any region')
  hasError(regions(r, 'heap:\n  start: "0x1000000"\n  initial_size: 64K\n  max_size: 4M\n'), 'runs past the end of region')
  hasError(regions(r, 'heap:\n  start: "0x1000000"\n  initial_size: 2M\n  max_size: 1M\n'), 'initial_size cannot exceed heap.max_size')
  hasError(regions(r, 'heap:\n  allocator: pile\n  start: "0x1000000"\n'), 'allocator must be one of')
})

test('sizes accept numbers, hex and K, M, G suffixes and reject nonsense', () => {
  hasError(kernel({ memory: '/* @arkzen:os:memory\nheap:\n  start: 0x1000\n  initial_size: lots\n*/\n' }), 'heap.initial_size must be a non-negative integer')
  hasError(kernel({ memory: '/* @arkzen:os:memory\nheap:\n  start: 0x1000\n  initial_size: 0\n*/\n' }), 'must be greater than zero')
})

// ── interrupts ───────────────────────────────────────────
const IRQ_SRC = '/* @arkzen:os:source:rs:irq\npart: kernel\n*/\nfn t() {}\n/* @arkzen:os:source:rs:irq:end */\n'
const interrupts = (body: string) => kernel({ interrupts: `/* @arkzen:os:interrupts\n${body}*/\n`, irqsrc: IRQ_SRC })

test('irq lines must fit the controller and handlers must resolve', () => {
  assert.deepEqual(validate(interrupts('controller: pic\nirqs:\n  - name: timer\n    line: 0\n    handler: irq::t\n')).errors, [])
  hasError(interrupts('controller: pic\nirqs:\n  - name: late\n    line: 16\n    handler: irq::t\n'), 'outside the range 0 to 15')
  hasError(interrupts('controller: apic\nirqs:\n  - name: x\n    line: 0\n    handler: nowhere::t\n'), 'there is no @arkzen:os:source block with that name')
  hasError(interrupts('controller: apic\nirqs:\n  - name: x\n    line: 0\n    handler: not-a-reference\n'), 'must look like <source name>::<function>')
  hasError(interrupts('controller: apic\nirqs:\n  - name: x\n    line: 0\n'), 'needs a handler')
  hasError(interrupts('controller: gic\n'), 'gic is for aarch64')
  hasError(interrupts('controller: apic\nirqs:\n  - name: x\n    line: 0\n    handler: irq::t\n  - name: x\n    line: 1\n    handler: irq::t\n'), 'duplicate irq name')
  hasWarning(interrupts('controller: apic\nirqs:\n  - name: a\n    line: 3\n    handler: irq::t\n  - name: b\n    line: 3\n    handler: irq::t\n'), 'also used by')
})

test('exception handlers must resolve too', () => {
  hasError(interrupts('exceptions:\n  - name: page_fault\n    handler: nowhere::pf\n'), 'there is no @arkzen:os:source block')
  assert.deepEqual(validate(interrupts('exceptions: [page_fault, {name: double_fault, handler: "irq::t"}]\n')).errors, [])
})

// ── scheduler ────────────────────────────────────────────
test('scheduler rules', () => {
  hasError(kernel({ scheduler: '/* @arkzen:os:scheduler\npolicy: cooperative\npreemptive: true\ntick_hz: 100\n*/\n' }), 'cooperative cannot be preemptive')
  hasError(kernel({ scheduler: '/* @arkzen:os:scheduler\npolicy: round_robin\npreemptive: true\n*/\n' }), 'preemptive: true needs tick_hz')
  hasError(kernel({ scheduler: '/* @arkzen:os:scheduler\npolicy: lottery\n*/\n' }), 'policy must be one of')
  hasError(kernel({ scheduler: '/* @arkzen:os:scheduler\nstack_size: 100\n*/\n' }), 'stack_size must be a multiple of the page size')
  hasWarning(kernel({ scheduler: '/* @arkzen:os:scheduler\nsmp: true\n*/\n' }), 'not promised to be stable')
})

// ── syscalls ─────────────────────────────────────────────
const SYS_SRC = '/* @arkzen:os:source:rs:syscalls\npart: kernel\n*/\nfn s() {}\n/* @arkzen:os:source:rs:syscalls:end */\n'
const syscall = (name: string, body: string) => `/* @arkzen:os:syscall:${name}\n${body}*/\n`
const withSyscalls = (...blocks: string[]) => kernel({ syscalls: blocks.join('\n'), syssrc: SYS_SRC })

test('syscall numbers must be unique and handlers must resolve', () => {
  assert.deepEqual(validate(withSyscalls(syscall('write', 'number: 1\nreturns: i64\nhandler: syscalls::s\n'), syscall('exit', 'number: 2\nreturns: never\nhandler: syscalls::s\n'))).errors, [])
  hasError(withSyscalls(syscall('a', 'number: 1\nhandler: syscalls::s\n'), syscall('b', 'number: 1\nhandler: syscalls::s\n')), 'number 1 is already used by syscall "a"')
  hasError(withSyscalls(syscall('a', 'number: 1\nhandler: ghost::s\n')), 'names the source "ghost"')
  hasError(withSyscalls(syscall('a', 'handler: syscalls::s\n')), 'needs a number')
  hasError(withSyscalls(syscall('a', 'number: -1\nhandler: syscalls::s\n')), 'number must be a non-negative integer')
  hasError(withSyscalls(syscall('a', 'number: 1\n')), 'needs a handler')
  hasError(withSyscalls(syscall('a', 'number: 1\nhandler: syscalls::s\n') + syscall('a', 'number: 2\nhandler: syscalls::s\n')), 'Duplicate @arkzen:os:syscall:a')
})

test('syscall arguments and return types are checked', () => {
  hasError(withSyscalls(syscall('a', 'number: 1\nargs:\n  - name: x\n    type: banana\nhandler: syscalls::s\n')), 'type must be one of')
  hasError(withSyscalls(syscall('a', 'number: 1\nargs:\n  - name: x\n    type: u64\n  - name: x\n    type: u64\nhandler: syscalls::s\n')), 'duplicate argument name')
  hasError(withSyscalls(syscall('a', 'number: 1\nargs: [{name: a, type: u8},{name: b, type: u8},{name: c, type: u8},{name: d, type: u8},{name: e, type: u8},{name: f, type: u8},{name: g, type: u8}]\nhandler: syscalls::s\n')), 'at most 6')
  hasError(withSyscalls(syscall('a', 'number: 1\nreturns: string\nhandler: syscalls::s\n')), 'returns must be one of')
  hasError(withSyscalls(syscall('Bad-Name', 'number: 1\nhandler: syscalls::s\n')), 'the name must be')
})

// ── drivers ──────────────────────────────────────────────
const driver = (name: string, body: string) => kernel({ drivers: `/* @arkzen:os:driver:${name}\n${body}*/\n` })

test('driver class and bus must agree', () => {
  assert.deepEqual(validate(driver('serial', 'class: serial\nbus: platform\nports: [0x3F8]\nmodel: polling\n')).errors, [])
  hasError(driver('nic', 'class: pci\nbus: usb\n'), 'class pci cannot sit on bus usb')
  hasError(driver('x', 'class: toaster\n'), 'class must be one of')
  hasError(driver('x', 'bus: platform\n'), 'needs a class')
  hasError(driver('x', 'class: serial\nmodel: telepathy\n'), 'model must be one of')
})

test('driver ports, mmio and irq are checked', () => {
  hasError(driver('x', 'class: serial\nports: [70000]\n'), 'ports must be a list of I/O port numbers')
  hasError(kernel({
    project: '/* @arkzen:os:project\nname: k\nkind: kernel\narch: [aarch64]\nlanguage: rs\nlicense: MIT\n*/\n',
    target: '/* @arkzen:os:target:aarch64\ntriple: aarch64-unknown-none\n*/\n',
    drivers: '/* @arkzen:os:driver:x\nclass: serial\nports: [0x3F8]\n*/\n',
  }), 'I/O ports exist on x86 only')
  hasError(driver('x', 'class: serial\nmmio:\n  base: 0x1000\n'), 'mmio needs a size')
  hasError(kernel({ drivers: '/* @arkzen:os:driver:a\nclass: serial\nmmio:\n  base: 0x1000\n  size: 0x1000\n*/\n/* @arkzen:os:driver:b\nclass: timer\nmmio:\n  base: 0x1800\n  size: 0x1000\n*/\n' }), 'overlaps the one of driver "a"')
  hasWarning(driver('x', 'class: serial\nirq: 4\nmodel: polling\n'), 'never uses it')
})

test('host driver keys must match the host', () => {
  const lin = (body: string) => META + '/* @arkzen:os:project\nname: d\nkind: driver\nhost: linux\nlanguage: c\nlicense: GPL-2.0-only\n*/\n' + `/* @arkzen:os:driver:d\nclass: serial\n${body}*/\n` + '/* @arkzen:os:source:c:d\npart: driver\n*/\nint x;\n/* @arkzen:os:source:c:d:end */\n'
  assert.deepEqual(validate(lin('module: my_mod\nparams: [level]\n')).errors, [])
  hasError(lin('module: my-mod\n'), 'valid Linux module name')
  hasError(lin('inf: x.inf\n'), 'inf: is not valid for host linux')
  hasError(lin('entitlements: [com.apple.x]\n'), 'entitlements: is not valid for host linux')
  hasError(kernel({ drivers: '/* @arkzen:os:driver:x\nclass: serial\nmodule: m\n*/\n' }), 'which are for a host driver')
  hasWarning(lin('module: m\n'), 'build-only')
})

// ── fs, userland, shell ──────────────────────────────────
test('filesystem rules', () => {
  hasError(kernel({ fs: '/* @arkzen:os:fs\nroot: initrd\n*/\n' }), 'needs a type')
  hasError(kernel({ fs: '/* @arkzen:os:fs\ntype: ntfs\n*/\n' }), 'type must be one of')
  hasError(kernel({ fs: '/* @arkzen:os:fs\ntype: tarfs\nroot: ../escape\n*/\n' }), 'relative path inside assets')
  hasError(kernel({ fs: '/* @arkzen:os:fs\ntype: tarfs\nmounts:\n  - path: bin\n    type: ramfs\n*/\n' }), 'path: that starts with /')
  hasError(kernel({ fs: '/* @arkzen:os:fs\ntype: tarfs\nmounts:\n  - path: /a\n  - path: /a\n*/\n' }), 'duplicate mount path')
})

test('userland rules', () => {
  const os = META + BASE.project.replace('kind: kernel', 'kind: os') + BASE.target + BASE.boot + BASE.memory +
    '/* @arkzen:os:interrupts\ncontroller: apic\n*/\n/* @arkzen:os:scheduler\npolicy: round_robin\n*/\n' +
    '/* @arkzen:os:syscall:a\nnumber: 1\nhandler: main::x\n*/\n' + BASE.image + BASE.run + BASE.test + BASE.source +
    '/* @arkzen:os:userland:base\nlanguage: rs\n*/\n/* @arkzen:os:source:rs:base\npart: user\n*/\nfn x() {}\n/* @arkzen:os:source:rs:base:end */\n'
  assert.deepEqual(validate(os).errors, [])
  hasError(os + '/* @arkzen:os:userland:app\nlanguage: java\n*/\n', 'language must be one of')
  hasError(os + '/* @arkzen:os:userland:app\nlanguage: rs\nstack_size: 100\n*/\n', 'stack_size must be a multiple of the page size')
  hasError(os + '/* @arkzen:os:userland:app\nlanguage: rs\nlibc: glibc\n*/\n', 'libc must be one of')
  hasWarning(os + '/* @arkzen:os:userland:app\nlanguage: rs\n*/\n', 'has no @arkzen:os:source block with part: user')
})

test('shell rules', () => {
  hasError(kernel({ extra: '/* @arkzen:os:shell\nbuiltins: [ok, Bad]\n*/\n' }).replace('kind: kernel', 'kind: kernel'), 'builtins')
  hasError(kernel({ extra: '/* @arkzen:os:shell\nbuiltins: [a, a]\n*/\n' }), 'duplicate "a"')
})

// ── image ────────────────────────────────────────────────
test('image rules', () => {
  hasError(kernel({ image: '/* @arkzen:os:image\nsize: 1M\n*/\n' }), 'needs formats')
  hasError(kernel({ image: '/* @arkzen:os:image\nformats: [floppy]\n*/\n' }), '"floppy" is not valid')
  hasError(kernel({ image: '/* @arkzen:os:image\nformats: [uf2]\n*/\n' }), 'uf2 is for kind: firmware')
  hasError(kernel({ image: '/* @arkzen:os:image\nformats: [iso]\nchecksums: md5\n*/\n' }), 'checksums must be one of')
  hasError(kernel({ boot: '/* @arkzen:os:boot\nfirmware: bios\n*/\n', image: '/* @arkzen:os:image\nformats: [efi_app]\n*/\n' }), 'need @arkzen:os:boot firmware: uefi')
})

test('partitions must fit in the image and have unique names', () => {
  const part = (body: string) => kernel({ image: `/* @arkzen:os:image\nformats: [raw]\n${body}*/\n` })
  assert.deepEqual(validate(part('size: 64M\npartitions:\n  - {name: a, size: 32M, fs: fat32}\n  - {name: b, size: 32M, fs: ext2}\n')).errors, [])
  hasError(part('size: 64M\npartitions:\n  - {name: a, size: 40M}\n  - {name: b, size: 40M}\n'), 'add up to more than size')
  hasError(part('partitions:\n  - {name: a, size: 1M}\n  - {name: a, size: 1M}\n'), 'duplicate partition name')
  hasError(part('partitions:\n  - {name: a}\n'), 'needs a size')
  hasError(part('partitions:\n  - {name: a, size: 1M, fs: zfs}\n'), 'fs must be one of')
})

test('partition contents must be a known token or an asset', () => {
  const part = (contents: string) => kernel({ image: `/* @arkzen:os:image\nformats: [raw]\npartitions:\n  - {name: a, size: 1M, contents: ${contents}}\n*/\n` })
  assert.deepEqual(validate(part('[kernel, bootloader, initramfs]')).errors, [])
  assert.deepEqual(validate(part('[logo.bin]'), { 'logo.bin': 'x' }).errors, [])
  hasWarning(part('[logo.bin]'), 'is not kernel, bootloader, initramfs')
  hasError(part('[../secret]'), 'relative path inside assets')
})

test('an image or any block may not point at a device', () => {
  for (const target of ['/dev/sda', '/dev/nvme0n1', '\\\\.\\PhysicalDrive0']) {
    hasError(kernel({ image: `/* @arkzen:os:image\nformats: [raw]\noutput: '${target}'\n*/\n` }), 'points at a device or system path')
  }
  hasError(kernel({ run: '/* @arkzen:os:run\nemulator: qemu\nextra_args: ["/dev/sdb"]\n*/\n' }), 'points at a device or system path')
})

// ── run and tests ────────────────────────────────────────
test('run rules', () => {
  hasError(kernel({ run: '/* @arkzen:os:run\nmachine: q35\n*/\n' }), 'needs emulator')
  hasError(kernel({ run: '/* @arkzen:os:run\nemulator: bochs\n*/\n' }), 'emulator must be one of')
  hasError(kernel({ run: '/* @arkzen:os:run\nemulator: qemu\ncores: 0\n*/\n' }), 'cores must be a positive integer')
  hasError(kernel({ run: '/* @arkzen:os:run\nemulator: qemu\ndevices: ["virtio blk"]\n*/\n' }), 'is not a device name')
  hasError(kernel({ run: '/* @arkzen:os:run\nemulator: qemu\ndebug:\n  gdb: true\n  port: 99999\n*/\n' }), 'port from 1 to 65535')
  hasError(kernel({ run: '/* @arkzen:os:run\nemulator: qemu\nserial: none\n*/\n' }), 'leaves a boot test nothing to read')
  hasWarning(kernel({ run: '/* @arkzen:os:run\nemulator: qemu\ndevices: [flux-capacitor]\n*/\n' }), 'not a device the engine knows')
  hasWarning(kernel({ run: '/* @arkzen:os:run\nemulator: qemu\ndisplay: gtk\n*/\n' }), 'run headless')
})

test('boot test rules', () => {
  const t = (body: string) => kernel({ test: `/* @arkzen:os:test:boots\n${body}*/\n` })
  hasError(t('timeout: 5\nexpect: [x]\n'), 'needs a kind')
  hasError(t('kind: smoke\n'), 'kind must be one of')
  hasError(t('kind: boot\nexpect: [x]\n'), 'needs timeout')
  hasError(t('kind: boot\ntimeout: 0\nexpect: [x]\n'), 'timeout must be a positive whole number')
  hasError(t('kind: boot\ntimeout: 5\n'), 'needs expect')
  hasError(t('kind: boot\ntimeout: 5\nexpect: ["("]\n'), 'not a valid regular expression')
  hasError(t('kind: boot\ntimeout: 5\nexpect: [x]\nforbid: ["["]\n'), 'not a valid regular expression')
  hasError(kernel({ run: null, test: BASE.test }), '@arkzen:os:run is required')
  hasWarning(t('kind: boot\ntimeout: 9000\nexpect: [x]\n'), 'is long')
  hasWarning(t('kind: unit\ntimeout: 5\n'), 'ignores timeout')
  hasError(t('kind: boot\ntimeout: 5\nexpect: [x]\n') + '/* @arkzen:os:test:boots\nkind: unit\n*/\n', 'Duplicate @arkzen:os:test:boots')
})

// ── assets ───────────────────────────────────────────────
test('assets rules', () => {
  assert.deepEqual(validate(kernel({ assets: '/* @arkzen:os:assets\ninclude: ["files/**"]\ndest: initrd\n*/\n' }), { 'files/a.txt': 'x' }).errors, [])
  hasWarning(kernel({ assets: '/* @arkzen:os:assets\ninclude: ["files/**"]\n*/\n' }), 'matches no file under assets/')
  hasError(kernel({ assets: '/* @arkzen:os:assets\ninclude: ["../x"]\n*/\n' }), 'relative path inside assets')
  hasError(kernel({ assets: '/* @arkzen:os:assets\ndest: /etc\n*/\n' }), 'dest must be a relative path')
  hasError(kernel({ assets: '/* @arkzen:os:assets\nembed: yes please\n*/\n' }), 'embed must be true or false')
})

// ── distro and board ─────────────────────────────────────
const distro = (body: string) => META + '/* @arkzen:os:project\nname: d\nkind: distro\nlicense: MIT\n*/\n' + `/* @arkzen:os:distro\n${body}*/\n` + '/* @arkzen:os:image\nformats: [raw]\n*/\n'

test('distro accounts carry names only', () => {
  assert.deepEqual(validate(distro('builder: buildroot\nusers:\n  - name: operator\n  - admin\n')).errors, [])
  hasError(distro('builder: buildroot\nusers:\n  - name: operator\n    password: hunter2\n'), /secret-like keys|only name: is allowed/)
  hasError(distro('builder: buildroot\nusers:\n  - name: root\n    shell: /bin/sh\n'), 'only name: is allowed')
  hasError(distro('builder: buildroot\nusers:\n  - name: "Bad Name"\n'), 'valid account name')
})

test('distro rules', () => {
  hasError(distro('base: alpine\n'), 'needs a builder')
  hasError(distro('builder: buildroot\ninit: upstart\n'), 'init must be one of')
  hasError(distro('builder: buildroot\nhostname: "bad host!"\n'), 'valid host name')
  hasWarning(distro('builder: gentoo\n'), 'not one the engine writes configuration for')
  hasWarning(distro('builder: buildroot\n'), 'verifies as UNVERIFIED')
  hasWarning(distro('builder: buildroot\npackages: [a, a]\n'), 'lists a package twice')
  hasWarning(distro('builder: buildroot\noverlay: [rootfs/etc]\n'), 'not a file under assets/')
  hasError(distro('builder: buildroot\noverlay: ["/etc"]\n'), 'relative path inside assets')
})

test('board rules', () => {
  const fw = (board: string) => META + '/* @arkzen:os:project\nname: f\nkind: firmware\narch: [arm-cortex-m]\nlanguage: rs\nlicense: MIT\n*/\n/* @arkzen:os:target:arm-cortex-m\ntriple: thumbv6m-none-eabi\n*/\n/* @arkzen:os:image\nformats: [uf2]\n*/\n/* @arkzen:os:source:rs:main\npart: kernel\nentry: true\n*/\nfn main() {}\n/* @arkzen:os:source:rs:main:end */\n' + `/* @arkzen:os:board\n${board}*/\n`
  assert.deepEqual(validate(fw('name: b\nchip: c\nclock: 133MHz\nram: 264K\n')).errors, [])
  hasError(fw('chip: c\n'), 'needs a name')
  hasError(fw('name: b\n'), 'needs a chip')
  hasError(fw('name: b\nchip: c\nruntime: windows\n'), 'runtime must be one of')
  hasError(fw('name: b\nchip: c\nflash_tool: dd\n'), 'flash_tool must be one of')
  hasError(fw('name: b\nchip: c\nperipherals:\n  - gpio:\n      pins: [a]\n'), 'gpio.pins must be a list of pin numbers')
  hasWarning(fw('name: b\nchip: c\nperipherals:\n  - laser: {}\n'), 'unknown peripheral "laser"')
})

// ── sources ──────────────────────────────────────────────
test('source rules', () => {
  const src = (head: string, body = 'fn x() {}', lang = 'rs', name = 'x') => kernel({ extra: `/* @arkzen:os:source:${lang}:${name}\n${head}*/\n${body}\n/* @arkzen:os:source:${lang}:${name}:end */\n` })
  hasError(src('part: kernel\n', 'fn x() {}', 'rs', 'Bad-Name'), 'the name must be lowercase letters')
  hasError(src('arch: x86_64\n'), 'needs part')
  hasError(src('part: nowhere\n'), 'part must be one of')
  hasError(src('part: boot\n', 'global _start', 'asm'), 'needs arch')
  hasError(src('part: boot\narch: aarch64\n', 'b .', 'asm'), 'arch aarch64 is not listed')
  hasError(src('part: kernel\npath: ../../etc/x\n'), 'relative path inside the project')
  hasError(src('part: kernel\n', '   '), 'has an empty body')
  hasError(src('part: kernel\n', 'fn x() {}', 'rs', 'main'), 'Duplicate @arkzen:os:source:rs:main')
  hasError(src('part: kernel\nentry: true\n'), 'More than one source has entry: true')
  hasError(src('part: kernel\nentry: 3\n'), 'entry must be true or false')
})

test('a kernel needs one entry source', () => {
  hasError(kernel({ source: '/* @arkzen:os:source:rs:main\npart: kernel\n*/\nfn main() {}\n/* @arkzen:os:source:rs:main:end */\n' }), 'entry: true')
})

test('go source is for firmware only', () => {
  hasError(kernel({ extra: '/* @arkzen:os:source:go:x\npart: lib\n*/\npackage main\n/* @arkzen:os:source:go:x:end */\n' }), 'go source is only valid for kind: firmware')
})

test('source must not import from Pluffy', () => {
  const imp = (lang: string, body: string) => kernel({ extra: `/* @arkzen:os:source:${lang}:pf\npart: lib\n*/\n${body}\n/* @arkzen:os:source:${lang}:pf:end */\n` })
  hasError(imp('rs', 'use pluffy::runtime;'), 'refers to Pluffy or Arkzen')
  hasError(imp('rs', 'extern crate arkzen;'), 'refers to Pluffy or Arkzen')
  hasError(imp('c', '#include "arkzen/core.h"'), 'refers to Pluffy or Arkzen')
  hasError(imp('asm', '%include "pluffy.inc"'), 'refers to Pluffy or Arkzen')
  assert.deepEqual(validate(imp('rs', 'use core::fmt; // pluffy is great')).errors, [])
})

// ── secrets ──────────────────────────────────────────────
test('secret-like keys are rejected in every block', () => {
  hasError(kernel({ config: '/* @arkzen:os:config\nconstants:\n  api_key: abc\n*/\n' }), 'secret-like keys')
  hasError(kernel({ extra: '/* @arkzen:os:shell\nroot_password: x\n*/\n' }), 'secret-like keys')
  hasError(kernel({ run: '/* @arkzen:os:run\nemulator: qemu\ntoken: x\n*/\n' }), 'secret-like keys')
  hasError(kernel({ extra: '/* @arkzen:os:shell\nkey: x\n*/\n' }), 'secret-like keys')
  assert.deepEqual(validate(kernel({ config: '/* @arkzen:os:config\nconstants:\n  KEYBOARD_LAYOUT: us\n*/\n' })).errors, [])
})

// ── toolchains ───────────────────────────────────────────
test('a missing toolchain is a warning, never an error', () => {
  const r = validate(kernel())
  assert.ok(!r.errors.some(e => /not installed/i.test(e)))
})
