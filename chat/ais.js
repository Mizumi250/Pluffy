'use strict'
// The list of AIs you can chat with. Pure logic (no Electron), so it can be tested on its own.
// Each AI: { id, name, kind, baseUrl, model, key (stored encrypted), trained }
//   kind      a preset that fills in the URL and sets sensible limits (you can still edit the URL)
//   trained   true on exactly one AI: your trained Pluff model. It is the one that writes DSL blocks
//             and is the server the /ai command uses.

const KINDS = {
  pluffy: {
    label: 'Pluffy / Ollama (Colab or local)',
    url: '', model: '', needsKey: false, small: true,
    hint: 'Paste the URL Colab Cell 1 prints after --server (it changes every run). For local Ollama use http://127.0.0.1:11434.',
  },
  gemini: {
    label: 'Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash', needsKey: true, small: false,
    hint: 'Free key at aistudio.google.com. Your messages and any files it reads are sent to Google.',
  },
  openai: {
    label: 'OpenAI',
    url: 'https://api.openai.com/v1', model: '', needsKey: true, small: false,
    hint: 'Key from platform.openai.com. Type the model name you want to use.',
  },
  openrouter: {
    label: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1', model: '', needsKey: true, small: false,
    hint: 'Key from openrouter.ai. Type the model name, for example provider/model-name.',
  },
  custom: {
    label: 'Other (OpenAI-compatible)',
    url: '', model: '', needsKey: false, small: false,
    hint: 'Any server with an OpenAI-style /chat/completions endpoint. Paste its base URL, usually ending in /v1.',
  },
}

const MAX_AIS = 12
const MODEL_RE = /^[A-Za-z0-9._:/@+-]{1,120}$/

// "https://x.trycloudflare.com" -> ".../v1" for Pluffy/Ollama. Strips a pasted "/chat/completions".
function normalizeBase(kind, url) {
  let u
  try { u = new URL(String(url || '').trim()) } catch { throw new Error('The URL is not valid. It must start with http:// or https://') }
  if (!/^https?:$/.test(u.protocol)) throw new Error('The URL must start with http:// or https://')
  let p = u.pathname.replace(/\/+$/, '').replace(/\/chat\/completions$/, '')
  if (kind === 'pluffy' && p === '') p = '/v1'
  return u.origin + p
}

// The origin pluffy-ai.js wants for --server (it adds /v1 itself).
const serverOrigin = (baseUrl) => String(baseUrl || '').replace(/\/+$/, '').replace(/\/v1$/, '')

// Check one AI coming from the settings screen. Returns the clean object or throws a readable Error.
function validateAi(d) {
  const name = String(d && d.name || '').trim()
  if (!name || name.length > 40) throw new Error('Every AI needs a name (up to 40 characters).')
  const kind = KINDS[d.kind] ? d.kind : 'custom'
  let baseUrl
  try { baseUrl = normalizeBase(kind, d.baseUrl) } catch (e) { throw new Error(`${name}: ${e.message}`) }
  const model = String(d.model || '').trim()
  if (!MODEL_RE.test(model)) throw new Error(`${name}: enter a model name (letters, numbers and . _ : / - only).`)
  const id = /^[A-Za-z0-9_-]{1,40}$/.test(String(d.id || '')) ? String(d.id) : 'ai_' + Math.random().toString(36).slice(2, 8)
  return { id, name, kind, baseUrl, model, trained: d.trained === true }
}

// Whole list: unique names and ids, at most one trained AI, at least one AI.
function validateList(list) {
  if (!Array.isArray(list) || !list.length) throw new Error('Keep at least one AI.')
  if (list.length > MAX_AIS) throw new Error(`That is too many AIs (max ${MAX_AIS}).`)
  const out = list.map(validateAi)
  const names = new Set()
  const ids = new Set()
  for (const a of out) {
    const n = a.name.toLowerCase()
    if (names.has(n)) throw new Error(`Two AIs are called "${a.name}". Give them different names.`)
    names.add(n)
    while (ids.has(a.id)) a.id = 'ai_' + Math.random().toString(36).slice(2, 8)
    ids.add(a.id)
  }
  let seen = false
  for (const a of out) { if (a.trained && !seen) seen = true; else a.trained = false }
  return out
}

// First run after this update: turn the old fixed fields into AIs. `enc` encrypts a plain key (or returns '').
function migrate(s, enc) {
  const list = []
  const server = s.server && /^https?:/.test(s.server) ? s.server : 'http://127.0.0.1:11434'
  list.push({
    id: 'pluffy', name: 'Pluffy', kind: 'pluffy', baseUrl: normalizeBase('pluffy', server),
    model: s.model || 'pluffy-v12', key: s.key ? enc(s.key) : '', trained: true,
  })
  if ((s.gemKey && String(s.gemKey).startsWith('enc:')) || s.provider === 'gemini') {
    list.push({
      id: 'gemini', name: 'Gemini', kind: 'gemini', baseUrl: KINDS.gemini.url,
      model: s.gemModel || KINDS.gemini.model, key: String(s.gemKey || ''), trained: false,
    })
  }
  const active = s.provider === 'gemini' && list.length > 1 ? 'gemini' : 'pluffy'
  return { list, active }
}

// What the agent loop needs. Small local models get small limits (8k context); hosted ones get big ones.
function toProvider(ai, key) {
  const small = !!(KINDS[ai.kind] && KINDS[ai.kind].small)
  return {
    name: ai.kind, label: ai.name, baseUrl: ai.baseUrl, model: ai.model, key,
    nativeTools: true, timeoutMs: 240000,
    maxToolChars: small ? 4000 : 12000, historyChars: small ? 6000 : 60000, ctxChars: small ? 15000 : 300000,
  }
}

module.exports = { KINDS, MAX_AIS, normalizeBase, serverOrigin, validateAi, validateList, migrate, toProvider }
