// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ErrorBox [Expo]
// Source: @arkzen:native:components (mail-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T12:12:34.562Z
// ============================================================

import React, { useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { CheckCircle, Clock, LogOut, Mail, RefreshCw, Send, XCircle } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ── Error box ─────────────────────────────────────────────────
export const ErrorBox = ({ message }: { message: string }) => (
  <View className="flex-row items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
    <XCircle size={14} color="#ef4444" style={{ marginTop: 1 }} />
    <Text className="text-xs text-red-600 flex-1">{message}</Text>
  </View>
)

// ── Primary button ────────────────────────────────────────────
