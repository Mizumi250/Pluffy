// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Screen [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.444Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'

export const Screen = ({ title, subtitle, right, children, onRefresh, refreshing }: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode; onRefresh?: () => void; refreshing?: boolean }) => (
  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled"
    refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <Text accessibilityRole="header" style={{ fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: TH.text }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 16, color: TH.sub, marginTop: 4 }}>{subtitle}</Text>}
      </View>
      {right}
    </View>
    {children}
  </ScrollView>
)
