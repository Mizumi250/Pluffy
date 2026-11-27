// EXTENSION EMITTER (v2)
//
// Turns the `parsed.ext` blocks of a tatemono into the files WXT builds from:
//
//   entrypoints/               popup, sidepanel, background, pages, content scripts (WXT file conventions)
//   ext-scripts/               ext:script modules, imported as '@ext/<name>'
//   public/icons/              icons copied from tatemonos/<name>/assets/
//   arkzen/generated/          manifest.json (the manifest data), manifest.firefox.json (Firefox only keys)
//                              and ext.json (build settings)
//
// This file is pure. It returns the files and the engine writes them with writeEmit().
// The output for tatemonos/ext-tab-notes must stay identical to reference/ext-tab-notes/.
//
// Emits: ext:project, ext:popup, ext:sidepanel, ext:background, ext:page, ext:content, ext:script,
// ext:commands, ext:menus and ext:export (Chrome and Firefox, Manifest V3).
// ext:rules and ext:locale are reported in `warnings` and not emitted yet.
import * as fs from 'node:fs'
import * as path from 'node:path'
import type { ParsedTatemono, ArkzenExt, ArkzenExtNamedCodeBlock } from '../types'
import type { ExtMenuItem } from '../runtime/ext'

export interface EmittedFile {
  path:      string    // relative to the stack folder
  content?:  string
  copyFrom?: string    // absolute path of a file to copy (icons)
}

export interface ExtEmit {
  slug:     string
  name:     string
  version:  string
  files:    EmittedFile[]
  manifest: Record<string, unknown>
  firefoxManifest?: Record<string, unknown>   // keys only the Firefox build gets (browser_specific_settings)
  zipName:    string               // the zip is named <zipName>-<version>-<browser>.zip
  browsers:   string[]
  zip:        boolean
  sourcesZip: boolean              // also zip the sources (Firefox reviewers ask for them)
  warnings:   string[]
}

export class ExtEmitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExtEmitError'
  }
}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Browsers this emitter builds today. */
export const SUPPORTED_BROWSERS = ['chrome', 'firefox']

// Roles that map to a single manifest slot. WXT recognises these by folder name.
const SLOT_ROLES = ['options', 'newtab', 'history', 'bookmarks', 'devtools']

// Folder names WXT treats as special. A page named like one of these would be picked up as that entrypoint.
const WXT_ENTRY_NAMES = new Set([
  'popup', 'options', 'newtab', 'history', 'bookmarks', 'devtools', 'sandbox',
  'sidepanel', 'side-panel', 'background', 'content', 'content-script', 'content-scripts',
])

// Blocks the parser reads but this version does not emit yet.
const NOT_EMITTED: Array<[key: keyof ArkzenExt, tag: string, phase: string]> = [
  ['rules',     '@arkzen:ext:rules',       'Phase 6'],
]
const NOT_EMITTED_LISTS: Array<[key: 'locales', tag: string, phase: string]> = [
  ['locales',  '@arkzen:ext:locale',  'Phase 6'],
]

// ── small text helpers ────────────────────────────────────────────────

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** assets/icon.png, ./icon.png and icon.png all mean tatemonos/<name>/assets/icon.png */
const assetRel = (rel: string) => rel.replace(/^(?:\.\/)?\/?(?:assets\/)?/, '').replace(/\\/g, '/')

function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces)
  return text.split('\n').map(line => (line.trim() === '' ? '' : pad + line)).join('\n')
}

/**
 * Splits a body into its import statements and everything else.
 * The background body runs inside main(), where `import` is not allowed, so imports move to the top of the file.
 * Handles multi-line imports. Only lines that start at column 0 are read as imports.
 */
