// ============================================================
// PLUFF PACKAGE KINDS: components, config, assets, template (local), plugin, cli (authored) v1.0
//
// The npm kinds that need no engine parser. Each one returns the same "extras" shape the derived
// kinds use (see derive/index.js), plus a few fields only these kinds need:
//
//   mode             'built' (tsdown) or 'static' (files are shipped as written, nothing is built)
//   jsx              sources are TSX: tsconfig gets jsx: react-jsx and @types/react is used to type-check
//   consumerInstall  extra packages the throwaway verify project installs (react for component packages)
//   pmExtra          fields merged into package.json (peerDependencies, keywords, sideEffects, bin, ...)
//   staticFiles      [{ path, content } | { path, from }] written verbatim into a static package
//   staticExports    { subpath: './file' } for a static package
//   bin              { command: './file' } for a static package (built packages use binEntries)
//
//   deriveLocal({ kind, tatemono, pkg, registry })     components, config, assets, template
//   authoredExtras({ kind, tatemono, pkg, plan })      plugin, cli (their sources are authored, like a library)
// ============================================================

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'tinyglobby'

const isMap = v => typeof v === 'object' && v !== null && !Array.isArray(v)
const fail = kind => message => { throw new Error(`[pkg:npm:${kind}] ${message}`) }
const STACK_IMPORT = /from\s+['"]@\/arkzen\/core|from\s+['"][^'"]*arkzen\/core|adapters\/router|adapters\/Link/

export const LOCAL_KINDS = ['components', 'config', 'assets', 'template']
export const AUTHORED_KINDS = ['library', 'plugin', 'cli']

