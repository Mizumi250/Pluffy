// Tests for the extension emitter. Run: npm test   (inside engine/frontend/wxt)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { syncShared } from '../sync'

syncShared()
const { parseTatemono } = await import('./parser')
const { validateTatemono } = await import('./validator')
const { emitExtension, writeEmit, hoistImports, ExtEmitError } = await import('./ext-router')

const STACK_DIR = path.resolve(import.meta.dirname, '..', '..')
const REPO_DIR  = path.resolve(STACK_DIR, '..', '..', '..')
const TMP       = fs.mkdtempSync(path.join(os.tmpdir(), 'arkzen-ext-'))
let counter = 0

const quiet = <T>(fn: () => T): T => {
  const log = console.log
  console.log = () => {}
  try { return fn() } finally { console.log = log }
}

/** Writes a tatemono (and optional asset files) to a temp folder and parses it with the real parser. */
function load(src: string, assets: string[] = []) {
  const dir = path.join(TMP, `t${++counter}`)
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true })
  for (const a of assets) {
    fs.mkdirSync(path.dirname(path.join(dir, 'assets', a)), { recursive: true })
    fs.writeFileSync(path.join(dir, 'assets', a), 'png')
  }
  const file = path.join(dir, 'core.tsx')
  fs.writeFileSync(file, src)
  return { file, dir, parsed: quiet(() => parseTatemono(file)), assetsDir: path.join(dir, 'assets') }
}

const META    = `/* @arkzen:meta\nname: case\nversion: 1.0.0\ndescription: A test\nauth: false\n*/\n`
const PROJECT = (extra = '') => `/* @arkzen:ext:project\nname: Case\n${extra}*/\n`
const POPUP   = `/* @arkzen:ext:popup */\nexport default function Popup() { return <main>Hi</main> }\n/* @arkzen:ext:popup:end */\n`
const page = (name: string, header: string, body = 'export default function P() { return <main/> }') =>
  `/* @arkzen:ext:page:${name}\n${header}\n*/\n${body}\n/* @arkzen:ext:page:${name}:end */\n`

const emit = (src: string, assets: string[] = []) => {
  const t = load(src, assets)
  return emitExtension(t.parsed, { assetsDir: t.assetsDir })
}
const fileOf = (e: ReturnType<typeof emit>, p: string) => e.files.find(f => f.path === p)
const paths = (e: ReturnType<typeof emit>) => e.files.map(f => f.path).sort()

// ── golden: the emitter must reproduce the hand-written reference (verified in Chrome) ──

test('ext-tab-notes: entrypoints are byte-identical to reference/ext-tab-notes', () => {
  const core = path.join(REPO_DIR, 'tatemonos', 'ext-tab-notes', 'core.tsx')
  const e = emitExtension(quiet(() => parseTatemono(core)), { assetsDir: path.join(path.dirname(core), 'assets') })
  const refDir = path.join(STACK_DIR, 'reference', 'ext-tab-notes')
  const entry = e.files.filter(f => f.path.startsWith('entrypoints/'))
  assert.equal(entry.length, 5)
  for (const f of entry) {
    const ref = fs.readFileSync(path.join(refDir, f.path), 'utf8')
    assert.equal(f.content, ref, `${f.path} differs from the reference`)
  }
  assert.deepEqual(e.manifest, JSON.parse(fs.readFileSync(path.join(refDir, 'manifest.json'), 'utf8')))
})

test('ext-tab-notes: validates', () => {
  const core = path.join(REPO_DIR, 'tatemonos', 'ext-tab-notes', 'core.tsx')
  const r = quiet(() => validateTatemono(core))
  assert.equal(r.valid, true)
})

// ── hoistImports ──

