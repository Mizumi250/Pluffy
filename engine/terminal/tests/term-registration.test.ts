// Step 1 of the terminal plan: the `term` block family is registered in the parser and validator.
// Run with `npm test` in engine/terminal (it syncs the shared files first).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as os from 'node:os'
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

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-term-'))
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
const project = (extra = '', head = 'mode: cli\nruntimes: [ts]\n') => `/* @arkzen:term:project\nname: t\nbinary: t\n${head}${extra}*/\n`
const CMD = '/* @arkzen:term:command:run\ndescription: Run\n*/\n'
const HANDLER = '/* @arkzen:term:handler:ts:run */\nexport default function run() {}\n/* @arkzen:term:handler:ts:run:end */\n'
const BASE = META + project() + CMD + HANDLER

function validate(source: string, assets: Record<string, string> = {}) {
  return quiet(() => validateTatemono(write(source, assets)))
}

// ── fixtures ─────────────────────────────────────────────
for (const name of ['term-todo-cli', 'term-create-site', 'term-shelf', 'term-snake']) {
  test(`fixture ${name} validates with no errors`, () => {
    const r = quiet(() => validateTatemono(path.join(TATEMONOS, name, 'core.tsx')))
    assert.deepEqual(r.errors, [])
    assert.equal(r.valid, true)
  })
}