const baseName = name => String(name).replace(/^@[^/]+\//, '')
const sha256 = buffer => crypto.createHash('sha256').update(buffer).digest('hex')

// ── components ───────────────────────────────────────────────────────────────────
function components({ tatemono, pkg }) {
  const f = fail('components')
  const exp = pkg.exports
  if (!isMap(exp) || !isMap(exp.entries) || Object.keys(exp.entries).length === 0) f('@arkzen:pkg:exports needs entries: { ".": { from: "web:components:<Name>" } }')
  const sources = []
  const entries = []
  const extraFiles = []
  const extraExports = {}
  const shipFiles = []
  const used = new Set()
  const authored = new Map(pkg.sources.filter(s => s.lang === 'ts').map(s => [s.name, s]))

  for (const [subpath, ref] of Object.entries(exp.entries)) {
    if (subpath !== '.' && !subpath.startsWith('./')) f(`entries: subpath "${subpath}" must be "." or start with "./"`)
    const key = subpath === '.' ? 'index' : subpath.replace(/^\.\//, '').replace(/[^A-Za-z0-9_-]+/g, '-')
    if (typeof ref === 'string') {
      const s = authored.get(ref)
      if (!s) f(`entries "${subpath}" points at source "${ref}", which does not exist`)
      const file = (s.header.path ?? `src/${s.name}.${s.header.ext ?? 'tsx'}`).replace(/\\/g, '/')
      sources.push({ name: s.name, file, raw: s.raw, header: s.header })
      entries.push({ subpath, source: s.name, key, file })
      continue
    }
    const from = isMap(ref) ? ref.from : undefined
    const comp = typeof from === 'string' && from.match(/^web:components:([A-Za-z0-9_-]+)$/)
    const style = typeof from === 'string' && from.match(/^web:style:([A-Za-z0-9_-]+)$/)
    if (comp) {
      const raw = tatemono.web.components[comp[1]]
      if (raw === undefined) f(`entries "${subpath}" exports web:components:${comp[1]}, which does not exist in this tatemono`)
      if (STACK_IMPORT.test(raw)) f(`web:components:${comp[1]} imports from the Pluffy stack (arkzen/core or the router adapter), so it cannot be published`)
      let file = `src/${comp[1]}.tsx`
      while (used.has(file)) file = file.replace(/\.tsx$/, '_.tsx')
      used.add(file)
      sources.push({ name: comp[1], file, raw, header: {} })
      entries.push({ subpath, source: comp[1], key, file })
    } else if (style) {
      const css = tatemono.web.styles[style[1]]
      if (css === undefined) f(`entries "${subpath}" exports web:style:${style[1]}, which does not exist in this tatemono`)
      const file = `styles/${style[1]}.css`
      extraFiles.push({ path: file, content: css })
      extraExports[subpath] = `./${file}`
      if (!shipFiles.includes('styles')) shipFiles.push('styles')
    } else f(`entries "${subpath}": from must be web:components:<Name> or web:style:<Name> (got ${JSON.stringify(from)})`)
  }
  if (entries.length === 0) f('A component package needs at least one web:components entry (CSS alone is a kind: assets package)')

  const target = pkg.targets.npm ?? pkg.targets.github ?? {}
  const peers = isMap(target.peer_dependencies) ? target.peer_dependencies : {}
  const usesReact = 'react' in peers
  const imports = Array.isArray(pkg.verify?.import) ? pkg.verify.import : []
  const consumerInstall = usesReact ? [`react@${peers.react}`, `react-dom@${peers['react-dom'] ?? peers.react}`, '@types/react'] : []
  const consumerChecks = []
  if (usesReact && imports.length) {
    const names = imports.filter(n => /^[A-Z]/.test(n))
    consumerChecks.push({
      name: 'render to HTML (react-dom/server)', file: 'check-render.mjs', data: {},
      source: [
        `import * as mod from ${JSON.stringify('__PACKAGE__')}`,
        `import { createElement } from 'react'`,
        `import { renderToString } from 'react-dom/server'`,
        `const rendered = {}`,
        `for (const name of ${JSON.stringify(names)}) {`,
        `  if (typeof mod[name] !== 'function' && typeof mod[name] !== 'object') throw new Error(name + ' is not a component')`,
        `  const html = renderToString(createElement(mod[name], {}))`,
        `  if (typeof html !== 'string') throw new Error(name + ' did not render')`,
        `  rendered[name] = html.length`,
        `}`,
        `console.log(JSON.stringify({ components: Object.keys(rendered).length }))`,
      ].join('\n'),
    })
  }
  const warnings = []
  if (!usesReact) warnings.push('No react in peer_dependencies: components were built and imported but not rendered.')
  return {
    kind: 'components', sources, entries, extraFiles, extraExports, shipFiles,
    jsx: true, consumerInstall, symbols: [], typeSymbols: [], typeSamples: [], consumerChecks, warnings,
    pmExtra: Object.keys(extraExports).some(k => k.endsWith('.css')) ? { sideEffects: ['*.css'] } : {},
    description: 'React components',
  }
}

// ── config ───────────────────────────────────────────────────────────────────────
function config({ pkg }) {
  const f = fail('config')
  const exp = pkg.exports
  if (!isMap(exp) || !isMap(exp.entries) || Object.keys(exp.entries).length === 0) f('@arkzen:pkg:exports needs entries: { ".": <source name> }')
  const sources = new Map(pkg.sources.filter(s => s.lang === 'ts').map(s => [s.name, s]))
  const staticFiles = []
  const staticExports = {}
  const fileOf = new Map()
  for (const s of sources.values()) {
    const ext = s.header.ext ?? 'js'
    if (!s.header.path && ['ts', 'tsx'].includes(ext)) f(`@arkzen:pkg:source:ts:${s.name}: a config package ships its files as written and builds nothing. Use ext: js, or path: <file>.json`)
    const file = (s.header.path ?? `${s.name}.${ext}`).replace(/\\/g, '/')
    if (file.includes('..') || path.isAbsolute(file)) f(`@arkzen:pkg:source:ts:${s.name} path must stay inside the package`)
    if (/\.(ts|tsx)$/.test(file)) f(`${file}: TypeScript would need a build step. A config package ships plain .js / .json / .cjs files`)
    fileOf.set(s.name, file)
    staticFiles.push({ path: file, content: s.raw })
  }
  for (const [subpath, ref] of Object.entries(exp.entries)) {
    if (subpath !== '.' && !subpath.startsWith('./')) f(`entries: subpath "${subpath}" must be "." or start with "./"`)
    if (typeof ref !== 'string' || !fileOf.has(ref)) f(`entries "${subpath}" must name an @arkzen:pkg:source block (found ${JSON.stringify(ref)})`)
    staticExports[subpath] = `./${fileOf.get(ref)}`
  }
  const imports = Array.isArray(pkg.verify?.import) ? pkg.verify.import : []
  const checks = Object.entries(staticExports).map(([subpath, file]) => ({ subpath, file }))
  return {
    kind: 'config', mode: 'static', sources: [], entries: [], staticFiles, staticExports,
    extraFiles: [], extraExports: {}, shipFiles: [...new Set(staticFiles.map(x => x.path.split('/')[0]))],
    symbols: [], typeSymbols: [], typeSamples: [], warnings: [],
    consumerChecks: [{
      name: 'config entries load (installed package)', file: 'check-config.mjs', data: {},
      source: [
        `import fs from 'node:fs'`,
        `import { createRequire } from 'node:module'`,
        `const require = createRequire(import.meta.url)`,
        `const ENTRIES = ${JSON.stringify(checks.map(c => ({ sub: c.subpath === '.' ? '__PACKAGE__' : '__PACKAGE__' + c.subpath.slice(1), json: /\.json$/.test(c.file) })))}`,
        `const WANT = ${JSON.stringify(imports)}`,
        `const found = new Set()`,
        `for (const e of ENTRIES) {`,
        `  if (e.json) { JSON.parse(fs.readFileSync(require.resolve(e.sub), 'utf8')); continue }`,
        `  const mod = await import(e.sub)`,
        `  for (const k of Object.keys(mod)) found.add(k)`,
        `  if (mod.default && typeof mod.default === 'object') for (const k of Object.keys(mod.default)) found.add(k)`,
        `}`,
        `for (const w of WANT) if (!found.has(w)) throw new Error('symbol ' + w + ' is not exported by any entry')`,
        `console.log(JSON.stringify({ entries: ENTRIES.length }))`,
      ].join('\n'),
    }],
    description: 'Shared configuration',
  }
}

// ── assets ───────────────────────────────────────────────────────────────────────
function assets({ tatemono, pkg }) {
  const f = fail('assets')
  const spec = pkg.assets ?? {}
  const include = spec.include
  if (!Array.isArray(include) || include.length === 0) f('@arkzen:pkg:assets needs include: a list of files or globs under tatemonos/<name>/assets/')
  const root = path.join(tatemono.dir, 'assets')
  if (!fs.existsSync(root)) f(`${path.relative(process.cwd(), root) || root} does not exist. Put the files to ship in tatemonos/<name>/assets/`)
  const dest = String(spec.dest ?? 'assets').replace(/^\.?\/+|\/+$/g, '')
  if (!dest || dest.includes('..')) f('dest must be a relative folder name inside the package')
  const found = globSync(include, { cwd: root, onlyFiles: true, dot: false }).sort()
  if (found.length === 0) f(`include matched no file under ${root}`)
  if (found.length > 2000) f(`include matched ${found.length} files; a package of more than 2000 files is almost certainly a mistake`)
  const files = found.map(rel => ({ rel, abs: path.join(root, rel), hash: sha256(fs.readFileSync(path.join(root, rel))) }))
  const extraFiles = files.map(x => ({ path: `${dest}/${x.rel}`, from: x.abs }))
  const warnings = []
  if (spec.optimize !== undefined) warnings.push('@arkzen:pkg:assets optimize is not implemented yet and was ignored: files are shipped byte for byte.')

  const out = {
    kind: 'assets', extraFiles, extraExports: { [`./${dest}/*`]: `./${dest}/*` }, shipFiles: [dest],
    symbols: [], typeSymbols: [], typeSamples: [], warnings,
    consumerChecks: [{
      name: 'asset files are byte-identical (installed package)', file: 'check-assets.mjs', data: {},
      source: [
        `import crypto from 'node:crypto'`,
        `import fs from 'node:fs'`,
        `import { createRequire } from 'node:module'`,
        `const require = createRequire(import.meta.url)`,
        `const FILES = ${JSON.stringify(files.map(x => ({ rel: x.rel, hash: x.hash })))}`,
        `for (const f of FILES) {`,
        `  const file = require.resolve(${JSON.stringify('__PACKAGE__/' + dest + '/')} + f.rel)`,
        `  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')`,
        `  if (hash !== f.hash) throw new Error(f.rel + ' was changed in the package')`,
        `}`,
        `console.log(JSON.stringify({ files: FILES.length }))`,
      ].join('\n'),
    }],
    description: `${files.length} asset file(s)`,
  }
  if (spec.index === true) {
    const names = Object.fromEntries(files.map(x => [x.rel, `${dest}/${x.rel}`]))
    out.sources = [{ name: 'index', file: 'src/index.ts', header: {}, raw: [
      `// Generated by Pluffy from @arkzen:pkg:assets. Maps each asset name to its path inside the package.`,
      `export const assets = ${JSON.stringify(names, null, 2)} as const`,
      `export type AssetName = keyof typeof assets`,
      `/** Package-relative path of an asset, for example "${dest}/${files[0].rel}". */`,
      `export function assetPath(name: AssetName): string {`,
      `  return assets[name]`,
      `}`,
    ].join('\n') }]
    out.entries = [{ subpath: '.', key: 'index', file: 'src/index.ts' }]
    out.symbols = ['assets', 'assetPath']
  } else {
    out.mode = 'static'
    out.sources = []
    out.entries = []
    out.staticFiles = []
    out.staticExports = {}
  }
  return out
}

// ── template ─────────────────────────────────────────────────────────────────────
const CREATE_SCRIPT = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'templates', 'create.js.txt'), 'utf8')

