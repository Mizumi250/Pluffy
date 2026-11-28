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
import { spawnSync } from 'child_process'
import { parsePageLayoutDecl, parseTatemono, findMissingBackendVariants } from './parser'
import { activeBackendVariant, resolveActiveBackend } from './backends'
import { hasFileBlocks, validateFileBlocks } from './file-writer'
import type { ParsedTatemono, ValidationResult, ArkzenDatabase, ArkzenPkgBlock } from '../types'

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

// ─────────────────────────────────────────────
// PACKAGE BLOCKS (v18.0)
// @arkzen:pkg:project, target, exports, build, verify, sdk, types, validators, openapi,
// backend, assets, template, plugin, source, test, readme.
// The parser reads the structure; every contract is checked here so a wrong value is
// reported before the package build. Only Tatemonos that declare a pkg block are checked.
// ─────────────────────────────────────────────

const PKG_REGISTRIES = ['npm', 'jsr', 'pypi', 'crates', 'go', 'maven', 'nuget', 'packagist', 'github']
const PKG_LANGS      = ['ts', 'py', 'rs', 'go', 'java', 'cs', 'php']
const PKG_KINDS      = ['library', 'components', 'plugin', 'config', 'template', 'assets', 'cli', 'backend', 'sdk', 'types', 'validators', 'openapi']
const PKG_BACKENDS   = ['laravel', 'express', 'fastapi', 'go', 'rust', 'spring-boot', 'aspnet']
const PKG_FORMATS    = ['esm', 'cjs', 'dts']
const PKG_ID_RE      = /^[a-z][a-z0-9-]*$/
const PKG_SEMVER_RE  = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
const PKG_SECRET_KEY = /(token|password|passwd|secret|private[_-]?key|api[_-]?key|credential)/i

// Registry to the language its source blocks are written in. github follows the package's language.
const PKG_REGISTRY_LANG: Record<string, string | null> = {
  npm: 'ts', jsr: 'ts', pypi: 'py', crates: 'rs', go: 'go', maven: 'java', nuget: 'cs', packagist: 'php', github: null,
}

// Common SPDX identifiers. An id outside this list is a warning, not an error,
// because the full SPDX list is not bundled with the engine.
const PKG_SPDX = new Set([
  '0BSD', 'AGPL-3.0-only', 'AGPL-3.0-or-later', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'BSL-1.0',
  'CC0-1.0', 'CC-BY-4.0', 'CC-BY-SA-4.0', 'EPL-2.0', 'GPL-2.0-only', 'GPL-2.0-or-later', 'GPL-3.0-only',
  'GPL-3.0-or-later', 'ISC', 'LGPL-2.1-only', 'LGPL-2.1-or-later', 'LGPL-3.0-only', 'LGPL-3.0-or-later',
  'MIT', 'MIT-0', 'MPL-2.0', 'Unlicense', 'Zlib', 'UNLICENSED',
])

// Which blocks each kind needs (R) and does not use (X). Everything else is optional.
// Source: PLUFFY_PACKAGE_PLAN.md section 6.7.
const PKG_DERIVED_BLOCKS = ['sdk', 'types', 'validators', 'openapi']
const PKG_KIND_RULES: Record<string, { required: string[]; unused: string[] }> = {
  library:    { required: ['project', 'target', 'exports', 'source'],
                unused:   [...PKG_DERIVED_BLOCKS, 'backend', 'assets', 'template', 'plugin'] },
  components: { required: ['project', 'target', 'exports'],
                unused:   [...PKG_DERIVED_BLOCKS, 'backend', 'template', 'plugin'] },
  plugin:     { required: ['project', 'target', 'exports', 'source', 'plugin'],
                unused:   [...PKG_DERIVED_BLOCKS, 'backend', 'assets', 'template'] },
  config:     { required: ['project', 'target', 'exports'],
                unused:   ['build', 'test', ...PKG_DERIVED_BLOCKS, 'backend', 'assets', 'template', 'plugin'] },
  template:   { required: ['project', 'target', 'template'],
                unused:   ['exports', 'build', 'source', 'test', ...PKG_DERIVED_BLOCKS, 'backend', 'plugin'] },
  assets:     { required: ['project', 'target', 'exports', 'assets'],
                unused:   ['build', 'source', 'test', ...PKG_DERIVED_BLOCKS, 'backend', 'template', 'plugin'] },
  cli:        { required: ['project', 'target', 'exports', 'source'],
                unused:   [...PKG_DERIVED_BLOCKS, 'backend', 'assets', 'template', 'plugin'] },
  backend:    { required: ['project', 'target', 'backend'],
                unused:   ['exports', ...PKG_DERIVED_BLOCKS, 'assets', 'template', 'plugin'] },
  sdk:        { required: ['project', 'target', 'sdk'],
                unused:   ['types', 'validators', 'openapi', 'backend', 'assets', 'template', 'plugin'] },
  types:      { required: ['project', 'target', 'types'],
                unused:   ['source', 'test', 'sdk', 'validators', 'openapi', 'backend', 'assets', 'template', 'plugin'] },
  validators: { required: ['project', 'target', 'validators'],
                unused:   ['sdk', 'types', 'openapi', 'backend', 'assets', 'template', 'plugin'] },
  openapi:    { required: ['project', 'target', 'openapi'],
                unused:   ['build', 'source', 'test', 'sdk', 'types', 'validators', 'backend', 'assets', 'template', 'plugin'] },
}

