// Generates a standalone TypeScript command line program (commander) from a terminal model.
//
// The output depends on commander and Node only. Nothing in it refers to Pluffy (rule 1).
// Layout of the generated project:
//   package.json  tsconfig.json  .gitignore  README.md
//   src/cli.ts       the commander wiring (generated)
//   src/runtime.ts   ctx, value parsers and output helpers (generated)
//   src/commands/    one file per term:handler:ts block, body kept verbatim
//   src/scripts/     one file per term:script:ts block
//   tests/           term:test:ts blocks, plus examples.test.ts (generated from command examples)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { splitArgs } from '../common/shell.js'
import { listFiles, matchGlobs, cleanAssetPath } from '../common/glob.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATES = path.join(HERE, 'templates')

export const COMMANDER_VERSION = '15.1.0'
export const INQUIRER_VERSION = '8.8.1'
const NODE_FLOOR = [22, 12, 0]          // commander 15 requires Node 22.12 or newer
const NODE_FLOOR_PROMPTS = [22, 13, 0]  // @inquirer/prompts 8 requires Node 22.13 or newer

export class GenerateError extends Error {}

const J = value => JSON.stringify(value)

// A prompt command with no handler is generated: it asks the questions and writes the project templates.
function isGenerated(model, cmd) {
  return !!cmd.prompt && !cmd.builtin && !model.handlers.ts?.[cmd.name] && (model.assets?.templates.length ?? 0) > 0
}
const usesPrompts = model => model.commands.some(c => c.prompt && !c.builtin)

// ── what this generator can and cannot build yet ─────────

// Returns { errors, warnings }. An error means the program would be missing something it
// declares, so nothing is generated.
export function checkSupported(model) {
  const errors = [], warnings = []
  if (model.project.mode !== 'cli') {
    errors.push(`mode "${model.project.mode}" needs the terminal UI generator, which is not built yet. Only mode: cli can be generated today.`)
  }
  const generated = model.commands.filter(c => isGenerated(model, c))
  if (generated.length > 1) {
    errors.push(`commands ${generated.map(c => `"${c.name}"`).join(' and ')} would both write the same templates. Give all but one of them a handler.`)
  }
  for (const c of model.commands) {
    if (c.prompt && !c.builtin && !model.prompts.some(p => p.name === c.prompt)) errors.push(`command "${c.name}" uses prompt "${c.prompt}", which is not declared.`)
    if (c.builtin === 'completion') warnings.push(`command "${c.name}" has builtin: completion. Shell completion is not generated yet, so this command is left out.`)
  }
  if (model.assets) {
    if (!model.sourceDir) errors.push('term:assets needs the tatemono folder to find its files (build the model with sourceDir).')
    if (/(^|[\\/])\.\.([\\/]|$)|^[\\/]|^[A-Za-z]:/.test(model.assets.dest)) errors.push(`term:assets dest "${model.assets.dest}" must be a folder inside the project.`)
  }
  const runtime = model.runtimes.ts
  if (runtime && runtime.framework && runtime.framework !== 'commander') {
    errors.push(`ts framework "${runtime.framework}" is not supported by the command line generator. Use commander.`)
  }
  const d = model.declared
  const deferred = []
  if (d.config) deferred.push('term:config (config file and env prefix)')
  if (d.export) deferred.push('term:export (platforms, formats, completions, man page)')
  if (deferred.length) warnings.push(`declared but not generated yet: ${deferred.join(', ')}.`)
  const unused = []
  if (d.theme) unused.push('theme')
  if (d.keymaps) unused.push('keymaps')
  if (d.screens) unused.push('screens')
  if (d.data) unused.push('data')
  if (d.loops) unused.push('loops')
  if (unused.length) warnings.push(`not used by a command line program: ${unused.join(', ')}.`)
  return { errors, warnings }
}

// ── small helpers ────────────────────────────────────────

function parseVersion(text) {
  const m = /^\D*(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(text)
  return m ? [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0)] : null
}
function atLeast(a, b) {
  for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) return a[i] > b[i] }
  return true
}

function npmName(model, runtime) {
  const raw = runtime.packageName ?? model.project.name
  const slug = String(raw).toLowerCase().replace(/[^a-z0-9._~-]+/g, '-').replace(/^[-._]+|[-._]+$/g, '')
  return slug || model.project.binary
}

function parserFor(type) {
  return { int: 'parseInteger', float: 'parseNumber', bool: 'parseBoolean' }[type] ?? null
}

// ── cli.ts ───────────────────────────────────────────────

