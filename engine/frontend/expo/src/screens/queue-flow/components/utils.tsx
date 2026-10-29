// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — queue-flow [Expo]
// Source: @arkzen:native:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:23.033Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { arkzenFetch } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import * as Speech from 'expo-speech'
import { LayoutGrid, Settings, Ticket, Volume2, WifiOff } from 'lucide-react-native'
import { ActivityIndicator, Animated, AppState, Easing, Platform, RefreshControl, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// ─── Utilities ────────────────────────────────────────────────────────────────

export const fmtWait = (mins: number) =>
  mins <= 0 ? 'Now' : mins < 60 ? `~${mins}m` : `~${Math.round(mins / 60)}h`

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
