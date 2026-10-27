// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Empty [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.430Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'

export const Empty = ({ icon, title, text, children }: { icon?: string; title: string; text?: string; children?: React.ReactNode }) => (
  <View style={{ alignItems: 'center', padding: 32, gap: 6 }}>
    <Text style={{ fontSize: 40 }}>{icon ?? '🌱'}</Text>
    <Text style={{ fontSize: 18, fontWeight: '700', color: TH.text, textAlign: 'center' }}>{title}</Text>
    {text && <Text style={{ color: TH.sub, textAlign: 'center', fontSize: 15, lineHeight: 21 }}>{text}</Text>}
    {children && <View style={{ marginTop: 10 }}>{children}</View>}
  </View>
)
