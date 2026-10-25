'use strict'
// Slash commands. Only these map to `node mizumi.js ...`. Model output is never executed.

const fs = require('node:fs')
const path = require('node:path')

const WEB = ['nextjs', 'react-vite', 'react-inertia', 'astro', 'tanstack-start']
const APP = ['expo', 'react-native', 'lynx']
const DESKTOP = ['tauri', 'electron']
const ALL_STACKS = [...WEB, ...APP, ...DESKTOP]
const DB_ALIAS = { sqlite: 'sqlite', pgsql: 'postgresql', postgres: 'postgresql', postgresql: 'postgresql', pg: 'postgresql' }
const NAME = /^[A-Za-z0-9][A-Za-z0-9_-]{0,60}$/

// shell-like split that understands "double" and 'single' quotes (no shell is ever used)
function tokenize(s) {
  const out = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3])
  return out
}

const ok = (args, display, confirm) => ({ ok: true, args, display, confirm })
const fail = (error) => ({ ok: false, error })

const simple = (name, desc, confirm) => ({
  usage: `/${name}`, desc,
  build: () => ok([name], `node mizumi.js ${name}`, confirm),
})

const stackSwitch = (name, list, label) => ({
  usage: `/${name} <${list.join('|')}>`, desc: `Switch the ${label} stack`,
  build: (t) => {
    if (!t[0] || !list.includes(t[0])) return fail(`usage: /${name} <${list.join('|')}>`)
    return ok([name, t[0]], `node mizumi.js ${name} ${t[0]}`, `Switch the ${label} stack to ${t[0]}? This edits arkzen.json.`)
  },
})

const AI_OPTS = {
  tables: (v) => v.length <= 600,
  pages: (v) => /^[A-Za-z0-9_,-]+$/.test(v),
  slug: (v) => NAME.test(v),
  tries: (v) => /^[1-5]$/.test(v),
  ref: (v) => v === 'on' || v === 'off',
  guide: (v) => v === 'full' || v === 'off',
}

const COMMANDS = {
  help: { usage: '/help', desc: 'Show all commands', local: true },
  modules: simple('modules', 'List registered tatemonos'),
  stacks: simple('stacks', 'List all stacks and install status'),
  stack: simple('stack', 'Show the active web, app and desktop stacks'),
  scan: simple('scan', 'Scan tatemonos into training data (rewrites dataset files)', 'Run the scan? It rewrites dataset.jsonl, blocks.jsonl and related files in the repo root.'),
  start: simple('start', 'Start the engine (stays running until you press Stop)', 'Start the engine? It keeps running until you press Stop on its output.'),
  setup: simple('setup', 'Run one-time setup', 'Run setup? This installs dependencies and can take a while.'),
  web: stackSwitch('web', WEB, 'web'),
  app: stackSwitch('app', APP, 'app'),
  desktop: stackSwitch('desktop', DESKTOP, 'desktop'),
  db: {
    usage: '/db <sqlite|postgresql>', desc: 'Switch the database',
    build: (t) => {
      const v = t[0] && DB_ALIAS[t[0].toLowerCase()]
      if (!v) return fail('usage: /db <sqlite|postgresql>')
      return ok(['db', v], `node mizumi.js db ${v}`, `Switch the database to ${v}? This edits arkzen.json.`)
    },
  },
  export: {
    usage: '/export <tatemono> <stack>', desc: 'Export a tatemono as a standalone project',
    build: (t, ctx) => {
      if (!t[0] || !t[1]) return fail(`usage: /export <tatemono> <stack>   (stacks: ${ALL_STACKS.join(', ')})`)
      if (!NAME.test(t[0])) return fail('that tatemono name is not valid')
      if (!ALL_STACKS.includes(t[1])) return fail(`unknown stack "${t[1]}". Use one of: ${ALL_STACKS.join(', ')}`)
      if (!fs.existsSync(path.join(ctx.root, 'tatemonos', t[0]))) return fail(`no tatemono named "${t[0]}". Use /modules to list them.`)
      return ok(['export', t[0], t[1]], `node mizumi.js export ${t[0]} ${t[1]}`, `Export ${t[0]} with the ${t[1]} stack into projects/${t[0]}?`)
    },
  },
  ai: {
    usage: '/ai <idea> [--tables "tasks(title:string)"] [--pages index] [--slug name] [--tries 3] [--ref on] [--guide full]',
    desc: 'Generate a tatemono with your model',
    build: (t, ctx) => {
      const words = []
      const opts = []
      for (let i = 0; i < t.length; i++) {
        if (t[i].startsWith('--')) {
          const k = t[i].slice(2)
          const v = t[i + 1]
          if (!AI_OPTS[k]) return fail(`option --${k} is not allowed here. Allowed: ${Object.keys(AI_OPTS).map((x) => '--' + x).join(', ')}`)
          if (v === undefined || v.startsWith('--') || !AI_OPTS[k](v)) return fail(`bad value for --${k}`)
          opts.push(t[i], v); i++
        } else words.push(t[i])
      }
      const idea = words.join(' ').trim()
      if (!idea) return fail('usage: ' + COMMANDS.ai.usage)
      if (idea.length > 500) return fail('the idea is too long (500 characters max)')
      const s = ctx.settings
      const args = ['ai', idea, ...opts, '--server', s.server, '--model', s.model, ...(s.key ? ['--key', s.key] : [])]
      const display = `node mizumi.js ai ${JSON.stringify(idea)}${opts.length ? ' ' + opts.map((x) => (/\s|\(/.test(x) ? JSON.stringify(x) : x)).join(' ') : ''}`
      const slugIdx = opts.indexOf('--slug')
      const exists = slugIdx >= 0 && fs.existsSync(path.join(ctx.root, 'tatemonos', opts[slugIdx + 1]))
      return ok(args, display, exists ? `tatemonos/${opts[slugIdx + 1]} already exists. Overwrite its core.tsx?` : undefined)
    },
  },
}

function helpText() {
  const rows = Object.values(COMMANDS).map((c) => `${c.usage}\n    ${c.desc}`)
  return 'Master Mizumi, these are the commands I can run:\n\n' + rows.join('\n') +
    '\n\nAnything that does not start with / is sent to the model.'
}

function parseCommand(text, ctx) {
  const tokens = tokenize(text.trim().slice(1))
  const name = (tokens.shift() || '').toLowerCase()
  if (!name) return fail('type a command after /. Try /help.')
  const spec = COMMANDS[name]
  if (!spec) return fail(`I do not know /${name}. Try /help.`)
  if (spec.local) return { ok: true, local: true, text: helpText() }
  return spec.build(tokens, ctx)
}

const listCommands = () => Object.entries(COMMANDS).map(([name, c]) => ({ name, usage: c.usage, desc: c.desc }))

module.exports = { parseCommand, listCommands, tokenize }