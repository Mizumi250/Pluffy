#!/usr/bin/env node
/**
 * scan.js - validates and builds training data from each tatemono core.tsx
 *
 * Run from the project root:  node scan.js
 *
 * Outputs:
 *   blocks.jsonl          one line per parsed @arkzen block (for inspection)
 *   descriptions.json     description template; fill "description", then run again
 *   dataset.jsonl         validated, complete-app training examples (one per Tatemono)
 *   block-dataset.jsonl   validated, block-level training examples within the size limit
 *   scan-report.txt       engine validation errors and examples excluded from training
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = process.cwd()
const TAT_DIR = path.join(ROOT, 'tatemonos')
const DESC_FILE = path.join(ROOT, 'descriptions.json')
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const MAX_APP_SEQUENCE_TOKENS = 8192
const MAX_BLOCK_SEQUENCE_TOKENS = 3000

const SYSTEM_PROMPT =
  'You generate complete Pluff tatemono files (core.tsx) using the @arkzen DSL. ' +
  'Output only the complete file, with every block correctly opened and closed.'
const BLOCK_SYSTEM_PROMPT =
  'You generate one valid Pluff @arkzen DSL block. Output only the requested block, ' +
  'including its opening and closing markers where required.'

const YAML_ONLY_TAGS = new Set([
  'meta',
  'meta:web',
  'meta:native',
  'web:config',
  'native:config',
  'desktop:config',
  'database',
  'api',
  'routes',
  'realtime',
  'events',
  'notifications',
  'mail',
  'oauth',
])
const BODY_SEPARATOR_TAGS = new Set(['endpoint', 'handler', 'middleware', 'policy'])

function isYamlOnlyTag(tag) {
  return (
    YAML_ONLY_TAGS.has(tag) ||
    /^(database|api|realtime|events|notifications|mail):/.test(tag)
  )
}

// Unity blocks are YAML closed by a bare */ line. Only unity:scene:<name> also writes an
// optional :end marker after it, which belongs to the block when present.
function isBareClosedTag(tag) {
  return tag.startsWith('unity:')
}

function isInline(tag) {
  return (
    /^(web|native):page:layout:/.test(tag) ||
    tag.startsWith('import:') ||
    tag.startsWith('resolved:import:')
  )
}

function splitBlocks(src) {
  const blocks = []
  const problems = []
  const lines = src.split(/\r?\n/)
  let lineOffset = 0
  let consumedUntil = 0

  for (const [lineIndex, line] of lines.entries()) {
    const match = line.match(/^[ \t]*\/\*\s*@arkzen:([A-Za-z0-9:_.{}+\-]+)/)
    if (!match) {
      lineOffset += line.length + 1
      continue
    }

    const tag = match[1]
    const start = lineOffset + line.indexOf('/*')
    if (start < consumedUntil || tag.endsWith(':end') || isInline(tag)) {
      lineOffset += line.length + 1
      continue
    }

    let end
    if (isYamlOnlyTag(tag) || isBareClosedTag(tag)) {
      let closeLine = lineIndex + 1
      while (closeLine < lines.length && lines[closeLine].trim() !== '*/') closeLine += 1
      if (closeLine === lines.length) {
        problems.push(`unclosed YAML block: ${tag}`)
        lineOffset += line.length + 1
        continue
      }
      end = lineOffset
      for (let i = lineIndex; i <= closeLine; i += 1) {
        end += lines[i].length + 1
      }
      end -= 1
      if (isBareClosedTag(tag)) {
        let next = closeLine + 1
        while (next < lines.length && lines[next].trim() === '') next += 1
        if (next < lines.length && lines[next].trim() === `/* @arkzen:${tag}:end */`) {
          for (let i = closeLine + 1; i <= next; i += 1) end += lines[i].length + 1
        }
      }
    } else {
      const closeMarker = `/* @arkzen:${tag}:end */`
      const closeStart = src.indexOf(closeMarker, start + line.length)
      if (closeStart === -1) {
        problems.push(`missing closing marker: ${tag}`)
        lineOffset += line.length + 1
        continue
      }
      end = closeStart + closeMarker.length
    }

    const content = src.slice(start, end)
    if (BODY_SEPARATOR_TAGS.has(tag.split(':', 1)[0])) {
      const nextLine = lines[lineIndex + 1]?.trim()
      if (!line.trimEnd().endsWith('*/') && nextLine !== '*/') {
        problems.push(`missing body separator after ${tag}`)
      }
    }

    blocks.push({ tag, content })
    consumedUntil = end
    lineOffset += line.length + 1
  }

  return { blocks, problems }
}

