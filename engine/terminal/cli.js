#!/usr/bin/env node
// Pluffy terminal engine: builds, checks and verifies command line programs from @arkzen:term blocks.
//
//   node engine/terminal/cli.js build <tatemono> [--lang=ts] [--out=<dir>] [--no-install] [--no-verify]
//   node engine/terminal/cli.js verify <tatemono> [--lang=ts] [--out=<dir>]
//   node engine/terminal/cli.js check <tatemono>
//   node engine/terminal/cli.js deps
import path from 'node:path'
import fs from 'node:fs'
import { readTatemono, ROOT_DIR, TERMINAL_DIR } from './common/read.js'
import { buildModel } from './common/model.js'
import { verifyCli, verifyPrompts } from './common/verify.js'
import { runNpm } from './common/run.js'
import { generateTs, GenerateError } from './ts/generator.js'
import { installAndBuild } from './ts/build.js'
import { checkTsImports } from './ts/checks.js'

const GENERATORS = { ts: { generate: generateTs, build: installAndBuild, imports: checkTsImports } }

const colors = process.stdout.isTTY && !process.env.NO_COLOR
const paint = (code, text) => (colors ? `\u001b[${code}m${text}\u001b[0m` : text)
const MARK = { PASS: paint(32, '✓'), FAIL: paint(31, '✗'), UNVERIFIED: paint(33, '~') }

function parseArgs(argv) {
  const positional = [], flags = {}
  for (const arg of argv) {
    const m = /^--([a-z-]+)(?:=(.*))?$/.exec(arg)
    if (m) flags[m[1]] = m[2] ?? true
    else positional.push(arg)
  }
  return { positional, flags }
}

function printSteps(steps, indent = '    ') {
  for (const s of steps) {
    console.log(`${indent}${MARK[s.status]} ${s.name}${s.status === 'UNVERIFIED' ? paint(33, ' (UNVERIFIED)') : ''}`)
    if (s.detail) for (const line of s.detail.split('\n')) console.log(`${indent}    ${paint(90, line)}`)
  }
}

function outDirFor(tatemono, lang, flags) {
  return flags.out ? path.resolve(flags.out) : path.join(ROOT_DIR, 'projects', 'terminal', tatemono, lang)
}

async function load(target) {
  const read = await readTatemono(target)
  for (const w of read.warnings) console.log(`  ${paint(33, '!')} ${w}`)
  if (!read.valid) {
    console.log(paint(31, `✗ ${target} is not valid:`))
    for (const e of read.errors) console.log(`    ${e}`)
    process.exitCode = 1
    return null
  }
  if (!read.parsed.term) {
    console.log(paint(31, `✗ ${target} has no @arkzen:term blocks`))
    process.exitCode = 1
    return null
  }
  return { ...read, model: buildModel(read.parsed, { sourceDir: path.dirname(read.file) }) }
}

async function cmdCheck(target) {
  const t = await load(target)
  if (!t) return
  const { project, commands } = t.model
  console.log(`${paint(32, '✓')} ${target}: ${project.binary} ${project.version}, mode ${project.mode}, runtimes ${project.runtimes.join(', ')}, ${commands.length} command(s)`)
}

