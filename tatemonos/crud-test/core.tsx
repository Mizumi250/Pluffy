/* @arkzen:meta
name: crud-test
version: 1.0.0
description: Tests the full CRUD pipeline — Model, Migration, Controller, Request, Resource, Policy, Factory, Seeder. The canonical Arkzen CRUD verification.
auth: false
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
modal:
  borderRadius: 2xl
  backdrop: blur
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:database:items
table: items
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  name:
    type: string
    length: 255
    nullable: false
  description:
    type: text
    nullable: true
  status:
    type: string
    length: 50
    default: active
  priority:
    type: integer
    default: 0
  tags:
    type: string
    nullable: true
seeder:
  count: 5
  data:
    - name: Alpha Item
      description: First seeded item for CRUD testing
      status: active
      priority: 1
      tags: test,seed
    - name: Beta Item
      description: Second seeded item
      status: pending
      priority: 2
      tags: test
*/

/* @arkzen:api:items
model: Item
controller: ItemController
prefix: /api/crud-test
middleware: []
resource: true
policy: true
factory: true
endpoints:
  index:
    method: GET
    route: /items
    description: Get all items
    response:
      type: collection
  store:
    method: POST
    route: /items
    description: Create item
    validation:
      name: required|string|max:255
      description: nullable|string
      status: sometimes|string|in:active,pending,archived
      priority: sometimes|integer|min:0
      tags: nullable|string
    response:
      type: single
  show:
    method: GET
    route: /items/{id}
    description: Get single item
    response:
      type: single
  update:
    method: PUT
    route: /items/{id}
    description: Update item
    validation:
      name: sometimes|string|max:255
      description: nullable|string
      status: sometimes|string|in:active,pending,archived
      priority: sometimes|integer|min:0
      tags: nullable|string
    response:
      type: single
  destroy:
    method: DELETE
    route: /items/{id}
    description: Delete item
    response:
      type: message
      value: Item deleted
*/

/* @arkzen:policy:update
*/
// Prevent updates to archived items
if ($item->status === 'archived') {
    return false;
}

// Only allow if user is authenticated (in a real app, check ownership)
return true;
/* @arkzen:policy:update:end */

/* @arkzen:policy:delete
*/
// Prevent deletion of archived items (must restore first)
if ($item->status === 'archived') {
    return false;
}

return true;
/* @arkzen:policy:delete:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Boxes } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

type Item = {
  id:          number
  name:        string
  description: string | null
  status:      'active' | 'pending' | 'archived'
  priority:    number
  tags:        string | null
  created_at:  string
  updated_at:  string
}

type FormData = { name: string; description: string; status: string; priority: number; tags: string }
const emptyForm: FormData = { name: '', description: '', status: 'active', priority: 0, tags: '' }

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
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
/* @arkzen:web:page:index:end */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native'
const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native'
const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:rn:end */

type Item = {
  id:          number
  name:        string
  description: string | null
  status:      'active' | 'pending' | 'archived'
  priority:    number
  tags:        string | null
  created_at:  string
  updated_at:  string
}

type FormData = { name: string; description: string; status: 'active' | 'pending' | 'archived'; priority: string; tags: string }
const emptyForm: FormData = { name: '', description: '', status: 'active', priority: '0', tags: '' }

async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers ?? {}),
    },
  })
}

// ── Status badge ──────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active:   { bg: 'bg-green-100',   text: 'text-green-700'   },
    pending:  { bg: 'bg-yellow-100',  text: 'text-yellow-700'  },
    archived: { bg: 'bg-neutral-100', text: 'text-neutral-500' },
  }[status] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' }

  return (
    <View className={`px-2 py-0.5 rounded-md ${styles.bg}`}>
      <Text className={`text-xs font-medium ${styles.text}`}>{status}</Text>
    </View>
  )
}

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <View className="flex-1 bg-white rounded-2xl border border-neutral-100 p-3 items-center">
    <Text className={`text-xl font-bold ${accent}`}>{value}</Text>
    <Text className="text-xs text-neutral-400 mt-0.5">{label}</Text>
  </View>
)

