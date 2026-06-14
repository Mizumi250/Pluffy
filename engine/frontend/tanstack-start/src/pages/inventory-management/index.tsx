// ============================================================
// ARKZEN GENERATED PAGE — inventory-management/index [TanStack]
// Layout: guest | Auth guard: false | Guest: true
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:28:55.257Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { inventoryManagementAnimations, pageVariants } from '@/arkzen/generated/inventory-management.animations'
import { InventoryRow } from './components/InventoryRow'
import { StatCard } from './components/StatCard'
import { emptyForm } from './components/utils'
import type { FormState, InventoryItem } from './components/types'
import { Package, TrendingUp, AlertTriangle, DollarSign, Edit2, Trash2, Plus } from 'lucide-react'
import { Modal } from '@/arkzen/core/components/Modal'
import { Dialog } from '@/arkzen/core/components/Dialog'
import { useToast } from '@/arkzen/core/components/Toast'
import { useQuery } from '@/arkzen/core/hooks/useQuery'
import { useMutation } from '@/arkzen/core/hooks/useMutation'

// Page component code (from @arkzen:page:index)
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

// Wrapper for animation + layout
const ArkzenPage_InventoryManagement_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = inventoryManagementAnimations(pageRef)
    return cleanup
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_InventoryManagement_Index