// Name rules per registry (from each registry's own naming rules; not tested against the registries).
const PKG_NPM_NAME_RE       = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
const PKG_JSR_NAME_RE       = /^@[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*$/
const PKG_PYPI_NAME_RE      = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/
const PKG_CRATE_NAME_RE     = /^[A-Za-z][A-Za-z0-9_-]*$/
const PKG_NUGET_NAME_RE     = /^[A-Za-z0-9_](?:[A-Za-z0-9_.-]*[A-Za-z0-9_])?$/
const PKG_PACKAGIST_NAME_RE = /^[a-z0-9](?:[_.-]?[a-z0-9]+)*\/[a-z0-9](?:(?:[_.]|-{1,2})?[a-z0-9]+)*$/
const PKG_MAVEN_PART_RE     = /^[A-Za-z0-9_.-]+$/
const PKG_GO_MODULE_RE      = /^[A-Za-z0-9][A-Za-z0-9._~-]*(?:\/[A-Za-z0-9._~-]+)+$/

const PKG_STACK_IMPORT_RE   = /from\s+['"]@\/arkzen\/core|from\s+['"][^'"]*arkzen\/core|adapters\/router|adapters\/Link/

function validatePkg(parsed: ParsedTatemono, filePath: string): { errors: string[]; warnings: string[] } {
  const errors:   string[] = []
  const warnings: string[] = []
  const pkg = parsed.pkg
  if (!pkg) return { errors, warnings }

  const source = (() => { try { return fs.readFileSync(filePath, 'utf-8') } catch { return '' } })()
  const blocks = pkg.blocks

  // ── Secrets: no pkg block may carry a credential (Pluffy never stores or sends tokens) ──
  const scanSecrets = (label: string, value: unknown, trail: string): void => {
    if (Array.isArray(value)) { value.forEach((v, i) => scanSecrets(label, v, `${trail}[${i}]`)); return }
    if (!isMap(value)) return
    for (const [key, inner] of Object.entries(value)) {
      if (PKG_SECRET_KEY.test(key)) {
        errors.push(`@arkzen:${label}: key "${trail}${key}" looks like a credential. Package blocks never hold secrets; the user's own environment (.npmrc, ~/.pypirc, ...) supplies them at publish time`)
      }
      scanSecrets(label, inner, `${trail}${key}.`)
    }
  }
  for (const b of blocks) {
    if (b.data !== undefined) scanSecrets(b.marker, b.data, '')
    if (b.header) scanSecrets(b.marker, b.header, '')
  }

  // ── Packages: one per pkg:project block ──
  const projects = blocks.filter(b => b.kind === 'project')
  if (projects.length === 0) {
    errors.push('@arkzen:pkg:project is required when a tatemono has package blocks (it holds the package name, kind, license and targets)')
    return { errors, warnings }
  }
  const idOf = (b: { id?: string }): string => b.id ?? '_default'
  const label = (id: string): string => (id === '_default' ? 'package' : `package "${id}"`)

  const ids = new Set<string>()
  for (const p of projects) {
    const id = idOf(p)
    if (id !== '_default' && !PKG_ID_RE.test(id)) {
      errors.push(`@arkzen:${p.marker}: the package id must be lowercase kebab-case (letters, digits, hyphens, starting with a letter)`)
    }
    if (ids.has(id)) errors.push(`Duplicate package id: ${label(id)}`)
    ids.add(id)
  }
  if (projects.length > 1 && projects.some(p => p.id === undefined)) {
    errors.push('When a tatemono holds more than one package, every @arkzen:pkg:project needs an id: write @arkzen:pkg:project:<package-id>')
  }
  const soleId = projects.length === 1 ? idOf(projects[0]) : undefined

  // Which package a block belongs to: its [:id], else its package: header key, else the only package.
  const ownerOf = (b: ArkzenPkgBlock): string | undefined => {
    if (b.id !== undefined) return b.id
    const fromData   = isMap(b.data)   && isText(b.data.package)   ? b.data.package   : undefined
    const fromHeader = isMap(b.header) && isText(b.header.package) ? b.header.package : undefined
    return fromData ?? fromHeader ?? soleId
  }

  const owners = new Map<ArkzenPkgBlock, string>()
  for (const b of blocks) {
    if (b.kind === 'project') { owners.set(b, idOf(b)); continue }
    const owner = ownerOf(b)
    if (owner === undefined) {
      errors.push(`@arkzen:${b.marker} does not say which package it belongs to. Add package: <id> (or use the @arkzen:pkg:${b.kind}:<package-id> form)`)
      continue
    }
    if (!ids.has(owner)) {
      errors.push(`@arkzen:${b.marker} refers to package "${owner}", which has no @arkzen:pkg:project:${owner} block`)
      continue
    }
    owners.set(b, owner)
  }
  const ofPackage = (id: string, kind: string): ArkzenPkgBlock[] =>
    blocks.filter(b => b.kind === kind && owners.get(b) === id)

  // Duplicate singleton blocks per package (the parser only rejects an identical marker).
  for (const kind of ['project', 'exports', 'build', 'verify', 'sdk', 'types', 'validators', 'openapi', 'backend', 'assets', 'template', 'plugin', 'readme']) {
    for (const id of ids) {
      if (ofPackage(id, kind).length > 1) errors.push(`${label(id)} has more than one @arkzen:pkg:${kind} block`)
    }
  }

  // ── Per package ──
  const packageFacts = new Map<string, { registries: string[]; kind?: string }>()
  for (const p of projects) {
    const id   = idOf(p)
    const data = p.data
    const tag  = `@arkzen:${p.marker}`
    if (!isMap(data)) { errors.push(`${tag} must be a YAML mapping`); continue }

    if (!isText(data.name)) errors.push(`${tag} needs name:`)
    let kind: string | undefined
    if (!isText(data.kind)) {
      errors.push(`${tag} needs kind: (${PKG_KINDS.join(', ')})`)
    } else if (!PKG_KINDS.includes(data.kind)) {
      errors.push(`${tag} kind must be one of: ${PKG_KINDS.join(', ')} (got ${JSON.stringify(data.kind)})`)
    } else {
      kind = data.kind
    }

    const version = data.version ?? parsed.meta.version
    if (typeof version !== 'string' || !PKG_SEMVER_RE.test(version)) {
      errors.push(`${tag} version must be a semver string such as 1.0.0 (got ${JSON.stringify(version)}; it defaults to meta.version)`)
    }
    if (data.license !== undefined) {
      if (!isText(data.license)) errors.push(`${tag} license must be an SPDX id such as MIT`)
      else if (!PKG_SPDX.has(data.license)) warnings.push(`${tag} license "${data.license}" is not in the common SPDX list the engine knows. Check it at spdx.org/licenses`)
    } else {
      warnings.push(`${tag} has no license:. Registries accept a package without one, but nobody can legally reuse it`)
    }
    if (data.visibility !== undefined && !(data.visibility === 'public' || data.visibility === 'private')) {
      errors.push(`${tag} visibility must be one of: public, private`)
    }
    if (data.workspace_only !== undefined && typeof data.workspace_only !== 'boolean') errors.push(`${tag} workspace_only must be true or false`)
    if (data.keywords !== undefined && !isTexts(data.keywords)) errors.push(`${tag} keywords must be a list of strings`)
    for (const key of ['description', 'author', 'repository', 'homepage', 'bugs'] as const) {
      if (data[key] !== undefined && !isText(data[key])) errors.push(`${tag} ${key} must be a non-empty string`)
    }
    if (data.runtime !== undefined && !isMap(data.runtime)) errors.push(`${tag} runtime must be a mapping (node, python, rustc, go, java, dotnet, php)`)

    let registries: string[] = []
    if (!Array.isArray(data.targets) || data.targets.length === 0) {
      errors.push(`${tag} needs targets: a list of registries (${PKG_REGISTRIES.join(', ')})`)
    } else {
      for (const t of data.targets) {
        if (typeof t !== 'string' || !PKG_REGISTRIES.includes(t)) {
          errors.push(`${tag} targets: unknown registry ${JSON.stringify(t)}. Valid: ${PKG_REGISTRIES.join(', ')}`)
        } else {
          registries.push(t)
        }
      }
      if (new Set(registries).size !== registries.length) errors.push(`${tag} targets lists a registry twice`)
    }
    packageFacts.set(id, { registries, kind })

    // kind and blocks agree (plan section 6.7)
    if (kind) {
      const rules = PKG_KIND_RULES[kind]
      for (const need of rules.required) {
        if (need === 'project') continue
        if (ofPackage(id, need).length === 0) {
          errors.push(`${label(id)} has kind: ${kind}, which needs @arkzen:pkg:${need}${need === 'source' ? ':<lang>:<name>' : need === 'target' ? ':<registry>' : ''}`)
        }
      }
      for (const no of rules.unused) {
        if (ofPackage(id, no).length > 0) errors.push(`${label(id)} has kind: ${kind}, which does not use @arkzen:pkg:${no}. Remove the block or change the kind`)
      }
    }

    // every listed registry has a target block, and every target block is listed
    const targets = ofPackage(id, 'target')
    for (const reg of registries) {
      if (!targets.some(t => t.registry === reg)) {
        errors.push(`${label(id)} lists the ${reg} registry in targets but has no @arkzen:pkg:target:${reg} block (it holds the registry name)`)
      }
    }
    for (const t of targets) {
      if (t.registry && PKG_REGISTRIES.includes(t.registry) && !registries.includes(t.registry)) {
        errors.push(`@arkzen:${t.marker} is for ${t.registry}, which is not in the targets of ${label(id)}`)
      }
    }
  }

  // ── Target blocks: names follow each registry's rules ──
  for (const t of blocks.filter(b => b.kind === 'target')) {
    const tag = `@arkzen:${t.marker}`
    const reg = t.registry as string
    if (!PKG_REGISTRIES.includes(reg)) {
      errors.push(`${tag}: unknown registry "${reg}". Valid: ${PKG_REGISTRIES.join(', ')}`)
      continue
    }
    const d = t.data
    if (!isMap(d)) { errors.push(`${tag} must be a YAML mapping`); continue }
    const name = d.name
    const need = (key: string): string | undefined => {
      if (!isText(d[key])) { errors.push(`${tag} needs ${key}:`); return undefined }
      return d[key] as string
    }
    const check = (re: RegExp, value: string | undefined, what: string): void => {
      if (value !== undefined && !re.test(value)) errors.push(`${tag} ${what} is not valid for the ${reg} registry (got ${JSON.stringify(value)})`)
    }
    switch (reg) {
      case 'npm': {
        const n = need('name')
        check(PKG_NPM_NAME_RE, n, 'name')
        if (n !== undefined && n.length > 214) errors.push(`${tag} name is longer than 214 characters`)
        break
      }
      case 'jsr':       check(PKG_JSR_NAME_RE, need('name'), 'name (JSR names need a scope: @scope/name)'); break
      case 'pypi':      check(PKG_PYPI_NAME_RE, need('name'), 'name'); break
      case 'crates': {
        const n = need('name')
        check(PKG_CRATE_NAME_RE, n, 'name')
        if (n !== undefined && n.length > 64) errors.push(`${tag} name is longer than 64 characters`)
        break
      }
      case 'go':        check(PKG_GO_MODULE_RE, need('module_path'), 'module_path (for example github.com/owner/repo)'); break
      case 'maven':
        check(PKG_MAVEN_PART_RE, need('group_id'), 'group_id')
        check(PKG_MAVEN_PART_RE, need('artifact_id'), 'artifact_id')
        break
      case 'nuget':     check(PKG_NUGET_NAME_RE, need('name'), 'name'); break
      case 'packagist': check(PKG_PACKAGIST_NAME_RE, need('name'), 'name (Packagist names are vendor/name, lowercase)'); break
      case 'github':    need('owner'); break
    }
    if (name !== undefined && !isText(name) && reg !== 'go' && reg !== 'maven') errors.push(`${tag} name must be a non-empty string`)
    for (const key of ['dependencies', 'dev_dependencies', 'peer_dependencies', 'optional_dependencies'] as const) {
      if (d[key] !== undefined && !isMap(d[key]) && !isTexts(d[key])) errors.push(`${tag} ${key} must be a mapping (name: range) or a list`)
    }
  }

  // ── Source and test blocks ──
  const names = new Set<string>()
  for (const b of blocks.filter(x => x.kind === 'source' || x.kind === 'test')) {
    const tag = `@arkzen:${b.marker}`
    const lang = b.lang as string
    if (!PKG_LANGS.includes(lang)) { errors.push(`${tag}: unknown language "${lang}". Valid: ${PKG_LANGS.join(', ')}`); continue }
    if (!/^[A-Za-z0-9_-]+$/.test(b.name as string)) errors.push(`${tag}: the file name may use letters, digits, hyphens and underscores only`)
    const dupKey = `${owners.get(b) ?? '?'}|${b.kind}|${lang}|${b.name}`
    if (names.has(dupKey)) errors.push(`Duplicate ${b.kind} block ${lang}:${b.name} in ${label(owners.get(b) ?? '?')}`)
    names.add(dupKey)

    const owner = owners.get(b)
    const facts = owner !== undefined ? packageFacts.get(owner) : undefined
    if (facts && facts.registries.length > 0) {
      const ok = facts.registries.some(r => PKG_REGISTRY_LANG[r] === lang || PKG_REGISTRY_LANG[r] === null)
      if (!ok) {
        const want = facts.registries.map(r => `${r}: ${PKG_REGISTRY_LANG[r] ?? 'any language'}`).join(', ')
        errors.push(`${tag}: ${lang} code does not match the targets of ${label(owner as string)} (${want})`)
      }
    }
    if (b.header) {
      if (b.header.ext !== undefined && !(typeof b.header.ext === 'string' && ['ts', 'tsx', 'js', 'jsx'].includes(b.header.ext))) {
        errors.push(`${tag} ext must be one of: ts, tsx, js, jsx`)
      }
      if (b.header.entry !== undefined && typeof b.header.entry !== 'boolean') errors.push(`${tag} entry must be true or false`)
      if (b.header.path !== undefined && (!isText(b.header.path) || b.header.path.includes('..') || /^([A-Za-z]:|[\\/])/.test(b.header.path))) {
        errors.push(`${tag} path must be a relative path inside the package (no .. and no absolute path)`)
      }
    }
    // published packages cannot depend on stack internals
    if (b.kind === 'source' && lang === 'ts' && b.raw && PKG_STACK_IMPORT_RE.test(b.raw)) {
      errors.push(`${tag} imports from the Pluffy stack (arkzen/core or the router adapter). A published package can only import what its own manifest declares`)
    }
  }

  // ── Exports ──
  for (const e of blocks.filter(b => b.kind === 'exports')) {
    const tag = `@arkzen:${e.marker}`
    const d = e.data
    if (!isMap(d)) { errors.push(`${tag} must be a YAML mapping`); continue }
    const owner = owners.get(e)
    const sources = new Set(blocks.filter(b => b.kind === 'source' && owners.get(b) === owner).map(b => b.name))
    if (d.entries !== undefined) {
      if (!isMap(d.entries)) errors.push(`${tag} entries must map a subpath to a source name or { from: ... }`)
      else {
        for (const [subpath, target] of Object.entries(d.entries)) {
          if (subpath !== '.' && !subpath.startsWith('./')) { errors.push(`${tag} entries: subpath "${subpath}" must be "." or start with "./"`); continue }
          if (typeof target === 'string') {
            if (!sources.has(target) && !/\.(css|json)$/.test(target)) errors.push(`${tag} entries: "${subpath}" points at source "${target}", but no @arkzen:pkg:source block has that name`)
          } else if (isMap(target) && isText(target.from)) {
            const from = target.from
            const comp = from.match(/^web:components:([A-Za-z0-9_-]+)$/)
            const style = from.match(/^web:style:([A-Za-z0-9_-]+)$/)
            if (comp) {
              const found = parsed.components.find(c => c.name === comp[1])
              if (!found) errors.push(`${tag} entries: "${subpath}" exports web:components:${comp[1]}, which does not exist in this tatemono`)
              else if (PKG_STACK_IMPORT_RE.test(found.raw)) errors.push(`${tag} entries: web:components:${comp[1]} imports from the Pluffy stack (arkzen/core or the router adapter), so it cannot be published as a package`)
            } else if (style) {
              if (!new RegExp(`@arkzen:web:style:${style[1]}\\b`).test(source)) errors.push(`${tag} entries: "${subpath}" exports web:style:${style[1]}, which does not exist in this tatemono`)
            } else {
              errors.push(`${tag} entries: "${subpath}" from: must be web:components:<Name> or web:style:<Name> (got ${JSON.stringify(from)})`)
            }
          } else {
            errors.push(`${tag} entries: "${subpath}" must be a source name or { from: web:components:<Name> }`)
          }
        }
      }
    }
    if (d.formats !== undefined) {
      if (!Array.isArray(d.formats) || !d.formats.every(f => typeof f === 'string' && PKG_FORMATS.includes(f))) {
        errors.push(`${tag} formats must be a list drawn from: ${PKG_FORMATS.join(', ')}`)
      }
    }
    if (d.bin !== undefined) {
      if (!isMap(d.bin)) errors.push(`${tag} bin must map a command name to a source name`)
      else for (const [cmd, src] of Object.entries(d.bin)) {
        if (typeof src !== 'string' || !sources.has(src.split(':')[0])) errors.push(`${tag} bin: "${cmd}" points at source "${String(src)}", but no @arkzen:pkg:source block has that name`)
      }
    }
    if (d.types_only !== undefined && typeof d.types_only !== 'boolean') errors.push(`${tag} types_only must be true or false`)
    const facts = owner !== undefined ? packageFacts.get(owner) : undefined
    if (facts?.kind === 'cli' && d.bin === undefined) errors.push(`${tag}: a package with kind: cli needs bin:`)
  }

  // ── Derived blocks: reference the database and api blocks of this tatemono ──
  const apiNames = new Set<string>()
  for (const a of parsed.apis) {
    apiNames.add(a.model.toLowerCase())
    apiNames.add(a.controller.replace(/Controller$/, '').toLowerCase())
    const last = a.prefix.split('/').filter(Boolean).pop()
    if (last) apiNames.add(last.toLowerCase())
  }
  const dbNames = new Set(parsed.databases.map(d => d.table.toLowerCase()))
  // the generated auth routes (login, register, me, logout) can be included in sdk / openapi packages
  if (parsed.meta.auth) apiNames.add('auth')
  const knownIds = [...new Set([...apiNames, ...dbNames])]
  for (const kind of PKG_DERIVED_BLOCKS) {
    for (const b of blocks.filter(x => x.kind === kind)) {
      const tag = `@arkzen:${b.marker}`
      const d = b.data
      if (!isMap(d)) { errors.push(`${tag} must be a YAML mapping`); continue }
      if (d.languages !== undefined) {
        if (!Array.isArray(d.languages) || d.languages.length === 0 || !d.languages.every(l => typeof l === 'string' && PKG_LANGS.includes(l))) {
          errors.push(`${tag} languages must be a list drawn from: ${PKG_LANGS.join(', ')}`)
        } else {
          const owner = owners.get(b)
          const facts = owner !== undefined ? packageFacts.get(owner) : undefined
          if (facts && facts.registries.length > 0) {
            for (const l of d.languages as string[]) {
              if (!facts.registries.some(r => PKG_REGISTRY_LANG[r] === l || PKG_REGISTRY_LANG[r] === null)) {
                errors.push(`${tag} languages includes ${l}, but no target of ${label(owner as string)} publishes ${l} code`)
              }
            }
          }
        }
      } else if (kind !== 'openapi') {
        errors.push(`${tag} needs languages:`)
      }
      for (const key of ['include', 'exclude'] as const) {
        if (d[key] === undefined) continue
        if (!isTexts(d[key])) { errors.push(`${tag} ${key} must be a list of api or table names`); continue }
        for (const ref of d[key] as string[]) {
          if (!knownIds.includes(ref.toLowerCase())) {
            errors.push(`${tag} ${key}: "${ref}" matches no @arkzen:database table or @arkzen:api in this tatemono${knownIds.length ? ` (known: ${knownIds.join(', ')})` : ''}`)
          }
        }
      }
      if (kind === 'sdk') {
        if (d.auth !== undefined && !(d.auth === 'bearer' || d.auth === 'none')) errors.push(`${tag} auth must be one of: bearer, none`)
        if (d.style !== undefined && !(d.style === 'class' || d.style === 'functions')) errors.push(`${tag} style must be one of: class, functions`)
      }
      if (kind === 'types' && d.from !== undefined && !(d.from === 'database' || d.from === 'api' || d.from === 'both')) {
        errors.push(`${tag} from must be one of: database, api, both`)
      }
      if (kind === 'openapi' && d.backend !== undefined && !(typeof d.backend === 'string' && PKG_BACKENDS.includes(d.backend))) {
        errors.push(`${tag} backend must be one of: ${PKG_BACKENDS.join(', ')}`)
      }
    }
  }

  // ── Backend module ──
  for (const b of blocks.filter(x => x.kind === 'backend')) {
    const tag = `@arkzen:${b.marker}`
    const d = b.data
    if (!isMap(d)) { errors.push(`${tag} must be a YAML mapping`); continue }
    if (!isText(d.backend) || !PKG_BACKENDS.includes(d.backend)) errors.push(`${tag} needs backend: one of ${PKG_BACKENDS.join(', ')}`)
    if (d.include !== undefined) {
      if (!isTexts(d.include)) errors.push(`${tag} include must be a list such as [database:notes, api:notes]`)
      else for (const ref of d.include as string[]) {
        const m = ref.match(/^(database|api|routes|events|jobs)(?::(.+))?$/)
        if (!m) { errors.push(`${tag} include: "${ref}" must be database:<table>, api:<name>, routes, events or jobs`); continue }
        if (m[2] && !knownIds.includes(m[2].toLowerCase()) && (m[1] === 'database' || m[1] === 'api')) {
          errors.push(`${tag} include: "${ref}" matches nothing in this tatemono${knownIds.length ? ` (known: ${knownIds.join(', ')})` : ''}`)
        }
      }
    }
    if (d.migrations !== undefined && !(d.migrations === 'bundled' || d.migrations === 'separate')) errors.push(`${tag} migrations must be one of: bundled, separate`)
    if (d.auth !== undefined && !(d.auth === 'host' || d.auth === 'bundled')) errors.push(`${tag} auth must be one of: host, bundled`)
  }

  // ── Verify block ──
  for (const b of blocks.filter(x => x.kind === 'verify')) {
    const tag = `@arkzen:${b.marker}`
    const d = b.data
    if (!isMap(d)) { errors.push(`${tag} must be a YAML mapping`); continue }
    for (const key of ['install', 'type_check', 'tests', 'license_check'] as const) {
      if (d[key] !== undefined && typeof d[key] !== 'boolean') errors.push(`${tag} ${key} must be true or false`)
    }
    for (const key of ['import', 'pack_contents', 'consumers'] as const) {
      if (d[key] !== undefined && !isTexts(d[key])) errors.push(`${tag} ${key} must be a list of strings`)
    }
  }

  // ── Template and assets ──
  for (const b of blocks.filter(x => x.kind === 'template' || x.kind === 'assets')) {
    const tag = `@arkzen:${b.marker}`
    const d = b.data
    if (!isMap(d)) { errors.push(`${tag} must be a YAML mapping`); continue }
    if (b.kind === 'assets') {
      if (!isTexts(d.include) || (d.include as string[]).length === 0) errors.push(`${tag} needs include: a list of files or globs under tatemonos/${parsed.meta.name}/assets/`)
      else for (const g of d.include as string[]) if (g.includes('..')) errors.push(`${tag} include: "${g}" must stay inside the assets folder`)
    }
    if (b.kind === 'template' && d.variables !== undefined && !Array.isArray(d.variables)) errors.push(`${tag} variables must be a list`)
  }

  // ── Plugin ──
  for (const b of blocks.filter(x => x.kind === 'plugin')) {
    const tag = `@arkzen:${b.marker}`
    const d = b.data
    if (!isMap(d)) { errors.push(`${tag} must be a YAML mapping`); continue }
    if (!isText(d.host)) errors.push(`${tag} needs host: (vite, eslint, tailwind, laravel, maven, gradle, ...)`)
  }

  return { errors, warnings }
}

// ────────────────────────────────────────────────────────────────────────────
// TERMINAL BLOCKS (v19.0)
// @arkzen:term:project, runtime:<lang>, config, theme, keymap[:name], command:<name>,
// prompt:<name>, screen:<name>, data:<name>, loop:<name>, assets, export,
// handler/view/script/test:<lang>:<name>, readme.
// The parser reads the structure. This checks the contract of each block, so a bad value
// is reported here and not later by the terminal build. Only Tatemonos that declare a
// term block are checked.
//
// Header keys the plan left open (decided here, one place):
//   keymap.scope       defaults to the block name, or "global" for an unnamed keymap
//   prompt.when        mapping of an earlier step id to the value it must have
//   prompt.fallback    mapping of a step id to { flag: --long-flag, env: UPPER_NAME }
//   screen.size        list of positive weights, one per pane
//   screen.pane.focus  positive integer focus order, unique per screen
//   view kind: screen  `screen:` is optional (names a declared screen the view replaces)
//   view kind: widget  `screen:` is required (the screen the widget lives in)
//   view kind: loop    the view name is the term:loop name
// A command needs no handler when it has a builtin, or when it has a prompt and the
// project declares assets.templates (the generated action runs the prompt and writes the
// templates).
// ────────────────────────────────────────────────────────────────────────────

const TERM_LANGS_ALL       = ['ts', 'py', 'rs', 'go', 'java', 'cs', 'php']
const TERM_MODES           = ['cli', 'tui', 'hybrid']
const TERM_COLOR_MODES     = ['auto', '16', '256', 'truecolor', 'none']
const TERM_UNICODE_MODES   = ['auto', 'ascii']
const TERM_BORDERS         = ['rounded', 'single', 'double', 'ascii']
const TERM_ROLES           = ['primary', 'secondary', 'muted', 'success', 'warning', 'error', 'border', 'focus', 'selection']
const TERM_ANSI_NAMES      = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'grey', 'default']
const TERM_CONFIG_FORMATS  = ['toml', 'json', 'yaml']
const TERM_LOCATIONS       = ['xdg', 'home', 'cwd']
const TERM_VALUE_TYPES     = ['string', 'int', 'float', 'bool', 'path', 'choice']
const TERM_OUTPUTS         = ['text', 'json', 'table', 'lines']
const TERM_BUILTINS        = ['help', 'version', 'completion', 'none']
const TERM_PROMPT_TYPES    = ['text', 'password', 'number', 'confirm', 'select', 'multiselect', 'path', 'autocomplete', 'editor']
const TERM_LAYOUTS         = ['rows', 'columns', 'grid', 'split', 'stack', 'tabs']
const TERM_WIDGETS         = ['table', 'list', 'text', 'input', 'form', 'tabs', 'progress', 'gauge', 'log', 'tree', 'markdown', 'modal', 'status']
const TERM_STORAGES        = ['json', 'jsonl', 'sqlite']
const TERM_FIELD_TYPES     = ['string', 'text', 'int', 'float', 'bool', 'date', 'choice', 'tags']
const TERM_LOOP_RENDERS    = ['full', 'diff']
const TERM_LOOP_INPUTS     = ['events', 'poll']
const TERM_VIEW_KINDS      = ['screen', 'widget', 'loop']
const TERM_BUNDLES         = ['none', 'single_binary', 'zipapp']
const TERM_PLATFORMS       = ['linux-x64', 'linux-arm64', 'macos-x64', 'macos-arm64', 'windows-x64']
const TERM_FORMATS         = ['source', 'single_binary', 'archive', 'npm_bin', 'pip', 'cargo_install', 'go_install']
const TERM_COMPLETIONS     = ['bash', 'zsh', 'fish', 'powershell']
const TERM_FRAMEWORKS: Record<string, { tui: string[]; cli: string[] }> = {
  ts: { tui: ['ink'],       cli: ['commander'] },
  py: { tui: ['textual'],   cli: ['typer', 'click'] },
  rs: { tui: ['ratatui'],   cli: ['clap'] },
  go: { tui: ['bubbletea'], cli: ['cobra'] },
}
// Go and Rust build for other platforms from one machine. The other runtimes need the target OS.
const TERM_CROSS_COMPILE   = ['go', 'rs']
// Which export format needs which runtime.
const TERM_FORMAT_RUNTIME: Record<string, string> = { npm_bin: 'ts', pip: 'py', cargo_install: 'rs', go_install: 'go' }
const TERM_TOOLCHAIN: Record<string, { cmd: string; args: string[]; label: string }> = {
  ts:   { cmd: 'node',   args: ['--version'], label: 'Node.js' },
  py:   { cmd: 'python3', args: ['--version'], label: 'Python 3' },
  rs:   { cmd: 'cargo',  args: ['--version'], label: 'Rust (cargo)' },
  go:   { cmd: 'go',     args: ['version'],   label: 'Go' },
  java: { cmd: 'java',   args: ['-version'],  label: 'Java' },
  cs:   { cmd: 'dotnet', args: ['--version'], label: '.NET' },
  php:  { cmd: 'php',    args: ['--version'], label: 'PHP' },
}
// Common SPDX license ids. An id outside this list is reported as a warning, not an error,
// because the full SPDX list is not bundled.
const TERM_SPDX_COMMON = [
  '0BSD', 'AGPL-3.0-only', 'AGPL-3.0-or-later', 'Apache-2.0', 'Artistic-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'BSL-1.0',
  'CC-BY-4.0', 'CC-BY-SA-4.0', 'CC0-1.0', 'EPL-2.0', 'GPL-2.0-only', 'GPL-2.0-or-later', 'GPL-3.0-only', 'GPL-3.0-or-later',
  'ISC', 'LGPL-2.1-only', 'LGPL-2.1-or-later', 'LGPL-3.0-only', 'LGPL-3.0-or-later', 'MIT', 'MIT-0', 'MPL-2.0',
  'MS-PL', 'Unlicense', 'WTFPL', 'Zlib', 'UNLICENSED',
]
const TERM_NAME_RE      = /^[a-z][a-z0-9-]*$/
const TERM_COMMAND_RE   = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/
const TERM_IDENT_RE     = /^[a-z][a-z0-9_]*$/
const TERM_BINARY_RE    = /^[a-z][a-z0-9_-]*$/
const TERM_SEMVER_RE    = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
const TERM_ENV_RE       = /^[A-Z][A-Z0-9_]*$/
const TERM_LONG_FLAG_RE = /^--[a-z][a-z0-9-]*$/
const TERM_HEX_RE       = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
// A pointer to Pluffy from code that will be generated into a standalone program (rule 1).
const TERM_PLUFFY_IMPORT: Record<string, RegExp> = {
  ts:   /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)['"][^'"\n]*(?:@\/arkzen|arkzen\/core|@arkzen\/|\bpluffy\b)[^'"\n]*['"]/i,
  py:   /^[ \t]*(?:from|import)[ \t]+(?:arkzen|pluffy)\b/im,
  rs:   /^[ \t]*(?:pub[ \t]+)?(?:use|extern[ \t]+crate)[ \t]+(?:arkzen|pluffy)\b/im,
  go:   /^[ \t]*(?:import[ \t]+)?(?:[A-Za-z_.][A-Za-z0-9_]*[ \t]+)?"[^"\n]*(?:\/|^)(?:arkzen|pluffy)(?:\/[^"\n]*)?"[ \t]*$/im,
  java: /^[ \t]*import[ \t]+(?:static[ \t]+)?[\w.]*\b(?:arkzen|pluffy)\b[\w.*]*[ \t]*;/im,
  cs:   /^[ \t]*using[ \t]+(?:static[ \t]+)?[\w.]*\b(?:arkzen|pluffy)\b[\w.]*[ \t]*;/im,
  php:  /^[ \t]*use[ \t]+[\\\w]*\b(?:arkzen|pluffy)\b[\\\w]*/im,
}

const termToolchainCache = new Map<string, boolean>()
function termToolchainInstalled(lang: string): boolean {
  const spec = TERM_TOOLCHAIN[lang]
  if (!spec) return true
  const key = lang === 'py' ? 'py' : lang
  const cached = termToolchainCache.get(key)
  if (cached !== undefined) return cached
  const tries = lang === 'py' ? [spec, { ...spec, cmd: 'python' }] : [spec]
  let ok = false
  for (const t of tries) {
    try {
      const r = spawnSync(t.cmd, t.args, { stdio: 'ignore', timeout: 4000, windowsHide: true })
      if (!r.error && r.status === 0) { ok = true; break }
    } catch { /* treated as not installed */ }
  }
  termToolchainCache.set(key, ok)
  return ok
}

function termTypeOk(type: string, value: unknown): boolean {
  switch (type) {
    case 'string': case 'path': case 'text': case 'date': case 'choice': return typeof value === 'string'
    case 'int':    return typeof value === 'number' && Number.isInteger(value)
    case 'float':  return typeof value === 'number' && Number.isFinite(value)
    case 'bool':   return typeof value === 'boolean'
    case 'tags':   return Array.isArray(value) && value.every(v => typeof v === 'string')
    default:       return true
  }
}

function validateTerm(parsed: ParsedTatemono, filePath: string): { errors: string[]; warnings: string[] } {
  const errors:   string[] = []
  const warnings: string[] = []
  const term = parsed.term
  if (!term) return { errors, warnings }

  const E = (msg: string): void => { errors.push(msg) }
  const W = (msg: string): void => { warnings.push(msg) }

  const assetsDir = path.join(path.dirname(filePath), 'assets')
  const listAssets = (): string[] => {
    const out: string[] = []
    const walk = (dir: string, rel: string): void => {
      let entries: fs.Dirent[] = []
      try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
      for (const entry of entries) {
        const r = rel ? `${rel}/${entry.name}` : entry.name
        if (entry.isDirectory()) walk(path.join(dir, entry.name), r)
        else out.push(r)
      }
    }
    walk(assetsDir, '')
    return out
  }
  const cleanAsset = (rel: string): string => rel.replace(/\\/g, '/').replace(/^(?:\.\/)?\/?(?:assets\/)?/, '')
  const globToRe = (glob: string): RegExp => {
    let re = ''
    for (let i = 0; i < glob.length; i++) {
      const c = glob[i]
      if (c === '*') {
        if (glob[i + 1] === '*') { re += '.*'; i++; if (glob[i + 1] === '/') i++ } else re += '[^/]*'
      } else if (c === '?') re += '[^/]'
      else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    }
    return new RegExp(`^${re}$`)
  }

  const checkKeys = (label: string, map: Record<string, unknown>, known: string[]): void => {
    for (const key of Object.keys(map)) {
      if (!known.includes(key)) W(`${label}: unknown key "${key}" (known: ${known.join(', ')}). A misspelled key is ignored by the build.`)
    }
  }
  const checkEnum = (label: string, value: unknown, allowed: string[]): void => {
    if (value !== undefined && !(typeof value === 'string' && allowed.includes(value))) {
      E(`${label} must be one of: ${allowed.join(', ')} (got ${JSON.stringify(value)})`)
    }
  }
  const checkBool = (label: string, value: unknown): void => {
    if (value !== undefined && typeof value !== 'boolean') E(`${label} must be true or false`)
  }
  const checkText = (label: string, value: unknown): void => {
    if (value !== undefined && !isText(value)) E(`${label} must be a non-empty string`)
  }
  const checkPosNumber = (label: string, value: unknown): void => {
    if (value !== undefined && !(typeof value === 'number' && Number.isFinite(value) && value > 0)) E(`${label} must be a positive number`)
  }
  const checkSize = (label: string, value: unknown): void => {
    if (value === undefined) return
    if (!isMap(value)) { E(`${label} must be a mapping with width and height`); return }
    for (const key of ['width', 'height']) {
      if (value[key] !== undefined && !isPosInt(value[key])) E(`${label}.${key} must be a positive integer`)
    }
    checkKeys(label, value, ['width', 'height'])
  }
  const checkMapOrList = (label: string, value: unknown): void => {
    if (value === undefined) return
    if (isMap(value)) return
    if (isTexts(value)) return
    E(`${label} must be a mapping (name: version) or a list of names`)
  }
  const checkRegex = (label: string, value: unknown): void => {
    if (!isText(value)) { E(`${label} must be a non-empty regular expression`); return }
    try { new RegExp(value) } catch (e) { E(`${label} is not a valid regular expression: ${e instanceof Error ? e.message : String(e)}`) }
  }
  const checkValidate = (label: string, value: unknown): void => {
    if (value === undefined) return
    if (!isMap(value)) { E(`${label} must be a mapping (regex, min, max, length)`); return }
    if (value.regex !== undefined) checkRegex(`${label}.regex`, value.regex)
    for (const key of ['min', 'max', 'length']) {
      if (value[key] !== undefined && !(typeof value[key] === 'number' && Number.isFinite(value[key]))) E(`${label}.${key} must be a number`)
    }
    if (typeof value.min === 'number' && typeof value.max === 'number' && value.min > value.max) E(`${label}: min cannot exceed max`)
    checkKeys(label, value, ['regex', 'min', 'max', 'length'])
  }
  const checkNames = (kind: string, blocks: { name: string }[], re: RegExp, style: string): void => {
    const seen = new Set<string>()
    for (const block of blocks) {
      if (!re.test(block.name)) E(`@arkzen:term:${kind}:${block.name}: the name must be ${style}`)
      if (seen.has(block.name)) E(`Duplicate @arkzen:term:${kind}:${block.name}`)
      seen.add(block.name)
    }
  }
  // A YAML block must hold a mapping. Returns the mapping, or {} after reporting.
  const mapOf = (label: string, data: unknown): Record<string, unknown> => {
    if (isMap(data)) return data
    E(`${label} must be a YAML mapping`)
    return {}
  }
  const checkColor = (label: string, value: unknown, palette: Set<string>, allowPalette: boolean): void => {
    if (!isText(value)) { E(`${label} must be a color (hex like #aabbcc, an ANSI name${allowPalette ? ' or a palette name' : ''})`); return }
    const v = value.trim()
    const ansi = v.replace(/^bright-/, '')
    if (TERM_HEX_RE.test(v) || TERM_ANSI_NAMES.includes(ansi)) return
    if (/^(?:[0-9]{1,3})$/.test(v) && Number(v) <= 255) return
    if (allowPalette && palette.has(v)) return
    E(`${label}: "${v}" is not a valid color (hex like #aabbcc, an ANSI name such as red or bright-blue, a 0-255 index${allowPalette ? ', or a palette name' : ''})`)
  }

  // ── project ───────────────────────────────────
  const project = mapOf('@arkzen:term:project', term.project?.data)
  if (!term.project) {
    E('@arkzen:term:project is required when a tatemono has terminal blocks (it holds the name, binary, mode and runtimes)')
  } else {
    checkKeys('@arkzen:term:project', project, [
      'name', 'binary', 'version', 'description', 'author', 'license', 'homepage', 'mode', 'runtimes', 'default_command',
      'alt_screen', 'mouse', 'min_size', 'color', 'unicode', 'title', 'tui_flag',
    ])
    if (!isText(project.name)) E('@arkzen:term:project needs a name:')
    for (const key of ['author', 'homepage', 'description', 'title']) checkText(`@arkzen:term:project ${key}`, project[key])
    if (!isText(project.binary)) E('@arkzen:term:project needs a binary: (the executable name)')
    else if (!TERM_BINARY_RE.test(project.binary)) E(`@arkzen:term:project binary "${project.binary}" must be lowercase with no spaces (letters, digits, - and _, starting with a letter)`)
    const version = project.version ?? parsed.meta.version
    if (project.version !== undefined && !isText(project.version)) E('@arkzen:term:project version must be a string like 1.0.0')
    else if (typeof version === 'string' && !TERM_SEMVER_RE.test(version)) E(`@arkzen:term:project version "${version}" is not semver (use MAJOR.MINOR.PATCH, for example 1.0.0)`)
    if (project.license !== undefined) {
      if (!isText(project.license)) E('@arkzen:term:project license must be an SPDX id such as MIT')
      else {
        const ids = project.license.split(/\s+(?:AND|OR|WITH)\s+/).map(s => s.trim().replace(/^\(|\)$/g, ''))
        for (const id of ids) {
          if (!/^[A-Za-z0-9.+-]+$/.test(id)) E(`@arkzen:term:project license "${project.license}" is not a valid SPDX expression`)
          else if (!TERM_SPDX_COMMON.includes(id) && !/^LicenseRef-/.test(id)) {
            W(`@arkzen:term:project license "${id}" is not in the common SPDX list this validator knows. Check the spelling against https://spdx.org/licenses/`)
          }
        }
      }
    }
    if (!isText(project.mode)) E(`@arkzen:term:project needs mode: ${TERM_MODES.join(' | ')}`)
    else checkEnum('@arkzen:term:project mode', project.mode, TERM_MODES)
    if (!isTexts(project.runtimes) || project.runtimes.length === 0) E(`@arkzen:term:project needs runtimes: a non-empty list of languages (${TERM_LANGS_ALL.join(', ')})`)
    else {
      const seenLang = new Set<string>()
      for (const lang of project.runtimes) {
        if (!TERM_LANGS_ALL.includes(lang)) E(`@arkzen:term:project runtimes: unknown language "${lang}". Valid: ${TERM_LANGS_ALL.join(', ')}`)
        if (seenLang.has(lang)) E(`@arkzen:term:project runtimes lists "${lang}" twice`)
        seenLang.add(lang)
      }
    }
    for (const key of ['alt_screen', 'mouse']) checkBool(`@arkzen:term:project ${key}`, project[key])
    checkSize('@arkzen:term:project min_size', project.min_size)
    checkEnum('@arkzen:term:project color', project.color !== undefined ? String(project.color) : undefined, TERM_COLOR_MODES)
    checkEnum('@arkzen:term:project unicode', project.unicode, TERM_UNICODE_MODES)
    if (project.tui_flag !== undefined) {
      if (!isText(project.tui_flag) || !TERM_LONG_FLAG_RE.test(project.tui_flag)) E('@arkzen:term:project tui_flag must be a long flag like --tui')
      else if (project.mode !== 'hybrid') W('@arkzen:term:project tui_flag only matters when mode is hybrid')
    }
    if (project.mode === 'cli') {
      for (const key of ['alt_screen', 'mouse', 'min_size']) {
        if (project[key] !== undefined) W(`@arkzen:term:project ${key} only applies to a TUI (mode is cli)`)
      }
    }
  }
  const mode     = typeof project.mode === 'string' ? project.mode : ''
  const runtimeList = isTexts(project.runtimes) ? project.runtimes.filter(l => TERM_LANGS_ALL.includes(l)) : []
  const isTui    = mode === 'tui' || mode === 'hybrid'
  const hasCli   = mode === 'cli' || mode === 'hybrid'

  // ── runtime:<lang> ────────────────────────────
  const seenRuntime = new Set<string>()
  for (const rt of term.runtimes) {
    const label = `@arkzen:term:runtime:${rt.lang}`
    if (seenRuntime.has(rt.lang)) E(`Duplicate ${label}`)
    seenRuntime.add(rt.lang)
    if (term.project && !runtimeList.includes(rt.lang)) E(`${label}: "${rt.lang}" is not listed in @arkzen:term:project runtimes`)
    const data = mapOf(label, rt.data)
    checkKeys(label, data, ['framework', 'tui', 'dependencies', 'dev_dependencies', 'min_version', 'bundle', 'edition', 'features', 'module_path', 'package_name'])
    checkBool(`${label} tui`, data.tui)
    if (data.framework !== undefined) {
      if (!isText(data.framework)) E(`${label} framework must be a non-empty string`)
      else {
        const known = TERM_FRAMEWORKS[rt.lang]
        const framework = data.framework
        if (!known) W(`${label} framework "${framework}" is not verified: only ts, py, rs and go have a checked framework list`)
        else if (known.tui.includes(framework)) {
          if (data.tui === false) E(`${label}: framework "${framework}" is a TUI framework but tui is false`)
          if (mode === 'cli') E(`${label}: framework "${framework}" draws a terminal UI, but @arkzen:term:project mode is cli. Use ${known.cli.join(' or ')}`)
        } else if (known.cli.includes(framework)) {
          if (data.tui === true) E(`${label}: framework "${framework}" only parses commands, but tui is true. Use ${known.tui.join(' or ')} for a TUI`)
          if (mode === 'tui') E(`${label}: framework "${framework}" only parses commands, but @arkzen:term:project mode is tui. Use ${known.tui.join(' or ')}`)
        } else {
          W(`${label} framework "${framework}" is not one of the verified choices (${[...known.cli, ...known.tui].join(', ')})`)
        }
      }
    }
    if (mode === 'cli' && data.tui === true) E(`${label}: tui is true but @arkzen:term:project mode is cli`)
    if (mode === 'tui' && data.tui === false) E(`${label}: tui is false but @arkzen:term:project mode is tui`)
    checkMapOrList(`${label} dependencies`, data.dependencies)
    checkMapOrList(`${label} dev_dependencies`, data.dev_dependencies)
    checkText(`${label} min_version`, data.min_version !== undefined ? String(data.min_version) : undefined)
    checkEnum(`${label} bundle`, data.bundle, TERM_BUNDLES)
    if (data.bundle === 'single_binary' && !TERM_CROSS_COMPILE.includes(rt.lang)) W(`${label} bundle: single_binary is untested for ${rt.lang}. Go and Rust produce native binaries; the others need a bundler.`)
    if (data.bundle === 'zipapp' && rt.lang !== 'py') E(`${label} bundle: zipapp only applies to py`)
    if (data.edition !== undefined) {
      if (rt.lang !== 'rs') W(`${label} edition only applies to rs`)
      else if (!/^20[0-9]{2}$/.test(String(data.edition))) E(`${label} edition must be a year such as 2021`)
    }
    if (data.features !== undefined) {
      if (rt.lang !== 'rs') W(`${label} features only applies to rs`)
      else if (!isTexts(data.features)) E(`${label} features must be a list of strings`)
    }
    if (data.module_path !== undefined) {
      if (rt.lang !== 'go') W(`${label} module_path only applies to go`)
      else checkText(`${label} module_path`, data.module_path)
    }
    checkText(`${label} package_name`, data.package_name)
  }

  // ── gather names used by cross checks ─────────
  const commandNames = new Set(term.commands.map(c => c.name))
  const promptNames  = new Set(term.prompts.map(p => p.name))
  const screenNames  = new Set(term.screens.map(s => s.name))
  const dataNames    = new Set(term.data.map(d => d.name))
  const loopNames    = new Set(term.loops.map(l => l.name))
  const viewNames    = new Set(term.views.map(v => v.name))
  const handlerNames = new Set(term.handlers.map(h => h.name))
  const keymapScopes = new Set<string>()
  const keymapNames  = new Set<string>()

  // ── config ────────────────────────────────────
  if (term.config) {
    const label = '@arkzen:term:config'
    const cfg = mapOf(label, term.config.data)
    checkKeys(label, cfg, ['file', 'format', 'location', 'env_prefix', 'defaults', 'schema', 'flags_override'])
    checkText(`${label} file`, cfg.file)
    checkEnum(`${label} format`, cfg.format, TERM_CONFIG_FORMATS)
    checkEnum(`${label} location`, cfg.location, TERM_LOCATIONS)
    if (cfg.env_prefix !== undefined && !(isText(cfg.env_prefix) && TERM_ENV_RE.test(cfg.env_prefix))) E(`${label} env_prefix must be UPPER_SNAKE_CASE, for example TODO_`)
    if (cfg.defaults !== undefined && !isMap(cfg.defaults)) E(`${label} defaults must be a mapping`)
    if (cfg.schema !== undefined) {
      if (!isMap(cfg.schema)) E(`${label} schema must be a mapping of field to type`)
      else {
        for (const [field, type] of Object.entries(cfg.schema)) {
          if (!isText(type) || !TERM_VALUE_TYPES.concat(['text', 'date', 'tags']).includes(type)) E(`${label} schema.${field} must be a type (${TERM_VALUE_TYPES.join(', ')})`)
        }
        if (isMap(cfg.defaults)) {
          for (const key of Object.keys(cfg.defaults)) {
            if (!(key in cfg.schema)) W(`${label} defaults.${key} has no entry in schema`)
          }
        }
      }
    }
    checkBool(`${label} flags_override`, cfg.flags_override)
  }

  // ── theme ─────────────────────────────────────
  if (term.theme) {
    const label = '@arkzen:term:theme'
    const theme = mapOf(label, term.theme.data)
    checkKeys(label, theme, ['palette', 'roles', 'border', 'fallback'])
    const palette = new Set<string>()
    if (theme.palette !== undefined) {
      if (!isMap(theme.palette)) E(`${label} palette must be a mapping of name to color`)
      else {
        for (const [name, value] of Object.entries(theme.palette)) {
          palette.add(name)
          checkColor(`${label} palette.${name}`, value, palette, false)
        }
      }
    }
    if (theme.roles !== undefined) {
      if (!isMap(theme.roles)) E(`${label} roles must be a mapping of role to color`)
      else {
        for (const [role, value] of Object.entries(theme.roles)) {
          if (!TERM_ROLES.includes(role)) { E(`${label} roles: unknown role "${role}". Valid: ${TERM_ROLES.join(', ')}`); continue }
          if (isMap(value)) {
            checkKeys(`${label} roles.${role}`, value, ['color', 'bold', 'dim', 'underline'])
            checkColor(`${label} roles.${role}.color`, value.color, palette, true)
            for (const key of ['bold', 'dim', 'underline']) checkBool(`${label} roles.${role}.${key}`, value[key])
          } else {
            checkColor(`${label} roles.${role}`, value, palette, true)
          }
        }
      }
    }
    checkEnum(`${label} border`, theme.border, TERM_BORDERS)
    if (theme.fallback !== undefined) {
      if (!isMap(theme.fallback)) E(`${label} fallback must be a mapping of palette name or role to a 16-color ANSI name`)
      else {
        for (const [key, value] of Object.entries(theme.fallback)) {
          if (!palette.has(key) && !TERM_ROLES.includes(key)) W(`${label} fallback.${key} is neither a palette name nor a role`)
          if (!isText(value) || !TERM_ANSI_NAMES.includes(value.replace(/^bright-/, ''))) E(`${label} fallback.${key} must be one of the 16 ANSI names (for example red or bright-blue)`)
        }
      }
    }
  }

  // ── keymap ────────────────────────────────────
  for (const km of term.keymaps) {
    const label = `@arkzen:term:keymap${km.name ? `:${km.name}` : ''}`
    const data = mapOf(label, km.data)
    checkKeys(label, data, ['scope', 'actions', 'vim', 'mouse', 'help'])
    if (km.name !== undefined && !TERM_NAME_RE.test(km.name)) E(`${label}: the name must be lowercase kebab-case`)
    if (km.name !== undefined) {
      if (keymapNames.has(km.name)) E(`Duplicate ${label}`)
      keymapNames.add(km.name)
    }
    if (data.scope !== undefined && !isText(data.scope)) E(`${label} scope must be a screen name or global`)
    const scope = isText(data.scope) ? data.scope : (km.name ?? 'global')
    if (keymapScopes.has(scope)) E(`${label}: scope "${scope}" is already used by another keymap`)
    keymapScopes.add(scope)
    if (scope !== 'global' && !screenNames.has(scope) && screenNames.size > 0) {
      E(`${label}: scope "${scope}" is neither "global" nor a declared @arkzen:term:screen (declared: ${[...screenNames].join(', ')})`)
    } else if (scope !== 'global' && screenNames.size === 0) {
      E(`${label}: scope "${scope}" has no @arkzen:term:screen to attach to. Use scope: global or declare the screen`)
    }
    if (data.actions === undefined) E(`${label} needs actions: (a map of action id to key list)`)
    else if (!isMap(data.actions)) E(`${label} actions must be a mapping of action id to key list`)
    else {
      const bound = new Map<string, string>()
      for (const [action, keys] of Object.entries(data.actions)) {
        if (!TERM_IDENT_RE.test(action)) E(`${label} actions: "${action}" must be snake_case letters, digits and _`)
        const list = typeof keys === 'string' ? [keys] : keys
        if (!isTexts(list) || (list as string[]).length === 0) { E(`${label} actions.${action} must be a key or a non-empty list of keys`); continue }
        for (const key of list as string[]) {
          const k = key.toLowerCase()
          const prev = bound.get(k)
          if (prev && prev !== action) E(`${label}: key "${key}" is bound to both "${prev}" and "${action}"`)
          bound.set(k, action)
        }
      }
    }
    checkBool(`${label} vim`, data.vim)
    checkBool(`${label} help`, data.help)
    if (data.mouse !== undefined) {
      if (!isMap(data.mouse)) E(`${label} mouse must be a mapping of click, scroll and drag toggles`)
      else {
        checkKeys(`${label} mouse`, data.mouse, ['click', 'scroll', 'drag'])
        for (const key of ['click', 'scroll', 'drag']) checkBool(`${label} mouse.${key}`, (data.mouse as Record<string, unknown>)[key])
      }
    }
  }

  // ── prompt ────────────────────────────────────
  checkNames('prompt', term.prompts, TERM_NAME_RE, 'lowercase kebab-case (letters, digits, hyphens, starting with a letter)')
  const promptsUsed = new Set<string>()
  for (const pr of term.prompts) {
    const label = `@arkzen:term:prompt:${pr.name}`
    const data = mapOf(label, pr.data)
    checkKeys(label, data, ['steps', 'result', 'fallback'])
    if (data.result !== undefined && !(isText(data.result) && TERM_IDENT_RE.test(data.result))) E(`${label} result must be a snake_case name`)
    const stepIds: string[] = []
    if (!Array.isArray(data.steps) || data.steps.length === 0) E(`${label} needs steps: a non-empty list`)
    else {
      for (const [i, raw] of data.steps.entries()) {
        const where = `${label} steps[${i}]`
        if (!isMap(raw)) { E(`${where} must be a mapping`); continue }
        checkKeys(where, raw, ['id', 'type', 'message', 'default', 'choices', 'required', 'validate', 'when'])
        if (!isText(raw.id) || !TERM_IDENT_RE.test(raw.id)) E(`${where} needs an id: in snake_case`)
        else {
          if (stepIds.includes(raw.id)) E(`${label}: duplicate step id "${raw.id}"`)
          stepIds.push(raw.id)
        }
        const id = isText(raw.id) ? raw.id : `#${i}`
        if (!isText(raw.type) || !TERM_PROMPT_TYPES.includes(raw.type)) E(`${where} (${id}) type must be one of: ${TERM_PROMPT_TYPES.join(', ')}`)
        if (!isText(raw.message)) E(`${where} (${id}) needs a message:`)
        checkBool(`${where} (${id}) required`, raw.required)
        const needsChoices = raw.type === 'select' || raw.type === 'multiselect'
        if (raw.choices !== undefined) {
          if (!isTexts(raw.choices) || raw.choices.length === 0) E(`${where} (${id}) choices must be a non-empty list of strings`)
          else if (!needsChoices && raw.type !== 'autocomplete') W(`${where} (${id}) choices only apply to select, multiselect and autocomplete`)
        } else if (needsChoices) E(`${where} (${id}) needs choices: for type ${String(raw.type)}`)
        if (raw.default !== undefined) {
          const t = String(raw.type)
          const ok = t === 'confirm' ? typeof raw.default === 'boolean'
            : t === 'number' ? typeof raw.default === 'number'
            : t === 'multiselect' ? isTexts(raw.default)
            : typeof raw.default === 'string'
          if (!ok) E(`${where} (${id}) default does not match type ${t}`)
          else if (t === 'select' && isTexts(raw.choices) && !raw.choices.includes(raw.default as string)) E(`${where} (${id}) default "${String(raw.default)}" is not one of the choices`)
        }
        checkValidate(`${where} (${id}) validate`, raw.validate)
        if (raw.when !== undefined) {
          if (!isMap(raw.when)) E(`${where} (${id}) when must be a mapping of an earlier step id to its value`)
          else {
            for (const ref of Object.keys(raw.when)) {
              if (!stepIds.slice(0, -1).includes(ref) && ref !== id) E(`${where} (${id}) when: "${ref}" is not an earlier step id`)
              else if (ref === id) E(`${where} (${id}) when cannot refer to its own step`)
            }
          }
        }
      }
    }
    if (data.fallback !== undefined) {
      if (!isMap(data.fallback)) E(`${label} fallback must be a mapping of step id to { flag, env }`)
      else {
        for (const [stepId, spec] of Object.entries(data.fallback)) {
          if (!stepIds.includes(stepId)) E(`${label} fallback: "${stepId}" is not a step id`)
          if (!isMap(spec) || (spec.flag === undefined && spec.env === undefined)) { E(`${label} fallback.${stepId} needs a flag: and/or an env:`); continue }
          checkKeys(`${label} fallback.${stepId}`, spec, ['flag', 'env'])
          if (spec.flag !== undefined && !(isText(spec.flag) && TERM_LONG_FLAG_RE.test(spec.flag))) E(`${label} fallback.${stepId} flag must be a long flag like --name`)
          if (spec.env !== undefined && !(isText(spec.env) && TERM_ENV_RE.test(spec.env))) E(`${label} fallback.${stepId} env must be UPPER_SNAKE_CASE`)
        }
      }
    }
  }

  // ── assets ────────────────────────────────────
  let hasTemplates = false
  if (term.assets) {
    const label = '@arkzen:term:assets'
    const assets = mapOf(label, term.assets.data)
    checkKeys(label, assets, ['include', 'embed', 'dest', 'templates'])
    const files = listAssets()
    if (assets.include !== undefined) {
      if (!isTexts(assets.include)) E(`${label} include must be a list of globs under tatemonos/${parsed.meta.name}/assets/`)
      else {
        for (const glob of assets.include) {
          if (glob.includes('..')) { E(`${label} include "${glob}" must stay inside the assets folder`); continue }
          const re = globToRe(cleanAsset(glob))
          if (!files.some(f => re.test(f))) E(`${label} include "${glob}" matches no file under tatemonos/${parsed.meta.name}/assets/`)
        }
      }
    }
    checkBool(`${label} embed`, assets.embed)
    checkText(`${label} dest`, assets.dest)
    if (assets.templates !== undefined) {
      if (!Array.isArray(assets.templates)) E(`${label} templates must be a list`)
      else {
        hasTemplates = assets.templates.length > 0
        for (const [i, raw] of assets.templates.entries()) {
          const where = `${label} templates[${i}]`
          if (!isMap(raw)) { E(`${where} must be a mapping`); continue }
          checkKeys(where, raw, ['source', 'target', 'variables'])
          if (!isText(raw.source)) E(`${where} needs a source: file under tatemonos/${parsed.meta.name}/assets/`)
          else if (raw.source.includes('..') || !files.includes(cleanAsset(raw.source))) E(`${where} source "${raw.source}" does not exist under tatemonos/${parsed.meta.name}/assets/`)
          if (!isText(raw.target)) E(`${where} needs a target: path (placeholders are written {{name}})`)
          const vars = raw.variables === undefined ? [] : isTexts(raw.variables) ? raw.variables : null
          if (vars === null) E(`${where} variables must be a list of names`)
          else {
            for (const v of vars) {
              if (!TERM_IDENT_RE.test(v)) E(`${where} variables: "${v}" must be a snake_case name`)
            }
            if (isText(raw.target)) {
              for (const used of raw.target.matchAll(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g)) {
                if (!vars.includes(used[1])) E(`${where} target uses {{${used[1]}}} but variables does not list it`)
              }
            }
          }
        }
      }
    }
  }

  // ── command ───────────────────────────────────
  checkNames('command', term.commands, TERM_COMMAND_RE, 'lowercase kebab-case, with dots for nested subcommands (letters, digits, hyphens, for example db.migrate)')
  const commandIsGenerated = new Map<string, boolean>()
  const aliasOwner = new Map<string, string>()
  for (const cmd of term.commands) {
    const label = `@arkzen:term:command:${cmd.name}`
    const data = mapOf(label, cmd.data)
    checkKeys(label, data, ['description', 'aliases', 'hidden', 'deprecated', 'args', 'flags', 'stdin', 'output', 'prompt', 'exit_codes', 'examples', 'builtin'])
    const dot = cmd.name.lastIndexOf('.')
    if (dot > 0) {
      const parent = cmd.name.slice(0, dot)
      if (!commandNames.has(parent)) E(`${label}: parent command "${parent}" is not declared. Add @arkzen:term:command:${parent}`)
    }
    checkText(`${label} description`, data.description)
    if (data.aliases !== undefined) {
      if (!isTexts(data.aliases)) E(`${label} aliases must be a list of names`)
      else {
        for (const alias of data.aliases) {
          if (!TERM_NAME_RE.test(alias)) E(`${label} alias "${alias}" must be lowercase kebab-case`)
          const owner = aliasOwner.get(alias)
          if (owner && owner !== cmd.name) E(`${label} alias "${alias}" is already an alias of "${owner}"`)
          if (commandNames.has(alias)) E(`${label} alias "${alias}" collides with the command of the same name`)
          aliasOwner.set(alias, cmd.name)
        }
      }
    }
    checkBool(`${label} hidden`, data.hidden)
    if (data.deprecated !== undefined && typeof data.deprecated !== 'boolean' && !isText(data.deprecated)) E(`${label} deprecated must be true or a message`)
    checkBool(`${label} stdin`, data.stdin)
    checkEnum(`${label} output`, data.output, TERM_OUTPUTS)
    checkEnum(`${label} builtin`, data.builtin, TERM_BUILTINS)
    if (data.prompt !== undefined) {
      if (!isText(data.prompt)) E(`${label} prompt must be the name of a @arkzen:term:prompt`)
      else if (!promptNames.has(data.prompt)) E(`${label} prompt "${data.prompt}" is not declared. Add @arkzen:term:prompt:${data.prompt}`)
      else promptsUsed.add(data.prompt)
    }
    if (data.exit_codes !== undefined) {
      if (!isMap(data.exit_codes)) E(`${label} exit_codes must be a mapping of code to meaning`)
      else {
        for (const [code, meaning] of Object.entries(data.exit_codes)) {
          if (!/^[0-9]{1,3}$/.test(code) || Number(code) > 255) E(`${label} exit_codes: "${code}" must be 0-255`)
          if (!isText(meaning)) E(`${label} exit_codes.${code} must describe the code`)
        }
      }
    }

    const argNames = new Set<string>()
    let seenOptional = false
    let seenVariadic = false
    if (data.args !== undefined) {
      if (!Array.isArray(data.args)) E(`${label} args must be a list`)
      else {
        for (const [i, raw] of data.args.entries()) {
          const where = `${label} args[${i}]`
          if (!isMap(raw)) { E(`${where} must be a mapping`); continue }
          checkKeys(where, raw, ['name', 'type', 'required', 'variadic', 'choices', 'default', 'description'])
          if (!isText(raw.name) || !TERM_IDENT_RE.test(raw.name) && !TERM_NAME_RE.test(raw.name)) E(`${where} needs a name: (letters, digits, - and _, starting with a letter)`)
          else {
            if (argNames.has(raw.name)) E(`${label}: duplicate arg "${raw.name}"`)
            argNames.add(raw.name)
          }
          const type = raw.type === undefined ? 'string' : raw.type
          if (typeof type !== 'string' || !TERM_VALUE_TYPES.includes(type)) E(`${where} type must be one of: ${TERM_VALUE_TYPES.join(', ')}`)
          checkBool(`${where} required`, raw.required)
          checkBool(`${where} variadic`, raw.variadic)
          checkText(`${where} description`, raw.description)
          if (seenVariadic) E(`${where}: no argument may follow the variadic argument`)
          const required = raw.required === true
          if (required && seenOptional) E(`${where}: a required argument cannot follow an optional one`)
          if (!required) seenOptional = true
          if (raw.variadic === true) seenVariadic = true
          checkChoicesAndDefault(where, type, raw.choices, raw.default)
        }
      }
    }
    const flagNames = new Set<string>()
    const shortNames = new Set<string>()
    if (data.flags !== undefined) {
      if (!Array.isArray(data.flags)) E(`${label} flags must be a list`)
      else {
        for (const [i, raw] of data.flags.entries()) {
          const where = `${label} flags[${i}]`
          if (!isMap(raw)) { E(`${where} must be a mapping`); continue }
          checkKeys(where, raw, ['name', 'short', 'type', 'default', 'env', 'required', 'repeatable', 'choices', 'description'])
          if (!isText(raw.name) || !TERM_NAME_RE.test(raw.name)) E(`${where} needs a name: in lowercase kebab-case`)
          else {
            if (raw.name === 'help') E(`${where}: "help" is reserved for the generated help flag`)
            if (flagNames.has(raw.name)) E(`${label}: duplicate flag "--${raw.name}"`)
            flagNames.add(raw.name)
            if (argNames.has(raw.name)) W(`${where}: "${raw.name}" is both an argument and a flag`)
          }
          if (raw.short !== undefined) {
            if (!isText(raw.short) || !/^[A-Za-z]$/.test(raw.short)) E(`${where} short must be a single letter`)
            else {
              if (raw.short === 'h') E(`${where}: "-h" is reserved for the generated help flag`)
              if (shortNames.has(raw.short)) E(`${label}: duplicate short flag "-${raw.short}"`)
              shortNames.add(raw.short)
            }
          }
          const type = raw.type === undefined ? 'string' : raw.type
          if (typeof type !== 'string' || !TERM_VALUE_TYPES.includes(type)) E(`${where} type must be one of: ${TERM_VALUE_TYPES.join(', ')}`)
          if (raw.env !== undefined && !(isText(raw.env) && TERM_ENV_RE.test(raw.env))) E(`${where} env must be UPPER_SNAKE_CASE`)
          checkBool(`${where} required`, raw.required)
          checkBool(`${where} repeatable`, raw.repeatable)
          checkText(`${where} description`, raw.description)
          if (raw.required === true && raw.default !== undefined) W(`${where}: a required flag with a default is never missing`)
          checkChoicesAndDefault(where, type, raw.choices, raw.default)
        }
      }
    }
    if (data.examples !== undefined) {
      if (!Array.isArray(data.examples)) E(`${label} examples must be a list`)
      else {
        for (const [i, raw] of data.examples.entries()) {
          const where = `${label} examples[${i}]`
          if (!isMap(raw)) { E(`${where} must be a mapping`); continue }
          checkKeys(where, raw, ['cmd', 'expect_exit', 'expect_stdout', 'expect_stderr'])
          if (!isText(raw.cmd)) E(`${where} needs a cmd: (the arguments after the binary name)`)
          if (raw.expect_exit !== undefined && !(typeof raw.expect_exit === 'number' && Number.isInteger(raw.expect_exit) && raw.expect_exit >= 0 && raw.expect_exit <= 255)) E(`${where} expect_exit must be 0-255`)
          checkText(`${where} expect_stdout`, raw.expect_stdout)
          checkText(`${where} expect_stderr`, raw.expect_stderr)
        }
      }
    }
    const builtin = typeof data.builtin === 'string' && data.builtin !== 'none'
    const generated = builtin || (isText(data.prompt) && promptNames.has(data.prompt) && hasTemplates)
    commandIsGenerated.set(cmd.name, generated)
  }

  // choices and default agree with the declared type (args and flags)
  function checkChoicesAndDefault(where: string, type: unknown, choices: unknown, def: unknown): void {
    const t = typeof type === 'string' ? type : 'string'
    if (choices !== undefined) {
      if (t !== 'choice') E(`${where}: choices only apply to type choice`)
      else if (!isTexts(choices) || choices.length === 0) E(`${where} choices must be a non-empty list of strings`)
    } else if (t === 'choice') E(`${where} is type choice and needs choices:`)
    if (def !== undefined) {
      if (!termTypeOk(t, def)) E(`${where} default does not match type ${t}`)
      else if (t === 'choice' && isTexts(choices) && !choices.includes(def as string)) E(`${where} default "${String(def)}" is not one of the choices`)
    }
  }

  // ── data ──────────────────────────────────────
  checkNames('data', term.data, TERM_NAME_RE, 'lowercase kebab-case (letters, digits, hyphens, starting with a letter)')
  const dataFields = new Map<string, Set<string>>()
  for (const d of term.data) {
    const label = `@arkzen:term:data:${d.name}`
    const data = mapOf(label, d.data)
    checkKeys(label, data, ['storage', 'file', 'location', 'fields', 'id', 'sort', 'soft_delete', 'seed'])
    checkEnum(`${label} storage`, data.storage, TERM_STORAGES)
    checkText(`${label} file`, data.file)
    checkEnum(`${label} location`, data.location, TERM_LOCATIONS)
    checkBool(`${label} soft_delete`, data.soft_delete)
    if (data.storage === 'sqlite') W(`${label} storage: sqlite needs a database library in each runtime and is unverified. Choose the library in @arkzen:term:runtime:<lang> dependencies.`)
    const fields = new Map<string, { type: string; required: boolean; hasDefault: boolean }>()
    if (!Array.isArray(data.fields) || data.fields.length === 0) E(`${label} needs fields: a non-empty list`)
    else {
      for (const [i, raw] of data.fields.entries()) {
        const where = `${label} fields[${i}]`
        if (!isMap(raw)) { E(`${where} must be a mapping`); continue }
        checkKeys(where, raw, ['name', 'type', 'required', 'default', 'choices', 'searchable', 'sortable', 'display', 'validate'])
        if (!isText(raw.name) || !TERM_IDENT_RE.test(raw.name)) { E(`${where} needs a name: in snake_case`); continue }
        if (fields.has(raw.name)) E(`${label}: duplicate field "${raw.name}"`)
        const type = typeof raw.type === 'string' ? raw.type : ''
        if (!TERM_FIELD_TYPES.includes(type)) E(`${where} (${raw.name}) type must be one of: ${TERM_FIELD_TYPES.join(', ')}`)
        checkBool(`${where} (${raw.name}) required`, raw.required)
        checkBool(`${where} (${raw.name}) searchable`, raw.searchable)
        checkBool(`${where} (${raw.name}) sortable`, raw.sortable)
        if (type === 'choice') {
          if (!isTexts(raw.choices) || raw.choices.length === 0) E(`${where} (${raw.name}) is type choice and needs choices:`)
        } else if (raw.choices !== undefined) E(`${where} (${raw.name}) choices only apply to type choice`)
        if (raw.default !== undefined) {
          if (!termTypeOk(type, raw.default)) E(`${where} (${raw.name}) default does not match type ${type}`)
          else if (type === 'choice' && isTexts(raw.choices) && !raw.choices.includes(raw.default as string)) E(`${where} (${raw.name}) default "${String(raw.default)}" is not one of the choices`)
        }
        if (raw.display !== undefined) {
          if (!isMap(raw.display)) E(`${where} (${raw.name}) display must be a mapping (label, width, format)`)
          else {
            checkKeys(`${where} (${raw.name}) display`, raw.display, ['label', 'width', 'format'])
            checkText(`${where} (${raw.name}) display.label`, raw.display.label)
            checkText(`${where} (${raw.name}) display.format`, raw.display.format)
            if (raw.display.width !== undefined && !isPosInt(raw.display.width)) E(`${where} (${raw.name}) display.width must be a positive integer`)
          }
        }
        checkValidate(`${where} (${raw.name}) validate`, raw.validate)
        fields.set(raw.name, { type, required: raw.required === true, hasDefault: raw.default !== undefined })
      }
    }
    dataFields.set(d.name, new Set(fields.keys()))
    if (data.id !== undefined) {
      if (!isText(data.id)) E(`${label} id must be auto or a field name`)
      else if (data.id !== 'auto' && !fields.has(data.id)) E(`${label} id "${data.id}" is not a declared field`)
    }
    if ((data.id === undefined || data.id === 'auto') && fields.has('id')) E(`${label}: a field named "id" collides with the generated id. Set id: id to use it as the key`)
    if (data.sort !== undefined) {
      if (!isText(data.sort)) E(`${label} sort must be a field name, or -field for descending`)
      else if (!fields.has(data.sort.replace(/^-/, ''))) E(`${label} sort "${data.sort}" is not a declared field`)
    }
    if (data.seed !== undefined) {
      if (!Array.isArray(data.seed)) E(`${label} seed must be a list of records`)
      else {
        for (const [i, rec] of data.seed.entries()) {
          const where = `${label} seed[${i}]`
          if (!isMap(rec)) { E(`${where} must be a mapping`); continue }
          for (const [k, v] of Object.entries(rec)) {
            const f = fields.get(k)
            if (!f) E(`${where}: "${k}" is not a declared field`)
            else if (!termTypeOk(f.type, v)) E(`${where}: "${k}" does not match type ${f.type}`)
          }
          for (const [k, f] of fields) {
            if (f.required && !f.hasDefault && rec[k] === undefined) E(`${where}: required field "${k}" is missing`)
          }
        }
      }
    }
  }

  // ── screen ────────────────────────────────────
  checkNames('screen', term.screens, TERM_NAME_RE, 'lowercase kebab-case (letters, digits, hyphens, starting with a letter)')
  const hookExists = (name: string): boolean => viewNames.has(name) || handlerNames.has(name)
  for (const sc of term.screens) {
    const label = `@arkzen:term:screen:${sc.name}`
    const data = mapOf(label, sc.data)
    checkKeys(label, data, ['title', 'layout', 'size', 'panes', 'on_start', 'on_key'])
    checkText(`${label} title`, data.title)
    checkEnum(`${label} layout`, data.layout, TERM_LAYOUTS)
    for (const hook of ['on_start', 'on_key']) {
      if (data[hook] !== undefined) {
        if (!isText(data[hook])) E(`${label} ${hook} must name a @arkzen:term:view or handler`)
        else if (!hookExists(data[hook] as string)) E(`${label} ${hook} "${String(data[hook])}" matches no @arkzen:term:view or @arkzen:term:handler name`)
      }
    }
    const paneCount = Array.isArray(data.panes) ? data.panes.length : 0
    if (!Array.isArray(data.panes) || data.panes.length === 0) E(`${label} needs panes: a non-empty list`)
    else {
      const focusSeen = new Set<number>()
      for (const [i, raw] of data.panes.entries()) {
        const where = `${label} panes[${i}]`
        if (!isMap(raw)) { E(`${where} must be a mapping`); continue }
        checkKeys(where, raw, ['widget', 'data', 'columns', 'bind', 'focus', 'keymap', 'refresh'])
        if (!isText(raw.widget) || !TERM_WIDGETS.includes(raw.widget)) E(`${where} widget must be one of: ${TERM_WIDGETS.join(', ')}`)
        const widget = isText(raw.widget) ? raw.widget : ''
        const isData = isText(raw.data) && dataNames.has(raw.data)
        if (raw.data !== undefined && !isText(raw.data)) E(`${where} data must be a @arkzen:term:data name or a state key`)
        if ((widget === 'table' || widget === 'form') && !isData) {
          E(`${where}: a ${widget} widget needs data: naming a declared @arkzen:term:data${dataNames.size ? ` (declared: ${[...dataNames].join(', ')})` : ''}`)
        }
        if (raw.columns !== undefined) {
          if (!isTexts(raw.columns) || raw.columns.length === 0) E(`${where} columns must be a non-empty list of field names`)
          else if (widget !== 'table' && widget !== 'list') W(`${where} columns only apply to table and list widgets`)
          else if (isData) {
            const known = dataFields.get(raw.data as string) ?? new Set<string>()
            for (const col of raw.columns) if (!known.has(col)) E(`${where} columns: "${col}" is not a field of @arkzen:term:data:${String(raw.data)}`)
          }
        }
        checkText(`${where} bind`, raw.bind)
        if (raw.focus !== undefined) {
          if (!isPosInt(raw.focus)) E(`${where} focus must be a positive integer (the focus order)`)
          else {
            if (focusSeen.has(raw.focus)) E(`${label}: focus order ${raw.focus} is used by more than one pane`)
            focusSeen.add(raw.focus)
          }
        }
        if (raw.keymap !== undefined) {
          if (!isText(raw.keymap)) E(`${where} keymap must name a keymap scope`)
          else if (!keymapScopes.has(raw.keymap) && !keymapNames.has(raw.keymap)) E(`${where} keymap "${raw.keymap}" matches no @arkzen:term:keymap${keymapScopes.size ? ` (declared: ${[...keymapScopes].join(', ')})` : ''}`)
        }
        checkPosNumber(`${where} refresh`, raw.refresh)
      }
    }
    if (data.size !== undefined) {
      if (!Array.isArray(data.size) || !data.size.every(n => typeof n === 'number' && n > 0)) E(`${label} size must be a list of positive weights`)
      else if (paneCount > 0 && data.size.length !== paneCount) E(`${label} size lists ${data.size.length} weights for ${paneCount} pane(s)`)
    }
  }

  // ── loop ──────────────────────────────────────
  checkNames('loop', term.loops, TERM_NAME_RE, 'lowercase kebab-case (letters, digits, hyphens, starting with a letter)')
  for (const lp of term.loops) {
    const label = `@arkzen:term:loop:${lp.name}`
    const data = mapOf(label, lp.data)
    checkKeys(label, data, ['tick_rate', 'render', 'size', 'input', 'seed', 'pause_key', 'save_file', 'fixed_timestep'])
    if (data.tick_rate === undefined) E(`${label} needs tick_rate: (updates per second)`)
    else checkPosNumber(`${label} tick_rate`, data.tick_rate)
    checkEnum(`${label} render`, data.render, TERM_LOOP_RENDERS)
    checkSize(`${label} size`, data.size)
    checkEnum(`${label} input`, data.input, TERM_LOOP_INPUTS)
    if (data.seed !== undefined && data.seed !== 'random' && !(typeof data.seed === 'number' && Number.isFinite(data.seed))) E(`${label} seed must be a number or random`)
    checkText(`${label} pause_key`, data.pause_key)
    checkText(`${label} save_file`, data.save_file)
    checkBool(`${label} fixed_timestep`, data.fixed_timestep)
    if (!isTui) E(`${label}: a loop draws to the terminal, so @arkzen:term:project mode must be tui or hybrid`)
    for (const lang of runtimeList) {
      const view = term.views.find(v => v.lang === lang && v.name === lp.name && v.header.kind === 'loop')
      if (!view) E(`${label} has no @arkzen:term:view:${lang}:${lp.name} with kind: loop for runtime "${lang}"`)
    }
  }

  // ── view ──────────────────────────────────────
  const viewKey = new Set<string>()
  for (const v of term.views) {
    const label = `@arkzen:term:view:${v.lang}:${v.name}`
    if (!TERM_NAME_RE.test(v.name)) E(`${label}: the name must be lowercase kebab-case`)
    if (viewKey.has(`${v.lang}:${v.name}`)) E(`Duplicate ${label}`)
    viewKey.add(`${v.lang}:${v.name}`)
    checkKeys(label, v.header, ['kind', 'screen'])
    const kind = v.header.kind
    if (!isText(kind) || !TERM_VIEW_KINDS.includes(kind)) { E(`${label} needs kind: ${TERM_VIEW_KINDS.join(' | ')}`); continue }
    if (v.header.screen !== undefined) {
      if (!isText(v.header.screen)) E(`${label} screen must name a @arkzen:term:screen`)
      else if (!screenNames.has(v.header.screen)) E(`${label} screen "${v.header.screen}" is not declared. Add @arkzen:term:screen:${v.header.screen}`)
    }
    if (kind === 'widget' && !isText(v.header.screen)) E(`${label} kind: widget needs screen: (the screen it lives in)`)
    if (kind === 'loop') {
      if (!loopNames.has(v.name)) E(`${label} kind: loop has no @arkzen:term:loop:${v.name}`)
      if (v.lang === 'ts') {
        for (const fn of ['init', 'update', 'draw']) {
          if (!new RegExp(`export\\s+(?:async\\s+)?(?:function\\s*\\*?|const|let)\\s+${fn}\\b`).test(v.raw)) E(`${label} (loop) must export \`${fn}\` (the loop contract is init, update, draw)`)
        }
      }
    } else if (v.lang === 'ts' && !/export\s+default\b/.test(v.raw)) {
      E(`${label} (${kind}) must \`export default\` a component`)
    }
    if ((kind === 'screen' || kind === 'widget') && !isTui) E(`${label}: a ${kind} view needs @arkzen:term:project mode tui or hybrid`)
  }

  // ── handler / script / test ───────────────────
  const handlerKey = new Set<string>()
  for (const h of term.handlers) {
    const label = `@arkzen:term:handler:${h.lang}:${h.name}`
    checkKeys(label, h.header, ['command', 'async'])
    checkBool(`${label} async`, h.header.async)
    if (handlerKey.has(`${h.lang}:${h.name}`)) E(`Duplicate ${label}`)
    handlerKey.add(`${h.lang}:${h.name}`)
    const target = isText(h.header.command) ? h.header.command : h.name
    if (h.header.command !== undefined && !isText(h.header.command)) E(`${label} command must be a command name`)
    if (!commandNames.has(target)) E(`${label}: no @arkzen:term:command:${target} exists for this handler${h.header.command === undefined ? ' (the command defaults to the handler name; set command: to point elsewhere)' : ''}`)
    else {
      const cmd = term.commands.find(c => c.name === target)
      const builtin = isMap(cmd?.data) && typeof cmd?.data.builtin === 'string' && cmd?.data.builtin !== 'none'
      if (builtin) W(`${label}: command "${target}" has builtin: ${String((cmd?.data as Record<string, unknown>).builtin)}, so the handler is never called`)
    }
    if (h.lang === 'ts' && !/export\s+default\b/.test(h.raw)) E(`${label} must \`export default\` the handler function`)
  }
  for (const group of [['script', term.scripts], ['test', term.tests]] as const) {
    const [kind, blocks] = group
    const seen = new Set<string>()
    for (const b of blocks) {
      const label = `@arkzen:term:${kind}:${b.lang}:${b.name}`
      if (!TERM_NAME_RE.test(b.name)) E(`${label}: the name must be lowercase kebab-case`)
      if (seen.has(`${b.lang}:${b.name}`)) E(`Duplicate ${label}`)
      seen.add(`${b.lang}:${b.name}`)
      if (Object.keys(b.header).length > 0) W(`${label}: a ${kind} block takes no header keys (found ${Object.keys(b.header).join(', ')})`)
    }
  }

  // every code block's <lang> must be a listed runtime; no code may import Pluffy
  const codeBlocks: { label: string; lang: string; raw: string }[] = [
    ...term.handlers.map(b => ({ label: `@arkzen:term:handler:${b.lang}:${b.name}`, lang: b.lang, raw: b.raw })),
    ...term.views.map(b    => ({ label: `@arkzen:term:view:${b.lang}:${b.name}`,    lang: b.lang, raw: b.raw })),
    ...term.scripts.map(b  => ({ label: `@arkzen:term:script:${b.lang}:${b.name}`,  lang: b.lang, raw: b.raw })),
    ...term.tests.map(b    => ({ label: `@arkzen:term:test:${b.lang}:${b.name}`,    lang: b.lang, raw: b.raw })),
  ]
  for (const b of codeBlocks) {
    if (term.project && !runtimeList.includes(b.lang)) E(`${b.label}: "${b.lang}" is not listed in @arkzen:term:project runtimes (listed: ${runtimeList.join(', ') || 'none'})`)
    const rule = TERM_PLUFFY_IMPORT[b.lang]
    if (rule && rule.test(b.raw)) E(`${b.label} imports from Pluffy. Generated terminal programs must stay standalone and never depend on Pluffy`)
  }

  // ── readme ────────────────────────────────────
  if (term.readme && Object.keys(term.readme.header).length > 0) W(`@arkzen:term:readme takes no header keys (found ${Object.keys(term.readme.header).join(', ')})`)

  // ── project-level cross checks ────────────────
  if (term.project && mode) {
    if (term.screens.length > 0 && mode === 'cli') E('@arkzen:term:screen blocks need @arkzen:term:project mode tui or hybrid')
    if (isTui) {
      const hasScreenView = term.views.some(v => v.header.kind === 'screen')
      if (term.screens.length === 0 && !hasScreenView && term.loops.length === 0) E(`mode ${mode} needs at least one @arkzen:term:screen, a @arkzen:term:view with kind: screen, or a @arkzen:term:loop`)
    }
    if (hasCli && term.commands.length === 0) E(`mode ${mode} needs at least one @arkzen:term:command`)
    if (mode === 'tui' && term.commands.length > 0) W('mode tui with @arkzen:term:command blocks: the commands are not reachable. Use mode: hybrid for a CLI and a TUI in one program')
    if (isText(project.default_command) && !commandNames.has(project.default_command)) E(`@arkzen:term:project default_command "${project.default_command}" is not a declared @arkzen:term:command`)
    for (const [name, generated] of commandIsGenerated) {
      if (generated) continue
      for (const lang of runtimeList) {
        if (!term.handlers.some(h => h.lang === lang && (isText(h.header.command) ? h.header.command : h.name) === name)) {
          E(`@arkzen:term:command:${name} has no @arkzen:term:handler:${lang}:${name} for runtime "${lang}". Add the handler, set builtin:, or give the command a prompt with assets templates so it can be generated`)
        }
      }
    }
  }
  for (const pr of term.prompts) {
    if (!promptsUsed.has(pr.name)) W(`@arkzen:term:prompt:${pr.name} is not used by any @arkzen:term:command (set prompt: ${pr.name} on a command)`)
  }

  // ── export ────────────────────────────────────
  if (term.export) {
    const label = '@arkzen:term:export'
    const exp = mapOf(label, term.export.data)
    checkKeys(label, exp, ['platforms', 'formats', 'completions', 'man_page', 'embed_version'])
    if (exp.platforms !== undefined) {
      if (!isTexts(exp.platforms) || exp.platforms.length === 0) E(`${label} platforms must be a non-empty list (${TERM_PLATFORMS.join(', ')})`)
      else {
        for (const p of exp.platforms) if (!TERM_PLATFORMS.includes(p)) E(`${label} platforms: unknown platform "${p}". Valid: ${TERM_PLATFORMS.join(', ')}`)
        if (exp.platforms.length > 1) {
          const noCross = runtimeList.filter(l => !TERM_CROSS_COMPILE.includes(l))
          if (noCross.length > 0) W(`${label} lists ${exp.platforms.length} platforms, but ${noCross.join(', ')} cannot cross-compile. Those runtimes can only be built on the target OS.`)
        }
      }
    }
    if (exp.formats !== undefined) {
      if (!isTexts(exp.formats) || exp.formats.length === 0) E(`${label} formats must be a non-empty list (${TERM_FORMATS.join(', ')})`)
      else {
        for (const f of exp.formats) {
          if (!TERM_FORMATS.includes(f)) { E(`${label} formats: unknown format "${f}". Valid: ${TERM_FORMATS.join(', ')}`); continue }
          const need = TERM_FORMAT_RUNTIME[f]
          if (need && term.project && !runtimeList.includes(need)) E(`${label} formats: "${f}" needs the "${need}" runtime, which @arkzen:term:project does not list`)
          if (f === 'single_binary' && runtimeList.length > 0 && !runtimeList.some(l => TERM_CROSS_COMPILE.includes(l))) W(`${label} formats: single_binary is untested for ${runtimeList.join(', ')}. Go and Rust produce native binaries.`)
        }
      }
    }
    if (exp.completions !== undefined) {
      if (!isTexts(exp.completions)) E(`${label} completions must be a list (${TERM_COMPLETIONS.join(', ')})`)
      else {
        for (const c of exp.completions) if (!TERM_COMPLETIONS.includes(c)) E(`${label} completions: unknown shell "${c}". Valid: ${TERM_COMPLETIONS.join(', ')}`)
        if (exp.completions.length > 0 && !hasCli) W(`${label} completions only apply to a program with commands (mode is ${mode || 'not set'})`)
      }
    }
    checkBool(`${label} man_page`, exp.man_page)
    checkBool(`${label} embed_version`, exp.embed_version)
  }

  // ── toolchains ────────────────────────────────
  for (const lang of runtimeList) {
    if (!termToolchainInstalled(lang)) {
      W(`${TERM_TOOLCHAIN[lang]?.label ?? lang} is not installed here, so the "${lang}" runtime can only be generated, not built. It will verify as UNVERIFIED.`)
    }
  }

  return { errors, warnings }
}

// ─────────────────────────────────────────────
// OPERATING SYSTEM BLOCKS (v20.0)
// @arkzen:os:project, target, config, boot, memory, interrupts, scheduler, syscall, driver,
// fs, userland, shell, image, run, test, assets, distro, board, source, readme.
// The parser reads the structure; every contract is checked here so a wrong value is
// reported before the build. Only Tatemonos that declare an os block are checked.
// Source: PLUFFY_OS_PLAN.md sections 7.4 to 7.7.
// ─────────────────────────────────────────────

const OS_KINDS         = ['kernel', 'os', 'bootloader', 'bootapp', 'firmware', 'unikernel', 'driver', 'distro', 'desktop']
const OS_ARCHS         = ['x86_64', 'aarch64', 'riscv64', 'x86', 'arm-cortex-m']
const OS_X86_ARCHS     = ['x86_64', 'x86']
const OS_LANG_CODES    = ['rs', 'c', 'asm', 'go', 'cpp']
const OS_USER_LANGS    = ['rs', 'c', 'asm']
const OS_KERNEL_TYPES  = ['monolithic', 'microkernel', 'hybrid', 'unikernel', 'exokernel', 'rtos']
const OS_HOSTS         = ['linux', 'windows', 'macos']
const OS_FEATURES      = ['serial_log', 'framebuffer_console', 'heap', 'scheduler', 'syscalls', 'userland', 'filesystem', 'network']
const OS_LOG_LEVELS    = ['off', 'error', 'warn', 'info', 'debug', 'trace']
const OS_PANIC_MODES   = ['halt', 'reboot', 'dump']
const OS_FIRMWARES     = ['bios', 'uefi', 'direct']
const OS_LOADERS       = ['bootloader_crate', 'limine', 'grub', 'custom', 'none']
const OS_PHYSICAL      = ['bitmap', 'buddy', 'freelist']
const OS_HEAP_ALLOCS   = ['bump', 'linked_list', 'slab']
const OS_REGION_KINDS  = ['code', 'data', 'stack', 'heap', 'mmio']
const OS_REGION_FLAGS  = ['read', 'write', 'exec']
const OS_CONTROLLERS   = ['pic', 'apic', 'gic', 'plic']
const OS_POLICIES      = ['round_robin', 'priority', 'mlfq', 'cooperative', 'none']
const OS_DRIVER_CLASSES = ['serial', 'framebuffer', 'keyboard', 'mouse', 'timer', 'rtc', 'disk', 'nic', 'usb', 'gpio', 'i2c', 'spi', 'uart', 'pci', 'virtio']
const OS_BUSES         = ['platform', 'pci', 'usb', 'virtio', 'i2c', 'spi']
const OS_DRIVER_MODELS = ['polling', 'interrupt', 'dma']
const OS_FS_TYPES      = ['ramfs', 'tarfs', 'fat32', 'ext2', 'custom']
const OS_LIBCS         = ['none', 'minimal', 'external']
const OS_IMAGE_FORMATS = ['iso', 'raw', 'uefi_disk', 'efi_app', 'elf', 'bin', 'uf2', 'sd_image', 'initramfs']
const OS_EMULATORS     = ['qemu']
const OS_DISPLAYS      = ['none', 'gtk', 'sdl', 'vnc']
const OS_SERIALS       = ['stdio', 'file', 'none']
const OS_ACCELS        = ['auto', 'kvm', 'tcg']
const OS_TEST_KINDS    = ['boot', 'unit']
const OS_BUILDERS      = ['buildroot', 'yocto', 'debootstrap', 'alpine', 'nixos']
const OS_INITS         = ['systemd', 'openrc', 'busybox', 'custom']
const OS_BOARD_RUNTIMES = ['bare', 'embassy', 'freertos', 'zephyr', 'other']
const OS_FLASH_TOOLS   = ['uf2', 'openocd', 'probe_rs']
const OS_SOURCE_PARTS  = ['kernel', 'user', 'boot', 'driver', 'lib', 'test']
const OS_CHECKSUMS     = ['sha256']
const OS_SYSCALL_TYPES = ['u8', 'u16', 'u32', 'u64', 'i8', 'i16', 'i32', 'i64', 'usize', 'isize', 'bool', 'ptr']
const OS_SYSCALL_RETURNS = [...OS_SYSCALL_TYPES, 'void', 'never']
// Known QEMU device names. A name outside this list is a warning, not an error.
const OS_QEMU_DEVICES  = [
  'serial', 'vga', 'nic', 'virtio-blk', 'virtio-net', 'virtio-gpu', 'virtio-keyboard', 'virtio-mouse', 'virtio-rng',
  'virtio-blk-pci', 'virtio-net-pci', 'virtio-gpu-pci', 'virtio-keyboard-pci', 'virtio-mouse-pci', 'isa-debug-exit',
  'e1000', 'rtl8139', 'ahci', 'nvme', 'usb-kbd', 'usb-mouse', 'usb-tablet', 'qemu-xhci', 'ramfb',
]

// Which blocks each kind needs (R), does not use (X) and may use (O).
// Source: PLUFFY_OS_PLAN.md section 7.6.
const OS_MATRIX_COLUMNS = ['project', 'target', 'boot', 'memory', 'interrupts', 'scheduler', 'syscall', 'driver', 'fs', 'userland', 'image', 'run', 'test', 'board', 'distro', 'source'] as const
const OS_MATRIX: Record<string, string> = {
  //            project target boot memory interrupts scheduler syscall driver fs userland image run test board distro source
  kernel:     'R R R R O O O O O X R R R X X R',
  os:         'R R R R R R R O O R R R R X X R',
  bootloader: 'R R R O O X X X X X R R R X X R',
  bootapp:    'R R R O O X X O X X R R R X X R',
  firmware:   'R R X O O O X O X X R O O R X R',
  unikernel:  'R R R R O O O O O X R R R X X R',
  driver:     'R O X X X X X R X X X O O X X R',
  distro:     'R O X X X X X X X X R O O X R X',
  desktop:    'R O X X X X X X X R O O O X O R',
}
const OS_NEEDS_ENTRY    = ['kernel', 'os', 'bootloader', 'bootapp', 'unikernel', 'firmware']
const OS_NAME_RE        = /^[a-z][a-z0-9_-]*$/
const OS_IDENT_RE       = /^[a-z][a-z0-9_]*$/
const OS_FN_RE          = /^[A-Za-z_][A-Za-z0-9_]*$/
const OS_HANDLER_RE     = /^([a-z][a-z0-9_]*)::([A-Za-z_][A-Za-z0-9_]*)$/
const OS_SPDX_SYNTAX    = /^[A-Za-z0-9.+-]+$/
const OS_HOSTNAME_RE    = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
const OS_DEVICE_PATH_RE = /^(?:\/dev\/|\\\\\.\\|\/proc\/|\/sys\/)/i
const OS_SECRET_KEY     = /^(?:key|.*(?:token|password|passwd|secret|private[_-]?key|api[_-]?key|credential).*)$/i
// A pointer to Pluffy from source that will be generated into a standalone project (rule 1).
const OS_PLUFFY_IMPORT: Record<string, RegExp> = {
  rs:  /^[ \t]*(?:pub[ \t]+)?(?:use|extern[ \t]+crate)[ \t]+(?:arkzen|pluffy)\b/im,
  c:   /^[ \t]*#[ \t]*include[ \t]*[<"][^>"\n]*(?:arkzen|pluffy)[^>"\n]*[>"]/im,
  cpp: /^[ \t]*#[ \t]*include[ \t]*[<"][^>"\n]*(?:arkzen|pluffy)[^>"\n]*[>"]/im,
  asm: /^[ \t]*(?:%include|\.include|include)[ \t]+["'][^"'\n]*(?:arkzen|pluffy)[^"'\n]*["']/im,
  go:  /^[ \t]*(?:import[ \t]+)?(?:[A-Za-z_.][A-Za-z0-9_]*[ \t]+)?"[^"\n]*(?:\/|^)(?:arkzen|pluffy)(?:\/[^"\n]*)?"[ \t]*$/im,
}

// Tools needed to build and to boot. A missing tool is a warning and the target verifies as UNVERIFIED.
const OS_TOOLS: Record<string, { cmd: string; args: string[]; label: string }> = {
  rustc:   { cmd: 'rustc',   args: ['--version'], label: 'Rust (rustc)' },
  cargo:   { cmd: 'cargo',   args: ['--version'], label: 'Rust (cargo)' },
  gcc:     { cmd: 'gcc',     args: ['--version'], label: 'a C compiler (gcc)' },
  ld:      { cmd: 'ld',      args: ['--version'], label: 'the GNU linker (ld)' },
  nasm:    { cmd: 'nasm',    args: ['-v'],        label: 'nasm' },
  tinygo:  { cmd: 'tinygo',  args: ['version'],   label: 'TinyGo' },
  'qemu-system-x86_64':  { cmd: 'qemu-system-x86_64',  args: ['--version'], label: 'QEMU (x86_64)' },
  'qemu-system-aarch64': { cmd: 'qemu-system-aarch64', args: ['--version'], label: 'QEMU (aarch64)' },
  'qemu-system-riscv64': { cmd: 'qemu-system-riscv64', args: ['--version'], label: 'QEMU (riscv64)' },
  'qemu-system-i386':    { cmd: 'qemu-system-i386',    args: ['--version'], label: 'QEMU (x86)' },
}
const OS_QEMU_FOR_ARCH: Record<string, string> = {
  x86_64: 'qemu-system-x86_64', aarch64: 'qemu-system-aarch64', riscv64: 'qemu-system-riscv64', x86: 'qemu-system-i386',
}

const osToolCache = new Map<string, boolean>()
function osToolInstalled(tool: string): boolean {
  const spec = OS_TOOLS[tool]
  if (!spec) return true
  const cached = osToolCache.get(tool)
  if (cached !== undefined) return cached
  let ok = false
  // A cold first start of a large toolchain can pass the short timeout. Retry once with a longer one
  // before calling the tool missing, so a slow disk does not mark a build UNVERIFIED by mistake.
  for (const timeout of [4000, 20000]) {
    try {
      const r = spawnSync(spec.cmd, spec.args, { stdio: 'ignore', timeout, windowsHide: true })
      if (!r.error && r.status === 0) { ok = true; break }
      const code = (r.error as NodeJS.ErrnoException | undefined)?.code
      if (code !== 'ETIMEDOUT') break
    } catch { break }
  }
  osToolCache.set(tool, ok)
  return ok
}

// A size or address: a non-negative integer, or a string such as 0x1000, 4096, 64K, 16M, 1G.
// Returns undefined when the value is not one.
function osNumber(value: unknown): bigint | undefined {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0 ? BigInt(value) : undefined
  }
  if (typeof value !== 'string') return undefined
  const m = value.trim().replace(/_/g, '').match(/^(0x[0-9a-fA-F]+|\d+)\s*([KMG])?(?:i?B)?$/i)
  if (!m) return undefined
  const base = BigInt(m[1])
  const unit = m[2]?.toUpperCase()
  const mult = unit === 'K' ? 1024n : unit === 'M' ? 1024n * 1024n : unit === 'G' ? 1024n * 1024n * 1024n : 1n
  return base * mult
}

function osCollectSecrets(value: unknown, trail: string, out: string[]): void {
  if (Array.isArray(value)) { value.forEach((v, i) => osCollectSecrets(v, `${trail}[${i}]`, out)); return }
  if (!isMap(value)) return
  for (const [key, v] of Object.entries(value)) {
    if (OS_SECRET_KEY.test(key)) out.push(`${trail}.${key}`)
    osCollectSecrets(v, `${trail}.${key}`, out)
  }
}

function osCollectStrings(value: unknown, trail: string, out: { path: string; text: string }[]): void {
  if (typeof value === 'string') { out.push({ path: trail, text: value }); return }
  if (Array.isArray(value)) { value.forEach((v, i) => osCollectStrings(v, `${trail}[${i}]`, out)); return }
  if (isMap(value)) for (const [key, v] of Object.entries(value)) osCollectStrings(v, `${trail}.${key}`, out)
}

function validateOs(parsed: ParsedTatemono, filePath: string): { errors: string[]; warnings: string[] } {
  const errors:   string[] = []
  const warnings: string[] = []
  const os = parsed.os
  if (!os) return { errors, warnings }

  const E = (msg: string): void => { errors.push(msg) }
  const W = (msg: string): void => { warnings.push(msg) }

  const assetsDir = path.join(path.dirname(filePath), 'assets')
  const listAssets = (): string[] => {
    const out: string[] = []
    const walk = (dir: string, rel: string): void => {
      let entries: fs.Dirent[] = []
      try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
      for (const entry of entries) {
        const r = rel ? `${rel}/${entry.name}` : entry.name
        if (entry.isDirectory()) walk(path.join(dir, entry.name), r)
        else out.push(r)
      }
    }
    walk(assetsDir, '')
    return out
  }
  const cleanAsset = (rel: string): string => rel.replace(/\\/g, '/').replace(/^(?:\.\/)?\/?(?:assets\/)?/, '')
  const globToRe = (glob: string): RegExp => {
    let re = ''
    for (let i = 0; i < glob.length; i++) {
      const c = glob[i]
      if (c === '*') {
        if (glob[i + 1] === '*') { re += '.*'; i++; if (glob[i + 1] === '/') i++ } else re += '[^/]*'
      } else if (c === '?') re += '[^/]'
      else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    }
    return new RegExp(`^${re}$`)
  }

  const checkKeys = (label: string, map: Record<string, unknown>, known: string[]): void => {
    for (const key of Object.keys(map)) {
      if (!known.includes(key)) W(`${label}: unknown key "${key}" (known: ${known.join(', ')}). A misspelled key is ignored by the build.`)
    }
  }
  const checkEnum = (label: string, value: unknown, allowed: string[]): void => {
    if (value !== undefined && !(typeof value === 'string' && allowed.includes(value))) {
      E(`${label} must be one of: ${allowed.join(', ')} (got ${JSON.stringify(value)})`)
    }
  }
  const checkEnums = (label: string, value: unknown, allowed: string[]): void => {
    if (value === undefined) return
    if (!Array.isArray(value)) { E(`${label} must be a list (${allowed.join(', ')})`); return }
    for (const v of value) if (!(typeof v === 'string' && allowed.includes(v))) E(`${label}: "${String(v)}" is not valid. Use one of: ${allowed.join(', ')}`)
  }
  const checkBool = (label: string, value: unknown): void => {
    if (value !== undefined && typeof value !== 'boolean') E(`${label} must be true or false`)
  }
  const checkText = (label: string, value: unknown): void => {
    if (value !== undefined && !isText(value)) E(`${label} must be a non-empty string`)
  }
  const checkTexts = (label: string, value: unknown): void => {
    if (value !== undefined && !isTexts(value)) E(`${label} must be a list of non-empty strings`)
  }
  const checkPosInt = (label: string, value: unknown): void => {
    if (value !== undefined && !isPosInt(value)) E(`${label} must be a positive integer`)
  }
  // A size or address. Returns the value, or undefined after reporting.
  const checkNumber = (label: string, value: unknown, opts: { positive?: boolean } = {}): bigint | undefined => {
    if (value === undefined) return undefined
    const n = osNumber(value)
    if (n === undefined) { E(`${label} must be a non-negative integer, a hex value such as 0x1000, or a size such as 64K, 16M or 1G (got ${JSON.stringify(value)})`); return undefined }
    if (opts.positive && n === 0n) { E(`${label} must be greater than zero`); return undefined }
    return n
  }
  const mapOf = (label: string, data: unknown): Record<string, unknown> => {
    if (isMap(data)) return data
    E(`${label} must be a YAML mapping`)
    return {}
  }
  const checkRegex = (label: string, value: unknown): void => {
    if (!isText(value)) { E(`${label} must be a non-empty regular expression`); return }
    try { new RegExp(value) } catch (e) { E(`${label} is not a valid regular expression: ${e instanceof Error ? e.message : String(e)}`) }
  }
  const checkNames = (kind: string, blocks: { name: string }[], re: RegExp, style: string): void => {
    const seen = new Set<string>()
    for (const block of blocks) {
      if (!re.test(block.name)) E(`@arkzen:os:${kind}:${block.name}: the name must be ${style}`)
      if (seen.has(block.name)) E(`Duplicate @arkzen:os:${kind}:${block.name}`)
      seen.add(block.name)
    }
  }

  // ── rule: no secrets, no device paths, in any os block ──
  const yamlBlocks: { label: string; data: unknown }[] = []
  const addYaml = (label: string, block: { data: unknown } | undefined): void => { if (block) yamlBlocks.push({ label, data: block.data }) }
  for (const p of os.projects) yamlBlocks.push({ label: `@arkzen:os:project${p.name ? ':' + p.name : ''}`, data: p.data })
  for (const t of os.targets)   yamlBlocks.push({ label: `@arkzen:os:target:${t.name}`, data: t.data })
  addYaml('@arkzen:os:config', os.config);         addYaml('@arkzen:os:boot', os.boot)
  addYaml('@arkzen:os:memory', os.memory);         addYaml('@arkzen:os:interrupts', os.interrupts)
  addYaml('@arkzen:os:scheduler', os.scheduler);   addYaml('@arkzen:os:fs', os.fs)
  addYaml('@arkzen:os:shell', os.shell);           addYaml('@arkzen:os:image', os.image)
  addYaml('@arkzen:os:run', os.run);               addYaml('@arkzen:os:assets', os.assets)
  addYaml('@arkzen:os:distro', os.distro);         addYaml('@arkzen:os:board', os.board)
  for (const b of os.syscalls) yamlBlocks.push({ label: `@arkzen:os:syscall:${b.name}`, data: b.data })
  for (const b of os.drivers)  yamlBlocks.push({ label: `@arkzen:os:driver:${b.name}`, data: b.data })
  for (const b of os.userland) yamlBlocks.push({ label: `@arkzen:os:userland:${b.name}`, data: b.data })
  for (const b of os.tests)    yamlBlocks.push({ label: `@arkzen:os:test:${b.name}`, data: b.data })
  for (const b of os.sources)  yamlBlocks.push({ label: `@arkzen:os:source:${b.lang}:${b.name}`, data: b.header })
  for (const { label, data } of yamlBlocks) {
    const secrets: string[] = []
    osCollectSecrets(data, label, secrets)
    for (const s of secrets) E(`${s}: secret-like keys (token, password, secret, key, credential) are not allowed in an os block. Declare account names only and set secrets outside the tatemono.`)
    const strings: { path: string; text: string }[] = []
    osCollectStrings(data, label, strings)
    for (const s of strings) {
      if (OS_DEVICE_PATH_RE.test(s.text.trim())) E(`${s.path}: "${s.text}" points at a device or system path. Pluffy writes images into projects/os/ only and never writes to a disk or device.`)
    }
  }

  // ── project ───────────────────────────────────
  const projects: { id: string; data: Record<string, unknown>; kind: string }[] = []
  if (os.projects.length === 0) {
    E('@arkzen:os:project is required when a tatemono has os blocks (it holds the name, kind and architectures)')
  }
  const projectIds = new Set<string>()
  for (const block of os.projects) {
    const id = block.name
    const label = `@arkzen:os:project${id ? ':' + id : ''}`
    if (id !== undefined && !OS_NAME_RE.test(id)) E(`${label}: the id must be lowercase letters, digits, - or _ and start with a letter`)
    const key = id ?? ''
    if (projectIds.has(key)) E(`Duplicate ${label}`)
    projectIds.add(key)
    if (os.projects.length > 1 && id === undefined) E(`${label}: when a tatemono has more than one project, every project needs an id (@arkzen:os:project:<id>)`)

    const data = mapOf(label, block.data)
    checkKeys(label, data, ['name', 'version', 'description', 'license', 'author', 'kind', 'arch', 'language', 'kernel_type', 'host'])
    if (!isText(data.name)) E(`${label} needs a name:`)
    else if (!OS_NAME_RE.test(data.name)) E(`${label} name "${data.name}" must be lowercase letters, digits, - or _ and start with a letter`)
    checkText(`${label} description`, data.description)
    checkText(`${label} author`, data.author)
    const version = data.version ?? parsed.meta.version
    if (version !== undefined && (typeof version !== 'string' || !TERM_SEMVER_RE.test(version))) {
      E(`${label} version must be a semver string such as 0.1.0 (got ${JSON.stringify(version)}; it defaults to meta.version)`)
    }
    if (data.license !== undefined) {
      if (!isText(data.license) || !OS_SPDX_SYNTAX.test(data.license)) E(`${label} license must be an SPDX id such as MIT or Apache-2.0`)
      else if (!TERM_SPDX_COMMON.includes(data.license)) W(`${label} license "${data.license}" is not in the common SPDX list the engine knows. Check it at spdx.org/licenses`)
    } else {
      W(`${label} has no license:. An exported OS project without a license cannot be legally reused`)
    }

    const kind = data.kind
    if (!isText(kind)) E(`${label} needs a kind: (${OS_KINDS.join(', ')})`)
    else checkEnum(`${label} kind`, kind, OS_KINDS)
    const kindOk = typeof kind === 'string' && OS_KINDS.includes(kind) ? kind : ''

    if (data.arch !== undefined) checkEnums(`${label} arch`, data.arch, OS_ARCHS)
    else if (kindOk && kindOk !== 'driver' && kindOk !== 'distro') E(`${label} needs arch: (a list of ${OS_ARCHS.join(', ')})`)
    if (Array.isArray(data.arch) && data.arch.length === 0) E(`${label} arch must not be empty`)
    if (Array.isArray(data.arch) && new Set(data.arch).size !== data.arch.length) E(`${label} arch lists an architecture twice`)

    checkEnum(`${label} language`, data.language, OS_LANG_CODES)
    if (data.language === undefined && kindOk && kindOk !== 'distro') E(`${label} needs language: (the primary language: ${OS_LANG_CODES.join(', ')})`)
    if (data.language === 'go' && kindOk && kindOk !== 'firmware') E(`${label} language: go is only valid for kind: firmware (TinyGo)`)
    checkEnum(`${label} kernel_type`, data.kernel_type, OS_KERNEL_TYPES)
    if (kindOk === 'unikernel' && data.kernel_type !== undefined && data.kernel_type !== 'unikernel') W(`${label} kind is unikernel but kernel_type is ${String(data.kernel_type)}`)
    if (kindOk === 'firmware' && data.kernel_type !== undefined && data.kernel_type !== 'rtos') W(`${label} kind is firmware but kernel_type is ${String(data.kernel_type)}. Firmware normally uses rtos.`)

    if (kindOk === 'driver') {
      if (!isText(data.host)) E(`${label} needs host: for kind: driver (${OS_HOSTS.join(', ')})`)
      else checkEnum(`${label} host`, data.host, OS_HOSTS)
    } else if (data.host !== undefined) {
      E(`${label}: host: only applies to kind: driver`)
    }
    projects.push({ id: key, data, kind: kindOk })
  }

  const kinds = [...new Set(projects.map(p => p.kind).filter(Boolean))]
  const declaredArchs = new Set<string>()
  for (const p of projects) if (Array.isArray(p.data.arch)) for (const a of p.data.arch) if (typeof a === 'string') declaredArchs.add(a)
  const archList = [...declaredArchs].filter(a => OS_ARCHS.includes(a))
  const hasX86 = archList.some(a => OS_X86_ARCHS.includes(a))
  const hostDriverOnly = kinds.length > 0 && kinds.every(k => k === 'driver')

  // ── kind and block matrix (section 7.6) ───────
  // Blocks are not scoped to a project, so with several projects a block is required when any
  // project's kind requires it and rejected only when every project's kind rejects it.
  const present: Record<string, boolean> = {
    project: os.projects.length > 0, target: os.targets.length > 0, boot: !!os.boot, memory: !!os.memory,
    interrupts: !!os.interrupts, scheduler: !!os.scheduler, syscall: os.syscalls.length > 0, driver: os.drivers.length > 0,
    fs: !!os.fs, userland: os.userland.length > 0, image: !!os.image, run: !!os.run, test: os.tests.length > 0,
    board: !!os.board, distro: !!os.distro, source: os.sources.length > 0,
  }
  if (kinds.length > 0) {
    OS_MATRIX_COLUMNS.forEach((col, i) => {
      const marks = kinds.map(k => OS_MATRIX[k].split(' ')[i])
      const needed = marks.includes('R')
      const rejected = marks.every(m => m === 'X')
      const scope = kinds.length === 1 ? `kind: ${kinds[0]}` : `kinds ${kinds.join(', ')}`
      if (needed && !present[col]) E(`@arkzen:os:${col} is required for ${scope}`)
      if (rejected && present[col]) E(`@arkzen:os:${col} is not used by ${scope}. Remove it.`)
    })
  }

  // ── source names, used to resolve handler references ──
  const sourceNames = new Set(os.sources.map(s => s.name))
  const checkHandler = (label: string, value: unknown): void => {
    if (!isText(value)) { E(`${label} needs a handler: (<source name>::<function>)`); return }
    const m = value.match(OS_HANDLER_RE)
    if (!m) { E(`${label} handler "${value}" must look like <source name>::<function>, for example syscalls::sys_write`); return }
    if (!sourceNames.has(m[1])) E(`${label} handler "${value}" names the source "${m[1]}", but there is no @arkzen:os:source block with that name`)
  }

  // ── targets ───────────────────────────────────
  const pageSizes: bigint[] = []
  const targetArchs = new Set<string>()
  for (const t of os.targets) {
    const label = `@arkzen:os:target:${t.name}`
    if (!OS_ARCHS.includes(t.name)) E(`${label}: "${t.name}" is not an architecture. Use one of: ${OS_ARCHS.join(', ')}`)
    if (targetArchs.has(t.name)) E(`Duplicate ${label}`)
    targetArchs.add(t.name)
    if (OS_ARCHS.includes(t.name) && archList.length > 0 && !declaredArchs.has(t.name)) E(`${label} is declared but @arkzen:os:project arch does not list ${t.name}`)
    const data = mapOf(label, t.data)
    checkKeys(label, data, ['triple', 'cpu', 'features', 'page_size', 'page_levels', 'machine', 'toolchain', 'abi', 'red_zone', 'soft_float'])
    checkText(`${label} triple`, data.triple)
    checkText(`${label} cpu`, data.cpu)
    checkText(`${label} machine`, data.machine)
    checkText(`${label} abi`, data.abi)
    checkTexts(`${label} features`, data.features)
    checkBool(`${label} red_zone`, data.red_zone)
    checkBool(`${label} soft_float`, data.soft_float)
    if (data.red_zone === true && t.name === 'x86_64') W(`${label} red_zone: true is unsafe in a kernel (an interrupt overwrites the red zone). Kernels normally set red_zone: false.`)
    if (data.page_levels !== undefined && !(isPosInt(data.page_levels) && data.page_levels >= 2 && data.page_levels <= 5)) E(`${label} page_levels must be an integer from 2 to 5`)
    if (data.page_size !== undefined) {
      const ps = checkNumber(`${label} page_size`, data.page_size, { positive: true })
      if (ps !== undefined) {
        if ((ps & (ps - 1n)) !== 0n) E(`${label} page_size must be a power of two (got ${String(data.page_size)})`)
        else pageSizes.push(ps)
      }
    }
    if (data.toolchain !== undefined) {
      if (!isMap(data.toolchain)) E(`${label} toolchain must be a mapping (channel and components for Rust, or compiler and flags for C)`)
      else {
        checkKeys(`${label} toolchain`, data.toolchain, ['channel', 'components', 'compiler', 'flags'])
        checkText(`${label} toolchain.channel`, data.toolchain.channel)
        checkTexts(`${label} toolchain.components`, data.toolchain.components)
        checkText(`${label} toolchain.compiler`, data.toolchain.compiler)
        checkTexts(`${label} toolchain.flags`, data.toolchain.flags)
      }
    }
  }
  const needsTarget = kinds.some(k => OS_MATRIX[k].split(' ')[1] === 'R')
  if (needsTarget) {
    for (const a of archList) if (!targetArchs.has(a)) E(`@arkzen:os:project lists arch ${a} but there is no @arkzen:os:target:${a} block`)
  }
  const pageSize = pageSizes.length > 0 ? pageSizes[0] : 4096n
  if (new Set(pageSizes.map(String)).size > 1) W('@arkzen:os:target blocks declare different page sizes. Alignment checks use the first one.')
  const aligned = (n: bigint): boolean => n % pageSize === 0n

  // ── config ────────────────────────────────────
  const configData = os.config ? mapOf('@arkzen:os:config', os.config.data) : {}
  if (os.config) {
    const label = '@arkzen:os:config'
    checkKeys(label, configData, ['features', 'log_level', 'panic', 'debug_assertions', 'banner', 'constants'])
    checkEnums(`${label} features`, configData.features, OS_FEATURES)
    checkEnum(`${label} log_level`, configData.log_level, OS_LOG_LEVELS)
    checkEnum(`${label} panic`, configData.panic, OS_PANIC_MODES)
    checkBool(`${label} debug_assertions`, configData.debug_assertions)
    checkText(`${label} banner`, configData.banner)
    if (configData.constants !== undefined) {
      if (!isMap(configData.constants)) E(`${label} constants must be a mapping of NAME: value`)
      else {
        for (const [k, v] of Object.entries(configData.constants)) {
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) E(`${label} constants: "${k}" is not a valid identifier`)
          if (!(typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) E(`${label} constants.${k} must be a string, number or true/false`)
        }
      }
    }
  }
  const features: string[] = Array.isArray(configData.features) ? configData.features.filter((f): f is string => typeof f === 'string') : []
  if (features.includes('userland') && !features.includes('syscalls')) W('@arkzen:os:config features lists userland without syscalls. Userland programs cannot call the kernel.')
  if (features.includes('scheduler') && !features.includes('heap')) W('@arkzen:os:config features lists scheduler without heap. Most schedulers need the heap for task structures.')
  if (features.includes('filesystem') && !os.fs) W('@arkzen:os:config features lists filesystem but there is no @arkzen:os:fs block')

  // ── boot ──────────────────────────────────────
  if (os.boot) {
    const label = '@arkzen:os:boot'
    const data = mapOf(label, os.boot.data)
    checkKeys(label, data, ['firmware', 'loader', 'requests', 'higher_half', 'kernel_base', 'stack_size'])
    checkEnum(`${label} firmware`, data.firmware, OS_FIRMWARES)
    checkEnum(`${label} loader`, data.loader, OS_LOADERS)
    if (data.firmware === 'bios' && archList.length > 0 && archList.some(a => !OS_X86_ARCHS.includes(a))) {
      E(`${label} firmware: bios is only available on x86 and x86_64, but the project also builds ${archList.filter(a => !OS_X86_ARCHS.includes(a)).join(', ')}`)
    }
    if (data.loader === 'bootloader_crate' && archList.some(a => a !== 'x86_64')) W(`${label} loader: bootloader_crate targets x86_64 only. Use limine or custom for ${archList.filter(a => a !== 'x86_64').join(', ')}.`)
    if (data.loader === 'limine' && data.firmware === 'direct') E(`${label} loader: limine needs firmware bios or uefi, not direct`)
    if (data.loader === 'grub' && archList.some(a => a === 'arm-cortex-m')) E(`${label} loader: grub does not run on arm-cortex-m`)
    checkBool(`${label} higher_half`, data.higher_half)
    checkNumber(`${label} kernel_base`, data.kernel_base)
    if (data.stack_size !== undefined) {
      const ss = checkNumber(`${label} stack_size`, data.stack_size, { positive: true })
      if (ss !== undefined && !aligned(ss)) E(`${label} stack_size must be a multiple of the page size (${pageSize})`)
    }
    if (data.requests !== undefined) {
      if (!isMap(data.requests)) E(`${label} requests must be a mapping`)
      else {
        const rq = data.requests
        checkKeys(`${label} requests`, rq, ['memory_map', 'framebuffer', 'rsdp', 'modules', 'cmdline'])
        checkBool(`${label} requests.memory_map`, rq.memory_map)
        checkBool(`${label} requests.rsdp`, rq.rsdp)
        checkTexts(`${label} requests.modules`, rq.modules)
        checkText(`${label} requests.cmdline`, rq.cmdline)
        if (rq.framebuffer !== undefined && rq.framebuffer !== true && rq.framebuffer !== false) {
          if (!isMap(rq.framebuffer)) E(`${label} requests.framebuffer must be true, false or a mapping with width, height and bpp`)
          else {
            checkKeys(`${label} requests.framebuffer`, rq.framebuffer, ['width', 'height', 'bpp'])
            checkPosInt(`${label} requests.framebuffer.width`, rq.framebuffer.width)
            checkPosInt(`${label} requests.framebuffer.height`, rq.framebuffer.height)
            if (rq.framebuffer.bpp !== undefined && ![8, 16, 24, 32].includes(rq.framebuffer.bpp as number)) E(`${label} requests.framebuffer.bpp must be 8, 16, 24 or 32`)
          }
        }
        if (rq.rsdp === true && archList.length > 0 && !hasX86 && !archList.includes('aarch64')) W(`${label} requests.rsdp (ACPI) is normally found on x86 and some aarch64 machines`)
      }
    }
  }

  // ── memory ────────────────────────────────────
  const regionList: { name: string; base: bigint; size: bigint; kind: string }[] = []
  if (os.memory) {
    const label = '@arkzen:os:memory'
    const data = mapOf(label, os.memory.data)
    checkKeys(label, data, ['physical', 'paging', 'heap', 'regions', 'guard_pages'])
    checkEnum(`${label} physical`, data.physical, OS_PHYSICAL)
    checkBool(`${label} guard_pages`, data.guard_pages)
    if (data.paging !== undefined) {
      if (!isMap(data.paging)) E(`${label} paging must be a mapping (levels, huge_pages, kernel_mapping)`)
      else {
        checkKeys(`${label} paging`, data.paging, ['levels', 'huge_pages', 'kernel_mapping'])
        if (data.paging.levels !== undefined && !(isPosInt(data.paging.levels) && data.paging.levels >= 2 && data.paging.levels <= 5)) E(`${label} paging.levels must be an integer from 2 to 5`)
        checkBool(`${label} paging.huge_pages`, data.paging.huge_pages)
        checkText(`${label} paging.kernel_mapping`, data.paging.kernel_mapping)
      }
    }
    if (data.regions !== undefined) {
      if (!Array.isArray(data.regions)) E(`${label} regions must be a list`)
      else {
        const names = new Set<string>()
        data.regions.forEach((r: unknown, i: number) => {
          const rl = `${label} regions[${i}]`
          if (!isMap(r)) { E(`${rl} must be a mapping (name, base, size, flags, kind)`); return }
          checkKeys(rl, r, ['name', 'base', 'size', 'flags', 'kind'])
          if (!isText(r.name)) E(`${rl} needs a name:`)
          else { if (names.has(r.name)) E(`${rl}: duplicate region name "${r.name}"`); names.add(r.name) }
          const base = checkNumber(`${rl} base`, r.base)
          const size = checkNumber(`${rl} size`, r.size, { positive: true })
          if (r.base === undefined) E(`${rl} needs a base:`)
          if (r.size === undefined) E(`${rl} needs a size:`)
          checkEnums(`${rl} flags`, r.flags, OS_REGION_FLAGS)
          checkEnum(`${rl} kind`, r.kind, OS_REGION_KINDS)
          if (Array.isArray(r.flags) && r.flags.includes('write') && r.flags.includes('exec')) W(`${rl} is both writable and executable. Split it so code is not writable.`)
          if (base !== undefined && !aligned(base)) E(`${rl} base ${String(r.base)} is not aligned to the page size (${pageSize})`)
          if (size !== undefined && !aligned(size)) E(`${rl} size ${String(r.size)} is not a multiple of the page size (${pageSize})`)
          if (base !== undefined && size !== undefined) regionList.push({ name: isText(r.name) ? r.name : `#${i}`, base, size, kind: typeof r.kind === 'string' ? r.kind : '' })
        })
        for (let i = 0; i < regionList.length; i++) {
          for (let j = i + 1; j < regionList.length; j++) {
            const a = regionList[i], b = regionList[j]
            if (a.base < b.base + b.size && b.base < a.base + a.size) E(`${label}: regions "${a.name}" and "${b.name}" overlap`)
          }
        }
      }
    }
    if (data.heap !== undefined) {
      if (!isMap(data.heap)) E(`${label} heap must be a mapping (allocator, start, initial_size, max_size)`)
      else {
        const h = data.heap
        checkKeys(`${label} heap`, h, ['allocator', 'start', 'initial_size', 'max_size'])
        checkEnum(`${label} heap.allocator`, h.allocator, OS_HEAP_ALLOCS)
        const start = checkNumber(`${label} heap.start`, h.start)
        const initial = checkNumber(`${label} heap.initial_size`, h.initial_size, { positive: true })
        const max = checkNumber(`${label} heap.max_size`, h.max_size, { positive: true })
        if (start !== undefined && !aligned(start)) E(`${label} heap.start is not aligned to the page size (${pageSize})`)
        if (initial !== undefined && max !== undefined && initial > max) E(`${label} heap.initial_size cannot exceed heap.max_size`)
        if (start !== undefined && regionList.length > 0) {
          const inside = regionList.some(r => start >= r.base && start < r.base + r.size)
          if (!inside) E(`${label} heap.start is not inside any region in regions`)
        }
        if (start !== undefined && max !== undefined && regionList.length > 0) {
          const host = regionList.find(r => start >= r.base && start < r.base + r.size)
          if (host && start + max > host.base + host.size) E(`${label} heap (start + max_size) runs past the end of region "${host.name}"`)
        }
      }
    }
    if (data.heap !== undefined && !features.includes('heap') && features.length > 0) W(`${label} declares a heap but @arkzen:os:config features does not list heap`)
  }

  // ── interrupts ────────────────────────────────
  const irqLimits: Record<string, [number, number]> = { pic: [0, 15], apic: [0, 239], gic: [0, 1019], plic: [1, 1023] }
  const controllerArchs: Record<string, string[]> = { pic: OS_X86_ARCHS, apic: OS_X86_ARCHS, gic: ['aarch64'], plic: ['riscv64'] }
  const controller = os.interrupts && isMap(os.interrupts.data) && typeof os.interrupts.data.controller === 'string' ? os.interrupts.data.controller : undefined
  const irqLineOk = (label: string, line: unknown): void => {
    if (typeof line !== 'number' || !Number.isInteger(line) || line < 0) { E(`${label} must be a non-negative integer`); return }
    if (controller && irqLimits[controller]) {
      const [lo, hi] = irqLimits[controller]
      if (line < lo || line > hi) E(`${label} ${line} is outside the range ${lo} to ${hi} that the ${controller} controller supports`)
    }
  }
  if (os.interrupts) {
    const label = '@arkzen:os:interrupts'
    const data = mapOf(label, os.interrupts.data)
    checkKeys(label, data, ['controller', 'exceptions', 'irqs', 'timer'])
    checkEnum(`${label} controller`, data.controller, OS_CONTROLLERS)
    if (controller && controllerArchs[controller] && archList.length > 0 && !archList.some(a => controllerArchs[controller].includes(a))) {
      E(`${label} controller: ${controller} is for ${controllerArchs[controller].join(' or ')}, but the project builds ${archList.join(', ')}`)
    }
    if (data.exceptions !== undefined) {
      if (!Array.isArray(data.exceptions)) E(`${label} exceptions must be a list of names or {name, handler} mappings`)
      else data.exceptions.forEach((x: unknown, i: number) => {
        const xl = `${label} exceptions[${i}]`
        if (isText(x)) return
        if (!isMap(x)) { E(`${xl} must be a name or a {name, handler} mapping`); return }
        checkKeys(xl, x, ['name', 'handler'])
        if (!isText(x.name)) E(`${xl} needs a name:`)
        if (x.handler !== undefined) checkHandler(xl, x.handler)
      })
    }
    if (data.irqs !== undefined) {
      if (!Array.isArray(data.irqs)) E(`${label} irqs must be a list of {name, line, handler} mappings`)
      else {
        const names = new Set<string>()
        const lines = new Map<number, string>()
        data.irqs.forEach((x: unknown, i: number) => {
          const xl = `${label} irqs[${i}]`
          if (!isMap(x)) { E(`${xl} must be a mapping (name, line, handler)`); return }
          checkKeys(xl, x, ['name', 'line', 'handler'])
          if (!isText(x.name)) E(`${xl} needs a name:`)
          else { if (names.has(x.name)) E(`${xl}: duplicate irq name "${x.name}"`); names.add(x.name) }
          if (x.line === undefined) E(`${xl} needs a line:`)
          else {
            irqLineOk(`${xl} line`, x.line)
            if (typeof x.line === 'number') {
              const prev = lines.get(x.line)
              if (prev !== undefined) W(`${xl}: line ${x.line} is also used by "${prev}". Shared lines need handlers that check their device.`)
              lines.set(x.line, isText(x.name) ? x.name : `#${i}`)
            }
          }
          checkHandler(xl, x.handler)
        })
      }
    }
    if (data.timer !== undefined) {
      if (!isMap(data.timer)) E(`${label} timer must be a mapping (source, hz)`)
      else {
        checkKeys(`${label} timer`, data.timer, ['source', 'hz'])
        checkText(`${label} timer.source`, data.timer.source)
        checkPosInt(`${label} timer.hz`, data.timer.hz)
      }
    }
  }

  // ── scheduler ─────────────────────────────────
  if (os.scheduler) {
    const label = '@arkzen:os:scheduler'
    const data = mapOf(label, os.scheduler.data)
    checkKeys(label, data, ['policy', 'tick_hz', 'preemptive', 'max_tasks', 'stack_size', 'idle_task', 'smp'])
    checkEnum(`${label} policy`, data.policy, OS_POLICIES)
    checkPosInt(`${label} tick_hz`, data.tick_hz)
    checkBool(`${label} preemptive`, data.preemptive)
    checkPosInt(`${label} max_tasks`, data.max_tasks)
    checkBool(`${label} idle_task`, data.idle_task)
    checkBool(`${label} smp`, data.smp)
    if (data.policy === 'cooperative' && data.preemptive === true) E(`${label} policy: cooperative cannot be preemptive: true`)
    if (data.preemptive === true && data.tick_hz === undefined) E(`${label} preemptive: true needs tick_hz: (the timer rate that triggers a switch)`)
    if (data.policy === 'none' && (data.preemptive === true || data.tick_hz !== undefined)) W(`${label} policy: none ignores preemptive and tick_hz`)
    if (data.smp === true) W(`${label} smp: true is not promised to be stable. Test it in the emulator with several cores.`)
    if (data.stack_size !== undefined) {
      const ss = checkNumber(`${label} stack_size`, data.stack_size, { positive: true })
      if (ss !== undefined && !aligned(ss)) E(`${label} stack_size must be a multiple of the page size (${pageSize})`)
    }
  }

  // ── syscalls ──────────────────────────────────
  checkNames('syscall', os.syscalls, OS_IDENT_RE, 'lowercase letters, digits and _ and start with a letter')
  const syscallNumbers = new Map<number, string>()
  for (const s of os.syscalls) {
    const label = `@arkzen:os:syscall:${s.name}`
    const data = mapOf(label, s.data)
    checkKeys(label, data, ['number', 'args', 'returns', 'errors', 'privilege', 'handler'])
    if (data.number === undefined) E(`${label} needs a number:`)
    else if (!(typeof data.number === 'number' && Number.isInteger(data.number) && data.number >= 0)) E(`${label} number must be a non-negative integer`)
    else {
      const prev = syscallNumbers.get(data.number)
      if (prev !== undefined) E(`${label} number ${data.number} is already used by syscall "${prev}". Syscall numbers must be unique and are never reused.`)
      syscallNumbers.set(data.number, s.name)
    }
    if (data.args !== undefined) {
      if (!Array.isArray(data.args)) E(`${label} args must be a list of {name, type} mappings`)
      else {
        if (data.args.length > 6) E(`${label} has ${data.args.length} args. The syscall ABI passes at most 6 in registers.`)
        const argNames = new Set<string>()
        data.args.forEach((a: unknown, i: number) => {
          const al = `${label} args[${i}]`
          if (!isMap(a)) { E(`${al} must be a mapping (name, type)`); return }
          checkKeys(al, a, ['name', 'type'])
          if (!isText(a.name) || !OS_FN_RE.test(a.name)) E(`${al} needs a name: that is a valid identifier`)
          else { if (argNames.has(a.name)) E(`${al}: duplicate argument name "${a.name}"`); argNames.add(a.name) }
          if (!isText(a.type)) E(`${al} needs a type: (${OS_SYSCALL_TYPES.join(', ')})`)
          else checkEnum(`${al} type`, a.type, OS_SYSCALL_TYPES)
        })
      }
    }
    checkEnum(`${label} returns`, data.returns, OS_SYSCALL_RETURNS)
    checkTexts(`${label} errors`, data.errors)
    checkText(`${label} privilege`, data.privilege)
    checkHandler(label, data.handler)
  }
  if (os.syscalls.length > 0 && features.length > 0 && !features.includes('syscalls')) W('@arkzen:os:syscall blocks are declared but @arkzen:os:config features does not list syscalls')

  // ── drivers ───────────────────────────────────
  checkNames('driver', os.drivers, OS_NAME_RE, 'lowercase letters, digits, - or _ and start with a letter')
  const mmioRanges: { name: string; base: bigint; end: bigint }[] = []
  const classBus: Record<string, string[]> = {
    pci: ['pci'], virtio: ['virtio', 'pci', 'platform'], usb: ['usb', 'pci'], i2c: ['i2c', 'platform'], spi: ['spi', 'platform'],
  }
  const hostKeys: Record<string, string[]> = { linux: ['module', 'params'], windows: ['inf', 'signing'], macos: ['entitlements'] }
  const allHostKeys = ['module', 'params', 'inf', 'signing', 'entitlements']
  const hostValues = projects.filter(p => p.kind === 'driver').map(p => p.data.host).filter((h): h is string => typeof h === 'string')
  for (const d of os.drivers) {
    const label = `@arkzen:os:driver:${d.name}`
    const data = mapOf(label, d.data)
    checkKeys(label, data, ['class', 'bus', 'ports', 'mmio', 'irq', 'model', 'exposes', 'handler', ...allHostKeys])
    if (!isText(data.class)) E(`${label} needs a class: (${OS_DRIVER_CLASSES.join(', ')})`)
    else checkEnum(`${label} class`, data.class, OS_DRIVER_CLASSES)
    checkEnum(`${label} bus`, data.bus, OS_BUSES)
    if (typeof data.class === 'string' && typeof data.bus === 'string' && classBus[data.class] && !classBus[data.class].includes(data.bus)) {
      E(`${label} class ${data.class} cannot sit on bus ${data.bus}. Use: ${classBus[data.class].join(', ')}`)
    }
    checkEnum(`${label} model`, data.model, OS_DRIVER_MODELS)
    checkText(`${label} exposes`, data.exposes)
    if (data.ports !== undefined) {
      if (!Array.isArray(data.ports) || !data.ports.every((p: unknown) => typeof p === 'number' && Number.isInteger(p) && p >= 0 && p <= 0xffff)) E(`${label} ports must be a list of I/O port numbers from 0 to 0xFFFF`)
      else if (archList.length > 0 && !hasX86) E(`${label} ports: I/O ports exist on x86 only, but the project builds ${archList.join(', ')}. Use mmio.`)
    }
    if (data.mmio !== undefined) {
      if (!isMap(data.mmio)) E(`${label} mmio must be a mapping (base, size)`)
      else {
        checkKeys(`${label} mmio`, data.mmio, ['base', 'size'])
        const base = checkNumber(`${label} mmio.base`, data.mmio.base)
        const size = checkNumber(`${label} mmio.size`, data.mmio.size, { positive: true })
        if (data.mmio.base === undefined) E(`${label} mmio needs a base:`)
        if (data.mmio.size === undefined) E(`${label} mmio needs a size:`)
        if (base !== undefined && size !== undefined) {
          for (const r of mmioRanges) if (base < r.end && r.base < base + size) E(`${label} mmio range overlaps the one of driver "${r.name}"`)
          mmioRanges.push({ name: d.name, base, end: base + size })
        }
      }
    }
    if (data.irq !== undefined) irqLineOk(`${label} irq`, data.irq)
    if (data.irq !== undefined && data.model === 'polling') W(`${label} has irq: but model: polling never uses it`)
    if (data.handler !== undefined) checkHandler(label, data.handler)
    // Host drivers: build inputs only, valid for the host they target.
    const hostKeysUsed = allHostKeys.filter(k => data[k] !== undefined)
    if (hostKeysUsed.length > 0) {
      if (hostValues.length === 0) E(`${label} uses ${hostKeysUsed.join(', ')}, which are for a host driver. Set kind: driver and host: in @arkzen:os:project.`)
      else {
        for (const k of hostKeysUsed) {
          if (!hostValues.some(h => hostKeys[h]?.includes(k))) E(`${label} ${k}: is not valid for host ${hostValues.join(', ')}`)
        }
      }
    }
    checkText(`${label} module`, data.module)
    if (isText(data.module) && !/^[a-z_][a-z0-9_]*$/.test(data.module)) E(`${label} module must be a valid Linux module name (lowercase letters, digits and _)`)
    if (data.params !== undefined && !(isTexts(data.params) || isMap(data.params))) E(`${label} params must be a list of names or a mapping of name: type`)
    checkText(`${label} inf`, data.inf)
    checkText(`${label} signing`, data.signing)
    checkTexts(`${label} entitlements`, data.entitlements)
  }
  if (hostValues.length > 0) {
    for (const h of hostValues) {
      if (h === 'windows') W('@arkzen:os:project host: windows is build-only. A Windows driver needs the Windows Driver Kit on Windows and must be signed by you.')
      if (h === 'macos') W('@arkzen:os:project host: macos is build-only. A DriverKit extension needs Xcode on macOS and your entitlements.')
      if (h === 'linux') W('@arkzen:os:project host: linux is build-only. A kernel module runs in ring 0, so load it only in a virtual machine.')
    }
  }

  // ── fs ────────────────────────────────────────
  if (os.fs) {
    const label = '@arkzen:os:fs'
    const data = mapOf(label, os.fs.data)
    checkKeys(label, data, ['type', 'root', 'mounts', 'vfs'])
    if (!isText(data.type)) E(`${label} needs a type: (${OS_FS_TYPES.join(', ')})`)
    else checkEnum(`${label} type`, data.type, OS_FS_TYPES)
    checkBool(`${label} vfs`, data.vfs)
    if (data.root !== undefined) {
      if (!isText(data.root) || data.root.includes('..') || /^(?:[A-Za-z]:)?[\\/]/.test(data.root)) E(`${label} root must be a relative path inside assets/ (no .. and no absolute path)`)
    }
    if (data.mounts !== undefined) {
      if (!Array.isArray(data.mounts)) E(`${label} mounts must be a list of {path, device, type} mappings`)
      else {
        const paths = new Set<string>()
        data.mounts.forEach((m: unknown, i: number) => {
          const ml = `${label} mounts[${i}]`
          if (!isMap(m)) { E(`${ml} must be a mapping (path, device, type)`); return }
          checkKeys(ml, m, ['path', 'device', 'type'])
          if (!isText(m.path) || !m.path.startsWith('/')) E(`${ml} needs a path: that starts with /`)
          else { if (paths.has(m.path)) E(`${ml}: duplicate mount path "${m.path}"`); paths.add(m.path) }
          checkText(`${ml} device`, m.device)
          checkEnum(`${ml} type`, m.type, OS_FS_TYPES)
        })
      }
    }
    if (data.vfs === true && data.type === 'custom' && !data.mounts) W(`${label} vfs: true with type: custom and no mounts has nothing to mount`)
  }

  // ── userland ──────────────────────────────────
  checkNames('userland', os.userland, OS_NAME_RE, 'lowercase letters, digits, - or _ and start with a letter')
  const orders = new Map<number, string>()
  for (const u of os.userland) {
    const label = `@arkzen:os:userland:${u.name}`
    const data = mapOf(label, u.data)
    checkKeys(label, data, ['language', 'entry', 'args', 'autostart', 'order', 'libc', 'stack_size', 'heap_size'])
    if (!isText(data.language)) E(`${label} needs a language: (${OS_USER_LANGS.join(', ')})`)
    else checkEnum(`${label} language`, data.language, OS_USER_LANGS)
    checkText(`${label} entry`, data.entry)
    checkTexts(`${label} args`, data.args)
    checkBool(`${label} autostart`, data.autostart)
    checkEnum(`${label} libc`, data.libc, OS_LIBCS)
    if (data.order !== undefined) {
      if (!(typeof data.order === 'number' && Number.isInteger(data.order) && data.order >= 0)) E(`${label} order must be a non-negative integer`)
      else {
        const prev = orders.get(data.order)
        if (prev !== undefined) W(`${label} order ${data.order} is also used by "${prev}". Start order between them is not defined.`)
        orders.set(data.order, u.name)
      }
    }
    for (const key of ['stack_size', 'heap_size']) {
      if (data[key] === undefined) continue
      const n = checkNumber(`${label} ${key}`, data[key], { positive: true })
      if (n !== undefined && !aligned(n)) E(`${label} ${key} must be a multiple of the page size (${pageSize})`)
    }
    if (data.libc === 'external' && data.language === 'rs') W(`${label} libc: external with language rs needs a libc build you provide in assets`)
    if (!os.sources.some(s => s.header.part === 'user' && s.name === u.name.replace(/-/g, '_'))) {
      W(`${label} has no @arkzen:os:source block with part: user and the name "${u.name.replace(/-/g, '_')}", so it has no code`)
    }
  }
  if (os.syscalls.length === 0 && os.userland.length > 0) W('@arkzen:os:userland programs are declared but there are no @arkzen:os:syscall blocks, so they cannot call the kernel')

  // ── shell ─────────────────────────────────────
  if (os.shell) {
    const label = '@arkzen:os:shell'
    const data = mapOf(label, os.shell.data)
    checkKeys(label, data, ['prompt', 'builtins', 'history', 'line_edit'])
    checkText(`${label} prompt`, data.prompt)
    checkBool(`${label} history`, data.history)
    checkBool(`${label} line_edit`, data.line_edit)
    if (data.builtins !== undefined) {
      if (!isTexts(data.builtins)) E(`${label} builtins must be a list of names`)
      else {
        const seen = new Set<string>()
        for (const b of data.builtins) {
          if (!OS_NAME_RE.test(b)) E(`${label} builtins: "${b}" must be lowercase letters, digits, - or _ and start with a letter`)
          if (seen.has(b)) E(`${label} builtins: duplicate "${b}"`)
          seen.add(b)
        }
      }
    }
    if (kinds.length > 0 && kinds.every(k => OS_MATRIX[k].split(' ')[9] === 'X')) W(`${label} is declared but ${kinds.length === 1 ? `kind: ${kinds[0]}` : 'these kinds'} has no userland to run it in`)
  }

  // ── image ─────────────────────────────────────
  const imageData = os.image ? mapOf('@arkzen:os:image', os.image.data) : {}
  if (os.image) {
    const label = '@arkzen:os:image'
    checkKeys(label, imageData, ['formats', 'partitions', 'size', 'bootloader_install', 'checksums'])
    if (!Array.isArray(imageData.formats) || imageData.formats.length === 0) E(`${label} needs formats: (a list of ${OS_IMAGE_FORMATS.join(', ')})`)
    else checkEnums(`${label} formats`, imageData.formats, OS_IMAGE_FORMATS)
    checkBool(`${label} bootloader_install`, imageData.bootloader_install)
    checkEnum(`${label} checksums`, imageData.checksums, OS_CHECKSUMS)
    const formats: string[] = Array.isArray(imageData.formats) ? imageData.formats.filter((f): f is string => typeof f === 'string') : []
    if (formats.includes('uf2') && !kinds.includes('firmware')) E(`${label} formats: uf2 is for kind: firmware`)
    if (formats.includes('uf2') && archList.length > 0 && !archList.includes('arm-cortex-m')) E(`${label} formats: uf2 needs arch arm-cortex-m`)
    if ((formats.includes('efi_app') || formats.includes('uefi_disk')) && os.boot && isMap(os.boot.data) && os.boot.data.firmware !== undefined && os.boot.data.firmware !== 'uefi') {
      E(`${label} formats: efi_app and uefi_disk need @arkzen:os:boot firmware: uefi (it is ${String(os.boot.data.firmware)})`)
    }
    if ((formats.includes('iso') || formats.includes('raw') || formats.includes('uefi_disk') || formats.includes('efi_app')) && archList.length > 0 && archList.every(a => a === 'arm-cortex-m')) W(`${label} formats: ${formats.join(', ')} are not normal outputs for arm-cortex-m. Use bin, elf or uf2.`)
    const total = checkNumber(`${label} size`, imageData.size, { positive: true })
    if (imageData.partitions !== undefined) {
      if (!Array.isArray(imageData.partitions)) E(`${label} partitions must be a list of {name, size, fs, contents} mappings`)
      else {
        const names = new Set<string>()
        let sum = 0n
        let allSized = true
        const assets = listAssets()
        const tokens = new Set(['kernel', 'bootloader', 'initramfs', 'userland', ...os.userland.map(u => u.name)])
        imageData.partitions.forEach((p: unknown, i: number) => {
          const pl = `${label} partitions[${i}]`
          if (!isMap(p)) { E(`${pl} must be a mapping (name, size, fs, contents)`); return }
          checkKeys(pl, p, ['name', 'size', 'fs', 'contents'])
          if (!isText(p.name)) E(`${pl} needs a name:`)
          else { if (names.has(p.name)) E(`${pl}: duplicate partition name "${p.name}"`); names.add(p.name) }
          const sz = checkNumber(`${pl} size`, p.size, { positive: true })
          if (p.size === undefined) { E(`${pl} needs a size:`); allSized = false }
          else if (sz !== undefined) sum += sz
          else allSized = false
          checkEnum(`${pl} fs`, p.fs, OS_FS_TYPES)
          if (p.contents !== undefined) {
            if (!isTexts(p.contents)) E(`${pl} contents must be a list of names or asset paths`)
            else for (const c of p.contents) {
              if (tokens.has(c)) continue
              if (/^(?:[A-Za-z]:)?[\\/]/.test(c) || c.includes('..')) { E(`${pl} contents "${c}" must be a relative path inside assets/`); continue }
              const rel = cleanAsset(c)
              if (!assets.includes(rel) && !assets.some(a => a.startsWith(rel.replace(/\/$/, '') + '/'))) {
                W(`${pl} contents "${c}" is not kernel, bootloader, initramfs, a userland program, or a file under assets/`)
              }
            }
          }
        })
        if (total !== undefined && allSized && sum > total) E(`${label} partitions add up to more than size (${String(imageData.size)})`)
      }
    }
  }

  // ── run ───────────────────────────────────────
  if (os.run) {
    const label = '@arkzen:os:run'
    const data = mapOf(label, os.run.data)
    checkKeys(label, data, ['emulator', 'machine', 'cpu', 'ram', 'cores', 'devices', 'display', 'serial', 'accel', 'debug', 'extra_args'])
    checkEnum(`${label} emulator`, data.emulator, OS_EMULATORS)
    if (data.emulator === undefined) E(`${label} needs emulator: (${OS_EMULATORS.join(', ')})`)
    checkText(`${label} machine`, data.machine)
    checkText(`${label} cpu`, data.cpu)
    checkNumber(`${label} ram`, data.ram, { positive: true })
    checkPosInt(`${label} cores`, data.cores)
    checkEnum(`${label} display`, data.display, OS_DISPLAYS)
    checkEnum(`${label} serial`, data.serial, OS_SERIALS)
    checkEnum(`${label} accel`, data.accel, OS_ACCELS)
    checkTexts(`${label} extra_args`, data.extra_args)
    if (data.devices !== undefined) {
      if (!isTexts(data.devices)) E(`${label} devices must be a list of device names`)
      else for (const dev of data.devices) {
        if (!/^[a-z0-9][a-z0-9_.-]*$/i.test(dev)) E(`${label} devices: "${dev}" is not a device name (letters, digits, - _ . only; put options in extra_args)`)
        else if (!OS_QEMU_DEVICES.includes(dev)) W(`${label} devices: "${dev}" is not a device the engine knows. Check it with qemu -device help.`)
      }
    }
    if (data.debug !== undefined) {
      if (!isMap(data.debug)) E(`${label} debug must be a mapping (gdb, port)`)
      else {
        checkKeys(`${label} debug`, data.debug, ['gdb', 'port'])
        checkBool(`${label} debug.gdb`, data.debug.gdb)
        if (data.debug.port !== undefined && !(isPosInt(data.debug.port) && data.debug.port <= 65535)) E(`${label} debug.port must be a port from 1 to 65535`)
      }
    }
    if (data.accel === 'kvm' && archList.length > 0 && !hasX86) W(`${label} accel: kvm only helps when the guest architecture matches the host`)
    if (data.serial === 'none' && os.tests.some(t => isMap(t.data) && (t.data.kind === 'boot' || t.data.kind === undefined))) E(`${label} serial: none leaves a boot test nothing to read. Use stdio or file.`)
    if (data.display !== undefined && data.display !== 'none' && os.tests.length > 0) W(`${label} display: ${String(data.display)} opens a window. Boot tests run headless and ignore it.`)
    if (data.cores !== undefined && typeof data.cores === 'number' && data.cores > 1 && !(os.scheduler && isMap(os.scheduler.data) && os.scheduler.data.smp === true)) W(`${label} cores: ${data.cores} but @arkzen:os:scheduler does not set smp: true, so extra cores will idle`)
  }

  // ── tests ─────────────────────────────────────
  checkNames('test', os.tests, OS_NAME_RE, 'lowercase letters, digits, - or _ and start with a letter')
  for (const t of os.tests) {
    const label = `@arkzen:os:test:${t.name}`
    const data = mapOf(label, t.data)
    checkKeys(label, data, ['kind', 'timeout', 'expect', 'forbid', 'input', 'exit'])
    if (!isText(data.kind)) E(`${label} needs a kind: (${OS_TEST_KINDS.join(', ')})`)
    else checkEnum(`${label} kind`, data.kind, OS_TEST_KINDS)
    if (data.kind === 'boot') {
      if (!os.run) E(`${label} is a boot test but there is no @arkzen:os:run block to boot with`)
      if (data.timeout === undefined) E(`${label} needs timeout: (seconds)`)
      else if (!isPosInt(data.timeout)) E(`${label} timeout must be a positive whole number of seconds`)
      else if (data.timeout > 600) W(`${label} timeout of ${data.timeout}s is long. A kernel that boots at all does so in seconds.`)
      if (!Array.isArray(data.expect) || data.expect.length === 0) E(`${label} needs expect: (a list of regular expressions the serial output must match)`)
      else data.expect.forEach((x: unknown, i: number) => checkRegex(`${label} expect[${i}]`, x))
      if (data.forbid !== undefined) {
        if (!Array.isArray(data.forbid)) E(`${label} forbid must be a list of regular expressions`)
        else data.forbid.forEach((x: unknown, i: number) => checkRegex(`${label} forbid[${i}]`, x))
      }
      checkTexts(`${label} input`, data.input)
      checkText(`${label} exit`, data.exit)
    } else if (data.kind === 'unit') {
      for (const key of ['timeout', 'expect', 'forbid', 'input', 'exit']) {
        if (data[key] !== undefined) W(`${label} kind: unit ignores ${key}:. Unit tests run on the host.`)
      }
    }
  }
  if (os.tests.length > 0 && !os.tests.some(t => isMap(t.data) && t.data.kind === 'boot') && kinds.some(k => ['kernel', 'os', 'bootloader', 'bootapp', 'unikernel'].includes(k))) {
    W('There is no boot test (@arkzen:os:test with kind: boot). A kernel is only verified by booting it.')
  }

  // ── assets ────────────────────────────────────
  if (os.assets) {
    const label = '@arkzen:os:assets'
    const data = mapOf(label, os.assets.data)
    checkKeys(label, data, ['include', 'dest', 'embed', 'fonts'])
    checkBool(`${label} embed`, data.embed)
    checkText(`${label} dest`, data.dest)
    if (isText(data.dest) && (data.dest.includes('..') || /^(?:[A-Za-z]:)?[\\/]/.test(data.dest))) E(`${label} dest must be a relative path (no .. and no absolute path)`)
    const assets = listAssets()
    for (const key of ['include', 'fonts']) {
      const list = data[key]
      if (list === undefined) continue
      if (!isTexts(list)) { E(`${label} ${key} must be a list of paths or globs under assets/`); continue }
      for (const g of list) {
        if (g.includes('..') || /^(?:[A-Za-z]:)?[\\/]/.test(g)) { E(`${label} ${key}: "${g}" must be a relative path inside assets/`); continue }
        const re = globToRe(cleanAsset(g))
        if (!assets.some(a => re.test(a))) W(`${label} ${key}: "${g}" matches no file under assets/`)
      }
    }
  }

  // ── distro ────────────────────────────────────
  if (os.distro) {
    const label = '@arkzen:os:distro'
    const data = mapOf(label, os.distro.data)
    checkKeys(label, data, ['builder', 'base', 'packages', 'kernel_fragments', 'init', 'users', 'services', 'overlay', 'hostname', 'locale'])
    if (!isText(data.builder)) E(`${label} needs a builder: (${OS_BUILDERS.join(', ')})`)
    else if (!OS_BUILDERS.includes(data.builder)) W(`${label} builder "${data.builder}" is not one the engine writes configuration for (${OS_BUILDERS.join(', ')})`)
    checkText(`${label} base`, data.base)
    checkTexts(`${label} packages`, data.packages)
    checkTexts(`${label} kernel_fragments`, data.kernel_fragments)
    checkTexts(`${label} services`, data.services)
    checkEnum(`${label} init`, data.init, OS_INITS)
    checkText(`${label} locale`, data.locale)
    if (data.hostname !== undefined && !(isText(data.hostname) && OS_HOSTNAME_RE.test(data.hostname))) E(`${label} hostname must be a valid host name (letters, digits and -)`)
    if (Array.isArray(data.packages) && new Set(data.packages).size !== data.packages.length) W(`${label} packages lists a package twice`)
    if (data.users !== undefined) {
      if (!Array.isArray(data.users)) E(`${label} users must be a list of {name: ...} entries`)
      else data.users.forEach((u: unknown, i: number) => {
        const ul = `${label} users[${i}]`
        const name = isText(u) ? u : isMap(u) ? u.name : undefined
        if (isMap(u)) {
          for (const k of Object.keys(u)) if (k !== 'name') E(`${ul}: only name: is allowed. Accounts are declared by name and never carry passwords or keys.`)
        }
        if (!isText(name) || !/^[a-z_][a-z0-9_-]{0,31}$/.test(name)) E(`${ul} needs a valid account name (lowercase letters, digits, - and _)`)
      })
    }
    if (data.overlay !== undefined) {
      if (!isTexts(data.overlay)) E(`${label} overlay must be a list of files under assets/`)
      else {
        const assets = listAssets()
        for (const o of data.overlay) {
          if (o.includes('..') || /^(?:[A-Za-z]:)?[\\/]/.test(o)) { E(`${label} overlay: "${o}" must be a relative path inside assets/`); continue }
          const rel = cleanAsset(o)
          if (!assets.includes(rel) && !assets.some(a => a.startsWith(rel.replace(/\/$/, '') + '/'))) W(`${label} overlay: "${o}" is not a file under assets/`)
        }
      }
    }
    W(`${label} only the ${isText(data.builder) ? data.builder : 'builder'} configuration is generated and checked. The full build needs the builder on a Linux host and can take hours, so it verifies as UNVERIFIED.`)
  }

  // ── board ─────────────────────────────────────
  if (os.board) {
    const label = '@arkzen:os:board'
    const data = mapOf(label, os.board.data)
    checkKeys(label, data, ['name', 'chip', 'clock', 'flash', 'ram', 'runtime', 'peripherals', 'flash_tool'])
    if (!isText(data.name)) E(`${label} needs a name:`)
    if (!isText(data.chip)) E(`${label} needs a chip:`)
    for (const key of ['clock', 'flash', 'ram']) {
      const v = data[key]
      if (v === undefined) continue
      if (typeof v === 'string' && /^\d+(?:\.\d+)?\s*[kKmMgG]?[hH]z$/.test(v.trim())) continue
      checkNumber(`${label} ${key}`, v, { positive: true })
    }
    checkEnum(`${label} runtime`, data.runtime, OS_BOARD_RUNTIMES)
    checkEnum(`${label} flash_tool`, data.flash_tool, OS_FLASH_TOOLS)
    if (data.peripherals !== undefined) {
      if (!Array.isArray(data.peripherals)) E(`${label} peripherals must be a list (gpio, uart, i2c, spi, adc entries)`)
      else data.peripherals.forEach((p: unknown, i: number) => {
        const pl = `${label} peripherals[${i}]`
        if (!isMap(p) || Object.keys(p).length === 0) { E(`${pl} must be a mapping such as gpio: {pins: [25]}`); return }
        for (const k of Object.keys(p)) if (!['gpio', 'uart', 'i2c', 'spi', 'adc'].includes(k)) W(`${pl}: unknown peripheral "${k}" (known: gpio, uart, i2c, spi, adc)`)
        const gpio = p.gpio
        if (isMap(gpio) && gpio.pins !== undefined && !(Array.isArray(gpio.pins) && gpio.pins.every((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0))) E(`${pl} gpio.pins must be a list of pin numbers`)
      })
    }
    if (data.flash_tool !== undefined) W(`${label} flash_tool: Pluffy prints flashing instructions and never runs the flash tool.`)
    if (archList.length > 0 && !archList.includes('arm-cortex-m') && !archList.includes('riscv64')) W(`${label} is for a microcontroller, but the project arch is ${archList.join(', ')}`)
  }

  // ── sources ───────────────────────────────────
  {
    const seen = new Set<string>()
    const entries: Record<string, string[]> = {}
    for (const s of os.sources) {
      const label = `@arkzen:os:source:${s.lang}:${s.name}`
      const key = `${s.lang}:${s.name}`
      if (!OS_IDENT_RE.test(s.name)) E(`${label}: the name must be lowercase letters, digits and _ and start with a letter, so a handler can refer to it as ${s.name.replace(/[^a-z0-9_]/gi, '_')}::function`)
      if (seen.has(key)) E(`Duplicate ${label}`)
      seen.add(key)
      checkKeys(label, s.header, ['part', 'arch', 'path', 'entry'])
      checkEnum(`${label} part`, s.header.part, OS_SOURCE_PARTS)
      if (s.header.part === undefined) E(`${label} needs part: (${OS_SOURCE_PARTS.join(', ')})`)
      checkEnum(`${label} arch`, s.header.arch, OS_ARCHS)
      if (s.lang === 'asm' && s.header.arch === undefined) E(`${label} needs arch: (assembly is always architecture specific)`)
      if (typeof s.header.arch === 'string' && archList.length > 0 && !declaredArchs.has(s.header.arch)) E(`${label} arch ${s.header.arch} is not listed in @arkzen:os:project arch`)
      checkBool(`${label} entry`, s.header.entry)
      if (s.header.path !== undefined) {
        if (!isText(s.header.path) || s.header.path.includes('..') || /^(?:[A-Za-z]:)?[\\/]/.test(s.header.path)) E(`${label} path must be a relative path inside the project (no .. and no absolute path)`)
      }
      if (s.header.entry === true) (entries[`${String(s.header.part)}:${String(s.header.arch ?? '*')}`] ??= []).push(s.name)
      if (s.lang === 'go' && !kinds.every(k => k === 'firmware')) E(`${label}: go source is only valid for kind: firmware (TinyGo)`)
      if (!s.raw.trim()) E(`${label} has an empty body`)
      const pl = OS_PLUFFY_IMPORT[s.lang]
      if (pl && pl.test(s.raw)) E(`${label} refers to Pluffy or Arkzen. An exported OS project must build with its own toolchain and no Pluffy files.`)
    }
    for (const [key, names] of Object.entries(entries)) {
      if (names.length > 1) E(`More than one source has entry: true for part:arch "${key}" (${names.join(', ')}). A kernel has one entry point.`)
    }
    if (kinds.some(k => OS_NEEDS_ENTRY.includes(k)) && !Object.keys(entries).some(k => k.startsWith('kernel:') || k.startsWith('boot:') || k.startsWith('user:'))) {
      E('No @arkzen:os:source has entry: true with part: kernel or part: boot. The generator needs to know where the program starts.')
    }
  }

  // ── toolchains ────────────────────────────────
  {
    const need = new Map<string, string>()
    const langs = new Set<string>(os.sources.map(s => s.lang))
    for (const p of projects) if (typeof p.data.language === 'string') langs.add(p.data.language)
    if (kinds.some(k => k !== 'distro')) {
      if (langs.has('rs')) { need.set('rustc', 'Rust sources'); need.set('cargo', 'Rust sources') }
      if (langs.has('c') || langs.has('cpp')) { need.set('gcc', 'C sources'); need.set('ld', 'C sources') }
      if (langs.has('asm') && (hasX86 || os.sources.some(s => s.lang === 'asm' && OS_X86_ARCHS.includes(String(s.header.arch))))) need.set('nasm', 'x86 assembly')
      if (langs.has('go')) need.set('tinygo', 'Go firmware')
    }
    const missingBuild: string[] = []
    for (const [tool, why] of need) if (!osToolInstalled(tool)) missingBuild.push(`${OS_TOOLS[tool].label} (${why})`)
    if (missingBuild.length > 0) W(`Not installed here: ${missingBuild.join(', ')}. The project can be generated but not built, and it will verify as UNVERIFIED.`)
    if (os.run || os.tests.length > 0) {
      const missingEmu: string[] = []
      for (const a of archList) {
        const q = OS_QEMU_FOR_ARCH[a]
        if (q && !osToolInstalled(q)) missingEmu.push(OS_TOOLS[q].label)
      }
      if (missingEmu.length > 0) W(`Not installed here: ${missingEmu.join(', ')}. The image can be built but not booted, so boot tests will be UNVERIFIED.`)
    }
    if (hostDriverOnly && hostValues.includes('linux') && !osToolInstalled('gcc')) W('A Linux kernel module needs gcc, make and the kernel headers. Check them before building.')
  }

  return { errors, warnings }
}

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

  // v18.0: package blocks (opt-in)
  if (parsed.pkg) {
    const pkgResult = validatePkg(parsed, filePath)
    errors.push(...pkgResult.errors)
    warnings.push(...pkgResult.warnings)
  }

  // v19.0: terminal blocks (opt-in)
  if (parsed.term) {
    const termResult = validateTerm(parsed, filePath)
    errors.push(...termResult.errors)
    warnings.push(...termResult.warnings)
  }

  // v20.0: operating system blocks (opt-in)
  if (parsed.os) {
    const osResult = validateOs(parsed, filePath)
    errors.push(...osResult.errors)
    warnings.push(...osResult.warnings)
  }

  const hasFreeFiles = hasFileBlocks(fs.readFileSync(filePath, 'utf-8'))

  // v14.1: @arkzen:file blocks are valid without any page
  // v17.0: @arkzen:ext blocks are valid without any page (validateExt checks the ext contracts)
  if (!hasFreeFiles && !parsed.ext && !parsed.pkg && !parsed.term && !parsed.os && parsed.pages.length === 0 && parsed.nativePages.length === 0 && parsed.nativeLynxPages.length === 0) {
    errors.push('At least one @arkzen:web:page:name, @arkzen:native:page:name, or @arkzen:native:page:lynx:name section is required')
  }

  if (hasFreeFiles) {
    try { errors.push(...validateFileBlocks(filePath, parsed.meta.name)) }
    catch (e) { errors.push(e instanceof Error ? e.message : String(e)) }
  }

  const extOnly = (!!parsed.ext || !!parsed.pkg || !!parsed.term) && parsed.pages.length === 0 && parsed.nativePages.length === 0 && parsed.nativeLynxPages.length === 0
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
