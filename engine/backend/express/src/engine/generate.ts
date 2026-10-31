// Turns an Arkzen payload (variant :ts) into TypeScript source files for one tatemono.
// Mirrors the Laravel builders: same URLs, same response shapes, same class naming.
import * as yaml from 'js-yaml'
import { studly, lcfirst, snake, prefixedTable } from '../runtime/support'

type Any = Record<string, any>
export interface Generated {
  files: Record<string, string>
  registry: { models: string[]; controllers: string[]; tables: string[] }
  warnings: string[]
}

const dec = (b64?: string) => (b64 ? Buffer.from(b64, 'base64').toString('utf-8') : '')
const ind = (body: string, n = 2) => body.split('\n').map(l => (l.trim() ? '  '.repeat(n) + l : l)).join('\n')
const q = (s: string) => JSON.stringify(s)
const pluralize = (w: string) => w.endsWith('y') ? w.slice(0, -1) + 'ies' : w.endsWith('s') ? w + 'es' : w + 's'
const tableToModel = (t: string) => studly(t.replace(/s$/, ''))
const expressPath = (p: string) => p.replace(/\{(\w+)\??\}/g, ':$1')

const IMPORTS = `import {
  Model, QueryBuilder, response, Hash, DB, abort, authorize, dispatch, event, broadcast, Mail, notify, Storage, Log,
  validate, now, Command, Job, Event, Listener, Mailable, Notification, MailMessage, BroadcastEvent, createToken,
  connection, userModelFor, authMiddleware, optionalAuth, roleMiddleware, handle, middleware as wrapMiddleware,
  registerCommand, ValidationException, HttpException, AuthorizationException, ModelNotFoundException,
  type Request, type ResponseFactory,
} from '@pluff/runtime'
`

function parseSections(raws: string[] | undefined): Record<string, Any> {
  const out: Record<string, Any> = {}
  for (const raw of raws ?? []) {
    try {
      const doc = yaml.load(raw) as Any
      if (doc && typeof doc === 'object') for (const [k, v] of Object.entries(doc)) if (v && typeof v === 'object') out[k] = v as Any
    } catch { /* malformed section: skipped, the parser reports DSL errors */ }
  }
  return out
}

function findDatabaseForModel(dbs: Any[], model: string): Any | null {
  const snk = snake(model)
  for (const db of dbs) {
    if (model.toLowerCase() === db.table.replace(/s$/, '')) return db
    if (snk + 's' === db.table || snk === db.table) return db
  }
  return dbs[0] ?? null
}

/** A DSL job/console body may be the whole `handle()` method or just its statements. */
function methodBody(body: string, name: string, ret: string): string {
  const b = body.trim()
  if (new RegExp(`^(async\\s+)?${name}\\s*\\(`).test(b)) return ind(b.startsWith('async') ? b : 'async ' + b, 1)
  return `  async ${name}()${ret} {\n${ind(b, 2)}\n  }`
}

