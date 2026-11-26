#!/usr/bin/env node
// ============================================================
// Pluffy Package plan, Phase 1: register the `pkg` family.
//
// Run from the Pluffy repo root:   node engine/package/phase1/apply.mjs
// Dry run (changes nothing):       node engine/package/phase1/apply.mjs --dry
//
// The script edits the files in place with small anchored insertions, so it keeps whatever
// other sessions changed in the same files (the extension work edits these files too).
// It is safe to run twice: an edit that is already present is skipped. If an anchor is not
// found the script stops BEFORE writing anything and says which one.
// After it succeeds you can delete engine/package/phase1/ (the snippets are not used at runtime).
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = process.cwd()
const DRY  = process.argv.includes('--dry')
const snip = name => fs.readFileSync(path.join(HERE, 'snippets', name), 'utf8').replace(/\r\n/g, '\n')

const plan = new Map()   // absolute path -> { text, eol, changed }
const log  = []
let failed = false

function load(rel) {
  const abs = path.join(ROOT, rel)
  if (plan.has(abs)) return plan.get(abs)
  if (!fs.existsSync(abs)) return null
  const raw  = fs.readFileSync(abs, 'utf8')
  const eol  = raw.includes('\r\n') ? '\r\n' : '\n'
  const item = { abs, rel, text: raw.replace(/\r\n/g, '\n'), eol, changed: false }
  plan.set(abs, item)
  return item
}

// edit(file, done, anchor, replacement, mode): mode 'before' | 'after' | 'replace'.
// `done` is a string that is present once the edit has been applied (idempotency check).
function edit(rel, done, anchor, replacement, mode = 'after') {
  const f = load(rel)
  if (!f) { log.push(`  MISSING FILE  ${rel}`); failed = true; return }
  if (f.text.includes(done)) { log.push(`  already done  ${rel}  (${done.slice(0, 50).trim()})`); return }
  const first = f.text.indexOf(anchor)
  if (first === -1) { log.push(`  ANCHOR NOT FOUND  ${rel}\n      ${anchor.split('\n')[0].slice(0, 110)}`); failed = true; return }
  if (f.text.indexOf(anchor, first + 1) !== -1) { log.push(`  ANCHOR NOT UNIQUE  ${rel}\n      ${anchor.split('\n')[0].slice(0, 110)}`); failed = true; return }
  const at = first
  if (mode === 'before')       f.text = f.text.slice(0, at) + replacement + f.text.slice(at)
  else if (mode === 'after')   f.text = f.text.slice(0, at + anchor.length) + replacement + f.text.slice(at + anchor.length)
  else                         f.text = f.text.slice(0, at) + replacement + f.text.slice(at + anchor.length)
  f.changed = true
  log.push(`  edited        ${rel}  (${done.slice(0, 50).trim()})`)
}

const SHARED = 'engine/shared/arkzen/engine-core'

// ── 1. parser.ts (shared copy) ───────────────────────────────
const PARSER = `${SHARED}/parser.ts`
edit(PARSER, '// v18.0: Package blocks.',
  '// v17.0: Browser extension blocks.',
  '// v18.0: Package blocks. The `pkg` family (@arkzen:pkg:project, target, exports, build, verify,\n' +
  '//        sdk, types, validators, openapi, backend, assets, template, plugin, source, test, readme).\n' +
  '//        New parser: parsePkg(). ParsedTatemono.pkg is set only when the file has at least one\n' +
  '//        pkg block. A Tatemono with pkg blocks needs no web, native or Lynx page.\n' +
  '//        Opt-in: Tatemonos without a pkg block parse exactly as before.\n', 'before')
edit(PARSER, '  ArkzenPkgBlock,',
  '  ArkzenExtYamlBlock,\n  ArkzenConfigOverride,',
  '  ArkzenExtYamlBlock,\n  ArkzenPkg,\n  ArkzenPkgBlock,\n  ArkzenConfigOverride,', 'replace')
edit(PARSER, 'function parsePkg(',
  '// ─────────────────────────────────────────────\n// NATIVE IMPORT LINE EXTRACTOR — v10.3\n//\n// Strips the @arkzen:import:expo or @arkzen:import:rn line from a block\'s',
  snip('parser-pkg.txt'), 'before')
edit(PARSER, '...PKG_CODE_TAGS,',
  '  ...EXT_CODE_TAGS,\n]',
  '  ...EXT_CODE_TAGS,\n  // package blocks - v18.0 (same line */ for Shape C, a multi-line YAML opener for Shape B)\n  ...PKG_CODE_TAGS,\n]', 'replace')
edit(PARSER, '...PKG_YAML_TAGS,',
  '  ...EXT_YAML_TAGS,\n]',
  '  ...EXT_YAML_TAGS,\n  // package YAML-only blocks - v18.0\n  ...PKG_YAML_TAGS,\n]', 'replace')
