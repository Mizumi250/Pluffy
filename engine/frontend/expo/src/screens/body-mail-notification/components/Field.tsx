// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Field [Expo]
// Source: @arkzen:native:components (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:12:37.729Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ── Reusable input field ───────────────────────────────────────
export const Field = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
}: {
  placeholder:      string
  value:            string
  onChangeText:     (v: string) => void
  secureTextEntry?: boolean
  keyboardType?:    'default' | 'email-address'
}) => (
  <TextInput
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
    placeholder={placeholder}
    placeholderTextColor="#a3a3a3"
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
    autoCapitalize="none"
    autoCorrect={false}
  />
)

// ── Error box ──────────────────────────────────────────────────
