/* @arkzen:meta
name: inventory-management
version: 2.0.0
description: Full inventory management with stock tracking
auth: false
dependencies: []
*/

/* @arkzen:web:config
modal:
  borderRadius: 2xl
  backdrop: blur
  animation: fadeScale
toast:
  position: top-right
  duration: 3000
table:
  striped: true
  hoverable: true
*/

/* @arkzen:database:inventories
table: inventories
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
  sku:
    type: string
    length: 100
    unique: true
    nullable: false
  quantity:
    type: integer
    default: 0
    nullable: false
  price:
    type: decimal
    precision: 10
    scale: 2
    nullable: false
  category:
    type: string
    length: 100
    nullable: true
  description:
    type: text
    nullable: true
seeder:
  count: 5
  data:
    - name: Wireless Keyboard
      sku: WK-001
      quantity: 50
      price: 1299.00
      category: Electronics
      description: Compact wireless keyboard
    - name: USB Hub 4-Port
      sku: UH-001
      quantity: 120
      price: 450.00
      category: Electronics
      description: 4-port USB 3.0 hub
    - name: Notebook A5
      sku: NB-001
      quantity: 200
      price: 85.00
      category: Stationery
      description: A5 lined notebook
    - name: Office Chair
      sku: OC-001
      quantity: 15
      price: 8500.00
      category: Furniture
      description: Ergonomic office chair
    - name: Monitor Stand
      sku: MS-001
      quantity: 30
      price: 750.00
      category: Furniture
      description: Adjustable monitor stand
*/

