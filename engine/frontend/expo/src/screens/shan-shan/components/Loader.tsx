// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Loader [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T03:19:12.675Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SCREEN_H, SCREEN_W } from './constants'
import { s } from '../../../arkzen/generated/shan-shan.native-styles'

// ─── LOADER ───────────────────────────────────────────────────────────────────

export const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(0)
  const barWidth  = useRef(new Animated.Value(0)).current
  const barHeight = useRef(new Animated.Value(3)).current
  const opacity   = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Count 0→100
    let frame = 0
    const total = 60
    const timer = setInterval(() => {
      frame++
      setCount(Math.round((frame / total) * 100))
      if (frame >= total) clearInterval(timer)
    }, 23)

    // Bar sweep → expand → fade
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
      {/* Bar */}
      <Animated.View style={[s.loaderBar, { width: barWidth, height: barHeight }]} />
      {/* Count */}
      <Text style={s.loaderCount}>{count}</Text>
      <Text style={s.loaderLabel}>SHAN SABAL CEZAR</Text>
    </Animated.View>
  )
}

// ─── SOUND BARS ───────────────────────────────────────────────────────────────
