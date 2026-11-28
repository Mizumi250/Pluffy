// Paired phones and the pairing PIN.
// Tokens are never stored: only their SHA-256, in ~/.pluffy/bridge.json (owner-only file).
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'

const FILE = path.join(os.homedir(), '.pluffy', 'bridge.json')
let data = null

function load() {
  if (data) return data
  try { data = JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch { data = { devices: [] } }
  if (!Array.isArray(data.devices)) data.devices = []
  return data
}
function save() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), { mode: 0o600 })
}

const sha = (t) => crypto.createHash('sha256').update(String(t)).digest('hex')
const same = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y) }

export const listDevices = () => load().devices.map(({ hash, ...d }) => d)

export function addDevice({ name, platform }) {
  const token = crypto.randomBytes(32).toString('base64url')
  const dev = {
    id: crypto.randomBytes(4).toString('hex'),
    name: String(name || 'Phone').slice(0, 40), platform: String(platform || '').slice(0, 20),
    hash: sha(token), createdAt: Date.now(), lastSeen: Date.now(),
  }
  load().devices.push(dev); save()
  return { id: dev.id, token }
}

let lastWrite = 0
export function findByToken(token) {
  if (!token) return null
  const h = sha(token)
  const dev = load().devices.find((d) => same(d.hash, h))
  if (dev && Date.now() - lastWrite > 60_000) { dev.lastSeen = Date.now(); lastWrite = Date.now(); try { save() } catch { /* not fatal */ } }
  return dev ?? null
}

export function removeDevice(id) {
  const d = load()
  const before = d.devices.length
  d.devices = d.devices.filter((x) => id !== 'all' && x.id !== id)
  if (d.devices.length !== before) save()
  return before - d.devices.length
}

// A 6 digit PIN that works once and for 10 minutes. 5 wrong tries from one address lock it for a minute.
export class Pairing {
  constructor(onRotate) { this.onRotate = onRotate; this.fails = new Map(); this.rotate(false) }

  rotate(announce = true) {
    this.pin = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
    this.expires = Date.now() + 10 * 60_000
    if (announce) this.onRotate?.(this.pin)
  }

  check(ip, given) {
    const f = this.fails.get(ip) ?? { n: 0, until: 0 }
    if (f.until > Date.now()) return { ok: false, locked: Math.ceil((f.until - Date.now()) / 1000) }
    if (Date.now() > this.expires) this.rotate()
    if (typeof given === 'string' && given.length === 6 && same(given, this.pin)) {
      this.fails.delete(ip); this.rotate()
      return { ok: true }
    }
    f.n++
    if (f.n >= 5) { f.n = 0; f.until = Date.now() + 60_000 }
    this.fails.set(ip, f)
    return { ok: false, locked: f.until > Date.now() ? 60 : 0 }
  }
}
