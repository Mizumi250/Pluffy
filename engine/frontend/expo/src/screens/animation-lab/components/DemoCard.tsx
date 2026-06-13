// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — DemoCard [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:12:37.304Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { style } from './utils'

// ─── SHARED CARD COMPONENTS ───────────────────────────────────────────────────
export const DemoCard = ({ title, desc, full = false, children }: {
  title: string; desc: string; full?: boolean; children: React.ReactNode
}) => (
  <View style={full ? s.demoCardFull : s.demoCard}>
    <View style={s.demoCardHeader}>
      <Text style={s.demoCardTitle}>{title}</Text>
      <Text style={s.demoCardDesc}>{desc}</Text>
    </View>
    <View style={s.demoCardStage}>{children}</View>
  </View>
)
