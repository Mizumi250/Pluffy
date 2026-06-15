// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ItemFormModal [Expo]
// Source: @arkzen:native:components (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T16:01:55.306Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { apiFetch, emptyForm } from './utils'
import type { FormData, Item } from './types'

// ── Item form modal ───────────────────────────────────────────
export const ItemFormModal = ({
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
