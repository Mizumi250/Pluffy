// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StatusDot [Expo]
// Source: @arkzen:native:components (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:12:38.268Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { color } from './utils'
import type { WsStatus } from './types'

export const StatusDot = ({ status }: { status: WsStatus }) => {
  const color = status === 'connected' ? '#4ade80' : status === 'connecting' ? '#facc15' : '#f87171'
  return <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
}
