// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Card [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.389Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SHADOW, TH } from './constants'

export const Card = ({ children, style, onPress }: { children: React.ReactNode; style?: any; onPress?: () => void }) => {
  const base = { backgroundColor: TH.card, borderRadius: 20, padding: 16, ...SHADOW }
  return onPress ? <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[base, style]}>{children}</TouchableOpacity> : <View style={[base, style]}>{children}</View>
}