function template({ tatemono, pkg }) {
  const f = fail('template')
  const spec = pkg.template ?? {}
  const dirName = String(spec.dir ?? 'template')
  if (dirName.includes('..') || path.isAbsolute(dirName)) f('dir must be a folder name inside tatemonos/<name>/assets/')
  const root = path.join(tatemono.dir, 'assets', dirName)
  if (!fs.existsSync(root)) f(`The template files go in tatemonos/${path.basename(tatemono.dir)}/assets/${dirName}/ (not found)`)
  const ignore = Array.isArray(spec.ignore) ? spec.ignore.map(String) : []
  const globIgnore = ignore.map(p => (p.includes('/') || p.includes('*') ? p : `**/${p}`))
  const found = globSync(['**/*'], { cwd: root, onlyFiles: true, dot: true, ignore: ['**/node_modules/**', ...globIgnore] }).sort()
  if (found.length === 0) f('The template folder has no files')

  const declared = Array.isArray(spec.variables) ? spec.variables : []
  const variables = []
  for (const v of declared) {
    if (!isMap(v) || typeof v.name !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(v.name)) f('every variables entry needs a name (letters, digits, - and _)')
    variables.push({ name: v.name, prompt: v.prompt ?? v.name, ...(v.default !== undefined ? { default: String(v.default) } : {}) })
  }
  if (!variables.some(v => v.name === 'name')) variables.unshift({ name: 'name', prompt: 'Project name' })
  const hints = Array.isArray(spec.post_install) ? spec.post_install.map(String) : []
  const warnings = []
  if (hints.length) warnings.push('post_install lines are printed as hints after the project is created. They are never run.')

  const staticFiles = [{ path: 'bin/create.js', content: CREATE_SCRIPT
    .replace('__VARIABLES__', () => JSON.stringify(variables))
    .replace('__IGNORE__', () => JSON.stringify(ignore))
    .replace('__HINTS__', () => JSON.stringify(hints)) }]
  const expected = []
  for (const rel of found) {
    const parts = rel.split('/')
    const last = parts.pop()
    const stored = last === '.gitignore' ? '_gitignore' : last === '.npmignore' ? '_npmignore' : last
    staticFiles.push({ path: `template/${[...parts, stored].join('/')}`, from: path.join(root, rel) })
    expected.push([...parts, last].join('/'))
  }
  const target = pkg.targets.npm ?? pkg.targets.github ?? {}
  const command = String(spec.bin ?? baseName(target.name ?? pkg.id).replace(/^create-/, 'create-')).trim()
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(command)) f(`bin must be a lowercase command name (got ${JSON.stringify(command)})`)

  const withName = variables.map(v => `--${v.name}=${v.default ?? (v.name === 'name' ? 'demo-app' : 'value-' + v.name)}`)
  if (!withName.some(a => a.startsWith('--name='))) withName.unshift('--name=demo-app')
  const placeholders = found.filter(rel => { const b = fs.readFileSync(path.join(root, rel)); return !b.subarray(0, 8000).includes(0) && /\{\{\s*[A-Za-z0-9_-]+\s*\}\}/.test(b.toString('utf8')) })
  return {
    kind: 'template', mode: 'static', sources: [], entries: [], staticFiles, staticExports: {}, staticBin: { [command]: './bin/create.js' },
    extraFiles: [], extraExports: {}, shipFiles: ['bin', 'template'], symbols: [], typeSymbols: [], typeSamples: [], warnings,
    consumerChecks: [{
      name: 'scaffolder creates a project (installed package)', file: 'check-template.mjs', data: {},
      source: [
        `import fs from 'node:fs'`,
        `import os from 'node:os'`,
        `import path from 'node:path'`,
        `import { createRequire } from 'node:module'`,
        `import { spawnSync } from 'node:child_process'`,
        `const require = createRequire(import.meta.url)`,
        `const bin = require.resolve(${JSON.stringify('__PACKAGE__/bin/create.js')})`,
        `const out = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-')) + '/app'`,
        `const run = extra => spawnSync(process.execPath, [bin, out, '--yes', ...${JSON.stringify(withName)}, ...extra], { encoding: 'utf8' })`,
        `const first = run([])`,
        `if (first.status !== 0) throw new Error('scaffolder failed: ' + (first.stderr || first.stdout))`,
        `const expected = ${JSON.stringify(expected)}`,
        `for (const rel of expected) if (!fs.existsSync(path.join(out, rel))) throw new Error('missing in the new project: ' + rel)`,
        `const left = []`,
        `for (const rel of expected) { const b = fs.readFileSync(path.join(out, rel)); if (!b.subarray(0, 8000).includes(0) && /\\{\\{\\s*[A-Za-z0-9_-]+\\s*\\}\\}/.test(b.toString('utf8'))) left.push(rel) }`,
        `if (left.length) throw new Error('unfilled {{placeholders}} in: ' + left.join(', '))`,
        `const filled = ${JSON.stringify(placeholders)}`,
        `if (filled.length && !filled.some(rel => fs.readFileSync(path.join(out, rel), 'utf8').includes('demo-app'))) throw new Error('the name variable was not substituted')`,
        `const again = run([])`,
        `if (again.status === 0) throw new Error('the scaffolder wrote into a directory that is not empty')`,
        `console.log(JSON.stringify({ files: expected.length }))`,
      ].join('\n'),
    }],
    description: 'Project template',
  }
}

