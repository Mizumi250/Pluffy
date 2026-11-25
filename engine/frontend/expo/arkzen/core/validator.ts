// ============================================================
// ARKZEN ENGINE — TATEMONO VALIDATOR v6.0
// Pre-build validation. Run before engine builds.
//
// Usage: node validate.js <tatemono-name>
//   or:  import { validateTatemono } from './validator'
//
// Checks:
//   1. Structure — required sections, marker syntax
//   2. Database  — table names, types, foreign keys, no circles
//   3. API       — naming conventions, methods, prefixes
//   4. Pages     — layout declarations, no duplicates
//   5. Native    — target-specific parsing and duplicate pages
//   6. Consistency — model/table name alignment
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import { parsePageLayoutDecl, parseTatemono, findMissingBackendVariants } from './parser'
import { activeBackendVariant, resolveActiveBackend } from './backends'
import { hasFileBlocks, validateFileBlocks } from './file-writer'
import type { ParsedTatemono, ValidationResult, ArkzenDatabase } from '../types'

const VALID_COLUMN_TYPES = new Set([
  'integer', 'bigInteger', 'string', 'text', 'longText',
  'decimal', 'float', 'boolean', 'date', 'datetime',
  'timestamp', 'json', 'uuid', 'foreignId',
])

const VALID_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

// ────────────────────────────────────────────────────────────────────────────
// FRAME BLOCKS (v15.0)
// @arkzen:native:frame:expo|rn|lynx and @arkzen:desktop:frame:electron|tauri.
// Each target's body must satisfy that target's small contract; anything else
// inside the body is the author's own code. Only Tatemonos that declare a frame
// are checked — Tatemonos without one never reach this code.
// ────────────────────────────────────────────────────────────────────────────

