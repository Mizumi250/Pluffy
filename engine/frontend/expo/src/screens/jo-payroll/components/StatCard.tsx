// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StatCard [Expo]
// Source: @arkzen:native:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T14:55:59.476Z
// ============================================================

import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Banknote, Building2, CreditCard, Landmark, Search, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react-native'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { create } from 'zustand'
import { WorkerRow } from './WorkerRow'

// ── StatCard ─────────────────────────────────────────────────

export const StatCard = ({ value, label, color = '#111827', bg = '#ffffff', borderColor = '#e5e7eb' }: {
  value: string | number
  label: string
  color?: string
  bg?: string
  borderColor?: string
}) => (
  <View style={{ flex: 1, backgroundColor: bg, borderRadius: 14, borderWidth: 1, borderColor, padding: 14 }}>
    <Text style={{ fontSize: 22, fontWeight: '700', color }}>{value}</Text>
    <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '500', marginTop: 2 }}>{label}</Text>
  </View>
)

// ── WorkerRow ────────────────────────────────────────────────
