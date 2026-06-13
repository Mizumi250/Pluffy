// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — KindBadge [Expo]
// Source: @arkzen:native:components (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T14:30:28.373Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ── Kind badge ─────────────────────────────────────────────────
export const KindBadge = ({ kind }: { kind: string }) => (
  <View className={`px-2.5 py-0.5 rounded-full ${kind === 'mail' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
    <Text className={`text-xs font-bold ${kind === 'mail' ? 'text-blue-700' : 'text-yellow-700'}`}>
      {kind === 'mail' ? '✉ MAIL' : '🔔 NOTIF'}
    </Text>
  </View>
)

// ── Status dot ─────────────────────────────────────────────────
