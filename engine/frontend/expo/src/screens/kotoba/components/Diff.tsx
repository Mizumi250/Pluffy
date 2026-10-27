// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Diff [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.460Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'
import { diffText } from './utils'

export const Diff = ({ from, to, size = 15 }: { from: string; to: string; size?: number }) => (
  <Text style={{ fontSize: size, color: TH.text, lineHeight: size * 1.5 }}>
    {diffText(from, to).map((p, i) => <Text key={i} style={p.t === 'del' ? { color: TH.red, textDecorationLine: 'line-through', backgroundColor: 'rgba(255,69,58,0.14)' } : p.t === 'add' ? { color: '#1f9c43', fontWeight: '700', backgroundColor: 'rgba(48,209,88,0.2)' } : undefined}>{p.s}</Text>)}
  </Text>
)
