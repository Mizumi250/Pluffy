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
const resourceFields = (api: Any) => {
  const columns = api.__database?.columns ?? {}
  const fields = Object.keys(columns).filter(k => !['created_at', 'updated_at', 'deleted_at'].includes(k))
  return `{ id: (v: any) => v.id, ${fields.map(k => `${q(k)}: (v: any) => v[${q(k)}]`).join(', ')}, created_at: (v: any) => v.created_at ?? null, updated_at: (v: any) => v.updated_at ?? null }`
}

const IMPORTS = `import {
  Model, QueryBuilder, response, Hash, DB, abort, authorize, dispatch, event, broadcast, Mail, notify, Storage, Log,
  validate, now, Command, Job, Event, Listener, Mailable, Notification, MailMessage, BroadcastEvent, createToken,
  connection, userModelFor, authMiddleware, optionalAuth, roleMiddleware, authCookie, clearAuthCookie, handle, middleware as wrapMiddleware,
  registerCommand, ValidationException, HttpException, AuthorizationException, ModelNotFoundException,
  resourceTransform, factoryFor, runCommand, type Request, type ResponseFactory,
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
  const hasNotifications = Object.keys(notifs).length > 0
  const mails  = parseSections(p.mails)
  const realtimes = parseSections(p.realtimes)

  // ── models ─────────────────────────────────────────────
  const modelNames = new Map<string, string>()      // table -> class
  for (const api of apis) { const db = findDatabaseForModel(dbs, api.model); if (db) { modelNames.set(db.table, api.model); api.__database = db } }
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
  if (hasNotifications) models += `export class DatabaseNotification extends Model {
  static table = ${q(T('notifications'))}
  static connectionName = ${q(slug)}
  static fillable = ['id', 'type', 'notifiable_type', 'notifiable_id', 'data', 'read_at']
  static timestamps = true
  static softDeletes = false
}\n\n`
  files['models.ts'] = models
  const modelImports = `import { ${[...(hasAuth ? ['User'] : []), ...modelNames.values(), ...(hasNotifications ? ['DatabaseNotification'] : [])].join(', ') || 'Model'} } from './models'\n`

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
  const commandRun = apis.some(a => Object.values(a.endpoints ?? {}).some((e: any) => ['command_run', 'run'].includes(e.type)))
  const jobDispatch = apis.some(a => Object.values(a.endpoints ?? {}).some((e: any) => e.type === 'job_dispatch'))
  const eventFire = apis.some(a => Object.values(a.endpoints ?? {}).some((e: any) => e.type === 'event_fire'))
  if (commandRun) ctl += `import { runCommand } from '@pluff/runtime'\n`
  if (jobDispatch) ctl += `import * as GeneratedJobs from './jobs'\n`
  if (eventFire) ctl += `import * as GeneratedEvents from './events'\n`

  for (const api of apis) {
    const M: string = api.model
    const v = lcfirst(M)
    const nativeNotificationApi = hasNotifications && M === 'Notification'
    const usePolicy = !!api.policy
    const methods: string[] = []
    for (const [name, ep] of Object.entries(api.endpoints ?? {}) as [string, Any][]) {
      const auth = (a: string) => usePolicy ? `    await authorize(request, ${M}Policy, ${q(a)}${a === 'create' ? '' : `, ${v}`})\n` : ''
      const find = `    const ${v} = await ${M}.findOrFail(request.route(${q('id')}))\n`
      const respType = ep.response?.type ?? ''
      let code: string
      switch (name) {
        case 'index': {
          if (nativeNotificationApi && !ep.body) {
            code = `    const user = request.user()\n    const results = await DatabaseNotification.query().where({ notifiable_type: 'user', notifiable_id: user.id }).orderBy('created_at', 'desc').get()\n    return response.json({ data: results })\n`
            break
          }
          if (ep.type === 'upload_index') {
            code = `    const files = await ${M}.latest().get()\n    return response.json({ data: files.map((file: any) => ({ ...file.toJSON(), url: file.is_image ? Storage.url(file.disk_path) : null })) })\n`
            break
          }
          const query = ep.query ?? {}
          const perPage = /default:(\d+)/.exec(String(query.per_page ?? ''))?.[1] ?? '15'
          const filters = Object.keys(query).filter(k => k !== 'search' && k !== 'per_page')
            .map(k => `    if (request.filled(${q(k)})) query.where(${q(k)}, request.input(${q(k)}))\n`).join('')
          const search = query.search !== undefined
            ? `    if (request.filled('search')) {\n      const s = '%' + request.input('search') + '%'\n      query.where((w) => { w.orWhere('name', 'like', s); w.orWhere('description', 'like', s) })\n    }\n` : ''
          const fetch = respType === 'array'
            ? `    const results = await query.orderBy('created_at', 'desc').get()\n    return response.json(${api.resource ? `resourceTransform(results, ${resourceFields(api)})` : 'results'})\n`
            : `    const results = await query.orderBy('created_at', 'desc').paginate(Number(request.input('per_page', ${perPage})), Number(request.input('page', 1)), request.url())\n    return response.json(${api.resource ? `resourceTransform(results, ${resourceFields(api)})` : 'results'})\n`
          code = `    const query = ${M}.query()\n${search}${filters}${fetch}`
          break
        }
        case 'store':
          if (ep.type === 'command_run') {
            code = `    const validated = await request.validate({ command: 'required|string', triggered_by: 'sometimes|string' })\n    const started = Date.now()\n    const entry = [...(await import('@pluff/runtime')).commands].find(([signature]) => signature.endsWith(':' + validated.command))\n    if (!entry) return response.json({ message: 'Invalid command' }, 400)\n    const exitCode = await runCommand(entry[0])\n    const commandRun = await ${M}.create({ command_name: validated.command, signature: entry[0], exit_code: exitCode, output: '', triggered_by: validated.triggered_by ?? 'manual', duration_ms: Date.now() - started })\n    return response.json(commandRun, 201)\n`
          } else if (ep.type === 'job_dispatch') {
            code = `    const validated = await request.validate({ job: 'required|string' })\n    const jobClass = Object.values(GeneratedJobs).find((C: any) => C?.name?.toLowerCase().includes(String(validated.job).replace(/[-_]/g, '').toLowerCase())) as any\n    if (!jobClass) throw new Error('Unknown job: ' + validated.job)\n    await dispatch(new jobClass(request.input('data', {})))\n    return response.json({ message: 'Job dispatched' }, 202)\n`
          } else if (ep.type === 'event_fire') {
            code = `    const validated = await request.validate({ event: 'required|string', payload: 'sometimes|array' })\n    const eventClass = Object.values(GeneratedEvents).find((C: any) => C?.name?.toLowerCase().includes(String(validated.event).replace(/[-_]/g, '').toLowerCase())) as any\n    if (!eventClass) throw new Error('Unknown event: ' + validated.event)\n    await event(new eventClass(validated.payload ?? {}))\n    return response.json({ message: 'Event fired' }, 202)\n`
          } else if (ep.type === 'broadcast') {
            code = `    const validated = await request.validate(${rules(ep.validation)})\n    const message = await ${M}.create(validated)\n    const channelType = validated.channel_type ?? 'public'\n    const userId = (await request.authUser())?.id ?? null\n    broadcast(Object.assign(new MessageSentEvents[channelType](message.toJSON()), { userId }))\n    return response.json(message, 201)\n`
          } else if (ep.type === 'mail_send') {
            code = `    const validated = await request.validate(${rules(ep.validation)})\n    const user = await request.authUser()\n    const Cls = mailClasses[validated.mail]\n    if (!Cls) throw new Error('Unknown mail type: ' + validated.mail)\n    await Mail.to(validated.to).send(new (Cls as any)(...Object.values(validated.data ?? {})))\n    const mailLog = await ${M}.create({ user_id: user?.id ?? null, to_email: validated.to, subject: Cls.subject || validated.mail, mail_class: Cls.name, status: 'sent' })\n    return response.json(mailLog, 201)\n`
          } else if (ep.type === 'notification_trigger') {
            code = `    const validated = await request.validate(${rules(ep.validation)})\n    const user = request.user()\n    const Cls = notificationClasses[validated.notification]\n    if (!Cls) throw new Error('Unknown notification type: ' + validated.notification)\n    await notify(user, new (Cls as any)(user))\n    return response.json({ message: 'Notification triggered successfully', type: validated.notification }, 201)\n`
          } else if (['upload', 'upload_index', 'upload_destroy', 'upload_url'].includes(ep.type)) {
            code = `    const files = request.files('files')\n    const uploaded = []\n    for (const file of files) {\n      const diskPath = Storage.put(${q(`arkzen/${slug}`)}, file)\n      const record = await ${M}.create({ user_id: request.user()?.id ?? null, original_name: file.originalname, stored_name: diskPath.split('/').pop(), mime_type: file.mimetype, size_bytes: file.size, disk_path: diskPath, is_image: file.mimetype.startsWith('image/') })\n      uploaded.push({ ...record.toJSON(), url: record.is_image ? Storage.url(diskPath) : null })\n    }\n    return response.json({ data: uploaded }, 201)\n`
          } else {
            const body = dec(ep.body).trim()
            code = body
              ? ind(body, 2) + '\n'
              : `${auth('create')}    const validated = await request.validate(${rules(ep.validation)})\n    const ${v} = await ${M}.create(validated)\n    return response.json(${api.resource ? `resourceTransform(${v}, ${resourceFields(api)})` : v}, 201)\n`
          }
          break
        case 'broadcast':
          if (ep.type === 'broadcast') {
            code = `    const validated = await request.validate(${rules(ep.validation)})\n    const message = await ${M}.create({ channel: validated.channel_type, target: validated.target, user_id: (await request.authUser())?.id ?? null, status: 'sent' })\n    const channelType = validated.channel_type ?? 'public'\n    const userId = (await request.authUser())?.id ?? null\n    const EventClass = MessageSentEvents[channelType]\n    if (!EventClass) throw new Error('Unknown broadcast channel type: ' + channelType)\n    broadcast(Object.assign(new EventClass(message.toJSON()), { userId }))\n    return response.json(message, 201)\n`
          } else {
            code = `    return response.json({ message: 'Endpoint ${name} is not implemented yet' }, 501)\n`
          }
          break
        case 'sendMail':
          if (ep.body) {
            code = ind(dec(ep.body).trim(), 2) + '\n'
          } else if (ep.type === 'mail_send') {
            code = `    const validated = await request.validate(${rules(ep.validation)})\n    const user = await request.authUser()\n    const Cls = mailClasses[validated.mail]\n    if (!Cls) throw new Error('Unknown mail type: ' + validated.mail)\n    await Mail.to(validated.to).send(new (Cls as any)(...Object.values(validated.data ?? {})))\n    const mailLog = await ${M}.create({ user_id: user?.id ?? null, channel: 'mail', target: validated.to, status: 'sent' })\n    return response.json(mailLog, 201)\n`
          } else {
            code = `    return response.json({ message: 'Endpoint ${name} is not implemented yet' }, 501)\n`
          }
          break
        case 'notify':
          if (ep.body) {
            code = ind(dec(ep.body).trim(), 2) + '\n'
          } else if (ep.type === 'notification_trigger') {
            code = `    const validated = await request.validate(${rules(ep.validation)})\n    const user = request.user()\n    const Cls = notificationClasses[validated.notification]\n    if (!Cls) throw new Error('Unknown notification type: ' + validated.notification)\n    await notify(user, new (Cls as any)(user))\n    return response.json({ message: 'Notification triggered successfully', type: validated.notification }, 201)\n`
          } else {
            code = `    return response.json({ message: 'Endpoint ${name} is not implemented yet' }, 501)\n`
          }
          break
        case 'show':    code = `${find}    return response.json(${api.resource ? `resourceTransform(${v}, ${resourceFields(api)})` : v})\n`; break
        case 'update':  code = `${find}${auth('update')}    const validated = await request.validate(${rules(ep.validation)})\n    await ${v}.update(validated)\n    return response.json(${api.resource ? `resourceTransform(${v}, ${resourceFields(api)})` : v})\n`; break
        case 'destroy':
          code = nativeNotificationApi && !ep.body
            ? `    const user = request.user()\n    const notification = await DatabaseNotification.query().where({ id: request.route('id'), notifiable_type: 'user', notifiable_id: user.id }).firstOrFail()\n    await notification.delete()\n    return response.json({ message: ${q(ep.response?.value ?? 'Notification deleted')} })\n`
            : ep.type === 'upload_destroy'
            ? `    const file = await ${M}.findOrFail(request.route('id'))\n    if (file.disk_path) Storage.delete(file.disk_path)\n    await file.delete()\n    return response.json({ message: 'File deleted' })\n`
            : `${find}${auth('delete')}    await ${v}.delete()\n    return response.json({ message: ${q(ep.response?.value ?? `${M} deleted successfully`)} })\n`
          break
        case 'fileUrl':
          code = `    const file = await ${M}.findOrFail(request.route('id'))\n    if (!Storage.exists(file.disk_path)) return response.json({ message: 'File not found' }, 404)\n    return response.make(Storage.read(file.disk_path), 200, { 'Content-Type': file.mime_type, 'Content-Disposition': 'attachment; filename="' + file.original_name + '"' })\n`; break
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
            : nativeNotificationApi && name === 'readAll'
              ? `    const user = request.user()\n    await DatabaseNotification.query().where({ notifiable_type: 'user', notifiable_id: user.id }).whereNull('read_at').update({ read_at: now() })\n    return response.json({ message: ${q(ep.response?.value ?? 'All notifications marked as read')} })\n`
            : `    // Custom endpoint: ${name}\n    // Add @arkzen:endpoint:ts:${name} ... :end to your tatemono to inject logic.\n    return response.json({ message: ${q(`Endpoint ${name} is not implemented yet`)} }, 501)\n`
        }
      }
      methods.push(`  async ${name}(request: Request, response: ResponseFactory): Promise<any> {\n${code}  },`)
    }
    ctl += `export const ${api.controller} = {\n${methods.join('\n')}\n}\n\n`
    controllerNames.push(api.controller)
  }

  // custom routes
  const customControllerNames = new Map<any, string>()
  for (const cr of p.customRoutes ?? []) {
    const customController = controllerNames.includes(cr.controller) ? `${cr.controller}CustomRoutes` : cr.controller
    customControllerNames.set(cr, customController)
    const methods: string[] = []
    for (const r of cr.routes ?? []) {
      const body = dec(r.body).trim()
      methods.push(`  async ${r.handler}(request: Request, response: ResponseFactory, ...params: any[]): Promise<any> {\n${body ? ind(body, 2) : `    return response.json({ message: ${q(`Handler ${r.handler} is not implemented yet`)} }, 501)`}\n  },`)
    }
    ctl += `export const ${customController} = {\n${methods.join('\n')}\n}\n\n`
    if (!controllerNames.includes(cr.controller)) controllerNames.push(cr.controller)
  }

  // mail / notification class lookups used by the typed endpoints
  const lookup = (names: string[], suffix: string) => names.flatMap(n => [...new Set([n, n.replace(/_/g, '-')])].map(k => `${q(k)}: ${studly(n)}${suffix}`)).join(', ')
  const mailClasses = lookup(Object.keys(mails), 'Mail')
  const notifClasses = lookup(Object.keys(notifs), 'Notification')
  const needsMsgEvents = apis.some(a => Object.values(a.endpoints ?? {}).some((e: any) => e.type === 'broadcast'))
  if (hasNotifications) ctl = ctl.replace(/\bNotification\.(query|findOrFail)/g, 'DatabaseNotification.$1')
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
      const stub = `const EventLog = (await import('./models') as any).EventLog\n  if (EventLog) await EventLog.create({ event_name: ${q(name)}, listener_name: ${q(l)}, status: 'completed', payload: JSON.stringify(event.data) })\n  else Log.info('[Arkzen Listener] ${l}', event.data)`
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

  // ── factories ──────────────────────────────────────────
  let fc = `// ARKZEN GENERATED FACTORIES: ${slug}\n${IMPORTS}${modelImports}\n`
  const factoryNames: string[] = []
  for (const api of apis.filter(a => a.factory)) {
    const db = api.__database ?? findDatabaseForModel(dbs, api.model)
    const values = Object.entries(db?.columns ?? {})
      .filter(([name, c]: [string, any]) => !c.primary && !['created_at', 'updated_at', 'deleted_at'].includes(name))
      .map(([name, c]: [string, any]) => {
        const expr = c.type === 'boolean' ? 'false' : c.type === 'integer' || c.type === 'bigInteger' ? '1' : c.type === 'json' ? '[]' : q(name === 'email' ? 'user@example.com' : name === 'name' ? 'Example' : '')
        return `${q(name)}: ${expr}`
      }).join(', ')
    const fn = `${api.model}Factory`
    fc += `export const ${fn} = factoryFor(${api.model}, { ${values} })\n`
    factoryNames.push(fn)
  }
  fc += `export const factories = { ${factoryNames.join(', ')} }\n`
  files['factories.ts'] = fc

  // ── realtime (broadcast events) ────────────────────────
  let rt = `// ARKZEN GENERATED REALTIME: ${slug}\n${IMPORTS}\n`
  const bcClasses: string[] = []
  const ids = { public: 'MessageSentPublic', private: 'MessageSentPrivate', presence: 'MessageSentPresence' } as Any
  for (const [name, cfg] of Object.entries(realtimes)) {
    if (!cfg.channel) continue                                     // channel declarations only; auth is handled by /broadcasting/auth
    const type = cfg.type ?? 'public'
    const cls = studly(name)
    const rawChannel = String(cfg.channel)
    const channelHasId = rawChannel.includes('{id}')
    const channel = rawChannel.replace(/\.\{id\}$/, '')
    rt += `export class ${cls} extends BroadcastEvent {
  static tatemono = ${q(slug)}
  channelType = ${q(type)} as 'public' | 'private' | 'presence'
  channel = ${q(channel)}
  channelHasId = ${channelHasId}
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
    return response.json({ user, token }, 201, { 'Set-Cookie': authCookie(S, token) })
  }))
  r.post(${q(prefixOf + '/auth/login')}, handle(S, async (request, response) => {
    const v = await request.validate({ email: 'required|email', password: 'required|string' })
    const user: any = await User.where('email', v.email).first()
    if (!user || !Hash.check(v.password, user.password)) throw ValidationException.withMessages({ email: ['The provided credentials are incorrect.'] })
    await user.tokens().delete()
    const token = await createToken(S, user.id)
    return response.json({ user, token }, 200, { 'Set-Cookie': authCookie(S, token) })
  }))
  r.post(${q(prefixOf + '/auth/logout')}, authMiddleware(S), handle(S, async (request, response) => {
    await request.user().currentAccessToken().delete()
    return response.json({ message: 'Logged out successfully' }, 200, { 'Set-Cookie': clearAuthCookie(S) })
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
    const customController = customControllerNames.get(cr) ?? cr.controller
    const chain = (cr.middleware ?? []).map((m: string) => `mw(${q(String(m).trim())})`)
    for (const r of cr.routes ?? []) {
      rts += `  r.${String(r.method ?? 'GET').toLowerCase()}(${q(expressPath(r.route))}${chain.length ? ', ' + chain.join(', ') : ''}, handle(S, (rq, rs) => C.${customController}.${r.handler}(rq, rs, ...Object.values(rq.route() as any))))\n`
    }
  }
  const realtimeNames = Object.keys(realtimes)
  if (realtimeNames.length) {
    const broadcastApi = apis.find(a => Object.values(a.endpoints ?? {}).some((e: any) => e.type === 'broadcast'))
    const realtimeModel = broadcastApi?.model
    if (realtimeModel) {
      rts += `  r.get(${q(`${prefixOf}/sse-poll/:channelType`)}, handle(S, async (_request, response) => response.json({ data: await ${realtimeModel}.latest().limit(50).get(), channel: _request.route('channelType') })))\n`
      rts += `  r.get(${q(`${prefixOf}/sse/:channelType`)}, handle(S, async (_request, response) => response.sse(_request.route('channelType'), { data: await ${realtimeModel}.latest().limit(50).get(), channel: _request.route('channelType') })))\n`
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
    `export const commands = [${cmdClasses.join(', ')}]\n` +
    `export const routePrefixes = ${JSON.stringify([...new Set([...apis.map(a => String(a.prefix ?? '').replace(/\/+$/, '')).filter(Boolean), ...(hasAuth ? [`${prefixOf}/auth`] : []), ...((p.customRoutes ?? []).flatMap((r: any) => (r.routes ?? []).map((x: any) => String(x.route ?? '').split('/').slice(0, 3).join('/'))))])])}\n`

  return { files, registry: { models: [...modelNames.values(), ...(hasAuth ? ['User'] : [])], controllers: controllerNames, tables: dbs.map(d => T(d.table)) }, warnings }
}