/* @arkzen:api:inventories
model: Inventory
controller: InventoryController
prefix: /api/inventories
middleware: []
endpoints:
  index:
    method: GET
    route: /
    description: Get paginated list of inventories
    query:
      search: string|optional
      per_page: integer|default:15
    response:
      type: paginated
  show:
    method: GET
    route: /{id}
    description: Get single inventory item
    response:
      type: single
  store:
    method: POST
    route: /
    description: Create new inventory item
    validation:
      name: required|string|max:255
      sku: required|string|unique:inventories
      quantity: required|integer|min:0
      price: required|numeric|min:0
      category: nullable|string|max:100
      description: nullable|string
    response:
      type: single
  update:
    method: PUT
    route: /{id}
    description: Update inventory item
    validation:
      name: sometimes|string|max:255
      quantity: sometimes|integer|min:0
      price: sometimes|numeric|min:0
      category: nullable|string|max:100
      description: nullable|string
    response:
      type: single
  destroy:
    method: DELETE
    route: /{id}
    description: Delete inventory item
    response:
      type: message
      value: Item deleted successfully
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState } from 'react'
import { Package, TrendingUp, AlertTriangle, DollarSign, Edit2, Trash2, Plus } from 'lucide-react'
import { Modal }      from '@/arkzen/core/components/Modal'
import { Dialog }     from '@/arkzen/core/components/Dialog'
import { Badge }      from '@/arkzen/core/components/utils'
import { useToast }   from '@/arkzen/core/components/Toast'
import { useQuery }   from '@/arkzen/core/hooks/useQuery'
import { useMutation } from '@/arkzen/core/hooks/useMutation'

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

const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <div className="arkzen-card p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-neutral-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
    </div>
  </div>
)

const InventoryRow = ({ item, onEdit, onDelete }: { item: InventoryItem; onEdit: (i: InventoryItem) => void; onDelete: (i: InventoryItem) => void }) => {
  const stockVariant = item.quantity === 0 ? 'error' : item.quantity < 20 ? 'warning' : 'success'
  const stockLabel   = item.quantity === 0 ? 'Out of stock' : item.quantity < 20 ? 'Low stock' : 'In stock'
  return (
    <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors group">
      <td className="px-4 py-3.5">
        <p className="font-medium text-neutral-900 text-sm">{item.name}</p>
        <p className="text-xs text-neutral-400 font-mono mt-0.5">{item.sku}</p>
      </td>
      <td className="px-4 py-3.5 text-sm text-neutral-600">{item.category ?? '—'}</td>
      <td className="px-4 py-3.5"><Badge label={stockLabel} variant={stockVariant} dot /></td>
      <td className="px-4 py-3.5 text-sm font-medium">{item.quantity}</td>
      <td className="px-4 py-3.5 text-sm font-semibold">₱{Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"><Edit2 size={14} /></button>
          <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  )
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const { toast }                                    = useToast()
  const [search, setSearch]                          = useState('')
  const [modalOpen, setModalOpen]                    = useState(false)
  const [deleteDialog, setDeleteDialog]              = useState(false)
  const [editing, setEditing]                        = useState<InventoryItem | null>(null)
  const [deleting, setDeleting]                      = useState<InventoryItem | null>(null)
  const [form, setForm]                              = useState<FormState>(emptyForm)

  const { data, isLoading, refetch } = useQuery<{ data: InventoryItem[] }>('/api/inventories', { params: { per_page: 100 } })
  const items = data?.data ?? []

  const { mutate: saveItem, isLoading: saving } = useMutation({
    method:     editing ? 'PUT' : 'POST',
    invalidates: ['/api/inventories'],
    onSuccess:  () => { toast.success(editing ? 'Item updated' : 'Item created'); setModalOpen(false); refetch() },
    onError:    () => toast.error('Failed to save item'),
  })

  const { mutate: removeItem } = useMutation({
    method:     'DELETE',
    invalidates: ['/api/inventories'],
    onSuccess:  () => { toast.success('Item deleted'); setDeleteDialog(false); refetch() },
    onError:    () => toast.error('Failed to delete item'),
  })

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit   = (item: InventoryItem) => {
    setEditing(item)
    setForm({ name: item.name, sku: item.sku, quantity: String(item.quantity), price: String(item.price), category: item.category ?? '', description: item.description ?? '' })
    setModalOpen(true)
  }
  const openDelete = (item: InventoryItem) => { setDeleting(item); setDeleteDialog(true) }

  const handleSave = () => {
    if (!form.name || !form.sku || !form.price) { toast.error('Name, SKU and price are required'); return }
    const url = editing ? `/api/inventories/${editing.id}` : '/api/inventories'
    saveItem(url, { ...form, quantity: parseInt(form.quantity) || 0, price: parseFloat(form.price) || 0 })
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  )

  const totalValue = items.reduce((s, i) => s + (i.price * i.quantity), 0)
  const lowStock   = items.filter(i => i.quantity < 20 && i.quantity > 0).length
  const outOfStock = items.filter(i => i.quantity === 0).length

  return (
    <div className="arkzen-container">
      <div className="flex items-start justify-between mb-8 inventory-header">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Inventory</h1>
          <p className="text-neutral-500 mt-1">Manage your products and stock levels</p>
        </div>
        <button onClick={openCreate} className="arkzen-btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 inventory-stats">
        <StatCard label="Total Items"  value={items.length}                          icon={<Package size={20} className="text-blue-600" />}    color="bg-blue-50" />
        <StatCard label="Total Value"  value={`₱${totalValue.toLocaleString()}`}    icon={<DollarSign size={20} className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard label="Low Stock"    value={lowStock}                              icon={<AlertTriangle size={20} className="text-amber-600" />} color="bg-amber-50" />
        <StatCard label="Out of Stock" value={outOfStock}                            icon={<TrendingUp size={20} className="text-red-600" />}   color="bg-red-50" />
      </div>

      <div className="arkzen-card overflow-hidden inventory-table">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">
            All Items <span className="ml-2 text-neutral-400 font-normal">({filtered.length})</span>
          </h2>
          <input type="text" placeholder="Search name or SKU..." value={search} onChange={e => setSearch(e.target.value)} className="arkzen-input w-56" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {['Item', 'Category', 'Status', 'Qty', 'Price', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-100">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5"><div className="h-4 bg-neutral-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400 text-sm">
                    {search ? 'No items match your search' : 'No inventory items yet. Add your first item.'}
                  </td>
                </tr>
              ) : (
                filtered.map(item => <InventoryRow key={item.id} item={item} onEdit={openEdit} onDelete={openDelete} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Item' : 'Add New Item'}
        description={editing ? `Editing ${editing.name}` : 'Fill in the details below'}
        renderFooter={(onClose) => (
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="arkzen-btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="arkzen-btn-primary flex-1">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        )}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">Name *</label>
            <input className="arkzen-input w-full" placeholder="Product name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">SKU *</label>
            <input className="arkzen-input w-full" placeholder="SKU-001" value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} disabled={!!editing} />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">Category</label>
            <input className="arkzen-input w-full" placeholder="Electronics" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">Quantity</label>
            <input className="arkzen-input w-full" type="number" min="0" placeholder="0" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">Price (₱) *</label>
            <input className="arkzen-input w-full" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">Description</label>
            <textarea className="arkzen-input w-full resize-none" rows={3} placeholder="Optional description" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
          </div>
        </div>
      </Modal>

      <Dialog
        open={deleteDialog}
        onConfirm={() => deleting && removeItem(`/api/inventories/${deleting.id}`, {})}
        onCancel={() => setDeleteDialog(false)}
        title="Delete Item"
        description={`Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  )
}
/* @arkzen:web:page:index:end */

