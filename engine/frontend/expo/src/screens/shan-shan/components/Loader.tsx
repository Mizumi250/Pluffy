// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Loader [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:15:03.974Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { Easing, default as RAnimated, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SCREEN_H, SCREEN_W } from './constants'
import { s } from '../../../arkzen/generated/shan-shan.native-styles'

// ─── LOADER ───────────────────────────────────────────────────────────────────

export const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(0)
  const barWidth  = useRef(new Animated.Value(0)).current
  const barHeight = useRef(new Animated.Value(3)).current
  const opacity   = useRef(new Animated.Value(1)).current

  useEffect(() => {
    let frame = 0
    const total = 60
    const timer = setInterval(() => {
      frame++
      setCount(Math.round((frame / total) * 100))
      if (frame >= total) clearInterval(timer)
    }, 23)

    Animated.sequence([
      Animated.timing(barWidth, {
        toValue: SCREEN_W,
        duration: 1400,
        useNativeDriver: false,
      }),
      Animated.timing(barHeight, {
        toValue: SCREEN_H,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(() => onComplete())

    return () => clearInterval(timer)
  }, [])

  return (
    <Animated.View style={[s.loaderWrap, { opacity }]} pointerEvents="none">
      <Animated.View style={[s.loaderBar, { width: barWidth, height: barHeight }]} />
      <Text style={s.loaderCount}>{count}</Text>
      <Text style={s.loaderLabel}>SHAN SABAL CEZAR</Text>
    </Animated.View>
  )
}

// ─── SOUND BARS ───────────────────────────────────────────────────────────────
