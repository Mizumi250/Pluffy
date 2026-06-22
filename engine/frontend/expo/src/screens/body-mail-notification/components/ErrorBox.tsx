// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ErrorBox [Expo]
// Source: @arkzen:native:components (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T12:11:34.920Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ── Error box ──────────────────────────────────────────────────
export const ErrorBox = ({ message }: { message: string }) => (
  <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
    <Text className="text-xs text-red-600">{message}</Text>
  </View>
)

// ── Primary button ─────────────────────────────────────────────
