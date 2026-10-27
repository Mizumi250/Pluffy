// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Bar [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.442Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'

export const Bar = ({ value, max, color = TH.blue }: { value: number; max: number; color?: string }) => (
  <View style={{ height: 8, borderRadius: 4, backgroundColor: TH.fill, overflow: 'hidden' }}><View style={{ height: 8, borderRadius: 4, width: `${Math.max(0, Math.min(100, max ? (value / max) * 100 : 0))}%`, backgroundColor: color }} /></View>
)
