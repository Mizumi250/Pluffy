// Database queue (same idea as Laravel's `jobs` table) + job/listener/event classes.
import { mainConnection } from './database'
import { env, Log } from './support'

export class Job {
  tries = 3
  timeout = 60
  queue = 'default'
  constructor(public data: any = {}) {}
  async handle(): Promise<void> {}
}

export class Event {
  constructor(public data: Record<string, any> = {}) {}
}
export class Listener {
  tries = 3
  queue = 'default'
  async handle(_event: Event): Promise<void> {}
}

type Ctor<T> = new (...a: any[]) => T
export interface LoadedModule {
  name: string
  jobs: Record<string, Ctor<Job>>
  listeners: Record<string, Ctor<Listener>>
  events: Record<string, Ctor<Event>>
  listenerMap: Record<string, string[]>    // event class name -> listener class names
}
export const modules = new Map<string, LoadedModule>()

let tableReady = false
async function ensureTables() {
  if (tableReady) return
  const db = mainConnection()
  if (!(await db.schema.hasTable('jobs'))) {
    await db.schema.createTable('jobs', t => {
      t.increments('id'); t.string('queue').index(); t.text('payload'); t.integer('attempts').defaultTo(0)
      t.integer('reserved_at').nullable(); t.integer('available_at'); t.integer('created_at')
    })
  }
  if (!(await db.schema.hasTable('failed_jobs'))) {
    await db.schema.createTable('failed_jobs', t => {
      t.increments('id'); t.string('queue'); t.text('payload'); t.text('exception'); t.string('failed_at')
    })
  }
  tableReady = true
}

const nowSec = () => Math.floor(Date.now() / 1000)
const isSync = () => env('QUEUE_CONNECTION', 'database') === 'sync'

interface Payload { tatemono: string; kind: 'job' | 'listener'; class: string; data?: any; event?: { class: string; data: any }; tries: number; timeout: number }

async function push(queue: string, payload: Payload, delaySec = 0) {
  await ensureTables()
  await mainConnection().table('jobs').insert({
    queue, payload: JSON.stringify(payload), attempts: 0, reserved_at: null, available_at: nowSec() + delaySec, created_at: nowSec(),
  })
}

export async function runPayload(p: Payload): Promise<void> {
  const mod = modules.get(p.tatemono)
  if (!mod) throw new Error(`Tatemono "${p.tatemono}" is not loaded`)
  if (p.kind === 'job') {
    const C = mod.jobs[p.class]; if (!C) throw new Error(`Unknown job ${p.class}`)
    await new C(p.data).handle()
  } else {
    const L = mod.listeners[p.class]; if (!L) throw new Error(`Unknown listener ${p.class}`)
    const E = mod.events[p.event!.class]
    await new L().handle(new (E ?? Event)(p.event!.data))
  }
}

/** dispatch(new MyJob(data)): the job class is tagged by generated code with `tatemono`. */
export async function dispatch(job: Job & { tatemono?: string }, delaySec = 0) {
  const tatemono = (job as any).tatemono ?? (job.constructor as any).tatemono
  const payload: Payload = { tatemono, kind: 'job', class: job.constructor.name, data: job.data, tries: job.tries, timeout: job.timeout }
  if (isSync()) return runPayload(payload)
  await push(job.queue, payload, delaySec)
}

/** event(new SomethingHappened(data)): runs every registered listener (queued, like ShouldQueue). */
export async function event(e: Event) {
  const tatemono = (e.constructor as any).tatemono as string
  const mod = modules.get(tatemono)
  if (!mod) return
  for (const lname of mod.listenerMap[e.constructor.name] ?? []) {
    const L = mod.listeners[lname]; if (!L) continue
    const inst = new L()
    const payload: Payload = { tatemono, kind: 'listener', class: lname, event: { class: e.constructor.name, data: e.data }, tries: inst.tries, timeout: 60 }
    if (isSync()) await runPayload(payload)
    else await push(inst.queue, payload)
  }
}

/** One poll step of the worker. Returns true when a job was processed. */
export async function workOnce(queue = 'default'): Promise<boolean> {
  await ensureTables()
  const db = mainConnection()
  const row: any = await db.table('jobs').where('queue', queue).whereNull('reserved_at').where('available_at', '<=', nowSec()).orderBy('id').first()
  if (!row) return false
  const claimed = await db.table('jobs').where({ id: row.id }).whereNull('reserved_at').update({ reserved_at: nowSec(), attempts: row.attempts + 1 })
  if (!claimed) return true
  const p: Payload = JSON.parse(row.payload)
  try {
    await Promise.race([
      runPayload(p),
      new Promise((_, rej) => setTimeout(() => rej(new Error(`Job timed out after ${p.timeout}s`)), p.timeout * 1000)),
    ])
    await db.table('jobs').where({ id: row.id }).delete()
    Log.info(`Processed ${p.class} (${p.tatemono})`)
  } catch (e: any) {
    if (row.attempts + 1 >= (p.tries || 1)) {
      await db.table('failed_jobs').insert({ queue, payload: row.payload, exception: String(e?.stack ?? e), failed_at: new Date().toISOString() })
      await db.table('jobs').where({ id: row.id }).delete()
      Log.error(`Failed ${p.class}: ${e?.message}`)
    } else {
      await db.table('jobs').where({ id: row.id }).update({ reserved_at: null, available_at: nowSec() + 5 })
      Log.warn(`Retrying ${p.class} (attempt ${row.attempts + 1}/${p.tries}): ${e?.message}`)
    }
  }
  return true
}
