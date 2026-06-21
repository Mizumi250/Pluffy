// ARKZEN GENERATED — inventory-management/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:55.341Z
import { ItemFormPanel } from './components/ItemFormPanel'
import { StatCard } from './components/StatCard'
import { StockBadge } from './components/StockBadge'
import { apiFetch } from './components/utils'
import type { InventoryItem } from './components/types'
import { useCallback, useEffect, useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons-lucide'

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

export const InventoryManagementIndex = IndexScreen;
