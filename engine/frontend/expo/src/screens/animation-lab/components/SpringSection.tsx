// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — SpringSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T14:55:55.460Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { s } from '../../../arkzen/generated/animation-lab.native-styles'
import { DemoCard } from './DemoCard'
import { PlayReset } from './PlayReset'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: SPRING ──────────────────────────────────────────────────────────
export const SpringSection = () => {
  const makeSpring = (damping: number, stiffness: number) => {
    const sv    = useSharedValue(0)
    const style = useAnimatedStyle(() => ({ transform: [{ translateX: sv.value }] }))
    const play  = () => { sv.value = withSpring(80, { damping, stiffness }) }
    const reset = () => { sv.value = withSpring(0, { damping: 20, stiffness: 200 }) }
    return { style, play, reset }
  }

  const springConfigs = [
    { label: 'Bouncy',   desc: 'damping:4 stiffness:200',  d: 4,  k: 200, color: '#ec4899' },
    { label: 'Snappy',   desc: 'damping:10 stiffness:400', d: 10, k: 400, color: '#f97316' },
    { label: 'Wobbly',   desc: 'damping:2 stiffness:80',   d: 2,  k: 80,  color: '#a855f7' },
    { label: 'Stiff',    desc: 'damping:20 stiffness:300', d: 20, k: 300, color: '#0ea5e9' },
    { label: 'Slow',     desc: 'damping:15 stiffness:40',  d: 15, k: 40,  color: '#10b981' },
    { label: 'Elastic',  desc: 'damping:6 stiffness:150',  d: 6,  k: 150, color: '#6366f1' },
  ]

  const springs = springConfigs.map(c => makeSpring(c.d, c.k))

  return (
    <>
      <SectionHeader icon="⟲" title="Spring Physics" subtitle="withSpring — damping and stiffness variants" color="#ec4899" />
      <View style={s.demoGrid}>
        {springConfigs.map(({ label, desc, color }, i) => (
          <DemoCard key={label} title={label} desc={desc}>
            <Animated.View style={[s.animBox, { backgroundColor: color }, springs[i].style]}>
              <Text style={s.animBoxLabel}>{label.toUpperCase()}</Text>
            </Animated.View>
            <PlayReset onPlay={springs[i].play} onReset={springs[i].reset} />
          </DemoCard>
        ))}
      </View>
    </>
  )
}

// ─── SECTION: EASING ──────────────────────────────────────────────────────────
