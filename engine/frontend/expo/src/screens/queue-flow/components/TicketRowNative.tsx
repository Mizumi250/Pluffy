// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — TicketRowNative [Expo]
// Source: @arkzen:native:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T04:19:52.768Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import * as Speech from 'expo-speech'
import { Volume2 } from 'lucide-react-native'
import { ActivityIndicator, Animated, Easing, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import type { NativeTicket } from './types'
import { StatusPill } from './StatusPill'

export const TicketRowNative = ({ ticket, position }: { ticket: NativeTicket; position: number }) => (
  <View className="flex-row items-center gap-3 px-5 py-3 border-b border-neutral-50">
    <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center">
      <Text className="text-xs font-bold text-blue-500">#{position}</Text>
    </View>
    <View className="flex-1 min-w-0">
      <Text className="text-sm font-semibold text-neutral-900">{ticket.ticket_number}</Text>
      <Text className="text-xs text-neutral-400" numberOfLines={1}>{ticket.customer_name ?? 'Guest'}</Text>
    </View>
    <StatusPill status={ticket.status} />
  </View>
)
