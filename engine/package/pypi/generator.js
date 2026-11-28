// ============================================================
// PLUFF PACKAGE GENERATOR: PyPI v1.0
//
// buildPyPackage({ tatemono, pkg, outDir, verify, log }) writes, builds, packs and verifies one authored
// Python package for PyPI.
//
//   1. write    src/<import_name>/ (the src layout), pyproject.toml, README.md, LICENSE, tests/
//   2. build    python -m build  (hatchling), which builds the sdist and then the wheel FROM the sdist
//   3. check    twine check, wheel and sdist contents
//   4. verify   a fresh virtual environment: pip install the WHEEL, import it, check symbols, run the
//               pkg:test blocks (unittest, or pytest when a test imports it), run console commands
//
// Supported here: kind "library" and "cli" written as @arkzen:pkg:source:py:<name> blocks.
// The Python versions of sdk, types, validators and openapi are a later phase.
// A step whose tool is missing is reported UNVERIFIED, never "passed".
// ============================================================

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { licenseText } from '../common/license.js'
import { findPython, makeVenv, toolPython, venvPython } from '../common/pytools.js'
import { run } from '../common/run.js'

const SUPPORTED_KINDS = ['library', 'cli']
const isMap = v => typeof v === 'object' && v !== null && !Array.isArray(v)
const fail = message => { throw new Error(`[pkg:pypi] ${message}`) }
const tail = text => {
  const lines = String(text).trim().split('\n')
  const at = lines.findIndex(l => /^(\w+Error|Error|Traceback)\b/.test(l))
  return (at !== -1 ? lines.slice(Math.max(0, lines.length - 8)) : lines.slice(-8)).join('\n')
}
const step = (steps, name, status, detail = '') => { steps.push({ name, status, detail }); return status }
const writeText = (root, rel, content) => {
  const abs = path.join(root, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content.endsWith('\n') ? content : content + '\n')
}
const toml = value => JSON.stringify(value)   // JSON strings are valid TOML basic strings

// PEP 503 normalised distribution name, and the importable module name derived from it.
export const normalizeDist = name => String(name).toLowerCase().replace(/[-_.]+/g, '-')
export const importNameOf = name => normalizeDist(name).replace(/-/g, '_')

// Semver to PEP 440. 1.2.3 stays 1.2.3; 1.2.3-beta.1 becomes 1.2.3b1; 1.2.3-rc.2 becomes 1.2.3rc2.
export function pep440(version) {
  const m = String(version).match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/)
  if (!m) fail(`version ${JSON.stringify(version)} is not a semver (1.2.3, 1.2.3-beta.1, ...)`)
  const base = `${m[1]}.${m[2]}.${m[3]}`
  const warnings = []
  if (m[5]) warnings.push(`build metadata +${m[5]} was dropped: PyPI rejects local version labels.`)
  if (!m[4]) return { version: base, warnings }
  const pre = m[4].match(/^(alpha|a|beta|b|rc|dev|post)\.?(\d+)$/i)
  if (!pre) fail(`pre-release "${m[4]}" has no PEP 440 form. Use alpha.N, beta.N, rc.N or dev.N (for example 1.0.0-beta.1)`)
  const tag = { alpha: 'a', a: 'a', beta: 'b', b: 'b', rc: 'rc', dev: '.dev', post: '.post' }[pre[1].toLowerCase()]
  return { version: `${base}${tag}${pre[2]}`, warnings }
}

// "requests: >=2" -> requests>=2 ; a list is taken as PEP 508 strings already.
function requirements(value, what) {
  if (value === undefined) return []
  if (Array.isArray(value)) return value.map(String)
  if (!isMap(value)) fail(`${what} must be a mapping (name: range) or a list of requirement strings`)
  return Object.entries(value).map(([name, range]) => {
    const r = String(range ?? '').trim()
    return !r || r === '*' ? name : /^[<>=!~]/.test(r) ? `${name}${r}` : `${name}==${r}`
  })
}

