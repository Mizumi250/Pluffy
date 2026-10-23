#!/usr/bin/env node
/**
 * scan.js - builds training data from tatemonos/*/core.tsx
 *
 * Run from the project root:  node scan.js
 *
 * Outputs:
 *   blocks.jsonl        one line per @arkzen block (for inspection / block-level training)
 *   descriptions.json   template: fill each "description" (Step 4), then run again
 *   dataset.jsonl       chat-format training examples (only tatemonos that have a description)
 *   scan-report.txt     tag problems found (unclosed blocks, missing meta, no pages)
 */

const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const TAT_DIR = path.join(ROOT, 'tatemonos')
const DESC_FILE = path.join(ROOT, 'descriptions.json')

const SYSTEM_PROMPT =
  'You generate Pluff tatemono files (core.tsx) using the @arkzen DSL. ' +
  'Output only the complete file, with every block correctly opened and closed.'

// Opening tags look like: /* @arkzen:web:page:index   (closers end with :end)
const OPENER = /\/\*\s*@arkzen:([A-Za-z0-9:_.\-{}+]+)/g

// Inline declarations that have no :end and are not blocks
function isInline(tag) {
  return /^(web|native):page:(lynx:)?layout:/.test(tag) || tag.startsWith('import:')
}

function splitBlocks(src) {
  const blocks = []
  const problems = []
  let m
  OPENER.lastIndex = 0
  while ((m = OPENER.exec(src)) !== null) {
    const tag = m[1]
    if (tag.endsWith(':end') || isInline(tag)) continue

    const start = m.index
    const endMarker = '@arkzen:' + tag + ':end'
    const endIdx = src.indexOf(endMarker, start)
    let end

    if (endIdx !== -1) {
      const close = src.indexOf('*/', endIdx)
      end = close === -1 ? src.length : close + 2
    } else {
      // Shape A (YAML only): closed by the next bare */
      const close = src.indexOf('*/', start)
      if (close === -1) {
        problems.push(`unclosed block: ${tag}`)
        continue
      }
      end = close + 2
    }
    blocks.push({ tag, content: src.slice(start, end) })
  }
  return { blocks, problems }
}

function metaDescription(src) {
  const m = src.match(/\/\*\s*@arkzen:meta\s*\n([\s\S]*?)\*\//)
  if (!m) return ''
  const d = m[1].match(/^description:\s*(.+)$/m)
  return d ? d[1].trim() : ''
}

function main() {
  if (!fs.existsSync(TAT_DIR)) {
    console.error('No tatemonos/ folder here. Run this from the project root.')
    process.exit(1)
  }

  const names = fs
    .readdirSync(TAT_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(n => fs.existsSync(path.join(TAT_DIR, n, 'core.tsx')))
    .sort()

  const existingDesc = fs.existsSync(DESC_FILE)
    ? JSON.parse(fs.readFileSync(DESC_FILE, 'utf8'))
    : {}

  const blockLines = []
  const dataset = []
  const template = {}
  const report = []

  for (const name of names) {
    const src = fs.readFileSync(path.join(TAT_DIR, name, 'core.tsx'), 'utf8')
    const { blocks, problems } = splitBlocks(src)
    const tags = blocks.map(b => b.tag)

    if (!tags.includes('meta')) problems.push('missing @arkzen:meta')
    if (!tags.some(t => /^(web|native):page:/.test(t))) problems.push('no page blocks')

    for (const b of blocks) {
      blockLines.push(JSON.stringify({ tatemono: name, tag: b.tag, content: b.content }))
    }

    const prev = existingDesc[name] || {}
    template[name] = {
      description: prev.description || '',
      meta_description: metaDescription(src),
      blocks: tags,
      lines: src.split('\n').length,
    }

    if (problems.length) report.push(`${name}: ${problems.join('; ')}`)

    const description = (prev.description || '').trim()
    if (description && problems.length === 0) {
      dataset.push(
        JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: description },
            { role: 'assistant', content: src.trim() },
          ],
        })
      )
    }
  }

  fs.writeFileSync('blocks.jsonl', blockLines.join('\n') + '\n')
  fs.writeFileSync(DESC_FILE, JSON.stringify(template, null, 2))
  fs.writeFileSync('dataset.jsonl', dataset.join('\n') + (dataset.length ? '\n' : ''))
  fs.writeFileSync('scan-report.txt', report.length ? report.join('\n') + '\n' : 'No problems found.\n')

  const missing = Object.values(template).filter(t => !t.description).length
  console.log(`Tatemonos scanned:      ${names.length}`)
  console.log(`Blocks found:           ${blockLines.length}`)
  console.log(`Training examples:      ${dataset.length}`)
  console.log(`Missing descriptions:   ${missing}  (fill them in descriptions.json)`)
  console.log(`Files with problems:    ${report.length}  (see scan-report.txt)`)
}

main()
