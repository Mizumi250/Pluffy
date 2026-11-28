#!/usr/bin/env node
// Pluffy bridge: lets the Pluffy phone app drive mizumi.js on this computer.
//   node mizumi.js bridge            start it (prints the address and a pairing PIN)
//   node mizumi.js bridge --devices  list paired phones
//   node mizumi.js bridge --revoke <id|all>
//   --port=7471  --host=0.0.0.0 (use --host=127.0.0.1 when a tunnel does the reaching)
// The phone can only run mizumi.js commands, read and write tatemono files, and push or pull the repo.
// Plain HTTP on your own network or Tailscale. Over the internet, put it behind a tunnel that adds HTTPS.

import http from 'node:http'
import os from 'node:os'
import { Pairing, addDevice, findByToken, listDevices, removeDevice } from './lib/store.js'
import { Tasks, cliStep } from './lib/tasks.js'
import { describeMenu, buildArgs, parseCommand, listTatemonos, listProjects } from './lib/menu.js'
import * as tm from './lib/tatemono.js'
import * as repo from './lib/repo.js'
import { ROOT } from './lib/paths.js'
import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const opt = (k) => { const a = argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : null }
const PORT = Number(opt('port') || process.env.PLUFFY_BRIDGE_PORT || 7471)
const HOST = opt('host') || '0.0.0.0'
const VERSION = 1

const paint = (code, s) => `\x1b[${code}m${s}\x1b[0m`
const pink = (s) => paint('1;38;5;211', s), dim = (s) => paint('90', s)

// ---- small commands that do not start the server ----
if (argv.includes('--devices')) {
  const d = listDevices()
  if (!d.length) console.log('  No phones are paired yet.')
  for (const x of d) console.log(`  ${x.id}  ${x.name}  ${x.platform}  paired ${new Date(x.createdAt).toLocaleString()}  last seen ${new Date(x.lastSeen).toLocaleString()}`)
  process.exit(0)
}
const rv = argv.indexOf('--revoke')
if (rv !== -1) {
  const n = removeDevice(argv[rv + 1] || '')
  console.log(n ? `  Revoked ${n} phone${n > 1 ? 's' : ''}.` : '  Nothing matched. Use --devices to see the ids.')
  process.exit(0)
}

const tasks = new Tasks()
const pairing = new Pairing((pin) => console.log(`  ${dim('PIN expired. New PIN:')} ${pink(pin.replace(/(\d{3})(\d{3})/, '$1 $2'))}`))

const err = (message, status = 400, extra = {}) => Object.assign(new Error(message), { status, ...extra })
const json = (res, code, body) => { const s = JSON.stringify(body); res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(s) }); res.end(s) }

function body(req, limit = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = []
    req.on('data', (c) => { n += c.length; if (n > limit) { reject(err('Too big.', 413)); req.destroy() } else chunks.push(c) })
    req.on('end', () => { if (!chunks.length) return resolve({}); try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))) } catch { reject(err('Body must be JSON.')) } })
    req.on('error', reject)
  })
}

function readStacks() {
  try {
    const c = JSON.parse(fs.readFileSync(path.join(ROOT, 'arkzen.json'), 'utf8'))
    return [['web', c.activeStack], ['app', c.activeAppStack], ['desktop', c.activeDesktopStack], ['backend', c.activeBackend], ['db', c.activeDatabase ?? 'sqlite']].filter(([, v]) => v).map(([k, v]) => ({ k, v }))
  } catch { return [] }
}

const hello = () => ({ ok: true, bridge: 'pluffy', v: VERSION, name: os.hostname(), t: Date.now() })