function argumentCode(arg) {
  const inner = arg.variadic ? `${arg.name}...` : arg.name
  const syntax = arg.required ? `<${inner}>` : `[${inner}]`
  let code = `new Argument(${J(syntax)}, ${J(arg.description)})`
  if (arg.choices) code += `.choices(${J(arg.choices)})`
  else {
    const parser = parserFor(arg.type)
    if (arg.variadic) code += `.argParser(collect(${parser ?? ''}))`
    else if (parser) code += `.argParser(${parser})`
  }
  if (arg.default !== undefined) code += `.default(${J(arg.default)})`
  return code
}

function optionCodes(flag) {
  const short = flag.short ? `-${flag.short}, ` : ''
  const takesValue = flag.type !== 'bool'
  const syntax = `${short}--${flag.name}${takesValue ? ` <${flag.name}>` : ''}`
  let code = `new Option(${J(syntax)}, ${J(flag.description)})`
  if (flag.choices) code += `.choices(${J(flag.choices)})`
  if (takesValue && flag.repeatable) {
    code += `.argParser(collect(${parserFor(flag.type) ?? ''}))`
    code += `.default(${J(Array.isArray(flag.default) ? flag.default : flag.default === undefined ? [] : [flag.default])})`
  } else {
    const parser = !flag.choices && takesValue ? parserFor(flag.type) : null
    if (parser) code += `.argParser(${parser})`
    // A switch that was not given is false, never undefined.
    if (flag.default !== undefined) code += `.default(${J(flag.default)})`
    else if (flag.type === 'bool') code += '.default(false)'
  }
  if (flag.env) code += `.env(${J(flag.env)})`
  if (flag.required) code += '.makeOptionMandatory()'
  const codes = [code]
  // A switch that is on by default needs a way to turn it off.
  if (flag.type === 'bool' && flag.default === true) codes.push(`new Option(${J(`--no-${flag.name}`)}, ${J(`Turn off --${flag.name}`)})`)
  return codes
}

// The flags a prompt's fallback names, so each answer can also be given without a terminal.
function promptOptionCodes(cmd, prompt) {
  const taken = new Set(cmd.flags.map(f => f.name))
  const codes = []
  for (const step of prompt.steps) {
    const spec = prompt.fallback[step.id]
    if (!spec?.flag) continue
    const name = spec.flag.replace(/^--/, '')
    if (taken.has(name)) continue
    taken.add(name)
    const env = spec.env ? `.env(${J(spec.env)})` : ''
    if (step.type === 'confirm') {
      codes.push(`new Option(${J(`--${name}`)}, ${J(step.message)})${env}`, `new Option(${J(`--no-${name}`)}, ${J(`Answer no: ${step.message}`)})`)
      continue
    }
    let code = `new Option(${J(`--${name} <${name}>`)}, ${J(step.message)})`
    if (step.type === 'number') code += '.argParser(parseNumber)'
    else if (step.type === 'multiselect') code += '.argParser(collectList)'
    else if (step.type === 'select' && step.choices) code += `.choices(${J(step.choices)})`
    codes.push(code + env)
  }
  return codes
}

function helpAfter(model, cmd) {
  const parts = []
  if (cmd.stdin) parts.push('Reads standard input.')
  const codes = Object.entries(cmd.exitCodes)
  if (codes.length) parts.push('Exit codes:\n' + codes.map(([code, meaning]) => `  ${code}  ${meaning}`).join('\n'))
  if (cmd.examples.length) parts.push('Examples:\n' + cmd.examples.map(e => `  $ ${model.project.binary} ${e.cmd}`).join('\n'))
  return parts.length ? '\n' + parts.join('\n\n') + '\n' : ''
}

