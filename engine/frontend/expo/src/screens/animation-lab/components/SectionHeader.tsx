// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — SectionHeader [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T00:40:57.030Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { s } from '../../../arkzen/generated/animation-lab.native-styles'

export const SectionHeader = ({ icon, title, subtitle, color }: {
  icon: string; title: string; subtitle: string; color: string
}) => (
  <View style={s.sectionHeader}>
    <View style={[s.sectionHeaderIcon, { backgroundColor: `${color}22` }]}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.sectionHeaderTitle}>{title}</Text>
      <Text style={s.sectionHeaderSub}>{subtitle}</Text>
    </View>
  </View>
)

// ─── SECTION: ENTRANCE ────────────────────────────────────────────────────────
