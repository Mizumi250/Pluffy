/* @arkzen:meta
name: ollama-studio
version: 1.0.0
description: A small local AI chat Tatemono powered by Ollama through the FastAPI backend. Prompts are sent only to the local Ollama service.
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
    description: Generate a response from the local Ollama model
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
import urllib.error
import urllib.request

validated = await request.validate({'prompt': 'required|string|max:4000'})
client_ip = request.ip()
try:
    is_local_client = client_ip is not None and ipaddress.ip_address(client_ip).is_loopback
except ValueError:
    is_local_client = False
if not is_local_client:
    raise HttpException(403, 'This local AI endpoint only accepts requests from this computer.')
prompt = validated['prompt']
model = env('PLUFF_AI_MODEL', 'llama3.2')
payload = json.dumps({
    'model': model,
    'stream': False,
    'messages': [{'role': 'user', 'content': prompt}],
}).encode('utf-8')

def _ask_local_ollama():
    req = urllib.request.Request(
        'http://127.0.0.1:11434/api/chat',
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=120) as result:
        return json.loads(result.read().decode('utf-8'))

try:
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, _ask_local_ollama)
except urllib.error.URLError as error:
    raise HttpException(503, 'Local Ollama is unavailable. Start Ollama at 127.0.0.1:11434 and pull the configured model.') from error
except (json.JSONDecodeError, UnicodeDecodeError) as error:
    raise HttpException(502, 'Local Ollama returned an invalid response.') from error

answer = (result.get('message') or {}).get('content')
if not isinstance(answer, str) or not answer.strip():
    raise HttpException(502, 'Local Ollama returned an empty response.')
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
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">Local AI</p>
          <h1 className="mt-2 text-3xl font-semibold">Ollama Studio</h1>
          <p className="mt-2 text-sm text-neutral-400">
            A small chat interface for your local Ollama model. Prompts stay on this machine.
          </p>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto py-6" aria-live="polite">
          {messages.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-700 p-5 text-sm text-neutral-400">
              Ask something to start. The FastAPI backend sends your prompt to Ollama at 127.0.0.1:11434.
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
          {busy && <p className="text-sm text-neutral-400">Waiting for the local model...</p>}
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
          Default model: llama3.2. Set PLUFF_AI_MODEL in the FastAPI backend environment to choose another local model.
        </p>
      </section>
    </main>
  )
}
/* @arkzen:web:page:index:end */
