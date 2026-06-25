// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Field [Expo]
// Source: @arkzen:native:components (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:31:19.467Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { AlertTriangle, ChevronRight, DollarSign, Edit2, Package, Plus, Search, Trash2, TrendingUp, X } from 'lucide-react-native'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ── Field ─────────────────────────────────────────────────────
export const Field = ({
  label, placeholder, value, onChangeText,
  keyboardType = 'default', multiline = false, editable = true,
}: {
  label: string; placeholder: string; value: string
  onChangeText: (v: string) => void
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address'
  multiline?: boolean; editable?: boolean
}) => (
  <View className="gap-1.5">
    <Text className="text-xs font-medium text-neutral-600">{label}</Text>
    <TextInput
      className={`border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 ${
        !editable ? 'bg-neutral-100 text-neutral-400' : 'bg-neutral-50'
      } ${multiline ? 'min-h-[72px]' : ''}`}
      placeholder={placeholder}
      placeholderTextColor="#a3a3a3"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize="none"
      autoCorrect={false}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      editable={editable}
    />
  </View>
)

// ── Item form modal ───────────────────────────────────────────
