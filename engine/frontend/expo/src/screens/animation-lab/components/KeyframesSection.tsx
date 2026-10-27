// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — KeyframesSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:11:24.635Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBounce, useFloat, useHeartbeat, usePulse, useShake, useWiggle } from '../../../arkzen/generated/animation-lab.native-animations'
import { nativeStyles } from './utils'
import { DemoCardNative } from './DemoCardNative'
import { PlayResetNative } from './PlayResetNative'
import { SectionHeaderNative } from './SectionHeaderNative'

// ─── KEYFRAMES SECTION ────────────────────────────────────────────────────────

export const KeyframesSection = () => {
  const bounce = useBounce()
  const pulse = usePulse()
  const shake = useShake()
  const float = useFloat()
  const heart = useHeartbeat()
  const wiggle = useWiggle()

  return (
    <>
      <SectionHeaderNative icon="◈" title="Keyframe Sequences" subtitle="withSequence multi-step array animations" color="#f43f5e" />
      <View style={nativeStyles.demoGrid}>
        {[
          { label: 'Bounce',    desc: 'y: 0 → -20 → 0 loop',   hook: bounce, color: '#f43f5e' },
          { label: 'Pulse',     desc: 'scale+opacity oscillate', hook: pulse,  color: '#f97316' },
          { label: 'Shake',     desc: 'x: ±6px sequence fast',  hook: shake,  color: '#eab308' },
          { label: 'Float',     desc: 'y: 0 → -10 → 0 slow',   hook: float,  color: '#22c55e' },
          { label: 'Heartbeat', desc: 'double scale pulse',     hook: heart,  color: '#ec4899' },
          { label: 'Wiggle',    desc: 'rotate ±10deg sequence', hook: wiggle, color: '#a855f7' },
        ].map(({ label, desc, hook, color }) => (
          <DemoCardNative key={label} title={label} desc={desc}>
            <Animated.View style={[nativeStyles.animBox, { backgroundColor: color }, hook.style]}>
              <Text style={nativeStyles.animBoxLabel}>{label.toUpperCase()}</Text>
            </Animated.View>
            <PlayResetNative onPlay={hook.play} onReset={hook.reset} />
          </DemoCardNative>
        ))}
      </View>
    </>
  )
}

// ─── LOOP SECTION ─────────────────────────────────────────────────────────────
