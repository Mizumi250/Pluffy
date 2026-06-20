// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StatCard
// Source: @arkzen:native:components:lynx:* (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:50.412Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useEffect, useState } from '@lynx-js/react'
import type { Item } from './types'

// ── Stat card ─────────────────────────────────────────────────
export const StatCard = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f5f5f5', padding: 12, alignItems: 'center' }}>
    <Text style={{ fontSize: 20, fontWeight: '700', color: accent }}>{value}</Text>
    <Text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>{label}</Text>
  </View>
)

// ── Item row ──────────────────────────────────────────────────