/* @arkzen:web:animation */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

gsap.registerPlugin(ScrollTrigger)

const inventoryManagementAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.inventory-header', { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    gsap.fromTo('.inventory-stats > *', { opacity: 0, y: 20, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2 })
    gsap.fromTo('.inventory-table', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.5 })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25 } },
}

/* @arkzen:web:animation:end */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Package, TrendingUp, AlertTriangle, DollarSign, Edit2, Trash2, Plus, Search, X, ChevronRight } from 'lucide-react-native'
const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { Package, TrendingUp, AlertTriangle, DollarSign, Edit2, Trash2, Plus, Search, X, ChevronRight } from 'lucide-react-native'
const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:rn:end */

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
  icon: JSX.Element; bg: string
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
            <Icon set="lucide" name="x" size={16} color="#737373" />
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

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:default */

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
            <Icon set="lucide" name="plus" size={14} color="#fff" />
            <Text className="text-white text-xs font-semibold">Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="flex-row items-center gap-2 bg-neutral-100 rounded-xl px-3 py-2.5">
          <Icon set="lucide" name="search" size={14} color="#a3a3a3" />
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
              <Icon set="lucide" name="x" size={14} color="#a3a3a3" />
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
          <StatCard label="Items"      value={items.length}               icon={<Icon set="lucide" name="package" size={18} color="#2563eb" />} bg="bg-blue-50"    />
          <StatCard label="Low Stock"  value={lowStock}                   icon={<Icon set="lucide" name="alert-triangle" size={18} color="#d97706" />} bg="bg-amber-50"   />
          <StatCard label="Out"        value={outOfStock}                 icon={<Icon set="lucide" name="trending-up" size={18} color="#dc2626" />} bg="bg-red-50"     />
        </View>
        <View className="bg-emerald-50 rounded-2xl p-3.5 flex-row items-center gap-3">
          <Icon set="lucide" name="dollar-sign" size={20} color="#059669" />
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
              <Icon set="lucide" name="package" size={28} color="#e5e5e5" />
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
                      <Icon set="lucide" name="edit-2" size={13} color="#525252" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item)}
                      className="p-1.5 rounded-lg bg-red-50"
                    >
                      <Icon set="lucide" name="trash-2" size={13} color="#ef4444" />
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

/* @arkzen:native:page:index:end */

/* @arkzen:native:components:lynx:shared */

import { useState, useEffect, useCallback } from '@lynx-js/react'
import { Icon } from '@/arkzen/core/components/Icon'
const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

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
  <view className={`flex-1 ${bg} rounded-2xl p-3.5 items-center gap-1.5`}>
    {icon}
    <text className="text-lg font-bold text-neutral-900">{value}</text>
    <text className="text-xs text-neutral-500 text-center">{label}</text>
  </view>
)

// ── Stock badge ───────────────────────────────────────────────
const StockBadge = ({ quantity }: { quantity: number }) => {
  const cfg = quantity === 0
    ? { bg: 'bg-red-50',     text: 'text-red-600',     label: 'Out of stock' }
    : quantity < 20
    ? { bg: 'bg-amber-50',   text: 'text-amber-600',   label: 'Low stock'    }
    : { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'In stock'     }
  return (
    <view className={`px-2 py-0.5 rounded-full ${cfg.bg}`}>
      <text className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</text>
    </view>
  )
}

// ── Field ─────────────────────────────────────────────────────
// Lynx has no multiline TextInput — multiline renders as <textarea>, single-line as <input>
const Field = ({
  label, placeholder, value, onInput, multiline = false, editable = true,
}: {
  label: string; placeholder: string; value: string
  onInput: (v: string) => void
  multiline?: boolean; editable?: boolean
}) => (
  <view className="gap-1.5">
    <text className="text-xs font-medium text-neutral-600">{label}</text>
    {multiline ? (
      <textarea
        className={`border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 min-h-[72px] ${
          !editable ? 'bg-neutral-100 text-neutral-400' : 'bg-neutral-50'
        }`}
        placeholder={placeholder}
        bindinput={e => onInput(e.detail.value)}
        disabled={!editable}
      />
    ) : (
      <input
        className={`border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 ${
          !editable ? 'bg-neutral-100 text-neutral-400' : 'bg-neutral-50'
        }`}
        placeholder={placeholder}
        bindinput={e => onInput(e.detail.value)}
        disabled={!editable}
      />
    )}
  </view>
)

