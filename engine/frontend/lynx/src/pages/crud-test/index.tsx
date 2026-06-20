// ARKZEN GENERATED — crud-test/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:50.428Z
import { ItemRow } from './components/ItemRow'
import { StatCard } from './components/StatCard'
import { apiFetch, emptyForm } from './components/utils'
import type { FormData, Item } from './components/types'
import { ScrollView, Text, TextInput, TouchableOpacity, View, useEffect, useState } from '@lynx-js/react'

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
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>

      {/* Header */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#171717' }}>CRUD Test</Text>
          <Text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>Same API as web — cross-platform sync</Text>
        </View>
        <TouchableOpacity
          onPress={openCreate}
          style={{ backgroundColor: '#171717', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      {showForm && (
        <View style={{ backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#f5f5f5' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#171717', marginBottom: 16 }}>
            {editing ? 'Edit Item' : 'Create Item'}
          </Text>
          {error && (
            <View style={{ backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 11, color: '#dc2626' }}>{error}</Text>
            </View>
          )}
          <View style={{ gap: 10 }}>
            <TextInput
              style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 13, color: '#171717' }}
              placeholder="Name *"
              value={form.name}
              onInput={e => setForm(f => ({ ...f, name: e.detail.value }))}
            />
            <TextInput
              style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 13, color: '#171717' }}
              placeholder="Description"
              value={form.description}
              onInput={e => setForm(f => ({ ...f, description: e.detail.value }))}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {statusOptions.map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setForm(f => ({ ...f, status: s }))}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1,
                    backgroundColor: form.status === s ? '#171717' : '#fff',
                    borderColor: form.status === s ? '#171717' : '#e5e5e5',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '500', color: form.status === s ? '#fff' : '#737373' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 13, color: '#171717' }}
              placeholder="Priority (0)"
              value={form.priority}
              onInput={e => setForm(f => ({ ...f, priority: e.detail.value.replace(/[^0-9]/g, '') }))}
            />
            <TextInput
              style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 13, color: '#171717' }}
              placeholder="Tags (comma separated)"
              value={form.tags}
              onInput={e => setForm(f => ({ ...f, tags: e.detail.value }))}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              onPress={save}
              disabled={saving}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: saving ? '#d4d4d4' : '#171717' }}
            >
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowForm(false)}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e5e5e5' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#737373' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={{ flex: 1 }}>
        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 16 }}>
          <StatCard label="Total"    value={stats.total}    accent="#171717" />
          <StatCard label="Active"   value={stats.active}   accent="#16a34a" />
          <StatCard label="Pending"  value={stats.pending}  accent="#ca8a04" />
          <StatCard label="Archived" value={stats.archived} accent="#a3a3a3" />
        </View>

        {/* List */}
        <View style={{ marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f5f5f5', overflow: 'hidden', marginBottom: 24 }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#171717' }}>Items</Text>
            <TouchableOpacity onPress={load}>
              <Text style={{ fontSize: 11, color: '#a3a3a3' }}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#a3a3a3' }}>Loading…</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={{ paddingVertical: 48, alignItems: 'center', paddingHorizontal: 24 }}>
              <Text style={{ fontSize: 13, color: '#a3a3a3', textAlign: 'center' }}>
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

        {/* Footer */}
        <View style={{ marginHorizontal: 16, marginBottom: 32, backgroundColor: '#f5f5f5', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ fontSize: 11, color: '#737373', fontFamily: 'monospace', lineHeight: 20 }}>
            {`endpoint: /api/crud-test/items\nbackend: Laravel · crud-test slug\nsync: web ↔ native shared DB`}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
