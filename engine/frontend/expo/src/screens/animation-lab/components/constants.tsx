// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — animation-lab [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:43:16.623Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'


// ─── NAV SECTIONS ─────────────────────────────────────────────────────────────
export const NAV_SECTIONS_NATIVE = [
  { id: 'entrance',    label: 'Entrance',     icon: '▶', color: '#6366f1' },
  { id: 'timeline',    label: 'Timeline',     icon: '⏱', color: '#a78bfa' },
  { id: 'stagger',     label: 'Stagger',      icon: '⠿', color: '#f59e0b' },
  { id: 'press',       label: 'Press / Tap',  icon: '👆', color: '#0ea5e9' },
  { id: 'moti',        label: 'Moti Variants',icon: '✦', color: '#f59e0b' },
  { id: 'keyframes',   label: 'Keyframes',    icon: '◈', color: '#f43f5e' },
  { id: 'loop',        label: 'Loop / Repeat',icon: '⟳', color: '#10b981' },
  { id: 'transforms',  label: 'Transforms',   icon: '⬡', color: '#a855f7' },
  { id: 'spring',      label: 'Spring',       icon: '⟲', color: '#ec4899' },
  { id: 'easing',      label: 'Easing',       icon: '⇄', color: '#f97316' },
]

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