test('hoistImports: single, multi-line, side-effect, and non-import lines', () => {
  const body = [
    "import { a } from 'x'",
    'import {',
    '  b,',
    '  c,',
    "} from 'y'",
    "import './side.css'",
    "import * as z from \"z\";",
    'const keep = 1',
    '  import notHoisted', // indented: not an import statement at column 0
  ].join('\n')
  const { imports, rest } = hoistImports(body)
  assert.equal(imports.length, 4)
  assert.equal(imports[1], "import {\n  b,\n  c,\n} from 'y'")
  assert.equal(rest, 'const keep = 1\n  import notHoisted')
})

// ── background ──

test('background: wraps the body, hoists imports, indents, keeps blank lines empty', () => {
  const e = emit(META + PROJECT() + `/* @arkzen:ext:background\ntype: module\n*/\nimport { x } from 'x'\n\nconst a = 1\n\nfunction f() {\n  return a\n}\n/* @arkzen:ext:background:end */\n`)
  assert.equal(fileOf(e, 'entrypoints/background.ts')!.content,
`import { defineBackground } from 'wxt/utils/define-background'
import { x } from 'x'

export default defineBackground({
  type: 'module',
  main() {
    const a = 1

    function f() {
      return a
    }
  },
})
`)
})

test('background: export is rejected', () => {
  assert.throws(() => emit(META + PROJECT() + `/* @arkzen:ext:background */\nexport const x = 1\n/* @arkzen:ext:background:end */\n`), /cannot use `export`/)
})

// ── popup ──

test('popup: header title, size and no size', () => {
  const sized = emit(META + PROJECT() + `/* @arkzen:ext:popup\nwidth: 300\nheight: 200\ntitle: My <Popup> & co\n*/\nexport default function P() { return <main/> }\n/* @arkzen:ext:popup:end */\n`)
  assert.match(fileOf(sized, 'entrypoints/popup/index.html')!.content!, /<title>My &lt;Popup&gt; &amp; co<\/title>/)
  assert.match(fileOf(sized, 'entrypoints/popup/style.css')!.content!, /width: 300px;\n  height: 200px;\n  margin: 0;/)
  const widthOnly = emit(META + PROJECT() + `/* @arkzen:ext:popup\nwidth: 300\n*/\nexport default function P() { return <main/> }\n/* @arkzen:ext:popup:end */\n`)
  const css = fileOf(widthOnly, 'entrypoints/popup/style.css')!.content!
  assert.match(css, /width: 300px;/)
  assert.doesNotMatch(css, /height:/)
  const plain = emit(META + PROJECT() + POPUP)
  assert.doesNotMatch(fileOf(plain, 'entrypoints/popup/style.css')!.content!, /width|height|margin/)
  assert.match(fileOf(plain, 'entrypoints/popup/index.html')!.content!, /<title>Case<\/title>/)
})

test('popup title: ext:popup title, then project action.default_title, then the extension name', () => {
  const title = (src: string) => /<title>(.*)<\/title>/.exec(fileOf(emit(src), 'entrypoints/popup/index.html')!.content!)![1]
  const popup = (header: string) => `/* @arkzen:ext:popup\n${header}*/\nexport default function P() { return <main/> }\n/* @arkzen:ext:popup:end */\n`
  assert.equal(title(META + PROJECT('action:\n  default_title: From action\n') + popup('title: From popup\n')), 'From popup')
  assert.equal(title(META + PROJECT('action:\n  default_title: From action\n') + popup('width: 300\n')), 'From action')
  assert.equal(title(META + PROJECT() + popup('width: 300\n')), 'Case')
})

test('every surface css keeps the @source line (Tailwind skips gitignored folders otherwise)', () => {
  const e = emit(META + PROJECT() + POPUP + page('welcome', 'role: standalone'))
  for (const f of e.files.filter(f => f.path.endsWith('style.css'))) assert.match(f.content!, /@source "\.\/";/)
})

// ── manifest ──

