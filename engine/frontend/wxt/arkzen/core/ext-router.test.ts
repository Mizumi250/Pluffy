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

test('export: unsupported browsers are dropped with a warning, and it fails when none is left', () => {
  const e = emit(META + PROJECT() + POPUP + `/* @arkzen:ext:export\nbrowsers: [chrome, firefox, edge]\n*/\n`)
  assert.deepEqual(e.browsers, ['chrome', 'firefox'])
  assert.ok(e.warnings.some(w => w.startsWith('edge is not built yet')))
  assert.ok(!e.warnings.some(w => w.startsWith('firefox is not built yet')))
  assert.throws(() => emit(META + PROJECT() + POPUP + `/* @arkzen:ext:export\nbrowsers: [edge]\n*/\n`), /Chrome and Firefox only/)
  assert.throws(() => emit(META + PROJECT() + POPUP + `/* @arkzen:ext:export\nmanifest_version:\n  chrome: 2\n*/\n`), /chrome builds Manifest V3 only/)
  assert.throws(() => emit(META + PROJECT() + POPUP + `/* @arkzen:ext:export\nmanifest_version:\n  firefox: 2\n*/\n`), /firefox builds Manifest V3 only/)
})

test('project targets are used when ext:export has no browsers', () => {
  const e = emit(META + PROJECT('targets: [chrome, firefox, safari]\n') + POPUP)
  assert.deepEqual(e.browsers, ['chrome', 'firefox'])
  assert.ok(e.warnings.some(w => w.startsWith('safari is not built yet')))
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

test('only rules and locale are still not emitted, and they warn', () => {
  const e = emit(META + PROJECT('default_locale: en\napi:\n  base_url: https://example.com\n') + POPUP +
    `/* @arkzen:ext:rules\nrulesets:\n  - id: r\n    rules: []\n*/\n/* @arkzen:ext:locale:en\nmessages:\n  a:\n    message: A\n*/\n`)
  for (const tag of ['rules', 'locale']) {
    assert.ok(e.warnings.some(w => w.startsWith(`@arkzen:ext:${tag} is not emitted yet`)), tag)
  }
  assert.ok(e.warnings.some(w => w.startsWith('default_locale was left out')))
  assert.equal(e.manifest.default_locale, undefined)
  assert.ok(e.warnings.some(w => w.includes('api is not used yet')))
})

test('nothing to build is an error', () => {
  assert.throws(() => emit(META + PROJECT() + `/* @arkzen:ext:rules\nrulesets:\n  - id: r\n    rules: []\n*/\n`), /Nothing to build/)
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


// ══════════════ Phase 4: sidepanel, commands, menus, content, script, firefox ══════════════

const SIDEPANEL = (header = '') => `/* @arkzen:ext:sidepanel\n${header}*/\nexport default function S() { return <main>Panel</main> }\n/* @arkzen:ext:sidepanel:end */\n`
const BACKGROUND = (body: string) => `/* @arkzen:ext:background */\n${body}\n/* @arkzen:ext:background:end */\n`
const CONTENT = (name: string, header: string, body: string) => `/* @arkzen:ext:content:${name}\n${header}\n*/\n${body}\n/* @arkzen:ext:content:${name}:end */\n`
const APP = 'export default function App() { return <aside>Hi</aside> }'

test('sidepanel: files, title, no background unless open_on_action_click', () => {
  const e = emit(META + PROJECT() + SIDEPANEL('title: My panel\n'))
  assert.deepEqual(paths(e).filter(p => p.startsWith('entrypoints/')), [
    'entrypoints/sidepanel/SidePanel.tsx', 'entrypoints/sidepanel/index.html', 'entrypoints/sidepanel/main.tsx', 'entrypoints/sidepanel/style.css'])
  assert.match(fileOf(e, 'entrypoints/sidepanel/index.html')!.content!, /<title>My panel<\/title>/)
  assert.match(fileOf(e, 'entrypoints/sidepanel/main.tsx')!.content!, /import SidePanel from '\.\/SidePanel'/)
  assert.equal(fileOf(e, 'entrypoints/background.ts'), undefined)
})

test('sidepanel: open_on_action_click generates a background that sets the panel behavior', () => {
  const e = emit(META + PROJECT() + SIDEPANEL('open_on_action_click: true\n'))
  assert.equal(fileOf(e, 'entrypoints/background.ts')!.content,
`import { defineBackground } from 'wxt/utils/define-background'
import { openSidePanelOnActionClick } from '@/arkzen/runtime/ext'

export default defineBackground({
  type: 'module',
  main() {
    openSidePanelOnActionClick()
  },
})
`)
  assert.ok(!emit(META + PROJECT() + SIDEPANEL('open_on_action_click: true\n')).warnings.some(w => w.includes('popup')))
  const both = emit(META + PROJECT() + POPUP + SIDEPANEL('open_on_action_click: true\n'))
  assert.ok(both.warnings.some(w => w.includes('also has a popup')))
})

test('commands: manifest commands with default and per-platform keys', () => {
  const e = emit(META + PROJECT() + POPUP + `/* @arkzen:ext:commands
- id: _execute_action
  key: Ctrl+Shift+Y
- id: toggle
  key: Alt+T
  mac: Command+Shift+T
  windows: Ctrl+Alt+T
  description: Toggle it
  global: true
- id: unbound
  description: No default key
*/\n`)
  assert.deepEqual(e.manifest.commands, {
    _execute_action: { suggested_key: { default: 'Ctrl+Shift+Y' } },
    toggle: { suggested_key: { default: 'Alt+T', windows: 'Ctrl+Alt+T', mac: 'Command+Shift+T' }, description: 'Toggle it', global: true },
    unbound: { description: 'No default key' },
  })
  assert.throws(() => emit(META + PROJECT() + POPUP + `/* @arkzen:ext:commands\n- id: a\n  description: A\n  mac: 5\n*/\n`), /mac must be a key combination/)
})

test('menus: contextMenus permission once, items registered in the background, parents first', () => {
  const e = emit(META + PROJECT('permissions: [contextMenus, storage]\n') + POPUP + `/* @arkzen:ext:menus
- id: child
  title: Child
  parent: root
  contexts: [selection]
  document_url_patterns: ["https://*/*"]
- id: root
  title: Root
  contexts: [page, selection]
- id: sep
  type: separator
  parent: root
*/\n`)
  assert.deepEqual(e.manifest.permissions, ['contextMenus', 'storage'])
  const bg = fileOf(e, 'entrypoints/background.ts')!.content!
  assert.match(bg, /import \{ registerMenus \} from '@\/arkzen\/runtime\/ext'/)
  const items = JSON.parse(bg.slice(bg.indexOf('registerMenus([') + 'registerMenus('.length, bg.lastIndexOf('])') + 1))
  assert.deepEqual(items.map((i: { id: string }) => i.id), ['root', 'child', 'sep'])
  assert.deepEqual(items[1], { id: 'child', title: 'Child', contexts: ['selection'], parentId: 'root', documentUrlPatterns: ['https://*/*'] })
  assert.deepEqual(items[2], { id: 'sep', parentId: 'root', type: 'separator' })
  assert.throws(() => emit(META + PROJECT() + POPUP + `/* @arkzen:ext:menus\n- id: a\n  title: A\n  parent: b\n- id: b\n  title: B\n  parent: a\n*/\n`), /its own ancestor/)
})

test('background: ext is imported only when the code uses it, generated code runs first', () => {
  const menus = `/* @arkzen:ext:menus\n- id: m\n  title: M\n*/\n`
  const e = emit(META + PROJECT() + POPUP + menus + BACKGROUND(`import { browser } from 'wxt/browser'\next.menus.on('m', (info, tab) => { console.log(info, tab) })\nconst later = 1`))
  const bg = fileOf(e, 'entrypoints/background.ts')!.content!
  assert.match(bg, /^import \{ defineBackground \} from 'wxt\/utils\/define-background'\nimport \{ ext, registerMenus \} from '@\/arkzen\/runtime\/ext'\nimport \{ browser \} from 'wxt\/browser'\n/)
  assert.ok(bg.indexOf('registerMenus([') < bg.indexOf("ext.menus.on('m'"), 'generated code first')
  assert.ok(bg.indexOf("ext.menus.on('m'") < bg.indexOf('const later'), 'author code order kept')
  // an author who imports their own ext keeps it
  const own = emit(META + PROJECT() + POPUP + BACKGROUND(`import { ext } from './mine'\next.go()`))
  assert.doesNotMatch(fileOf(own, 'entrypoints/background.ts')!.content!, /arkzen\/runtime\/ext/)
  // a property called ext is not the helper
  const prop = emit(META + PROJECT() + POPUP + BACKGROUND(`const o = { ext: { a: 1 } }\nconsole.log(o.ext.a)`))
  assert.doesNotMatch(fileOf(prop, 'entrypoints/background.ts')!.content!, /arkzen\/runtime\/ext/)
})

test('content script (mode: script): options from the header, imports hoisted, body in main(ctx)', () => {
  const e = emit(META + PROJECT() + CONTENT('probe',
    'matches: ["https://*/*", "<all_urls>"]\nexclude_matches: ["https://private.example/*"]\nrun_at: document_start\nall_frames: true\nmatch_about_blank: false\nworld: MAIN\nmode: script',
    `import { x } from 'x'\n\nconsole.log(x, ctx.isValid)`))
  assert.equal(fileOf(e, 'entrypoints/probe.content/index.ts')!.content,
`import { defineContentScript } from 'wxt/utils/define-content-script'
import { x } from 'x'

export default defineContentScript({
  matches: ["https://*/*","<all_urls>"],
  excludeMatches: ["https://private.example/*"],
  runAt: "document_start",
  allFrames: true,
  matchAboutBlank: false,
  world: "MAIN",
  main(ctx) {
    console.log(x, ctx.isValid)
  },
})
`)
  assert.throws(() => emit(META + PROJECT() + CONTENT('a', 'matches: ["<all_urls>"]\nmode: script', 'export const a = 1')), /cannot use `export`/)
})

test('content script (mode: ui, shadow): index, App, style, defaults', () => {
  const e = emit(META + PROJECT() + CONTENT('overlay',
    'matches: ["https://*/*"]\nmode: ui\nui:\n  position: overlay\n  anchor: body\n  append: first\n  z_index: 99\nrun_at: document_idle', APP))
  const index = fileOf(e, 'entrypoints/overlay.content/index.tsx')!.content!
  assert.match(index, /import \{ createShadowRootUi \} from 'wxt\/utils\/content-script-ui\/shadow-root'/)
  assert.match(index, /cssInjectionMode: 'ui',/)
  assert.match(index, /async main\(ctx\) \{\n    const ui = await createShadowRootUi\(ctx, \{\n      name: "case-overlay",\n      position: "overlay",\n      anchor: "body",\n      append: "first",\n      zIndex: 99,\n      onMount\(container\) \{\n        const root = ReactDOM\.createRoot\(container\)/)
  assert.match(index, /runAt: "document_idle",/)
  assert.equal(fileOf(e, 'entrypoints/overlay.content/App.tsx')!.content, APP + '\n')
  const css = fileOf(e, 'entrypoints/overlay.content/style.css')!.content!
  assert.match(css, /^@import "tailwindcss" source\(none\);/)
  assert.match(css, /@source "\.\/";/)
  // no position given: inline, which is what WXT needs as a value (it has no default)
  const inline = emit(META + PROJECT() + CONTENT('plain', 'matches: ["<all_urls>"]\nmode: ui', APP))
  assert.match(fileOf(inline, 'entrypoints/plain.content/index.tsx')!.content!, /position: "inline",/)
  assert.doesNotMatch(fileOf(inline, 'entrypoints/plain.content/index.tsx')!.content!, /zIndex|anchor|append/)
})

test('content script (mode: ui, none): integrated UI, page css without the global reset', () => {
  const e = emit(META + PROJECT() + CONTENT('inline', 'matches: ["<all_urls>"]\nmode: ui\nui:\n  isolate: none\n  anchor: "#app"\n  append: after', APP))
  const index = fileOf(e, 'entrypoints/inline.content/index.tsx')!.content!
  assert.match(index, /createIntegratedUi/)
  assert.match(index, /const ui = createIntegratedUi\(ctx, \{/)
  assert.match(index, /main\(ctx\) \{/)
  assert.doesNotMatch(index, /cssInjectionMode|async|await|name:/)
  assert.match(index, /onMount\(wrapper\) \{\n        const root = ReactDOM\.createRoot\(wrapper\)/)
  const css = fileOf(e, 'entrypoints/inline.content/style.css')!.content!
  assert.match(css, /tailwindcss\/theme\.css/)
  assert.match(css, /tailwindcss\/utilities\.css" layer\(utilities\) source\(none\)/)
  assert.doesNotMatch(css, /@import "tailwindcss"/, 'no preflight: it would restyle the host page')
})

test('content script (mode: ui): web:style block is appended, bad combinations are rejected', () => {
  const style = `/* @arkzen:web:style:Overlay */\n.pill { color: red; }\n/* @arkzen:web:style:Overlay:end */\n`
  const e = emit(META + PROJECT() + style + CONTENT('a', 'matches: ["<all_urls>"]\nmode: ui\nstyle: Overlay', APP))
  assert.match(fileOf(e, 'entrypoints/a.content/style.css')!.content!, /\/\* @arkzen:web:style:Overlay \*\/\n\.pill \{ color: red; \}\n$/)
  assert.throws(() => emit(META + PROJECT() + CONTENT('a', 'matches: ["<all_urls>"]\nmode: ui\nstyle: Nope', APP)), /style "Nope" is not defined/)
  assert.throws(() => emit(META + PROJECT() + CONTENT('a', 'matches: ["<all_urls>"]\nmode: ui\nui:\n  isolate: iframe', APP)), /isolate: iframe is not emitted yet/)
  assert.throws(() => emit(META + PROJECT() + CONTENT('a', 'matches: ["<all_urls>"]\nmode: ui\nworld: MAIN', APP)), /needs the ISOLATED world/)
  assert.doesNotThrow(() => emit(META + PROJECT() + CONTENT('a', 'matches: ["<all_urls>"]\nmode: ui\nworld: MAIN\nui:\n  isolate: none', APP)))
  assert.throws(() => emit(META + PROJECT() + CONTENT('a', 'matches: ["<all_urls>"]\nmode: ui\nui:\n  position: inline\n  z_index: 5', APP)), /z_index only applies to position: overlay or modal/)
})

test('scripts: written to ext-scripts, and Tailwind scans them only when they exist', () => {
  const withScript = emit(META + PROJECT() + POPUP + SIDEPANEL() + page('welcome', '') + CONTENT('a', 'matches: ["<all_urls>"]\nmode: ui', APP) +
    `/* @arkzen:ext:script:helpers */\nexport const clamp = (n: number) => Math.max(0, n)\n/* @arkzen:ext:script:helpers:end */\n`)
  assert.equal(fileOf(withScript, 'ext-scripts/helpers.ts')!.content, 'export const clamp = (n: number) => Math.max(0, n)\n')
  for (const css of withScript.files.filter(f => f.path.endsWith('style.css'))) assert.match(css.content!, /@source "\.\.\/\.\.\/ext-scripts";/, css.path)
  const without = emit(META + PROJECT() + POPUP)
  assert.doesNotMatch(fileOf(without, 'entrypoints/popup/style.css')!.content!, /ext-scripts/)
})

test('firefox: gecko settings only in the Firefox manifest, warning without an id', () => {
  const withId = emit(META + PROJECT('targets: [chrome, firefox]\nfirefox:\n  id: tab@example.com\n  strict_min_version: "115.0"\n') + POPUP)
  assert.deepEqual(withId.firefoxManifest, { browser_specific_settings: { gecko: { id: 'tab@example.com', strict_min_version: '115.0' } } })
  assert.equal(withId.manifest.browser_specific_settings, undefined)
  assert.ok(fileOf(withId, 'arkzen/generated/manifest.firefox.json'))
  assert.ok(!withId.warnings.some(w => w.startsWith('firefox.id')))
  const noId = emit(META + PROJECT('targets: [chrome, firefox]\n') + POPUP)
  assert.equal(noId.firefoxManifest, undefined)
  assert.equal(fileOf(noId, 'arkzen/generated/manifest.firefox.json'), undefined)
  assert.ok(noId.warnings.some(w => w.startsWith('firefox.id is not set')))
  assert.ok(noId.warnings.some(w => w.startsWith('firefox.data_collection_permissions is not set')))
  const chromeOnly = emit(META + PROJECT() + POPUP)
  assert.ok(!chromeOnly.warnings.some(w => w.startsWith('firefox.')), 'no warning when Firefox is not built')
})

test('firefox: data_collection_permissions is passed to the Firefox manifest and checked', () => {
  const ok = emit(META + PROJECT('targets: [firefox]\nfirefox:\n  id: a@b.c\n  data_collection_permissions:\n    required: [none]\n    optional: [technicalAndInteraction]\n') + POPUP)
  assert.deepEqual(ok.firefoxManifest, { browser_specific_settings: { gecko: { id: 'a@b.c', data_collection_permissions: { required: ['none'], optional: ['technicalAndInteraction'] } } } })
  assert.ok(!ok.warnings.some(w => w.startsWith('firefox.')))
  const alone = emit(META + PROJECT('targets: [firefox]\nfirefox:\n  data_collection_permissions:\n    required: [none]\n') + POPUP)
  assert.deepEqual(alone.firefoxManifest, { browser_specific_settings: { gecko: { data_collection_permissions: { required: ['none'] } } } })
  for (const bad of ['    required: none\n', '    required: [1]\n', '    other: [none]\n']) {
    assert.throws(() => emit(META + PROJECT('targets: [firefox]\nfirefox:\n  data_collection_permissions:\n' + bad) + POPUP), /data_collection_permissions must be a mapping/, bad)
  }
  assert.throws(() => emit(META + PROJECT('targets: [firefox]\nfirefox:\n  data_collection_permissions: none\n') + POPUP), /data_collection_permissions must be a mapping/)
})

test('ext.json carries the build settings, including sources_zip', () => {
  const read = (e: ReturnType<typeof emit>) => JSON.parse(fileOf(e, 'arkzen/generated/ext.json')!.content!)
  assert.deepEqual(read(emit(META + PROJECT() + POPUP)), { slug: 'case', name: 'Case', version: '1.0.0', zipName: 'case', browsers: ['chrome'], zip: true, sourcesZip: false })
  const e = emit(META + PROJECT() + POPUP + `/* @arkzen:ext:export\nbrowsers: [chrome, firefox]\nsources_zip: true\nname_suffix: -x\n*/\n`)
  assert.deepEqual(read(e), { slug: 'case', name: 'Case', version: '1.0.0', zipName: 'case-x', browsers: ['chrome', 'firefox'], zip: true, sourcesZip: true })
})

test('writeEmit: replaces ext-scripts too and refuses to wipe one it did not write', () => {
  const stack = fs.mkdtempSync(path.join(TMP, 'stack-'))
  writeEmit(emit(META + PROJECT() + POPUP + `/* @arkzen:ext:script:a */\nexport const a = 1\n/* @arkzen:ext:script:a:end */\n`), stack)
  assert.ok(fs.existsSync(path.join(stack, 'ext-scripts/a.ts')))
  writeEmit(emit(META + PROJECT() + POPUP), stack)
  assert.ok(!fs.existsSync(path.join(stack, 'ext-scripts')), 'old scripts removed')
  const other = fs.mkdtempSync(path.join(TMP, 'stack-'))
  fs.mkdirSync(path.join(other, 'ext-scripts'))
  fs.writeFileSync(path.join(other, 'ext-scripts', 'mine.ts'), 'keep me')
  assert.throws(() => writeEmit(emit(META + PROJECT() + POPUP), other), /ext-scripts\/ already has files/)
})

test('emitExtension: needs ext blocks', () => {
  const t = load(META + '/* @arkzen:web:page:index */\nexport default function P() { return <main/> }\n/* @arkzen:web:page:index:end */\n')
  assert.throws(() => emitExtension(t.parsed, { assetsDir: t.assetsDir }), /no @arkzen:ext blocks/)
})
