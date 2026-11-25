// ============================================================
// PLUFF GAME COMMON v1.0
//
// Helpers shared by the game generators (Unity scene mode, Unreal scene mode).
// Godot and the Unity dino-runner generator keep their own copies for now so
// their behavior does not change; move them over one at a time when touched.
//
// What lives here:
//   createAssert(label)          -> assert(condition, message) with a "[label] " prefix
//   loadYaml(text)               -> js-yaml parse (js-yaml ships with engine/frontend/nextjs)
//   readYamlBlock(source, marker, { assert, required })
//   readNamedYamlBlocks(source, kind, { assert })   (blocks closed by "<tag>:end")
//   createValidators(assert)     -> vector / number / color validators
//   resolveAssetFile(...)        -> safe lookup of a file under a Tatemono's assets/
//   hashHex(value, algorithm)    -> deterministic hex digest (GUIDs, IDs)
//   isWithin(parent, target)
//   stageAndReplace(outputDir, build) -> build into a staging folder, then swap it in
// ============================================================

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const ENGINE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const requireFromNext = createRequire(path.join(ENGINE_DIR, 'frontend', 'nextjs', 'package.json'))
const { load: parseYaml } = requireFromNext('js-yaml')

export function loadYaml(text) {
  return parseYaml(text)
}

export function createAssert(label) {
  const prefix = `[${label}]`
  const assert = (condition, message) => {
    if (!condition) throw new Error(`${prefix} ${message}`)
  }
  assert.prefix = prefix
  return assert
}

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// One block opened with "/* @arkzen:<marker>" and closed by a bare "*/" line.
// Returns the parsed YAML mapping, or null when the block is absent and not required.
export function readYamlBlock(source, marker, { assert, required = false }) {
  const matches = [...source.matchAll(new RegExp(`^\\s*\\/\\* @arkzen:${escapeRegExp(marker)}\\r?\\n([\\s\\S]*?)^\\s*\\*\\/\\s*$`, 'gm'))]
  assert(matches.length <= 1, `Duplicate @arkzen:${marker} block`)
  if (required) assert(matches.length === 1, `A @arkzen:${marker} block is required`)
  if (!matches.length) return null
  let value
  try {
    value = parseYaml(matches[0][1])
  } catch (error) {
    throw new Error(`${assert.prefix} Invalid YAML in @arkzen:${marker}: ${error.message}`)
  }
  assert(value && typeof value === 'object' && !Array.isArray(value), `@arkzen:${marker} must contain a YAML mapping`)
  return value
}

// Repeated blocks such as "@arkzen:unreal:scene:<name>". Each one is opened by
// "/* @arkzen:<kind>:<name>", closed by a bare "*/" line and followed on the next
// line by "/* @arkzen:<kind>:<name>:end */". Returns [{ name, ...yaml }].
export function readNamedYamlBlocks(source, kind, { assert }) {
  const lines = source.split(/\r?\n/)
  const opener = new RegExp(`^\\s*\\/\\* @arkzen:${escapeRegExp(kind)}:([a-z][a-z0-9_-]*)\\s*$`)
  const blocks = []
  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(opener)
    if (!opening) continue
    const [, name] = opening
    let closing = index + 1
    while (closing < lines.length && lines[closing].trim() !== '*/') closing += 1
    assert(closing < lines.length, `@arkzen:${kind}:${name} is missing its comment terminator`)
    assert(lines[closing + 1]?.trim() === `/* @arkzen:${kind}:${name}:end */`, `@arkzen:${kind}:${name} must close with /* @arkzen:${kind}:${name}:end */`)
    let value
    try {
      value = parseYaml(lines.slice(index + 1, closing).join('\n'))
    } catch (error) {
      throw new Error(`${assert.prefix} Invalid YAML in @arkzen:${kind}:${name}: ${error.message}`)
    }
    assert(value && typeof value === 'object' && !Array.isArray(value), `@arkzen:${kind}:${name} must contain a YAML mapping`)
    blocks.push({ name, ...value })
    index = closing + 1
  }
  return blocks
}

