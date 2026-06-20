// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ErrorBox
// Source: @arkzen:native:components:lynx:* (mail-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.812Z
// ============================================================

import React, { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { CheckCircle, Clock, LogOut, Mail, RefreshCw, Send, XCircle } from 'lucide-react-native'

// ── Error box ─────────────────────────────────────────────────
export const ErrorBox = ({ message }: { message: string }) => (
  <View className="flex-row items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
    <XCircle size={14} color="#ef4444" style={{ marginTop: 1 }} />
    <Text className="text-xs text-red-600 flex-1">{message}</Text>
  </View>
)

// ── Primary button ────────────────────────────────────────────
