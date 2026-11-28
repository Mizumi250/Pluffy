// Generated support code: writes project files from templates, using the answers to a prompt.
import fs from 'node:fs'
import path from 'node:path'
import { readAsset } from './assets.js'
import type { Handler } from './runtime.js'

export interface TemplateSpec {
  /** A file in the assets folder. */
  source: string
  /** Where to write it, relative to the current folder. {{name}} is replaced by the answer called name. */
  target: string
  /** The only placeholders that are replaced. Anything else in the file is left alone. */
  variables: string[]
}

function text(value: unknown): string {
  if (value === undefined || value === null) return ''
  return Array.isArray(value) ? value.join(', ') : String(value)
}

export function render(template: string, variables: string[], values: Record<string, unknown>): string {
  let out = template
  for (const name of variables) {
    out = out.replace(new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`, 'g'), () => text(values[name]))
  }
  return out
}

/** Renders every template. It refuses to write outside the current folder and never overwrites without --force. */
export function scaffoldHandler(resultName: string, templates: TemplateSpec[]): Handler {
  return ctx => {
    const answers = ((ctx as unknown as Record<string, unknown>)[resultName] ?? {}) as Record<string, unknown>
    const root = process.cwd()
    const planned = templates.map(t => {
      const rel = render(t.target, t.variables, answers)
      const abs = path.resolve(root, rel)
      const inside = path.relative(root, abs)
      if (inside === '' || inside.startsWith('..') || path.isAbsolute(inside)) {
        throw new Error(`refusing to write "${rel}": it is outside the current folder`)
      }
      return { template: t, abs, rel: inside.split(path.sep).join('/') }
    })

    if (!ctx.flags.force) {
      const existing = planned.filter(p => fs.existsSync(p.abs)).map(p => p.rel)
      if (existing.length > 0) throw new Error(`already exists: ${existing.join(', ')} (use --force to overwrite)`)
    }

    for (const p of planned) {
      const data = readAsset(p.template.source)
      const isText = !data.includes(0)
      fs.mkdirSync(path.dirname(p.abs), { recursive: true })
      fs.writeFileSync(p.abs, isText ? render(data.toString('utf8'), p.template.variables, answers) : data)
      ctx.out.line(`created ${p.rel}`)
    }
  }
}