function validateFrames(parsed: ParsedTatemono): { errors: string[]; warnings: string[] } {
  const errors:   string[] = []
  const warnings: string[] = []
  const frames = parsed.frames
  if (!frames) return { errors, warnings }

  if (frames.expo) {
    if (!/export\s+default\b/.test(frames.expo.raw)) {
      errors.push('@arkzen:native:frame:expo must `export default` a layout component (Expo Router requires it for app/{tatemono}/_layout.tsx)')
    }
    if (parsed.nativePages.length === 0) warnings.push('@arkzen:native:frame:expo is declared but there are no @arkzen:native:page blocks for it to wrap')
  }

  if (frames.rn) {
    if (!/export\s+(?:const|let|function)\s+(?:screenOptions|Frame)\b/.test(frames.rn.raw)) {
      errors.push('@arkzen:native:frame:rn must export `screenOptions` (native-stack options object or function) and/or a `Frame` component')
    }
    if (parsed.nativePages.length === 0) warnings.push('@arkzen:native:frame:rn is declared but there are no @arkzen:native:page blocks for it to wrap')
  }

  if (frames.lynx) {
    if (!/export\s+(?:const|let|function)\s+Frame\b/.test(frames.lynx.raw)) {
      errors.push('@arkzen:native:frame:lynx must export a `Frame` component that renders its `children`')
    }
    if (parsed.nativeLynxPages.length === 0) warnings.push('@arkzen:native:frame:lynx is declared but there are no @arkzen:native:page:lynx blocks for it to wrap')
  }

  if (frames.electron) {
    if (!/export\s+(?:default\b|(?:const|let|function)\s+(?:setup|windowOptions)\b)/.test(frames.electron.raw)) {
      errors.push('@arkzen:desktop:frame:electron must export `setup`, `windowOptions`, or a default function (plain JavaScript — it runs in the Electron main process)')
    }
  }

  if (frames.tauri) {
    if (!/pub\s+fn\s+frame\s*\(/.test(frames.tauri.raw)) {
      errors.push('@arkzen:desktop:frame:tauri must define `pub fn frame(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>>`')
    }
  }

  if ((frames.electron || frames.tauri) && parsed.pages.length === 0) {
    warnings.push('Desktop frames wrap the web app, but this Tatemono has no @arkzen:web:page blocks to show inside the window')
  }

  return { errors, warnings }
}

// ────────────────────────────────────────────────────────────────────────────
// EXTENSION BLOCKS (v17.0)
// @arkzen:ext:project, popup, sidepanel, page:<name>, content:<name>, background,
// script:<name>, commands, menus, rules, locale:<code>, export.
// The parser reads the structure. This checks the contract of each block, so a bad
// value is reported here and not later by the extension build. Only Tatemonos that
// declare an ext block are checked.
// ────────────────────────────────────────────────────────────────────────────

const EXT_BROWSERS          = ['chrome', 'edge', 'firefox', 'safari']
const EXT_PAGE_ROLES        = ['options', 'newtab', 'history', 'bookmarks', 'devtools', 'devtools-panel', 'sandbox', 'offscreen', 'standalone']
// Each of these maps to a single manifest slot, so a second page with the same role cannot be wired.
const EXT_SINGLE_SLOT_ROLES = ['options', 'newtab', 'history', 'bookmarks', 'devtools']
// Names of the dedicated blocks. A page or content block with one of these names would collide with them.
const EXT_RESERVED_NAMES    = ['popup', 'sidepanel', 'background']
const EXT_RUN_AT            = ['document_start', 'document_end', 'document_idle']
const EXT_WORLDS            = ['ISOLATED', 'MAIN']
const EXT_CONTENT_MODES     = ['ui', 'script']
const EXT_UI_POSITIONS      = ['inline', 'overlay', 'modal']
const EXT_UI_APPENDS        = ['first', 'last', 'before', 'after', 'replace']
const EXT_UI_ISOLATES       = ['shadow', 'iframe', 'none']
const EXT_MENU_TYPES        = ['normal', 'checkbox', 'radio', 'separator']
const EXT_MENU_CONTEXTS     = ['all', 'page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'launcher', 'browser_action', 'page_action', 'action']
const EXT_NAME_RE           = /^[a-z][a-z0-9-]*$/
const EXT_LOCALE_RE         = /^[a-z]{2,3}(_[A-Za-z0-9]{2,4})?$/
// Header keys that only mean something for one page role: key -> role.
const EXT_PAGE_ROLE_KEYS: Record<string, string> = {
  open_in_tab:   'options',
  panel_title:   'devtools-panel',
  panel_icon:    'devtools-panel',
  reasons:       'offscreen',
  justification: 'offscreen',
}

const isMap     = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isText    = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const isTexts   = (v: unknown): v is string[] => Array.isArray(v) && v.every(isText)
const isPosInt  = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0

// Returns why a string is not a valid extension match pattern, or null when it is valid.
function extMatchPatternProblem(pattern: string): string | null {
  if (pattern === '<all_urls>') return null
  const m = pattern.match(/^(\*|[a-z][a-z0-9+.-]*):\/\/([^/]*)(\/.*)$/)
  if (!m) return 'expected <all_urls> or scheme://host/path'
  const host = m[2]
  if (host.includes('*') && host !== '*' && !/^\*\.[^*]+$/.test(host)) {
    return `host "${host}" may only use * as the whole host or as a leading "*."`
  }
  return null
}

function validateExt(parsed: ParsedTatemono, filePath: string): { errors: string[]; warnings: string[] } {
  const errors:   string[] = []
  const warnings: string[] = []
  const ext = parsed.ext
  if (!ext) return { errors, warnings }

  const assetsDir   = path.join(path.dirname(filePath), 'assets')
  const assetExists = (rel: string): boolean => {
    const clean = rel.replace(/^(?:\.\/)?\/?(?:assets\/)?/, '')
    return !clean.includes('..') && fs.existsSync(path.join(assetsDir, clean))
  }
  const checkAsset = (label: string, value: unknown): void => {
    if (!isText(value)) { errors.push(`${label} must be a file path under tatemonos/${parsed.meta.name}/assets/`); return }
    if (!assetExists(value)) errors.push(`${label}: "${value}" does not exist under tatemonos/${parsed.meta.name}/assets/`)
  }
  const checkEnum = (label: string, value: unknown, allowed: string[]): void => {
    if (value !== undefined && !(typeof value === 'string' && allowed.includes(value))) {
      errors.push(`${label} must be one of: ${allowed.join(', ')} (got ${JSON.stringify(value)})`)
    }
  }
  const checkBool = (label: string, value: unknown): void => {
    if (value !== undefined && typeof value !== 'boolean') errors.push(`${label} must be true or false`)
  }
  const checkText = (label: string, value: unknown): void => {
    if (value !== undefined && !isText(value)) errors.push(`${label} must be a non-empty string`)
  }
  const checkPatterns = (label: string, value: unknown): void => {
    if (!isTexts(value)) { errors.push(`${label} must be a list of match patterns`); return }
    for (const pattern of value) {
      const problem = extMatchPatternProblem(pattern)
      if (problem) errors.push(`${label}: "${pattern}" is not a valid match pattern (${problem})`)
    }
  }
  // Popup, side panel, pages and content UI are React surfaces with no router.
  const checkUiBody = (label: string, raw: string): void => {
    if (!/export\s+default\b/.test(raw)) {
      errors.push(`${label} must \`export default\` a React component`)
    }
    if (/from\s+['"](?:@\/arkzen\/core\/adapters[^'"]*|next\/(?:link|navigation|router)|react-router(?:-dom)?|@inertiajs\/[^'"]+)['"]/.test(raw)) {
      warnings.push(`${label} imports the router adapter or a router package. Extension surfaces have no router, so links and navigation hooks will not work there.`)
    }
  }
  const checkNames = (kind: string, blocks: { name: string }[]): void => {
    const seen = new Set<string>()
    for (const block of blocks) {
      if (!EXT_NAME_RE.test(block.name)) {
        errors.push(`@arkzen:ext:${kind}:${block.name}: the name must be lowercase kebab-case (letters, digits, hyphens, starting with a letter)`)
      }
      if (seen.has(block.name)) errors.push(`Duplicate @arkzen:ext:${kind}:${block.name}`)
      seen.add(block.name)
    }
  }

  // ── project ───────────────────────────────────
  const projectData = ext.project?.data
  const project: Record<string, unknown> = isMap(projectData) ? projectData : {}
  if (!ext.project) {
    errors.push('@arkzen:ext:project is required when a tatemono has extension blocks (it holds the extension name, permissions and targets)')
  } else if (!isMap(projectData)) {
    errors.push('@arkzen:ext:project must be a YAML mapping')
  } else {
    if (!isText(project.name)) errors.push('@arkzen:ext:project needs a name:')
    for (const key of ['short_name', 'description', 'author', 'homepage_url', 'default_locale', 'omnibox_keyword']) {
      checkText(`@arkzen:ext:project ${key}`, project[key])
    }
    for (const key of ['version', 'minimum_chrome_version']) {
      const v = project[key]
      if (v !== undefined && !(isText(v) || typeof v === 'number')) errors.push(`@arkzen:ext:project ${key} must be a string or a number`)
    }
    for (const key of ['permissions', 'optional_permissions']) {
      if (project[key] !== undefined && !isTexts(project[key])) errors.push(`@arkzen:ext:project ${key} must be a list of strings`)
    }
    for (const key of ['host_permissions', 'optional_host_permissions']) {
      if (project[key] !== undefined) checkPatterns(`@arkzen:ext:project ${key}`, project[key])
    }
    for (const key of ['action', 'externally_connectable', 'identity', 'oauth2', 'firefox', 'manifest_extra', 'api']) {
      if (project[key] !== undefined && !isMap(project[key])) errors.push(`@arkzen:ext:project ${key} must be a mapping`)
    }
    if (project.web_accessible_resources !== undefined && !Array.isArray(project.web_accessible_resources)) {
      errors.push('@arkzen:ext:project web_accessible_resources must be a list')
    }
    const csp = project.content_security_policy
    if (csp !== undefined && !(isText(csp) || isMap(csp))) errors.push('@arkzen:ext:project content_security_policy must be a string or a mapping')

    if (project.targets !== undefined) {
      if (!isTexts(project.targets)) {
        errors.push('@arkzen:ext:project targets must be a list of browsers')
      } else {
        for (const target of project.targets) {
          if (!EXT_BROWSERS.includes(target)) errors.push(`@arkzen:ext:project targets: unknown browser "${target}". Valid: ${EXT_BROWSERS.join(', ')}`)
        }
        if (project.targets.includes('safari')) warnings.push('@arkzen:ext:project targets includes safari. Safari packaging needs the Xcode converter and is not generated.')
      }
    }

    if (project.icons !== undefined) {
      if (!isMap(project.icons)) {
        errors.push('@arkzen:ext:project icons must map a size to a file, e.g. 128: icon-128.png')
      } else {
        for (const [size, file] of Object.entries(project.icons)) {
          if (!/^[1-9][0-9]*$/.test(size)) errors.push(`@arkzen:ext:project icons: "${size}" is not a pixel size`)
          checkAsset(`@arkzen:ext:project icons ${size}`, file)
        }
      }
    }
    if (isMap(project.action) && project.action.default_icon !== undefined) {
      checkAsset('@arkzen:ext:project action.default_icon', project.action.default_icon)
    }
    if (isMap(project.action)) checkText('@arkzen:ext:project action.default_title', project.action.default_title)

    if (isMap(project.api)) {
      for (const key of ['base_url', 'dev_base_url']) {
        const value = project.api[key]
        if (value === undefined) continue
        let ok = false
        if (isText(value)) {
          try { ok = /^https?:$/.test(new URL(value).protocol) } catch { ok = false }
        }
        if (!ok) errors.push(`@arkzen:ext:project api.${key} must be an http or https URL`)
      }
    }
    if (isMap(project.firefox)) {
      checkText('@arkzen:ext:project firefox.id', project.firefox.id)
      checkText('@arkzen:ext:project firefox.strict_min_version', project.firefox.strict_min_version)
    }
  }

  // ── at least one surface ──────────────────────
  if (!ext.popup && !ext.sidepanel && !ext.background && ext.pages.length === 0 && ext.contents.length === 0) {
    errors.push('An extension needs at least one of @arkzen:ext:popup, ext:sidepanel, ext:page:<name>, ext:content:<name> or ext:background')
  }

  // ── popup ─────────────────────────────────────
  if (ext.popup) {
    const h = ext.popup.header
    for (const key of ['width', 'height']) {
      if (h[key] !== undefined && !isPosInt(h[key])) errors.push(`@arkzen:ext:popup ${key} must be a positive integer`)
    }
    checkText('@arkzen:ext:popup title', h.title)
    checkUiBody('@arkzen:ext:popup', ext.popup.raw)
  }

  // ── side panel ────────────────────────────────
  if (ext.sidepanel) {
    const h = ext.sidepanel.header
    checkText('@arkzen:ext:sidepanel title', h.title)
    checkBool('@arkzen:ext:sidepanel open_on_action_click', h.open_on_action_click)
    checkUiBody('@arkzen:ext:sidepanel', ext.sidepanel.raw)
  }

  // ── pages ─────────────────────────────────────
  checkNames('page', ext.pages)
  const roleCounts = new Map<string, string[]>()
  for (const page of ext.pages) {
    const label = `@arkzen:ext:page:${page.name}`
    if (EXT_RESERVED_NAMES.includes(page.name)) errors.push(`${label}: "${page.name}" is the name of a dedicated block. Pick another name.`)
    const h = page.header
    const role = h.role === undefined ? 'standalone' : h.role
    if (typeof role !== 'string' || !EXT_PAGE_ROLES.includes(role)) {
      errors.push(`${label} role must be one of: ${EXT_PAGE_ROLES.join(', ')} (got ${JSON.stringify(h.role)})`)
    } else {
      roleCounts.set(role, [...(roleCounts.get(role) ?? []), page.name])
      for (const [key, only] of Object.entries(EXT_PAGE_ROLE_KEYS)) {
        if (h[key] !== undefined && role !== only) warnings.push(`${label}: ${key} only applies to role ${only} and is ignored for role ${role}`)
      }
      if (role === 'offscreen') {
        if (!isTexts(h.reasons) || h.reasons.length === 0) errors.push(`${label}: an offscreen page needs reasons: (a non-empty list)`)
        if (!isText(h.justification)) errors.push(`${label}: an offscreen page needs justification:`)
      }
    }
    checkText(`${label} title`, h.title)
    checkBool(`${label} open_in_tab`, h.open_in_tab)
    checkText(`${label} panel_title`, h.panel_title)
    if (h.panel_icon !== undefined) checkAsset(`${label} panel_icon`, h.panel_icon)
    checkUiBody(label, page.raw)
  }
  for (const role of EXT_SINGLE_SLOT_ROLES) {
    const names = roleCounts.get(role) ?? []
    if (names.length > 1) errors.push(`Only one @arkzen:ext:page can have role ${role} (found: ${names.join(', ')})`)
  }

  // ── content scripts ───────────────────────────
  checkNames('content', ext.contents)
  const styleNames = new Set(parsed.styles.flatMap(s => (s.name ? [s.name] : [])))
  for (const content of ext.contents) {
    const label = `@arkzen:ext:content:${content.name}`
    if (EXT_RESERVED_NAMES.includes(content.name)) errors.push(`${label}: "${content.name}" is the name of a dedicated block. Pick another name.`)
    const h = content.header
    if (h.matches === undefined) errors.push(`${label} needs matches: (the pages it runs on)`)
    else checkPatterns(`${label} matches`, h.matches)
    if (h.exclude_matches !== undefined) checkPatterns(`${label} exclude_matches`, h.exclude_matches)
    checkEnum(`${label} run_at`, h.run_at, EXT_RUN_AT)
    checkEnum(`${label} world`, h.world, EXT_WORLDS)
    checkBool(`${label} all_frames`, h.all_frames)
    checkBool(`${label} match_about_blank`, h.match_about_blank)
    if (h.mode === undefined) {
      errors.push(`${label} needs mode: ui (a React component) or mode: script (plain TypeScript)`)
    } else {
      checkEnum(`${label} mode`, h.mode, EXT_CONTENT_MODES)
    }
    const isUi = h.mode === 'ui'
    if (h.ui !== undefined) {
      if (!isUi) {
        errors.push(`${label}: ui: only applies to mode: ui`)
      } else if (!isMap(h.ui)) {
        errors.push(`${label} ui must be a mapping`)
      } else {
        checkEnum(`${label} ui.position`, h.ui.position, EXT_UI_POSITIONS)
        checkEnum(`${label} ui.append`, h.ui.append, EXT_UI_APPENDS)
        checkEnum(`${label} ui.isolate`, h.ui.isolate, EXT_UI_ISOLATES)
        checkText(`${label} ui.anchor`, h.ui.anchor)
        if (h.ui.z_index !== undefined && !(typeof h.ui.z_index === 'number' && Number.isInteger(h.ui.z_index))) {
          errors.push(`${label} ui.z_index must be an integer`)
        }
      }
    }
    if (h.style !== undefined) {
      if (!isUi) warnings.push(`${label}: style: only applies to mode: ui and is ignored`)
      if (!isText(h.style)) errors.push(`${label} style must be the name of a @arkzen:web:style:<Name> block`)
      else if (!styleNames.has(h.style)) errors.push(`${label}: style "${h.style}" is not defined. Add @arkzen:web:style:${h.style}`)
    }
    if (isUi) checkUiBody(label, content.raw)
  }

  // ── background ────────────────────────────────
  if (ext.background) {
    const h = ext.background.header
    checkEnum('@arkzen:ext:background type', h.type, ['module'])
    checkBool('@arkzen:ext:background persistent', h.persistent)
  }

  // ── shared scripts ────────────────────────────
  checkNames('script', ext.scripts)

  // ── commands ──────────────────────────────────
  if (ext.commands) {
    const data = ext.commands.data
    if (!Array.isArray(data) || data.length === 0) {
      errors.push('@arkzen:ext:commands must be a YAML list of commands (each with id, key, description)')
    } else {
      const ids = new Set<string>()
      data.forEach((entry, i) => {
        const label = `@arkzen:ext:commands item ${i + 1}`
        if (!isMap(entry)) { errors.push(`${label} must be a mapping`); return }
        if (!isText(entry.id)) { errors.push(`${label} needs an id:`); return }
        if (ids.has(entry.id)) errors.push(`${label}: duplicate command id "${entry.id}"`)
        ids.add(entry.id)
        checkText(`@arkzen:ext:commands "${entry.id}" key`, entry.key)
        checkBool(`@arkzen:ext:commands "${entry.id}" global`, entry.global)
        if (!entry.id.startsWith('_execute_') && !isText(entry.description)) {
          errors.push(`@arkzen:ext:commands "${entry.id}" needs a description:`)
        }
        if (!entry.id.startsWith('_execute_') && !ext.background) {
          warnings.push(`@arkzen:ext:commands "${entry.id}" has no @arkzen:ext:background to handle it (register it with ext.commands.on)`)
        }
      })
    }
  }

  // ── menus ─────────────────────────────────────
  if (ext.menus) {
    const data = ext.menus.data
    if (!Array.isArray(data) || data.length === 0) {
      errors.push('@arkzen:ext:menus must be a YAML list of menu items (each with id, title, contexts)')
    } else {
      const ids = new Set<string>()
      for (const entry of data) if (isMap(entry) && isText(entry.id)) ids.add(entry.id)
      const seen = new Set<string>()
      data.forEach((entry, i) => {
        const label = `@arkzen:ext:menus item ${i + 1}`
        if (!isMap(entry)) { errors.push(`${label} must be a mapping`); return }
        if (!isText(entry.id)) { errors.push(`${label} needs an id:`); return }
        if (seen.has(entry.id)) errors.push(`${label}: duplicate menu id "${entry.id}"`)
        seen.add(entry.id)
        checkEnum(`@arkzen:ext:menus "${entry.id}" type`, entry.type, EXT_MENU_TYPES)
        if (entry.type !== 'separator' && !isText(entry.title)) errors.push(`@arkzen:ext:menus "${entry.id}" needs a title:`)
        if (entry.contexts !== undefined) {
          if (!isTexts(entry.contexts)) {
            errors.push(`@arkzen:ext:menus "${entry.id}" contexts must be a list of strings`)
          } else {
            for (const c of entry.contexts) {
              if (!EXT_MENU_CONTEXTS.includes(c)) warnings.push(`@arkzen:ext:menus "${entry.id}": context "${c}" is not a Chrome menu context (${EXT_MENU_CONTEXTS.join(', ')}). Check it is valid for your target browser.`)
            }
          }
        }
        if (entry.parent !== undefined) {
          if (!isText(entry.parent) || !ids.has(entry.parent)) errors.push(`@arkzen:ext:menus "${entry.id}": parent "${String(entry.parent)}" is not a menu id in this block`)
          else if (entry.parent === entry.id) errors.push(`@arkzen:ext:menus "${entry.id}" cannot be its own parent`)
        }
        if (entry.document_url_patterns !== undefined) checkPatterns(`@arkzen:ext:menus "${entry.id}" document_url_patterns`, entry.document_url_patterns)
      })
      if (!ext.background) warnings.push('@arkzen:ext:menus has no @arkzen:ext:background to handle clicks (register handlers with ext.menus.on)')
    }
  }

  // ── rules ─────────────────────────────────────
  if (ext.rules) {
    const data = ext.rules.data
    if (!isMap(data) || !Array.isArray(data.rulesets) || data.rulesets.length === 0) {
      errors.push('@arkzen:ext:rules needs rulesets: (a non-empty list of { id, enabled, rules })')
    } else {
      const ids = new Set<string>()
      data.rulesets.forEach((set, i) => {
        const label = `@arkzen:ext:rules ruleset ${i + 1}`
        if (!isMap(set)) { errors.push(`${label} must be a mapping`); return }
        if (!isText(set.id)) { errors.push(`${label} needs an id:`); return }
        if (ids.has(set.id)) errors.push(`${label}: duplicate ruleset id "${set.id}"`)
        ids.add(set.id)
        checkBool(`@arkzen:ext:rules "${set.id}" enabled`, set.enabled)
        if (!Array.isArray(set.rules)) errors.push(`@arkzen:ext:rules "${set.id}" needs rules: (a list)`)
      })
    }
  }

  // ── locales ───────────────────────────────────
  const localeCodes = new Set<string>()
  for (const locale of ext.locales) {
    const label = `@arkzen:ext:locale:${locale.name}`
    if (!EXT_LOCALE_RE.test(locale.name)) errors.push(`${label}: "${locale.name}" is not a locale code (examples: en, pt_BR, zh_CN)`)
    if (localeCodes.has(locale.name)) errors.push(`Duplicate ${label}`)
    localeCodes.add(locale.name)
    const data = locale.data
    if (!isMap(data) || !isMap(data.messages) || Object.keys(data.messages).length === 0) {
      errors.push(`${label} needs messages: (a mapping of key to { message, description })`)
    } else {
      for (const [key, value] of Object.entries(data.messages)) {
        if (!isMap(value) || !isText(value.message)) errors.push(`${label} messages.${key} needs a message:`)
      }
    }
  }
  const defaultLocale = project.default_locale
  if (ext.locales.length > 0) {
    if (!isText(defaultLocale)) errors.push('@arkzen:ext:project needs default_locale: when @arkzen:ext:locale blocks exist')
    else if (!localeCodes.has(defaultLocale)) errors.push(`@arkzen:ext:project default_locale "${defaultLocale}" has no @arkzen:ext:locale:${defaultLocale} block`)
  } else if (defaultLocale !== undefined) {
    errors.push('@arkzen:ext:project sets default_locale but there is no @arkzen:ext:locale block')
  }

  // ── export ────────────────────────────────────
  if (ext.export) {
    const data = ext.export.data
    if (!isMap(data)) {
      errors.push('@arkzen:ext:export must be a YAML mapping')
    } else {
      if (data.browsers !== undefined) {
        if (!isTexts(data.browsers) || data.browsers.length === 0) {
          errors.push('@arkzen:ext:export browsers must be a non-empty list of browsers')
        } else {
          for (const browser of data.browsers) {
            if (!EXT_BROWSERS.includes(browser)) errors.push(`@arkzen:ext:export browsers: unknown browser "${browser}". Valid: ${EXT_BROWSERS.join(', ')}`)
          }
          if (data.browsers.includes('safari')) warnings.push('@arkzen:ext:export browsers includes safari. Safari packaging needs the Xcode converter and is not generated.')
          if (isTexts(project.targets)) {
            for (const browser of data.browsers) {
              if (!project.targets.includes(browser)) warnings.push(`@arkzen:ext:export builds for ${browser} but @arkzen:ext:project targets does not list it`)
            }
          }
        }
      }
      if (data.manifest_version !== undefined) {
        if (!isMap(data.manifest_version)) {
          errors.push('@arkzen:ext:export manifest_version must map a browser to 2 or 3, e.g. firefox: 3')
        } else {
          for (const [browser, version] of Object.entries(data.manifest_version)) {
            if (!EXT_BROWSERS.includes(browser)) errors.push(`@arkzen:ext:export manifest_version: unknown browser "${browser}"`)
            if (version !== 2 && version !== 3) errors.push(`@arkzen:ext:export manifest_version.${browser} must be 2 or 3`)
          }
        }
      }
      checkBool('@arkzen:ext:export zip', data.zip)
      checkBool('@arkzen:ext:export sources_zip', data.sources_zip)
      checkText('@arkzen:ext:export name_suffix', data.name_suffix)
    }
  }

  return { errors, warnings }
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN VALIDATOR
// ────────────────────────────────────────────────────────────────────────────

export function validateTatemono(filePath: string): ValidationResult {
  const errors:   string[] = []
  const warnings: string[] = []

  let parsed: ParsedTatemono

  try {
    parsed = parseTatemono(filePath)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { valid: false, errors: [msg], warnings }
  }

  // ── 1. Structure ─────────────────────────────

  // ── 0. Backend variants (v13.0) ──────────────
  // Code blocks (endpoint, handler, policy, middleware, listener, jobs,
  // console, notifications/mail with a body) need a variant for the active
  // backend. Without one the tatemono is inactive on that backend.
  try {
    const variant = activeBackendVariant(filePath)
    const backend = resolveActiveBackend(filePath)
    const missing = findMissingBackendVariants(fs.readFileSync(filePath, 'utf-8'), variant)
    for (const m of missing) {
      errors.push(
        `@arkzen:${m.marker}:${m.name} has no :${variant} variant for backend "${backend}" ` +
        `(found: ${m.available.join(', ')}). Add /* @arkzen:${m.marker}:${variant}:${m.name} ... :end */ ` +
        `or switch backend. This tatemono is inactive on ${backend}.`
      )
    }
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e))
  }

  try {
    if (resolveActiveBackend(filePath) === 'rust') {
      errors.push(...validateRustModuleBlocks(fs.readFileSync(filePath, 'utf-8')))
    }
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e))
  }

  if (parsed.desktopConfig) {
    const windowConfig = parsed.desktopConfig.window
    if (
      windowConfig !== undefined &&
      (!windowConfig || typeof windowConfig !== 'object' || Array.isArray(windowConfig))
    ) {
      errors.push('@arkzen:desktop:config window must be a mapping')
    } else if (windowConfig) {
      for (const key of ['width', 'height', 'min_width', 'min_height'] as const) {
        const value = windowConfig[key]
        if (value !== undefined && (!Number.isInteger(value) || value <= 0)) {
          errors.push(`@arkzen:desktop:config window.${key} must be a positive integer`)
        }
      }
      for (const key of ['resizable', 'fullscreenable'] as const) {
        const value = windowConfig[key]
        if (value !== undefined && typeof value !== 'boolean') {
          errors.push(`@arkzen:desktop:config window.${key} must be true or false`)
        }
      }
      if (windowConfig.title !== undefined && (typeof windowConfig.title !== 'string' || !windowConfig.title.trim())) {
        errors.push('@arkzen:desktop:config window.title must be a non-empty string')
      }
      if (
        windowConfig.width !== undefined &&
        windowConfig.min_width !== undefined &&
        windowConfig.min_width > windowConfig.width
      ) {
        errors.push('@arkzen:desktop:config window.min_width cannot exceed window.width')
      }
      if (
        windowConfig.height !== undefined &&
        windowConfig.min_height !== undefined &&
        windowConfig.min_height > windowConfig.height
      ) {
        errors.push('@arkzen:desktop:config window.min_height cannot exceed window.height')
      }
    }
  }

  // v15.0: frame blocks (opt-in)
  if (parsed.frames) {
    const frameResult = validateFrames(parsed)
    errors.push(...frameResult.errors)
    warnings.push(...frameResult.warnings)
  }

  // v17.0: extension blocks (opt-in)
  if (parsed.ext) {
    const extResult = validateExt(parsed, filePath)
    errors.push(...extResult.errors)
    warnings.push(...extResult.warnings)
  }

  const hasFreeFiles = hasFileBlocks(fs.readFileSync(filePath, 'utf-8'))

  // v14.1: @arkzen:file blocks are valid without any page
  // v17.0: @arkzen:ext blocks are valid without any page (validateExt checks the ext contracts)
  if (!hasFreeFiles && !parsed.ext && parsed.pages.length === 0 && parsed.nativePages.length === 0 && parsed.nativeLynxPages.length === 0) {
    errors.push('At least one @arkzen:web:page:name, @arkzen:native:page:name, or @arkzen:native:page:lynx:name section is required')
  }

  if (hasFreeFiles) {
    try { errors.push(...validateFileBlocks(filePath, parsed.meta.name)) }
    catch (e) { errors.push(e instanceof Error ? e.message : String(e)) }
  }

  const extOnly = !!parsed.ext && parsed.pages.length === 0 && parsed.nativePages.length === 0 && parsed.nativeLynxPages.length === 0
  if (!hasFreeFiles && !extOnly && parsed.components.length === 0 && parsed.nativeComponents.length === 0 && parsed.nativeLynxComponents.length === 0) {
    warnings.push('No @arkzen:components or @arkzen:native:components found – consider adding shared UI components.')
  }

  // ── 2. Database ───────────────────────────────
  const tableNames = new Set(parsed.databases.map(d => d.table))
  tableNames.add('users')
  const tablePrefix = parsed.meta.name.replace(/-/g, '_')
  for (const db of parsed.databases) {
    tableNames.add(`${tablePrefix}_${db.table}`)
  }

  for (const db of parsed.databases) {
    if (!/^[a-z][a-z0-9_]*s$/.test(db.table) && db.table !== 'users' && !db.table.endsWith('_log')) {
      warnings.push(`Table "${db.table}" should be plural snake_case (e.g., "${db.table}s")`)
    }

    for (const [colName, col] of Object.entries(db.columns)) {
      if (col.type === 'enum') {
        errors.push(
          `Table "${db.table}", column "${colName}": type "enum" is unsupported; ` +
          `use type "string" and check allowed values in the endpoint code.`
        )
      } else if (!VALID_COLUMN_TYPES.has(col.type)) {
        errors.push(`Table "${db.table}", column "${colName}": invalid type "${col.type}"`)
      }

      if (col.foreign) {
        const [refTable] = col.foreign.split('.')
        if (!tableNames.has(refTable)) {
          errors.push(
            `Table "${db.table}", column "${colName}": foreign key references unknown table "${refTable}". ` +
            `Only tables within this tatemono or "users" are allowed.`
          )
        }
      }
    }

  }

  const circularErrors = detectCircularDeps(parsed.databases)
  errors.push(...circularErrors)

  const seenTables = new Set<string>()
  for (const db of parsed.databases) {
    if (seenTables.has(db.table)) {
      errors.push(`Duplicate table declaration: "${db.table}"`)
    }
    seenTables.add(db.table)
  }

  // ── 3. API ────────────────────────────────────
  for (const api of parsed.apis) {
    if (!api.controller.endsWith('Controller')) {
      errors.push(`API controller "${api.controller}" must end with "Controller" (e.g., "${api.controller}Controller")`)
    }

    if (!/^[A-Z][a-zA-Z0-9]*$/.test(api.model)) {
      errors.push(`API model "${api.model}" must be PascalCase`)
    }

    if (!api.prefix.startsWith('/api/')) {
      errors.push(`API prefix "${api.prefix}" must start with /api/ (e.g., /api/${api.model.toLowerCase()}s)`)
    }

    for (const [epName, ep] of Object.entries(api.endpoints)) {
      if (ep.method && !VALID_METHODS.has(ep.method)) {
        errors.push(`API "${api.controller}", endpoint "${epName}": invalid method "${ep.method}"`)
      }
    }
  }

  const seenControllers = new Set<string>()
  for (const api of parsed.apis) {
    if (seenControllers.has(api.controller)) {
      errors.push(`Duplicate controller: "${api.controller}"`)
    }
    seenControllers.add(api.controller)
  }

  // ── 4. Pages (web) ──────────────────────────────
  const declaredWebLayouts = new Set(parsed.layouts.map(layout => layout.name))

  for (const page of parsed.pages) {
    const { layout } = parsePageLayoutDecl(page.layout)
    const missingLayouts = (layout?.split(':') ?? []).filter(name => !declaredWebLayouts.has(name))
    if (missingLayouts.length > 0) {
      errors.push(
        `Web page "${page.name}": layout "${missingLayouts.join(':')}" is not defined. ` +
        `Valid layouts: ${[...declaredWebLayouts].join(', ') || '(none)'}. ` +
        `To define a custom layout, use @arkzen:web:layout:${missingLayouts[0]}`
      )
    }
  }

  if (parsed.meta.auth) {
    const guestPages = parsed.pages.filter(page => parsePageLayoutDecl(page.layout).guard === 'guest')
    const authPages  = parsed.pages.filter(page => parsePageLayoutDecl(page.layout).guard === 'auth')
    if (guestPages.length === 0 && authPages.length > 0) {
      warnings.push(
        'auth: true is set but no guest (public) pages found. ' +
        'Users will have no way to log in. Add @arkzen:web:page:layout:guest to a login page.'
      )
    }
  }

  // Native blocks may be shared across Expo/RN or explicitly target one runtime.
  // The parser and builders resolve those imports; markerless legacy blocks are valid.

  // Duplicate native page names
  // Same rule as the parser's own check: one page name may be declared once per
  // Expo/RN target (dual-target tatemonos like shan-shan carry `index` for both).
  // Stacks with no native target (web, lynx) keep both blocks, so comparing names
  // alone would wrongly reject them.
  const seenNativePages = new Map<string, 'expo' | 'rn' | null>()
  for (const page of parsed.nativePages) {
    const target = page.raw.match(/@arkzen:(?:resolved:import|import:)\s*:?\s*(expo|rn)/)?.[1] as 'expo' | 'rn' | undefined
    const previousTarget = seenNativePages.get(page.name)
    if (seenNativePages.has(page.name) && (!target || !previousTarget || target === previousTarget)) {
      errors.push(`Duplicate native page: "${page.name}"`)
    }
    seenNativePages.set(page.name, target ?? null)
  }

  const seenLynxPages = new Set<string>()
  for (const page of parsed.nativeLynxPages) {
    if (seenLynxPages.has(page.name)) {
      errors.push(`Duplicate Lynx page: "${page.name}"`)
    }
    seenLynxPages.add(page.name)
  }

  const nativeLayoutNames = new Set(
    parsed.nativeLayouts.flatMap(layout => layout.name ? [layout.name] : [])
  )
  validateNativePageLayouts(parsed.nativePages, nativeLayoutNames, 'Native', 'native:layout', errors)

  const lynxLayoutNames = new Set(
    parsed.nativeLynxLayouts.flatMap(layout => layout.name ? [layout.name] : [])
  )
  validateNativePageLayouts(parsed.nativeLynxPages, lynxLayoutNames, 'Lynx', 'native:layout:lynx', errors)

  // ── 6. Consistency ────────────────────────────
  for (const api of parsed.apis) {
    const expectedTable = pluralizeTableName(toSnakeCase(api.model))
    const hasTable = parsed.databases.some(d => d.table === expectedTable || d.table === toSnakeCase(api.model))
    if (!hasTable && parsed.databases.length > 0) {
      warnings.push(
        `API model "${api.model}" expects table "${expectedTable}" — ` +
        `ensure a @arkzen:database block declares table: ${expectedTable}`
      )
    }
  }

  for (const db of parsed.databases) {
    if (db.table === 'users' && db.columns['role']) {
      warnings.push(`users table uses custom "role" column — ensure your auth logic handles this`)
    }
  }

  const valid = errors.length === 0

  if (valid) {
    console.log(`\n✓ Valid tatemono: ${parsed.meta.name}`)
    console.log(`  - ${parsed.databases.length} table(s): ${parsed.databases.map(d => d.table).join(', ')}`)
    console.log(`  - ${parsed.apis.length} resource(s): ${parsed.apis.map(a => a.model).join(', ')}`)
    console.log(`  - ${parsed.pages.length} web page(s): ${parsed.pages.map(p => `${p.name}[${p.layout}]`).join(', ')}`)
    console.log(`  - ${parsed.nativePages.length} native page(s): ${parsed.nativePages.map(p => p.name).join(', ')}`)
    if (parsed.nativeLynxPages.length > 0) {
      console.log(`  - ${parsed.nativeLynxPages.length} Lynx page(s): ${parsed.nativeLynxPages.map(p => p.name).join(', ')}`)
    }
    if (warnings.length > 0) {
      console.log(`  - ${warnings.length} warning(s):`)
      warnings.forEach(w => console.log(`    ⚠ ${w}`))
    } else {
      console.log(`  - No warnings`)
    }
  } else {
    console.log(`\n✗ Invalid tatemono: ${parsed.meta.name}`)
    errors.forEach(e => console.log(`  ✗ ${e}`))
    if (warnings.length > 0) {
      warnings.forEach(w => console.log(`  ⚠ ${w}`))
    }
  }

  return {
    valid,
    errors,
    warnings,
    summary: valid ? {
      tables:    parsed.databases.map(d => d.table),
      pages:     parsed.pages.map(p => p.name),
      resources: parsed.apis.map(a => a.model),
    } : undefined,
  }
}

