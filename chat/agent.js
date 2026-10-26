'use strict'
// The agent loop: model -> tool calls -> results -> model ... until it answers in plain text.
// Works with any OpenAI-compatible server: your Colab/Ollama model and Gemini.
//
// Two ways a model can ask for a tool:
//   1) native tool_calls (Gemini, and Ollama when the model template supports tools)
//   2) text: <tool_call>{"name":"read_file","arguments":{...}}</tool_call>  (Qwen without a tools template)
// If the server rejects the `tools` field, we switch to (2) automatically.

const lib = require('./lib')

const MAX_STEPS = 12

// ---------------------------------------------------------------- prompts
function toolHelp(schemas) {
  return schemas.map((s) => {
    const p = s.function.parameters
    const args = Object.entries(p.properties || {}).map(([k, v]) => `${k}${(p.required || []).includes(k) ? '' : '?'}: ${v.type}`).join(', ')
    return `- ${s.function.name}(${args}): ${s.function.description}`
  }).join('\n')
}

function systemPrompt({ root, provider, schemas }) {
  const g = lib.latestGuideline(root)
  let s = 'You are Pluffy, the assistant inside the Pluff engine chat. The person you talk to is Master Mizumi; always address them as "Master Mizumi".\n' +
    'You can act on their repo with tools.\n' +
    'Rules:\n' +
    '- Look before you change anything: use list_dir, search and read_file (read big files in line ranges).\n' +
    '- Only change files or run commands when Master Mizumi asks. Every change is shown to them for approval. If a tool says the change was declined, stop, say what you wanted to do, and ask what they want instead. Never retry a declined change.\n' +
    '- Prefer edit_file (one small exact replacement) over write_file for files that already exist.\n' +
    `- Tatemonos live in tatemonos/<name>/core.tsx and use the @arkzen DSL.${g ? ` The rules are in ${g}.md at the repo root: search it, then read only the section you need.` : ''}\n` +
    '- To write a DSL block use generate_block (it asks the trained Pluff model and can insert the block into the file). Do not hand-write large DSL blocks yourself.\n' +
    '- After you create or change a core.tsx, run validate_tatemono and report the real result. Never say something passed unless the tool said so.\n' +
    '- To run something use run_command with a real slash command from the list below. Never invent commands.\n' +
    '- Be brief. If the tools cannot do what is asked, say so plainly.\n'
  if (!provider.nativeTools) {
    s += '\nTo use a tool, reply with ONLY this and nothing else:\n<tool_call>{"name": "TOOL_NAME", "arguments": {"arg": "value"}}</tool_call>\n' +
      'You will get the result in the next message. When you are done, answer in plain text.\n\nTools:\n' + toolHelp(schemas)
  }
  return s
}

// ---------------------------------------------------------------- parsing tool calls out of text
function tryJson(s) { try { return JSON.parse(s) } catch { return null } }

function callsFromText(content, has) {
  const out = []
  const push = (o) => {
    if (!o || typeof o !== 'object') return
    const name = o.name || o.tool || (o.function && o.function.name)
    let args = o.arguments ?? o.args ?? o.parameters ?? (o.function && o.function.arguments) ?? {}
    if (typeof args === 'string') args = tryJson(args) || {}
    if (typeof name === 'string' && has(name)) out.push({ id: 'text_' + out.length, name, args })
  }
  for (const m of String(content || '').matchAll(/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g)) push(tryJson(m[1]))
  if (!out.length) {
    const fence = String(content || '').match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (fence) push(tryJson(fence[1]))
  }
  if (!out.length) {
    const t = String(content || '').trim()
    if (t.startsWith('{') && t.endsWith('}')) push(tryJson(t))
  }
  return out
}

// ---------------------------------------------------------------- model call
function linkedSignal(signal, ms) {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(new Error('timeout')), ms)
  const onAbort = () => ac.abort()
  if (signal) { if (signal.aborted) ac.abort(); else signal.addEventListener('abort', onAbort, { once: true }) }
  return { signal: ac.signal, done: () => { clearTimeout(timer); if (signal) signal.removeEventListener('abort', onAbort) } }
}

