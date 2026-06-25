// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — TabRow [Expo]
// Source: @arkzen:native:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:52:51.196Z
// ============================================================

import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Banknote, Building2, CreditCard, Landmark, Search, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react-native'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { create } from 'zustand'

// ── TabRow ───────────────────────────────────────────────────

export const TabRow = ({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) => (
  <View className="flex-row flex-wrap" style={{ gap: 4 }}>
    {tabs.map(t => (
      <TouchableOpacity
        key={t}
        onPress={() => onChange(t)}
        activeOpacity={0.7}
        className={`rounded-lg px-3 py-1.5 ${active === t ? 'bg-[#171717]' : 'bg-transparent'}`}
      >
        <Text className={`text-xs font-semibold ${active === t ? 'text-white' : 'text-gray-400'}`}>{t}</Text>
      </TouchableOpacity>
    ))}
  </View>
)
