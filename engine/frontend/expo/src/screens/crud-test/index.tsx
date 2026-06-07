// ============================================================
// ARKZEN GENERATED SCREEN — crud-test/index
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

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

// User screen (from @arkzen:native:page:index)
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

// Engine wrapper
export function ArkzenScreen_CrudTest_Index() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('crud-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <IndexScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_CrudTest_Index