edit(PARSER, '(?:web|native|desktop|ext|pkg):',
  '(?:web|native|desktop|ext):', '(?:web|native|desktop|ext|pkg):', 'replace')
edit(PARSER, '// v18.0: a typo in a pkg block name',
  '    const hasInlineClose = trimmed.endsWith(\'*/\')\n',
  '    // v18.0: a typo in a pkg block name gets a clear message instead of "Missing closing tag"\n' +
  '    if (tagType.startsWith(\'pkg:\') && ![...PKG_CODE_TAGS, ...PKG_YAML_TAGS].includes(tagType)) {\n' +
  '      errors.push({\n' +
  '        line:    lineNum,\n' +
  '        tag:     trimmed.replace(\'/* \', \'\').trim(),\n' +
  '        problem: `Unknown package block "@arkzen:${tagType}"`,\n' +
  '        fix:     `Use one of: ${[...PKG_CODE_TAGS, ...PKG_YAML_TAGS].map(x => `@arkzen:${x}`).join(\', \')}`,\n' +
  '      })\n' +
  '      continue\n' +
  '    }\n\n', 'before')
edit(PARSER, 'PKG_CODE_TAGS.includes(tagType)',
  'const isExtCodeTag = EXT_CODE_TAGS.includes(tagType)',
  'const isExtCodeTag = EXT_CODE_TAGS.includes(tagType) || PKG_CODE_TAGS.includes(tagType)', 'replace')
edit(PARSER, 'hasPkg:          boolean = false',
  '  hasExt:          boolean = false\n): void {',
  '  hasExt:          boolean = false,\n  hasPkg:          boolean = false\n): void {', 'replace')
edit(PARSER, '!hasExt && !hasPkg &&',
  '!hasFreeFiles && !hasExt &&', '!hasFreeFiles && !hasExt && !hasPkg &&', 'replace')
edit(PARSER, 'const pkg = parsePkg(content)',
  '  const ext = parseExt(content)\n',
  '\n  // v18.0: package blocks (opt-in; undefined when the Tatemono declares none)\n  const pkg = parsePkg(content)\n', 'after')
edit(PARSER, 'ext !== undefined, pkg !== undefined)',
  'content.includes(\'/* @arkzen:file:\'), ext !== undefined)',
  'content.includes(\'/* @arkzen:file:\'), ext !== undefined, pkg !== undefined)', 'replace')
edit(PARSER, '...(pkg ? { pkg } : {}),',
  '    ...(ext ? { ext } : {}),         // v17.0\n',
  '    ...(pkg ? { pkg } : {}),         // v18.0\n', 'after')
edit(PARSER, 'Package: ${pkgParts',
  '    console.log(`[Arkzen Parser]   Extension: ${extParts.join(\', \')}`)\n  }\n',
  '  if (pkg) {\n' +
  '    const kinds = new Set(pkg.blocks.map(b => b.kind))\n' +
  '    const pkgParts = [...kinds].map(k => {\n' +
  '      const n = pkg.blocks.filter(b => b.kind === k).length\n' +
  '      return n > 1 ? `${k} (${n})` : k\n' +
  '    })\n' +
  '    console.log(`[Arkzen Parser]   Package: ${pkgParts.join(\', \')}`)\n' +
  '  }\n', 'after')
edit(PARSER, '/* @arkzen:pkg:\'),',
  "    ext:                     content.includes('/* @arkzen:ext:'),\n",
  "    // package - v18.0\n    pkg:                     content.includes('/* @arkzen:pkg:'),\n", 'after')

// ── 2. validator.ts (shared copy) ────────────────────────────
const VALIDATOR = `${SHARED}/validator.ts`
edit(VALIDATOR, 'function validatePkg(',
  'export function validateTatemono(filePath: string): ValidationResult {',
  snip('validator-pkg.txt'), 'before')
edit(VALIDATOR, 'const pkgResult = validatePkg(',
  '    errors.push(...extResult.errors)\n    warnings.push(...extResult.warnings)\n  }\n',
  '\n  // v18.0: package blocks (opt-in)\n  if (parsed.pkg) {\n    const pkgResult = validatePkg(parsed, filePath)\n    errors.push(...pkgResult.errors)\n    warnings.push(...pkgResult.warnings)\n  }\n', 'after')
edit(VALIDATOR, 'ArkzenDatabase, ArkzenPkgBlock }',
  "import type { ParsedTatemono, ValidationResult, ArkzenDatabase } from '../types'",
  "import type { ParsedTatemono, ValidationResult, ArkzenDatabase, ArkzenPkgBlock } from '../types'", 'replace')
edit(VALIDATOR, '!parsed.ext && !parsed.pkg &&',
  '!hasFreeFiles && !parsed.ext &&', '!hasFreeFiles && !parsed.ext && !parsed.pkg &&', 'replace')
