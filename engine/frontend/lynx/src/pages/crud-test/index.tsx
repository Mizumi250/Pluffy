// ARKZEN GENERATED — crud-test/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:53.379Z
import { ItemRow } from './components/ItemRow'
import { StatCard } from './components/StatCard'
import { apiFetch, emptyForm } from './components/utils'
import type { FormData, Item } from './components/types'
import { useEffect, useState } from '@lynx-js/react'

const IndexScreen = () => {
  const [items,    setItems]    = useState<Item[]>([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<Item | null>(null)
  const [form,     setForm]     = useState<FormData>(emptyForm)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [stats,    setStats]    = useState({ total: 0, active: 0, pending: 0, archived: 0 })

  const load = async () => {
    setLoading(true)
    try {
      const res  = await apiFetch('/api/crud-test/items')
      if (!res.ok) throw new Error(`${res.status}`)
      const d    = await res.json()
      const data: Item[] = Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : []
      setItems(data)
      setStats({
        total:    data.length,
        active:   data.filter(i => i.status === 'active').length,
        pending:  data.filter(i => i.status === 'pending').length,
        archived: data.filter(i => i.status === 'archived').length,
      })
    } catch (e) {
      console.error('[crud-test] load failed:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(null); setShowForm(true) }
  const openEdit   = (item: Item) => {
    setEditing(item)
    setForm({ name: item.name, description: item.description ?? '', status: item.status, priority: String(item.priority), tags: item.tags ?? '' })
    setError(null)
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const url    = editing ? `/api/crud-test/items/${editing.id}` : '/api/crud-test/items'
      const method = editing ? 'PUT' : 'POST'
      const res    = await apiFetch(url, {
        method,
        body: JSON.stringify({ ...form, priority: Number(form.priority) }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.message ?? 'Save failed')
      setShowForm(false)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    setDeleting(id)
    try {
      const res = await apiFetch(`/api/crud-test/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`${res.status}`)
      await load()
    } catch (e) {
      console.error('[crud-test] delete failed:', e)
    } finally { setDeleting(null) }
  }

  const statusOptions: Array<'active' | 'pending' | 'archived'> = ['active', 'pending', 'archived']

  return (
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <view>
          <text className="text-base font-semibold text-neutral-900">CRUD Test</text>
          <text className="text-xs text-neutral-400 mt-0.5">Same API as web — cross-platform sync</text>
        </view>
        <view bindtap={openCreate} className="bg-neutral-900 px-4 py-2 rounded-xl">
          <text className="text-white text-xs font-semibold">+ Create</text>
        </view>
      </view>

      {/* Form */}
      {showForm && (
        <view className="bg-white m-4 rounded-3xl p-5 border border-neutral-100">
          <text className="text-sm font-semibold text-neutral-900 mb-4">
            {editing ? 'Edit Item' : 'Create Item'}
          </text>
          {error && (
            <view className="bg-red-50 rounded-xl p-3 mb-3">
              <text className="text-xs text-red-600">{error}</text>
            </view>
          )}
          <view className="gap-y-2.5">
            <input
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
              placeholder="Name *"
              bindinput={e => setForm(f => ({ ...f, name: e.detail.value }))}
            />
            <input
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
              placeholder="Description"
              bindinput={e => setForm(f => ({ ...f, description: e.detail.value }))}
            />
            <view className="flex-row gap-x-2">
              {statusOptions.map(s => (
                <view
                  key={s}
                  bindtap={() => setForm(f => ({ ...f, status: s }))}
                  className={`flex-1 py-2.5 rounded-xl items-center border ${form.status === s ? 'bg-neutral-900 border-neutral-900' : 'bg-white border-neutral-200'}`}
                >
                  <text className={`text-xs font-medium ${form.status === s ? 'text-white' : 'text-neutral-500'}`}>{s}</text>
                </view>
              ))}
            </view>
            <input
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
              placeholder="Priority (0)"
              bindinput={e => setForm(f => ({ ...f, priority: e.detail.value.replace(/[^0-9]/g, '') }))}
            />
            <input
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
              placeholder="Tags (comma separated)"
              bindinput={e => setForm(f => ({ ...f, tags: e.detail.value }))}
            />
          </view>
          <view className="flex-row gap-x-3 mt-5">
            <view
              bindtap={saving ? undefined : save}
              className={`flex-1 py-3.5 rounded-2xl items-center ${saving ? 'bg-neutral-300' : 'bg-neutral-900'}`}
            >
              <text className="text-white text-sm font-semibold">
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </text>
            </view>
            <view
              bindtap={() => setShowForm(false)}
              className="flex-1 py-3.5 rounded-2xl items-center border border-neutral-200"
            >
              <text className="text-neutral-600 text-sm font-medium">Cancel</text>
            </view>
          </view>
        </view>
      )}

      <scroll-view className="flex-1">
        {/* Stats */}
        <view className="flex-row gap-2 px-4 py-4">
          <StatCard label="Total"    value={stats.total}    accent="text-neutral-900" />
          <StatCard label="Active"   value={stats.active}   accent="text-green-600"   />
          <StatCard label="Pending"  value={stats.pending}  accent="text-yellow-600"  />
          <StatCard label="Archived" value={stats.archived} accent="text-neutral-400" />
        </view>

        {/* List */}
        <view className="mx-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-6">
          <view className="px-4 py-3 border-b border-neutral-100 flex-row items-center justify-between">
            <text className="text-sm font-semibold text-neutral-900">Items</text>
            <view bindtap={load}>
              <text className="text-xs text-neutral-400">Refresh</text>
            </view>
          </view>

          {loading ? (
            <view className="py-12 items-center">
              <text className="text-sm text-neutral-400">Loading…</text>
            </view>
          ) : items.length === 0 ? (
            <view className="py-12 items-center px-6">
              <text className="text-sm text-neutral-400 text-center">
                No items yet. Tap + Create or check the seeder ran.
              </text>
            </view>
          ) : (
            items.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                onEdit={openEdit}
                onDelete={remove}
                deleting={deleting}
              />
            ))
          )}
        </view>

        {/* Footer */}
        <view className="mx-4 mb-8 bg-neutral-100 rounded-2xl px-4 py-3">
          <text className="text-xs text-neutral-500 font-mono leading-5">
            {`endpoint: /api/crud-test/items\nbackend: Laravel · crud-test slug\nsync: web ↔ native shared DB`}
          </text>
        </view>
      </scroll-view>
    </view>
  )
}

export const CrudTestIndex = IndexScreen;