// ─────────────────────────────────────────────
// CIRCULAR DEPENDENCY DETECTION
// ─────────────────────────────────────────────

function detectCircularDeps(databases: ArkzenDatabase[]): string[] {
  const errors: string[] = []
  const deps = new Map<string, Set<string>>()

  for (const db of databases) {
    const d = new Set<string>()
    for (const col of Object.values(db.columns)) {
      if (!col.foreign) continue
      const referenced = col.foreign.split('.')[0]
      // A table may point to itself (comment replies, category trees, manager of an employee).
      // That is not a loop between tables, so it is not counted as a dependency.
      if (referenced !== db.table) d.add(referenced)
    }
    deps.set(db.table, d)
  }

  function hasCycle(table: string, visited: Set<string>, stack: Set<string>): boolean {
    visited.add(table)
    stack.add(table)
    for (const dep of deps.get(table) ?? []) {
      if (!visited.has(dep)) {
        if (hasCycle(dep, visited, stack)) return true
      } else if (stack.has(dep)) {
        return true
      }
    }
    stack.delete(table)
    return false
  }

  const visited = new Set<string>()
  for (const db of databases) {
    if (!visited.has(db.table)) {
      if (hasCycle(db.table, visited, new Set())) {
        errors.push(`Circular foreign key dependency detected involving table "${db.table}"`)
      }
    }
  }

  return errors
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function toSnakeCase(str: string): string {
  return str.replace(/(?<!^)([A-Z])/g, '_$1').toLowerCase()
}

function pluralizeTableName(name: string): string {
  if (/[^aeiou]y$/i.test(name)) return `${name.slice(0, -1)}ies`
  if (/(s|x|z|ch|sh)$/i.test(name)) return `${name}es`
  return `${name}s`
}

function validateRustModuleBlocks(source: string): string[] {
  const normalized = source.replace(/\r\n?/g, '\n')
  const startMarker = '/* @arkzen:module:rs\n*/'
  const endMarker = '/* @arkzen:module:rs:end */'
  const startCount = normalized.split(startMarker).length - 1
  const endCount = normalized.split(endMarker).length - 1

  if (startCount > 1) return ['@arkzen:module:rs may appear at most once per Tatemono']
  if (startCount === 0) {
    return endCount ? ['@arkzen:module:rs has an end marker but no opening marker'] : []
  }
  if (endCount === 0) return ['@arkzen:module:rs is missing its matching :end marker']
  if (endCount > 1) return ['@arkzen:module:rs has more than one :end marker']

  const start = normalized.indexOf(startMarker)
  const bodyStart = start + startMarker.length
  const end = normalized.indexOf(endMarker, bodyStart)
  if (end < 0) return ['@arkzen:module:rs end marker must follow its opening marker']
  return []
}

function validateNativePageLayouts(
  pages: Array<{ name: string; layout?: string }>,
  declaredLayouts: Set<string>,
  target: string,
  marker: string,
  errors: string[],
): void {
  for (const page of pages) {
    const rawLayout = page.layout ?? 'default'
    if (rawLayout === 'default') continue
    const { layout } = parsePageLayoutDecl(rawLayout)
    const missingLayouts = (layout?.split(':') ?? [])
      .filter(name => !declaredLayouts.has(name))

    if (missingLayouts.length > 0) {
      errors.push(
        `${target} page "${page.name}": layout "${missingLayouts.join(':')}" is not defined. ` +
        `Valid layouts: ${[...declaredLayouts].join(', ') || '(none)'}. ` +
        `To define a custom layout, use @arkzen:${marker}:${missingLayouts[0]}`
      )
    }
  }
}
