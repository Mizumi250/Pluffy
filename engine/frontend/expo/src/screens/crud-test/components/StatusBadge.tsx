// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StatusBadge [Expo]
// Source: @arkzen:native:components (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T04:19:49.958Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ── Status badge ──────────────────────────────────────────────
export const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active:   { bg: 'bg-green-100',   text: 'text-green-700'   },
    pending:  { bg: 'bg-yellow-100',  text: 'text-yellow-700'  },
    archived: { bg: 'bg-neutral-100', text: 'text-neutral-500' },
  }[status] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' }

  return (
    <View className={`px-2 py-0.5 rounded-md ${styles.bg}`}>
      <Text className={`text-xs font-medium ${styles.text}`}>{status}</Text>
    </View>
  )
}

// ── Stat card ─────────────────────────────────────────────────
