import nodemailer from 'nodemailer'
import { env, Log } from './support'

type Scope = Record<string, any>
type Directive = { name: string; arg: string; start: number; end: number }

function lookup(path: string, scopes: Scope[]): any {
  const parts = path.trim().replace(/^\$/, '').split(/->|\./)
  let value: any
  for (let i = scopes.length - 1; i >= 0; i--) {
    if (Object.prototype.hasOwnProperty.call(scopes[i], parts[0])) {
      value = scopes[i][parts.shift()!]
      break
    }
  }
  return parts.reduce((current, key) => current == null ? undefined : current[key], value)
}

function operatorIndex(expression: string, operator: string): number {
  let depth = 0, quote = ''
  for (let i = 0; i <= expression.length - operator.length; i++) {
    const char = expression[i]
    if (quote) {
      if (char === quote && expression[i - 1] !== '\\') quote = ''
    } else if (char === '"' || char === "'") quote = char
    else if (char === '(') depth++
    else if (char === ')') depth--
    else if (depth === 0 && expression.startsWith(operator, i)
      && !(operator === '>' && (expression[i - 1] === '-' || expression[i - 1] === '?'))) return i
  }
  return -1
}

function valueOf(expression: string, scopes: Scope[]): any {
  const value = expression.trim().replace(/^\((.*)\)$/s, '$1').trim()
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) return value.slice(1, -1)
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value)
  const empty = value.match(/^empty\(\s*(.*?)\s*\)$/)
  if (empty) {
    const found = valueOf(empty[1], scopes)
    return found == null || found === false || found === '' || (Array.isArray(found) && !found.length)
  }
  const isset = value.match(/^isset\(\s*(.*?)\s*\)$/)
  if (isset) return valueOf(isset[1], scopes) != null
  return lookup(value, scopes)
}

function testExpression(expression: string, scopes: Scope[]): boolean {
  const value = expression.trim().replace(/^\((.*)\)$/s, '$1').trim()
  let i = operatorIndex(value, '||')
  if (i !== -1) return testExpression(value.slice(0, i), scopes) || testExpression(value.slice(i + 2), scopes)
  i = operatorIndex(value, '&&')
  if (i !== -1) return testExpression(value.slice(0, i), scopes) && testExpression(value.slice(i + 2), scopes)
  if (value.startsWith('!')) return !testExpression(value.slice(1), scopes)
  for (const op of ['===', '!==', '==', '!=', '>=', '<=', '>', '<']) {
    i = operatorIndex(value, op)
    if (i === -1) continue
    const left = valueOf(value.slice(0, i), scopes), right = valueOf(value.slice(i + op.length), scopes)
    switch (op) {
      case '===': return left === right
      case '!==': return left !== right
      case '==': return left == right
      case '!=': return left != right
      case '>=': return left >= right
      case '<=': return left <= right
      case '>': return left > right
      default: return left < right
    }
  }
  return Boolean(valueOf(value, scopes))
}

function findDirective(template: string, from: number): Directive | null {
  const match = /@(if|elseif|else|endif|foreach|endforeach)\b/g
  match.lastIndex = from
  const found = match.exec(template)
  if (!found) return null
  let end = match.lastIndex
  const name = found[1]
  if (['if', 'elseif', 'foreach'].includes(name)) {
    while (/\s/.test(template[end] ?? '')) end++
    if (template[end] !== '(') return { name, arg: '', start: found.index, end }
    let depth = 1, quote = ''
    const open = end++
    for (; end < template.length && depth; end++) {
      const char = template[end]
      if (quote) {
        if (char === quote && template[end - 1] !== '\\') quote = ''
      } else if (char === '"' || char === "'") quote = char
      else if (char === '(') depth++
      else if (char === ')') depth--
    }
    return { name, arg: template.slice(open + 1, end - 1), start: found.index, end }
  }
  return { name, arg: '', start: found.index, end }
}