// ── Item form modal ───────────────────────────────────────────
const ItemFormModal = ({
  visible,
  editing,
  onClose,
  onSaved,
}: {
  visible: boolean
  editing: Item | null
  onClose: () => void
  onSaved: () => void
}) => {
  const [form, setForm]   = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    if (visible) {
      setForm(editing
        ? { name: editing.name, description: editing.description ?? '', status: editing.status, priority: String(editing.priority), tags: editing.tags ?? '' }
        : emptyForm
      )
      setError(null)
    }
  }, [visible, editing])

  const statusOptions: Array<'active' | 'pending' | 'archived'> = ['active', 'pending', 'archived']

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
      if (!res.ok) throw new Error(d.message ?? (d.errors ? Object.values(d.errors).flat().join(', ') : 'Save failed'))
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="bg-white rounded-t-3xl px-5 pt-5 pb-10">
          {/* Handle */}
          <View className="w-10 h-1 rounded-full bg-neutral-200 self-center mb-5" />

          <Text className="text-base font-semibold text-neutral-900 mb-4">
            {editing ? 'Edit Item' : 'Create Item'}
          </Text>

          {error && (
            <View className="mb-3 p-3 bg-red-50 rounded-xl">
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          )}

          <View className="gap-y-3">
            {/* Name */}
            <TextInput
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
              placeholder="Name *"
              placeholderTextColor="#a3a3a3"
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
            />

            {/* Description */}
            <TextInput
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
              placeholder="Description"
              placeholderTextColor="#a3a3a3"
              value={form.description}
              onChangeText={v => setForm(f => ({ ...f, description: v }))}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Status picker */}
            <View className="flex-row gap-x-2">
              {statusOptions.map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setForm(f => ({ ...f, status: s }))}
                  className={`flex-1 py-2.5 rounded-xl items-center border ${
                    form.status === s
                      ? 'bg-neutral-900 border-neutral-900'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <Text className={`text-xs font-medium ${form.status === s ? 'text-white' : 'text-neutral-500'}`}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Priority */}
            <TextInput
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
              placeholder="Priority (0)"
              placeholderTextColor="#a3a3a3"
              value={form.priority}
              onChangeText={v => setForm(f => ({ ...f, priority: v.replace(/[^0-9]/g, '') }))}
              keyboardType="numeric"
            />

            {/* Tags */}
            <TextInput
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
              placeholder="Tags (comma separated)"
              placeholderTextColor="#a3a3a3"
              value={form.tags}
              onChangeText={v => setForm(f => ({ ...f, tags: v }))}
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-x-3 mt-5">
            <TouchableOpacity
              onPress={save}
              disabled={saving}
              className={`flex-1 py-3.5 rounded-2xl items-center ${saving ? 'bg-neutral-300' : 'bg-neutral-900'}`}
            >
              <Text className="text-white text-sm font-semibold">
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3.5 rounded-2xl items-center border border-neutral-200"
            >
              <Text className="text-neutral-600 text-sm font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ── Item row ──────────────────────────────────────────────────
const ItemRow = ({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item:     Item
  onEdit:   (item: Item) => void
  onDelete: (id: number) => void
  deleting: number | null
}) => (
  <View className="px-4 py-3 flex-row items-start gap-3 border-b border-neutral-50">
    <View className="flex-1 min-w-0">
      <View className="flex-row items-center gap-2 flex-wrap">
        <Text className="text-sm font-medium text-neutral-900">{item.name}</Text>
        <StatusBadge status={item.status} />
        {item.priority > 0 && (
          <Text className="text-xs text-neutral-400">P{item.priority}</Text>
        )}
      </View>
      {item.description ? (
        <Text className="text-xs text-neutral-500 mt-0.5" numberOfLines={1}>{item.description}</Text>
      ) : null}
      {item.tags ? (
        <View className="flex-row flex-wrap gap-1 mt-1">
          {item.tags.split(',').map((t, i) => (
            <View key={i} className="bg-neutral-100 rounded px-1.5 py-0.5">
              <Text className="text-xs text-neutral-500">{t.trim()}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
    <View className="flex-row gap-3 pt-0.5">
      <TouchableOpacity onPress={() => onEdit(item)}>
        <Text className="text-xs text-neutral-400">Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(item.id)} disabled={deleting === item.id}>
        <Text className="text-xs text-red-400">{deleting === item.id ? '…' : 'Delete'}</Text>
      </TouchableOpacity>
    </View>
  </View>
)

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:index */

const IndexScreen = () => {
  const [items,    setItems]    = useState<Item[]>([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<Item | null>(null)
  const [stats,    setStats]    = useState({ total: 0, active: 0, pending: 0, archived: 0 })

  const isMounted = useRef(true)
  useEffect(() => { return () => { isMounted.current = false } }, [])

  const load = useCallback(async () => {
    if (!isMounted.current) return
    setLoading(true)
    try {
      const res  = await apiFetch('/api/crud-test/items')
      if (!res.ok) throw new Error(`${res.status}`)
      const d    = await res.json()
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
    } catch (e) {
      console.error('[crud-test] load failed:', e)
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setShowForm(true) }
  const openEdit   = (item: Item) => { setEditing(item); setShowForm(true) }

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

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-neutral-900">CRUD Test</Text>
          <Text className="text-xs text-neutral-400 mt-0.5">Same API as web — cross-platform sync</Text>
        </View>
        <TouchableOpacity
          onPress={openCreate}
          className="bg-neutral-900 px-4 py-2 rounded-xl"
        >
          <Text className="text-white text-xs font-semibold">+ Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View className="flex-row gap-2 px-4 py-4">
          <StatCard label="Total"    value={stats.total}    accent="text-neutral-900" />
          <StatCard label="Active"   value={stats.active}   accent="text-green-600"   />
          <StatCard label="Pending"  value={stats.pending}  accent="text-yellow-600"  />
          <StatCard label="Archived" value={stats.archived} accent="text-neutral-400" />
        </View>

        {/* List */}
        <View className="mx-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-6">
          <View className="px-4 py-3 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-900">Items</Text>
            <TouchableOpacity onPress={load}>
              <Text className="text-xs text-neutral-400">Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="small" color="#a3a3a3" />
            </View>
          ) : items.length === 0 ? (
            <View className="py-12 items-center px-6">
              <Text className="text-sm text-neutral-400 text-center">
                No items yet. Tap + Create or check the seeder ran.
              </Text>
            </View>
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
        </View>

        {/* Footer note */}
        <View className="mx-4 mb-8 bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            endpoint: /api/crud-test/items{'\n'}
            backend: Laravel · crud-test slug{'\n'}
            sync: web ↔ native shared DB
          </Text>
        </View>
      </ScrollView>

      <ItemFormModal
        visible={showForm}
        editing={editing}
        onClose={() => setShowForm(false)}
        onSaved={load}
      />
    </View>
  ) 
}

/* @arkzen:native:page:index:end */

/* @arkzen:native:components:lynx:shared */

import { useState, useEffect } from '@lynx-js/react'

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

type Item = {
  id:          number
  name:        string
  description: string | null
  status:      'active' | 'pending' | 'archived'
  priority:    number
  tags:        string | null
  created_at:  string
  updated_at:  string
}

type FormData = { name: string; description: string; status: 'active' | 'pending' | 'archived'; priority: string; tags: string }
const emptyForm: FormData = { name: '', description: '', status: 'active', priority: '0', tags: '' }

async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers ?? {}),
    },
  })
}

// ── Status badge ──────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active:   { bg: 'bg-green-100',   text: 'text-green-700'   },
    pending:  { bg: 'bg-yellow-100',  text: 'text-yellow-700'  },
    archived: { bg: 'bg-neutral-100', text: 'text-neutral-500' },
  }[status] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' }

  return (
    <view className={`px-2 py-0.5 rounded-md ${styles.bg}`}>
      <text className={`text-xs font-medium ${styles.text}`}>{status}</text>
    </view>
  )
}

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <view className="flex-1 bg-white rounded-2xl border border-neutral-100 p-3 items-center">
    <text className={`text-xl font-bold ${accent}`}>{value}</text>
    <text className="text-xs text-neutral-400 mt-0.5">{label}</text>
  </view>
)

// ── Item row ──────────────────────────────────────────────────
const ItemRow = ({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item:     Item
  onEdit:   (item: Item) => void
  onDelete: (id: number) => void
  deleting: number | null
}) => (
  <view className="px-4 py-3 flex-row items-start gap-3 border-b border-neutral-50">
    <view className="flex-1">
      <view className="flex-row items-center gap-2 flex-wrap">
        <text className="text-sm font-medium text-neutral-900">{item.name}</text>
        <StatusBadge status={item.status} />
        {item.priority > 0 && (
          <text className="text-xs text-neutral-400">P{item.priority}</text>
        )}
      </view>
      {item.description ? (
        <text className="text-xs text-neutral-500 mt-0.5">{item.description}</text>
      ) : null}
      {item.tags ? (
        <view className="flex-row flex-wrap gap-1 mt-1">
          {item.tags.split(',').map((t, i) => (
            <view key={i} className="bg-neutral-100 rounded px-1.5 py-0.5">
              <text className="text-xs text-neutral-500">{t.trim()}</text>
            </view>
          ))}
        </view>
      ) : null}
    </view>
    <view className="flex-row gap-3 pt-0.5">
      <view bindtap={() => onEdit(item)}>
        <text className="text-xs text-neutral-400">Edit</text>
      </view>
      <view bindtap={() => deleting === item.id ? null : onDelete(item.id)}>
        <text className="text-xs text-red-400">{deleting === item.id ? '…' : 'Delete'}</text>
      </view>
    </view>
  </view>
)

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:index */

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

/* @arkzen:native:page:lynx:index:end */
