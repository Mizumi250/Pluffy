/* @arkzen:meta
name: express-test-2
version: 1.0.0
description: "Express parity fixture: one tatemono covering the Laravel backend test surfaces."
auth: true
auth_seed:
  users:
    - name: Express Tester
      email: express-test-2@example.com
      password: password123
      role: admin
*/

/* @arkzen:database:records
table: records
timestamps: true
softDeletes: true
columns:
  user_id:
    type: foreignId
    nullable: true
  title:
    type: string
    length: 255
  status:
    type: string
    length: 30
    default: open
  priority:
    type: integer
    default: 1
  done:
    type: boolean
    default: false
seeder:
  data:
    - title: Seeded record A
      status: open
      priority: 2
    - title: Seeded record B
      status: closed
      priority: 1
*/

/* @arkzen:database:uploaded_files
table: uploaded_files
timestamps: true
columns:
  user_id:
    type: foreignId
    nullable: true
  original_name:
    type: string
  stored_name:
    type: string
  mime_type:
    type: string
  size_bytes:
    type: integer
  disk_path:
    type: string
  is_image:
    type: boolean
*/

/* @arkzen:database:command_runs
table: command_runs
timestamps: true
columns:
  command_name:
    type: string
  signature:
    type: string
  exit_code:
    type: integer
    default: 0
  output:
    type: text
    nullable: true
  triggered_by:
    type: string
    default: manual
  duration_ms:
    type: integer
    nullable: true
*/

/* @arkzen:database:job_results
table: job_results
timestamps: true
columns:
  job_name:
    type: string
  status:
    type: string
  result:
    type: text
    nullable: true
*/

/* @arkzen:database:event_log
table: event_log
timestamps: true
columns:
  event_name:
    type: string
  listener:
    type: string
  payload:
    type: text
    nullable: true
*/

/* @arkzen:database:send_log
table: send_log
timestamps: true
columns:
  user_id:
    type: foreignId
    nullable: true
  channel:
    type: string
  target:
    type: string
  status:
    type: string
*/

/* @arkzen:api:records
model: TestRecord
controller: RecordController
prefix: /api/express-test-2
middleware: [auth:sanctum, jsonOnly]
policy: true
resource: true
factory: true
endpoints:
  index:
    method: GET
    route: /records
    description: List records with filtering and pagination
    query:
      search: string
      status: string
      per_page: integer|default:10
    response:
      type: collection
  store:
    method: POST
    route: /records
    description: Create a record
    validation:
      title: required|string|max:255
      status: sometimes|string|in:open,closed
      priority: sometimes|integer|min:1
      done: sometimes|boolean
    response:
      type: single
  show:
    method: GET
    route: /records/{id}
    description: Show a record
    response:
      type: single
  update:
    method: PUT
    route: /records/{id}
    description: Update a record
    validation:
      title: sometimes|string|max:255
      status: sometimes|string|in:open,closed
    response:
      type: single
  destroy:
    method: DELETE
    route: /records/{id}
    description: Delete a record
    response:
      type: message
      value: TestRecord deleted
  stats:
    method: GET
    route: /records/stats
    description: Aggregate records
    response:
      type: single
*/

/* @arkzen:api:uploads
model: UploadedFile
controller: UploadedFileController
prefix: /api/express-test-2
middleware: [auth:sanctum]
endpoints:
  index:
    method: GET
    route: /files
    description: List uploaded files
    type: upload_index
    response:
      type: collection
  store:
    method: POST
    route: /files
    description: Upload files
    type: upload
    validation:
      files: required|array
      files.*: file|max:10240
    response:
      type: collection
  destroy:
    method: DELETE
    route: /files/{id}
    description: Delete an uploaded file
    type: upload_destroy
    response:
      type: message
      value: File deleted
  fileUrl:
    method: GET
    route: /files/{id}/url
    description: Download an uploaded file
    type: upload_url
    response:
      type: single
*/

/* @arkzen:api:commands
model: CommandRun
controller: CommandController
prefix: /api/express-test-2
middleware: [auth:sanctum]
endpoints:
  index:
    method: GET
    route: /commands
    description: List command runs
    response:
      type: collection
  store:
    method: POST
    route: /commands/run
    description: Run a command
    type: command_run
    validation:
      command: required|string|in:cleanup
      triggered_by: sometimes|string
    response:
      type: single
*/