export function planPyPackage({ tatemono, pkg, registry = 'pypi' }) {
  const project = pkg.project
  const target = pkg.targets[registry]
  if (!target) fail(`Package "${pkg.id}" has no @arkzen:pkg:target:${registry} block`)
  if (!SUPPORTED_KINDS.includes(project.kind)) fail(`kind: ${project.kind} on pypi is not implemented yet (supported now: ${SUPPORTED_KINDS.join(', ')})`)
  if (typeof target.name !== 'string' || !/^[A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?$/.test(target.name)) fail('@arkzen:pkg:target:pypi needs name: letters, digits, . _ - (starting and ending with a letter or digit)')
  const sources = pkg.sources.filter(s => s.lang === 'py')
  if (sources.length === 0) fail(`A ${project.kind} needs at least one @arkzen:pkg:source:py:<name> block`)

  const importName = target.import_name ?? importNameOf(target.name)
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(importName)) fail(`The import name "${importName}" is not a valid Python identifier. Set import_name: in @arkzen:pkg:target:pypi`)
  const ver = pep440(project.version ?? tatemono.meta.version ?? '0.0.0')

  // which source becomes __init__.py
  const exp = pkg.exports ?? {}
  const entries = isMap(exp.entries) ? exp.entries : {}
  const named = sources.find(s => s.name === '__init__')
  let entry = named
  if (!entry && typeof entries['.'] === 'string') entry = sources.find(s => s.name === entries['.'])
  if (!entry) entry = sources.find(s => s.header.entry === true)
  if (!entry && sources.length === 1) entry = sources[0]
  if (typeof entries['.'] === 'string' && !sources.some(s => s.name === entries['.'])) fail(`@arkzen:pkg:exports entries "." points at source "${entries['.']}", which does not exist`)
  if (!entry && project.kind === 'library') fail('Several sources and no entry: mark one with entry: true, name one __init__, or add @arkzen:pkg:exports entries "." <name>')
  for (const [subpath, ref] of Object.entries(entries)) {
    if (typeof ref !== 'string') fail(`@arkzen:pkg:exports entries "${subpath}": only a source name is supported for a Python package`)
    if (!sources.some(s => s.name === ref)) fail(`@arkzen:pkg:exports entries "${subpath}" points at source "${ref}", which does not exist`)
  }

  const files = []
  const used = new Set()
  for (const s of sources) {
    let rel
    if (s === entry && s.name !== '__init__') rel = '__init__.py'
    else rel = (s.header.path ?? `${s.name}.py`).replace(/\\/g, '/')
    if (rel.includes('..') || path.isAbsolute(rel) || !rel.endsWith('.py')) fail(`@arkzen:pkg:source:py:${s.name} path must be a relative .py file inside the package`)
    if (used.has(rel)) fail(`Two sources write to ${rel}`)
    used.add(rel)
    files.push({ name: s.name, rel, raw: s.raw })
  }

  const tests = pkg.tests.filter(t => t.lang === 'py').map(t => ({ name: t.name, file: (t.header.path ?? `tests/${t.name.startsWith('test') ? t.name : 'test_' + t.name}.py`).replace(/\\/g, '/'), raw: t.raw }))

  // command-line entry points (kind: cli, or [project.scripts] through exports.bin)
  const scripts = {}
  if (exp.bin !== undefined) {
    if (!isMap(exp.bin)) fail('@arkzen:pkg:exports bin must map a command to a source name')
    for (const [command, ref] of Object.entries(exp.bin)) {
      const [sourceName, fn = 'main'] = String(ref).split(':')
      const file = files.find(f => f.name === sourceName)
      if (!file) fail(`bin "${command}" points at source "${sourceName}", which does not exist`)
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(fn)) fail(`bin "${command}": "${fn}" is not a function name`)
      const module = file.rel === '__init__.py' ? importName : `${importName}.${file.rel.replace(/\.py$/, '').replace(/\//g, '.')}`
      scripts[command] = `${module}:${fn}`
    }
  }
  if (project.kind === 'cli' && Object.keys(scripts).length === 0) fail('A cli package needs exports bin: { <command>: <source name>[:<function>] }')
  if (isMap(target.entry_points)) {
    for (const [group, map] of Object.entries(target.entry_points)) {
      if (!isMap(map)) fail(`entry_points "${group}" must map names to targets`)
      if (group === 'console_scripts') Object.assign(scripts, map)
    }
  }
  return {
    name: target.name, dist: normalizeDist(target.name), importName, version: ver.version, versionWarnings: ver.warnings,
    description: project.description ?? tatemono.meta.description ?? '',
    project, target, files, tests, scripts, entry, typed: target.typed === true, readme: pkg.readme, verifySpec: pkg.verify ?? {},
  }
}

