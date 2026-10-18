// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — notification-test [Expo]
// Source: @arkzen:native:components (notification-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:15.820Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// ── Channel icon emoji ─────────────────────────────────────────
export const channelEmoji: Record<string, string> = {
  'database-ping':         '🗄️',
  'mail-ping':             '✉️',
  'broadcast-ping':        '📡',
  'broadcast-ping-public': '🌐',
  'all-channels':          '🔔',
}

export const channelLabel: Record<string, string> = {
  'database-ping':         'Database',
  'mail-ping':             'Mail',
  'broadcast-ping':        'Broadcast (private)',
  'broadcast-ping-public': 'Broadcast (public)',
  'all-channels':          'All Channels',
}

export const channelDesc: Record<string, string> = {
  'database-ping':         'Stored in notifications table',
  'mail-ping':             'Sent to your email (Mailtrap)',
  'broadcast-ping':        'Private Reverb channel per user',
  'broadcast-ping-public': 'Public Reverb channel for all',
  'all-channels':          'Database + Mail + Broadcast',
}
