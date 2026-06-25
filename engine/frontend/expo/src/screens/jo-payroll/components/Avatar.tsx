// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Avatar [Expo]
// Source: @arkzen:native:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:52:51.188Z
// ============================================================

import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Banknote, Building2, CreditCard, Landmark, Search, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react-native'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { create } from 'zustand'
import { getAvatarColor, getInitials } from './utils'
import { StatCard } from './StatCard'

// ── Avatar ───────────────────────────────────────────────────

export const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
  const color = getAvatarColor(name)
  return (
    <View
      className="items-center justify-center rounded-[10px]"
      style={{ width: size, height: size, backgroundColor: color.bg }}
    >
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: color.text }}>
        {getInitials(name)}
      </Text>
    </View>
  )
}

// ── StatCard ─────────────────────────────────────────────────
