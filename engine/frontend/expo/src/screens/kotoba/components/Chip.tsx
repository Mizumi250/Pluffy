// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Chip [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:07.067Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'

export const Chip = ({ label, tone = 'gray', onPress, on }: { label: string; tone?: 'gray' | 'blue' | 'green' | 'orange' | 'purple'; onPress?: () => void; on?: boolean }) => {
  const m: any = { gray: ['rgba(120,120,128,0.14)', TH.sub], blue: ['rgba(10,132,255,0.14)', TH.blue], green: ['rgba(48,209,88,0.18)', '#22a847'], orange: ['rgba(255,159,10,0.2)', '#c77700'], purple: ['rgba(191,90,242,0.16)', TH.purple] }
  const [bg, fg] = on ? m.blue : m[tone]
  const inner = <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start' }}><Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{label}</Text></View>
  return onPress ? <TouchableOpacity onPress={onPress} style={{ marginRight: 6, marginBottom: 6 }}>{inner}</TouchableOpacity> : <View style={{ marginRight: 6, marginBottom: 6 }}>{inner}</View>
}