function pyproject(plan) {
  const { project, target } = plan
  const lines = ['[build-system]', 'requires = ["hatchling"]', 'build-backend = "hatchling.build"', '', '[project]']
  lines.push(`name = ${toml(plan.name)}`, `version = ${toml(plan.version)}`)
  if (plan.description) lines.push(`description = ${toml(plan.description)}`)
  lines.push('readme = "README.md"')
  lines.push(`requires-python = ${toml(target.requires_python ?? '>=3.9')}`)
  if (project.license) lines.push(`license = ${toml(project.license)}`, 'license-files = ["LICENSE"]')
  if (project.author) lines.push(`authors = [{ name = ${toml(project.author)} }]`)
  if (Array.isArray(project.keywords) && project.keywords.length) lines.push(`keywords = [${project.keywords.map(toml).join(', ')}]`)
  const classifiers = [...(Array.isArray(target.classifiers) ? target.classifiers : [])]
  if (plan.typed && !classifiers.includes('Typing :: Typed')) classifiers.push('Typing :: Typed')
  if (classifiers.length) lines.push('classifiers = [', ...classifiers.map(c => `  ${toml(c)},`), ']')
  const deps = requirements(target.dependencies, 'dependencies')
  lines.push(deps.length ? `dependencies = [${deps.map(toml).join(', ')}]` : 'dependencies = []')
  const urls = []
  if (project.homepage) urls.push(`Homepage = ${toml(project.homepage)}`)
  if (project.repository) urls.push(`Repository = ${toml(project.repository)}`)
  if (project.bugs) urls.push(`Issues = ${toml(project.bugs)}`)
  if (isMap(target.extras) && Object.keys(target.extras).length) {
    lines.push('', '[project.optional-dependencies]')
    for (const [extra, list] of Object.entries(target.extras)) lines.push(`${extra} = [${requirements(list, `extras.${extra}`).map(toml).join(', ')}]`)
  }
  if (urls.length) lines.push('', '[project.urls]', ...urls)
  if (Object.keys(plan.scripts).length) lines.push('', '[project.scripts]', ...Object.entries(plan.scripts).map(([cmd, ref]) => `${/^[A-Za-z0-9_.-]+$/.test(cmd) ? cmd : toml(cmd)} = ${toml(ref)}`))
  lines.push('', '[tool.hatch.build.targets.wheel]', `packages = ["src/${plan.importName}"]`)
  lines.push('', '[tool.hatch.build.targets.sdist]', 'include = ["/src", "/tests", "/README.md", "/LICENSE", "/pyproject.toml"]')
  return lines.join('\n')
}

function defaultReadme(plan) {
  const lines = [`# ${plan.name}`, '']
  if (plan.description) lines.push(plan.description, '')
  lines.push('## Install', '', '```sh', `pip install ${plan.name}`, '```', '', '## Use', '', '```python', `import ${plan.importName}`, '```', '', 'Generated by [Pluffy](https://github.com/Mizumi250/Pluffy).')
  return lines.join('\n')
}

// python -m zipfile / tarfile list archive members without any extra dependency
function listArchive(py, file, kind) {
  const r = run(py, ['-m', kind === 'wheel' ? 'zipfile' : 'tarfile', '-l', file], { timeout: 60000 })
  if (!r.ok) return null
  return r.stdout.split('\n').map(l => l.trim().split(/\s+/)[0]).filter(Boolean)
}

