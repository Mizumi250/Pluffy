#!/usr/bin/env node
/**
 * tatemono-index.js - keeps the "online tatemono index" in the guidelines in sync.
 *
 * Run from the project root:   node tatemono-index.js
 *                              node mizumi.js index
 *
 * Reads every tatemonos/<name>/core.tsx (title + description from its @arkzen:meta
 * block, block families, stacks, size) and rewrites the section of the guidelines
 * file that sits between these two markers:
 *
 *     <!-- TATEMONO-INDEX:START -->
 *     <!-- TATEMONO-INDEX:END -->
 *
 * First run on a guidelines file without markers: the old "SECTION 31" is replaced,
 * or the section is inserted above the closing "_End of ..." line.
 *
 * Flags:
 *   --check    change nothing; exit 1 if the guidelines are out of date (for hooks / CI)
 *   --dry      print the generated section instead of writing it
 *   --file X   guidelines file to update (default: newest PLUFF_GUIDELINES_v*.md)
 *
 * The output has no timestamps, so running it twice changes nothing.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const TATEMONO_DIR = path.join(ROOT, 'tatemonos')

// The repo is fixed, so the raw URL base is a constant.
const RAW_BASE = 'https://raw.githubusercontent.com/Mizumi250/Pluffy/main/tatemonos'
const CHARS_PER_TOKEN = 3.2 // close to the ratio descriptions.json uses
const MAX_DESC = 150

const START = '<!-- TATEMONO-INDEX:START -->'
const END = '<!-- TATEMONO-INDEX:END -->'
const HEADING = 'SECTION 31 — ONLINE TATEMONO INDEX (FETCH REAL EXAMPLES)'

const args = process.argv.slice(2)
const CHECK = args.includes('--check')
const DRY = args.includes('--dry')
const fileFlag = args.indexOf('--file')

// ---------------------------------------------------------------- parsing

function parseMeta(src) {
  const m = src.match(/\/\*\s*@arkzen:meta\s*\n([\s\S]*?)\*\//)
  const meta = {}
  if (!m) return meta
  const lines = m[1].split('\n')
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([A-Za-z_]+):\s*(.*)$/)
    if (!kv) continue
    let value = kv[2].trim()
    if (value === '>' || value === '|') {
      const parts = []
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) parts.push(lines[++i].trim())
      value = parts.join(' ')
    }
    meta[kv[1]] = value.replace(/^["']|["']$/g, '')
  }
  return meta
}

function clip(text, max) {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return t.slice(0, max - 3).replace(/\s+\S*$/, '') + '...'
}

function sizeTag(kb) {
  if (kb < 30) return 'S'
  if (kb < 100) return 'M'
  if (kb < 200) return 'L'
  return 'XL (never fetch in full)'
}

const SKIP_FAMILIES = new Set(['meta', 'web', 'native', 'import'])
const FAMILY_ALIAS = { listeners: 'listener' }

function scanTatemono(name) {
  const file = path.join(TATEMONO_DIR, name, 'core.tsx')
  if (!fs.existsSync(file)) return null
  const src = fs.readFileSync(file, 'utf8')
  const meta = parseMeta(src)

  const families = new Set()
  let web = false, native = false, lynx = false
  for (const [, full] of src.matchAll(/@arkzen:([a-z_:]+)/g)) {
    const first = full.split(':')[0]
    if (first === 'web') web = true
    if (first === 'native' || first === 'import') {
      if (full.includes('lynx')) lynx = true
      else if (first === 'native') native = true
    }
    if (!SKIP_FAMILIES.has(first)) families.add(FAMILY_ALIAS[first] || first)
  }

  const bytes = fs.statSync(file).size
  return {
    name,
    title: meta.name || name,
    version: meta.version || '',
    description: clip(meta.description || '(no description in meta)', MAX_DESC),
    families: [...families].sort(),
    stacks: [web && 'web', native && 'native', lynx && 'lynx'].filter(Boolean),
    kb: Math.round(bytes / 1024),
    tokensK: Math.round(bytes / CHARS_PER_TOKEN / 1000),
    hasAssets: fs.existsSync(path.join(TATEMONO_DIR, name, 'assets')),
  }
}

// ------------------------------------------------------------- generation

const FEATURE_LABELS = {
  database: 'Database models + migrations',
  api: 'CRUD API + validation',
  endpoint: 'Custom endpoints',
  handler: 'Custom route handlers',
  routes: 'Custom routes',
  policy: 'Policies / authorization',
  middleware: 'Middleware',
  realtime: 'Realtime / broadcast',
  events: 'Events',
  listener: 'Listeners',
  jobs: 'Jobs / queues',
  notifications: 'Notifications',
  mail: 'Mail',
  console: 'Console commands / scheduler',
  script: 'Scripts',
  style: 'Styles',
  components: 'Components',
  desktop: 'Desktop window config',
  module: 'Modules',
  file: 'Free files (@arkzen:file)',
  godot: 'Godot game',
  unity: 'Unity game',
}

function featureTable(items) {
  // for each feature: the 3 smallest tatemonos that use it, so the cheapest examples come first
  const rows = []
  const add = (label, matches) => {
    if (!matches.length) return
    const best = [...matches].sort((a, b) => a.kb - b.kb).slice(0, 3)
    rows.push(`  | ${label} | ${best.map(t => `\`${t.name}\``).join(', ')} |`)
  }
  add('Web pages', items.filter(t => t.stacks.includes('web')))
  add('Native screens (Expo / RN)', items.filter(t => t.stacks.includes('native')))
  add('Lynx pages', items.filter(t => t.stacks.includes('lynx')))
  for (const fam of Object.keys(FEATURE_LABELS)) {
    add(FEATURE_LABELS[fam], items.filter(t => t.families.includes(fam)))
  }
  return rows
}

function buildSection(items) {
  const out = []
  out.push(START)
  out.push(`  ## ${HEADING}`)
  out.push('')
  out.push('  _This section is generated by `node mizumi.js index` (`tatemono-index.js`). Do not edit it by hand; run the script and it updates itself from each tatemono\'s `@arkzen:meta` block._')
  out.push('')
  out.push('  **For AIs that can fetch URLs.** Every tatemono in this repo is public as a plain text file. Do not guess syntax from memory when a real working example exists: pick the 1–3 entries below that match the feature you are generating, fetch only those raw URLs, and copy their patterns.')
  out.push('')
  out.push(`  - URL pattern: \`${RAW_BASE}/<name>/core.tsx\``)
  out.push('  - Size = approximate tokens when fetched. Budget: fetch at most ~40k tokens of examples in total. Prefer S/M entries and never fetch an XL entry in full.')
  out.push('  - Source of truth order still applies: engine parser > real tatemonos > this document. If a fetched example disagrees with Sections 1–30, the parser wins.')
  out.push('  - Examples that carry `auth_seed` blocks use demo accounts only. Never copy seeded emails or passwords into a client tatemono.')
  out.push('  - If you cannot fetch URLs, ignore this section and use Section 28 (inline excerpts).')
  out.push('')
  out.push(`  Pick by feature (the ${3} smallest tatemonos that use it, cheapest first):`)
  out.push('')
  out.push('  | Need | Fetch |')
  out.push('  |---|---|')
  out.push(...featureTable(items))
  out.push('')
  out.push(`  Full index of ${items.length} tatemonos (title · description · block families · stacks · size · raw URL):`)
  out.push('')
  for (const t of items) {
    out.push(`  - **${t.title}** — ${t.description}`)
    out.push(`    families: ${t.families.join(', ') || 'UI only (no backend blocks)'} · stacks: ${t.stacks.join(', ') || '-'} · ${sizeTag(t.kb)} (~${t.tokensK}k tokens, ${t.kb} KB)${t.hasAssets ? ' · has assets/' : ''}`)
    out.push(`    ${RAW_BASE}/${t.name}/core.tsx`)
  }
  out.push('')
  out.push('  A tatemono with an `assets/` folder also has binary files (images, audio); fetch only `core.tsx`.')
  out.push(END)
  return out.join('\n')
}

// ---------------------------------------------------------------- writing

function findGuidelines() {
  if (fileFlag !== -1 && args[fileFlag + 1]) return path.resolve(args[fileFlag + 1])
  const found = fs.readdirSync(ROOT)
    .filter(f => /^PLUFF_GUIDELINES_v[\d.]+\.md$/.test(f))
    .sort((a, b) => parseFloat(a.match(/v([\d.]+)/)[1]) - parseFloat(b.match(/v([\d.]+)/)[1]))
  if (!found.length) return null
  return path.join(ROOT, found[found.length - 1])
}

function applySection(doc, section) {
  const s = doc.indexOf(START)
  const e = doc.indexOf(END)
  if (s !== -1 && e !== -1 && e > s) {
    return doc.slice(0, s) + section + doc.slice(e + END.length)
  }
  // first run: replace an old hand-written Section 31, or insert above the closing line
  const footer = '\n  * * *\n\n  _End of'
  const heading = doc.indexOf(`  ## ${HEADING}`)
  const footerAt = doc.lastIndexOf(footer)
  if (heading !== -1 && footerAt > heading) {
    return doc.slice(0, heading) + section + '\n' + doc.slice(footerAt)
  }
  if (footerAt !== -1) {
    return doc.slice(0, footerAt) + '\n\n' + section + '\n' + doc.slice(footerAt)
  }
  return doc.replace(/\s*$/, '\n\n') + section + '\n'
}

function main() {
  if (!fs.existsSync(TATEMONO_DIR)) {
    console.error('tatemonos/ folder not found. Run this from the Pluffy repo.')
    process.exit(1)
  }
  const items = fs.readdirSync(TATEMONO_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => scanTatemono(d.name))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))

  const missing = items.filter(t => t.description.startsWith('(no description'))
  const section = buildSection(items)

  if (DRY) { console.log(section); return }

  const guidelines = findGuidelines()
  if (!guidelines || !fs.existsSync(guidelines)) {
    console.error('No PLUFF_GUIDELINES_v*.md found (use --file <path>).')
    process.exit(1)
  }
  const before = fs.readFileSync(guidelines, 'utf8')
  const after = applySection(before, section)
  const rel = path.basename(guidelines)

  if (after === before) {
    console.log(`${rel} is up to date (${items.length} tatemonos).`)
    return
  }
  if (CHECK) {
    console.error(`${rel} is out of date. Run: node mizumi.js index`)
    process.exit(1)
  }
  fs.writeFileSync(guidelines, after)
  console.log(`Updated ${rel}: ${items.length} tatemonos indexed.`)
  if (missing.length) {
    console.log(`Missing a description in @arkzen:meta: ${missing.map(t => t.name).join(', ')}`)
  }
  console.log('Next: git add, commit, push, so AIs reading the repo online see the new index.')
}

main()
