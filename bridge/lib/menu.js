// The phone shows the same cards as Pluffy Studio. They come from gui/renderer/menu.js (loaded with a fake window,
// like the TUI does), so the GUI, the TUI and the phone can never disagree. Form "build" functions stay here:
// the phone sends field values and gets the command back, so nothing is rebuilt in the app.
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { ROOT, TATEMONOS, PROJECTS } from './paths.js'

const FALLBACK = {
  groups: [{ id: 'run', title: 'Run it', sub: 'Set up and launch' }, { id: 'write', title: 'Write it', sub: 'Create and edit' }, { id: 'stack', title: 'Stacks', sub: 'Web, app, desktop, backend, database' }],
  items: [
    { id: 'setup', group: 'run', icon: 'wrench', title: 'Setup', desc: 'Check your toolchains and install what is missing.', cli: 'mizumi setup', run: ['setup'] },
    { id: 'start', group: 'run', icon: 'play', title: 'Start engine', desc: 'Run web, app and desktop together.', cli: 'mizumi start', run: ['start'] },
    { id: 'modules', group: 'write', icon: 'building-2', title: 'List tatemonos', desc: 'All tatemonos and their pages.', cli: 'mizumi modules', run: ['modules'] },
    { id: 'check', group: 'write', icon: 'square-check', title: 'Check', desc: 'Lint every tatemono.', cli: 'mizumi check', run: ['check'] },
    { id: 'stack-now', group: 'stack', icon: 'map-pin', title: 'Active stacks', desc: 'The stacks currently in use.', cli: 'mizumi stack', run: ['stack'] },
    { id: 'stacks', group: 'stack', icon: 'layers', title: 'All stacks', desc: 'Every supported stack.', cli: 'mizumi stacks', run: ['stacks'] },
  ],
}

let cache = null
function load() {
  const file = path.join(ROOT, 'gui', 'renderer', 'menu.js')
  let mtime = 0
  try { mtime = fs.statSync(file).mtimeMs } catch { /* no gui/ in this copy */ }
  if (cache && cache.mtime === mtime) return cache
  let menu = FALLBACK, from = 'built-in'
  try {
    const box = { window: {} }
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), box, { filename: file, timeout: 2000 })
    if (box.window.MENU?.items?.length) { menu = box.window.MENU; from = 'gui' }
  } catch { /* built-in list */ }
  // Install / Uninstall of Documents/Pluffy belong to the Studio app, not to this computer's repo
  const items = menu.items.filter((i) => !i.repo || i.repo === 'push' || i.repo === 'pull')
  const groups = menu.groups.filter((g) => items.some((i) => i.group === g.id))
  cache = { mtime, items, groups, from }
  return cache
}

const norm = (o) => (typeof o === 'string' ? { v: o, l: o } : { v: String(o.v), l: String(o.l ?? o.v) })

// Commands that ask questions in the terminal. They need a real keyboard, so they stay on the laptop.
const GUIDED = new Set(['block', 'deps', 'publish', 'ai', 'review'])
export const needsTty = (args) => args.length === 0 || (args.length === 1 && GUIDED.has(args[0]))

export function describeMenu() {
  const { items, groups, from } = load()
  return {
    from,
    groups: groups.map(({ id, title, sub }) => ({ id, title, sub })),
    items: items.map((i) => ({
      id: i.id, group: i.group, icon: i.icon, title: i.title, desc: i.desc, cli: i.cli,
      kind: i.repo ? 'repo' : i.form ? 'form' : 'run',
      repo: i.repo ?? null,
      laptopOnly: !i.form && !i.repo && (i.run ? needsTty(i.run) : false),
      form: i.form ? {
        fields: i.form.fields.map((f) => ({
          id: f.id, type: f.type, label: f.label ?? f.id, placeholder: f.placeholder ?? '', hint: f.hint ?? '',
          required: !!f.required, optional: !!f.optional, optionalLabel: f.optionalLabel ?? '',
          value: f.value ?? (f.type === 'multi' ? [] : f.type === 'check' ? false : ''),
          pattern: f.pattern ? f.pattern.source : null,
          options: Array.isArray(f.options) ? f.options.map(norm) : null,
        })),
      } : null,
    })),
  }
}

