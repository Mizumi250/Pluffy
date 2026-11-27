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

const HERE = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATES = path.join(HERE, 'templates')

export const COMMANDER_VERSION = '15.1.0'
const NODE_FLOOR = [22, 12, 0]   // commander 15 requires Node 22.12 or newer

export class GenerateError extends Error {}

const J = value => JSON.stringify(value)

// ── what this generator can and cannot build yet ─────────

// Returns { errors, warnings }. An error means the program would be missing something it
// declares, so nothing is generated.
export function checkSupported(model) {
  const errors = [], warnings = []
  if (model.project.mode !== 'cli') {
    errors.push(`mode "${model.project.mode}" needs the terminal UI generator, which is not built yet. Only mode: cli can be generated today.`)
  }
  for (const c of model.commands) {
    if (c.prompt && !c.builtin) errors.push(`command "${c.name}" uses prompt "${c.prompt}". Prompts are not generated yet, so the command would be missing.`)
    if (c.builtin === 'completion') warnings.push(`command "${c.name}" has builtin: completion. Shell completion is not generated yet, so this command is left out.`)
  }
  const runtime = model.runtimes.ts
  if (runtime && runtime.framework && runtime.framework !== 'commander') {
    errors.push(`ts framework "${runtime.framework}" is not supported by the command line generator. Use commander.`)
  }
  const d = model.declared
  const deferred = []
  if (d.config) deferred.push('term:config (config file and env prefix)')
  if (d.assets) deferred.push('term:assets (bundled files and templates)')
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
    const after = helpAfter(model, cmd)
    if (after) lines.push(`${v}.addHelpText('after', ${J(after)})`)

    if (cmd.builtin === 'help') {
      lines.push(`${v}.action(() => ${v}.help())`)
    } else if (cmd.builtin === 'version') {
      lines.push(`${v}.action(() => { process.stdout.write(VERSION + '\\n') })`)
    } else {
      const handler = handlerFiles.get(cmd.name)
      const id = `handler${imports.length}`
      imports.push(`import ${id} from './commands/${handler.file}.js'`)
      const spec = { name: cmd.name, args: cmd.args.map(a => a.prop), output: cmd.output, deprecated: cmd.deprecated }
      lines.push(`${v}.action(createAction(${J(spec)}, ${id}))`)
    }
    lines.push('')
    for (const child of cmd.children) emit(child, v)
  }
  for (const cmd of model.commandTree) emit(cmd, 'program')

  return [
    '#!/usr/bin/env node',
    '// Generated from the terminal blocks of your tatemono. Edit the handlers in src/commands.',
    "import { Argument, Command, Option } from 'commander'",
    "import { collect, createAction, parseBoolean, parseInteger, parseNumber, reportError } from './runtime.js'",
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
  let floor = NODE_FLOOR
  if (runtime.minVersion) {
    const wanted = parseVersion(runtime.minVersion)
    if (!wanted) warnings.push(`ts min_version "${runtime.minVersion}" is not a version number and was ignored.`)
    else if (atLeast(wanted, NODE_FLOOR)) floor = wanted
    else warnings.push(`ts min_version ${runtime.minVersion} is below what commander ${COMMANDER_VERSION} needs, so engines.node was raised to ${NODE_FLOOR.join('.')}.`)
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
    files: ['dist/src'],
    engines: { node: `>=${floor.join('.')}` },
    scripts: { build: 'tsc', test: 'npm run build && node --test \"dist/tests/**/*.test.js\"', start: 'node dist/src/cli.js' },
    dependencies: { commander: COMMANDER_VERSION, ...runtime.dependencies },
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
    if (!handler) throw new GenerateError(`command "${c.name}" has no @arkzen:term:handler:ts block`)
    handlerFiles.set(c.name, handler)
  }

  clean(outDir)
  fs.mkdirSync(outDir, { recursive: true })
  const files = []

  write(outDir, 'package.json', packageJson(model, runtime, warnings), files)
  write(outDir, 'tsconfig.json', JSON.stringify(TSCONFIG, null, 2) + '\n', files)
  write(outDir, '.gitignore', 'node_modules/\ndist/\n', files)
  write(outDir, 'README.md', readmeFor(model, runtime), files)
  write(outDir, 'src/runtime.ts', fs.readFileSync(path.join(TEMPLATES, 'runtime.ts'), 'utf8'), files)
  write(outDir, 'src/cli.ts', buildCli(model, handlerFiles), files)
  for (const handler of handlerFiles.values()) write(outDir, `src/commands/${handler.file}.ts`, handler.raw + '\n', files)
  for (const s of model.scripts.ts ?? []) write(outDir, `src/scripts/${s.name}.ts`, s.raw + '\n', files)
  for (const t of model.tests.ts ?? []) write(outDir, `tests/${t.name}.test.ts`, t.raw + '\n', files)
  write(outDir, 'tests/examples.test.ts', examplesTest(model), files)

  return {
    outDir, files, warnings,
    launch: { cmd: process.execPath, prefix: [path.join(outDir, 'dist', 'src', 'cli.js')] },
  }
}