// ── Item form panel ───────────────────────────────────────────
// Lynx has no Modal — renders as an inline slide-up panel
const ItemFormPanel = ({
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

  if (!visible) return null

  return (
    <view className="absolute inset-0 bg-black/40 justify-end z-50">
      <view className="bg-white rounded-t-3xl">
        {/* Panel header */}
        <view className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
          <text className="text-base font-semibold text-neutral-900">
            {editing ? 'Edit Item' : 'Add New Item'}
          </text>
          <view
            bindtap={onClose}
            className="p-1.5 rounded-xl bg-neutral-100"
          >
            <Icon set="lucide" name="x" size={16} color="#737373" />
          </view>
        </view>

        <scroll-view className="p-5 gap-y-3.5">
          {error && (
            <view className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <text className="text-xs text-red-600">{error}</text>
            </view>
          )}

          <Field label="Name *"       placeholder="Product name"       value={form.name}        onInput={v => setForm(f => ({...f, name: v}))}        />
          <Field label="SKU *"        placeholder="SKU-001"             value={form.sku}         onInput={v => setForm(f => ({...f, sku: v}))}         editable={!editing} />
          <Field label="Category"     placeholder="Electronics"         value={form.category}    onInput={v => setForm(f => ({...f, category: v}))}    />
          <Field label="Quantity"     placeholder="0"                   value={form.quantity}    onInput={v => setForm(f => ({...f, quantity: v}))}    />
          <Field label="Price (₱) *"  placeholder="0.00"                value={form.price}       onInput={v => setForm(f => ({...f, price: v}))}       />
          <Field label="Description"  placeholder="Optional description" value={form.description} onInput={v => setForm(f => ({...f, description: v}))} multiline />
        </scroll-view>

        {/* Footer */}
        <view className="flex-row gap-3 px-5 py-4 border-t border-neutral-100">
          <view
            bindtap={onClose}
            className="flex-1 py-3 rounded-2xl bg-neutral-100 items-center"
          >
            <text className="text-sm font-semibold text-neutral-700">Cancel</text>
          </view>
          <view
            bindtap={saving ? undefined : handleSave}
            className={`flex-1 py-3 rounded-2xl items-center ${saving ? 'bg-neutral-300' : 'bg-neutral-900'}`}
          >
            <text className="text-sm font-semibold text-white">
              {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
            </text>
          </view>
        </view>
      </view>
    </view>
  )
}

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:index */

const IndexScreen = () => {
  const [items,      setItems]      = useState<InventoryItem[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editing,    setEditing]    = useState<InventoryItem | null>(null)
  const [deleting,   setDeleting]   = useState<InventoryItem | null>(null)
  const [error,      setError]      = useState<string | null>(null)

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

  const confirmDelete = async (item: InventoryItem) => {
    // Lynx has no Alert — use inline confirm state
    setDeleting(item)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await apiFetch(`/api/inventories/${deleting.id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(i => i.id !== deleting.id))
    } catch {
      setError('Failed to delete item')
    } finally {
      setDeleting(null)
    }
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
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 pt-4 pb-3">
        <view className="flex-row items-center justify-between mb-3">
          <view>
            <text className="text-xl font-bold text-neutral-900">Inventory</text>
            <text className="text-xs text-neutral-400 mt-0.5">Manage products & stock levels</text>
          </view>
          <view
            bindtap={openCreate}
            className="flex-row items-center gap-1.5 bg-neutral-900 px-3.5 py-2.5 rounded-2xl"
          >
            <Icon set="lucide" name="plus" size={14} color="#fff" />
            <text className="text-white text-xs font-semibold">Add Item</text>
          </view>
        </view>

        {/* Search */}
        <view className="flex-row items-center gap-2 bg-neutral-100 rounded-xl px-3 py-2.5">
          <Icon set="lucide" name="search" size={14} color="#a3a3a3" />
          <input
            className="flex-1 text-sm text-neutral-900"
            placeholder="Search name or SKU..."
            bindinput={e => setSearch(e.detail.value)}
          />
          {search.length > 0 && (
            <view bindtap={() => setSearch('')}>
              <Icon set="lucide" name="x" size={14} color="#a3a3a3" />
            </view>
          )}
        </view>
      </view>

      <scroll-view className="flex-1 p-4 gap-y-3">

        {/* Stat cards */}
        <view className="flex-row gap-3">
          <StatCard label="Items"     value={items.length} icon={<Icon set="lucide" name="package" size={18} color="#2563eb" />} bg="bg-blue-50"   />
          <StatCard label="Low Stock" value={lowStock}     icon={<Icon set="lucide" name="alert-triangle" size={18} color="#d97706" />} bg="bg-amber-50"  />
          <StatCard label="Out"       value={outOfStock}   icon={<Icon set="lucide" name="trending-up" size={18} color="#dc2626" />} bg="bg-red-50"    />
        </view>
        <view className="bg-emerald-50 rounded-2xl p-3.5 flex-row items-center gap-3">
          <Icon set="lucide" name="dollar-sign" size={20} color="#059669" />
          <view>
            <text className="text-xs text-neutral-500">Total Inventory Value</text>
            <text className="text-lg font-bold text-neutral-900">
              ₱{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </text>
          </view>
        </view>

        {error && (
          <view className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <text className="text-xs text-red-600">{error}</text>
          </view>
        )}

        {/* Delete confirm inline */}
        {deleting && (
          <view className="bg-white border border-red-100 rounded-2xl p-4 gap-3">
            <text className="text-sm font-semibold text-neutral-900">Delete Item</text>
            <text className="text-xs text-neutral-500">
              Are you sure you want to delete "{deleting.name}"? This cannot be undone.
            </text>
            <view className="flex-row gap-3">
              <view
                bindtap={() => setDeleting(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 items-center"
              >
                <text className="text-sm font-medium text-neutral-700">Cancel</text>
              </view>
              <view
                bindtap={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 items-center"
              >
                <text className="text-sm font-semibold text-white">Delete</text>
              </view>
            </view>
          </view>
        )}

        {/* Items list */}
        <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <view className="px-5 py-3.5 border-b border-neutral-100">
            <text className="text-sm font-semibold text-neutral-900">
              All Items <text className="text-neutral-400 font-normal">({filtered.length})</text>
            </text>
          </view>

          {loading ? (
            <view className="py-12 items-center">
              <text className="text-sm text-neutral-400">Loading…</text>
            </view>
          ) : filtered.length === 0 ? (
            <view className="py-12 items-center gap-2">
              <Icon set="lucide" name="package" size={28} color="#e5e5e5" />
              <text className="text-sm text-neutral-400">
                {search ? 'No items match your search' : 'No inventory items yet'}
              </text>
            </view>
          ) : (
            filtered.map((item, i) => (
              <view
                key={item.id}
                className={`px-5 py-3.5 flex-row items-center gap-3 ${
                  i < filtered.length - 1 ? 'border-b border-neutral-50' : ''
                }`}
              >
                {/* Info */}
                <view className="flex-1 min-w-0">
                  <text className="text-sm font-semibold text-neutral-900">
                    {item.name}
                  </text>
                  <text className="text-xs font-mono text-neutral-400 mt-0.5">{item.sku}</text>
                  <view className="flex-row items-center gap-2 mt-1.5">
                    <StockBadge quantity={item.quantity} />
                    {item.category && (
                      <text className="text-xs text-neutral-400">{item.category}</text>
                    )}
                  </view>
                </view>

                {/* Right side */}
                <view className="items-end gap-1.5">
                  <text className="text-sm font-bold text-neutral-900">
                    ₱{Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </text>
                  <text className="text-xs text-neutral-500">Qty: {item.quantity}</text>
                  <view className="flex-row gap-2 mt-1">
                    <view
                      bindtap={() => openEdit(item)}
                      className="p-1.5 rounded-lg bg-neutral-100"
                    >
                      <Icon set="lucide" name="edit-2" size={13} color="#525252" />
                    </view>
                    <view
                      bindtap={() => confirmDelete(item)}
                      className="p-1.5 rounded-lg bg-red-50"
                    >
                      <Icon set="lucide" name="trash-2" size={13} color="#ef4444" />
                    </view>
                  </view>
                </view>
              </view>
            ))
          )}
        </view>

        {/* Footer info */}
        <view className="bg-neutral-100 rounded-2xl px-4 py-3">
          <text className="text-xs text-neutral-500 font-mono leading-5">
            {`backend: /api/inventories\ndb: inventory-management SQLite`}
          </text>
        </view>

      </scroll-view>

      <ItemFormPanel
        visible={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={loadItems}
      />

    </view>
  )
}

/* @arkzen:native:page:lynx:index:end */
