import nodemailer from 'nodemailer'
import { env, Log } from './support'

/** Renders {{ name }} / {{ $name }} / {!! name !!} placeholders (a small Blade-compatible subset). */
export function renderTemplate(tpl: string, data: Record<string, any>): string {
  const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
  const get = (path: string) => path.replace(/^\$/, '').split(/->|\./).reduce((a: any, k) => (a == null ? undefined : a[k]), data)
  return tpl
    .replace(/\{!!\s*([\w$.>-]+)\s*!!\}/g, (_, p) => String(get(p) ?? ''))
    .replace(/\{\{\s*([\w$.>-]+)\s*\}\}/g, (_, p) => esc(get(p)))
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
