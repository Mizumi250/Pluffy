// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — DemoCardNative [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:32:41.848Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { nativeStyles } from './utils'

// ─── DEMO CARD ─────────────────────────────────────────────────────────────────

export const DemoCardNative = ({ title, desc, full = false, children }: {
  title: string; desc: string; full?: boolean; children: React.ReactNode
}) => (
  <View style={full ? nativeStyles.demoCardFull : nativeStyles.demoCard}>
    <View style={nativeStyles.demoCardHeader}>
      <Text style={nativeStyles.demoCardTitle}>{title}</Text>
      <Text style={nativeStyles.demoCardDesc}>{desc}</Text>
    </View>
    <View style={nativeStyles.demoCardStage}>{children}</View>
  </View>
)

// ─── PLAY/RESET BUTTONS ───────────────────────────────────────────────────────
