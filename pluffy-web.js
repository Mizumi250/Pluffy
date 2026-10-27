#!/usr/bin/env node
// pluffy-web.js: phone-friendly web page that runs pluffy-ai.js on this machine.
// Put this file in the repo root (next to pluffy-ai.js). Node 18+, no npm packages.
//
//   PLUFFY_PASS=your-long-passcode node pluffy-web.js
//
// Env:  PLUFFY_PASS   required. Passcode you type on the page.
//       PORT          default 3100
//       HOST          default 127.0.0.1 (put nginx/Caddy/Tailscale in front, or set 0.0.0.0)
//       MODEL_URL     optional default for the model server field (e.g. your Colab tunnel URL)
//
// Output goes to ./generated/<slug>/core.tsx (+ report.json), separate from tatemonos/.

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(ROOT, 'generated')
const PORT = Number(process.env.PORT || 3100)
const HOST = process.env.HOST || '127.0.0.1'
const PASS = process.env.PLUFFY_PASS || ''
const DEFAULT_MODEL_URL = process.env.MODEL_URL || ''
const MAX_RUN_MS = 90 * 60 * 1000

if (PASS.length < 8) {
  console.error('  x Set PLUFFY_PASS to a passcode of at least 8 characters.')
  process.exit(1)
}
fs.mkdirSync(OUT_DIR, { recursive: true })

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/
let current = null // { child, started }

function authed(req) {
  const given = Buffer.from(String(req.headers['x-pass'] || ''))
  const want = Buffer.from(PASS)
  return given.length === want.length && crypto.timingSafeEqual(given, want)
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (c) => {
      body += c
      if (body.length > 20000) { reject(new Error('body too large')); req.destroy() }
    })
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')) } catch (e) { reject(e) } })
    req.on('error', reject)
  })
}

function send(res, code, type, body, extra = {}) {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', ...extra })
  res.end(body)
}

function listGenerated() {
  return fs.readdirSync(OUT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && SLUG_RE.test(d.name) && fs.existsSync(path.join(OUT_DIR, d.name, 'core.tsx')))
    .map((d) => ({ slug: d.name, mtime: fs.statSync(path.join(OUT_DIR, d.name, 'core.tsx')).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
    .map((x) => x.slug)
}

async function handleRun(req, res) {
  if (current) return send(res, 409, 'text/plain; charset=utf-8', 'A run is already in progress. Wait for it or press Stop.\n')
  let p
  try { p = await readJson(req) } catch { return send(res, 400, 'text/plain; charset=utf-8', 'Bad request.\n') }

  const idea = String(p.idea || '').trim().replace(/^-+\s*/, '')
  if (!idea) return send(res, 400, 'text/plain; charset=utf-8', 'Describe the app first.\n')
  const server = String(p.server || DEFAULT_MODEL_URL).trim()
  if (!/^https?:\/\//i.test(server)) return send(res, 400, 'text/plain; charset=utf-8', 'Model server URL must start with http:// or https://\n')

  const args = ['pluffy-ai.js', idea, '--server', server, '--out', 'generated']
  const model = String(p.model || '').trim()
  const key = String(p.key || '').trim()
  const tables = String(p.tables || '').trim()
  const pages = String(p.pages || '').trim()
  const slug = String(p.slug || '').trim().toLowerCase()
  const tries = Number(p.tries)
  if (model) args.push('--model', model)
  if (key) args.push('--key', key)
  if (tables) args.push('--tables', tables)
  if (pages) args.push('--pages', pages)
  if (slug) {
    if (!SLUG_RE.test(slug)) return send(res, 400, 'text/plain; charset=utf-8', 'Slug: lowercase letters, numbers, dashes only.\n')
    args.push('--slug', slug)
  }
  if (Number.isInteger(tries) && tries >= 1 && tries <= 6) args.push('--tries', String(tries))
  if (p.fullGuide) args.push('--guide', 'full')

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' })
  const child = spawn(process.execPath, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] })
  current = { child, started: Date.now() }
  const killTimer = setTimeout(() => child.kill('SIGTERM'), MAX_RUN_MS)
  const pipe = (d) => { if (!res.writableEnded) res.write(d) }
  child.stdout.on('data', pipe)
  child.stderr.on('data', pipe)
  child.on('error', (e) => pipe(`\nCould not start: ${e.message}\n`))
  child.on('close', (code) => {
    clearTimeout(killTimer)
    current = null
    if (!res.writableEnded) res.end(`\n[exit ${code}]\n`)
  })
  // Phone locked or tab closed: stop the run so it doesn't keep burning the model.
  res.on('close', () => { if (current && current.child === child) child.kill('SIGTERM') })
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x')
    if (req.method === 'GET' && url.pathname === '/') {
      return send(res, 200, 'text/html; charset=utf-8', PAGE.replace('__MODEL_URL__', JSON.stringify(DEFAULT_MODEL_URL)))
    }
    if (!authed(req)) return send(res, 401, 'text/plain; charset=utf-8', 'Wrong passcode.\n')

    if (req.method === 'POST' && url.pathname === '/api/run') return handleRun(req, res)
    if (req.method === 'POST' && url.pathname === '/api/stop') {
      if (current) current.child.kill('SIGTERM')
      return send(res, 200, 'text/plain; charset=utf-8', 'ok')
    }
    if (req.method === 'GET' && url.pathname === '/api/list') {
      return send(res, 200, 'application/json', JSON.stringify({ slugs: listGenerated(), busy: !!current }))
    }
    if (req.method === 'GET' && (url.pathname === '/api/file' || url.pathname === '/api/download')) {
      const slug = url.searchParams.get('slug') || ''
      const which = url.searchParams.get('f') === 'report' ? 'report.json' : 'core.tsx'
      if (!SLUG_RE.test(slug)) return send(res, 400, 'text/plain; charset=utf-8', 'Bad slug.\n')
      const file = path.join(OUT_DIR, slug, which)
      if (!fs.existsSync(file)) return send(res, 404, 'text/plain; charset=utf-8', 'Not found.\n')
      const extra = url.pathname === '/api/download' ? { 'Content-Disposition': `attachment; filename="${slug}-${which}"` } : {}
      return send(res, 200, 'text/plain; charset=utf-8', fs.readFileSync(file), extra)
    }
    return send(res, 404, 'text/plain; charset=utf-8', 'Not found.\n')
  } catch (e) {
    if (!res.headersSent) send(res, 500, 'text/plain; charset=utf-8', 'Server error.\n')
    else res.end()
  }
})

