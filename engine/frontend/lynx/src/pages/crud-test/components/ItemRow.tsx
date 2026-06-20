// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ItemRow
// Source: @arkzen:native:components:lynx:* (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:50.415Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useEffect, useState } from '@lynx-js/react'
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
  <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderBottomWidth: 1, borderBottomColor: '#fafafa' }}>
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Text style={{ fontSize: 13, fontWeight: '500', color: '#171717' }}>{item.name}</Text>
        <StatusBadge status={item.status} />
        {item.priority > 0 && (
          <Text style={{ fontSize: 11, color: '#a3a3a3' }}>P{item.priority}</Text>
        )}
      </View>
      {item.description ? (
        <Text style={{ fontSize: 11, color: '#737373', marginTop: 2 }} numberOfLines={1}>{item.description}</Text>
      ) : null}
      {item.tags ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {item.tags.split(',').map((t, i) => (
            <View key={i} style={{ backgroundColor: '#f5f5f5', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ fontSize: 11, color: '#737373' }}>{t.trim()}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
    <View style={{ flexDirection: 'row', gap: 12, paddingTop: 2 }}>
      <TouchableOpacity onPress={() => onEdit(item)}>
        <Text style={{ fontSize: 11, color: '#a3a3a3' }}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(item.id)} disabled={deleting === item.id}>
        <Text style={{ fontSize: 11, color: '#f87171' }}>{deleting === item.id ? '…' : 'Delete'}</Text>
      </TouchableOpacity>
    </View>
  </View>
)
