// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StatusDot [Expo]
// Source: @arkzen:native:components (notification-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:21.685Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import type { WsStatus } from './types'

// ── WS status dot ──────────────────────────────────────────────
export const StatusDot = ({ status }: { status: WsStatus }) => {
  const color =
    status === 'connected'  ? '#4ade80' :
    status === 'connecting' ? '#facc15' : '#f87171'
  return (
    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
  )
}

// ── Channel icon emoji ─────────────────────────────────────────