export function deriveLocal({ kind, tatemono, pkg }) {
  if (kind === 'components') return components({ tatemono, pkg })
  if (kind === 'config') return config({ tatemono, pkg })
  if (kind === 'assets') return assets({ tatemono, pkg })
  if (kind === 'template') return template({ tatemono, pkg })
  throw new Error(`[pkg:npm] ${kind} is not a local kind`)
}

// ── plugin and cli: authored sources, extra manifest and checks ──────────────────
const NPM_HOSTS = ['vite', 'eslint', 'tailwind', 'rollup', 'webpack', 'esbuild', 'postcss', 'babel', 'prettier']
const HOST_PACKAGE = { vite: 'vite', eslint: 'eslint', tailwind: 'tailwindcss', rollup: 'rollup', webpack: 'webpack', esbuild: 'esbuild', postcss: 'postcss', babel: '@babel/core', prettier: 'prettier' }
const HOST_KEYWORD = { vite: 'vite-plugin', eslint: 'eslint-plugin', tailwind: 'tailwindcss-plugin', rollup: 'rollup-plugin', webpack: 'webpack-plugin', esbuild: 'esbuild-plugin', postcss: 'postcss-plugin', babel: 'babel-plugin', prettier: 'prettier-plugin' }

function pluginExtras({ pkg, plan }) {
  const f = fail('plugin')
  const spec = pkg.plugin ?? {}
  const host = spec.host
  if (typeof host !== 'string') f('@arkzen:pkg:plugin needs host:')
  if (['laravel', 'maven', 'gradle'].includes(host)) f(`host: ${host} is published through its own registry (packagist / maven), not npm`)
  const warnings = []
  if (!NPM_HOSTS.includes(host)) warnings.push(`host "${host}" has no host-specific contract check; only the export is checked.`)
  const prefix = spec.name_prefix ?? (host === 'vite' ? 'vite-plugin-' : host === 'eslint' ? 'eslint-plugin-' : undefined)
  const bare = baseName(plan.name)
  if (prefix && !bare.startsWith(prefix) && !(host === 'eslint' && plan.name.startsWith('@') && bare === 'eslint-plugin')) {
    f(`The package name "${plan.name}" must start with "${prefix}" (the naming convention for ${host} plugins). Rename it in @arkzen:pkg:target, or set name_prefix`)
  }
  const entry = spec.entry ?? 'default'
  const peerPkg = HOST_PACKAGE[host]
  const pmExtra = { keywords: [...new Set([...(Array.isArray(plan.project.keywords) ? plan.project.keywords : []), ...(HOST_KEYWORD[host] ? [HOST_KEYWORD[host]] : [])])] }
  if (peerPkg && spec.peer_range) pmExtra.peerDependencies = { [peerPkg]: String(spec.peer_range) }
  if (peerPkg && !spec.peer_range) warnings.push(`No peer_range: the package does not declare which ${peerPkg} versions it supports.`)

  const contract = {
    vite: [
      `const plugins = [].concat(typeof exported === 'function' ? exported() : exported)`,
      `if (plugins.length === 0 || !plugins.every(p => p && typeof p.name === 'string' && p.name.length > 0)) throw new Error('a Vite plugin must be an object with a name (or a function returning one)')`,
      `detail.plugins = plugins.map(p => p.name).join(',')`,
    ],
    eslint: [
      `const plugin = exported && typeof exported === 'object' ? exported : mod.plugin ?? mod.default`,
      `if (!plugin || typeof plugin !== 'object' || !(plugin.rules || plugin.configs || plugin.processors)) throw new Error('an ESLint plugin must export an object with rules, configs or processors')`,
      `detail.rules = Object.keys(plugin.rules ?? {}).length`,
    ],
  }[host] ?? [`if (typeof exported !== 'function' && (typeof exported !== 'object' || exported === null)) throw new Error('the entry is neither a function nor an object')`]
  return {
    pmExtra, warnings, symbols: [], typeSymbols: [], typeSamples: [], extraFiles: [], extraExports: {}, shipFiles: [],
    consumerChecks: [{
      name: `${host} plugin contract (installed package)`, file: 'check-plugin.mjs', data: {},
      source: [
        `import * as mod from ${JSON.stringify('__PACKAGE__')}`,
        `const exported = ${JSON.stringify(entry)} === 'default' ? mod.default : mod[${JSON.stringify(entry)}]`,
        `if (exported === undefined) throw new Error('the package does not export ' + ${JSON.stringify(entry)})`,
        `const detail = {}`,
        ...contract,
        `console.log(JSON.stringify(detail))`,
      ].join('\n'),
    }],
  }
}

