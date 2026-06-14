// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — WorkerRow [Expo]
// Source: @arkzen:native:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T04:19:51.368Z
// ============================================================

import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Banknote, Building2, CreditCard, Landmark, Search, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react-native'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { create } from 'zustand'
import { formatPeso } from './utils'
import type { JobOrder } from './types'
import { Avatar } from './Avatar'
import { SearchBar } from './SearchBar'

// ── WorkerRow ────────────────────────────────────────────────

export const WorkerRow = ({ jo, onPress }: { jo: JobOrder; onPress?: () => void }) => {
  const deductions = (jo.sss_amount ?? 0) + (jo.hdmf_premium ?? 0) + (jo.hdmf_mpl ?? 0) + (jo.calamity_loan ?? 0)
  const netPay = jo.basic_pay - deductions

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' }}
    >
      <Avatar name={jo.name_of_jo} size={38} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }} numberOfLines={1}>{jo.name_of_jo}</Text>
        <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{jo.job_title} · {jo.funding}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>{formatPeso(netPay)}</Text>
        <View style={{ backgroundColor: jo.disbursement_type === 'ATM' ? '#dbeafe' : '#fef3c7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: jo.disbursement_type === 'ATM' ? '#2563eb' : '#d97706' }}>
            {jo.disbursement_type}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ── SearchBar ────────────────────────────────────────────────