function estimateTokens(text) {
  return Math.ceil(text.length / 3)
}

function metaDescription(src) {
  const metaStart = src.match(/^[ \t]*\/\*\s*@arkzen:meta[ \t]*\r?$/m)
  if (!metaStart) return ''

  const start = metaStart.index + metaStart[0].length
  const close = src.indexOf('*/', start)
  if (close === -1) return ''
  const description = src.slice(start, close).match(/^\s*description:\s*(.+)$/m)
  return description ? description[1].trim().replace(/^(['"])(.*)\1$/, '$2') : ''
}

function getValidatorLocation() {
  const configPath = path.join(ROOT, 'arkzen.json')
  let activeStack = 'nextjs'
  let activeAppStack = null
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    activeStack = config.activeStack || activeStack
    activeAppStack = config.activeAppStack || null
  }
  const validationStack = ['expo', 'react-native'].includes(activeAppStack)
    ? activeAppStack
    : activeStack

  if (activeStack === 'react-inertia') {
    return {
      activeStack,
      validationDir: path.join(SCRIPT_DIR, 'engine', 'frontend', validationStack),
      packageDir: path.join(SCRIPT_DIR, 'engine', 'backend', 'laravel-inertia'),
      validatorPath: path.join(
        SCRIPT_DIR,
        'engine',
        'backend',
        'laravel-inertia',
        'resources',
        'js',
        'arkzen',
        'core',
        'validator.ts'
      ),
    }
  }

  return {
    activeStack,
    validationDir: path.join(SCRIPT_DIR, 'engine', 'frontend', validationStack),
    packageDir: path.join(SCRIPT_DIR, 'engine', 'frontend', activeStack),
    validatorPath: path.join(
      SCRIPT_DIR,
      'engine',
      'frontend',
      activeStack,
      'arkzen',
      'core',
      'validator.ts'
    ),
  }
}

// The engine copies engine/shared/arkzen/engine-core into every stack's arkzen/core/ when it starts,
// so the copy checked into a stack folder can be older than the shared source (it then rejects newer
// blocks such as @arkzen:oauth and the frame blocks). Validate with the shared source: copy it next
// to the stack's node_modules for the scan, and remove the copy when the scan ends.
const SHARED_CORE = path.join(SCRIPT_DIR, 'engine', 'shared', 'arkzen', 'engine-core')

function useSharedCore(packageDir) {
  const validator = path.join(SHARED_CORE, 'validator.ts')
  if (!fs.existsSync(validator)) return null
  const target = path.join(packageDir, '.scan-core')
  fs.rmSync(target, { recursive: true, force: true })
  fs.mkdirSync(target, { recursive: true })
  for (const file of fs.readdirSync(SHARED_CORE)) {
    if (file.endsWith('.ts')) fs.copyFileSync(path.join(SHARED_CORE, file), path.join(target, file))
  }
  process.on('exit', () => fs.rmSync(target, { recursive: true, force: true }))
  return path.join(target, 'validator.ts')
}

async function loadValidator() {
  const { activeStack, validationDir, packageDir, validatorPath: stackValidatorPath } = getValidatorLocation()
  let validatorPath = stackValidatorPath
  try {
    validatorPath = useSharedCore(packageDir) || stackValidatorPath
  } catch (error) {
    console.warn(`Could not use the shared engine core (${error instanceof Error ? error.message : String(error)}); using the ${activeStack} copy.`)
  }
  if (!fs.existsSync(validatorPath)) {
    throw new Error(`No validator found for active web stack "${activeStack}": ${validatorPath}`)
  }

  try {
    const require = createRequire(path.join(packageDir, 'package.json'))
    const tsxApiPath = require.resolve('tsx/esm/api')
    const { tsImport } = await import(pathToFileURL(tsxApiPath).href)
    const module = await tsImport(pathToFileURL(validatorPath).href, import.meta.url)
    return {
      validateTatemono: module.validateTatemono,
      validationDir,
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Could not load the "${activeStack}" engine validator (${detail}). ` +
      `Install that engine's dependencies with "npm install" in ${packageDir}.`
    )
  }
}

function validateWithEngine(validateTatemono, filePath, validationDir) {
  const logs = []
  const originalLog = console.log
  const originalError = console.error
  const originalCwd = process.cwd()
  console.log = (...args) => logs.push(args.join(' '))
  console.error = (...args) => logs.push(args.join(' '))

  try {
    process.chdir(validationDir)
    const result = validateTatemono(filePath)
    return { result, logs }
  } catch (error) {
    return {
      result: {
        valid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
      },
      logs,
    }
  } finally {
    process.chdir(originalCwd)
    console.log = originalLog
    console.error = originalError
  }
}

// Godot and Unity tatemonos have no web or native pages, so the web/native validator cannot judge
// them. Their generators are the real validator: generating into a temp folder throws on any invalid
// block. Returns null for tatemonos that are not games.
async function validateGameTatemono(src, filePath) {
  const godot = /^[ \t]*\/\*\s*@arkzen:godot:/m.test(src)
  const unity = /^[ \t]*\/\*\s*@arkzen:unity:/m.test(src)
  if (!godot && !unity) return null
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-scan-game-'))
  const originalLog = console.log
  console.log = () => {}
  try {
    if (godot) {
      const { generateGodotProject } = await import(pathToFileURL(path.join(SCRIPT_DIR, 'engine', 'game', 'godot', 'generator.js')).href)
      generateGodotProject({ tatemonoPath: filePath, outputDir: out })
    } else {
      const { generateUnityProject } = await import(pathToFileURL(path.join(SCRIPT_DIR, 'engine', 'game', 'unity', 'generator.js')).href)
      generateUnityProject({ tatemonoPath: filePath, outputDir: out })
    }
    return { valid: true, errors: [], warnings: [] }
  } catch (error) {
    return { valid: false, errors: [`${godot ? 'Godot' : 'Unity'} generator: ${error instanceof Error ? error.message : String(error)}`], warnings: [] }
  } finally {
    console.log = originalLog
    fs.rmSync(out, { recursive: true, force: true })
  }
}

// A tatemono written for another backend (cs, ts, py, java, go, rs) is reported as "inactive" when
// arkzen.json points at Laravel. That is a choice of backend, not a mistake in the blocks, so it
// is kept as a warning and the tatemono still goes into the training data.
const INACTIVE_BACKEND = /has no :[a-z]+ variant for backend|inactive on /

function withoutInactiveBackendErrors(result) {
  const inactive = result.errors.filter(error => INACTIVE_BACKEND.test(error))
  if (!inactive.length) return result
  const errors = result.errors.filter(error => !INACTIVE_BACKEND.test(error))
  return { ...result, valid: result.valid || errors.length === 0, errors, warnings: [...result.warnings, ...inactive] }
}

function getDescription(existing, name) {
  if (!existing || typeof existing !== 'object' || Array.isArray(existing)) return ''
  const entry = existing[name]
  if (typeof entry === 'string') return entry
  return typeof entry?.description === 'string' ? entry.description : ''
}

function trainingExample(systemPrompt, userPrompt, answer) {
  return JSON.stringify({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
      { role: 'assistant', content: answer },
    ],
  })
}

async function main() {
  if (!fs.existsSync(TAT_DIR)) {
    throw new Error('No tatemonos/ folder here. Run this from the project root.')
  }

  const names = fs
    .readdirSync(TAT_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => fs.existsSync(path.join(TAT_DIR, name, 'core.tsx')))
    .sort()

  let existingDesc = {}
  if (fs.existsSync(DESC_FILE)) {
    try {
      existingDesc = JSON.parse(fs.readFileSync(DESC_FILE, 'utf8').replace(/^\uFEFF/, ''))
    } catch (error) {
      throw new Error(`Could not read ${DESC_FILE}: ${error instanceof Error ? error.message : String(error)}`)
    }
    if (!existingDesc || typeof existingDesc !== 'object' || Array.isArray(existingDesc)) {
      throw new Error(`${DESC_FILE} must contain a JSON object keyed by tatemono name.`)
    }
  }

  let validator
  try {
    validator = await loadValidator()
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(`Training-data scan aborted before rewriting dataset files: ${detail}`)
  }

  const blockLines = []
  const dataset = []
  const blockDataset = []
  const template = {}
  const report = []
  let oversizedAppExamples = 0

  for (const name of names) {
    const filePath = path.join(TAT_DIR, name, 'core.tsx')
    const src = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
    const { blocks, problems } = splitBlocks(src)
    const validation = withoutInactiveBackendErrors(
      (await validateGameTatemono(src, filePath)) ?? validateWithEngine(
        validator.validateTatemono,
        filePath,
        validator.validationDir
      ).result
    )
    const meta = metaDescription(src)
    const description = getDescription(existingDesc, name).trim() || meta
    const estimatedTokens = estimateTokens(`${SYSTEM_PROMPT}\n${description}\n${src}`)
    const tags = blocks.map(block => block.tag)

    for (const block of blocks) {
      blockLines.push(JSON.stringify({ tatemono: name, tag: block.tag, content: block.content }))
    }

    template[name] = {
      description,
      meta_description: meta,
      blocks: tags,
      lines: src.split(/\r?\n/).length,
      estimated_tokens: estimatedTokens,
    }

    if (problems.length) {
      report.push(`${name}: ${problems.join('; ')}`)
    }

    if (!validation.valid) {
      report.push(`${name}: engine validation failed: ${validation.errors.join('; ')}`)
      continue
    }

    if (validation.warnings.length) {
      report.push(`${name}: engine warnings: ${validation.warnings.join('; ')}`)
    }
    if (problems.length) continue

    if (!description) {
      report.push(`${name}: missing client-style description; excluded from training`)
      continue
    }

    dataset.push(trainingExample(SYSTEM_PROMPT, description, src.trim()))
    if (estimatedTokens > MAX_APP_SEQUENCE_TOKENS) {
      oversizedAppExamples += 1
      report.push(
        `${name}: complete app is approximately ${estimatedTokens} tokens ` +
        `(planning target ${MAX_APP_SEQUENCE_TOKENS}); included whole in dataset.jsonl, ` +
        `but needs a compatible training sequence length`
      )
    }

    for (const block of blocks) {
      const context = description || meta
      const userPrompt = `Write the @arkzen:${block.tag} block for this application: ${context}`
      const blockTokens = estimateTokens(`${BLOCK_SYSTEM_PROMPT}\n${userPrompt}\n${block.content}`)
      if (blockTokens > MAX_BLOCK_SEQUENCE_TOKENS) {
        report.push(
          `${name}: @arkzen:${block.tag} is approximately ${blockTokens} tokens ` +
          `(limit ${MAX_BLOCK_SEQUENCE_TOKENS}); excluded from block training`
        )
        continue
      }

      blockDataset.push(
        trainingExample(
          BLOCK_SYSTEM_PROMPT,
          userPrompt,
          block.content
        )
      )
    }
  }

  fs.writeFileSync('blocks.jsonl', blockLines.join('\n') + (blockLines.length ? '\n' : ''))
  fs.writeFileSync(DESC_FILE, JSON.stringify(template, null, 2) + '\n')
  fs.writeFileSync('dataset.jsonl', dataset.join('\n') + (dataset.length ? '\n' : ''))
  fs.writeFileSync('block-dataset.jsonl', blockDataset.join('\n') + (blockDataset.length ? '\n' : ''))
  fs.writeFileSync('scan-report.txt', report.length ? report.join('\n') + '\n' : 'No problems found.\n')

  const missing = Object.values(template).filter(entry => !entry.description).length
  console.log(`Tatemonos scanned:             ${names.length}`)
  console.log(`Blocks found:                  ${blockLines.length}`)
  console.log(`Complete-app examples:         ${dataset.length}`)
  console.log(`Apps above ${MAX_APP_SEQUENCE_TOKENS} tokens:    ${oversizedAppExamples}  (included whole; check training context)`)
  console.log(`Block-level examples:          ${blockDataset.length}`)
  console.log(`Missing descriptions:          ${missing}${missing ? '  (fill them in descriptions.json)' : ''}`)
  console.log('Engine validator available:    yes')
  console.log(`Report entries:                ${report.length}  (see scan-report.txt)`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
