// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StatusPill [Expo]
// Source: @arkzen:native:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T08:07:16.089Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import * as Speech from 'expo-speech'
import { Volume2 } from 'lucide-react-native'
import { ActivityIndicator, Animated, Easing, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import type { NativeTicket } from './types'

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

export const StatusPill = ({ status }: { status: NativeTicket['status'] }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    waiting: { bg: 'bg-blue-50',    text: 'text-blue-600',   label: 'waiting'  },
    serving: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'serving' },
    done:    { bg: 'bg-neutral-100', text: 'text-neutral-500', label: 'done'   },
    skipped: { bg: 'bg-amber-50',   text: 'text-amber-600',  label: 'skipped'  },
  }
  const s = map[status] ?? map.waiting
  return (
    <View className={`px-2.5 py-1 rounded-full ${s.bg}`}>
      <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
    </View>
  )
}
