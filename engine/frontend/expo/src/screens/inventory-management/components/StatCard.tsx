// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StatCard [Expo]
// Source: @arkzen:native:components (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T04:19:50.799Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { AlertTriangle, ChevronRight, DollarSign, Edit2, Package, Plus, Search, Trash2, TrendingUp, X } from 'lucide-react-native'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ── Stat card ─────────────────────────────────────────────────
export const StatCard = ({
  label, value, icon, bg,
}: {
  label: string; value: string | number
  icon: React.ReactNode; bg: string
}) => (
  <View className={`flex-1 ${bg} rounded-2xl p-3.5 items-center gap-1.5`}>
    {icon}
    <Text className="text-lg font-bold text-neutral-900">{value}</Text>
    <Text className="text-xs text-neutral-500 text-center">{label}</Text>
  </View>
)

// ── Stock badge ───────────────────────────────────────────────
