// Runs the real API client and ANSI parser against a live bridge. Usage:
//   node mizumi.js bridge --port=7599 --host=127.0.0.1   (in one terminal, note the PIN)
//   bun scripts/smoke.ts 127.0.0.1:7599 <PIN>
import { api, normalizeAddress, ApiError } from '../src/api'
import { parseAnsi, readable, stripAnsi } from '../src/ansi'

let fails = 0
const t = (name: string, ok: boolean, extra = '') => { if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} ${extra}`) }

// pure helpers
t('address: bare ip gets default port', normalizeAddress('192.168.1.20')?.base === 'http://192.168.1.20:7471')
t('address: scheme and slash stripped', normalizeAddress('http://100.64.0.5:7500/')?.display === '100.64.0.5:7500')
t('address: host name', normalizeAddress('laptop.local')?.base === 'http://laptop.local:7471')
t('address: rejects junk and bad port', normalizeAddress('a b') === null && normalizeAddress('x:99999') === null && normalizeAddress('') === null)
const spans = parseAnsi('\x1b[35m$ mizumi\x1b[0m plain \x1b[38;5;211mpink\x1b[1mbold\x1b[0m')
t('ansi: 4 spans, colours kept', spans.length === 4 && spans[0].color !== spans[1].color && spans[3].bold, JSON.stringify(spans.map((s) => s.text)))
t('ansi: strip', stripAnsi('\x1b[31mred\x1b[0m') === 'red')
const lumOf = (h: string) => { const f = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2] }
t('ansi: dark blue is lightened to 4.5:1 on the pane', (lumOf(readable('#000080')) + 0.05) / (lumOf('#231a1e') + 0.05) >= 4.5)

// live bridge
const [addr, pin] = process.argv.slice(2)
if (addr && pin) {
  const n = normalizeAddress(addr)!
  const p = await api.ping(n.base); t('ping', p.bridge === 'pluffy', p.name)
  try { await api.state({ base: n.base, token: 'bad' }); t('bad token rejected', false) } catch (e) { t('bad token rejected', e instanceof ApiError && e.kind === 'auth') }
  const paired = await api.pair(n.base, pin, 'Smoke test', 'bun'); t('pair', !!paired.token)
  const c = { base: n.base, token: paired.token }
  const s = await api.state(c); t('state', s.ok && s.stacks.length > 0, s.stacks.map((x) => `${x.k}=${x.v}`).join(' '))
  const menu = await api.menu(c); t('menu', menu.items.length > 10 && menu.groups.length >= 3, `${menu.items.length} cards`)
  const chk = menu.items.find((i) => i.id === 'check')!
  t('form fields typed', chk.form!.fields[0].type === 'tatemono')
  const lists = await api.lists(c); t('lists', lists.tatemonos.length > 0, `${lists.tatemonos.length} tatemonos`)
  try { await api.build(c, 'check', { t: 'no-such-tatemono' }); t('build validates', false) } catch (e) { t('build validates', e instanceof ApiError && e.status === 400, (e as Error).message) }
  const b = await api.build(c, 'check', { t: lists.tatemonos[0] }); t('build preview', b.preview === `mizumi check ${lists.tatemonos[0]}`, b.preview)
  const r = await api.run(c, { command: 'block --list' })
  let since = 0, got = 0, status = 'running'
  for (let i = 0; i < 20 && status === 'running'; i++) { const x = await api.task(c, r.task.id, since, 5); since = x.next; got += x.lines.length; status = x.status }
  t('task streams and finishes', status === 'done' && got > 50, `${got} lines`)
  const all = await api.tasks(c); t('task list', all.tasks.some((x) => x.id === r.task.id))
  const f = await api.files(c, lists.tatemonos[0]); t('files', f.files[0].path === 'core.tsx')
  const file = await api.readFile(c, lists.tatemonos[0], 'core.tsx'); t('read', typeof file.text === 'string' && file.text.length > 0)
  try { await api.writeFile(c, lists.tatemonos[0], 'core.tsx', file.text!, 1); t('stale write refused', false) } catch (e) { t('stale write refused', e instanceof ApiError && e.status === 409) }
  const k = await api.check(c, lists.tatemonos[0]); t('check', Array.isArray(k.problems), `${k.errors} errors ${k.warnings} warnings`)
  const rp = await api.repo(c); t('repo info', rp.git === true, `${rp.branch}`)
  const d = await api.devices(c); t('devices lists this phone', d.devices.some((x) => x.id === d.you && x.name === 'Smoke test'))
  await api.revoke(c, paired.id)
  try { await api.state(c); t('revoked token stops working', false) } catch (e) { t('revoked token stops working', e instanceof ApiError && e.kind === 'auth') }
}
console.log(fails ? `\n${fails} FAILED` : '\nall passed')
process.exit(fails ? 1 : 0)
