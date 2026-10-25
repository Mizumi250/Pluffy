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
async function streamChat({ server, model, key, messages, signal, onToken, maxTokens = 1500, temperature = 0.2 }) {
  let res
  try {
    res = await fetch(`${server.replace(/\/+$/, '')}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature, stream: true }),
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error('Cannot reach the model server. Check the URL in Settings and that Colab Cell 1 is still running.')
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
    const res = await fetch(`${server.replace(/\/+$/, '')}/v1/models`, {
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

module.exports = { cap, CAP, stripAnsi, systemPrompt, latestGuideline, applyGuardrail, buildContext, streamChat, checkHealth, ProgressParser }