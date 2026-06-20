// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StatCard
// Source: @arkzen:native:components:lynx:* (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:51.675Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'

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
