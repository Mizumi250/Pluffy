// Static checks on a generated TypeScript project.
import fs from 'node:fs'
import path from 'node:path'
import { builtinModules } from 'node:module'

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else if (entry.name.endsWith('.ts')) out.push(p)
  }
  return out
}

// Everything the code imports: import ... from 'x', import 'x', import('x'), require('x').
export function importSpecifiers(source) {
  const found = new Set()
  const patterns = [
    /\bfrom\s*['"]([^'"\n]+)['"]/g,
    /\bimport\s*['"]([^'"\n]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"\n]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"\n]+)['"]\s*\)/g,
  ]
  for (const re of patterns) for (const m of source.matchAll(re)) found.add(m[1])
  return [...found]
}

function packageOf(specifier) {
  const parts = specifier.split('/')
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

// Returns a list of problems. Empty means the project imports only its own files, Node itself
// and packages it declares. Nothing from Pluffy can be reached.
export function checkTsImports(projectDir) {
  const problems = []
  const pkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'))
  const declared = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})])
  const builtins = new Set(builtinModules.flatMap(m => [m, `node:${m}`]))
  for (const file of [...walk(path.join(projectDir, 'src')), ...walk(path.join(projectDir, 'tests'))]) {
    const rel = path.relative(projectDir, file).split(path.sep).join('/')
    for (const spec of importSpecifiers(fs.readFileSync(file, 'utf8'))) {
      if (/arkzen|pluffy/i.test(spec)) { problems.push(`${rel} imports "${spec}", which points at Pluffy`); continue }
      if (spec.startsWith('.') || spec.startsWith('/')) {
        const base = path.resolve(path.dirname(file), spec)
        const sourceTwin = base.replace(/\.js$/, '.ts')
        if (!fs.existsSync(sourceTwin) && !fs.existsSync(base)) problems.push(`${rel} imports "${spec}", but that file does not exist`)
        continue
      }
      if (spec.startsWith('node:') || builtins.has(spec) || builtins.has(packageOf(spec))) continue
      if (!declared.has(packageOf(spec))) problems.push(`${rel} imports "${spec}", but package.json does not declare ${packageOf(spec)}`)
    }
  }
  return problems
}
