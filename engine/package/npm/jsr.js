// ============================================================
// PLUFF PACKAGE GENERATOR: JSR v1.0
//
// buildJsrPackage({ tatemono, pkg, outDir, verify, jsrDryRun, log }) writes a package for jsr.io:
// TypeScript sources shipped as written, a jsr.json, README and LICENSE. JSR builds nothing itself
// (it publishes TypeScript), so there is no tsdown step.
//
// Checked here: sources type-check with tsc (strict), the files in jsr.json exports exist, and the
// sources load and export the declared symbols (run through tsx).
// NOT checked here, reported UNVERIFIED: JSR's own rules ("slow types", explicit exports) and
// `jsr publish --dry-run`, which downloads Deno. Run it yourself with `npx jsr publish --dry-run`
// in the output folder, or pass --jsr-dry-run to run it from here.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { licenseText } from '../common/license.js'
import { npm, run, toolBin, toolVersion } from '../common/run.js'
import { planNpmPackage } from './generator.js'

const JSR_NAME = /^@[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*$/
const step = (steps, name, status, detail = '') => { steps.push({ name, status, detail }); return status }
const tail = text => String(text).trim().split('\n').slice(-6).join('\n')
const write = (root, rel, content) => {
  const abs = path.join(root, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content.endsWith('\n') ? content : content + '\n')
}

export function buildJsrPackage({ tatemono, pkg, outDir, verify = true, jsrDryRun = false, log = () => {} }) {
  if (pkg.project.kind !== 'library') throw new Error(`[pkg:jsr] kind: ${pkg.project.kind} on jsr is not implemented yet (supported now: library)`)
  const plan = planNpmPackage({ tatemono, pkg, registry: 'jsr' })
  if (!JSR_NAME.test(plan.name)) throw new Error(`[pkg:jsr] The JSR name must be @scope/name in lowercase (got ${JSON.stringify(plan.name)})`)
  if (plan.project.license === undefined) throw new Error('[pkg:jsr] JSR needs a license: in @arkzen:pkg:project')

  const steps = []
  const warnings = []
  const staging = `${outDir}.building-${process.pid}`
  fs.rmSync(staging, { recursive: true, force: true })
  fs.mkdirSync(staging, { recursive: true })
  try {
    for (const s of plan.sources) write(staging, s.file, s.raw)
    const exportsMap = Object.fromEntries(plan.entries.map(e => [e.subpath, `./${e.file}`]))
    const jsr = { name: plan.name, version: plan.version, license: plan.project.license, exports: exportsMap, publish: { include: ['src/**/*', 'README.md', 'LICENSE', 'jsr.json'] } }
    write(staging, 'jsr.json', JSON.stringify(jsr, null, 2))
    write(staging, 'README.md', plan.readme ?? `# ${plan.name}\n\n${plan.description}\n\n## Install\n\n\`\`\`sh\nnpx jsr add ${plan.name}\n\`\`\`\n`)
    const lic = licenseText(plan.project.license, { holder: plan.project.author ?? 'The authors' })
    write(staging, 'LICENSE', lic.text)
    if (!lic.complete) warnings.push(`LICENSE for ${plan.project.license} is a placeholder (the full text is not bundled). Replace it before publishing.`)
    write(staging, 'tsconfig.json', JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', strict: true, noEmit: true, allowImportingTsExtensions: true, skipLibCheck: true, types: [] }, include: ['src'] }, null, 2))
    step(steps, 'write', 'passed', `${plan.sources.length} source file(s), jsr.json, README, LICENSE`)

    const missing = Object.values(exportsMap).filter(f => !fs.existsSync(path.join(staging, f)))
    step(steps, 'exports exist', missing.length ? 'failed' : 'passed', missing.length ? `missing: ${missing.join(', ')}` : `${Object.keys(exportsMap).length} entry point(s)`)

    const tsc = toolBin('typescript', 'tsc')
    if (!tsc) step(steps, 'type check sources', 'unverified', 'typescript is not installed (node mizumi.js deps install package)')
    else {
      const r = run(process.execPath, [tsc, '-p', 'tsconfig.json'], { cwd: staging })
      step(steps, 'type check sources', r.ok ? 'passed' : 'failed', r.ok ? `typescript ${toolVersion('typescript')}` : tail(r.stdout + r.stderr))
    }

    if (verify) {
      const tsx = toolBin('tsx')
      const symbols = Array.isArray(plan.verifySpec.import) ? plan.verifySpec.import : []
      if (!tsx) step(steps, 'load and import', 'unverified', 'tsx is not installed (node mizumi.js deps install package)')
      else {
        const script = [
          ...plan.entries.map((e, i) => `import * as m${i} from ${JSON.stringify('./' + e.file)}`),
          `const mods = [${plan.entries.map((_, i) => `m${i}`).join(', ')}]`,
          ...symbols.map(sym => `if (!mods.some(m => (m as Record<string, unknown>)[${JSON.stringify(sym)}] !== undefined)) throw new Error(${JSON.stringify(`symbol ${sym} is not exported by any entry point`)})`),
          `console.log('ok')`,
        ].join('\n')
        write(staging, '.pluffy-check.mts', script)
        const r = run(process.execPath, [tsx, '.pluffy-check.mts'], { cwd: staging })
        fs.rmSync(path.join(staging, '.pluffy-check.mts'), { force: true })
        step(steps, 'load and import', r.ok ? 'passed' : 'failed', r.ok ? `${plan.entries.length} entry point(s)${symbols.length ? `, symbols: ${symbols.join(', ')}` : ''}` : tail(r.stderr || r.stdout))
      }
      if (jsrDryRun) {
        log('running jsr publish --dry-run (downloads Deno on first use)')
        const r = npm(['exec', '--yes', 'jsr', '--', 'publish', '--dry-run', '--allow-dirty'], { cwd: staging, timeout: 600000 })
        step(steps, 'jsr publish --dry-run', r.ok ? 'passed' : 'failed', r.ok ? 'JSR accepted the package' : tail(r.stderr || r.stdout))
      } else {
        step(steps, 'jsr publish --dry-run', 'unverified', 'not run: it downloads Deno. Run `npx jsr publish --dry-run` in the output folder, or pass --jsr-dry-run')
      }
    } else step(steps, 'verify', 'skipped', '--no-verify')
    warnings.push('JSR rules such as "no slow types" (explicit types on every exported symbol) are only checked by jsr publish --dry-run.')
  } catch (error) {
    fs.rmSync(staging, { recursive: true, force: true })
    throw error
  }

  const failed = steps.some(s => s.status === 'failed')
  const unverified = steps.some(s => s.status === 'unverified')
  const verified = failed ? 'failed' : unverified ? 'unverified' : verify ? 'passed' : 'skipped'
  const report = { package: plan.name, version: plan.version, registry: 'jsr', verified, steps, warnings, archive: null, tools: { typescript: toolVersion('typescript'), node: process.version } }
  fs.writeFileSync(path.join(staging, 'PLUFFY_REPORT.json'), JSON.stringify(report, null, 2) + '\n')
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(outDir), { recursive: true })
  fs.renameSync(staging, outDir)
  return { ...report, outDir, archivePath: null }
}
