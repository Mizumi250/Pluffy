// ============================================================
// PLUFF PACKAGE READER v1.0
//
// Reads the @arkzen:pkg:* blocks of one tatemono into plain objects for the
// generators. It mirrors parsePkg() in engine/shared/arkzen/engine-core/parser.ts
// (the engine parser stays the authority for tags and structure; this reader is
// the dependency-light copy the generators use, so they never import from a stack).
//
//   readTatemono(filePath)  -> { file, meta, packages: [...] }
//
// A package is { id, project, targets: { <registry>: data }, exports, build, verify,
// sdk, types, validators, openapi, backend, assets, template, plugin,
// sources: [...], tests: [...], readme }.
// Errors are thrown with a "[pkg] " prefix and say what to change.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

const YAML_BLOCKS = ['project', 'target', 'exports', 'build', 'verify', 'sdk', 'types', 'validators', 'openapi', 'backend', 'assets', 'template', 'plugin']
const CODE_BLOCKS = ['source', 'test', 'readme']
const ONCE_BLOCKS = ['exports', 'build', 'verify', 'sdk', 'types', 'validators', 'openapi', 'backend', 'assets', 'template', 'plugin', 'readme']

const fail = message => { throw new Error(`[pkg] ${message}`) }

function loadYaml(marker, text) {
  if (!text.trim()) return {}
  try { return yaml.load(text) ?? {} } catch (error) {
    const hint = text.includes('**') ? ' (a glob such as **/*.svg contains "*/", which ends the block comment early: write it as "**\\/*.svg" inside double quotes, since \\/ is a valid YAML escape for /)' : ''
    return fail(`@arkzen:${marker} has invalid YAML: ${String(error.message).split('\n')[0]}${hint}`)
  }
}

const isMap = value => typeof value === 'object' && value !== null && !Array.isArray(value)

// Returns the block list, in file order: { kind, marker, id, registry, lang, name, data|header+raw }.
export function readPkgBlocks(source) {
  const text = String(source).replace(/\r\n?/g, '\n')
  const openerRe = /^[ \t]*\/\*[ \t]*@arkzen:pkg:([A-Za-z0-9_-]+)((?::[A-Za-z0-9_-]+)*)(?=\s|\*\/)/gm
  const blocks = []
  const seen = new Set()
  let scanFrom = 0
  for (const m of text.matchAll(openerRe)) {
    const opener = m.index + m[0].indexOf('/*')
    if (opener < scanFrom) continue                  // inside a body we already consumed
    const kind = m[1]
    const segs = m[2] ? m[2].slice(1).split(':') : []
    if (segs[segs.length - 1] === 'end') continue
    const isYaml = YAML_BLOCKS.includes(kind)
    if (!isYaml && !CODE_BLOCKS.includes(kind)) fail(`Unknown package block @arkzen:pkg:${kind}`)
    const marker = ['pkg', kind, ...segs].join(':')
    const block = { kind, marker }
    if (kind === 'target') {
      if (segs.length < 1 || segs.length > 2) fail(`@arkzen:${marker}: write @arkzen:pkg:target:<registry>[:<package-id>]`)
      block.registry = segs[0]
      if (segs[1]) block.id = segs[1]
    } else if (kind === 'source' || kind === 'test') {
      if (segs.length !== 2) fail(`@arkzen:${marker}: write @arkzen:pkg:${kind}:<lang>:<name>`)
      block.lang = segs[0]
      block.name = segs[1]
    } else {
      if (segs.length > 1) fail(`@arkzen:${marker}: write @arkzen:pkg:${kind}[:<package-id>]`)
      if (segs[0]) block.id = segs[0]
    }
    if (seen.has(marker)) fail(`Duplicate @arkzen:${marker} block`)
    seen.add(marker)

    // The opening comment ends at the first "*/" after the opener.
    const close = text.indexOf('*/', opener + 2)
    if (close === -1) fail(`@arkzen:${marker} opening comment is never closed with */`)
    const firstBreak = text.indexOf('\n', opener)
    const inline = firstBreak === -1 || close < firstBreak
    const headerText = inline ? '' : text.slice(firstBreak + 1, close)
    scanFrom = close + 2

    if (isYaml) {
      const data = loadYaml(marker, headerText)
      if (!isMap(data)) fail(`@arkzen:${marker} must contain a YAML mapping`)
      block.data = data
    } else {
      const header = loadYaml(marker, headerText)
      if (!isMap(header)) fail(`@arkzen:${marker} header must be a YAML mapping`)
      const closer = `/* @arkzen:${marker}:end */`
      const end = text.indexOf(closer, close + 2)
      if (end === -1) fail(`@arkzen:${marker} is missing its closing ${closer}`)
      block.header = header
      block.raw = text.slice(close + 2, end).replace(/^\n+/, '').replace(/\s+$/, '')
      scanFrom = end + closer.length
    }
    blocks.push(block)
  }
  return blocks
}