test('manifest: project keys, csp string, omnibox, minimum_chrome_version as string, manifest_extra deep merge', () => {
  const e = emit(META + PROJECT(
    `short_name: C\nauthor: Me\nhomepage_url: https://example.com\nminimum_chrome_version: 110\n` +
    `permissions: [storage]\noptional_permissions: [tabs]\nhost_permissions: ["https://a.com/*"]\n` +
    `content_security_policy: "script-src 'self'"\nomnibox_keyword: cs\n` +
    `manifest_extra:\n  incognito: spanning\n  action:\n    default_title: Merged\n`) + POPUP)
  assert.deepEqual(e.manifest, {
    name: 'Case', short_name: 'C', version: '1.0.0', description: 'A test', author: 'Me', homepage_url: 'https://example.com',
    minimum_chrome_version: '110', permissions: ['storage'], optional_permissions: ['tabs'], host_permissions: ['https://a.com/*'],
    content_security_policy: { extension_pages: "script-src 'self'" }, omnibox: { keyword: 'cs' },
    incognito: 'spanning', action: { default_title: 'Merged' },
  })
})

test('manifest: project version and description override meta', () => {
  const e = emit(META + PROJECT('version: 2.5\ndescription: Mine\n') + POPUP)
  assert.equal(e.manifest.version, '2.5')
  assert.equal(e.manifest.description, 'Mine')
})

test('manifest: invalid version is rejected', () => {
  assert.throws(() => emit(META.replace('version: 1.0.0', 'version: v1') + PROJECT() + POPUP), /not valid/)
  assert.throws(() => emit(META + PROJECT('version: 1.2.3.4.5\n') + POPUP), /not valid/)
})

test('icons: copied to public/icons, referenced in manifest and action', () => {
  const e = emit(META + PROJECT('icons:\n  16: icon-16.png\n  128: assets/icons/big.png\naction:\n  default_title: Hi\n  default_icon: icon-16.png\n') + POPUP, ['icon-16.png', 'icons/big.png'])
  assert.deepEqual(e.manifest.icons, { '16': 'icons/icon-16.png', '128': 'icons/icons/big.png' })
  assert.deepEqual(e.manifest.action, { default_title: 'Hi', default_icon: 'icons/icon-16.png' })
  const icons = e.files.filter(f => f.copyFrom).map(f => f.path).sort()
  assert.deepEqual(icons, ['public/icons/icon-16.png', 'public/icons/icons/big.png'])   // icon-16 is copied once
})

// ── export block ──

test('export: defaults, zip name suffix, zip false', () => {
  const plain = emit(META + PROJECT() + POPUP)
  assert.deepEqual([plain.browsers, plain.zip, plain.zipName], [['chrome'], true, 'case'])
  const custom = emit(META + PROJECT() + POPUP + `/* @arkzen:ext:export\nbrowsers: [chrome]\nzip: false\nname_suffix: -dev\n*/\n`)
  assert.deepEqual([custom.zip, custom.zipName], [false, 'case-dev'])
})

test('export: chrome-only version drops other browsers with a warning, and fails when none is left', () => {
  const e = emit(META + PROJECT() + POPUP + `/* @arkzen:ext:export\nbrowsers: [chrome, firefox, edge]\n*/\n`)
  assert.deepEqual(e.browsers, ['chrome'])
  assert.ok(e.warnings.some(w => w.startsWith('firefox is not built yet')))
  assert.ok(e.warnings.some(w => w.startsWith('edge is not built yet')))
  assert.throws(() => emit(META + PROJECT() + POPUP + `/* @arkzen:ext:export\nbrowsers: [firefox]\n*/\n`), /Chrome only/)
  assert.throws(() => emit(META + PROJECT() + POPUP + `/* @arkzen:ext:export\nmanifest_version:\n  chrome: 2\n*/\n`), /Manifest V3 only/)
})

test('project targets are used when ext:export has no browsers', () => {
  const e = emit(META + PROJECT('targets: [chrome, firefox]\n') + POPUP)
  assert.deepEqual(e.browsers, ['chrome'])
  assert.ok(e.warnings.some(w => w.startsWith('firefox')))
})

