// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — RoleBadge [Expo]
// Source: @arkzen:native:components (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:52:52.879Z
// ============================================================

import React, { useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ── Role badge ────────────────────────────────────────────────
export const RoleBadge = ({ role }: { role: string }) => (
  <View className={`px-2.5 py-1 rounded-full self-start ${
    role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
  }`}>
    <Text className={`text-xs font-bold ${
      role === 'admin' ? 'text-purple-700' : 'text-blue-700'
    }`}>
      {role}
    </Text>
  </View>
)
