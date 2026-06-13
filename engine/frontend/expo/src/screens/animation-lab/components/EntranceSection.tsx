// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — EntranceSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T09:40:25.890Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { DemoCard } from './DemoCard'
import { PlayReset } from './PlayReset'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: ENTRANCE ────────────────────────────────────────────────────────
export const EntranceSection = () => {
  const fadeIn   = useFadeIn()
  const slideUp  = useSlideUp()
  const slideR   = useSlideRight()
  const bloom    = useScaleBloom()
  const rotateIn = useRotateIn()
  const elastic  = useElasticScale()

  const DEMOS = [
    { label: 'Fade In',      desc: 'withTiming opacity',          hook: fadeIn,  color: '#6366f1' },
    { label: 'Slide Up',     desc: 'withTiming translateY',       hook: slideUp, color: '#8b5cf6' },
    { label: 'Slide Right',  desc: 'withTiming translateX',       hook: slideR,  color: '#a855f7' },
    { label: 'Scale Bloom',  desc: 'withSpring scale from 0.3',   hook: bloom,   color: '#c084fc' },
    { label: 'Rotate In',    desc: 'withTiming -90° → 0°',        hook: rotateIn,color: '#d946ef' },
    { label: 'Elastic Scale',desc: 'withSpring scaleX from 0',    hook: elastic, color: '#e879f9' },
  ]

  return (
    <>
      <SectionHeader icon="▶" title="Entrance Animations" subtitle="withTiming, withSpring entrance variants" color="#6366f1" />
      <View style={s.demoGrid}>
        {DEMOS.map(({ label, desc, hook, color }) => (
          <DemoCard key={label} title={label} desc={desc}>
            <Animated.View style={[s.animBox, { backgroundColor: color }, hook.style]}>
              <Text style={s.animBoxLabel}>{label.split(' ')[0].toUpperCase()}</Text>
            </Animated.View>
            <PlayReset onPlay={hook.play} onReset={hook.reset} />
          </DemoCard>
        ))}
      </View>
    </>
  )
}

// ─── SECTION: TIMELINE ────────────────────────────────────────────────────────
