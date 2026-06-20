// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StockBadge
// Source: @arkzen:native:components:lynx:* (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:51.676Z
// ============================================================

import React, { ScrollView, Text, TextInput, TouchableOpacity, View, useCallback, useEffect, useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'
import { Field } from './Field'

// ── Stock badge ───────────────────────────────────────────────
export const StockBadge = ({ quantity }: { quantity: number }) => {
  const cfg = quantity === 0
    ? { bg: 'bg-red-50',     text: 'text-red-600',     label: 'Out of stock' }
    : quantity < 20
    ? { bg: 'bg-amber-50',   text: 'text-amber-600',   label: 'Low stock'    }
    : { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'In stock'     }
  return (
    <View className={`px-2 py-0.5 rounded-full ${cfg.bg}`}>
      <Text className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</Text>
    </View>
  )
}

// ── Field ─────────────────────────────────────────────────────
