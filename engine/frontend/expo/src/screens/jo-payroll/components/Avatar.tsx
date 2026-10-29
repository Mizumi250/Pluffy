// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Avatar [Expo]
// Source: @arkzen:native:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:07.971Z
// ============================================================

import React, { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { AlertCircle, Banknote, Building2, CalendarDays, CreditCard, FileText, Landmark, LayoutDashboard, Search, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react-native'
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
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
