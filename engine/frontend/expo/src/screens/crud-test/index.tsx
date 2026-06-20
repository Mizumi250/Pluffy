// ============================================================
// ARKZEN GENERATED SCREEN — crud-test/index
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ItemFormModal } from './components/ItemFormModal'
import { ItemRow } from './components/ItemRow'
import { StatCard } from './components/StatCard'
import { StatusBadge } from './components/StatusBadge'
import { apiFetch } from './components/utils'
import type { Item } from './components/types'

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
