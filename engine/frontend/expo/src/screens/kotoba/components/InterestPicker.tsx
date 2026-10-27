// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — InterestPicker [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.477Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Chip } from './Chip'

export const InterestPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const all = ['travel', 'food', 'music', 'anime', 'football', 'books', 'coffee', 'photography', 'gaming', 'movies', 'fitness', 'tech']
  const cur = value.split(',').map(s => s.trim()).filter(Boolean)
  const flip = (i: string) => onChange((cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i]).join(','))
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{all.map(i => <Chip key={i} label={i} on={cur.includes(i)} onPress={() => flip(i)} />)}</View>
}

// ─── Compose box ──────────────────────────────────────────────
