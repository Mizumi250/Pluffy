// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — TabRow
// Source: @arkzen:native:components:lynx:* (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.113Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useMemo, useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'

// ── TabRow ───────────────────────────────────────────────────

export const TabRow = ({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
    {tabs.map(t => (
      <TouchableOpacity
        key={t}
        onPress={() => onChange(t)}
        style={{ borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: active === t ? '#171717' : 'transparent' }}
      >
        <Text style={{ fontSize: 12, fontWeight: '600', color: active === t ? '#ffffff' : '#9ca3af' }}>{t}</Text>
      </TouchableOpacity>
    ))}
  </View>
)
