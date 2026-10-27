// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — SectionHeaderNative [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:11:24.626Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { nativeStyles } from './utils'

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

export const SectionHeaderNative = ({
  icon, title, subtitle, color
}: {
  icon: string; title: string; subtitle: string; color: string
}) => (
  <View style={nativeStyles.sectionHeader}>
    <View style={[nativeStyles.sectionHeaderIcon, { backgroundColor: `${color}22` }]}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={nativeStyles.sectionHeaderTitle}>{title}</Text>
      <Text style={nativeStyles.sectionHeaderSub}>{subtitle}</Text>
    </View>
  </View>
)

// ─── DEMO CARD ─────────────────────────────────────────────────────────────────
