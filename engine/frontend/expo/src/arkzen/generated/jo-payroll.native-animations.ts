// ============================================================
// ARKZEN GENERATED NATIVE ANIMATIONS — jo-payroll
// Source: @arkzen:native:animation:rn
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T07:22:16.906Z
//
// Supported patterns:
//   Reanimated — useSharedValue, useAnimatedStyle, withTiming, withSpring,
//                withSequence, runOnUI, worklets, etc.
//   Moti       — transition presets, useDynamicAnimation, etc.
//   Both can coexist freely in this file.
// ============================================================

import React from 'react'
import { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'

export const useSlideIn = (delay = 0) => {
  const opacity    = useSharedValue(0)
  const translateY = useSharedValue(16)

  useEffect(() => {
    opacity.value    = withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }))
    translateY.value = withDelay(delay, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }))
  }, [])

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))
}
