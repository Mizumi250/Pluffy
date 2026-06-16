// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ItemFormModal [Expo]
// Source: @arkzen:native:components (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T13:13:34.984Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { AlertTriangle, ChevronRight, DollarSign, Edit2, Package, Plus, Search, Trash2, TrendingUp, X } from 'lucide-react-native'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { apiFetch, emptyForm } from './utils'
import type { FormState, InventoryItem } from './types'
import { Field } from './Field'

// ── Item form modal ───────────────────────────────────────────
export const ItemFormModal = ({
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