export function createValidators(assert) {
  function validateVector(value, label, fallback, allowZero = true) {
    if (value === undefined) return fallback
    assert(Array.isArray(value) && value.length === 3 && value.every(Number.isFinite), `${label} must be a three-number array`)
    if (!allowZero) assert(value.some(number => number !== 0), `${label} cannot be [0, 0, 0]`)
    return value
  }
  function validatePositiveVector(value, label, fallback) {
    const vector = validateVector(value, label, fallback)
    assert(vector.every(number => number > 0), `${label} values must be positive`)
    return vector
  }
  function validateVector2(value, label, fallback, allowZero = true) {
    if (value === undefined) return fallback
    assert(Array.isArray(value) && value.length === 2 && value.every(Number.isFinite), `${label} must be a two-number array`)
    if (!allowZero) assert(value.some(number => number !== 0), `${label} cannot be [0, 0]`)
    return value
  }
  function validatePositiveVector2(value, label, fallback) {
    const vector = validateVector2(value, label, fallback)
    assert(vector.every(number => number > 0), `${label} values must be positive`)
    return vector
  }
  function validateNumber(value, label, fallback, minimum = 0) {
    if (value === undefined) return fallback
    assert(Number.isFinite(value) && value >= minimum, `${label} must be a number greater than or equal to ${minimum}`)
    return value
  }
  function validateNegativeNumber(value, label, fallback) {
    if (value === undefined) return fallback
    assert(Number.isFinite(value) && value < 0, `${label} must be a negative number`)
    return value
  }
  function validateColor(value, label) {
    if (value === undefined) return
    assert(typeof value === 'string' && /^#[\da-f]{6}$/i.test(value), `${label} must be #RRGGBB`)
  }
  return {
    validateVector,
    validatePositiveVector,
    validateVector2,
    validatePositiveVector2,
    validateNumber,
    validateNegativeNumber,
    validateColor,
  }
}

// Looks up <tatemonoDir>/<source> (source must start with "assets/") without following
// symbolic links, and returns the absolute path of a regular file.
export function resolveAssetFile(assert, tatemonoDir, source, name, label = 'asset') {
  const assetsRoot = path.join(tatemonoDir, 'assets')
  assert(fs.existsSync(assetsRoot) && fs.lstatSync(assetsRoot).isDirectory() && !fs.lstatSync(assetsRoot).isSymbolicLink(), 'Tatemono assets/ must be a regular directory')
  const relative = source.slice('assets/'.length)
  const segments = relative.split('/')
  let current = assetsRoot
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index])
    assert(fs.existsSync(current), `Required ${label} "${name}" does not exist: ${source}`)
    const stat = fs.lstatSync(current)
    assert(!stat.isSymbolicLink(), `${label[0].toUpperCase()}${label.slice(1)} "${name}" cannot use symbolic links: ${source}`)
    if (index < segments.length - 1) assert(stat.isDirectory(), `Invalid ${label} directory in "${source}"`)
    else assert(stat.isFile(), `Required ${label} "${name}" must be a regular file: ${source}`)
  }
  return current
}

export function hashHex(value, algorithm = 'md5') {
  return crypto.createHash(algorithm).update(value).digest('hex')
}

export function isWithin(parent, target) {
  const relative = path.relative(parent, target)
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)
}

// Refuses an output folder that overlaps the Tatemono folder (either direction).
export function assertOutputIsSeparate(assert, tatemonoDir, tatemonoFile, outputPath, label) {
  assert(outputPath !== tatemonoDir && !isWithin(tatemonoDir, outputPath), `${label} output directory cannot be inside the source Tatemono folder`)
  assert(!isWithin(outputPath, tatemonoFile), `${label} output directory cannot contain the source Tatemono file`)
}

// Builds into a hidden sibling staging folder, then swaps it in for outputDir.
// If build() throws, the existing output is left untouched and the staging folder is removed.
// Returns whatever build(stagingDir) returned.
export function stageAndReplace(outputDir, build) {
  fs.mkdirSync(path.dirname(outputDir), { recursive: true })
  const stagingDir = fs.mkdtempSync(path.join(path.dirname(outputDir), `.${path.basename(outputDir)}-staging-`))
  try {
    const result = build(stagingDir)
    const backupDir = `${outputDir}.previous-${process.pid}`
    if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true })
    if (fs.existsSync(outputDir)) fs.renameSync(outputDir, backupDir)
    try {
      fs.renameSync(stagingDir, outputDir)
    } catch (error) {
      if (fs.existsSync(backupDir)) fs.renameSync(backupDir, outputDir)
      throw error
    }
    if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true })
    return result
  } catch (error) {
    if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true })
    throw error
  }
}