function buildCli(model, handlerFiles) {
  const lines = []
  const imports = []
  let counter = 0
  const emit = (cmd, parentVar) => {
    if (cmd.builtin === 'completion') return
    const v = `c${counter++}`
    const opts = []
    if (model.project.defaultCommand === cmd.name) opts.push('isDefault: true')
    if (cmd.hidden) opts.push('hidden: true')
    lines.push(`const ${v} = ${parentVar}.command(${J(cmd.leaf)}${opts.length ? `, { ${opts.join(', ')} }` : ''})`)
    lines.push(`${v}.description(${J(cmd.description + (cmd.deprecated ? ' (deprecated)' : ''))})`)
    for (const alias of cmd.aliases) lines.push(`${v}.alias(${J(alias)})`)
    for (const arg of cmd.args) lines.push(`${v}.addArgument(${argumentCode(arg)})`)
    for (const flag of cmd.flags) for (const code of optionCodes(flag)) lines.push(`${v}.addOption(${code})`)
    if (cmd.output && !cmd.flags.some(f => f.name === 'json')) lines.push(`${v}.addOption(new Option('--json', 'Print machine readable JSON'))`)
    const prompt = cmd.prompt && !cmd.builtin ? model.prompts.find(p => p.name === cmd.prompt) : null
    if (prompt) {
      for (const code of promptOptionCodes(cmd, prompt)) lines.push(`${v}.addOption(${code})`)
      lines.push(`${v}.addOption(new Option('--no-input', 'Never ask questions: use flags, environment variables and defaults'))`)
      if (isGenerated(model, cmd)) lines.push(`${v}.addOption(new Option('--force', 'Overwrite files that already exist'))`)
    }
    const after = helpAfter(model, cmd)
    if (after) lines.push(`${v}.addHelpText('after', ${J(after)})`)

    if (cmd.builtin === 'help') {
      lines.push(`${v}.action(() => ${v}.help())`)
    } else if (cmd.builtin === 'version') {
      lines.push(`${v}.action(() => { process.stdout.write(VERSION + '\\n') })`)
    } else {
      const handler = handlerFiles.get(cmd.name)
      let expr
      if (handler) {
        expr = `handler${imports.length}`
        imports.push(`import ${expr} from './commands/${handler.file}.js'`)
      } else {
        const templates = model.assets.templates.map(t => ({ source: cleanAssetPath(t.source), target: t.target, variables: t.variables }))
        expr = `scaffoldHandler(prompts[${J(prompt.name)}].result, ${J(templates)})`
      }
      if (prompt) expr = `withPrompt(prompts[${J(prompt.name)}], ${expr})`
      const spec = { name: cmd.name, args: cmd.args.map(a => a.prop), output: cmd.output, deprecated: cmd.deprecated }
      lines.push(`${v}.action(createAction(${J(spec)}, ${expr}))`)
    }
    lines.push('')
    for (const child of cmd.children) emit(child, v)
  }
  for (const cmd of model.commandTree) emit(cmd, 'program')

  return [
    '#!/usr/bin/env node',
    '// Generated from the terminal blocks of your tatemono. Edit the handlers in src/commands.',
    "import { Argument, Command, Option } from 'commander'",
    "import { collect, collectList, createAction, parseBoolean, parseInteger, parseNumber, reportError } from './runtime.js'",
    ...(usesPrompts(model) ? ["import { withPrompt } from './prompts.js'", "import { prompts } from './prompt-defs.js'"] : []),
    ...(model.commands.some(c => isGenerated(model, c)) ? ["import { scaffoldHandler } from './scaffold.js'"] : []),
    ...imports,
    '',
    `const VERSION = ${J(model.project.version)}`,
    '',
    'const program = new Command()',
    `program.name(${J(model.project.binary)})`,
    `program.description(${J(model.project.description)})`,
    "program.version(VERSION, '-V, --version', 'Print the version')",
    '',
    ...lines,
    'try {',
    '  await program.parseAsync(process.argv)',
    '} catch (error) {',
    '  reportError(error)',
    '}',
    '',
  ].join('\n')
}

// ── project files ────────────────────────────────────────

function packageJson(model, runtime, warnings) {
  const prompts = usesPrompts(model)
  const required = prompts ? NODE_FLOOR_PROMPTS : NODE_FLOOR
  let floor = required
  if (runtime.minVersion) {
    const wanted = parseVersion(runtime.minVersion)
    if (!wanted) warnings.push(`ts min_version "${runtime.minVersion}" is not a version number and was ignored.`)
    else if (atLeast(wanted, required)) floor = wanted
    else warnings.push(`ts min_version ${runtime.minVersion} is below what ${prompts ? `commander ${COMMANDER_VERSION} and @inquirer/prompts ${INQUIRER_VERSION}` : `commander ${COMMANDER_VERSION}`} need, so engines.node was raised to ${required.join('.')}.`)
  }
  const pkg = {
    name: npmName(model, runtime),
    version: model.project.version,
    description: model.project.description || undefined,
    license: model.project.license ?? undefined,
    author: model.project.author ?? undefined,
    homepage: model.project.homepage ?? undefined,
    type: 'module',
    bin: { [model.project.binary]: 'dist/src/cli.js' },
    files: ['dist/src', ...(model.assets && !model.assets.embed ? [model.assets.dest] : [])],
    engines: { node: `>=${floor.join('.')}` },
    scripts: { build: 'tsc', test: 'npm run build && node --test \"dist/tests/**/*.test.js\"', start: 'node dist/src/cli.js' },
    dependencies: { commander: COMMANDER_VERSION, ...(prompts ? { '@inquirer/prompts': INQUIRER_VERSION } : {}), ...runtime.dependencies },
    devDependencies: { '@types/node': '^22.0.0', typescript: '^5.9.0', ...runtime.devDependencies },
  }
  if (runtime.dependencies.commander && runtime.dependencies.commander !== COMMANDER_VERSION) {
    warnings.push(`ts dependencies pins commander to ${runtime.dependencies.commander}. The generated code was written for ${COMMANDER_VERSION}.`)
  }
  return JSON.stringify(pkg, null, 2) + '\n'
}

