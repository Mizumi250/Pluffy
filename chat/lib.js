'use strict'
// Pure helpers (no Electron). Used by main.js and testable with plain node.

const fs = require('node:fs')
const path = require('node:path')

const CAP = 30000
const cap = (s) => (s.length > CAP ? s.slice(-CAP) : s)

const ANSI = /\x1b\[[0-9;?]*[ -/]*[@-~]/g
const stripAnsi = (s) => String(s).replace(ANSI, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')

// ---------- system prompt ----------
function latestGuideline(root) {
  try {
    const files = fs.readdirSync(root).filter((f) => /^PLUFF_GUIDELINES.*\.md$/i.test(f))
    files.sort((a, b) => (Number((b.match(/v(\d+)/i) || [])[1]) || 0) - (Number((a.match(/v(\d+)/i) || [])[1]) || 0))
    return files.length ? files[0].replace(/\.md$/i, '') : null
  } catch { return null }
}

// Base text matches the guideline rows the model was trained on (Colab Cell 2, build_guideline_rows).
function systemPrompt(root) {
  const g = latestGuideline(root)
  const base = 'You are the Pluff assistant. Answer from the Pluff guidelines' + (g ? ` (${g})` : '') +
    '. Be exact about tag names, block shapes and rules.'
  return base + ' The person you are talking to is Master Mizumi. Always address them as "Master Mizumi" and never as "user".' +
    ' You cannot run commands yourself. When a command is needed, tell Master Mizumi to type a slash command such as /ai, /modules or /scan.'
}

// ---------- API profile: send only the guideline sections that match the question ----------
// A fine-tuned Pluffy model knows the rules. A general API model does not, and the whole guideline is too big to send every time.
const STOP = new Set('the and for with that this what how why when are can you your pluff pluffy about from have has not use using does into per tell me'.split(' '))
function guidelineExcerpt(root, query, maxChars = 9000) {
  try {
    const g = latestGuideline(root)
    if (!g) return ''
    const lines = fs.readFileSync(path.join(root, g + '.md'), 'utf8').split('\n')
    const secs = []
    let cur = null, fence = false
    for (const ln of lines) {
      if (ln.trimStart().startsWith('```')) fence = !fence
      if (!fence && ln.startsWith('## ')) { cur = { title: ln.slice(3).trim(), body: [] }; secs.push(cur); continue }
      if (cur) cur.body.push(ln)
    }
    const words = [...new Set((String(query).toLowerCase().match(/[a-z][a-z0-9:_-]{2,}/g) || []).filter((w) => !STOP.has(w)))]
    if (!words.length) return ''
    const scored = secs.map((s) => {
      const title = s.title.toLowerCase(), body = s.body.join('\n').toLowerCase()
      let score = 0
      for (const w of words) { if (title.includes(w)) score += 4; score += Math.min(body.split(w).length - 1, 5) }
      return { s, score }
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score)
    let out = '', used = 0
    for (const { s } of scored.slice(0, 3)) {
      const text = `## ${s.title}\n${s.body.join('\n').trim()}`.slice(0, 4500)
      if (used + text.length > maxChars) break
      out += text + '\n\n'; used += text.length
    }
    return out.trim()
  } catch { return '' }
}

function systemPromptFor(root, profile, lastUser) {
  const base = systemPrompt(root)
  if (profile !== 'api') return base
  const ex = guidelineExcerpt(root, lastUser)
  return base + ' You are a general-purpose model, not trained on Pluff. Answer ONLY from the guideline excerpts below. If they do not cover the question, say you are not sure instead of guessing.' +
    (ex ? '\n\nGUIDELINE EXCERPTS:\n' + ex : '\n\n(No matching guideline section was found for this question.)')
}

// ---------- guardrail (runs on the finished reply, in code, not in the prompt) ----------
function applyGuardrail(text) {
  let t = String(text || '').trim()
  if (!t) return t
  if (t.startsWith('/*') || t.startsWith('```')) return t          // generated block: leave untouched
  t = t.replace(/\b(hello|hi|hey|dear|thanks|thank you)(,?)\s+(the\s+)?user\b/gi, (_m, w, comma) => `${w}${comma} Master Mizumi`)
  if (/master mizumi/i.test(t)) return t
  return `Master Mizumi,\n${t}`
}

// ---------- context window ----------
function buildContext(history, system, budget = 12000) {
  const out = []
  let used = system.length
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i]
    if (!m.content || !m.content.trim()) continue
    used += m.content.length
    if (used > budget && out.length) break
    out.unshift({ role: m.role, content: m.content })
  }
  while (out.length && out[0].role !== 'user') out.shift()
  return [{ role: 'system', content: system }, ...out]
}

// ---------- model stream (same endpoint and SSE format as pluffy-ai.js) ----------
// A server ending in /chat/completions (for example Gemini's OpenAI-compatible address) is used exactly as written.
const chatUrl = (server) => { const s = String(server).replace(/\/+$/, ''); return /\/chat\/completions$/.test(s) ? s : `${s}/v1/chat/completions` }
const modelsUrl = (server) => { const s = String(server).replace(/\/+$/, ''); return /\/chat\/completions$/.test(s) ? s.replace(/\/chat\/completions$/, '/models') : `${s}/v1/models` }

async function streamChat({ server, model, key, messages, signal, onToken, maxTokens = 1500, temperature = 0.2, profile = 'pluffy' }) {
  let res
  try {
    res = await fetch(chatUrl(server), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature, stream: true }),
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error(profile === 'api'
      ? 'Cannot reach the API server. Check the URL in Settings and your internet connection.'
      : 'Cannot reach the model server. Check the URL in Settings and that Colab Cell 1 is still running.')
  }
  if (!res.ok) throw new Error(`Server error ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const decoder = new TextDecoder()
  let buf = ''
  for await (const chunk of res.body) {
    buf += decoder.decode(chunk, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ') || line.includes('[DONE]')) continue
      try {
        const d = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content
        if (d) onToken(d)
      } catch { /* partial line */ }
    }
  }
}

async function checkHealth({ server, key }) {
  try {
    const res = await fetch(modelsUrl(server), {
      headers: key ? { Authorization: `Bearer ${key}` } : {},
      signal: AbortSignal.timeout(5000),
    })
    return res.ok ? { ok: true } : { ok: false, error: `Server answered ${res.status}` }
  } catch {
    return { ok: false, error: 'No answer from the server' }
  }
}

// ---------- progress parser for `node mizumi.js ai ...` output (lines printed by pluffy-ai.js) ----------
class ProgressParser {
  constructor() {
    this.buf = ''
    this.seen = false
    this.s = { total: null, blocks: {}, current: null, result: null, validator: null }
  }
  push(text) {
    this.buf += text
    let changed = false
    let i
    while ((i = this.buf.indexOf('\n')) >= 0) {
      const line = this.buf.slice(0, i).trimEnd()
      this.buf = this.buf.slice(i + 1)
      if (this._line(line)) changed = true
    }
    const m = this.buf.match(/^\[([^\]\s]+)\]\s+try\s+(\d+)/)
    const cur = m ? { tag: m[1], try: Number(m[2]) } : null
    if (JSON.stringify(cur) !== JSON.stringify(this.s.current)) { this.s.current = cur; changed = true }
    return changed && this.seen
  }
  _line(line) {
    let m
    if ((m = line.match(/^Plan:\s*(\{.*\})$/))) {
      try {
        const p = JSON.parse(m[1])
        this.s.total = 3 + 2 * (p.tables || []).length + 1 + (p.pages || []).length   // meta, meta:web, web:config, db+api per table, shared components, pages
        this.seen = true
        return true
      } catch { return false }
    }
    if ((m = line.match(/^\[([^\]\s]+)\]\s+try\s+(\d+)\s*\.*\s*(OK|FAIL.*)$/))) {
      this.s.blocks[m[1]] = { tag: m[1], tries: Number(m[2]), ok: m[3] === 'OK' }
      return true
    }
    if ((m = line.match(/^Done:\s*(\d+)\/(\d+) blocks passed\s*\S*\s*(.+)$/))) {
      this.s.result = { passed: Number(m[1]), total: Number(m[2]), path: m[3] }
      return true
    }
    if ((m = line.match(/^Engine validator:\s*(.+)$/))) { this.s.validator = m[1]; return true }
    return false
  }
  snapshot() {
    return { total: this.s.total, done: Object.values(this.s.blocks), current: this.s.current, result: this.s.result, validator: this.s.validator }
  }
}

module.exports = { cap, CAP, stripAnsi, systemPrompt, systemPromptFor, guidelineExcerpt, chatUrl, modelsUrl, latestGuideline, applyGuardrail, buildContext, streamChat, checkHealth, ProgressParser }