async function callModel(provider, messages, schemas, signal) {
  const clean = messages.map((m) => { const { _toolResult, ...rest } = m; return rest })   // _toolResult is a local marker only
  const body = {
    model: provider.model, messages: clean, stream: false, temperature: 0.2, max_tokens: 4096,
    ...(provider.nativeTools ? { tools: schemas, tool_choice: 'auto' } : {}),
  }
  const link = linkedSignal(signal, provider.timeoutMs || 240000)
  let res
  try {
    res = await fetch(`${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(provider.key ? { Authorization: `Bearer ${provider.key}` } : {}) },
      body: JSON.stringify(body), signal: link.signal,
    })
  } catch (err) {
    link.done()
    if (signal && signal.aborted) { const e = new Error('stopped'); e.name = 'AbortError'; throw e }
    if (err && /timeout/i.test(String(err.message || err.cause || ''))) throw new Error('The model took too long to answer.')
    throw new Error(`Cannot reach ${provider.label || provider.name}. Open Settings and press Test on that AI to see why.`)
  }
  const text = await res.text()
  link.done()
  if (!res.ok) {
    if (res.status === 400 && provider.nativeTools && /tool/i.test(text)) {
      provider.nativeTools = false                                   // server has no tool support: use the text protocol
      const err = new Error('RETRY_WITHOUT_NATIVE_TOOLS')
      err.retry = true
      throw err
    }
    throw new Error(`${provider.label || provider.name} error ${res.status}: ${text.slice(0, 300)}`)
  }
  let data
  try { data = JSON.parse(text) } catch { throw new Error('The server sent a reply I could not read.') }
  const msg = data.choices && data.choices[0] && data.choices[0].message
  if (!msg) throw new Error('The server sent an empty reply.')
  return msg
}

// ---------------------------------------------------------------- keep the conversation inside the model's context
function trim(messages, limit) {
  const size = () => messages.reduce((n, m) => n + String(m.content || '').length + (m.tool_calls ? JSON.stringify(m.tool_calls).length : 0), 0)
  if (size() <= limit) return
  const toolIdx = messages.map((m, i) => (m.role === 'tool' || (m.role === 'user' && m._toolResult) ? i : -1)).filter((i) => i >= 0)
  for (const i of toolIdx.slice(0, Math.max(0, toolIdx.length - 2))) {
    messages[i].content = '[older tool result removed to save space]'
    if (size() <= limit) return
  }
}

// ---------------------------------------------------------------- the loop
// history: [{role, content}] earlier chat turns (text only). Returns { text, steps }.
async function runAgent({ root, provider, tools, history, signal, report }) {
  const schemas = tools.schemas
  const callKey = new Map()
  let steps = 0

  const build = () => lib.buildContext(history, systemPrompt({ root, provider, schemas }), provider.historyChars)
  let messages = build()

  while (steps < MAX_STEPS) {
    let msg
    try {
      msg = await callModel(provider, messages, schemas, signal)
    } catch (err) {
      if (err.retry) { messages = build(); continue }                // rebuilt with the text protocol in the prompt
      throw err
    }

    let calls = []
    if (Array.isArray(msg.tool_calls) && msg.tool_calls.length) {
      calls = msg.tool_calls.map((c, i) => {
        const raw = c.function && c.function.arguments
        const args = typeof raw === 'string' ? tryJson(raw) : raw
        return { id: c.id || `call_${steps}_${i}`, name: c.function && c.function.name, args, bad: typeof raw === 'string' && args === null, native: true }
      })
    } else {
      calls = callsFromText(msg.content, (n) => tools.has(n)).map((c) => ({ ...c, native: false }))
    }

    if (!calls.length) return { text: String(msg.content || '').replace(/<\|im_end\|>|<\|endoftext\|>/g, '').trim(), steps }

    // keep the assistant message exactly as the server sent it (Gemini needs its extra fields back)
    if (calls[0].native) messages.push(msg)
    else messages.push({ role: 'assistant', content: String(msg.content || '') })

    for (const c of calls) {
      steps++
      let result
      if (c.bad) result = 'Error: the arguments were not valid JSON. Call the tool again with valid JSON.'
      else if (!tools.has(c.name)) result = `Error: unknown tool "${c.name}".`
      else {
        const key = c.name + JSON.stringify(c.args)
        const n = (callKey.get(key) || 0) + 1
        callKey.set(key, n)
        if (n >= 3) result = 'Error: you already made this exact call several times. Try something different or answer now.'
        else result = await tools.run(c.name, c.args, { signal, report })
      }
      const capped = result.length > provider.maxToolChars ? result.slice(0, provider.maxToolChars) + '\n...(result cut to fit)' : result
      if (c.native) messages.push({ role: 'tool', tool_call_id: c.id, content: capped })
      else messages.push({ role: 'user', content: `Result of ${c.name}:\n${capped}`, _toolResult: true })
      if (steps >= MAX_STEPS) break
    }
    trim(messages, provider.ctxChars)
  }
  return { text: 'I stopped after several steps without finishing. Tell me how you would like to continue, Master Mizumi.', steps }
}

module.exports = { runAgent, callsFromText, systemPrompt }
