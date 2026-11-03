'use client'
// ============================================================
// ARKZEN GENERATED PAGE — go-backend-test/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-03T12:28:28.294Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
type Note = { id: number; title: string; body: string | null }
type NotePage = { data: Note[]; current_page: number; last_page: number; per_page: number; total: number }

const IndexPage = () => {
  const [page, setPage] = useState<NotePage | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadNotes = useCallback(async () => {
    const response = await fetch('/api/go-backend-test/notes?per_page=10')
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message ?? 'Could not load notes.')
    setPage(data)
  }, [])

  useEffect(() => {
    loadNotes()
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Could not load notes.'))
      .finally(() => setLoading(false))
  }, [loadNotes])

  const createNote = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch('/api/go-backend-test/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ title, body }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message ?? 'Could not create note.')
      setTitle('')
      setBody('')
      await loadNotes()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create note.')
    }
  }

  const updateNote = async (id: number) => {
    setError('')
    try {
      const response = await fetch(`/api/go-backend-test/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ title: editingTitle }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message ?? 'Could not update note.')
      setEditingId(null)
      await loadNotes()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not update note.')
    }
  }

  const deleteNote = async (id: number) => {
    setError('')
    try {
      const response = await fetch(`/api/go-backend-test/notes/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message ?? 'Could not delete note.')
      await loadNotes()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not delete note.')
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-12 text-stone-900">
      <section className="mx-auto max-w-3xl space-y-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Go - Chi</p>
          <h1 className="mt-2 text-4xl font-bold">Backend Contract Notes</h1>
          <p className="mt-3 text-stone-600">Verify Go CRUD routes, SQLite schema setup, validation, pagination, and persistence.</p>
        </header>

        <form onSubmit={createNote} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Create a note</h2>
          <input required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} placeholder="Title" aria-label="Title" className="w-full rounded-lg border border-stone-300 px-4 py-3" />
          <textarea value={body} onChange={event => setBody(event.target.value)} placeholder="Optional note body" aria-label="Note body" className="w-full rounded-lg border border-stone-300 px-4 py-3" rows={3} />
          <button type="submit" className="rounded-lg bg-cyan-700 px-5 py-3 font-semibold text-white">Save note</button>
        </form>

        {error && <p role="alert" className="rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p>}
        <section aria-label="Notes" className="space-y-3">
          {loading && <p className="text-stone-500">Loading notes...</p>}
          {page?.data.map(note => (
            <article key={note.id} className="flex items-start justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="min-w-0 flex-1">
                {editingId === note.id
                  ? <input autoFocus value={editingTitle} onChange={event => setEditingTitle(event.target.value)} aria-label="Updated title" className="w-full rounded-lg border border-stone-300 px-3 py-2" />
                  : <h2 className="font-semibold">{note.title}</h2>}
                {note.body && <p className="mt-2 whitespace-pre-wrap text-sm text-stone-600">{note.body}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                {editingId === note.id
                  ? <button type="button" onClick={() => updateNote(note.id)} className="rounded-lg border border-stone-300 px-3 py-2 text-sm">Save</button>
                  : <button type="button" onClick={() => { setEditingId(note.id); setEditingTitle(note.title) }} className="rounded-lg border border-stone-300 px-3 py-2 text-sm">Rename</button>}
                <button type="button" onClick={() => deleteNote(note.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700">Delete</button>
              </div>
            </article>
          ))}
          {!loading && page?.data.length === 0 && <p className="text-stone-500">No notes yet.</p>}
        </section>
        {page && <p className="text-sm text-stone-500">Showing {page.data.length} of {page.total} notes.</p>}
      </section>
    </main>
  )
}

// Wrapper for animation + layout
const ArkzenPage_GoBackendTest_Index = () => {
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

export default ArkzenPage_GoBackendTest_Index
