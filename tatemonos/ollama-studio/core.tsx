/* @arkzen:meta
name: ollama-studio
version: 1.0.0
description: A small AI chat Tatemono powered by a server-configured OpenAI-compatible API through the FastAPI backend.
auth: false
*/

/* @arkzen:api:assistant
model: Assistant
controller: AssistantController
prefix: /api/ollama-studio
middleware: []
endpoints:
  chat:
    method: POST
    route: /chat
    description: Generate a response from the configured OpenAI-compatible API
    validation:
      prompt: required|string|max:4000
    response:
      type: single
*/

/* @arkzen:endpoint:py:chat
*/
import asyncio
import ipaddress
import json
import urllib.parse
import urllib.error
import urllib.request

validated = await request.validate({'prompt': 'required|string|max:4000'})
client_ip = request.ip()
try:
    is_local_client = client_ip is not None and ipaddress.ip_address(client_ip).is_loopback
except ValueError:
    is_local_client = False
if not is_local_client:
    raise HttpException(403, 'This AI endpoint only accepts requests from this computer.')
prompt = validated['prompt']
model = env('PLUFF_AI_MODEL', 'gemini-3.6-flash')
base_url = (env('PLUFF_AI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta/openai/') or '').rstrip('/')
api_key = env('PLUFF_AI_API_KEY')
if not api_key:
    raise HttpException(503, 'AI API is not configured. Set PLUFF_AI_API_KEY in the FastAPI backend environment.')
parsed_url = urllib.parse.urlsplit(base_url)
if (parsed_url.scheme not in ('https', 'http') or not parsed_url.hostname or parsed_url.username or
        parsed_url.password or parsed_url.query or parsed_url.fragment):
    raise HttpException(500, 'PLUFF_AI_BASE_URL must be an HTTP(S) base URL without credentials, query, or fragment.')
if parsed_url.scheme != 'https' and parsed_url.hostname not in ('localhost', '127.0.0.1', '::1'):
    raise HttpException(500, 'PLUFF_AI_BASE_URL must use HTTPS except for a loopback API.')
payload = json.dumps({
    'model': model,
    'stream': False,
    'messages': [{'role': 'user', 'content': prompt}],
}).encode('utf-8')

def _ask_ai_api():
    req = urllib.request.Request(
        base_url + '/chat/completions',
        data=payload,
        headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api_key},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=120) as result:
        return json.loads(result.read().decode('utf-8'))

try:
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, _ask_ai_api)
except urllib.error.HTTPError as error:
    raise HttpException(502, f'AI API returned HTTP {error.code}. Check the configured provider, model, and API key.') from error
except urllib.error.URLError as error:
    raise HttpException(503, 'AI API is unavailable. Check PLUFF_AI_BASE_URL and your network connection.') from error
except (json.JSONDecodeError, UnicodeDecodeError) as error:
    raise HttpException(502, 'AI API returned an invalid response.') from error

choices = result.get('choices')
answer = (choices[0].get('message') or {}).get('content') if isinstance(choices, list) and choices else None
if not isinstance(answer, str) or not answer.strip():
    raise HttpException(502, 'AI API returned an empty or unsupported response.')
return response.json({'model': result.get('model', model), 'response': answer})
/* @arkzen:endpoint:py:chat:end */

/* @arkzen:web:components:shared */
'use client'

import React, { useState } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const send = async (event: React.FormEvent) => {
    event.preventDefault()
    const text = prompt.trim()
    if (!text || busy) return

    setPrompt('')
    setError('')
    setMessages(current => [...current, { role: 'user', content: text }])
    setBusy(true)
    try {
      const response = await fetch('/api/ollama-studio/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message ?? 'The local model could not answer.')
      setMessages(current => [...current, { role: 'assistant', content: data.response }])
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The local model could not answer.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-100">
      <section className="mx-auto flex min-h-[80vh] max-w-3xl flex-col rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <header className="border-b border-neutral-800 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">AI API</p>
          <h1 className="mt-2 text-3xl font-semibold">AI Studio</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Chat with the OpenAI-compatible provider configured on the FastAPI backend.
          </p>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto py-6" aria-live="polite">
          {messages.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-700 p-5 text-sm text-neutral-400">
              Ask something to start. Your prompt is sent by the FastAPI backend to its configured AI API provider.
            </p>
          )}
          {messages.map((message, index) => (
            <article key={index} className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
              message.role === 'user' ? 'ml-auto bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-100'
            }`}>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-60">{message.role}</p>
              {message.content}
            </article>
          ))}
          {busy && <p className="text-sm text-neutral-400">Waiting for the AI provider...</p>}
        </div>

        {error && <p role="alert" className="mb-3 rounded-xl border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">{error}</p>}

        <form onSubmit={send} className="flex gap-3 border-t border-neutral-800 pt-5">
          <textarea
            value={prompt}
            onChange={event => setPrompt(event.target.value)}
            maxLength={4000}
            rows={2}
            aria-label="Message"
            placeholder="Write a message..."
            className="min-w-0 flex-1 resize-y rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={busy || !prompt.trim()}
            className="self-end rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </form>
        <p className="mt-3 text-xs text-neutral-500">
          Set PLUFF_AI_API_KEY, PLUFF_AI_BASE_URL, and PLUFF_AI_MODEL in the FastAPI backend environment. Prompts are sent to that provider.
        </p>
      </section>
    </main>
  )
}
/* @arkzen:web:page:index:end */
