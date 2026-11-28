// Client for the Pluffy bridge (bridge/server.js). Plain fetch, no React Native imports, so it can be
// tested from Node against a real bridge (see scripts/smoke.ts).

export type Conn = { base: string; token?: string }

export class ApiError extends Error {
  status: number
  kind: 'network' | 'timeout' | 'http' | 'auth'
  data: any
  constructor(message: string, status: number, kind: ApiError['kind'], data?: any) {
    super(message); this.status = status; this.kind = kind; this.data = data
  }
}

export type FieldType = 'text' | 'textarea' | 'select' | 'multi' | 'check' | 'tatemono' | 'project'
export type Option = { v: string; l: string }
export type Field = {
  id: string; type: FieldType; label: string; placeholder: string; hint: string
  required: boolean; optional: boolean; optionalLabel: string; value: any; pattern: string | null; options: Option[] | null
}
export type Item = {
  id: string; group: string; icon: string; title: string; desc: string; cli: string
  kind: 'run' | 'form' | 'repo'; repo: string | null; laptopOnly: boolean; form: { fields: Field[] } | null
}
export type Menu = { from: string; groups: { id: string; title: string; sub: string }[]; items: Item[] }
export type TaskStatus = 'running' | 'done' | 'failed' | 'stopped'
export type TaskBrief = { id: string; label: string; shown: string; status: TaskStatus; code: number | null; startedAt: number; endedAt: number | null }
export type TaskRead = TaskBrief & { from: number; lines: string[]; next: number; cur: string }
export type Info = {
  ok: boolean; bridge: string; v: number; name: string; platform: string; node: string; folder: string
  uptime: number; running: number; stacks: { k: string; v: string }[]
}
export type Device = { id: string; name: string; platform: string; createdAt: number; lastSeen: number }
export type RepoInfo = { git: boolean; branch?: string; changes?: number; ahead?: number; behind?: number; upstream?: string | null }
export type Problem = { level: 'error' | 'warning'; line: number; message: string }

export const DEFAULT_PORT = 7471

// "192.168.1.20", "laptop.local:7471" or "http://100.64.0.5:7471/" all work.
export function normalizeAddress(raw: string): { base: string; display: string } | null {
  const s = raw.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
  if (!s) return null
  let host = s, port = String(DEFAULT_PORT)
  const m = /^(.*):(\d{1,5})$/.exec(s)
  if (m) { host = m[1]; port = m[2] }
  if (!/^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(host)) return null
  if (Number(port) < 1 || Number(port) > 65535) return null
  return { base: `http://${host}:${port}`, display: `${host}:${port}` }
}

const NO_ROUTE = "Can't reach the laptop. Check that it is on, the bridge is running, and both devices are on the same Wi-Fi or Tailscale."

async function req<T>(c: Conn, method: string, path: string, body?: unknown, ms = 8000): Promise<T> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), ms)
  let res: Response
  try {
    res = await fetch(c.base + path, {
      method, signal: ctl.signal,
      headers: { ...(c.token ? { Authorization: `Bearer ${c.token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (e: any) {
    clearTimeout(timer)
    if (e?.name === 'AbortError') throw new ApiError('The laptop did not answer in time.', 0, 'timeout')
    throw new ApiError(NO_ROUTE, 0, 'network')
  }
  clearTimeout(timer)
  let data: any = null
  try { data = await res.json() } catch { /* not json */ }
  if (!res.ok) {
    const auth = res.status === 401 && !!c.token
    throw new ApiError(auth ? 'This phone was removed from the laptop. Pair it again.' : data?.error || `The laptop answered ${res.status}.`, res.status, auth ? 'auth' : 'http', data)
  }
  return data as T
}

export const api = {
  ping: (base: string, ms = 4000) => req<{ ok: boolean; bridge: string; v: number; name: string }>({ base }, 'GET', '/api/ping', undefined, ms).then((r) => {
    if (r?.bridge !== 'pluffy') throw new ApiError('Something answered, but it is not a Pluffy bridge.', 0, 'http')
    return r
  }),
  pair: (base: string, pin: string, name: string, platform: string) => req<{ ok: boolean; token: string; id: string; name: string }>({ base }, 'POST', '/api/pair', { pin, name, platform }),
  state: (c: Conn) => req<Info>(c, 'GET', '/api/state'),
  menu: (c: Conn) => req<Menu>(c, 'GET', '/api/menu'),
  lists: (c: Conn) => req<{ tatemonos: string[]; projects: string[] }>(c, 'GET', '/api/lists'),
  build: (c: Conn, id: string, values: Record<string, unknown>) => req<{ lists: string[][]; preview: string; title: string }>(c, 'POST', '/api/build', { id, values }),
  run: (c: Conn, payload: { id: string; values?: Record<string, unknown> } | { command: string }) => req<{ ok: boolean; task: TaskBrief }>(c, 'POST', '/api/run', payload),
  tasks: (c: Conn) => req<{ tasks: TaskBrief[]; running: number }>(c, 'GET', '/api/tasks'),
  task: (c: Conn, id: string, since: number, wait = 0) => req<TaskRead>(c, 'GET', `/api/tasks/${id}?since=${since}&wait=${wait}`, undefined, wait * 1000 + 10000),
  stop: (c: Conn, id: string) => req<{ ok: boolean }>(c, 'POST', `/api/tasks/${id}/stop`, {}),
  remove: (c: Conn, id: string) => req<{ ok: boolean }>(c, 'DELETE', `/api/tasks/${id}`),
  files: (c: Conn, name: string) => req<{ files: { path: string; size: number }[] }>(c, 'GET', `/api/tatemono/${encodeURIComponent(name)}/files`),
  readFile: (c: Conn, name: string, path: string) => req<{ text?: string; binary?: boolean; tooBig?: boolean; mtime: number; size: number }>(c, 'GET', `/api/tatemono/${encodeURIComponent(name)}/file?path=${encodeURIComponent(path)}`),
  writeFile: (c: Conn, name: string, path: string, text: string, baseMtime?: number) => req<{ mtime: number }>(c, 'PUT', `/api/tatemono/${encodeURIComponent(name)}/file?path=${encodeURIComponent(path)}`, { text, baseMtime }, 20000),
  check: (c: Conn, name: string) => req<{ problems: Problem[]; errors: number; warnings: number; output: string }>(c, 'POST', `/api/tatemono/${encodeURIComponent(name)}/check`, {}, 40000),
  repo: (c: Conn) => req<RepoInfo>(c, 'GET', '/api/repo'),
  repoRun: (c: Conn, op: 'push' | 'pull') => req<{ ok: boolean; task: TaskBrief }>(c, 'POST', `/api/repo/${op}`, {}),
  devices: (c: Conn) => req<{ devices: Device[]; you: string }>(c, 'GET', '/api/devices'),
  revoke: (c: Conn, id: string) => req<{ ok: boolean }>(c, 'DELETE', `/api/devices/${id}`),
}
