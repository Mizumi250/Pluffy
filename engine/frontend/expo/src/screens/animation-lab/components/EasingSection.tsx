// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — EasingSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:08.998Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEasingDemo } from '../../../arkzen/generated/animation-lab.native-animations'
import { nativeStyles } from './utils'
import { DemoCardNative } from './DemoCardNative'
import { PlayResetNative } from './PlayResetNative'
import { SectionHeaderNative } from './SectionHeaderNative'

// ─── EASING SECTION ──────────────────────────────────────────────────────────

export const EasingSection = () => {
  const demos = [
    useEasingDemo(Easing.linear),
    useEasingDemo(Easing.ease),
    useEasingDemo(Easing.in(Easing.quad)),
    useEasingDemo(Easing.out(Easing.quad)),
    useEasingDemo(Easing.inOut(Easing.quad)),
    useEasingDemo(Easing.out(Easing.back(2.5))),
    useEasingDemo(Easing.out(Easing.elastic(1))),
    useEasingDemo(Easing.out(Easing.bounce)),
  ]

  const LABELS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'back.out', 'elastic', 'bounce']
  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d946ef', '#ec4899', '#f43f5e', '#f97316']

  return (
    <>
      <SectionHeaderNative icon="⇄" title="Easing Functions" subtitle="withTiming easing variants — slide right to compare" color="#f97316" />
      <View style={nativeStyles.demoGrid}>
        {demos.map(({ style, play, reset }, i) => (
          <DemoCardNative key={LABELS[i]} title={LABELS[i]} desc="withTiming 700ms">
            <Animated.View style={[nativeStyles.animBox, { backgroundColor: COLORS[i] }, style]}>
              <Text style={nativeStyles.animBoxLabel}>{LABELS[i].split('.')[0].toUpperCase()}</Text>
            </Animated.View>
            <PlayResetNative onPlay={play} onReset={reset} />
          </DemoCardNative>
        ))}
      </View>
    </>
  )
}
