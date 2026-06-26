// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StatusDot [Expo]
// Source: @arkzen:native:components (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-26T07:08:55.829Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ── Status dot ─────────────────────────────────────────────────
export const StatusDot = ({ status }: { status: string }) => (
  <View
    className={`w-2 h-2 rounded-full mr-1.5 ${status === 'sent' ? 'bg-green-500' : 'bg-red-500'}`}
    style={{ marginTop: 1 }}
  />
)