const TSCONFIG = {
  compilerOptions: {
    target: 'ES2023',
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    strict: true,
    // Handler bodies are written as plain functions, so their parameters are not annotated.
    noImplicitAny: false,
    outDir: 'dist',
    rootDir: '.',
    skipLibCheck: true,
    types: ['node'],
  },
  include: ['src/**/*.ts', 'tests/**/*.ts'],
}

// The asset files this project ships: everything the include globs match, plus every template source.
function resolveAssets(model) {
  const dir = path.join(model.sourceDir, 'assets')
  const all = listFiles(dir)
  const wanted = new Set(matchGlobs(all, model.assets.include))
  for (const t of model.assets.templates) {
    const rel = cleanAssetPath(t.source)
    if (!all.includes(rel)) throw new GenerateError(`template source "${t.source}" does not exist under ${path.relative(process.cwd(), dir) || dir}`)
    wanted.add(rel)
  }
  return [...wanted].sort().map(rel => ({ rel, abs: path.join(dir, rel) }))
}

function assetsModule(model, assetFiles) {
  const embedded = model.assets.embed
    ? JSON.stringify(Object.fromEntries(assetFiles.map(f => [f.rel, fs.readFileSync(f.abs).toString('base64')])), null, 2)
    : 'null'
  return fs.readFileSync(path.join(TEMPLATES, 'assets.ts'), 'utf8')
    .replace("/*__EMBEDDED__*/ null", () => embedded)
    .replace("/*__NAMES__*/ []", () => JSON.stringify(assetFiles.map(f => f.rel)))
    .replace("/*__DEST__*/ 'assets'", () => J(model.assets.dest))
}

function promptDefs(model) {
  const used = new Set(model.commands.filter(c => c.prompt && !c.builtin).map(c => c.prompt))
  const defs = Object.fromEntries(model.prompts.filter(p => used.has(p.name)).map(p => [p.name, {
    name: p.name,
    result: p.result,
    steps: p.steps.map(({ id, prop, type, message, default: def, choices, required, validate, when }) => ({ id, prop, type, message, default: def, choices, required, validate, when })),
    fallback: p.fallback,
  }]))
  return [
    '// Generated from the prompt blocks of your tatemono.',
    "import type { PromptDef } from './prompts.js'",
    '',
    `export const prompts: Record<string, PromptDef> = ${JSON.stringify(defs, null, 2)}`,
    '',
  ].join('\n')
}

function readmeFor(model, runtime) {
  if (model.readme) return model.readme.trim() + '\n'
  const name = model.project.binary
  const rows = model.commands.filter(c => !c.hidden && c.builtin !== 'completion')
    .map(c => `- \`${name} ${c.path.join(' ')}\`: ${c.description || 'no description'}`)
  return [
    `# ${model.project.name}`, '',
    model.project.description || '', '',
    '## Build', '', '```', 'npm install', 'npm run build', '```', '',
    '## Use', '', '```', `node dist/src/cli.js --help`, '```', '',
    ...(rows.length ? ['## Commands', '', ...rows, ''] : []),
    ...(model.project.license ? ['## License', '', model.project.license, ''] : []),
  ].join('\n')
}

function examplesTest(model) {
  const examples = []
  for (const c of model.commands) {
    for (const e of c.examples) {
      examples.push({ label: `${model.project.binary} ${e.cmd}`, args: splitArgs(e.cmd), expectExit: e.expectExit, expectStdout: e.expectStdout, expectStderr: e.expectStderr })
    }
  }
  return fs.readFileSync(path.join(TEMPLATES, 'examples.test.ts'), 'utf8')
    .replace("/*__BINARY__*/ ''", J(model.project.binary))
    .replace("/*__VERSION__*/ ''", J(model.project.version))
    .replace('/*__EXAMPLES__*/ []', JSON.stringify(examples, null, 2))
}