async function route(req, res, url, dev) {
  const m = req.method, p = url.pathname
  let r

  // public: reachability check, and pairing
  if (m === 'GET' && p === '/api/ping') {
    return json(res, 200, dev ? { ...hello(), paired: true, running: tasks.running().length, stacks: readStacks() } : hello())
  }
  if (m === 'POST' && p === '/api/pair') {
    const b = await body(req, 4096)
    const ip = req.socket.remoteAddress || '?'
    const c = pairing.check(ip, String(b.pin ?? ''))
    if (c.locked) throw err(`Too many wrong PINs. Try again in ${c.locked} seconds.`, 429, { retryIn: c.locked })
    if (!c.ok) throw err('That PIN is not right. Check the one on the laptop.', 401)
    const d = addDevice({ name: b.name, platform: b.platform })
    console.log(`  ${paint('32', '✓')} Paired ${paint('1', String(b.name || 'Phone'))} ${dim(`(${d.id})`)}`)
    return json(res, 200, { ok: true, token: d.token, id: d.id, name: os.hostname() })
  }
  if (!dev) throw err('Pair this phone first.', 401)

  if (m === 'GET' && p === '/api/state') return json(res, 200, { ...hello(), platform: process.platform, node: process.version, folder: path.basename(ROOT), uptime: Math.round(process.uptime()), stacks: readStacks(), running: tasks.running().length })
  if (m === 'GET' && p === '/api/menu') return json(res, 200, describeMenu())
  if (m === 'GET' && p === '/api/lists') return json(res, 200, { tatemonos: listTatemonos(), projects: listProjects() })

  if (m === 'POST' && p === '/api/build') {
    const b = await body(req)
    const { item, lists } = buildArgs(String(b.id), b.values)
    return json(res, 200, { lists, preview: lists.map((l) => `mizumi ${l.join(' ')}`).join('\n'), title: item.title })
  }
  if (m === 'POST' && p === '/api/run') {
    const b = await body(req)
    let lists, label
    if (typeof b.command === 'string') { const a = parseCommand(b.command); lists = [a]; label = `mizumi ${a[0]}` }
    else { const x = buildArgs(String(b.id), b.values); lists = x.lists; label = x.item.title }
    const t = tasks.start(label, lists.map(cliStep))
    return json(res, 200, { ok: true, task: tasks.brief(t) })
  }

  if (m === 'GET' && p === '/api/tasks') return json(res, 200, { tasks: tasks.list(), running: tasks.running().length })
  if ((r = /^\/api\/tasks\/(t\d+)(\/stop)?$/.exec(p))) {
    const t = tasks.get(r[1])
    if (!t) throw err('That command is gone. The bridge was restarted or it was cleared.', 404)
    if (m === 'GET' && !r[2]) {
      const since = Math.max(0, Number(url.searchParams.get('since')) || 0)
      const wait = Math.min(25, Math.max(0, Number(url.searchParams.get('wait')) || 0)) * 1000
      let gone = false; req.on('close', () => { gone = true })
      const out = await tasks.read(t, since, wait)
      return gone ? undefined : json(res, 200, out)
    }
    if (m === 'POST' && r[2]) { tasks.stop(t); return json(res, 200, { ok: true }) }
    if (m === 'DELETE' && !r[2]) { tasks.remove(t); return json(res, 200, { ok: true }) }
  }

  if ((r = /^\/api\/tatemono\/([^/]+)\/(files|file|check)$/.exec(p))) {
    const name = decodeURIComponent(r[1])
    if (m === 'GET' && r[2] === 'files') return json(res, 200, { files: tm.files(name) })
    if (m === 'GET' && r[2] === 'file') return json(res, 200, tm.read(name, url.searchParams.get('path')))
    if (m === 'PUT' && r[2] === 'file') { const b = await body(req); return json(res, 200, tm.write(name, url.searchParams.get('path'), b.text, b.baseMtime)) }
    if (m === 'POST' && r[2] === 'check') return json(res, 200, await tm.check(name))
  }

  if (m === 'GET' && p === '/api/repo') return json(res, 200, repo.info())
  if ((r = /^\/api\/repo\/(push|pull)$/.exec(p)) && m === 'POST') {
    const { label, steps } = repo.steps(r[1])
    return json(res, 200, { ok: true, task: tasks.brief(tasks.start(label, steps)) })
  }

  if (m === 'GET' && p === '/api/devices') return json(res, 200, { devices: listDevices(), you: dev.id })
  if (m === 'DELETE' && (r = /^\/api\/devices\/([a-f0-9]+)$/.exec(p))) return json(res, 200, { ok: removeDevice(r[1]) > 0 })

  throw err('Not found.', 404)
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x')
    const auth = /^Bearer (.+)$/.exec(req.headers.authorization || '')
    await route(req, res, url, findByToken(auth?.[1]))
  } catch (e) {
    if (res.headersSent) return
    json(res, e.status || 500, { ok: false, error: e.status ? e.message : 'Something went wrong on the laptop.', ...(e.retryIn ? { retryIn: e.retryIn } : {}), ...(e.mtime ? { mtime: e.mtime } : {}) })
    if (!e.status) console.error(e)
  }
})
server.requestTimeout = 0
server.headersTimeout = 15_000

function addresses() {
  const out = []
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const a of list ?? []) {
      if (a.family !== 'IPv4' || a.internal) continue
      const tail = /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(a.address) ? 'Tailscale' : name
      out.push({ ip: a.address, tail })
    }
  }
  return out
}

server.on('error', (e) => {
  console.error(e.code === 'EADDRINUSE' ? `  Port ${PORT} is already in use. Is the bridge already running? Use --port=<number> for another.` : e)
  process.exit(1)
})
server.listen(PORT, HOST, () => {
  const pin = pairing.pin.replace(/(\d{3})(\d{3})/, '$1 $2')
  console.log()
  console.log(`  ${pink('✿ Pluffy bridge')}  ${dim(`v${VERSION}  ${os.hostname()}`)}`)
  console.log()
  const list = HOST === '0.0.0.0' ? addresses() : [{ ip: HOST, tail: 'local' }]
  console.log(`  ${dim('Address, type one of these in the app:')}`)
  for (const a of list) console.log(`    ${paint('1', `${a.ip}:${PORT}`)}  ${dim(a.tail)}`)
  if (!list.length) console.log(`    ${dim('No network found. Connect this computer to Wi-Fi or Tailscale.')}`)
  console.log()
  console.log(`  ${dim('Pairing PIN')}   ${pink(pin)}   ${dim('(works once, 10 minutes)')}`)
  console.log()
  console.log(`  ${dim(`Paired phones: ${listDevices().length}. List them with --devices, remove with --revoke <id|all>.`)}`)
  console.log(`  ${dim('Ctrl+C stops the bridge and the commands it started.')}`)
  console.log()
})

const bye = () => { tasks.stopAll(); server.close(); setTimeout(() => process.exit(0), 300).unref() }
process.on('SIGINT', bye); process.on('SIGTERM', bye)
process.on('exit', () => tasks.stopAll())
