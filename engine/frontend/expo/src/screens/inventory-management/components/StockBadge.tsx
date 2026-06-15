// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StockBadge [Expo]
// Source: @arkzen:native:components (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T16:01:56.761Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { AlertTriangle, ChevronRight, DollarSign, Edit2, Package, Plus, Search, Trash2, TrendingUp, X } from 'lucide-react-native'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Field } from './Field'

// ── Stock badge ───────────────────────────────────────────────
export const StockBadge = ({ quantity }: { quantity: number }) => {
  const cfg = quantity === 0
    ? { bg: 'bg-red-50',    text: 'text-red-600',    label: 'Out of stock' }
    : quantity < 20
    ? { bg: 'bg-amber-50',  text: 'text-amber-600',  label: 'Low stock'    }
    : { bg: 'bg-emerald-50',text: 'text-emerald-600',label: 'In stock'     }
  return (
    <View className={`px-2 py-0.5 rounded-full ${cfg.bg}`}>
      <Text className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</Text>
    </View>
  )
}

// ── Field ─────────────────────────────────────────────────────
