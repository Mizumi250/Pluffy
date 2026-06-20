// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — Field
// Source: @arkzen:native:components:lynx:* (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:51.678Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'

// ── Field ─────────────────────────────────────────────────────
export const Field = ({
  label, placeholder, value, onInput, multiline = false, editable = true,
}: {
  label: string; placeholder: string; value: string
  onInput: (v: string) => void
  multiline?: boolean; editable?: boolean
}) => (
  <View className="gap-1.5">
    <Text className="text-xs font-medium text-neutral-600">{label}</Text>
    <TextInput
      className={`border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 ${
        !editable ? 'bg-neutral-100 text-neutral-400' : 'bg-neutral-50'
      } ${multiline ? 'min-h-[72px]' : ''}`}
      placeholder={placeholder}
      value={value}
      onInput={e => onInput(e.detail.value)}
      multiline={multiline}
      editable={editable}
    />
  </View>
)

// ── Item form panel ───────────────────────────────────────────
// Lynx has no Modal — renders as an inline slide-up panel
