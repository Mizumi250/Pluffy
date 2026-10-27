// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — LangPicker [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.459Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LANGS, TH } from './constants'
import { Chip } from './Chip'

export const LangPicker = ({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) => (
  <View>
    {label && <Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>}
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {LANGS.map(l => <Chip key={l.code} label={`${l.flag} ${l.name}`} on={value === l.code} onPress={() => onChange(l.code)} />)}
    </ScrollView>
  </View>
)