const dirs = (p, needFile) => {
  try {
    return fs.readdirSync(p, { withFileTypes: true })
      .filter((e) => e.isDirectory() && (!needFile || fs.existsSync(path.join(p, e.name, needFile))))
      .map((e) => e.name).sort((a, b) => a.localeCompare(b))
  } catch { return [] }
}
export const listTatemonos = () => dirs(TATEMONOS, 'core.tsx')
export const listProjects = () => dirs(PROJECTS)

const fail = (message, status = 400) => Object.assign(new Error(message), { status })

// Turns a card + the values from the phone into a list of argument lists, with the same checks as the GUI form.
export function buildArgs(id, input = {}) {
  const item = load().items.find((i) => i.id === id)
  if (!item) throw fail('That command is not on this laptop.', 404)
  if (item.repo) throw fail('Use the repo endpoint for this one.')
  let lists
  if (item.form) {
    const values = {}
    const tats = listTatemonos(), projs = listProjects()
    for (const f of item.form.fields) {
      const given = input[f.id]
      if (f.type === 'multi') values[f.id] = Array.isArray(given) ? given.map(String) : [...(f.value ?? [])]
      else if (f.type === 'check') values[f.id] = given === undefined ? !!f.value : !!given
      else values[f.id] = given == null ? String(f.value ?? '') : String(given)
      const v = values[f.id], label = f.label ?? f.id
      if (f.required && (v === '' || (Array.isArray(v) && !v.length))) throw fail(`${label} is required.`)
      if (f.pattern && v && !f.pattern.test(v)) throw fail(f.hint ? `${label}: ${f.hint}` : `${label} is not valid.`)
      if (f.type === 'tatemono' && v && !tats.includes(v)) throw fail(`No tatemono called ${v}.`)
      if (f.type === 'project' && v && !projs.includes(v)) throw fail(`No exported project called ${v}.`)
      if (f.type === 'select' && v && Array.isArray(f.options) && !f.options.map(norm).some((o) => o.v === v)) throw fail(`${label}: pick one of the options.`)
      if (f.type === 'multi') { const ok = (f.options ?? []).map(norm).map((o) => o.v); if (v.some((x) => !ok.includes(x))) throw fail(`${label}: pick from the options.`) }
      if (f.type === 'text' && v.startsWith('-')) throw fail(`${label} cannot start with a dash.`)
    }
    const msg = item.form.validate?.(values)
    if (msg) throw fail(msg)
    const out = item.form.build(values)
    lists = Array.isArray(out[0]) ? out : [out]
  } else lists = [item.run ?? (item.action === 'chat' ? ['chat'] : [])]
  lists = lists.map((l) => l.map(String))
  if (lists.some(needsTty)) throw fail('This one asks questions in the terminal. Run it on the laptop, or fill in the form fields so it can run without them.', 409)
  return { item, lists }
}

// What the composer on the phone may start. Same commands as mizumi.js, minus the ones that need a keyboard.
const ALLOWED = new Set(['start', 'setup', 'screenshot', 'screenshots', 'export', 'publish', 'openapi', 'web', 'app', 'desktop', 'backend', 'db', 'deps', 'stack', 'stacks', 'modules', 'new', 'block', 'check', 'ai', 'scan', 'index', 'chat', 'help'])

export function parseCommand(line) {
  const args = []
  let cur = '', q = '', has = false
  for (const ch of String(line).trim().replace(/^(node\s+)?(mizumi(\.js)?)\s+/, '')) {
    if (q) { if (ch === q) q = ''; else cur += ch } else if (ch === '"' || ch === "'") { q = ch; has = true } else if (/\s/.test(ch)) { if (cur || has) args.push(cur); cur = ''; has = false } else cur += ch
  }
  if (q) throw fail('Close the quote.')
  if (cur || has) args.push(cur)
  if (!args.length) throw fail('Type a command, for example: check')
  if (args.length > 40 || args.some((a) => a.length > 2000)) throw fail('That command is too long.')
  if (!ALLOWED.has(args[0])) throw fail(`mizumi ${args[0]} is not available from the phone.`, 403)
  if (needsTty(args)) throw fail(`mizumi ${args[0]} asks questions in the terminal. Add its details, or run it on the laptop.`, 409)
  return args
}
