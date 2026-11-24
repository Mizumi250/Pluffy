// End-to-end test for the Lynx realtime poll route. Runs the real generator, routes and database.
// Contract = Laravel's LynxSseBridgeController::poll().
//
//   cd engine/backend/express && npx tsx tests/ssePoll.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

process.env.ARKZEN_DB_DRIVER ??= 'sqlite'
const here = path.dirname(fileURLToPath(import.meta.url))
const SLUG = 'sse-poll-selftest'

const { app } = await import('../src/server')
const { buildTatemono, removeTatemono } = await import('../src/engine/build')

const payload = JSON.parse(fs.readFileSync(path.join(here, 'broadcast-payload.json'), 'utf8').replaceAll('broadcast-test', SLUG))
payload.backend = 'express'
payload.backendVariant = 'ts'
const built: any = await buildTatemono(payload)
assert.ok(built?.status === undefined || built.status === 200, JSON.stringify(built))

const server = http.createServer(app)
await new Promise<void>(resolve => server.listen(0, resolve))
const base = `http://127.0.0.1:${(server.address() as any).port}`
const call = async (method: string, url: string, body?: any, token?: string) => {
  const res = await fetch(base + url, {
    method, headers: { 'content-type': 'application/json', accept: 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, json: await res.json().catch(() => null) as any }
}

try {
  const poll = `/api/${SLUG}/sse-poll`
  const reg = await call('POST', `/api/${SLUG}/auth/register`, { name: 'Poller', email: 'poller@example.test', password: 'hunter2hunter2', password_confirmation: 'hunter2hunter2' })
  assert.ok([200, 201].includes(reg.status), JSON.stringify(reg))
  const token = reg.json.token

  assert.equal((await call('GET', `${poll}/nope`)).status, 404)
  { const r = await call('GET', `${poll}/private`); assert.equal(r.status, 401, JSON.stringify(r)) }
  assert.equal((await call('GET', `${poll}/presence`)).status, 401)
  assert.deepEqual((await call('GET', `${poll}/public`)).json, { messages: [], last_id: 0 })

  for (const [content, channel_type] of [['a', 'public'], ['b', 'private'], ['c', 'public']]) {
    const res = await call('POST', `/api/${SLUG}/messages`, { content, channel_type }, token)
    assert.equal(res.status, 201, JSON.stringify(res))
  }
  const pub = (await call('GET', `${poll}/public`)).json
  assert.deepEqual(pub.messages.map((m: any) => m.data.content), ['a', 'c'])
  assert.equal(pub.messages[0].event, `${SLUG}.message-sent-public`)
  assert.equal(pub.last_id, pub.messages[1].data.id)
  const after = (await call('GET', `${poll}/public?after_id=${pub.messages[0].data.id}`)).json
  assert.deepEqual(after.messages.map((m: any) => m.data.content), ['c'])
  assert.equal((await call('GET', `${poll}/public?after_id=junk`)).json.messages.length, 2)
  const priv = (await call('GET', `${poll}/private`, undefined, token)).json
  assert.deepEqual(priv.messages.map((m: any) => m.data.content), ['b'])
  assert.equal(priv.messages[0].event, `${SLUG}.message-sent-private`)
  console.log('express sse-poll: all assertions passed')
} catch (error) {
  console.error('FAILED:', error)
  process.exitCode = 1
} finally {
  server.close()
  await removeTatemono({ name: SLUG })
  process.exit(process.exitCode ?? 0)
}
