// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Skel [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:07.121Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

export const Skel = ({ n = 3, h = 100 }: { n?: number; h?: number }) => (
  <View style={{ gap: 12 }}>{Array.from({ length: n }).map((_, i) => <View key={i} style={{ height: h, borderRadius: 20, backgroundColor: 'rgba(120,120,128,0.12)' }} />)}</View>
)