/* @arkzen:api:dispatch
model: JobResult
controller: DispatchController
prefix: /api/express-test-2
middleware: [auth:sanctum]
endpoints:
  store:
    method: POST
    route: /jobs/dispatch
    description: Dispatch a queued job
    type: job_dispatch
    validation:
      job: required|string|in:process-record,always-fails
    response:
      type: single
*/

/* @arkzen:api:events
model: EventLog
controller: EventController
prefix: /api/express-test-2
middleware: [auth:sanctum]
endpoints:
  store:
    method: POST
    route: /events/fire
    description: Fire an event
    type: event_fire
    validation:
      event: required|string|in:record-created
      payload: sometimes|array
    response:
      type: single
*/

/* @arkzen:api:messaging
model: SendLog
controller: MessagingController
prefix: /api/express-test-2
middleware: [auth:sanctum]
endpoints:
  broadcast:
    method: POST
    route: /broadcast
    description: Store and broadcast a message
    type: broadcast
    validation:
      channel_type: required|string|in:public,private,presence
      target: required|string
    response:
      type: single
  sendMail:
    method: POST
    route: /mail
    description: Send a mail
    type: mail_send
    validation:
      mail: required|string
      to: required|email
    response:
      type: single
  notify:
    method: POST
    route: /notify
    description: Trigger a notification
    type: notification_trigger
    validation:
      notification: required|string
    response:
      type: single
*/

/* @arkzen:routes
controller: ExpressParityController
middleware: [auth:sanctum]
routes:
  - method: GET
    route: /api/express-test-2/health/{name}
    handler: health
  - method: POST
    route: /api/express-test-2/echo
    handler: echo
*/

/* @arkzen:middleware:ts:jsonOnly
*/
if (!request.isJson()) {
  return response.json({ message: 'Content-Type: application/json is required.' }, 415)
}
return next()
/* @arkzen:middleware:ts:jsonOnly:end */

/* @arkzen:policy:ts:update
*/
return user?.role === 'admin' || user?.id === record?.user_id
/* @arkzen:policy:ts:update:end */

/* @arkzen:policy:ts:delete
*/
return user?.role === 'admin'
/* @arkzen:policy:ts:delete:end */

/* @arkzen:endpoint:ts:stats
*/
const total = await TestRecord.query().withTrashed().count()
const open = await TestRecord.where('status', 'open').count()
return response.json({ total, open, closed: total - open })
/* @arkzen:endpoint:ts:stats:end */

/* @arkzen:handler:ts:health
*/
return response.json({ ok: true, name: request.route('name'), backend: 'express', params })
/* @arkzen:handler:ts:health:end */

/* @arkzen:handler:ts:echo
*/
const payload = request.all()
return response.json({ ok: true, payload })
/* @arkzen:handler:ts:echo:end */

/* @arkzen:jobs:ts:process-record
queue: default
tries: 3
timeout: 30
*/
const record = await TestRecord.find(this.data?.record_id)
if (record) await JobResult.create({ job_name: 'process-record', status: 'completed', result: String(record.id) })
/* @arkzen:jobs:ts:process-record:end */

/* @arkzen:jobs:ts:always-fails
queue: default
tries: 2
timeout: 10
*/
throw new Error('Express parity failure fixture')
/* @arkzen:jobs:ts:always-fails:end */

/* @arkzen:events:record-created
listeners: [LogRecordCreated, CountRecords]
*/
/* @arkzen:events:record-created:end */

/* @arkzen:listener:ts:LogRecordCreated
*/
await EventLog.create({ event_name: 'record-created', listener: 'LogRecordCreated', payload: JSON.stringify(event.data) })
/* @arkzen:listener:ts:LogRecordCreated:end */

/* @arkzen:listener:ts:CountRecords
*/
await EventLog.create({ event_name: 'record-created', listener: 'CountRecords', payload: String(await TestRecord.count()) })
/* @arkzen:listener:ts:CountRecords:end */

/* @arkzen:console:ts:cleanup
signature: express-test-2:cleanup
description: Records a scheduled cleanup
schedule: '0 * * * *'
*/
await CommandRun.create({ command_name: 'cleanup', signature: 'express-test-2:cleanup', exit_code: 0, output: 'Cleanup complete', triggered_by: 'schedule' })
this.info('[express-test-2] cleanup complete')
return Command.SUCCESS
/* @arkzen:console:ts:cleanup:end */

/* @arkzen:mail:welcome
subject: "Welcome to Express parity"
data:
  username: string
  app_name: string
*/
/* @arkzen:mail:welcome:end */

/* @arkzen:mail:ts:welcome
subject: "Welcome to Express parity"
data:
  username: string
  app_name: string
*/
<p>welcome</p>
/* @arkzen:mail:ts:welcome:end */

