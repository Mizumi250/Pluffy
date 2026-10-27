// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Seg [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.411Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'

export const Seg = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(118,118,128,0.12)', borderRadius: 12, padding: 3 }}>
      {options.map(o => (
        <TouchableOpacity key={o.value} accessibilityRole="tab" accessibilityState={{ selected: value === o.value }} onPress={() => onChange(o.value)}
          style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9, backgroundColor: value === o.value ? '#fff' : 'transparent' }}>
          <Text style={{ fontWeight: value === o.value ? '700' : '500', fontSize: 14, color: TH.text }}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
)