export function generate(p: Any): Generated {
  const slug: string = p.name
  const dbs: Any[] = p.databases ?? []
  const apis: Any[] = p.apis ?? []
  const warnings: string[] = []
  const files: Record<string, string> = {}
  const hasAuth = !!p.auth
  const T = (raw: string) => prefixedTable(slug, raw)

  const jobs   = parseSections(p.jobs)
  const events = parseSections(p.events)
  const consoles = parseSections(p.consoles)
  const notifs = parseSections(p.notifications)
  const mails  = parseSections(p.mails)
  const realtimes = parseSections(p.realtimes)

  // ── models ─────────────────────────────────────────────
  const modelNames = new Map<string, string>()      // table -> class
  for (const api of apis) { const db = findDatabaseForModel(dbs, api.model); if (db) modelNames.set(db.table, api.model) }
  for (const db of dbs) if (!modelNames.has(db.table)) modelNames.set(db.table, tableToModel(db.table))

  const castMap: Any = { boolean: 'boolean', integer: 'integer', bigInteger: 'integer', decimal: 'decimal:2', float: 'float', json: 'array', date: 'date', datetime: 'datetime', timestamp: 'datetime' }
  let models = `// ARKZEN GENERATED MODELS: ${slug} (Express). Do not edit.\n${IMPORTS}\n`
  if (hasAuth) models += `export const User = userModelFor(${q(slug)})\n\n`
  for (const db of dbs) {
    const cls = modelNames.get(db.table)!
    const cols: Any = db.columns ?? {}
    const fillable = Object.entries(cols).filter(([, c]: any) => !c.primary).map(([n]) => q(n)).join(', ')
    const casts = Object.entries(cols).filter(([, c]: any) => castMap[c.type ?? 'string']).map(([n, c]: any) => `${q(n)}: ${q(castMap[c.type])}`).join(', ')
    const rels: string[] = []
    for (const [n, c] of Object.entries(cols) as [string, Any][]) {
      if (!c.foreign) continue
      const [refTable] = String(c.foreign).split('.')
      rels.push(`  ${n.replace('_id', '')}() { return this.belongsTo(${modelNames.get(refTable) ?? tableToModel(refTable)}, ${q(n)}) }`)
    }
    for (const other of dbs) {
      if (other.table === db.table) continue
      for (const [col, cfg] of Object.entries(other.columns ?? {}) as [string, Any][]) {
        if (!cfg.foreign || String(cfg.foreign).split('.')[0] !== db.table) continue
        rels.push(`  ${pluralize(col.replace('_id', ''))}() { return this.hasMany(${modelNames.get(other.table)}, ${q(col)}) }`)
      }
    }
    models += `export class ${cls} extends Model {
  static table = ${q(T(db.table))}
  static connectionName = ${q(slug)}
  static fillable = [${fillable}]
  static casts: Record<string, string> = {${casts}}
  static timestamps = ${db.timestamps !== false}
  static softDeletes = ${!!db.softDeletes}
${rels.join('\n')}
}\n\n`
  }
  files['models.ts'] = models
  const modelImports = `import { ${[...(hasAuth ? ['User'] : []), ...modelNames.values()].join(', ') || 'Model'} } from './models'\n`

  // ── middleware ─────────────────────────────────────────
  const mwSnippets: Any = p.middlewareSnippets ?? {}
  let mw = `// ARKZEN GENERATED MIDDLEWARE: ${slug}\n${IMPORTS}${modelImports}\nexport const middlewareFns: Record<string, (request: Request, response: ResponseFactory, next: () => Promise<any>) => any> = {\n`
  for (const [name, b64] of Object.entries(mwSnippets)) {
    mw += `  ${q(name)}: async (request, response, next) => {\n${ind(dec(b64 as string).trim(), 2)}\n  },\n`
  }
  files['middleware.ts'] = mw + '}\n'

  // ── policies ───────────────────────────────────────────
  const polSnippets: Any = p.policySnippets ?? {}
  let pol = `// ARKZEN GENERATED POLICIES: ${slug}\n${IMPORTS}${modelImports}\n`
  const policyNames: string[] = []
  for (const api of apis.filter(a => a.policy)) {
    const db = findDatabaseForModel(dbs, api.model)
    const owner = ['user_id', 'owner_id', 'created_by', 'author_id'].find(c => db?.columns?.[c])
    const v = lcfirst(api.model)
    const def = `return (${owner ? `user?.id === ${v}.${owner}` : 'false'}) || (user?.role === 'admin')`
    const body = (k: string) => polSnippets[k] && dec(polSnippets[k]).trim() ? dec(polSnippets[k]).trim() : def
    pol += `export class ${api.model}Policy {
  viewAny(user: any) { return true }
  view(user: any, ${v}: any) { return true }
  create(user: any) { return true }
  async update(user: any, ${v}: any) {
${ind(body('update'), 2)}
  }
  async delete(user: any, ${v}: any) {
${ind(body('delete'), 2)}
  }
}\n\n`
    policyNames.push(`${api.model}Policy`)
  }
  files['policies.ts'] = pol

  // ── controllers ────────────────────────────────────────
  const controllerNames: string[] = []
  let ctl = `// ARKZEN GENERATED CONTROLLERS: ${slug}\n${IMPORTS}${modelImports}${policyNames.length ? `import { ${policyNames.join(', ')} } from './policies'\n` : ''}\n`
  const rules = (v: Any = {}) => '{ ' + Object.entries(v).map(([k, r]) => `${q(k)}: ${q(String(r))}`).join(', ') + ' }'

  for (const api of apis) {
    const M: string = api.model
    const v = lcfirst(M)
    const usePolicy = !!api.policy
    const methods: string[] = []
    for (const [name, ep] of Object.entries(api.endpoints ?? {}) as [string, Any][]) {
      const auth = (a: string) => usePolicy ? `    await authorize(request, ${M}Policy, ${q(a)}${a === 'create' ? '' : `, ${v}`})\n` : ''
      const find = `    const ${v} = await ${M}.findOrFail(request.route(${q('id')}))\n`
      const respType = ep.response?.type ?? ''
      let code: string
      switch (name) {
        case 'index': {
          const query = ep.query ?? {}
          const perPage = /default:(\d+)/.exec(String(query.per_page ?? ''))?.[1] ?? '15'
          const filters = Object.keys(query).filter(k => k !== 'search' && k !== 'per_page')
            .map(k => `    if (request.filled(${q(k)})) query.where(${q(k)}, request.input(${q(k)}))\n`).join('')
          const search = query.search !== undefined
            ? `    if (request.filled('search')) {\n      const s = '%' + request.input('search') + '%'\n      query.where((w) => { w.orWhere('name', 'like', s); w.orWhere('description', 'like', s) })\n    }\n` : ''
          const fetch = respType === 'array'
            ? `    return response.json(await query.orderBy('created_at', 'desc').get())\n`
            : `    return response.json(await query.orderBy('created_at', 'desc').paginate(Number(request.input('per_page', ${perPage})), Number(request.input('page', 1)), request.url()))\n`
          code = `    const query = ${M}.query()\n${search}${filters}${fetch}`
          break
        }
        case 'store':
          if (ep.type === 'broadcast') {
            code = `    const validated = await request.validate(${rules(ep.validation)})\n    const message = await ${M}.create(validated)\n    const channelType = validated.channel_type ?? 'public'\n    const userId = (await request.authUser())?.id ?? null\n    broadcast(Object.assign(new MessageSentEvents[channelType](message.toJSON()), { userId }))\n    return response.json(message, 201)\n`
          } else if (ep.type === 'mail_send') {
            code = `    const validated = await request.validate(${rules(ep.validation)})\n    const user = await request.authUser()\n    const Cls = mailClasses[validated.mail]\n    if (!Cls) throw new Error('Unknown mail type: ' + validated.mail)\n    await Mail.to(validated.to).send(new (Cls as any)(...Object.values(validated.data ?? {})))\n    const mailLog = await ${M}.create({ user_id: user?.id ?? null, to_email: validated.to, subject: Cls.subject || validated.mail, mail_class: Cls.name, status: 'sent' })\n    return response.json(mailLog, 201)\n`
          } else if (ep.type === 'notification_trigger') {
            code = `    const validated = await request.validate(${rules(ep.validation)})\n    const user = request.user()\n    const Cls = notificationClasses[validated.notification]\n    if (!Cls) throw new Error('Unknown notification type: ' + validated.notification)\n    await notify(user, new (Cls as any)(user))\n    return response.json({ message: 'Notification triggered successfully', type: validated.notification }, 201)\n`
          } else if (['upload', 'upload_index', 'upload_destroy', 'upload_url'].includes(ep.type)) {
            code = `    return response.json({ message: 'Upload endpoints are not supported on the Express backend yet' }, 501)\n`
          } else {
            code = `${auth('create')}    const validated = await request.validate(${rules(ep.validation)})\n    const ${v} = await ${M}.create(validated)\n    return response.json(${v}, 201)\n`
          }
          break
        case 'show':    code = `${find}    return response.json(${v})\n`; break
        case 'update':  code = `${find}${auth('update')}    const validated = await request.validate(${rules(ep.validation)})\n    await ${v}.update(validated)\n    return response.json(${v})\n`; break
        case 'destroy':
          code = ep.type === 'upload_destroy'
            ? `    return response.json({ message: 'Upload endpoints are not supported on the Express backend yet' }, 501)\n`
            : `${find}${auth('delete')}    await ${v}.delete()\n    return response.json({ message: ${q(ep.response?.value ?? `${M} deleted successfully`)} })\n`
          break
        case 'fileUrl':
          code = `    return response.json({ message: 'Upload endpoints are not supported on the Express backend yet' }, 501)\n`; break
        case 'adminOnly':
          code = `    const user = request.user()\n    const granted = !!user && user.role === 'admin'\n    await ${M}.create({ user_id: user?.id ?? null, action: 'GET /admin-only', role_required: 'admin', granted })\n    if (!granted) return response.json({ message: '✗ Access denied — admin role required' }, 403)\n    return response.json({ message: '✓ Access granted — you are admin' })\n`; break
        case 'userOnly':
          code = `    const user = request.user()\n    await ${M}.create({ user_id: user?.id ?? null, action: 'GET /user-only', role_required: 'user', granted: true })\n    return response.json({ message: '✓ Access granted — open to all authenticated users' })\n`; break
        case 'promote':
          code = `    const user = request.user()\n    await user.update({ role: 'admin' })\n    return response.json({ message: 'Promoted to admin', user: await user.fresh() })\n`; break
        case 'demote':
          code = `    const user = request.user()\n    await user.update({ role: 'user' })\n    return response.json({ message: 'Demoted to user', user: await user.fresh() })\n`; break
        default: {
          const body = dec(ep.body).trim()
          code = body
            ? ind(body, 2) + '\n'
            : `    // Custom endpoint: ${name}\n    // Add @arkzen:endpoint:ts:${name} ... :end to your tatemono to inject logic.\n    return response.json({ message: ${q(`Endpoint ${name} is not implemented yet`)} }, 501)\n`
        }
      }
      methods.push(`  async ${name}(request: Request, response: ResponseFactory): Promise<any> {\n${code}  },`)
    }
    ctl += `export const ${api.controller} = {\n${methods.join('\n')}\n}\n\n`
    controllerNames.push(api.controller)
  }

  // custom routes
  for (const cr of p.customRoutes ?? []) {
    const methods: string[] = []
    for (const r of cr.routes ?? []) {
      const body = dec(r.body).trim()
      methods.push(`  async ${r.handler}(request: Request, response: ResponseFactory, ...params: any[]): Promise<any> {\n${body ? ind(body, 2) : `    return response.json({ message: ${q(`Handler ${r.handler} is not implemented yet`)} }, 501)`}\n  },`)
    }
    ctl += `export const ${cr.controller} = {\n${methods.join('\n')}\n}\n\n`
    controllerNames.push(cr.controller)
  }

  // mail / notification class lookups used by the typed endpoints
  const lookup = (names: string[], suffix: string) => names.flatMap(n => [...new Set([n, n.replace(/_/g, '-')])].map(k => `${q(k)}: ${studly(n)}${suffix}`)).join(', ')
  const mailClasses = lookup(Object.keys(mails), 'Mail')
  const notifClasses = lookup(Object.keys(notifs), 'Notification')
  const needsMsgEvents = apis.some(a => Object.values(a.endpoints ?? {}).some((e: any) => e.type === 'broadcast'))
  ctl += `import { mailClasses } from './mails'\nimport { notificationClasses } from './notifications'\n${needsMsgEvents ? `import { MessageSentEvents } from './realtime'\n` : `const MessageSentEvents: Record<string, any> = {}\n`}`
  files['controllers.ts'] = ctl

  // ── jobs ───────────────────────────────────────────────
  let jb = `// ARKZEN GENERATED JOBS: ${slug}\n${IMPORTS}${modelImports}\n`
  const jobClasses: string[] = []
  for (const [name, cfg] of Object.entries(jobs)) {
    const cls = `${studly(name)}Job`
    const body = dec(cfg.body).trim() || `Log.info('[Arkzen Job] Running: ${cls}', this.data)`
    jb += `export class ${cls} extends Job {
  static tatemono = ${q(slug)}
  queue = ${q(cfg.queue ?? 'default')}
  tries = ${Number(cfg.tries ?? 3)}
  timeout = ${Number(cfg.timeout ?? 60)}
${methodBody(body, 'handle', ': Promise<void>')}
}\n\n`
    jobClasses.push(cls)
  }
  files['jobs.ts'] = jb

  // ── events + listeners ─────────────────────────────────
  let ev = `// ARKZEN GENERATED EVENTS + LISTENERS: ${slug}\n${IMPORTS}${modelImports}\n`
  const eventClasses: string[] = []; const listenerClasses: string[] = []; const listenerMap: Record<string, string[]> = {}
  for (const [name, cfg] of Object.entries(events)) {
    const cls = studly(name)
    ev += `export class ${cls} extends Event { static tatemono = ${q(slug)} }\n`
    eventClasses.push(cls)
    const bodies: Any = (() => { try { return JSON.parse(dec(cfg.listener_bodies) || '{}') } catch { return {} } })()
    for (const l of (Array.isArray(cfg.listeners) ? cfg.listeners : String(cfg.listeners ?? '').split(',')).map((s: string) => String(s).trim()).filter(Boolean)) {
      const body = dec(bodies[l]).trim()
      const stub = `const EventLog = (await import('./models') as any).EventLog\n  if (EventLog) await EventLog.create({ event_name: ${q(name)}, listener: ${q(l)}, payload: JSON.stringify(event.data) })\n  else Log.info('[Arkzen Listener] ${l}', event.data)`
      ev += `export class ${l} extends Listener {\n  async handle(event: ${cls}): Promise<void> {\n${ind(body || stub, 2)}\n  }\n}\n`
      listenerClasses.push(l); (listenerMap[cls] ??= []).push(l)
    }
    ev += '\n'
  }
  files['events.ts'] = ev

  // ── console commands ───────────────────────────────────
  let cm = `// ARKZEN GENERATED COMMANDS: ${slug}\n${IMPORTS}${modelImports}\n`
  const cmdClasses: string[] = []
  for (const [name, cfg] of Object.entries(consoles)) {
    const cls = studly(name)
    const body = dec(cfg.body).trim() || `this.info('[Arkzen:${slug}] Running: ${cfg.signature ?? name}')\nreturn Command.SUCCESS`
    cm += `export class ${cls} extends Command {
  signature = ${q(cfg.signature ?? `${slug}:${name}`)}
  description = ${q(cfg.description ?? '')}
  schedule: string | null = ${cfg.schedule ? q(String(cfg.schedule)) : 'null'}
${methodBody(body, 'handle', ': Promise<number>')}
}\n\n`
    cmdClasses.push(cls)
  }
  files['commands.ts'] = cm

  // ── mail ───────────────────────────────────────────────
  let ml = `// ARKZEN GENERATED MAIL: ${slug}\n${IMPORTS}\n`
  for (const [name, cfg] of Object.entries(mails)) {
    const cls = `${studly(name)}Mail`
    const fields = Object.keys(cfg.data ?? {}).map(f => (f === 'message' ? 'mail_message' : f))
    const tpl = dec(cfg.blade_body) || `<p>${cfg.subject ?? cls}</p>` + fields.map(f => `<p>{{ ${f} }}</p>`).join('')
    ml += `export class ${cls} extends Mailable {
  static subject = ${q(cfg.subject ?? cls)}
  static template = ${q(tpl)}
  constructor(${fields.map(f => `${f}?: any`).join(', ')}) { super({ ${fields.join(', ')} }) }
}\n\n`
  }
  ml += `export const mailClasses: Record<string, typeof Mailable> = { ${mailClasses} }\n`
  files['mails.ts'] = ml

  // ── notifications ──────────────────────────────────────
  let nt = `// ARKZEN GENERATED NOTIFICATIONS: ${slug}\n${IMPORTS}\n`
  for (const [name, cfg] of Object.entries(notifs)) {
    const cls = `${studly(name)}Notification`
    const channels = Array.isArray(cfg.channels) ? cfg.channels : String(cfg.channels ?? 'database').split(',').map((s: string) => s.trim())
    const mailBody = dec(cfg.toMail_body).trim()
    nt += `export class ${cls} extends Notification {
  static tatemono = ${q(slug)}
  static channels = ${JSON.stringify(channels)}
  toDatabase(notifiable: any) { return { message: ${q(cfg.message ?? 'You have a new notification.')}, type: ${q(cls)} } }
${mailBody ? `  toMail(notifiable: any) {\n${ind(mailBody, 2)}\n  }\n` : `  toMail(notifiable: any) { return new MailMessage().subject(${q(cfg.subject ?? cls)}).line(${q(cfg.message ?? 'You have a new notification.')}) }\n`}}\n\n`
  }
  nt += `export const notificationClasses: Record<string, typeof Notification> = { ${notifClasses} }\n`
  files['notifications.ts'] = nt

  // ── realtime (broadcast events) ────────────────────────
  let rt = `// ARKZEN GENERATED REALTIME: ${slug}\n${IMPORTS}\n`
  const bcClasses: string[] = []
  const ids = { public: 'MessageSentPublic', private: 'MessageSentPrivate', presence: 'MessageSentPresence' } as Any
  for (const [name, cfg] of Object.entries(realtimes)) {
    if (!cfg.channel) continue                                     // channel declarations only; auth is handled by /broadcasting/auth
    const type = cfg.type ?? 'public'
    const cls = studly(name)
    const channel = String(cfg.channel).replace(/\.\{id\}$/, '')
    rt += `export class ${cls} extends BroadcastEvent {
  static tatemono = ${q(slug)}
  channelType = ${q(type)} as 'public' | 'private' | 'presence'
  channel = ${q(channel)}
  eventName = ${q(`${slug}.${name}`)}
}\n`
    bcClasses.push(cls)
  }
  const byType = (t: string) => bcClasses.find(c => (realtimes[Object.keys(realtimes).find(n => studly(n) === c)!]?.type ?? 'public') === t)
  rt += `export const MessageSentEvents: Record<string, any> = { ${(['public', 'private', 'presence'] as const).map(t => byType(t) ? `${t}: ${byType(t)}` : '').filter(Boolean).join(', ')} }\n`
  void ids
  files['realtime.ts'] = rt

  // ── auth routes ────────────────────────────────────────
  const prefixOf = `/api/${slug}`
  let rts = `// ARKZEN GENERATED ROUTES: ${slug}\n${IMPORTS}${modelImports}import { Router } from 'express'\nimport * as C from './controllers'\nimport { middlewareFns } from './middleware'\n\n`
  rts += `export function buildRouter(): Router {\n  const r = Router()\n  const S = ${q(slug)}\n  const mw = (name: string) => {\n    if (name === 'auth' || name.startsWith('auth:')) return authMiddleware(S)\n    if (name.startsWith('role:')) return roleMiddleware(...name.slice(5).split(','))\n    const fn = middlewareFns[name]\n    if (!fn) throw new Error('Unknown middleware: ' + name)\n    return wrapMiddleware(S, fn)\n  }\n`
  if (hasAuth) {
    rts += `
  r.post(${q(prefixOf + '/auth/register')}, handle(S, async (request, response) => {
    const v = await request.validate({ name: 'required|string|max:255', email: 'required|email|unique:users,email', password: 'required|string|min:8|confirmed' })
    const user: any = await User.create({ name: v.name, email: v.email, password: Hash.make(v.password) })
    const token = await createToken(S, user.id)
    return response.json({ user, token }, 201)
  }))
  r.post(${q(prefixOf + '/auth/login')}, handle(S, async (request, response) => {
    const v = await request.validate({ email: 'required|email', password: 'required|string' })
    const user: any = await User.where('email', v.email).first()
    if (!user || !Hash.check(v.password, user.password)) throw ValidationException.withMessages({ email: ['The provided credentials are incorrect.'] })
    await user.tokens().delete()
    const token = await createToken(S, user.id)
    return response.json({ user, token })
  }))
  r.post(${q(prefixOf + '/auth/logout')}, authMiddleware(S), handle(S, async (request, response) => {
    await request.user().currentAccessToken().delete()
    return response.json({ message: 'Logged out successfully' })
  }))
  r.get(${q(prefixOf + '/auth/me')}, authMiddleware(S), handle(S, async (request, response) => response.json(request.user())))
  r.post(${q(prefixOf + '/auth/broadcasting/auth')}, authMiddleware(S), handle(S, async (request, response) => {
    const user = request.user()
    const socketId = request.input('socket_id'), channel = request.input('channel_name')
    if (!socketId || !channel) return response.json({ message: 'Missing socket_id or channel_name.' }, 422)
    const { signChannel } = await import('@pluff/runtime')
    if (channel.startsWith(${q(`presence-${slug}`)})) {
      const channelData = JSON.stringify({ user_id: user.id, user_info: { name: user.name ?? user.email } })
      return response.json({ auth: signChannel(socketId, channel, channelData), channel_data: channelData })
    }
    const prefix = ${q(`private-${slug}.`)}
    if (!channel.startsWith(prefix)) return response.json({ message: 'Invalid channel prefix.' }, 403)
    if (Number(channel.slice(prefix.length)) !== Number(user.id)) return response.json({ message: 'Forbidden.' }, 403)
    return response.json({ auth: signChannel(socketId, channel) })
  }))
`
  }
  for (const api of apis) {
    for (const [name, ep] of Object.entries(api.endpoints ?? {}) as [string, Any][]) {
      const chain = (api.middleware ?? []).map((m: string) => `mw(${q(String(m).trim())})`)
      if (['broadcast', 'mail_send'].includes(ep.type) && !chain.length) chain.push('optionalAuth(S)')
      rts += `  r.${String(ep.method ?? 'GET').toLowerCase()}(${q(expressPath(`${api.prefix ?? ''}${ep.route ?? ''}`))}${chain.length ? ', ' + chain.join(', ') : ''}, handle(S, (rq, rs) => C.${api.controller}.${name}(rq, rs)))\n`
    }
  }
  for (const cr of p.customRoutes ?? []) {
    const chain = (cr.middleware ?? []).map((m: string) => `mw(${q(String(m).trim())})`)
    for (const r of cr.routes ?? []) {
      rts += `  r.${String(r.method ?? 'GET').toLowerCase()}(${q(expressPath(r.route))}${chain.length ? ', ' + chain.join(', ') : ''}, handle(S, (rq, rs) => C.${cr.controller}.${r.handler}(rq, rs, ...Object.values(rq.route() as any))))\n`
    }
  }
  rts += `  return r\n}\n`
  files['routes.ts'] = rts

  // ── module entry ───────────────────────────────────────
  const imp = (names: string[], file: string) => names.length ? `import { ${names.join(', ')} } from ${q('./' + file)}\n` : ''
  files['index.ts'] = `// ARKZEN GENERATED MODULE ENTRY: ${slug}\n` +
    `import { registerCommand, type LoadedModule } from '@pluff/runtime'\nimport { buildRouter } from './routes'\n` +
    imp(jobClasses, 'jobs') + imp([...eventClasses, ...listenerClasses], 'events') + imp(cmdClasses, 'commands') +
    `\nexport const name = ${q(slug)}\nexport const router = buildRouter()\n` +
    `export const jobs: LoadedModule['jobs'] = { ${jobClasses.join(', ')} }\n` +
    `export const listeners: LoadedModule['listeners'] = { ${listenerClasses.join(', ')} }\n` +
    `export const events: LoadedModule['events'] = { ${eventClasses.join(', ')} }\n` +
    `export const listenerMap: LoadedModule['listenerMap'] = ${JSON.stringify(listenerMap)}\n` +
    `export const commands = [${cmdClasses.join(', ')}]\n`

  return { files, registry: { models: [...modelNames.values(), ...(hasAuth ? ['User'] : [])], controllers: controllerNames, tables: dbs.map(d => T(d.table)) }, warnings }
}
