// ============================================================
// ARKZEN GENERATED PAGE — crud-test/index [React+Vite]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-13T13:54:23.831Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useNavigate } from 'react-router'
import { emptyForm } from './components/utils'
import type { FormData, Item } from './components/types'
import { Boxes } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => {
  const [items, setItems]         = useState<Item[]>([])
  const [loading, setLoading]     = useState(true)
  const [form, setForm]           = useState<FormData>(emptyForm)
  const [editing, setEditing]     = useState<Item | null>(null)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState<number | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [stats, setStats]         = useState({ total: 0, active: 0, pending: 0, archived: 0 })
  
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  const load = async () => {
    if (!isMounted.current) return
    setLoading(true)
    try {
      const res = await arkzenFetch('/api/crud-test/items')
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
      const d = await res.json()
      const data: Item[] = Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : []
      if (isMounted.current) {
        setItems(data)
        setStats({
          total:    data.length,
          active:   data.filter(i => i.status === 'active').length,
          pending:  data.filter(i => i.status === 'pending').length,
          archived: data.filter(i => i.status === 'archived').length,
        })
      }
    } catch (err) {
      console.error('Load failed:', err)
      if (isMounted.current) {
        setItems([])
        setStats({ total: 0, active: 0, pending: 0, archived: 0 })
      }
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(null); setShowForm(true) }
  const openEdit   = (item: Item) => {
    setEditing(item)
    setForm({ name: item.name, description: item.description ?? '', status: item.status, priority: item.priority, tags: item.tags ?? '' })
    setError(null)
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setError(null) }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const url    = editing ? `/api/crud-test/items/${editing.id}` : '/api/crud-test/items'
      const method = editing ? 'PUT' : 'POST'
      const res    = await arkzenFetch(url, { method, body: JSON.stringify(form) })
      const d      = await res.json()
      if (!res.ok) throw new Error(d.message ?? (d.errors ? Object.values(d.errors).flat().join(', ') : 'Save failed'))
      closeForm()
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    setDeleting(id)
    try {
      const res = await arkzenFetch(`/api/crud-test/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Delete failed: ${res.status} ${res.statusText}`)
      await load()
    } catch (err) {
      console.error('[DELETE] Error:', err)
    } finally {
      setDeleting(null)
    }
  }

  const statusColor = (s: string) => ({
    active:   'bg-green-100 text-green-700',
    pending:  'bg-yellow-100 text-yellow-700',
    archived: 'bg-neutral-100 text-neutral-500',
  }[s] ?? 'bg-neutral-100 text-neutral-600')

  const statItems = [
    { label: 'Total', count: stats.total, cls: 'text-neutral-900' },
    { label: 'Active', count: stats.active, cls: 'text-green-600' },
    { label: 'Pending', count: stats.pending, cls: 'text-yellow-600' },
    { label: 'Archived', count: stats.archived, cls: 'text-neutral-400' }
  ]

  return (
    <div className="min-h-screen p-8">
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="font-semibold mb-4">{editing ? 'Edit Item' : 'Create Item'}</h2>
            {error && <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
            <div className="space-y-3">
              <input className="arkzen-input w-full" placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <textarea className="arkzen-input w-full h-20 resize-none" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <select className="arkzen-input w-full" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="archived">Archived</option>
              </select>
              <input className="arkzen-input w-full" type="number" placeholder="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))} />
              <input className="arkzen-input w-full" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-5">
              <button className="arkzen-btn flex-1" onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              <button className="arkzen-btn-ghost flex-1" onClick={closeForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Boxes size={20} /> CRUD Test</h1>
          <button className="arkzen-btn text-sm" onClick={openCreate}>+ Create Item</button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {statItems.map(({ label, count, cls }) => (
            <div key={label} className="bg-white rounded-2xl border border-neutral-100 p-4 text-center">
              <div className={`text-2xl font-bold ${cls}`}>{count}</div>
              <div className="text-xs text-neutral-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold">Items</h2>
            <button className="text-xs text-neutral-400" onClick={load}>Refresh</button>
          </div>
          {loading ? (
            <div className="p-8 text-center text-sm text-neutral-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">
              No items yet. Click "Create Item" or check that the seeder ran.
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {items.map(item => (
                <div key={item.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${statusColor(item.status)}`}>{item.status}</span>
                      {item.priority > 0 && <span className="text-xs text-neutral-400">P{item.priority}</span>}
                    </div>
                    {item.description && <p className="text-xs text-neutral-500 truncate">{item.description}</p>}
                    {item.tags && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {item.tags.split(',').map((t, idx) => (
                          <span key={`${item.id}-tag-${idx}`} className="text-xs bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{t.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="text-xs text-neutral-500 hover:text-neutral-900" onClick={() => openEdit(item)}>Edit</button>
                    <button
                      className="text-xs text-red-400 hover:text-red-600"
                      onClick={() => remove(item.id)}
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4">
          <strong>What this tests:</strong> ModelBuilder, MigrationBuilder (items table), ControllerBuilder (CRUD routes), RequestBuilder (validation), ResourceBuilder (JSON transform), FactoryBuilder, SeederBuilder — all isolated under <code>crud-test</code> slug. No auth required.
        </div>
      </div>
    </div>
  )
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_CrudTest_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
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

export default ArkzenPage_CrudTest_Index
