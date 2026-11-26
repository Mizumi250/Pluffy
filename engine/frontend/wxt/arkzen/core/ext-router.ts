// EXTENSION EMITTER (v1)
//
// Turns the `parsed.ext` blocks of a tatemono into the files WXT builds from:
//
//   entrypoints/               popup, background, pages (WXT file conventions)
//   public/icons/              icons copied from tatemonos/<name>/assets/
//   arkzen/generated/          manifest.json (the manifest data) and ext.json (build settings)
//
// This file is pure. It returns the files and the engine writes them with writeEmit().
// The output for tatemonos/ext-tab-notes must stay identical to reference/ext-tab-notes/.
//
// v1 emits: ext:project, ext:popup, ext:background, ext:page, ext:export (Chrome only).
// Every other ext block is reported in `warnings` and not emitted.
import * as fs from 'node:fs'
import * as path from 'node:path'
import type { ParsedTatemono, ArkzenExt, ArkzenExtNamedCodeBlock } from '../types'

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
  zipName:  string                 // the zip is named <zipName>-<version>-<browser>.zip
  browsers: string[]
  zip:      boolean
  warnings: string[]
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
export const SUPPORTED_BROWSERS = ['chrome']

// Roles that map to a single manifest slot. WXT recognises these by folder name.
const SLOT_ROLES = ['options', 'newtab', 'history', 'bookmarks', 'devtools']

// Folder names WXT treats as special. A page named like one of these would be picked up as that entrypoint.
const WXT_ENTRY_NAMES = new Set([
  'popup', 'options', 'newtab', 'history', 'bookmarks', 'devtools', 'sandbox',
  'sidepanel', 'side-panel', 'background', 'content', 'content-script', 'content-scripts',
])

// Blocks the parser reads but this version does not emit yet.
const NOT_EMITTED: Array<[key: keyof ArkzenExt, tag: string, phase: string]> = [
  ['sidepanel', '@arkzen:ext:sidepanel',   'Phase 4'],
  ['commands',  '@arkzen:ext:commands',    'Phase 4'],
  ['menus',     '@arkzen:ext:menus',       'Phase 4'],
  ['rules',     '@arkzen:ext:rules',       'Phase 6'],
]
const NOT_EMITTED_LISTS: Array<[key: 'contents' | 'scripts' | 'locales', tag: string, phase: string]> = [
  ['contents', '@arkzen:ext:content', 'Phase 4'],
  ['scripts',  '@arkzen:ext:script',  'Phase 4'],
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

function styleCss(size?: { width?: number; height?: number }): string {
  let css = `@import "tailwindcss";
/* scan this folder even when it is gitignored (the emitter writes entrypoints/ and ignores it) */
@source "./";
`
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
  return css
}

/** The surface files for one React page: index.html, main.tsx, <Component>.tsx, style.css */
function surfaceFiles(dir: string, component: string, title: string, body: string, opts: { meta?: string; size?: { width?: number; height?: number } } = {}): EmittedFile[] {
  return [
    { path: `entrypoints/${dir}/index.html`,        content: indexHtml(title, opts.meta) },
    { path: `entrypoints/${dir}/main.tsx`,          content: mainTsx(component) },
    { path: `entrypoints/${dir}/${component}.tsx`,  content: `${body}\n` },
    { path: `entrypoints/${dir}/style.css`,         content: styleCss(opts.size) },
  ]
}

function backgroundTs(body: string, type: string): string {
  const { imports, rest } = hoistImports(body)
  if (/^export\s/m.test(rest)) {
    throw new ExtEmitError('@arkzen:ext:background cannot use `export`. Its code runs inside the service worker entry, so write plain statements.')
  }
  return [
    `import { defineBackground } from 'wxt/utils/define-background'`,
    ...imports,
    '',
    'export default defineBackground({',
    `  type: '${type}',`,
    '  main() {',
    indent(rest.trim(), 4),
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
    if (!SUPPORTED_BROWSERS.includes(b)) warnings.push(`${b} is not built yet (this version builds Chrome only)`)
  }
  if (browsers.length === 0) {
    throw new ExtEmitError('This version builds Chrome only. Add chrome to browsers in @arkzen:ext:export (or targets in @arkzen:ext:project).')
  }
  const manifestVersions = isObj(exportData.manifest_version) ? exportData.manifest_version : {}
  if (manifestVersions.chrome !== undefined && manifestVersions.chrome !== 3) {
    throw new ExtEmitError('Chrome builds Manifest V3 only (manifest_version.chrome must be 3).')
  }
  const zip     = exportData.zip === undefined ? true : exportData.zip === true
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

  // ── popup ───────────────────────────────────
  if (ext.popup) {
    const h = ext.popup.header
    // WXT takes the toolbar title from the popup <title>, so a project action.default_title only applies through it.
    // Order: ext:popup title, then ext:project action.default_title, then the extension name.
    const actionTitle = isObj(project.action) && typeof project.action.default_title === 'string' ? project.action.default_title : undefined
    files.push(...surfaceFiles('popup', 'Popup', typeof h.title === 'string' ? h.title : (actionTitle ?? name), ext.popup.raw, {
      size: { width: typeof h.width === 'number' ? h.width : undefined, height: typeof h.height === 'number' ? h.height : undefined },
    }))
  }

  // ── background ──────────────────────────────
  if (ext.background) {
    const type = typeof ext.background.header.type === 'string' ? ext.background.header.type : 'module'
    files.push({ path: 'entrypoints/background.ts', content: backgroundTs(ext.background.raw, type) })
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
    files.push(...surfaceFiles(dir, 'Page', title, page.raw, { meta }))

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

  if (!ext.popup && !ext.background && ext.pages.length === 0) {
    throw new ExtEmitError('Nothing to build: this version emits ext:popup, ext:background and ext:page. This tatemono has none of them.')
  }

  files.push(
    { path: 'arkzen/generated/manifest.json', content: JSON.stringify(manifest, null, 2) + '\n' },
    { path: 'arkzen/generated/ext.json',      content: JSON.stringify({ slug, name, version, zipName, browsers, zip }, null, 2) + '\n' },
  )

  return { slug, name, version, files, manifest, zipName, browsers, zip, warnings }
}

// ── writing ───────────────────────────────────────────────────────────

const GENERATED_MARKER = path.join('arkzen', 'generated', '.arkzen-generated')

/**
 * Writes an emit into the stack folder. entrypoints/, public/ and arkzen/generated/ are replaced.
 * It refuses to wipe a folder that has content but was not written by this emitter.
 */
export function writeEmit(emit: ExtEmit, stackDir: string): void {
  const owned   = fs.existsSync(path.join(stackDir, GENERATED_MARKER))
  const folders = ['entrypoints', 'public', path.join('arkzen', 'generated')]
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
