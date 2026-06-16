// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — CombinedTransformDemo [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:29:20.426Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { PlayReset } from './PlayReset'

export const CombinedTransformDemo = () => {
  const sv  = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    opacity:   sv.value,
    transform: [
      { translateY: (1 - sv.value) * 30 },
      { scale:      0.4 + sv.value * 0.6 },
      { rotate:     `${(1 - sv.value) * -45}deg` },
    ],
  }))
  const play  = () => { sv.value = withSpring(1, { damping: 10, stiffness: 120 }) }
  const reset = () => { sv.value = 0 }
  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={[{ width: 80, height: 50, borderRadius: 10, backgroundColor: '#ec4899', alignItems: 'center', justifyContent: 'center' }, style]}>
        <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Combined</Text>
      </Animated.View>
      <PlayReset onPlay={play} onReset={reset} />
    </View>
  )
}

// ─── SECTION: SPRING ──────────────────────────────────────────────────────────
