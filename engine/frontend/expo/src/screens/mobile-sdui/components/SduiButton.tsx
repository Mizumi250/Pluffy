// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — SduiButton [Expo]
// Source: @arkzen:native:components (mobile-sdui)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-04T15:49:13.949Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Alert, AppState, Pressable, ScrollView, Text, TextInput, View } from 'react-native'

/* @arkzen:resolved:import expo */
export const SduiButton = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    className={variant === 'primary'
      ? `min-h-14 w-full items-center justify-center rounded-2xl px-5 py-4 ${disabled ? 'bg-indigo-300' : 'bg-indigo-600 active:bg-indigo-700'}`
      : 'self-start rounded-xl border border-slate-200 bg-white px-4 py-3'}
  >
    <Text className={variant === 'primary' ? 'font-semibold text-white' : 'font-semibold text-slate-700'}>
      {label}
    </Text>
  </Pressable>
)