/* @arkzen:notifications:record-alert
channels: [database, mail, broadcast]
message: "A record needs your attention"
subject: "Record alert"
*/
/* @arkzen:notifications:record-alert:end */

/* @arkzen:notifications:ts:record-alert
channels: [database, mail, broadcast]
message: "A record needs your attention"
subject: "Record alert"
*/
return new MailMessage().subject('record-alert').line('record-alert')
/* @arkzen:notifications:ts:record-alert:end */

/* @arkzen:realtime:express-test-2-public
type: public
*/
/* @arkzen:realtime:express-test-2-public:end */

/* @arkzen:realtime:record-created
channel: express-test-2-public
type: public
*/
/* @arkzen:realtime:record-created:end */

/* @arkzen:web:components:shared */
'use client'
import React, { useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore, useAuthStoreHydrated } from '@/arkzen/core/stores/authStore'
setActiveTatemono('express-test-2')
/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const ExpressParityPage = () => {
  setActiveTatemono('express-test-2')
  const { login, user, token, logout, isLoading } = useAuthStore()
  const hydrated = useAuthStoreHydrated()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('express-test-2@example.com')
  const [password, setPassword] = useState('password123')
  const [records, setRecords] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [tab, setTab] = useState('crud')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ title: '', status: 'open', priority: 1 })

  const api = async (path: string, init: RequestInit = {}) => {
    const res = await arkzenFetch(`/api/express-test-2${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`)
    return data
  }
  const custom = async (path: string, init: RequestInit = {}) => {
    const res = await arkzenFetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) } })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`)
    return data
  }
  const refresh = async () => {
    try {
      const [r, f, l] = await Promise.all([
        api('/records'), api('/files'), api('/commands'),
      ])
      setRecords(r.data ?? r)
      setFiles(f.data ?? f)
      setLogs(l.data ?? l)
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Refresh failed') }
  }
  useEffect(() => {
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    const { token, fetchMe } = useAuthStore.getState()
    if (token && !user) void fetchMe()
  }, [hydrated, user])
  useEffect(() => { if (user) refresh() }, [user])
  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setMessage('')
    try { await fn(); await refresh() } catch (e) { setMessage(e instanceof Error ? e.message : 'Request failed') }
    finally { setBusy(false) }
  }
  const createRecord = () => run(async () => {
    await api('/records', { method: 'POST', body: JSON.stringify({ ...form, priority: Number(form.priority) }) })
    setForm({ title: '', status: 'open', priority: 1 })
  })
  const updateRecord = (record: any) => run(async () => {
    await api(`/records/${record.id}`, { method: 'PUT', body: JSON.stringify({ status: record.status === 'open' ? 'closed' : 'open' }) })
  })
  const deleteRecord = (id: number) => run(async () => {
    await api(`/records/${id}`, { method: 'DELETE' })
  })
  const upload = (list: FileList | null) => run(async () => {
    if (!list?.length) return
    const body = new FormData()
    Array.from(list).forEach(file => body.append('files[]', file))
    const res = await arkzenFetch('/api/express-test-2/files', { method: 'POST', body })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message ?? `Upload failed (${res.status})`)
  })
  const action = (path: string, body: Record<string, any>) => run(async () => {
    const result = await api(path, { method: 'POST', body: JSON.stringify(body) })
    setMessage(JSON.stringify(result))
  })

  if (!mounted || !hydrated || (token && !user)) return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border p-7 w-full max-w-sm text-center">
        <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-700" />
        <p className="text-sm text-neutral-500">Restoring your Express session…</p>
      </div>
    </main>
  )

  if (!user) return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <form className="bg-white rounded-2xl border p-7 w-full max-w-sm space-y-4" onSubmit={e => {
        e.preventDefault(); run(async () => { await login(email, password) })
      }}>
        <h1 className="text-2xl font-bold">Express parity lab</h1>
        <p className="text-sm text-neutral-500">Laravel test workflows, backed by Express.</p>
        <input className="arkzen-input w-full" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="arkzen-input w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="arkzen-btn w-full" disabled={busy || isLoading}>{busy ? 'Signing in…' : 'Sign in as test user'}</button>
        {message && <p className="text-sm text-red-600">{message}</p>}
      </form>
    </main>
  )

  return (
    <main className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-3xl font-bold">Express parity lab</h1><p className="text-sm text-neutral-500">CRUD · uploads · queues · events · mail · notifications · realtime</p></div>
          <div className="flex gap-2"><button className="arkzen-btn-ghost" onClick={() => run(refresh)}>Refresh</button><button className="arkzen-btn-ghost" onClick={logout}>Sign out</button></div>
        </header>
        <nav className="flex flex-wrap gap-2">
          {['crud', 'uploads', 'async', 'messaging'].map(name => <button key={name} className={tab === name ? 'arkzen-btn' : 'arkzen-btn-ghost'} onClick={() => setTab(name)}>{name}</button>)}
        </nav>
        {message && <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{message}</div>}
        {tab === 'crud' && <section className="space-y-4">
          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="font-semibold">Create record</h2>
            <div className="grid md:grid-cols-4 gap-2">
              <input className="arkzen-input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <select className="arkzen-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>open</option><option>closed</option></select>
              <input className="arkzen-input" type="number" value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) })} />
              <button className="arkzen-btn" onClick={createRecord} disabled={busy}>Create</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border divide-y">{records.map(record => <div key={record.id} className="p-4 flex items-center gap-3"><span className="flex-1">{record.title}</span><span className="text-sm text-neutral-500">{record.status} · P{record.priority}</span><button className="text-xs text-blue-600" onClick={() => updateRecord(record)}>Toggle</button><button className="text-xs text-red-600" onClick={() => deleteRecord(record.id)}>Delete</button></div>)}{!records.length && <p className="p-6 text-neutral-500">No records loaded.</p>}</div>
          <div className="flex flex-wrap gap-2"><button className="arkzen-btn-ghost" onClick={() => run(async () => { const result = await api('/records/stats'); setMessage(JSON.stringify(result)) })}>Load stats</button><button className="arkzen-btn-ghost" onClick={() => run(async () => { const result = await custom('/api/express-test-2/health/ui'); setMessage(JSON.stringify(result)) })}>Probe custom route</button><button className="arkzen-btn-ghost" onClick={() => run(async () => { const result = await custom('/api/express-test-2/echo', { method: 'POST', body: JSON.stringify({ source: 'dashboard' }) }); setMessage(JSON.stringify(result)) })}>Probe echo</button></div>
        </section>}
        {tab === 'uploads' && <section className="bg-white rounded-2xl border p-5 space-y-4">
          <h2 className="font-semibold">Multipart uploads</h2>
          <input type="file" multiple onChange={e => upload(e.target.files)} />
          <div className="divide-y">{files.map(file => <div key={file.id} className="py-3 flex items-center gap-3"><span className="flex-1">{file.original_name}</span><a className="text-blue-600" href={file.url ?? `/api/express-test-2/files/${file.id}/url`}>Download</a><button className="text-xs text-red-600" onClick={() => run(async () => { await api(`/files/${file.id}`, { method: 'DELETE' }) })}>Delete</button></div>)}</div>
        </section>}
        {tab === 'async' && <section className="bg-white rounded-2xl border p-5 space-y-3">
          <h2 className="font-semibold">Commands, jobs, and events</h2>
          <div className="flex flex-wrap gap-2"><button className="arkzen-btn" onClick={() => action('/commands/run', { command: 'cleanup' })}>Run command</button><button className="arkzen-btn" onClick={() => action('/jobs/dispatch', { job: 'process-record', data: { record_id: records[0]?.id } })}>Dispatch job</button><button className="arkzen-btn" onClick={() => action('/events/fire', { event: 'record-created', payload: { source: 'ui' } })}>Fire event</button></div>
          <pre className="bg-neutral-950 text-green-300 rounded-xl p-4 text-xs overflow-auto">{JSON.stringify(logs, null, 2)}</pre>
        </section>}
        {tab === 'messaging' && <section className="bg-white rounded-2xl border p-5 space-y-3">
          <h2 className="font-semibold">Mail, notifications, broadcast, and SSE</h2>
          <div className="flex flex-wrap gap-2"><button className="arkzen-btn" onClick={() => action('/mail', { mail: 'welcome', to: email, data: { username: user.email, app_name: 'Express parity lab' } })}>Send mail</button><button className="arkzen-btn" onClick={() => action('/notify', { notification: 'record-alert' })}>Notify user</button><button className="arkzen-btn" onClick={() => action('/broadcast', { channel_type: 'public', target: 'express-test-2-public' })}>Broadcast</button><a className="arkzen-btn-ghost" href="/api/express-test-2/sse/public" target="_blank">Open SSE stream</a></div>
        </section>}
      </div>
    </main>
  )
}
/* @arkzen:web:page:index:end */
