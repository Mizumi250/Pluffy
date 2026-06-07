// ============================================================
// ARKZEN GENERATED SCREEN — inventory-management/index
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { AlertTriangle, ChevronRight, DollarSign, Edit2, Package, Plus, Search, Trash2, TrendingUp, X } from 'lucide-react-native'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

interface InventoryItem {
  id:          number
  name:        string
  sku:         string
  quantity:    number
  price:       number
  category:    string | null
  description: string | null
  created_at:  string
  updated_at:  string
}

interface FormState {
  name: string; sku: string; quantity: string
  price: string; category: string; description: string
}

const emptyForm: FormState = { name: '', sku: '', quantity: '', price: '', category: '', description: '' }

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

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({
  label, value, icon, bg,
}: {
  label: string; value: string | number
  icon: React.ReactNode; bg: string
}) => (
  <View className={`flex-1 ${bg} rounded-2xl p-3.5 items-center gap-1.5`}>
    {icon}
    <Text className="text-lg font-bold text-neutral-900">{value}</Text>
    <Text className="text-xs text-neutral-500 text-center">{label}</Text>
  </View>
)

// ── Stock badge ───────────────────────────────────────────────
const StockBadge = ({ quantity }: { quantity: number }) => {
  const cfg = quantity === 0
    ? { bg: 'bg-red-50',    text: 'text-red-600',    label: 'Out of stock' }
    : quantity < 20
    ? { bg: 'bg-amber-50',  text: 'text-amber-600',  label: 'Low stock'    }
    : { bg: 'bg-emerald-50',text: 'text-emerald-600',label: 'In stock'     }
  return (
    <View className={`px-2 py-0.5 rounded-full ${cfg.bg}`}>
      <Text className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</Text>
    </View>
  )
}

// ── Field ─────────────────────────────────────────────────────
const Field = ({
  label, placeholder, value, onChangeText,
  keyboardType = 'default', multiline = false, editable = true,
}: {
  label: string; placeholder: string; value: string
  onChangeText: (v: string) => void
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address'
  multiline?: boolean; editable?: boolean
}) => (
  <View className="gap-1.5">
    <Text className="text-xs font-medium text-neutral-600">{label}</Text>
    <TextInput
      className={`border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 ${
        !editable ? 'bg-neutral-100 text-neutral-400' : 'bg-neutral-50'
      } ${multiline ? 'min-h-[72px]' : ''}`}
      placeholder={placeholder}
      placeholderTextColor="#a3a3a3"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize="none"
      autoCorrect={false}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      editable={editable}
    />
  </View>
)