function cliExtras({ pkg, plan }) {
  const f = fail('cli')
  const bin = pkg.exports?.bin
  if (!isMap(bin) || Object.keys(bin).length === 0) f('@arkzen:pkg:exports needs bin: { <command>: <source name> } for kind: cli')
  const sources = new Map(plan.sources.map(s => [s.name, s]))
  const binEntries = []
  for (const [command, source] of Object.entries(bin)) {
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(command)) f(`bin command "${command}" must be lowercase letters, digits, . _ -`)
    const s = sources.get(source)
    if (!s) f(`bin "${command}" points at source "${source}", which does not exist`)
    binEntries.push({ command, key: `bin-${command.replace(/[^a-z0-9-]/g, '-')}`, file: s.file, source })
  }
  const runs = Array.isArray(pkg.verify?.run) ? pkg.verify.run : []
  const checks = binEntries.flatMap(b => (runs.length ? runs.filter(r => !r.command || r.command === b.command) : [{ args: ['--help'], smoke: true }]).map(r => ({ command: b.command, key: b.key, ...r })))
  return {
    binEntries, pmExtra: {}, warnings: [], symbols: [], typeSymbols: [], typeSamples: [], extraFiles: [], extraExports: {}, shipFiles: [],
    consumerChecks: [{
      name: 'commands run (installed package)', file: 'check-cli.mjs', data: {},
      source: [
        `import fs from 'node:fs'`,
        `import path from 'node:path'`,
        `import { createRequire } from 'node:module'`,
        `import { spawnSync } from 'node:child_process'`,
        `const require = createRequire(import.meta.url)`,
        `const manifest = JSON.parse(fs.readFileSync(require.resolve(${JSON.stringify('__PACKAGE__/package.json')}), 'utf8'))`,
        `const root = path.dirname(require.resolve(${JSON.stringify('__PACKAGE__/package.json')}))`,
        `const CHECKS = ${JSON.stringify(checks)}`,
        `let ran = 0`,
        `for (const c of CHECKS) {`,
        `  const rel = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[c.command]`,
        `  if (!rel) throw new Error('package.json has no bin entry for ' + c.command)`,
        `  const file = path.join(root, rel)`,
        `  if (!fs.readFileSync(file, 'utf8').startsWith('#!')) throw new Error(c.command + ': the file has no #! line, so it cannot run as a command')`,
        `  const r = spawnSync(process.execPath, [file, ...(c.args ?? [])], { encoding: 'utf8', timeout: 30000 })`,
        `  const label = c.command + ' ' + (c.args ?? []).join(' ')`,
        `  if (r.error) throw new Error(label + ': ' + r.error.message)`,
        `  if (c.smoke) { if (/ERR_MODULE_NOT_FOUND|Cannot find module|SyntaxError|ReferenceError/.test(r.stderr)) throw new Error(label + ' crashed on start: ' + r.stderr.split('\\n').slice(0, 3).join(' ')) }`,
        `  else {`,
        `    if (r.status !== (c.exit ?? 0)) throw new Error(label + ' exited ' + r.status + ', expected ' + (c.exit ?? 0) + ': ' + r.stderr.split('\\n')[0])`,
        `    if (c.contains !== undefined && !(r.stdout + r.stderr).includes(c.contains)) throw new Error(label + ': output does not contain ' + JSON.stringify(c.contains))`,
        `  }`,
        `  ran++`,
        `}`,
        `console.log(JSON.stringify({ commands: ran }))`,
      ].join('\n'),
    }],
  }
}

export function authoredExtras({ kind, pkg, plan }) {
  if (kind === 'plugin') return pluginExtras({ pkg, plan })
  if (kind === 'cli') return cliExtras({ pkg, plan })
  return null
}
