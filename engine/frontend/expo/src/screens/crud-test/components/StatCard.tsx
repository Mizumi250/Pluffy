// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StatCard [Expo]
// Source: @arkzen:native:components (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T04:19:49.959Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import type { Item } from './types'

// ── Stat card ─────────────────────────────────────────────────
export const StatCard = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <View className="flex-1 bg-white rounded-2xl border border-neutral-100 p-3 items-center">
    <Text className={`text-xl font-bold ${accent}`}>{value}</Text>
    <Text className="text-xs text-neutral-400 mt-0.5">{label}</Text>
  </View>
)

// ── Item form modal ───────────────────────────────────────────
