import { connection } from './database'
import { Mailable, sendMail, renderTemplate } from './mail'
import { prefixedTable, sqlNow } from './support'
import { broadcastTo } from './broadcast'
import { Model } from './model'
import * as crypto from 'crypto'

export class MailMessage {
  subject_ = ''; lines: string[] = []; actionText = ''; actionUrl = ''
  subject(s: string) { this.subject_ = s; return this }
  line(s: string)    { this.lines.push(s); return this }
  action(t: string, u: string) { this.actionText = t; this.actionUrl = u; return this }
  html() {
    return this.lines.map(l => `<p>${l}</p>`).join('') + (this.actionUrl ? `<p><a href="${this.actionUrl}">${this.actionText}</a></p>` : '')
  }
}

export class Notification {
  static tatemono = ''
  static channels: string[] = ['database']
  static channelType: 'private' | 'public' | 'presence' = 'private'
  static subject = ''
  static template = ''
  constructor(public notifiable?: any, public data: Record<string, any> = {}) {}
  via(_n: any): string[] { return (this.constructor as typeof Notification).channels }
  toMail(_n: any): MailMessage | null {
    const C = this.constructor as typeof Notification
    if (!C.template && !C.subject) return null
    return new MailMessage().subject(C.subject).line(renderTemplate(C.template, { ...this.data, name: _n?.name, email: _n?.email }))
  }

  toDatabase(_n: any): Record<string, any> { return { type: this.constructor.name, ...this.data } }
  toBroadcast(_n: any): Record<string, any> { return this.toDatabase(_n) }
}

export class DatabaseNotification extends Model {
  static table = ''
  static timestamps = true
  static softDeletes = false
  static fillable = ['id', 'type', 'notifiable_type', 'notifiable_id', 'data', 'read_at']
}

/** $user->notify(new X($user)) equivalent. Table: <prefix>_notifications (Laravel-compatible shape). */
export async function notify(notifiable: any, n: Notification) {
  const slug = (n.constructor as typeof Notification).tatemono
  for (const ch of n.via(notifiable)) {
    if (ch === 'database') {
      const db = connection(slug)
      const t = prefixedTable(slug, 'notifications')
      if (!(await db.schema.hasTable(t))) {
        await db.schema.createTable(t, table => {
          table.string('id').primary()
          table.string('type').notNullable()
          table.string('notifiable_type').notNullable()
          table.integer('notifiable_id').notNullable()
          table.text('data').notNullable()
          table.timestamp('read_at').nullable()
          table.timestamp('created_at').nullable()
          table.timestamp('updated_at').nullable()
        })
      }
      await db(t).insert({
        id: crypto.randomUUID(), type: n.constructor.name, notifiable_type: 'user', notifiable_id: notifiable.id,
        data: JSON.stringify(n.toDatabase(notifiable)), read_at: null, created_at: sqlNow(), updated_at: sqlNow(),
      })
    } else if (ch === 'mail') {
      const m = n.toMail(notifiable)
      if (m && notifiable?.email) {
        const mailable = new Mailable({}); mailable.build = () => ({ subject: m.subject_, html: m.html() })
        await sendMail(notifiable.email, mailable)
      }
    } else if (ch === 'broadcast') {
      const channelType = (n.constructor as typeof Notification).channelType
      const channel = channelType === 'public'
        ? `${slug}.notifications`
        : `${channelType}-${slug}.${notifiable.id}`
      broadcastTo(channel, `${slug}.notification`, n.toBroadcast(notifiable))
    }
  }
}