edit(VALIDATOR, 'const extOnly = (!!parsed.ext || !!parsed.pkg) &&',
  'const extOnly = !!parsed.ext &&', 'const extOnly = (!!parsed.ext || !!parsed.pkg) &&', 'replace')

// ── 3. types, in every stack that carries them ───────────────
const typeFiles = []
const stacksDir = path.join(ROOT, 'engine', 'frontend')
if (fs.existsSync(stacksDir)) {
  for (const d of fs.readdirSync(stacksDir, { withFileTypes: true })) {
    const rel = `engine/frontend/${d.name}/arkzen/types/index.ts`
    if (d.isDirectory() && fs.existsSync(path.join(ROOT, rel)) && fs.readFileSync(path.join(ROOT, rel), 'utf8').includes('interface ArkzenExt ')) typeFiles.push(rel)
  }
}
for (const rel of typeFiles) {
  edit(rel, 'export interface ArkzenPkg ',
    '  export?:     ArkzenExtYamlBlock         // @arkzen:ext:export\n}\n', snip('types-pkg.txt'), 'after')
  edit(rel, 'pkg?:           ArkzenPkg',
    '  ext?:           ArkzenExt           // v17.0: @arkzen:ext:* browser extension blocks\n',
    '  pkg?:           ArkzenPkg           // v18.0: @arkzen:pkg:* package blocks\n', 'after')
}

// ── 4. scaffold.js ───────────────────────────────────────────
const SC = 'scaffold.js'
edit(SC, "key: 'pkg:project'",
  "  build: () => shapeA('ext:export', `browsers: [chrome, firefox]\\nzip: true`) }))\n",
  snip('scaffold-blocks.txt'), 'after')
edit(SC, "  package: { label:",
  "make('ext:popup', null, { slug }), make('ext:export')] },\n",
  "  package: { label: 'Package (npm library)', sub: 'meta + pkg project + npm target + source + exports + verify',\n" +
  "    make: ({ slug }) => [metaBlock(slug, 'Package tatemono'), make('pkg:project', null, { slug }), make('pkg:target', 'npm', { slug }), make('pkg:source', 'ts:index', { slug }), make('pkg:exports'), make('pkg:verify')] },\n", 'after')
edit(SC, 'const PKG_YAML_FAMILIES',
  "const EXT_NAMED_FAMILIES = new Set(['ext:page', 'ext:content', 'ext:script', 'ext:locale'])\n",
  "// Package blocks (@arkzen:pkg:*). target takes a registry, source and test take lang:name, the rest take an optional package id.\n" +
  "const PKG_YAML_FAMILIES = new Set(['pkg:project', 'pkg:target', 'pkg:exports', 'pkg:build', 'pkg:verify', 'pkg:sdk', 'pkg:types', 'pkg:validators', 'pkg:openapi', 'pkg:backend', 'pkg:assets', 'pkg:template', 'pkg:plugin'])\n" +
  "const PKG_CODE_FAMILIES = new Set(['pkg:source', 'pkg:test', 'pkg:readme'])\n", 'after')
edit(SC, "head === 'pkg'",
  "  if (head === 'ext') return { family: `ext:${parts[1]}`, name: parts.slice(2).join(':') }\n",
  "  if (head === 'pkg') return { family: `pkg:${parts[1]}`, name: parts.slice(2).join(':') }\n", 'after')
edit(SC, 'exts: [], pkgs: []',
  'oauth: null, exts: [],', 'oauth: null, exts: [], pkgs: [],', 'replace')
edit(SC, "model.pkgs.push(",
  "    if (o.family.startsWith('ext:')) model.exts.push({ ...o, name: o.name, fields: yamlTop(yaml) })\n",
  "    if (o.family.startsWith('pkg:')) model.pkgs.push({ ...o, name: o.name, fields: yamlTop(yaml) })\n", 'after')
edit(SC, '!m.exts.length && !m.pkgs.length &&',
  '!m.exts.length && !m.webPages.length', '!m.exts.length && !m.pkgs.length && !m.webPages.length', 'replace')
edit(SC, 'PKG_YAML_FAMILIES.has(o.family)\n',
  "head === 'database' || head === 'api' || EXT_YAML_FAMILIES.has(o.family)\n",
  "head === 'database' || head === 'api' || EXT_YAML_FAMILIES.has(o.family) || PKG_YAML_FAMILIES.has(o.family)\n", 'replace')
edit(SC, "o.family === 'desktop:frame' || EXT_CODE_FAMILIES.has(o.family) || PKG_CODE_FAMILIES",
  "o.family === 'desktop:frame' || EXT_CODE_FAMILIES.has(o.family)\n",
  "o.family === 'desktop:frame' || EXT_CODE_FAMILIES.has(o.family) || PKG_CODE_FAMILIES.has(o.family)\n", 'replace')
