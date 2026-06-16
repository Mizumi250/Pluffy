// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — KeyframesSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:13:37.994Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { useBounce, useFloat, useHeartbeat, usePulse, useShake, useWiggle } from '../../../arkzen/generated/animation-lab.native-animations'
import { s } from '../../../arkzen/generated/animation-lab.native-styles'
import { DemoCard } from './DemoCard'
import { PlayReset } from './PlayReset'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: KEYFRAMES ───────────────────────────────────────────────────────
export const KeyframesSection = () => {
  const bounce   = useBounce()
  const pulse    = usePulse()
  const shake    = useShake()
  const float    = useFloat()
  const heart    = useHeartbeat()
  const wiggle   = useWiggle()

  return (
    <>
      <SectionHeader icon="◈" title="Keyframe Sequences" subtitle="withSequence multi-step array animations" color="#f43f5e" />
      <View style={s.demoGrid}>
        {[
          { label: 'Bounce',    desc: 'y: 0 → -20 → 0 loop',   hook: bounce, color: '#f43f5e' },
          { label: 'Pulse',     desc: 'scale+opacity oscillate', hook: pulse,  color: '#f97316' },
          { label: 'Shake',     desc: 'x: ±6px sequence fast',  hook: shake,  color: '#eab308' },
          { label: 'Float',     desc: 'y: 0 → -10 → 0 slow',   hook: float,  color: '#22c55e' },
          { label: 'Heartbeat', desc: 'double scale pulse',     hook: heart,  color: '#ec4899' },
          { label: 'Wiggle',    desc: 'rotate ±10deg sequence', hook: wiggle, color: '#a855f7' },
        ].map(({ label, desc, hook, color }) => (
          <DemoCard key={label} title={label} desc={desc}>
            <Animated.View style={[s.animBox, { backgroundColor: color }, hook.style]}>
              <Text style={s.animBoxLabel}>{label.toUpperCase()}</Text>
            </Animated.View>
            <PlayReset onPlay={hook.play} onReset={hook.reset} />
          </DemoCard>
        ))}
      </View>
    </>
  )
}

// ─── SECTION: LOOP / REPEAT ───────────────────────────────────────────────────
