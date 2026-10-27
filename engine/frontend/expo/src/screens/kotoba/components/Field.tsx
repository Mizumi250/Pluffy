// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Field [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:07.085Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'

export const Field = ({ label, value, onChangeText, placeholder, multiline, secure, keyboard, autoCap }: { label?: string; value: string; onChangeText: (t: string) => void; placeholder?: string; multiline?: boolean; secure?: boolean; keyboard?: any; autoCap?: any }) => (
  <View>
    {label && <Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>}
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={TH.sub} multiline={multiline} secureTextEntry={secure} keyboardType={keyboard} autoCapitalize={autoCap ?? 'none'} accessibilityLabel={label ?? placeholder}
      style={{ backgroundColor: TH.fill, borderRadius: 14, paddingHorizontal: 14, paddingVertical: multiline ? 12 : 13, fontSize: 16, color: TH.text, minHeight: multiline ? 90 : undefined, textAlignVertical: multiline ? 'top' : 'center' }} />
  </View>
)
