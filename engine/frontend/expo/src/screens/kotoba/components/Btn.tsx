// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Btn [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.403Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'

export const Btn = ({ label, onPress, kind = 'fill', disabled, small, style }: { label: string; onPress: () => void; kind?: 'primary' | 'tint' | 'fill' | 'danger' | 'ghost'; disabled?: boolean; small?: boolean; style?: any }) => {
  const bg = kind === 'primary' ? TH.blue : kind === 'tint' ? 'rgba(10,132,255,0.14)' : kind === 'danger' ? 'rgba(255,69,58,0.14)' : kind === 'ghost' ? 'transparent' : TH.fill
  const fg = kind === 'primary' ? '#fff' : kind === 'danger' ? TH.red : kind === 'fill' ? TH.text : TH.blue
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} disabled={disabled} activeOpacity={0.8} onPress={onPress}
      style={[{ height: small ? 36 : 48, paddingHorizontal: small ? 14 : 20, borderRadius: small ? 11 : 14, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.45 : 1 }, style]}>
      <Text style={{ color: fg, fontWeight: '600', fontSize: small ? 14 : 16 }}>{label}</Text>
    </TouchableOpacity>
  )
}
