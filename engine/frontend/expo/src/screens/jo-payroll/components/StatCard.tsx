// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StatCard [Expo]
// Source: @arkzen:native:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T11:35:54.047Z
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
  <View
    className="flex-1 rounded-2xl border p-3.5"
    style={{ backgroundColor: bg, borderColor }}
  >
    <Text className="text-[22px] font-bold" style={{ color }}>{value}</Text>
    <Text className="text-[11px] text-gray-400 font-medium mt-0.5">{label}</Text>
  </View>
)

// ── WorkerRow ────────────────────────────────────────────────
