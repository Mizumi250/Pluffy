// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — WorkerRow [Expo]
// Source: @arkzen:native:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-24T16:50:57.628Z
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
      className="flex-row items-center px-4 py-3 border-b border-gray-50"
      style={{ gap: 12 }}
    >
      <Avatar name={jo.name_of_jo} size={38} />
      <View className="flex-1">
        <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={1}>{jo.name_of_jo}</Text>
        <Text className="text-[11px] text-gray-400 mt-0.5">{jo.job_title} · {jo.funding}</Text>
      </View>
      <View className="items-end" style={{ gap: 4 }}>
        <Text className="text-[13px] font-bold text-gray-900">{formatPeso(netPay)}</Text>
        <View className={`rounded-md px-1.5 py-0.5 ${jo.disbursement_type === 'ATM' ? 'bg-blue-100' : 'bg-amber-100'}`}>
          <Text className={`text-[10px] font-bold ${jo.disbursement_type === 'ATM' ? 'text-blue-600' : 'text-amber-600'}`}>
            {jo.disbursement_type}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ── SearchBar ────────────────────────────────────────────────