export function buildPyPackage({ tatemono, pkg, outDir, verify = true, log = () => {}, registry = 'pypi' }) {
  const plan = planPyPackage({ tatemono, pkg, registry })
  const steps = []
  const warnings = [...plan.versionWarnings]
  const staging = `${outDir}.building-${process.pid}`
  fs.rmSync(staging, { recursive: true, force: true })
  fs.mkdirSync(staging, { recursive: true })
  let archive = null

  try {
    // 1. write
    const pkgDir = `src/${plan.importName}`
    for (const f of plan.files) writeText(staging, `${pkgDir}/${f.rel}`, f.raw)
    // every sub-folder of the package is a package: add the empty __init__.py the author did not write
    const dirs = new Set()
    for (const f of plan.files) { let d = path.posix.dirname(f.rel); while (d && d !== '.') { dirs.add(d); d = path.posix.dirname(d) } }
    for (const d of dirs) if (!fs.existsSync(path.join(staging, pkgDir, d, '__init__.py'))) writeText(staging, `${pkgDir}/${d}/__init__.py`, '')
    if (!plan.files.some(f => f.rel === '__init__.py')) writeText(staging, `${pkgDir}/__init__.py`, '')
    if (plan.typed) writeText(staging, `${pkgDir}/py.typed`, '')
    for (const t of plan.tests) writeText(staging, t.file, t.raw)
    writeText(staging, 'pyproject.toml', pyproject(plan))
    writeText(staging, 'README.md', plan.readme ?? defaultReadme(plan))
    if (plan.project.license) {
      const lic = licenseText(plan.project.license, { holder: plan.project.author ?? 'The authors' })
      writeText(staging, 'LICENSE', lic.text)
      if (!lic.complete) warnings.push(`LICENSE for ${plan.project.license} is a placeholder (the full text is not bundled). Replace it before publishing.`)
    } else warnings.push('No license: set in @arkzen:pkg:project, so no LICENSE file was written.')
    step(steps, 'write', 'passed', `${plan.files.length} module(s), pyproject.toml, README${plan.project.license ? ', LICENSE' : ''}`)

    // 2. build
    const py = toolPython()
    if (!py) {
      step(steps, 'build', 'unverified', findPython() ? 'the Python tools are not installed. Run: node mizumi.js deps install package' : 'Python 3.9 or newer was not found, so this package could not be built')
      return finish(false)
    }
    log(`building ${plan.name} ${plan.version} with hatchling`)
    const built = run(py, ['-m', 'build', '--no-isolation', '--outdir', 'dist'], { cwd: staging, timeout: 300000, env: { PIP_DISABLE_PIP_VERSION_CHECK: '1' } })
    if (step(steps, 'build', built.ok ? 'passed' : 'failed', built.ok ? 'sdist, then wheel from the sdist' : tail(built.stderr || built.stdout)) !== 'passed') return finish(false)
    const dist = fs.readdirSync(path.join(staging, 'dist'))
    const wheel = dist.find(f => f.endsWith('.whl'))
    const sdist = dist.find(f => f.endsWith('.tar.gz'))
    if (!wheel || !sdist) { step(steps, 'pack', 'failed', `expected a wheel and an sdist in dist/, found: ${dist.join(', ') || 'nothing'}`); return finish(false) }
    archive = path.join(staging, 'dist', wheel)
    step(steps, 'pack', 'passed', `${wheel} + ${sdist}`)

    // 3. twine check and contents
    const twine = run(py, ['-m', 'twine', 'check', '--strict', ...dist.map(f => path.join('dist', f))], { cwd: staging, timeout: 120000 })
    step(steps, 'twine check', twine.ok ? 'passed' : 'failed', twine.ok ? 'metadata and README are valid for PyPI' : tail(twine.stdout + twine.stderr))
    const wheelFiles = listArchive(py, archive, 'wheel') ?? []
    const sdistFiles = listArchive(py, path.join(staging, 'dist', sdist), 'sdist') ?? []
    const needWheel = [`${plan.importName}/__init__.py`, ...(plan.typed ? [`${plan.importName}/py.typed`] : []), ...plan.files.filter(f => f.rel !== '__init__.py').map(f => `${plan.importName}/${f.rel}`)]
    const missingWheel = needWheel.filter(n => !wheelFiles.includes(n))
    const needSdist = ['pyproject.toml', 'README.md', ...(plan.project.license ? ['LICENSE'] : [])]
    const missingSdist = needSdist.filter(n => !sdistFiles.some(f => f.endsWith(`/${n}`)))
    const hasLicense = !plan.project.license || wheelFiles.some(f => /\.dist-info\/(licenses\/)?LICENSE$/.test(f))
    const bad = [...missingWheel.map(n => `wheel lacks ${n}`), ...missingSdist.map(n => `sdist lacks ${n}`), ...(hasLicense ? [] : ['wheel lacks the LICENSE'])]
    step(steps, 'pack contents', bad.length ? 'failed' : 'passed', bad.length ? bad.join('; ') : `${wheelFiles.length} files in the wheel, ${sdistFiles.length} in the sdist`)

    // 4. fresh virtual environment
    if (!verify) { step(steps, 'verify', 'skipped', '--no-verify'); return finish(true) }
    const venvDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluffy-pyconsumer-'))
    try {
      const venv = makeVenv(venvDir)
      if (!venv.ok) { step(steps, 'install wheel', 'unverified', venv.error); return finish(true) }
      const vpy = venv.python
      const usesPytest = plan.tests.some(t => /\bpytest\b/.test(t.raw))
      const installs = [archive, ...(usesPytest ? ['pytest'] : [])]
      const install = run(vpy, ['-m', 'pip', 'install', '--quiet', '--disable-pip-version-check', ...installs], { timeout: 300000 })
      if (step(steps, 'install wheel', install.ok ? 'passed' : 'failed', install.ok ? 'installed into a fresh virtual environment' : tail(install.stderr || install.stdout)) !== 'passed') return finish(true)

      // import from outside the project folder, so the installed wheel is what loads
      const symbols = Array.isArray(plan.verifySpec.import) ? plan.verifySpec.import : []
      const script = [
        'import importlib, json',
        `m = importlib.import_module(${JSON.stringify(plan.importName)})`,
        `missing = [s for s in ${JSON.stringify(symbols)} if not hasattr(m, s)]`,
        `if missing: raise SystemExit("not exported by " + ${JSON.stringify(plan.importName)} + ": " + ", ".join(missing))`,
        `print(json.dumps({"symbols": ${symbols.length}}))`,
      ].join('\n')
      const imp = run(vpy, ['-c', script], { cwd: venvDir, timeout: 60000 })
      step(steps, 'import in a fresh venv', imp.ok ? 'passed' : 'failed', imp.ok ? `import ${plan.importName}${symbols.length ? `, symbols: ${symbols.join(', ')}` : ''}` : tail(imp.stderr || imp.stdout))

      if (plan.tests.length) {
        const testsDir = path.join(venvDir, 'tests')
        fs.mkdirSync(testsDir, { recursive: true })
        for (const t of plan.tests) writeText(venvDir, t.file, t.raw)
        const r = usesPytest ? run(vpy, ['-m', 'pytest', '-q', 'tests'], { cwd: venvDir, timeout: 180000 }) : run(vpy, ['-m', 'unittest', 'discover', '-s', 'tests', '-v'], { cwd: venvDir, timeout: 180000 })
        step(steps, `tests (${usesPytest ? 'pytest' : 'unittest'}, against the installed wheel)`, r.ok ? 'passed' : 'failed', r.ok ? `${plan.tests.length} test file(s)` : tail(r.stdout + r.stderr))
      }

      const runs = Array.isArray(plan.verifySpec.run) ? plan.verifySpec.run : []
      const commands = Object.keys(plan.scripts)
      if (commands.length) {
        const checks = commands.flatMap(c => (runs.length ? runs.filter(r => !r.command || r.command === c) : [{ args: ['--help'], smoke: true }]).map(r => ({ command: c, ...r })))
        const failures = []
        for (const c of checks) {
          const exe = path.join(venvDir, process.platform === 'win32' ? 'Scripts' : 'bin', process.platform === 'win32' ? `${c.command}.exe` : c.command)
          if (!fs.existsSync(exe)) { failures.push(`${c.command}: pip did not create the command`); continue }
          const r = run(exe, c.args ?? [], { cwd: venvDir, timeout: 30000 })
          const out = `${r.stdout}${r.stderr}`
          if (c.smoke) { if (/Traceback|ModuleNotFoundError|ImportError|SyntaxError/.test(r.stderr)) failures.push(`${c.command} crashed on start: ${r.stderr.trim().split('\n').slice(-1)[0]}`) }
          else if (r.code !== (c.exit ?? 0)) failures.push(`${c.command} ${(c.args ?? []).join(' ')} exited ${r.code}, expected ${c.exit ?? 0}`)
          else if (c.contains !== undefined && !out.includes(c.contains)) failures.push(`${c.command} ${(c.args ?? []).join(' ')}: output does not contain ${JSON.stringify(c.contains)}`)
        }
        step(steps, 'commands run (installed wheel)', failures.length ? 'failed' : 'passed', failures.length ? failures.join('\n') : `${checks.length} command run(s)`)
      }
    } finally {
      fs.rmSync(venvDir, { recursive: true, force: true })
    }
    return finish(true)
  } catch (error) {
    fs.rmSync(staging, { recursive: true, force: true })
    throw error
  }

  function finish(built) {
    const failed = steps.some(s => s.status === 'failed')
    const unverified = steps.some(s => s.status === 'unverified')
    const verified = failed ? 'failed' : (unverified || !built) ? 'unverified' : (steps.some(s => s.name === 'verify') ? 'skipped' : 'passed')
    const sys = findPython()
    const report = { package: plan.name, version: plan.version, registry: 'pypi', verified, steps, warnings, archive: archive ? path.basename(archive) : null, tools: { python: sys?.version ?? null, node: process.version } }
    fs.writeFileSync(path.join(staging, 'PLUFFY_REPORT.json'), JSON.stringify(report, null, 2) + '\n')
    fs.rmSync(outDir, { recursive: true, force: true })
    fs.mkdirSync(path.dirname(outDir), { recursive: true })
    fs.renameSync(staging, outDir)
    return { ...report, outDir, archivePath: archive ? path.join(outDir, 'dist', path.basename(archive)) : null }
  }
}
