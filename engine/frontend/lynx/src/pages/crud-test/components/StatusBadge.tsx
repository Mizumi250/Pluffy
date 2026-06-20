// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StatusBadge
// Source: @arkzen:native:components:lynx:* (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:50.409Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useEffect, useState } from '@lynx-js/react'

// ── Status badge ──────────────────────────────────────────────
export const StatusBadge = ({ status }: { status: string }) => {
  const color = {
    active:   { bg: '#dcfce7', text: '#15803d' },
    pending:  { bg: '#fef9c3', text: '#a16207' },
    archived: { bg: '#f5f5f5', text: '#737373' },
  }[status] ?? { bg: '#f5f5f5', text: '#525252' }

  return (
    <View style={{ backgroundColor: color.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
      <Text style={{ color: color.text, fontSize: 11, fontWeight: '500' }}>{status}</Text>
    </View>
  )
}

// ── Stat card ─────────────────────────────────────────────────