function renderDirectives(template: string, scopes: Scope[], from = 0, stops: string[] = []): { text: string; next: number; stop?: Directive } {
  let text = '', cursor = from
  while (true) {
    const directive = findDirective(template, cursor)
    if (!directive) return { text: text + template.slice(cursor), next: template.length }
    text += template.slice(cursor, directive.start)
    if (stops.includes(directive.name)) return { text, next: directive.start, stop: directive }

    if (directive.name === 'if') {
      const branches: { matches: boolean; body: string }[] = []
      let condition = testExpression(directive.arg, scopes)
      cursor = directive.end
      while (true) {
        const branch = renderDirectives(template, scopes, cursor, ['elseif', 'else', 'endif'])
        branches.push({ matches: condition, body: branch.text })
        if (!branch.stop) return { text: text + branches.find(item => item.matches)?.body, next: branch.next }
        cursor = branch.stop.end
        if (branch.stop.name === 'elseif') condition = testExpression(branch.stop.arg, scopes)
        else if (branch.stop.name === 'else') {
          const fallback = renderDirectives(template, scopes, cursor, ['endif'])
          branches.push({ matches: true, body: fallback.text })
          cursor = fallback.stop?.end ?? fallback.next
          break
        } else break
      }
      text += branches.find(item => item.matches)?.body ?? ''
      continue
    }

    if (directive.name === 'foreach') {
      const loop = directive.arg.match(/^\s*(.*?)\s+as\s+(?:\$(\w+)\s*=>\s*)?\$(\w+)\s*$/s)
      if (!loop) throw new Error(`Unsupported Blade @foreach expression: ${directive.arg}`)
      const collection = valueOf(loop[1], scopes)
      const entries: [string | number, any][] = Array.isArray(collection)
        ? collection.map((item, index) => [index, item])
        : collection && typeof collection === 'object' ? Object.entries(collection) : []
      const bodyStart = directive.end
      let afterLoop = bodyStart
      for (const [key, value] of entries) {
        const scope: Scope = { [loop[3]]: value }
        if (loop[2]) scope[loop[2]] = key
        const body = renderDirectives(template, [...scopes, scope], bodyStart, ['endforeach'])
        text += renderExpressions(body.text, [...scopes, scope])
        afterLoop = body.stop?.end ?? body.next
      }
      if (!entries.length) {
        const body = renderDirectives(template, scopes, bodyStart, ['endforeach'])
        afterLoop = body.stop?.end ?? body.next
      }
      cursor = afterLoop
      continue
    }

    if (directive.name === 'elseif' || directive.name === 'else' || directive.name === 'endif' || directive.name === 'endforeach') {
      throw new Error(`Unexpected Blade @${directive.name}`)
    }
    cursor = directive.end
  }
}

function renderExpressions(template: string, scopes: Scope[]): string {
  const esc = (value: any) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!))
  return template
    .replace(/\{!!\s*([\w$.-]+(?:->[\w$.-]+)*)\s*!!\}/g, (_, path) => String(lookup(path, scopes) ?? ''))
    .replace(/\{\{\s*([\w$.-]+(?:->[\w$.-]+)*)\s*\}\}/g, (_, path) => esc(lookup(path, scopes)))
}

/** Renders escaped/raw variables and a safe subset of Blade control directives without evaluating PHP. */
export function renderTemplate(tpl: string, data: Record<string, any>): string {
  const scopes = [data]
  const rendered = renderDirectives(tpl.replace(/\{\{--[\s\S]*?--\}\}/g, ''), scopes).text
  return renderExpressions(rendered, scopes)
}

export class Mailable {
  static subject = ''
  static template = ''
  constructor(public data: Record<string, any> = {}) {}
  subject()  { return (this.constructor as typeof Mailable).subject }
  html()     { return renderTemplate((this.constructor as typeof Mailable).template, this.data) }
  /** Override in a :ts body to build fully custom content. */
  build(): { subject: string; html: string } { return { subject: this.subject(), html: this.html() } }
}

let transport: nodemailer.Transporter | null = null
function getTransport() {
  if (transport) return transport
  const mailer = env('MAIL_MAILER', 'log')
  transport = mailer === 'smtp'
    ? nodemailer.createTransport({ host: env('MAIL_HOST'), port: Number(env('MAIL_PORT', '587')), auth: env('MAIL_USERNAME') ? { user: env('MAIL_USERNAME'), pass: env('MAIL_PASSWORD') } : undefined })
    : nodemailer.createTransport({ jsonTransport: true })
  return transport
}

export async function sendMail(to: string, mailable: Mailable) {
  const { subject, html } = mailable.build()
  const info = await getTransport().sendMail({ from: env('MAIL_FROM_ADDRESS', 'hello@example.com'), to, subject, html })
  if (env('MAIL_MAILER', 'log') !== 'smtp') Log.info(`[mail:log] to=${to} subject="${subject}"`)
  return info
}
export const Mail = { to: (address: string) => ({ send: (m: Mailable) => sendMail(address, m) }) }