function readMeta(source) {
  const m = String(source).replace(/\r\n?/g, '\n').match(/^[ \t]*\/\*[ \t]*@arkzen:meta[ \t]*\n([\s\S]*?)^[ \t]*\*\//m)
  if (!m) fail('@arkzen:meta block is missing')
  const meta = loadYaml('meta', m[1])
  if (!isMap(meta) || typeof meta.name !== 'string') fail('@arkzen:meta needs a name:')
  return meta
}

// Groups the blocks by package id (see validatePkg in validator.ts for the same ownership rules).
export function groupPackages(blocks) {
  const projects = blocks.filter(b => b.kind === 'project')
  if (projects.length === 0) fail('@arkzen:pkg:project is required (it holds the package name, kind, license and targets)')
  if (projects.length > 1 && projects.some(p => p.id === undefined)) fail('When a tatemono holds more than one package, every @arkzen:pkg:project needs an id: @arkzen:pkg:project:<package-id>')
  const idOf = b => b.id ?? '_default'
  const ids = new Set(projects.map(idOf))
  if (ids.size !== projects.length) fail('Two @arkzen:pkg:project blocks share a package id')
  const sole = projects.length === 1 ? idOf(projects[0]) : undefined

  const ownerOf = b => {
    if (b.kind === 'project') return idOf(b)
    if (b.id !== undefined) return b.id
    const named = (isMap(b.data) && typeof b.data.package === 'string' && b.data.package) || (isMap(b.header) && typeof b.header.package === 'string' && b.header.package)
    return named || sole
  }

  const packages = new Map()
  for (const p of projects) {
    packages.set(idOf(p), {
      id: p.id ?? (typeof p.data.name === 'string' ? p.data.name.replace(/^@[^/]+\//, '') : 'package'),
      project: p.data, targets: {}, sources: [], tests: [], readme: null,
    })
  }
  for (const b of blocks) {
    if (b.kind === 'project') continue
    const owner = ownerOf(b)
    if (owner === undefined) fail(`@arkzen:${b.marker} does not say which package it belongs to. Add package: <id>`)
    if (!ids.has(owner)) fail(`@arkzen:${b.marker} refers to package "${owner}", which has no @arkzen:pkg:project:${owner} block`)
    const pkg = packages.get(owner)
    if (b.kind === 'target') {
      if (pkg.targets[b.registry]) fail(`Package "${pkg.id}" has two @arkzen:pkg:target:${b.registry} blocks`)
      pkg.targets[b.registry] = b.data
    } else if (b.kind === 'source') pkg.sources.push({ lang: b.lang, name: b.name, header: b.header, raw: b.raw })
    else if (b.kind === 'test') pkg.tests.push({ lang: b.lang, name: b.name, header: b.header, raw: b.raw })
    else if (b.kind === 'readme') pkg.readme = b.raw
    else {
      if (ONCE_BLOCKS.includes(b.kind) && pkg[b.kind] !== undefined) fail(`Package "${pkg.id}" has more than one @arkzen:pkg:${b.kind} block`)
      pkg[b.kind] = b.data
    }
  }
  return [...packages.values()]
}

// The web:components and web:style blocks a component package can export (`from: web:components:Button`).
// Both are code blocks closed by ":end"; the body is returned verbatim.
export function readWebBlocks(source) {
  const text = String(source).replace(/\r\n?/g, '\n')
  const out = { components: {}, styles: {} }
  for (const [kind, bucket] of [['components', out.components], ['style', out.styles]]) {
    const re = new RegExp(`^[ \\t]*\\/\\*[ \\t]*@arkzen:web:${kind}:([A-Za-z0-9_-]+)[ \\t]*\\*\\/[ \\t]*\\n`, 'gm')
    for (const m of text.matchAll(re)) {
      const closer = `/* @arkzen:web:${kind}:${m[1]}:end */`
      const start = m.index + m[0].length
      const end = text.indexOf(closer, start)
      if (end === -1) fail(`@arkzen:web:${kind}:${m[1]} is missing its closing ${closer}`)
      bucket[m[1]] = text.slice(start, end).replace(/^\n+/, '').replace(/\s+$/, '')
    }
  }
  return out
}

export function readTatemono(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const meta = readMeta(source)
  const blocks = readPkgBlocks(source)
  if (blocks.length === 0) fail(`${path.basename(path.dirname(filePath))} has no @arkzen:pkg blocks`)
  return { file: filePath, dir: path.dirname(filePath), meta, packages: groupPackages(blocks), web: readWebBlocks(source) }
}
