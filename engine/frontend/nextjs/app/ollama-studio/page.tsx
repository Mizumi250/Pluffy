'use client'
// ============================================================
// ARKZEN GENERATED PAGE — ollama-studio/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-01T12:32:15.681Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Message } from './components/types'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
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

// Wrapper for animation + layout
const ArkzenPage_OllamaStudio_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_OllamaStudio_Index