// ── Item form modal ───────────────────────────────────────────
const ItemFormModal = ({
  visible, editing, onClose, onSaved,
}: {
  visible: boolean; editing: InventoryItem | null
  onClose: () => void; onSaved: () => void
}) => {
  const [form,   setForm]   = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name, sku: editing.sku,
        quantity: String(editing.quantity), price: String(editing.price),
        category: editing.category ?? '', description: editing.description ?? '',
      })
    } else {
      setForm(emptyForm)
    }
    setError(null)
  }, [editing, visible])

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.price) {
      setError('Name, SKU and price are required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const url    = editing ? `/api/inventories/${editing.id}` : '/api/inventories'
      const method = editing ? 'PUT' : 'POST'
      const res    = await apiFetch(url, {
        method,
        body: JSON.stringify({
          ...form,
          quantity: parseInt(form.quantity) || 0,
          price:    parseFloat(form.price)  || 0,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.message ?? 'Failed to save')
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Modal header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
          <Text className="text-base font-semibold text-neutral-900">
            {editing ? 'Edit Item' : 'Add New Item'}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-1.5 rounded-xl bg-neutral-100">
            <X size={16} color="#737373" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingVertical: 20, gap: 14 }}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          )}

          <Field label="Name *"       placeholder="Product name"  value={form.name}        onChangeText={v => setForm(f => ({...f, name: v}))}        />
          <Field label="SKU *"        placeholder="SKU-001"        value={form.sku}         onChangeText={v => setForm(f => ({...f, sku: v}))}         editable={!editing} />
          <Field label="Category"     placeholder="Electronics"    value={form.category}    onChangeText={v => setForm(f => ({...f, category: v}))}    />
          <Field label="Quantity"     placeholder="0"              value={form.quantity}    onChangeText={v => setForm(f => ({...f, quantity: v}))}    keyboardType="numeric" />
          <Field label="Price (₱) *"  placeholder="0.00"           value={form.price}       onChangeText={v => setForm(f => ({...f, price: v}))}       keyboardType="decimal-pad" />
          <Field label="Description"  placeholder="Optional description" value={form.description} onChangeText={v => setForm(f => ({...f, description: v}))} multiline />
        </ScrollView>

        {/* Footer */}
        <View className="flex-row gap-3 px-5 py-4 border-t border-neutral-100">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 py-3 rounded-2xl bg-neutral-100 items-center"
          >
            <Text className="text-sm font-semibold text-neutral-700">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
            className={`flex-1 py-3 rounded-2xl items-center ${saving ? 'bg-neutral-300' : 'bg-neutral-900'}`}
          >
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text className="text-sm font-semibold text-white">{editing ? 'Update' : 'Create'}</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const [items,       setItems]       = useState<InventoryItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editing,     setEditing]     = useState<InventoryItem | null>(null)
  const [error,       setError]       = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/inventories?per_page=100')
      const d   = await res.json()
      setItems(d.data ?? [])
    } catch {
      setError('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadItems() }, [])

  const handleDelete = (item: InventoryItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/api/inventories/${item.id}`, { method: 'DELETE' })
              setItems(prev => prev.filter(i => i.id !== item.id))
            } catch {
              Alert.alert('Error', 'Failed to delete item')
            }
          },
        },
      ]
    )
  }

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit   = (item: InventoryItem) => { setEditing(item); setModalOpen(true) }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  )

  const totalValue = items.reduce((s, i) => s + (i.price * i.quantity), 0)
  const lowStock   = items.filter(i => i.quantity < 20 && i.quantity > 0).length
  const outOfStock = items.filter(i => i.quantity === 0).length

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 pt-4 pb-3">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xl font-bold text-neutral-900">Inventory</Text>
            <Text className="text-xs text-neutral-400 mt-0.5">Manage products & stock levels</Text>
          </View>
          <TouchableOpacity
            onPress={openCreate}
            activeOpacity={0.8}
            className="flex-row items-center gap-1.5 bg-neutral-900 px-3.5 py-2.5 rounded-2xl"
          >
            <Plus size={14} color="#fff" />
            <Text className="text-white text-xs font-semibold">Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="flex-row items-center gap-2 bg-neutral-100 rounded-xl px-3 py-2.5">
          <Search size={14} color="#a3a3a3" />
          <TextInput
            className="flex-1 text-sm text-neutral-900"
            placeholder="Search name or SKU..."
            placeholderTextColor="#a3a3a3"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={14} color="#a3a3a3" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Stat cards */}
        <View className="flex-row gap-3">
          <StatCard label="Items"      value={items.length}               icon={<Package      size={18} color="#2563eb" />} bg="bg-blue-50"    />
          <StatCard label="Low Stock"  value={lowStock}                   icon={<AlertTriangle size={18} color="#d97706" />} bg="bg-amber-50"   />
          <StatCard label="Out"        value={outOfStock}                 icon={<TrendingUp   size={18} color="#dc2626" />} bg="bg-red-50"     />
        </View>
        <View className="bg-emerald-50 rounded-2xl p-3.5 flex-row items-center gap-3">
          <DollarSign size={20} color="#059669" />
          <View>
            <Text className="text-xs text-neutral-500">Total Inventory Value</Text>
            <Text className="text-lg font-bold text-neutral-900">
              ₱{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {error && (
          <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <Text className="text-xs text-red-600">{error}</Text>
          </View>
        )}

        {/* Items list */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-3.5 border-b border-neutral-100">
            <Text className="text-sm font-semibold text-neutral-900">
              All Items{' '}
              <Text className="text-neutral-400 font-normal">({filtered.length})</Text>
            </Text>
          </View>

          {loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="small" color="#a3a3a3" />
            </View>
          ) : filtered.length === 0 ? (
            <View className="py-12 items-center gap-2">
              <Package size={28} color="#e5e5e5" />
              <Text className="text-sm text-neutral-400">
                {search ? 'No items match your search' : 'No inventory items yet'}
              </Text>
            </View>
          ) : (
            filtered.map((item, i) => (
              <View
                key={item.id}
                className={`px-5 py-3.5 flex-row items-center gap-3 ${
                  i < filtered.length - 1 ? 'border-b border-neutral-50' : ''
                }`}
              >
                {/* Info */}
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-xs font-mono text-neutral-400 mt-0.5">{item.sku}</Text>
                  <View className="flex-row items-center gap-2 mt-1.5">
                    <StockBadge quantity={item.quantity} />
                    {item.category && (
                      <Text className="text-xs text-neutral-400">{item.category}</Text>
                    )}
                  </View>
                </View>

                {/* Right side */}
                <View className="items-end gap-1.5">
                  <Text className="text-sm font-bold text-neutral-900">
                    ₱{Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text className="text-xs text-neutral-500">Qty: {item.quantity}</Text>
                  <View className="flex-row gap-2 mt-1">
                    <TouchableOpacity
                      onPress={() => openEdit(item)}
                      className="p-1.5 rounded-lg bg-neutral-100"
                    >
                      <Edit2 size={13} color="#525252" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item)}
                      className="p-1.5 rounded-lg bg-red-50"
                    >
                      <Trash2 size={13} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Footer info */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            backend: /api/inventories{'\n'}
            db: inventory-management SQLite
          </Text>
        </View>

      </ScrollView>

      <ItemFormModal
        visible={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={loadItems}
      />
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_InventoryManagement_Index() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('inventory-management')
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

export default ArkzenScreen_InventoryManagement_Index