test('term-todo-cli parses into the expected shape', () => {
  const p = quiet(() => parseTatemono(path.join(TATEMONOS, 'term-todo-cli', 'core.tsx')))
  assert.ok(p.term)
  assert.equal(p.ext, undefined)
  assert.deepEqual(p.term.commands.map(c => c.name), ['add', 'list', 'tag', 'tag.add', 'version'])
  assert.deepEqual(p.term.handlers.map(h => `${h.lang}:${h.name}`), ['ts:add', 'ts:list', 'ts:tag.add'])
  assert.equal(p.term.runtimes[0].lang, 'ts')
  assert.equal(p.term.scripts.length, 1)
  assert.equal(p.term.tests.length, 1)
  assert.match(p.term.readme?.raw ?? '', /^# todo/)
  assert.match(p.term.handlers[0].raw, /out\.line\(`added:/)
  assert.equal((p.term.handlers[1].header as Record<string, unknown>).async, true)
})

test('an unnamed keymap has no name and a named one keeps it', () => {
  const snake = quiet(() => parseTatemono(path.join(TATEMONOS, 'term-snake', 'core.tsx')))
  assert.equal(snake.term?.keymaps[0].name, undefined)
  const shelf = quiet(() => parseTatemono(path.join(TATEMONOS, 'term-shelf', 'core.tsx')))
  assert.equal(shelf.term?.keymaps[0].name, 'main')
})

test('a tatemono with no term block gets no term field, and ext is untouched', () => {
  const web = quiet(() => parseTatemono(write(META + '/* @arkzen:web:page:index */\nexport default function P() { return null }\n/* @arkzen:web:page:index:end */\n')))
  assert.equal('term' in web, false)
  const ext = quiet(() => parseTatemono(path.join(TATEMONOS, 'ext-tab-notes', 'core.tsx')))
  assert.ok(ext.ext)
  assert.equal('term' in ext, false)
})

test('every existing tatemono that parses outside term-* has no term field', () => {
  for (const dir of fs.readdirSync(TATEMONOS)) {
    if (dir.startsWith('term-')) continue
    const file = path.join(TATEMONOS, dir, 'core.tsx')
    if (!fs.existsSync(file)) continue
    let parsed
    try { parsed = quiet(() => parseTatemono(file)) } catch { continue }   // some game tatemonos fail to parse for reasons that predate this family
    assert.equal('term' in parsed, false, `${dir} unexpectedly has a term field`)
  }
})

test('a marker inside a template literal is not read as a block', () => {
  const src = BASE + '/* @arkzen:term:script:ts:demo */\nexport const demo = `/* @arkzen:term:command:ghost\\ndescription: x\\n*/`\n/* @arkzen:term:script:ts:demo:end */\n'
  const p = quiet(() => parseTatemono(write(src)))
  assert.deepEqual(p.term?.commands.map(c => c.name), ['run'])
})

test('a block named end is not mistaken for a closer', () => {
  const src = BASE + '/* @arkzen:term:command:end\ndescription: ends things\nbuiltin: help\n*/\n'
  const p = quiet(() => parseTatemono(write(src)))
  assert.deepEqual(p.term?.commands.map(c => c.name), ['run', 'end'])
})

test('a handler for a dotted command parses with its closer', () => {
  const src = META + project() + '/* @arkzen:term:command:db\nbuiltin: help\n*/\n/* @arkzen:term:command:db.migrate\ndescription: Migrate\n*/\n'
    + '/* @arkzen:term:handler:ts:db.migrate\ncommand: db.migrate\n*/\nexport default function m() {}\n/* @arkzen:term:handler:ts:db.migrate:end */\n'
  const r = validate(src)
  assert.deepEqual(r.errors, [])
})

// ── parser errors ────────────────────────────────────────
function parseError(source: string): string {
  try { quiet(() => parseTatemono(write(source))) } catch (e) { return e instanceof Error ? e.message : String(e) }
  return ''
}

test('parser: unknown block, language, arity and duplicates', () => {
  assert.match(parseError(BASE + '/* @arkzen:term:comand:x\n*/\n'), /DSL Error/)   // the tag pre-check reports a typo before the parser runs
  assert.match(parseError(BASE + '/* @arkzen:term:handler:cobol:run */\nx\n/* @arkzen:term:handler:cobol:run:end */\n'), /unknown language "cobol"/)
  assert.match(parseError(BASE + '/* @arkzen:term:command\n*/\n'), /is incomplete/)
  assert.match(parseError(BASE + '/* @arkzen:term:handler:ts */\nx\n/* @arkzen:term:handler:ts:end */\n'), /is incomplete/)
  assert.match(parseError(BASE + '/* @arkzen:term:config:extra\n*/\n'), /takes no name/)
  assert.match(parseError(BASE + '/* @arkzen:term:project\nname: t\n*/\n'), /Only one @arkzen:term:project/)
  assert.match(parseError(BASE + '/* @arkzen:term:keymap\nactions:\n  a: [x]\n*/\n/* @arkzen:term:keymap\nactions:\n  b: [y]\n*/\n'), /Only one unnamed @arkzen:term:keymap/)
})

test('parser: missing closer, bad YAML and non-mapping header', () => {
  assert.match(parseError(META + project() + '/* @arkzen:term:handler:ts:run */\nexport default function run() {}\n'), /DSL Error|missing its closing/)
  assert.match(parseError(BASE + '/* @arkzen:term:command:bad\ndescription: [unclosed\n*/\n'), /invalid YAML/)
  assert.match(parseError(BASE + '/* @arkzen:term:view:ts:v\n- not\n- a mapping\n*/\nx\n/* @arkzen:term:view:ts:v:end */\n'), /header must be a YAML mapping/)
})

// ── validator contracts ──────────────────────────────────
function expectError(label: string, source: string, pattern: RegExp, assets: Record<string, string> = {}): void {
  test(`validator rejects: ${label}`, () => {
    const r = validate(source, assets)
    assert.equal(r.valid, false, `expected invalid, got valid. warnings: ${r.warnings.join(' | ')}`)
    assert.ok(r.errors.some(e => pattern.test(e)), `no error matched ${pattern}. errors: ${r.errors.join(' | ')}`)
  })
}
function expectWarning(label: string, source: string, pattern: RegExp): void {
  test(`validator warns: ${label}`, () => {
    const r = validate(source)
    assert.deepEqual(r.errors, [])
    assert.ok(r.warnings.some(w => pattern.test(w)), `no warning matched ${pattern}. warnings: ${r.warnings.join(' | ')}`)
  })
}

test('the minimal base is valid', () => {
  const r = validate(BASE)
  assert.deepEqual(r.errors, [])
})

// project
expectError('no project block', META + CMD + HANDLER, /@arkzen:term:project is required/)
expectError('uppercase binary', META + project().replace('binary: t', 'binary: My Tool') + CMD + HANDLER, /binary "My Tool" must be lowercase/)
expectError('missing binary', META + project().replace('binary: t\n', '') + CMD + HANDLER, /needs a binary/)
expectError('bad semver', META + project('version: 1.0.0.0\n') + CMD + HANDLER, /not semver/)
expectError('meta version is checked when project has none', BASE.replace('version: 1.0.0', 'version: one'), /not semver/)
expectError('missing mode', META + project('', 'runtimes: [ts]\n') + CMD + HANDLER, /needs mode/)
expectError('unknown mode', META + project('', 'mode: gui\nruntimes: [ts]\n') + CMD + HANDLER, /mode must be one of/)
expectError('empty runtimes', META + project('', 'mode: cli\nruntimes: []\n') + CMD, /needs runtimes/)
expectError('unknown runtime language', META + project('', 'mode: cli\nruntimes: [ts, cobol]\n') + CMD + HANDLER, /unknown language "cobol"/)
expectError('duplicate runtime language', META + project('', 'mode: cli\nruntimes: [ts, ts]\n') + CMD + HANDLER, /lists "ts" twice/)
expectError('non-spdx license text', META + project('license: not a license!\n') + CMD + HANDLER, /not a valid SPDX/)
expectError('bad tui_flag', META + project('tui_flag: tui\n', 'mode: hybrid\nruntimes: [ts]\n') + CMD + HANDLER + '/* @arkzen:term:screen:main\npanes:\n  - widget: text\n*/\n', /tui_flag must be a long flag/)
expectError('default_command that does not exist', META + project('default_command: nope\n') + CMD + HANDLER, /default_command "nope"/)
expectWarning('license outside the common list', BASE.replace('binary: t\n', 'binary: t\nlicense: Zed-9.9\n'), /not in the common SPDX list/)
expectWarning('a misspelled project key', BASE.replace('binary: t\n', 'binary: t\nlicence: MIT\n'), /unknown key "licence"/)
expectWarning('cli with a TUI-only key', META + project('mouse: true\n') + CMD + HANDLER, /only applies to a TUI/)

// runtime
expectError('runtime block for an unlisted language', BASE + '/* @arkzen:term:runtime:py\nframework: typer\n*/\n', /"py" is not listed/)
expectError('duplicate runtime block', BASE + '/* @arkzen:term:runtime:ts\nframework: commander\n*/\n/* @arkzen:term:runtime:ts\nframework: commander\n*/\n', /Duplicate @arkzen:term:runtime:ts/)
expectError('tui framework with tui false', BASE + '/* @arkzen:term:runtime:ts\nframework: ink\ntui: false\n*/\n', /TUI framework but tui is false/)
expectError('cli framework with tui true', BASE.replace('mode: cli', 'mode: hybrid') + '/* @arkzen:term:runtime:ts\nframework: commander\ntui: true\n*/\n/* @arkzen:term:screen:main\npanes:\n  - widget: text\n*/\n', /only parses commands/)
expectError('a tui framework on a cli project', BASE + '/* @arkzen:term:runtime:ts\nframework: ink\n*/\n', /draws a terminal UI, but .* mode is cli/)
expectError('a cli-only framework on a tui project', META + project('', 'mode: tui\nruntimes: [ts]\n') + '/* @arkzen:term:screen:main\npanes:\n  - widget: text\n*/\n/* @arkzen:term:runtime:ts\nframework: commander\n*/\n', /only parses commands, but .* mode is tui/)
expectError('tui true on a cli project', BASE + '/* @arkzen:term:runtime:ts\ntui: true\n*/\n', /mode is cli/)
expectError('zipapp outside python', BASE + '/* @arkzen:term:runtime:ts\nbundle: zipapp\n*/\n', /zipapp only applies to py/)
expectError('bad rust edition', META + project('', 'mode: cli\nruntimes: [rs]\n') + CMD + '/* @arkzen:term:runtime:rs\nedition: next\n*/\n' + '/* @arkzen:term:handler:rs:run */\nfn run() {}\n/* @arkzen:term:handler:rs:run:end */\n', /edition must be a year/)
expectWarning('an unverified framework', BASE + '/* @arkzen:term:runtime:ts\nframework: yargs\n*/\n', /not one of the verified choices/)

// commands
expectError('duplicate command', BASE + CMD, /Duplicate @arkzen:term:command:run/)
expectError('bad command name', BASE + '/* @arkzen:term:command:Bad_Name\nbuiltin: help\n*/\n', /name must be lowercase kebab-case/)
expectError('dotted command with no parent', BASE + '/* @arkzen:term:command:db.migrate\nbuiltin: help\n*/\n', /parent command "db" is not declared/)
expectError('required arg after optional', BASE.replace(CMD, '/* @arkzen:term:command:run\nargs:\n  - name: a\n  - name: b\n    required: true\n*/\n'), /required argument cannot follow an optional one/)
expectError('arg after variadic', BASE.replace(CMD, '/* @arkzen:term:command:run\nargs:\n  - name: a\n    variadic: true\n  - name: b\n*/\n'), /no argument may follow the variadic/)
expectError('choice type without choices', BASE.replace(CMD, '/* @arkzen:term:command:run\nflags:\n  - name: mode\n    type: choice\n*/\n'), /needs choices/)
expectError('choices on a non-choice type', BASE.replace(CMD, '/* @arkzen:term:command:run\nflags:\n  - name: mode\n    type: string\n    choices: [a]\n*/\n'), /choices only apply to type choice/)
expectError('default not in choices', BASE.replace(CMD, '/* @arkzen:term:command:run\nflags:\n  - name: mode\n    type: choice\n    choices: [a, b]\n    default: c\n*/\n'), /not one of the choices/)
expectError('default of the wrong type', BASE.replace(CMD, '/* @arkzen:term:command:run\nargs:\n  - name: n\n    type: int\n    default: "x"\n*/\n'), /default does not match type int/)
expectError('duplicate flag', BASE.replace(CMD, '/* @arkzen:term:command:run\nflags:\n  - name: v\n  - name: v\n*/\n'), /duplicate flag "--v"/)
expectError('duplicate short flag', BASE.replace(CMD, '/* @arkzen:term:command:run\nflags:\n  - name: aa\n    short: a\n  - name: bb\n    short: a\n*/\n'), /duplicate short flag "-a"/)
expectError('reserved help flag', BASE.replace(CMD, '/* @arkzen:term:command:run\nflags:\n  - name: help\n*/\n'), /"help" is reserved/)
expectError('lowercase env name', BASE.replace(CMD, '/* @arkzen:term:command:run\nflags:\n  - name: tok\n    env: token\n*/\n'), /env must be UPPER_SNAKE_CASE/)
expectError('bad builtin', BASE.replace(CMD, '/* @arkzen:term:command:run\nbuiltin: banner\n*/\n'), /builtin must be one of/)
expectError('bad example exit code', BASE.replace(CMD, '/* @arkzen:term:command:run\nexamples:\n  - cmd: run\n    expect_exit: 300\n*/\n'), /expect_exit must be 0-255/)
expectError('alias that collides with a command', BASE + '/* @arkzen:term:command:go\nbuiltin: help\naliases: [run]\n*/\n', /collides with the command/)
expectError('command with an unknown prompt', BASE.replace(CMD, '/* @arkzen:term:command:run\nprompt: ghost\n*/\n'), /prompt "ghost" is not declared/)

// handlers
expectError('command with no handler', META + project() + CMD, /has no @arkzen:term:handler:ts:run/)
expectError('handler for a missing command', BASE + '/* @arkzen:term:handler:ts:ghost */\nexport default function g() {}\n/* @arkzen:term:handler:ts:ghost:end */\n', /no @arkzen:term:command:ghost/)
expectError('handler language not in runtimes', BASE + '/* @arkzen:term:handler:py:run */\ndef run(): pass\n/* @arkzen:term:handler:py:run:end */\n', /"py" is not listed/)
expectError('ts handler without a default export', BASE.replace('export default function run() {}', 'export function run() {}'), /must `export default`/)
expectError('a second runtime without its handler', META + project('', 'mode: cli\nruntimes: [ts, py]\n') + CMD + HANDLER, /has no @arkzen:term:handler:py:run/)
expectWarning('handler on a builtin command', BASE.replace(CMD, '/* @arkzen:term:command:run\nbuiltin: help\n*/\n'), /handler is never called/)

// Pluffy imports
expectError('ts handler importing Pluffy', BASE.replace('export default function run() {}', "import { x } from '@/arkzen/core/parser'\nexport default function run() {}"), /imports from Pluffy/)
expectError('ts script importing the pluffy package', BASE + "/* @arkzen:term:script:ts:s */\nimport p from 'pluffy'\n/* @arkzen:term:script:ts:s:end */\n", /imports from Pluffy/)
expectError('python importing arkzen', META + project('', 'mode: cli\nruntimes: [py]\n') + CMD + '/* @arkzen:term:handler:py:run */\nfrom arkzen import thing\n/* @arkzen:term:handler:py:run:end */\n', /imports from Pluffy/)
expectError('rust using pluffy', META + project('', 'mode: cli\nruntimes: [rs]\n') + CMD + '/* @arkzen:term:handler:rs:run */\nuse pluffy::x;\n/* @arkzen:term:handler:rs:run:end */\n', /imports from Pluffy/)

// prompts
const withPrompt = (steps: string, extra = '') => BASE.replace(CMD, `/* @arkzen:term:command:run\nprompt: p\n*/\n/* @arkzen:term:prompt:p\nsteps:\n${steps}${extra}*/\n`)
expectError('prompt without steps', BASE.replace(CMD, '/* @arkzen:term:command:run\nprompt: p\n*/\n/* @arkzen:term:prompt:p\nresult: a\n*/\n'), /needs steps/)
expectError('select step without choices', withPrompt('  - id: a\n    type: select\n    message: m\n'), /needs choices/)
expectError('duplicate step id', withPrompt('  - id: a\n    type: text\n    message: m\n  - id: a\n    type: text\n    message: n\n'), /duplicate step id "a"/)
expectError('unknown step type', withPrompt('  - id: a\n    type: dial\n    message: m\n'), /type must be one of/)
expectError('step without a message', withPrompt('  - id: a\n    type: text\n'), /needs a message/)
expectError('when pointing at a later step', withPrompt('  - id: a\n    type: text\n    message: m\n    when:\n      b: x\n  - id: b\n    type: text\n    message: n\n'), /not an earlier step id/)
expectError('invalid validate regex', withPrompt('  - id: a\n    type: text\n    message: m\n    validate:\n      regex: "("\n'), /not a valid regular expression/)
expectError('fallback for an unknown step', withPrompt('  - id: a\n    type: text\n    message: m\n', 'fallback:\n  zzz:\n    flag: --zzz\n'), /"zzz" is not a step id/)
expectWarning('a prompt no command uses', BASE + '/* @arkzen:term:prompt:orphan\nsteps:\n  - id: a\n    type: text\n    message: m\n*/\n', /not used by any @arkzen:term:command/)

// assets
const SCAFFOLD = (assets: string) => META + project() + '/* @arkzen:term:prompt:p\nsteps:\n  - id: name\n    type: text\n    message: m\n*/\n/* @arkzen:term:command:make\nprompt: p\n*/\n' + `/* @arkzen:term:assets\n${assets}*/\n`
test('a prompt plus templates needs no handler', () => {
  const r = validate(SCAFFOLD('templates:\n  - source: t.txt\n    target: "{{name}}/t.txt"\n    variables: [name]\n'), { 't.txt': 'hi' })
  assert.deepEqual(r.errors, [])
})
expectError('template source that does not exist', SCAFFOLD('templates:\n  - source: nope.txt\n    target: "{{name}}"\n    variables: [name]\n'), /source "nope.txt" does not exist/)
expectError('template target using an undeclared variable', SCAFFOLD('templates:\n  - source: t.txt\n    target: "{{other}}/t.txt"\n    variables: [name]\n'), /uses \{\{other\}\} but variables does not list it/, { 't.txt': 'hi' })
expectError('include glob matching nothing', SCAFFOLD('include: ["levels/*.txt"]\ntemplates:\n  - source: t.txt\n    target: "{{name}}"\n    variables: [name]\n'), /matches no file/, { 't.txt': 'hi' })
expectError('a prompt command with no templates and no handler', META + project() + '/* @arkzen:term:prompt:p\nsteps:\n  - id: name\n    type: text\n    message: m\n*/\n/* @arkzen:term:command:make\nprompt: p\n*/\n', /has no @arkzen:term:handler:ts:make/)

// config and theme
expectError('bad config format', BASE + '/* @arkzen:term:config\nformat: ini\n*/\n', /format must be one of/)
expectError('lowercase env prefix', BASE + '/* @arkzen:term:config\nenv_prefix: todo_\n*/\n', /env_prefix must be UPPER_SNAKE_CASE/)
expectError('bad theme color', BASE + '/* @arkzen:term:theme\npalette:\n  a: "#12"\n*/\n', /not a valid color/)
expectError('unknown theme role', BASE + '/* @arkzen:term:theme\nroles:\n  loud: red\n*/\n', /unknown role "loud"/)
expectError('role pointing at a missing palette name', BASE + '/* @arkzen:term:theme\npalette:\n  a: "#112233"\nroles:\n  primary: ghost\n*/\n', /"ghost" is not a valid color/)
expectError('bad border', BASE + '/* @arkzen:term:theme\nborder: wavy\n*/\n', /border must be one of/)
expectError('fallback that is not an ANSI name', BASE + '/* @arkzen:term:theme\nfallback:\n  primary: "#fff"\n*/\n', /must be one of the 16 ANSI names/)

// export
expectError('unknown export platform', BASE + '/* @arkzen:term:export\nplatforms: [beos-x64]\n*/\n', /unknown platform/)
expectError('npm_bin without a ts runtime', META + project('', 'mode: cli\nruntimes: [py]\n') + CMD + '/* @arkzen:term:handler:py:run */\ndef run(): pass\n/* @arkzen:term:handler:py:run:end */\n/* @arkzen:term:export\nformats: [npm_bin]\n*/\n', /"npm_bin" needs the "ts" runtime/)
expectError('unknown completion shell', BASE + '/* @arkzen:term:export\ncompletions: [tcsh]\n*/\n', /unknown shell/)
expectWarning('several platforms on a runtime that cannot cross-compile', BASE + '/* @arkzen:term:export\nplatforms: [linux-x64, windows-x64]\n*/\n', /cannot cross-compile/)

// keymap, data, screen, loop, view
const SCREEN = '/* @arkzen:term:screen:main\npanes:\n  - widget: text\n*/\n'
const TUI = (extra: string) => META + project('', 'mode: tui\nruntimes: [ts]\n') + extra
expectError('cli project with a screen', BASE + SCREEN, /screen blocks need .* mode tui or hybrid/)
expectError('tui with no screen, view or loop', META + project('', 'mode: tui\nruntimes: [ts]\n'), /needs at least one @arkzen:term:screen/)
expectError('hybrid with no commands', TUI(SCREEN).replace('mode: tui', 'mode: hybrid'), /needs at least one @arkzen:term:command/)
expectError('keymap key bound twice', TUI(SCREEN + '/* @arkzen:term:keymap:main\nactions:\n  a: [x]\n  b: [x]\n*/\n'), /key "x" is bound to both/)
expectError('keymap with an unknown scope', TUI(SCREEN + '/* @arkzen:term:keymap:other\nactions:\n  a: [x]\n*/\n'), /scope "other" is neither "global" nor a declared/)
expectError('keymap without actions', TUI(SCREEN + '/* @arkzen:term:keymap:main\nvim: true\n*/\n'), /needs actions/)
expectError('two keymaps with one scope', TUI(SCREEN + '/* @arkzen:term:keymap:main\nactions:\n  a: [x]\n*/\n/* @arkzen:term:keymap:alt\nscope: main\nactions:\n  b: [y]\n*/\n'), /scope "main" is already used/)
expectError('table widget with no data', TUI('/* @arkzen:term:screen:main\npanes:\n  - widget: table\n*/\n'), /table widget needs data/)
expectError('table widget with unknown data', TUI('/* @arkzen:term:screen:main\npanes:\n  - widget: table\n    data: ghost\n*/\n'), /table widget needs data/)
expectError('unknown widget kind', TUI('/* @arkzen:term:screen:main\npanes:\n  - widget: carousel\n*/\n'), /widget must be one of/)
expectError('pane keymap that does not exist', TUI('/* @arkzen:term:screen:main\npanes:\n  - widget: text\n    keymap: ghost\n*/\n'), /keymap "ghost" matches no/)
expectError('pane columns not in the data', TUI('/* @arkzen:term:data:d\nfields:\n  - name: a\n    type: string\n*/\n/* @arkzen:term:screen:main\npanes:\n  - widget: table\n    data: d\n    columns: [a, zz]\n*/\n'), /"zz" is not a field/)
expectError('screen size length mismatch', TUI('/* @arkzen:term:screen:main\nsize: [1, 2, 3]\npanes:\n  - widget: text\n*/\n'), /lists 3 weights for 1 pane/)
expectError('two panes with one focus order', TUI('/* @arkzen:term:screen:main\npanes:\n  - widget: text\n    focus: 1\n  - widget: text\n    focus: 1\n*/\n'), /focus order 1 is used by more than one pane/)
expectError('on_start hook that matches nothing', TUI('/* @arkzen:term:screen:main\non_start: ghost\npanes:\n  - widget: text\n*/\n'), /on_start "ghost" matches no/)
expectError('data without fields', TUI(SCREEN + '/* @arkzen:term:data:d\nstorage: json\n*/\n'), /needs fields/)
expectError('data field with a bad type', TUI(SCREEN + '/* @arkzen:term:data:d\nfields:\n  - name: a\n    type: blob\n*/\n'), /type must be one of/)
expectError('data field named id with auto id', TUI(SCREEN + '/* @arkzen:term:data:d\nfields:\n  - name: id\n    type: int\n*/\n'), /collides with the generated id/)
expectError('data seed with an unknown field', TUI(SCREEN + '/* @arkzen:term:data:d\nfields:\n  - name: a\n    type: string\nseed:\n  - zz: 1\n*/\n'), /"zz" is not a declared field/)
expectError('data seed missing a required field', TUI(SCREEN + '/* @arkzen:term:data:d\nfields:\n  - name: a\n    type: string\n    required: true\nseed:\n  - {}\n*/\n'), /required field "a" is missing/)
expectError('data sort on an unknown field', TUI(SCREEN + '/* @arkzen:term:data:d\nsort: -zz\nfields:\n  - name: a\n    type: string\n*/\n'), /sort "-zz" is not a declared field/)
expectWarning('sqlite storage', TUI(SCREEN + '/* @arkzen:term:data:d\nstorage: sqlite\nfields:\n  - name: a\n    type: string\n*/\n'), /sqlite .* unverified/)
const LOOP = '/* @arkzen:term:loop:g\ntick_rate: 10\n*/\n'
const LOOP_VIEW = '/* @arkzen:term:view:ts:g\nkind: loop\n*/\nexport function init() {}\nexport function update() {}\nexport function draw() {}\n/* @arkzen:term:view:ts:g:end */\n'
test('a loop with its view is a valid tui with no screen', () => {
  assert.deepEqual(validate(TUI(LOOP + LOOP_VIEW)).errors, [])
})
expectError('loop without a view for the runtime', TUI(LOOP), /has no @arkzen:term:view:ts:g with kind: loop/)
expectError('loop view missing a contract function', TUI(LOOP + LOOP_VIEW.replace('export function draw() {}\n', '')), /must export `draw`/)
expectError('loop with no tick_rate', TUI('/* @arkzen:term:loop:g\nrender: full\n*/\n' + LOOP_VIEW), /needs tick_rate/)
expectError('loop in a cli project', META + project() + CMD + HANDLER + LOOP + LOOP_VIEW, /mode must be tui or hybrid/)
expectError('loop view with no loop block', TUI(SCREEN + LOOP_VIEW), /has no @arkzen:term:loop:g/)
expectError('widget view without a screen', TUI(SCREEN + '/* @arkzen:term:view:ts:w\nkind: widget\n*/\nexport default function W() { return null }\n/* @arkzen:term:view:ts:w:end */\n'), /kind: widget needs screen:/)
expectError('view without a kind', TUI(SCREEN + '/* @arkzen:term:view:ts:w */\nexport default function W() { return null }\n/* @arkzen:term:view:ts:w:end */\n'), /needs kind:/)
expectError('view attached to an unknown screen', TUI(SCREEN + '/* @arkzen:term:view:ts:w\nkind: widget\nscreen: ghost\n*/\nexport default function W() { return null }\n/* @arkzen:term:view:ts:w:end */\n'), /screen "ghost" is not declared/)

// misc
expectError('duplicate script name', BASE + '/* @arkzen:term:script:ts:s */\nexport const a = 1\n/* @arkzen:term:script:ts:s:end */\n/* @arkzen:term:script:ts:s */\nexport const b = 2\n/* @arkzen:term:script:ts:s:end */\n', /Duplicate @arkzen:term:script:ts:s/)
expectWarning('readme with header keys', BASE + '/* @arkzen:term:readme\ntitle: x\n*/\n# hi\n/* @arkzen:term:readme:end */\n', /readme takes no header keys/)

// ── globs contain "*/" inside a YAML string ──────────────
test('an assets glob such as **/*.txt does not end the YAML header early', () => {
  const src = META + project() + '/* @arkzen:term:assets\ninclude: ["**/*.txt"]\n*/\n' + CMD + HANDLER
  const r = validate(src, { 'levels/one.txt': 'x', 'levels/deep/two.txt': 'y' })
  assert.deepEqual(r.errors, [])
  const p = quiet(() => parseTatemono(write(src, { 'levels/one.txt': 'x' })))
  assert.deepEqual((p.term?.assets?.data as { include: string[] }).include, ['**/*.txt'])
})

test('the scaffold scanner reads the same header for a glob containing */', async () => {
  const { scanSource } = await import('../../../scaffold.js')
  const model = scanSource(META + project() + '/* @arkzen:term:assets\ninclude: ["**/*.txt"]\n*/\n')
  const assets = model.openers.find((o: { family: string }) => o.family === 'term:assets')
  assert.ok(assets)
  assert.equal(assets.closed, true)
  assert.match(assets.yaml, /\*\*\/\*\.txt/)
})
