// ============================================================
// ARKZEN GENERATED NATIVE HOOKS — animation-lab [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:11:24.618Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { create } from 'zustand'

import type { AnimLabState } from './types'

export const useAnimLabStore = create<AnimLabState>((set) => ({
  activeSection: 'entrance',
  setActiveSection: (s) => set({ activeSection: s }),
  playingDemo: null,
  setPlayingDemo: (id) => set({ playingDemo: id }),
  resetKey: 0,
  triggerReset: () => set((s) => ({ resetKey: s.resetKey + 1 })),
}))

// ─── NAV SECTIONS ─────────────────────────────────────────────────────────────
