import type { Response } from 'express'

const clients = new Map<string, Set<Response>>()

export function openSse(res: Response, channel: string, initial: any = null) {
  res.status(200)
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()
  const set = clients.get(channel) ?? new Set<Response>()
  set.add(res)
  clients.set(channel, set)
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(': keep-alive\n\n')
  }, 25_000)
  res.on('close', () => {
    clearInterval(heartbeat)
    set.delete(res)
    if (!set.size) clients.delete(channel)
  })
  if (initial !== null) res.write(`event: message\ndata: ${JSON.stringify(initial)}\n\n`)
}

export function publishSse(channel: string, data: any, event = 'message') {
  const payload = JSON.stringify(data)
  for (const res of clients.get(channel) ?? []) {
    if (!res.writableEnded) res.write(`event: ${event}\ndata: ${payload}\n\n`)
  }
}
