// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — SearchBar
// Source: @arkzen:native:components:lynx:* (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.112Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useMemo, useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'
import { TabRow } from './TabRow'

// ── SearchBar ────────────────────────────────────────────────

export const SearchBar = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
    <Icon set="lucide" name="search" size={14} color="#9ca3af" />
    <TextInput
      value={value}
      onInput={e => onChange(e.detail.value)}
      placeholder={placeholder ?? 'Search…'}
      style={{ flex: 1, fontSize: 13, color: '#111827' }}
    />
  </View>
)

// ── TabRow ───────────────────────────────────────────────────