// Rebuilding deletes the old output, so refuse any folder that is not clearly ours to delete: it must
// be empty, or hold a project this generator wrote, and it must not be (or contain, or sit inside)
// the tatemono's own folder.
function assertSafeOutDir(outDir, sourceDir) {
  const out = path.resolve(outDir)
  if (sourceDir) {
    const src = path.resolve(sourceDir)
    const rel = path.relative(src, out)
    const inside = rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
    const contains = !path.relative(out, src).startsWith('..') && !path.isAbsolute(path.relative(out, src))
    if (inside || contains) throw new GenerateError(`the output folder ${out} overlaps the tatemono folder ${src}. Choose another --out.`)
  }
  if (!fs.existsSync(out) || fs.readdirSync(out).length === 0) return
  const cli = path.join(out, 'src', 'cli.ts')
  const ours = fs.existsSync(path.join(out, 'package.json')) && fs.existsSync(cli) && /^#!.*\n\/\/ Generated/.test(fs.readFileSync(cli, 'utf8'))
  if (!ours) throw new GenerateError(`the output folder ${out} is not empty and was not made by this generator, so it was left alone. Choose an empty folder.`)
}

// Removes the previous output but keeps node_modules and the lock file, so a rebuild stays quick.
function clean(outDir) {
  if (!fs.existsSync(outDir)) return
  for (const entry of fs.readdirSync(outDir)) {
    if (entry === 'node_modules' || entry === 'package-lock.json') continue
    fs.rmSync(path.join(outDir, entry), { recursive: true, force: true })
  }
}

function write(outDir, rel, text, files) {
  const target = path.join(outDir, rel)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, text)
  files.push(rel)
}

// Returns { outDir, files, warnings, launch } or throws GenerateError.
export function generateTs(model, outDir) {
  const runtime = model.runtimes.ts
  if (!runtime) throw new GenerateError('this tatemono does not list ts in @arkzen:term:project runtimes')
  const { errors, warnings } = checkSupported(model)
  if (errors.length) throw new GenerateError(errors.join('\n'))

  const handlerFiles = new Map()
  for (const c of model.commands) {
    if (c.builtin) continue
    const handler = model.handlers.ts?.[c.name]
    if (!handler) {
      if (isGenerated(model, c)) continue
      throw new GenerateError(`command "${c.name}" has no @arkzen:term:handler:ts block`)
    }
    handlerFiles.set(c.name, handler)
  }
  const assetFiles = model.assets ? resolveAssets(model) : []

  assertSafeOutDir(outDir, model.sourceDir)
  clean(outDir)
  fs.mkdirSync(outDir, { recursive: true })
  const files = []

  write(outDir, 'package.json', packageJson(model, runtime, warnings), files)
  write(outDir, 'tsconfig.json', JSON.stringify(TSCONFIG, null, 2) + '\n', files)
  write(outDir, '.gitignore', 'node_modules/\ndist/\n', files)
  write(outDir, 'README.md', readmeFor(model, runtime), files)
  write(outDir, 'src/runtime.ts', fs.readFileSync(path.join(TEMPLATES, 'runtime.ts'), 'utf8'), files)
  write(outDir, 'src/cli.ts', buildCli(model, handlerFiles), files)
  if (usesPrompts(model)) {
    write(outDir, 'src/prompts.ts', fs.readFileSync(path.join(TEMPLATES, 'prompts.ts'), 'utf8'), files)
    write(outDir, 'src/prompt-defs.ts', promptDefs(model), files)
  }
  if (model.commands.some(c => isGenerated(model, c))) write(outDir, 'src/scaffold.ts', fs.readFileSync(path.join(TEMPLATES, 'scaffold.ts'), 'utf8'), files)
  if (model.assets) {
    write(outDir, 'src/assets.ts', assetsModule(model, assetFiles), files)
    if (!model.assets.embed) {
      for (const f of assetFiles) {
        const target = path.join(outDir, model.assets.dest, f.rel)
        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.copyFileSync(f.abs, target)
        files.push(`${model.assets.dest}/${f.rel}`)
      }
    }
  }
  for (const handler of handlerFiles.values()) write(outDir, `src/commands/${handler.file}.ts`, handler.raw + '\n', files)
  for (const s of model.scripts.ts ?? []) write(outDir, `src/scripts/${s.name}.ts`, s.raw + '\n', files)
  for (const t of model.tests.ts ?? []) write(outDir, `tests/${t.name}.test.ts`, t.raw + '\n', files)
  write(outDir, 'tests/examples.test.ts', examplesTest(model), files)

  return {
    outDir, files, warnings,
    launch: { cmd: process.execPath, prefix: [path.join(outDir, 'dist', 'src', 'cli.js')] },
  }
}
