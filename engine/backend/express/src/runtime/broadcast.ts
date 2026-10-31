// Pusher-protocol websocket hub (what Laravel Reverb provides), so laravel-echo / pusher-js
// frontends connect unchanged. Public, private (HMAC-signed) and presence channels.
import { WebSocketServer, WebSocket } from 'ws'
import * as crypto from 'crypto'
import * as http from 'http'
import { env, Log } from './support'

interface Client { id: string; ws: WebSocket; channels: Set<string>; info: Map<string, any> }
const clients = new Map<WebSocket, Client>()
const channels = new Map<string, Set<Client>>()

const key    = () => env('REVERB_APP_KEY', 'pluff-key')!
const secret = () => env('REVERB_APP_SECRET', 'pluff-secret')!
export const signChannel = (socketId: string, channel: string, channelData?: string) =>
  `${key()}:${crypto.createHmac('sha256', secret()).update(channelData ? `${socketId}:${channel}:${channelData}` : `${socketId}:${channel}`).digest('hex')}`

const out = (ws: WebSocket, event: string, data: any, channel?: string) =>
  ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify({ event, ...(channel ? { channel } : {}), data: typeof data === 'string' ? data : JSON.stringify(data) }))

function members(channel: string) {
  const ids: string[] = []; const hash: Record<string, any> = {}
  for (const c of channels.get(channel) ?? []) { const info = c.info.get(channel); if (info) { ids.push(String(info.user_id)); hash[String(info.user_id)] = info.user_info } }
  return { presence: { count: ids.length, ids, hash } }
}

function subscribe(c: Client, msg: any) {
  const ch: string = msg.channel
  const isPrivate = ch.startsWith('private-'), isPresence = ch.startsWith('presence-')
  if (isPrivate || isPresence) {
    const expected = signChannel(c.id, ch, isPresence ? msg.channel_data : undefined)
    if (msg.auth !== expected) return out(c.ws, 'pusher:error', { code: 4009, message: 'Connection is unauthorized' })
  }
  if (!channels.has(ch)) channels.set(ch, new Set())
  channels.get(ch)!.add(c); c.channels.add(ch)
  if (isPresence) {
    try { c.info.set(ch, JSON.parse(msg.channel_data)) } catch { /* ignore */ }
    out(c.ws, 'pusher_internal:subscription_succeeded', members(ch), ch)
    for (const o of channels.get(ch)!) if (o !== c) out(o.ws, 'pusher_internal:member_added', c.info.get(ch), ch)
  } else out(c.ws, 'pusher_internal:subscription_succeeded', {}, ch)
}

function drop(c: Client) {
  for (const ch of c.channels) {
    channels.get(ch)?.delete(c)
    if (ch.startsWith('presence-') && c.info.get(ch)) for (const o of channels.get(ch) ?? []) out(o.ws, 'pusher_internal:member_removed', { user_id: c.info.get(ch).user_id }, ch)
    if (!channels.get(ch)?.size) channels.delete(ch)
  }
  clients.delete(c.ws)
}

export function broadcastTo(channel: string, event: string, data: any) {
  for (const c of channels.get(channel) ?? []) out(c.ws, event, data, channel)
}

export class BroadcastEvent {
  static tatemono = ''
  channelType: 'public' | 'private' | 'presence' = 'public'
  channel = ''
  eventName = ''
  userId: number | null = null
  constructor(public data: Record<string, any> = {}) {}
}

/** broadcast(new SomeEvent(data)) */
export function broadcast(e: BroadcastEvent) {
  const name = e.channelType === 'public' ? e.channel : `${e.channelType}-${e.channel}${e.userId != null ? `.${e.userId}` : ''}`
  broadcastTo(name, e.eventName, e.data)
}

let server: http.Server | null = null
export function startRealtime() {
  if (server) return
  const port = Number(env('REVERB_PORT', '8080'))
  server = http.createServer((_q, r) => { r.writeHead(200); r.end('pluff realtime') })
  const wss = new WebSocketServer({ server })
  wss.on('connection', (ws, req) => {
    if (!String(req.url ?? '').startsWith('/app/')) return ws.close()
    const c: Client = { id: `${Math.floor(Math.random() * 1e9)}.${Math.floor(Math.random() * 1e9)}`, ws, channels: new Set(), info: new Map() }
    clients.set(ws, c)
    out(ws, 'pusher:connection_established', { socket_id: c.id, activity_timeout: 30 })
    ws.on('message', raw => {
      let m: any; try { m = JSON.parse(String(raw)) } catch { return }
      if (m.event === 'pusher:ping') out(ws, 'pusher:pong', {})
      else if (m.event === 'pusher:subscribe') subscribe(c, m.data)
      else if (m.event === 'pusher:unsubscribe') { channels.get(m.data.channel)?.delete(c); c.channels.delete(m.data.channel) }
    })
    ws.on('close', () => drop(c))
  })
  server.on('error', e => Log.warn(`Realtime server not started: ${e.message}`))
  server.listen(port, () => Log.info(`Realtime (Pusher protocol) on :${port}`))
}