// ── pages ──

test('pages: each role goes where WXT expects it', () => {
  const e = emit(META + PROJECT() +
    page('settings', 'role: options\nopen_in_tab: true') + page('home', 'role: newtab') + page('past', 'role: history') +
    page('marks', 'role: bookmarks') + page('lab', 'role: sandbox') + page('audio', 'role: offscreen\nreasons: [AUDIO_PLAYBACK]\njustification: Sounds') +
    page('welcome', 'role: standalone') + page('plain', ''))
  const dirs = [...new Set(e.files.filter(f => f.path.startsWith('entrypoints/')).map(f => f.path.split('/')[1]))].sort()
  assert.deepEqual(dirs, ['audio', 'bookmarks', 'history', 'lab.sandbox', 'newtab', 'options', 'plain', 'welcome'])
  assert.match(fileOf(e, 'entrypoints/options/index.html')!.content!, /<meta name="manifest.open_in_tab" content="true" \/>/)
  assert.doesNotMatch(fileOf(e, 'entrypoints/newtab/index.html')!.content!, /open_in_tab/)
  assert.equal(fileOf(e, 'entrypoints/welcome/Page.tsx')!.content, 'export default function P() { return <main/> }\n')
  assert.match(fileOf(e, 'entrypoints/welcome/main.tsx')!.content!, /import Page from '\.\/Page'/)
  assert.deepEqual(e.manifest.permissions, ['offscreen'])      // added for the offscreen page
})

test('pages: offscreen permission is not duplicated', () => {
  const e = emit(META + PROJECT('permissions: [offscreen, storage]\n') + page('audio', 'role: offscreen\nreasons: [AUDIO_PLAYBACK]\njustification: Sounds'))
  assert.deepEqual(e.manifest.permissions, ['offscreen', 'storage'])
})

test('pages: a name that WXT would treat as a special entrypoint is rejected', () => {
  assert.throws(() => emit(META + PROJECT() + page('devtools', 'role: standalone')), /WXT entrypoint name/)
  assert.throws(() => emit(META + PROJECT() + page('options', 'role: offscreen\nreasons: [DOM_PARSER]\njustification: x')), /WXT entrypoint name/)
  // but a slot role may use any name, because the folder is named after the role
  assert.doesNotThrow(() => emit(META + PROJECT() + page('options-page', 'role: options')))
})

test('pages: two pages for one folder are rejected', () => {
  assert.throws(() => emit(META + PROJECT() + page('a', 'role: options') + page('options', 'role: standalone')), /WXT entrypoint name|both be written/)
})

test('devtools-panel: generates the devtools page that registers the panels', () => {
  const e = emit(META + PROJECT('icons:\n  16: i.png\n') + page('inspector', 'role: devtools-panel\npanel_title: Inspector\npanel_icon: i.png') + page('other', 'role: devtools-panel'), ['i.png'])
  assert.equal(fileOf(e, 'entrypoints/devtools/main.ts')!.content,
`import { browser } from 'wxt/browser'

browser.devtools.panels.create("Inspector", "icons/i.png", "/inspector.html")
browser.devtools.panels.create("other", "", "/other.html")
`)
  assert.ok(fileOf(e, 'entrypoints/devtools/index.html'))
  assert.ok(fileOf(e, 'entrypoints/inspector/index.html'))
})

test('devtools-panel: with an own devtools page, it warns and does not generate one', () => {
  const e = emit(META + PROJECT() + page('dt', 'role: devtools') + page('inspector', 'role: devtools-panel'))
  assert.ok(e.warnings.some(w => w.includes('devtools page to register')))
  assert.equal(fileOf(e, 'entrypoints/devtools/main.ts'), undefined)
  assert.ok(fileOf(e, 'entrypoints/devtools/Page.tsx'))
})