edit(SC, "EXT_CODE_FAMILIES.has(o.family) || PKG_CODE_FAMILIES.has(o.family)) && !o.sameLineClose && o.closed",
  "EXT_CODE_FAMILIES.has(o.family)) && !o.sameLineClose && o.closed",
  "EXT_CODE_FAMILIES.has(o.family) || PKG_CODE_FAMILIES.has(o.family)) && !o.sameLineClose && o.closed", 'replace')
edit(SC, 'Unknown package block',
  "    if (o.family.startsWith('ext:')) {\n      if (!EXT_YAML_FAMILIES.has(o.family)",
  "    if (o.family.startsWith('pkg:')) {\n" +
  "      if (!PKG_YAML_FAMILIES.has(o.family) && !PKG_CODE_FAMILIES.has(o.family)) E(`Unknown package block @arkzen:${o.tag}. Known: ${[...PKG_YAML_FAMILIES, ...PKG_CODE_FAMILIES].map(f => '@arkzen:' + f).join(', ')}`, o.line)\n" +
  "    }\n", 'before')
edit(SC, '// package blocks (engine contract',
  '  // frames (engine contract)\n', snip('scaffold-checks.txt') + '  // frames (engine contract)\n', 'replace')
edit(SC, "'pkg:source': 'free'",
  "'native:script': 'free', 'lynx:script': 'free', 'ext:locale': 'free',",
  "'native:script': 'free', 'lynx:script': 'free', 'ext:locale': 'free',\n  'pkg:target': 'free', 'pkg:source': 'free', 'pkg:test': 'free',", 'replace')

edit(SC, "block.key.startsWith('pkg:') && kind === 'free'",
  "  if (kind === 'free') return /^[A-Za-z0-9][A-Za-z0-9_.{}-]*$/.test(input)",
  "  // package blocks: target takes <registry>[:<package-id>], source and test take <lang>:<name>\n" +
  "  if (block.key.startsWith('pkg:') && kind === 'free') return /^[A-Za-z0-9][A-Za-z0-9_-]*(:[A-Za-z0-9][A-Za-z0-9_-]*)?$/.test(input) ? { value: input } : { error: `\"${input}\" is not a valid ${block.key} name (letters, digits, - _ and one : between the parts)` }\n", 'before')

// ── 5. mizumi.js help text, VS Code icon kind ────────────────
edit('mizumi.js', 'unreal, extension, package)',
  'unreal, extension)', 'unreal, extension, package)', 'replace')
edit('mizumi.js', 'unreal|extension|package)',
  'unreal|extension)', 'unreal|extension|package)', 'replace')
edit('vscode-extension/extension.js', "case 'pkg':",
  "case 'ext': return k.Object", "case 'ext': case 'pkg': return k.Object", 'replace')

// ── 6. copies of the engine-core files in every stack ───────
// shared-sync.ts copies these on the next engine start; doing it here keeps the stacks consistent now.
const copies = []
const scan = dir => {
  if (!fs.existsSync(dir)) return
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.name === 'node_modules' || d.name === '.git') continue
    const p = path.join(dir, d.name)
    if (d.isDirectory()) scan(p)
    else if ((d.name === 'parser.ts' || d.name === 'validator.ts') && p.includes(`${path.sep}arkzen${path.sep}core${path.sep}`)) copies.push(p)
  }
}
scan(path.join(ROOT, 'engine', 'frontend'))
scan(path.join(ROOT, 'engine', 'backend'))

if (failed) {
  console.error('\nPhase 1 NOT applied. Nothing was written.\n' + log.join('\n'))
  console.error('\nSend this output back and the anchor will be fixed. The repo changed since this patch was made.')
  process.exit(1)
}

let written = 0
for (const f of plan.values()) {
  if (!f.changed) continue
  const out = f.eol === '\r\n' ? f.text.replace(/\n/g, '\r\n') : f.text
  if (!DRY) fs.writeFileSync(f.abs, out)
  written++
}
const sharedParser    = plan.get(path.join(ROOT, PARSER))
const sharedValidator = plan.get(path.join(ROOT, VALIDATOR))
for (const c of copies) {
  const src = c.endsWith('parser.ts') ? sharedParser : sharedValidator
  if (!src || !src.changed) continue
  const raw = fs.readFileSync(c, 'utf8')
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'
  const out = eol === '\r\n' ? src.text.replace(/\n/g, '\r\n') : src.text
  if (!DRY && raw !== out) fs.writeFileSync(c, out)
  log.push(`  synced copy   ${path.relative(ROOT, c)}`)
}
console.log(log.join('\n'))
console.log(`\nPhase 1 ${DRY ? 'dry run ok' : 'applied'}: ${written} file(s) edited, ${copies.length} stack copy(ies) synced.`)