// Generation can take a long time on slow model servers. Don't let Node close the stream.
server.requestTimeout = 0
server.headersTimeout = 65000
server.timeout = 0
server.listen(PORT, HOST, () => console.log(`  Pluffy web on http://${HOST}:${PORT}`))

const PAGE = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pluffy</title>
<style>
  :root { color-scheme: dark; --bg:#0f1115; --card:#181b22; --line:#2a2f3a; --fg:#e8eaf0; --dim:#8b93a5; --acc:#9b8cff; --bad:#ff7a7a; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:15px/1.45 system-ui,sans-serif; padding:14px; max-width:720px; margin-inline:auto; }
  h1 { font-size:18px; margin:4px 0 12px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:12px; margin-bottom:12px; }
  label { display:block; font-size:12px; color:var(--dim); margin:10px 0 4px; }
  input, textarea { width:100%; background:#0f1115; color:var(--fg); border:1px solid var(--line); border-radius:8px; padding:10px; font:inherit; }
  textarea { min-height:90px; resize:vertical; }
  .row { display:flex; gap:8px; } .row > * { flex:1; }
  button { background:var(--acc); color:#12101f; border:0; border-radius:8px; padding:11px 14px; font:inherit; font-weight:600; }
  button.sec { background:#262b36; color:var(--fg); }
  button:disabled { opacity:.5; }
  pre { margin:0; white-space:pre-wrap; word-break:break-word; font:12px/1.5 ui-monospace,monospace; max-height:50vh; overflow:auto; }
  .chips { display:flex; flex-wrap:wrap; gap:6px; }
  .chip { background:#262b36; border-radius:999px; padding:6px 11px; font-size:13px; }
  details summary { color:var(--dim); font-size:13px; }
  .err { color:var(--bad); font-size:13px; }
</style></head>
<body>
<h1>Pluffy</h1>

<div class="card" id="lock">
  <label>Passcode</label>
  <div class="row"><input id="pass" type="password" autocomplete="current-password"><button id="unlock" style="flex:0 0 auto">Unlock</button></div>
  <div class="err" id="lockErr"></div>
</div>

<div id="app" hidden>
  <div class="card">
    <label>Model server URL (your Colab tunnel or Ollama)</label>
    <input id="server" placeholder="https://xxxx.trycloudflare.com" autocapitalize="off" autocorrect="off">
    <details><summary>Model options</summary>
      <label>Model name</label><input id="model" value="pluffy-v12" autocapitalize="off">
      <label>API key (if any)</label><input id="key" type="password">
      <label>Tries per block</label><input id="tries" type="number" min="1" max="6" value="3">
      <label><input id="full" type="checkbox" style="width:auto"> Send full guide</label>
    </details>
  </div>

  <div class="card">
    <label>What should it build?</label>
    <textarea id="idea" placeholder="a clinic booking app with patients and appointments"></textarea>
    <details><summary>Optional: tables, pages, slug</summary>
      <label>Tables</label><input id="tables" placeholder="tasks(title:string,done:boolean,due_date:date)" autocapitalize="off">
      <label>Pages</label><input id="pages" placeholder="index,admin" autocapitalize="off">
      <label>Slug</label><input id="slug" placeholder="my-app" autocapitalize="off">
    </details>
    <div class="row" style="margin-top:12px"><button id="run">Generate</button><button id="stop" class="sec" disabled>Stop</button></div>
  </div>

  <div class="card"><pre id="log">Idle.</pre></div>

  <div class="card">
    <div class="row"><strong style="flex:1;align-self:center">Generated</strong><button class="sec" id="refresh" style="flex:0 0 auto">Refresh</button></div>
    <div class="chips" id="list" style="margin-top:8px"></div>
    <div id="view" hidden style="margin-top:10px">
      <div class="row"><button class="sec" id="copy">Copy</button><a id="dl"><button class="sec" style="width:100%">Download</button></a><button class="sec" id="rep">Report</button></div>
      <pre id="code" style="margin-top:8px"></pre>
    </div>
  </div>
</div>

<script>
const $ = (id) => document.getElementById(id)
let pass = localStorage.getItem('pluffy-pass') || ''
const saved = JSON.parse(localStorage.getItem('pluffy-form') || '{}')
$('server').value = saved.server || ${'__MODEL_URL__'}
for (const k of ['model','key','tries']) if (saved[k]) $(k).value = saved[k]
let ctrl = null, shown = ''

async function api(path, opt = {}) {
  const r = await fetch(path, { ...opt, headers: { 'x-pass': pass, 'Content-Type': 'application/json', ...(opt.headers||{}) } })
  return r
}
async function unlock() {
  const r = await api('/api/list')
  if (!r.ok) { $('lockErr').textContent = 'Wrong passcode.'; return false }
  $('lock').hidden = true; $('app').hidden = false
  const j = await r.json(); renderList(j.slugs); return true
}
$('unlock').onclick = async () => { pass = $('pass').value; if (await unlock()) localStorage.setItem('pluffy-pass', pass) }
if (pass) unlock()

function renderList(slugs) {
  $('list').innerHTML = ''
  if (!slugs.length) { $('list').textContent = 'Nothing yet.'; return }
  for (const s of slugs) { const b = document.createElement('button'); b.className = 'chip sec'; b.textContent = s; b.onclick = () => open(s, 'core'); $('list').append(b) }
}
async function refresh() { const r = await api('/api/list'); if (r.ok) renderList((await r.json()).slugs) }
$('refresh').onclick = refresh

async function open(slug, f) {
  shown = slug
  const r = await api('/api/file?slug=' + encodeURIComponent(slug) + (f === 'report' ? '&f=report' : ''))
  $('code').textContent = await r.text(); $('view').hidden = false
  $('dl').onclick = async (e) => { e.preventDefault(); const t = await (await api('/api/file?slug=' + encodeURIComponent(slug))).text(); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/plain' })); a.download = slug + '-core.tsx'; a.click() }
}
$('rep').onclick = () => shown && open(shown, 'report')
$('copy').onclick = async () => { await navigator.clipboard.writeText($('code').textContent); $('copy').textContent = 'Copied'; setTimeout(() => $('copy').textContent = 'Copy', 1200) }

$('run').onclick = async () => {
  const body = { idea: $('idea').value, server: $('server').value, model: $('model').value, key: $('key').value, tries: $('tries').value, tables: $('tables').value, pages: $('pages').value, slug: $('slug').value, fullGuide: $('full').checked }
  localStorage.setItem('pluffy-form', JSON.stringify({ server: body.server, model: body.model, key: body.key, tries: body.tries }))
  $('log').textContent = ''; $('run').disabled = true; $('stop').disabled = false
  ctrl = new AbortController()
  try {
    const r = await api('/api/run', { method: 'POST', body: JSON.stringify(body), signal: ctrl.signal })
    const rd = r.body.getReader(), dec = new TextDecoder()
    for (;;) { const { done, value } = await rd.read(); if (done) break; $('log').textContent += dec.decode(value, { stream: true }); $('log').scrollTop = 1e9 }
  } catch (e) { if (e.name !== 'AbortError') $('log').textContent += '\\n' + e.message }
  $('run').disabled = false; $('stop').disabled = true; refresh()
}
$('stop').onclick = async () => { await api('/api/stop', { method: 'POST', body: '{}' }); if (ctrl) ctrl.abort() }
</script>
</body></html>`