async function cmdBuild(target, flags, { verifyOnly = false } = {}) {
  const t = await load(target)
  if (!t) return
  const { model } = t
  const langs = flags.lang ? String(flags.lang).split(',') : model.project.runtimes
  let failed = false
  console.log(`${verifyOnly ? 'Verifying' : 'Building'} ${paint(1, model.project.binary)} ${model.project.version} (${model.project.mode})`)

  for (const lang of langs) {
    console.log(`\n  ${paint(1, lang)}`)
    if (!model.project.runtimes.includes(lang)) {
      console.log(`    ${paint(31, '✗')} ${lang} is not listed in the project runtimes`)
      failed = true
      continue
    }
    const gen = GENERATORS[lang]
    if (!gen) {
      console.log(`    ${paint(33, '~')} no generator for ${lang} yet ${paint(33, '(UNVERIFIED)')}`)
      continue
    }
    const outDir = outDirFor(target, lang, flags)
    let result
    if (verifyOnly) {
      if (!fs.existsSync(path.join(outDir, 'package.json'))) {
        console.log(`    ${paint(31, '✗')} nothing built at ${path.relative(ROOT_DIR, outDir)}. Run build first.`)
        failed = true
        continue
      }
      result = { launch: { cmd: process.execPath, prefix: [path.join(outDir, 'dist', 'src', 'cli.js')] }, warnings: [] }
    } else {
      try { result = gen.generate(model, outDir) } catch (e) {
        if (!(e instanceof GenerateError)) throw e
        console.log(`    ${paint(31, '✗')} cannot generate:`)
        for (const line of e.message.split('\n')) console.log(`        ${line}`)
        failed = true
        continue
      }
      console.log(`    ${paint(32, '✓')} generated ${result.files.length} files in ${path.relative(ROOT_DIR, outDir)}`)
      for (const w of result.warnings) console.log(`    ${paint(33, '!')} ${w}`)
    }

    const steps = []
    if (!verifyOnly) steps.push(...await gen.build(outDir, { install: !flags['no-install'] }))
    const built = steps.every(s => s.status === 'PASS') && fs.existsSync(path.join(outDir, 'dist'))
    const problems = gen.imports(outDir)
    steps.push(problems.length
      ? { name: 'imports stay inside the project (no Pluffy)', status: 'FAIL', detail: problems.join('\n') }
      : { name: 'imports stay inside the project (no Pluffy)', status: 'PASS' })
    if (!flags['no-verify'] && built) {
      steps.push(...await verifyCli(model, result.launch))
      steps.push(...await verifyPrompts(model, result.launch))
      const r = await runNpm(['test'], { cwd: outDir })
      steps.push(r.code === 0
        ? { name: 'npm test (your tests and the generated example tests)', status: 'PASS' }
        : { name: 'npm test (your tests and the generated example tests)', status: 'FAIL', detail: (r.stdout + r.stderr).trim().split('\n').slice(-25).join('\n') })
    } else if (!built) {
      steps.push({ name: 'run and verify', status: 'UNVERIFIED', detail: 'the program was not built' })
    }
    printSteps(steps)
    const counts = steps.reduce((acc, s) => ({ ...acc, [s.status]: (acc[s.status] ?? 0) + 1 }), {})
    console.log(`    ${counts.FAIL ? paint(31, 'FAILED') : paint(32, 'OK')}  ${counts.PASS ?? 0} passed, ${counts.FAIL ?? 0} failed, ${counts.UNVERIFIED ?? 0} unverified`)
    if (counts.FAIL) failed = true
  }
  if (failed) process.exitCode = 1
}

async function cmdDeps() {
  const r = await runNpm(['install'], { cwd: TERMINAL_DIR })
  process.stdout.write(r.stdout + r.stderr)
  process.exitCode = r.code === 0 ? 0 : 1
}

const HELP = `Pluffy terminal engine

  build <tatemono>    generate, build and verify the command line program
  verify <tatemono>   run the checks again on what build produced
  check <tatemono>    parse and validate only
  deps                install this engine's own dependencies

  --lang=ts           build one runtime (default: every runtime the project lists)
  --out=<dir>         write somewhere else (default: projects/terminal/<tatemono>/<lang>)
  --no-install        reuse node_modules in the output folder
  --no-verify         build only
`

const { positional, flags } = parseArgs(process.argv.slice(2))
const [command, target] = positional
try {
  if (command === 'build' && target) await cmdBuild(target, flags)
  else if (command === 'verify' && target) await cmdBuild(target, flags, { verifyOnly: true })
  else if (command === 'check' && target) await cmdCheck(target)
  else if (command === 'deps') await cmdDeps()
  else { console.log(HELP); process.exitCode = command ? 1 : 0 }
} catch (error) {
  console.error(paint(31, `✗ ${error instanceof Error ? error.message : error}`))
  process.exitCode = 1
}