export function hoistImports(body: string): { imports: string[]; rest: string } {
  const imports: string[] = []
  const rest: string[] = []
  const lines = body.split('\n')
  const complete = /^import\s*(?:[\s\S]*?\bfrom\s*)?['"][^'"]+['"]\s*;?\s*$/
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (!/^import[\s{*'"]/.test(line)) { rest.push(line); continue }
    let statement = line
    while (!complete.test(statement) && i + 1 < lines.length) statement += '\n' + (lines[++i] ?? '')
    imports.push(statement)
  }
  return { imports, rest: rest.join('\n') }
}

function deepMerge(base: Obj, extra: Obj): Obj {
  for (const [key, value] of Object.entries(extra)) {
    const current = base[key]
    base[key] = isObj(current) && isObj(value) ? deepMerge(current, value) : value
  }
  return base
}

// ── file templates ────────────────────────────────────────────────────

function indexHtml(title: string, extraMeta = ''): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${extraMeta}    <title>${escapeHtml(title)}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
`
}

function mainTsx(component: string): string {
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import ${component} from './${component}'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <${component} />
  </React.StrictMode>
)
`
}

interface StyleOptions {
  size?:      { width?: number; height?: number }
  scripts?:   boolean   // ext-scripts/ exists, so Tailwind has to scan it too
  preflight?: boolean   // false for UI that is injected into someone else's page (no global reset)
  extra?:     string    // CSS appended at the end (web:style blocks)
}

function styleCss(size?: { width?: number; height?: number }, opts: Omit<StyleOptions, 'size'> = {}): string {
  // source(none) turns off Tailwind's automatic file detection. Left on, it scans the whole stack folder (other
  // surfaces, the reference extension, the engine's own .ts files), so the css would carry classes nobody uses
  // and would differ between a build here and a rebuild from the sources zip. Only the folders named below are scanned.
  let css = opts.preflight === false
    ? `@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities) source(none);
`
    : `@import "tailwindcss" source(none);
`
  css += `/* scan only this folder (the emitter writes entrypoints/ and ignores it, so it has to be named) */
@source "./";
`
  // surfaces sit two folders deep (entrypoints/<name>/), so ext-scripts/ is two levels up
  if (opts.scripts) css += `/* shared ext:script modules may hold class names too */\n@source "../../ext-scripts";\n`
  if (size && (size.width || size.height)) {
    css += `
/* popup size from the ext:popup header (width, height) */
html,
body,
#root {
${size.width ? `  width: ${size.width}px;\n` : ''}${size.height ? `  height: ${size.height}px;\n` : ''}  margin: 0;
}
`
  }
  if (opts.extra) css += `\n${opts.extra.trim()}\n`
  return css
}

/** The surface files for one React page: index.html, main.tsx, <Component>.tsx, style.css */
function surfaceFiles(dir: string, component: string, title: string, body: string, opts: { meta?: string; size?: { width?: number; height?: number }; scripts?: boolean } = {}): EmittedFile[] {
  return [
    { path: `entrypoints/${dir}/index.html`,        content: indexHtml(title, opts.meta) },
    { path: `entrypoints/${dir}/main.tsx`,          content: mainTsx(component) },
    { path: `entrypoints/${dir}/${component}.tsx`,  content: `${body}\n` },
    { path: `entrypoints/${dir}/style.css`,         content: styleCss(opts.size, { scripts: opts.scripts }) },
  ]
}

interface BackgroundGen {
  names: string[]   // names to import from the runtime helper ('@/arkzen/runtime/ext')
  calls: string[]   // generated statements that run before the author's code
}

function backgroundTs(body: string, type: string, gen: BackgroundGen = { names: [], calls: [] }): string {
  const { imports, rest } = hoistImports(body)
  if (/^export\s/m.test(rest)) {
    throw new ExtEmitError('@arkzen:ext:background cannot use `export`. Its code runs inside the service worker entry, so write plain statements.')
  }
  // `ext` (ext.commands.on, ext.menus.on) is available without an import, unless the author already imports one
  const names = [...gen.names]
  if (!imports.some(i => /\bext\b/.test(i)) && /(^|[^.\w$])ext\./.test(rest)) names.unshift('ext')

  const generated = gen.calls.length ? indent(gen.calls.join('\n'), 4) : ''
  const author    = rest.trim() ? indent(rest.trim(), 4) : ''
  return [
    `import { defineBackground } from 'wxt/utils/define-background'`,
    ...(names.length ? [`import { ${names.join(', ')} } from '@/arkzen/runtime/ext'`] : []),
    ...imports,
    '',
    'export default defineBackground({',
    `  type: '${type}',`,
    '  main() {',
    ...[generated, author].filter(Boolean).join('\n\n').split('\n').filter((_, i, a) => !(a.length === 1 && a[0] === '')),
    '  },',
    '})',
    '',
  ].join('\n')
}

function devtoolsMainTs(panels: Array<{ title: string; icon: string; page: string }>): string {
  return [
    `import { browser } from 'wxt/browser'`,
    '',
    ...panels.map(p => `browser.devtools.panels.create(${JSON.stringify(p.title)}, ${JSON.stringify(p.icon)}, ${JSON.stringify(p.page)})`),
    '',
  ].join('\n')
}

// ── content scripts ───────────────────────────────────────────────────

/** The defineContentScript options that come from the block header (matches, run_at, ...). */
function contentOptions(h: Obj): string[] {
  const lines = [`matches: ${JSON.stringify(h.matches)},`]
  if (h.exclude_matches !== undefined)   lines.push(`excludeMatches: ${JSON.stringify(h.exclude_matches)},`)
  if (typeof h.run_at === 'string')      lines.push(`runAt: ${JSON.stringify(h.run_at)},`)
  if (typeof h.all_frames === 'boolean') lines.push(`allFrames: ${h.all_frames},`)
  if (typeof h.match_about_blank === 'boolean') lines.push(`matchAboutBlank: ${h.match_about_blank},`)
  if (typeof h.world === 'string')       lines.push(`world: ${JSON.stringify(h.world)},`)
  return lines
}

/**
 * Files for one @arkzen:ext:content block.
 *   mode: script  entrypoints/<name>.content/index.ts   the body runs inside main(ctx)
 *   mode: ui      entrypoints/<name>.content/index.tsx  the body is a React component (App.tsx)
 *                 isolate: shadow (default) mounts it in a shadow root, isolate: none mounts it in the page
 */
function contentFiles(slug: string, block: ArkzenExtNamedCodeBlock, styles: Map<string, string>, scripts: boolean): EmittedFile[] {
  const h   = block.header
  const dir = `entrypoints/${block.name}.content`
  const label = `@arkzen:ext:content:${block.name}`
  const options = contentOptions(h)

  if (h.mode === 'script') {
    const { imports, rest } = hoistImports(block.raw)
    if (/^export\s/m.test(rest)) throw new ExtEmitError(`${label} cannot use \`export\`. In mode: script the body runs inside main(ctx), where \`ctx\` is the content script context.`)
    return [{
      path: `${dir}/index.ts`,
      content: [
        `import { defineContentScript } from 'wxt/utils/define-content-script'`,
        ...imports,
        '',
        'export default defineContentScript({',
        ...options.map(l => `  ${l}`),
        '  main(ctx) {',
        ...(rest.trim() ? [indent(rest.trim(), 4)] : []),
        '  },',
        '})',
        '',
      ].join('\n'),
    }]
  }

  // mode: ui
  const ui        = isObj(h.ui) ? h.ui : {}
  const isolate   = typeof ui.isolate === 'string' ? ui.isolate : 'shadow'
  const position  = typeof ui.position === 'string' ? ui.position : 'inline'
  if (isolate === 'iframe') {
    throw new ExtEmitError(`${label}: isolate: iframe is not emitted yet. Use isolate: shadow (default) or isolate: none.`)
  }
  if (isolate === 'shadow' && h.world === 'MAIN') {
    throw new ExtEmitError(`${label}: a shadow-root UI needs the ISOLATED world (it loads its stylesheet through the extension API). Remove world: MAIN, or use isolate: none.`)
  }
  if (ui.z_index !== undefined && position === 'inline') {
    throw new ExtEmitError(`${label}: ui.z_index only applies to position: overlay or modal (an inline UI takes no z-index).`)
  }
  let extra: string | undefined
  if (typeof h.style === 'string') {
    const css = styles.get(h.style)
    if (css === undefined) throw new ExtEmitError(`${label}: style "${h.style}" is not defined. Add @arkzen:web:style:${h.style}`)
    extra = `/* @arkzen:web:style:${h.style} */\n${css}`
  }
  const uiOptions = [`position: ${JSON.stringify(position)},`]
  if (typeof ui.anchor === 'string')   uiOptions.push(`anchor: ${JSON.stringify(ui.anchor)},`)
  if (typeof ui.append === 'string')   uiOptions.push(`append: ${JSON.stringify(ui.append)},`)
  if (typeof ui.z_index === 'number')  uiOptions.push(`zIndex: ${ui.z_index},`)

  const shadow = isolate === 'shadow'
  const create = shadow ? 'createShadowRootUi' : 'createIntegratedUi'
  const mount  = shadow ? 'onMount(container) {' : 'onMount(wrapper) {'
  const target = shadow ? 'container' : 'wrapper'
  const index = [
    `import React from 'react'`,
    `import ReactDOM from 'react-dom/client'`,
    `import { defineContentScript } from 'wxt/utils/define-content-script'`,
    `import { ${create} } from 'wxt/utils/content-script-ui/${shadow ? 'shadow-root' : 'integrated'}'`,
    `import App from './App'`,
    `import './style.css'`,
    '',
    'export default defineContentScript({',
    ...options.map(l => `  ${l}`),
    ...(shadow ? [`  cssInjectionMode: 'ui',`] : []),
    `  ${shadow ? 'async ' : ''}main(ctx) {`,
    `    const ui = ${shadow ? 'await ' : ''}${create}(ctx, {`,
    ...(shadow ? [`      name: ${JSON.stringify(`${slug}-${block.name}`)},`] : []),
    ...uiOptions.map(l => `      ${l}`),
    `      ${mount}`,
    `        const root = ReactDOM.createRoot(${target})`,
    '        root.render(',
    '          <React.StrictMode>',
    '            <App />',
    '          </React.StrictMode>',
    '        )',
    '        return root',
    '      },',
    '      onRemove(root) {',
    '        root?.unmount()',
    '      },',
    '    })',
    '    ui.mount()',
    '  },',
    '})',
    '',
  ].join('\n')

  return [
    { path: `${dir}/index.tsx`, content: index },
    { path: `${dir}/App.tsx`,   content: `${block.raw}\n` },
    { path: `${dir}/style.css`, content: styleCss(undefined, { scripts, extra, preflight: shadow }) },
  ]
}

// ── menus ─────────────────────────────────────────────────────────────

/** Menu items in the shape contextMenus.create wants, with every parent listed before its children. */
function menuItems(data: unknown): ExtMenuItem[] {
  const list  = (Array.isArray(data) ? data : []).filter(isObj).filter(e => typeof e.id === 'string') as Obj[]
  const byId  = new Map(list.map(e => [e.id as string, e]))
  const out:  ExtMenuItem[] = []
  const done  = new Set<string>()
  const busy  = new Set<string>()
  const visit = (entry: Obj): void => {
    const id = entry.id as string
    if (done.has(id)) return
    if (busy.has(id)) throw new ExtEmitError(`@arkzen:ext:menus: "${id}" is its own ancestor (check the parent: keys).`)
    busy.add(id)
    const parent = typeof entry.parent === 'string' ? byId.get(entry.parent) : undefined
    if (parent) visit(parent)
    const item: ExtMenuItem = { id }
    if (typeof entry.title === 'string')    item.title    = entry.title
    if (Array.isArray(entry.contexts))      item.contexts = entry.contexts as string[]
    if (typeof entry.parent === 'string')   item.parentId = entry.parent
    if (typeof entry.type === 'string')     item.type     = entry.type
    if (Array.isArray(entry.document_url_patterns)) item.documentUrlPatterns = entry.document_url_patterns as string[]
    out.push(item)
    done.add(id)
    busy.delete(id)
  }
  for (const entry of list) visit(entry)
  return out
}

// ── pages ─────────────────────────────────────────────────────────────

function pageRole(page: ArkzenExtNamedCodeBlock): string {
  return typeof page.header.role === 'string' ? page.header.role : 'standalone'
}

/** Folder (under entrypoints/) a page is written to. */
function pageDir(page: ArkzenExtNamedCodeBlock): string {
  const role = pageRole(page)
  if (SLOT_ROLES.includes(role)) return role
  if (role === 'sandbox') return `${page.name}.sandbox`
  return page.name
}

// ── the emitter ───────────────────────────────────────────────────────

export function emitExtension(parsed: ParsedTatemono, opts: { assetsDir: string }): ExtEmit {
  const ext = parsed.ext
  if (!ext) throw new ExtEmitError('This tatemono has no @arkzen:ext blocks.')
  if (!isObj(ext.project?.data)) throw new ExtEmitError('@arkzen:ext:project is required.')

  const project  = ext.project.data
  const warnings: string[] = []
  const files:    EmittedFile[] = []
  const scripts  = ext.scripts.length > 0
  const slug     = parsed.meta.name
  const name     = String(project.name)
  const version  = String(project.version ?? parsed.meta.version ?? '')

  // Chrome rejects a manifest whose version is not 1 to 4 dot-separated integers.
  if (!/^\d+(\.\d+){0,3}$/.test(version)) {
    throw new ExtEmitError(`The extension version "${version}" is not valid. Chrome needs 1 to 4 dot-separated integers (example: 1.0.0). Set version in @arkzen:meta or @arkzen:ext:project.`)
  }

  // ── ext:export ──────────────────────────────
  const exportData = isObj(ext.export?.data) ? ext.export.data : {}
  const requested  = Array.isArray(exportData.browsers) ? (exportData.browsers as string[])
                   : Array.isArray(project.targets)     ? (project.targets as string[])
                   : ['chrome']
  const browsers = requested.filter(b => SUPPORTED_BROWSERS.includes(b))
  for (const b of requested) {
    if (!SUPPORTED_BROWSERS.includes(b)) warnings.push(`${b} is not built yet (this version builds Chrome and Firefox)`)
  }
  if (browsers.length === 0) {
    throw new ExtEmitError('This version builds Chrome and Firefox only. Add chrome or firefox to browsers in @arkzen:ext:export (or targets in @arkzen:ext:project).')
  }
  const manifestVersions = isObj(exportData.manifest_version) ? exportData.manifest_version : {}
  for (const browser of SUPPORTED_BROWSERS) {
    if (manifestVersions[browser] !== undefined && manifestVersions[browser] !== 3) {
      throw new ExtEmitError(`${browser} builds Manifest V3 only (manifest_version.${browser} must be 3).`)
    }
  }
  const zip        = exportData.zip === undefined ? true : exportData.zip === true
  const sourcesZip = exportData.sources_zip === true
  const suffix  = typeof exportData.name_suffix === 'string' ? exportData.name_suffix : ''
  const zipName = `${slug}${suffix}`

  // ── manifest ────────────────────────────────
  const manifest: Obj = { name }
  if (project.short_name !== undefined) manifest.short_name = project.short_name
  manifest.version     = version
  manifest.description = project.description ?? parsed.meta.description
  for (const key of ['author', 'homepage_url']) {
    if (project[key] !== undefined) manifest[key] = project[key]
  }
  if (project.minimum_chrome_version !== undefined) manifest.minimum_chrome_version = String(project.minimum_chrome_version)

  const permissions = Array.isArray(project.permissions) ? [...(project.permissions as string[])] : []
  if (ext.pages.some(p => pageRole(p) === 'offscreen') && !permissions.includes('offscreen')) permissions.push('offscreen')
  if (ext.menus && !permissions.includes('contextMenus')) permissions.push('contextMenus')
  if (permissions.length) manifest.permissions = permissions
  for (const key of ['optional_permissions', 'host_permissions', 'optional_host_permissions']) {
    if (Array.isArray(project[key]) && (project[key] as unknown[]).length) manifest[key] = project[key]
  }

  const csp = project.content_security_policy
  if (typeof csp === 'string') manifest.content_security_policy = { extension_pages: csp }
  else if (isObj(csp))         manifest.content_security_policy = csp
  for (const key of ['web_accessible_resources', 'externally_connectable']) {
    if (project[key] !== undefined) manifest[key] = project[key]
  }
  if (typeof project.omnibox_keyword === 'string') manifest.omnibox = { keyword: project.omnibox_keyword }

  // icons: tatemonos/<name>/assets/<file> -> public/icons/<file>
  const iconPath = (rel: string): string => {
    const clean = assetRel(rel)
    const from  = path.join(opts.assetsDir, clean)
    if (!fs.existsSync(from)) throw new ExtEmitError(`Icon not found: tatemonos/${slug}/assets/${clean}`)
    if (!files.some(f => f.path === `public/icons/${clean}`)) files.push({ path: `public/icons/${clean}`, copyFrom: from })
    return `icons/${clean}`
  }
  if (isObj(project.icons)) {
    manifest.icons = Object.fromEntries(Object.entries(project.icons).map(([size, rel]) => [size, iconPath(String(rel))]))
  }
  if (isObj(project.action)) {
    const action: Obj = {}
    if (project.action.default_title !== undefined) action.default_title = project.action.default_title
    if (project.action.default_icon !== undefined)  action.default_icon  = iconPath(String(project.action.default_icon))
    if (Object.keys(action).length) manifest.action = action
  }

  // ── commands ────────────────────────────────
  // key is the default shortcut. windows, mac, linux and chromeos override it per platform.
  if (ext.commands && Array.isArray(ext.commands.data)) {
    const commands: Obj = {}
    for (const entry of ext.commands.data) {
      if (!isObj(entry) || typeof entry.id !== 'string') continue
      const suggested: Obj = {}
      if (typeof entry.key === 'string') suggested.default = entry.key
      for (const os of ['windows', 'mac', 'linux', 'chromeos']) {
        if (entry[os] === undefined) continue
        if (typeof entry[os] !== 'string') throw new ExtEmitError(`@arkzen:ext:commands "${entry.id}": ${os} must be a key combination such as Ctrl+Shift+Y`)
        suggested[os] = entry[os]
      }
      const command: Obj = {}
      if (Object.keys(suggested).length) command.suggested_key = suggested
      if (typeof entry.description === 'string') command.description = entry.description
      if (entry.global === true) command.global = true
      commands[entry.id] = command
    }
    manifest.commands = commands
  }

  // ── popup ───────────────────────────────────
  if (ext.popup) {
    const h = ext.popup.header
    // WXT takes the toolbar title from the popup <title>, so a project action.default_title only applies through it.
    // Order: ext:popup title, then ext:project action.default_title, then the extension name.
    const actionTitle = isObj(project.action) && typeof project.action.default_title === 'string' ? project.action.default_title : undefined
    files.push(...surfaceFiles('popup', 'Popup', typeof h.title === 'string' ? h.title : (actionTitle ?? name), ext.popup.raw, {
      size: { width: typeof h.width === 'number' ? h.width : undefined, height: typeof h.height === 'number' ? h.height : undefined },
      scripts,
    }))
  }

  // ── side panel ──────────────────────────────
  // Chrome: side_panel. Firefox: sidebar_action. WXT writes whichever the build target needs.
  let openPanelOnClick = false
  if (ext.sidepanel) {
    const h = ext.sidepanel.header
    files.push(...surfaceFiles('sidepanel', 'SidePanel', typeof h.title === 'string' ? h.title : name, ext.sidepanel.raw, { scripts }))
    openPanelOnClick = h.open_on_action_click === true
    if (openPanelOnClick && ext.popup) {
      warnings.push('@arkzen:ext:sidepanel open_on_action_click is on, but the extension also has a popup. Chrome shows the popup when both exist, so the panel will not open from the toolbar icon.')
    }
  }

  // ── background ──────────────────────────────
  // Menus and open_on_action_click need code in the service worker, so a background file is written for
  // them even when the tatemono has no ext:background block.
  const gen: BackgroundGen = { names: [], calls: [] }
  const menus = ext.menus ? menuItems(ext.menus.data) : []
  if (menus.length) {
    gen.names.push('registerMenus')
    gen.calls.push(`registerMenus(${JSON.stringify(menus, null, 2).replace(/\n/g, '\n')})`)
  }
  if (openPanelOnClick) {
    gen.names.push('openSidePanelOnActionClick')
    gen.calls.push('openSidePanelOnActionClick()')
  }
  if (ext.background || gen.calls.length) {
    const type = typeof ext.background?.header.type === 'string' ? ext.background.header.type : 'module'
    files.push({ path: 'entrypoints/background.ts', content: backgroundTs(ext.background?.raw ?? '', type, gen) })
  }

  // ── pages ───────────────────────────────────
  const usedDirs = new Map<string, string>()
  const panels: Array<{ title: string; icon: string; page: string }> = []
  let hasDevtoolsPage = false
  for (const page of ext.pages) {
    const role = pageRole(page)
    const dir  = pageDir(page)
    if (!SLOT_ROLES.includes(role) && role !== 'sandbox' && WXT_ENTRY_NAMES.has(page.name)) {
      throw new ExtEmitError(`@arkzen:ext:page:${page.name}: the name "${page.name}" is a WXT entrypoint name and would be picked up as that entrypoint. Pick another name.`)
    }
    if (usedDirs.has(dir)) {
      throw new ExtEmitError(`@arkzen:ext:page:${page.name} and @arkzen:ext:page:${usedDirs.get(dir)} would both be written to entrypoints/${dir}/. Rename one.`)
    }
    usedDirs.set(dir, page.name)

    const title = typeof page.header.title === 'string' ? page.header.title : page.name
    const meta  = role === 'options' && page.header.open_in_tab === true ? '    <meta name="manifest.open_in_tab" content="true" />\n' : ''
    files.push(...surfaceFiles(dir, 'Page', title, page.raw, { meta, scripts }))

    if (role === 'devtools') hasDevtoolsPage = true
    if (role === 'devtools-panel') {
      panels.push({
        title: typeof page.header.panel_title === 'string' ? page.header.panel_title : title,
        icon:  typeof page.header.panel_icon === 'string' ? iconPath(page.header.panel_icon) : '',
        page:  `/${page.name}.html`,
      })
    }
  }
  if (panels.length) {
    if (hasDevtoolsPage) {
      warnings.push('devtools-panel pages need a devtools page to register them, and you declared a page with role devtools. Create the panels from it with browser.devtools.panels.create(...).')
    } else if (usedDirs.has('devtools')) {
      throw new ExtEmitError('A page is already written to entrypoints/devtools/. Rename it so the devtools page for the panels can be generated.')
    } else {
      files.push(
        { path: 'entrypoints/devtools/index.html', content: `<!doctype html>\n<html>\n  <head>\n    <meta charset="UTF-8" />\n    <title>DevTools</title>\n  </head>\n  <body>\n    <script type="module" src="./main.ts"></script>\n  </body>\n</html>\n` },
        { path: 'entrypoints/devtools/main.ts',    content: devtoolsMainTs(panels) },
      )
    }
  }

  // ── content scripts ─────────────────────────
  const styles = new Map<string, string>()
  for (const style of parsed.styles) if (style.name) styles.set(style.name, style.raw)
  for (const block of ext.contents) files.push(...contentFiles(slug, block, styles, scripts))

  // ── shared scripts ──────────────────────────
  // ext:script:<name> is written to ext-scripts/<name>.ts and imported as '@ext/<name>' (alias in wxt.config.ts)
  for (const script of ext.scripts) files.push({ path: `ext-scripts/${script.name}.ts`, content: `${script.raw}\n` })

  // ── what is not emitted yet ─────────────────
  for (const [key, tag, phase] of NOT_EMITTED) {
    if (ext[key]) warnings.push(`${tag} is not emitted yet (${phase})`)
  }
  for (const [key, tag, phase] of NOT_EMITTED_LISTS) {
    if (ext[key].length) warnings.push(`${tag} is not emitted yet (${phase})`)
  }
  if (project.default_locale !== undefined) {
    warnings.push('default_locale was left out of the manifest because @arkzen:ext:locale is not emitted yet (Chrome rejects default_locale without a _locales folder)')
  }
  for (const key of ['identity', 'oauth2']) {
    if (project[key] !== undefined) warnings.push(`@arkzen:ext:project ${key} is not emitted yet (Phase 6)`)
  }
  if (project.api !== undefined) warnings.push('@arkzen:ext:project api is not used yet (the extension runtime helpers arrive in Phase 5)')
  if (parsed.databases.length || parsed.apis.length) {
    warnings.push('database and api blocks are not used by the extension yet (backend support arrives in Phase 5)')
  }

  // manifest_extra is merged last, so it can override anything above
  if (isObj(project.manifest_extra)) deepMerge(manifest, project.manifest_extra)

  if (!ext.popup && !ext.sidepanel && !ext.background && ext.pages.length === 0 && ext.contents.length === 0 && menus.length === 0) {
    throw new ExtEmitError('Nothing to build: this version emits ext:popup, ext:sidepanel, ext:background, ext:page, ext:content and ext:menus. This tatemono has none of them.')
  }

  // keys only the Firefox build gets
  let firefoxManifest: Obj | undefined
  const firefox = isObj(project.firefox) ? project.firefox : {}
  const gecko: Obj = {}
  if (typeof firefox.id === 'string')                 gecko.id = firefox.id
  if (typeof firefox.strict_min_version === 'string') gecko.strict_min_version = firefox.strict_min_version
  // Firefox asks every new extension to declare what data it collects: { required: [none] } for nothing,
  // or a list of data types. Checked here because WXT passes whatever it is given straight into the manifest.
  const consent = firefox.data_collection_permissions
  if (consent !== undefined) {
    const listOk = (v: unknown) => v === undefined || (Array.isArray(v) && v.every(x => typeof x === 'string'))
    if (!isObj(consent) || !listOk(consent.required) || !listOk(consent.optional) || Object.keys(consent).some(k => k !== 'required' && k !== 'optional')) {
      throw new ExtEmitError('@arkzen:ext:project firefox.data_collection_permissions must be a mapping with required: and/or optional: lists, for example required: [none].')
    }
    gecko.data_collection_permissions = consent
  }
  if (Object.keys(gecko).length) firefoxManifest = { browser_specific_settings: { gecko } }
  if (browsers.includes('firefox') && typeof firefox.id !== 'string') {
    warnings.push('firefox.id is not set in @arkzen:ext:project. Firefox needs an add-on id to publish a Manifest V3 extension and for storage.sync.')
  }
  if (browsers.includes('firefox') && consent === undefined) {
    warnings.push('firefox.data_collection_permissions is not set in @arkzen:ext:project. Firefox requires it for new extensions (use required: [none] if the extension collects no data).')
  }

  files.push(
    { path: 'arkzen/generated/manifest.json', content: JSON.stringify(manifest, null, 2) + '\n' },
    ...(firefoxManifest ? [{ path: 'arkzen/generated/manifest.firefox.json', content: JSON.stringify(firefoxManifest, null, 2) + '\n' }] : []),
    { path: 'arkzen/generated/ext.json',      content: JSON.stringify({ slug, name, version, zipName, browsers, zip, sourcesZip }, null, 2) + '\n' },
  )

  return { slug, name, version, files, manifest, firefoxManifest, zipName, browsers, zip, sourcesZip, warnings }
}

// ── writing ───────────────────────────────────────────────────────────

const GENERATED_MARKER = path.join('arkzen', 'generated', '.arkzen-generated')

/**
 * Writes an emit into the stack folder. entrypoints/, public/, ext-scripts/ and arkzen/generated/ are replaced.
 * It refuses to wipe a folder that has content but was not written by this emitter.
 */
export function writeEmit(emit: ExtEmit, stackDir: string): void {
  const owned   = fs.existsSync(path.join(stackDir, GENERATED_MARKER))
  const folders = ['entrypoints', 'public', 'ext-scripts', path.join('arkzen', 'generated')]
  for (const folder of folders) {
    const full = path.join(stackDir, folder)
    if (!owned && fs.existsSync(full) && fs.readdirSync(full).length > 0) {
      throw new ExtEmitError(`${folder}/ already has files that the engine did not write. Move or delete them, then export again.`)
    }
  }
  for (const folder of folders) fs.rmSync(path.join(stackDir, folder), { recursive: true, force: true })

  for (const file of emit.files) {
    const to = path.join(stackDir, file.path)
    fs.mkdirSync(path.dirname(to), { recursive: true })
    if (file.copyFrom) fs.copyFileSync(file.copyFrom, to)
    else               fs.writeFileSync(to, file.content ?? '')
  }
  fs.writeFileSync(path.join(stackDir, GENERATED_MARKER), 'Written by the Pluffy extension emitter. Safe to delete.\n')
}
