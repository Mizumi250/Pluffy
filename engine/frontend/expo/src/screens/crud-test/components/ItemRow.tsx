// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ItemRow [Expo]
// Source: @arkzen:native:components (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:13:40.275Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import type { Item } from './types'
import { StatusBadge } from './StatusBadge'

// ── Item row ──────────────────────────────────────────────────
export const ItemRow = ({
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
