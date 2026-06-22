// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — notification-test [Expo]
// Source: @arkzen:native:components (notification-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T12:11:38.487Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export const BACKEND_URL   = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

export const REVERB_HOST   = process.env.EXPO_PUBLIC_REVERB_HOST        ?? 'localhost'

export const REVERB_PORT   = process.env.EXPO_PUBLIC_REVERB_PORT        ?? '8080'

export const REVERB_SCHEME = process.env.EXPO_PUBLIC_REVERB_SCHEME      ?? 'ws'

export const APP_KEY       = process.env.EXPO_PUBLIC_REVERB_APP_KEY     ?? 'arkzen-key'
