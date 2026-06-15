// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — EasingSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T06:17:26.831Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { s } from '../../../arkzen/generated/animation-lab.native-styles'
import { DemoCard } from './DemoCard'
import { PlayReset } from './PlayReset'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: EASING ──────────────────────────────────────────────────────────
export const EasingSection = () => {
  const makeEasingDemo = (easingFn: any, label: string, color: string) => {
    const sv    = useSharedValue(0)
    const style = useAnimatedStyle(() => ({ transform: [{ translateX: sv.value }] }))
    const play  = () => { sv.value = withTiming(80, { duration: 700, easing: easingFn }) }
    const reset = () => { sv.value = 0 }
    return { style, play, reset, label, color }
  }

  const demos = [
    makeEasingDemo(Easing.linear,            'linear',      '#6366f1'),
    makeEasingDemo(Easing.ease,              'ease',        '#8b5cf6'),
    makeEasingDemo(Easing.in(Easing.quad),   'ease-in',     '#a855f7'),
    makeEasingDemo(Easing.out(Easing.quad),  'ease-out',    '#c084fc'),
    makeEasingDemo(Easing.inOut(Easing.quad),'ease-in-out', '#d946ef'),
    makeEasingDemo(Easing.out(Easing.back(2.5)), 'back.out','#ec4899'),
    makeEasingDemo(Easing.out(Easing.elastic(1)),'elastic', '#f43f5e'),
    makeEasingDemo(Easing.out(Easing.bounce),    'bounce',  '#f97316'),
  ]

  return (
    <>
      <SectionHeader icon="⇄" title="Easing Functions" subtitle="withTiming easing variants — slide right to compare" color="#f97316" />
      <View style={s.demoGrid}>
        {demos.map(({ style, play, reset, label, color }) => (
          <DemoCard key={label} title={label} desc="withTiming 700ms">
            <Animated.View style={[s.animBox, { backgroundColor: color }, style]}>
              <Text style={s.animBoxLabel}>{label.split('.')[0].toUpperCase()}</Text>
            </Animated.View>
            <PlayReset onPlay={play} onReset={reset} />
          </DemoCard>
        ))}
      </View>
    </>
  )
}
