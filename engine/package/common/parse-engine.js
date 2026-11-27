// ============================================================
// PLUFF PACKAGE ENGINE BRIDGE v1.0
//
// Derived packages (sdk, types, validators, openapi) are generated from the SAME parsed output
// the backend builders and export-openapi.js use (@arkzen:database, @arkzen:api, @arkzen:routes,
// meta.auth). The parser is TypeScript, so it runs through the tsx that ships in a frontend
// engine's node_modules (the same trick export-openapi.js uses).
//
//   loadDerivedInput({ rootDir, tatName, stack, backend, serverUrl })
//     -> { parsed, doc, backend }      doc = the OpenAPI 3.1 document buildOpenApiDoc() makes
//
// Throws "[pkg] ..." errors that say what to run when no frontend engine is installed.
// ============================================================

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { buildOpenApiDoc, findFrontendDir } from '../../../export-openapi.js'

const fail = message => { throw new Error(`[pkg] ${message}`) }

export function readArkzenConfig(rootDir) {
  try { return JSON.parse(fs.readFileSync(path.join(rootDir, 'arkzen.json'), 'utf8')) } catch { return {} }
}

export function parseWithEngine(rootDir, tatName, stack) {
  const tatPath = path.join(rootDir, 'tatemonos', tatName, 'core.tsx')
  if (!fs.existsSync(tatPath)) fail(`tatemonos/${tatName}/core.tsx not found`)
  const frontendDir = findFrontendDir(path.join(rootDir, 'engine'), stack)
  if (!frontendDir) fail('Derived packages (sdk, types, validators, openapi) read your api and database blocks with the engine parser, which needs a frontend engine with node_modules. Run: node mizumi.js deps install <stack> (for example nextjs)')

  const tsxCli = path.join(frontendDir, 'node_modules', 'tsx', 'dist', 'cli.mjs')
  const outFile = path.join(os.tmpdir(), `pluffy-package-${process.pid}-${Date.now()}.json`)
  const tmpScript = path.join(frontendDir, `__package_tmp_${process.pid}.ts`)
  fs.writeFileSync(tmpScript, [
    `import fs from 'node:fs'`,
    `import { parseTatemono } from './arkzen/core/parser'`,
    `const t: any = parseTatemono(${JSON.stringify(tatPath)})`,
    `fs.writeFileSync(${JSON.stringify(outFile)}, JSON.stringify({ meta: t.meta, databases: t.databases, apis: t.apis, customRoutes: t.customRoutes }))`,
    ``,
  ].join('\n'))
  let result
  try {
    result = spawnSync(process.execPath, [tsxCli, tmpScript], { cwd: frontendDir, stdio: 'pipe', timeout: 90000, encoding: 'utf8', windowsHide: true })
  } finally {
    fs.rmSync(tmpScript, { force: true })
  }
  if (result.status !== 0 || !fs.existsSync(outFile)) {
    const why = `${result.stderr ?? ''}${result.stdout ?? ''}`.split('\n').filter(l => l.trim()).slice(-6).join(' | ')
    fail(`The engine parser failed on ${tatName}: ${why || 'no output'}`)
  }
  try { return JSON.parse(fs.readFileSync(outFile, 'utf8')) } finally { fs.rmSync(outFile, { force: true }) }
}

export function loadDerivedInput({ rootDir, tatName, stack, backend, serverUrl }) {
  const config = readArkzenConfig(rootDir)
  const parsed = parseWithEngine(rootDir, tatName, stack ?? config.activeStack ?? 'nextjs')
  const useBackend = backend ?? config.activeBackend ?? 'laravel'
  const doc = buildOpenApiDoc(parsed, { backend: useBackend, serverUrl, tatName })
  return { parsed, doc, backend: useBackend }
}
