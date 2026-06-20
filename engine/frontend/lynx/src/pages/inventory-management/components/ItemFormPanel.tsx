// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ItemFormPanel
// Source: @arkzen:native:components:lynx:* (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:51.680Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'
import { apiFetch, emptyForm } from './utils'
import type { FormState, InventoryItem } from './types'
import { Field } from './Field'

// ── Item form panel ───────────────────────────────────────────
// Lynx has no Modal — renders as an inline slide-up panel
export const ItemFormPanel = ({
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
    <View className="absolute inset-0 bg-black/40 justify-end z-50">
      <View className="bg-white rounded-t-3xl">
        {/* Panel header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
          <Text className="text-base font-semibold text-neutral-900">
            {editing ? 'Edit Item' : 'Add New Item'}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="p-1.5 rounded-xl bg-neutral-100"
          >
            <Icon set="lucide" name="x" size={16} color="#737373" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          {error && (
            <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          )}

          <Field label="Name *"       placeholder="Product name"       value={form.name}        onInput={v => setForm(f => ({...f, name: v}))}        />
          <Field label="SKU *"        placeholder="SKU-001"             value={form.sku}         onInput={v => setForm(f => ({...f, sku: v}))}         editable={!editing} />
          <Field label="Category"     placeholder="Electronics"         value={form.category}    onInput={v => setForm(f => ({...f, category: v}))}    />
          <Field label="Quantity"     placeholder="0"                   value={form.quantity}    onInput={v => setForm(f => ({...f, quantity: v}))}    />
          <Field label="Price (₱) *"  placeholder="0.00"                value={form.price}       onInput={v => setForm(f => ({...f, price: v}))}       />
          <Field label="Description"  placeholder="Optional description" value={form.description} onInput={v => setForm(f => ({...f, description: v}))} multiline />
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
            className={`flex-1 py-3 rounded-2xl items-center ${saving ? 'bg-neutral-300' : 'bg-neutral-900'}`}
          >
            <Text className="text-sm font-semibold text-white">
              {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