// ── not emitted yet ──

test('blocks that are not emitted yet produce a warning each', () => {
  const e = emit(META + PROJECT('default_locale: en\napi:\n  base_url: https://example.com\n') + POPUP +
    `/* @arkzen:ext:sidepanel */\nexport default function S() { return <main/> }\n/* @arkzen:ext:sidepanel:end */\n` +
    `/* @arkzen:ext:content:c\nmatches: ["<all_urls>"]\nmode: script\n*/\nvoid 0\n/* @arkzen:ext:content:c:end */\n` +
    `/* @arkzen:ext:script:s */\nexport const a = 1\n/* @arkzen:ext:script:s:end */\n` +
    `/* @arkzen:ext:commands\n- id: _execute_action\n*/\n/* @arkzen:ext:menus\n- id: m\n  title: M\n*/\n` +
    `/* @arkzen:ext:rules\nrulesets:\n  - id: r\n    rules: []\n*/\n/* @arkzen:ext:locale:en\nmessages:\n  a:\n    message: A\n*/\n`)
  for (const tag of ['sidepanel', 'content', 'script', 'commands', 'menus', 'rules', 'locale']) {
    assert.ok(e.warnings.some(w => w.startsWith(`@arkzen:ext:${tag} is not emitted yet`)), tag)
  }
  assert.ok(e.warnings.some(w => w.startsWith('default_locale was left out')))
  assert.equal(e.manifest.default_locale, undefined)
  assert.ok(e.warnings.some(w => w.includes('api is not used yet')))
})

test('nothing to build is an error', () => {
  assert.throws(() => emit(META + PROJECT() + `/* @arkzen:ext:sidepanel */\nexport default function S() { return <main/> }\n/* @arkzen:ext:sidepanel:end */\n`), /Nothing to build/)
})

// ── writeEmit ──

test('writeEmit: writes files, copies icons, replaces its own previous output', () => {
  const stack = fs.mkdtempSync(path.join(TMP, 'stack-'))
  const first = emit(META + PROJECT('icons:\n  16: i.png\n') + POPUP, ['i.png'])
  writeEmit(first, stack)
  assert.ok(fs.existsSync(path.join(stack, 'entrypoints/popup/Popup.tsx')))
  assert.equal(fs.readFileSync(path.join(stack, 'public/icons/i.png'), 'utf8'), 'png')
  assert.ok(fs.existsSync(path.join(stack, 'arkzen/generated/.arkzen-generated')))

  const second = emit(META + PROJECT() + page('welcome', 'role: standalone'))
  writeEmit(second, stack)
  assert.ok(!fs.existsSync(path.join(stack, 'entrypoints/popup')), 'old popup removed')
  assert.ok(!fs.existsSync(path.join(stack, 'public')), 'old public removed')
  assert.ok(fs.existsSync(path.join(stack, 'entrypoints/welcome/Page.tsx')))
})

test('writeEmit: refuses to wipe a folder it did not write', () => {
  const stack = fs.mkdtempSync(path.join(TMP, 'stack-'))
  fs.mkdirSync(path.join(stack, 'entrypoints'), { recursive: true })
  fs.writeFileSync(path.join(stack, 'entrypoints', 'mine.ts'), 'keep me')
  assert.throws(() => writeEmit(emit(META + PROJECT() + POPUP), stack), (e: Error) => e instanceof ExtEmitError && /did not write/.test(e.message))
  assert.equal(fs.readFileSync(path.join(stack, 'entrypoints', 'mine.ts'), 'utf8'), 'keep me')
})

test('emitExtension: needs ext blocks', () => {
  const t = load(META + '/* @arkzen:web:page:index */\nexport default function P() { return <main/> }\n/* @arkzen:web:page:index:end */\n')
  assert.throws(() => emitExtension(t.parsed, { assetsDir: t.assetsDir }), /no @arkzen:ext blocks/)
})
