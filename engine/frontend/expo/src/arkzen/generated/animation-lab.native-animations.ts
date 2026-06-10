// ============================================================
// ARKZEN GENERATED NATIVE ANIMATIONS — animation-lab
// Source: @arkzen:native:animation:rn
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-10T18:08:19.031Z
//
// Supported patterns:
//   Reanimated — useSharedValue, useAnimatedStyle, withTiming, withSpring,
//                withSequence, runOnUI, worklets, etc.
//   Moti       — transition presets, useDynamicAnimation, etc.
//   Both can coexist freely in this file.
// ============================================================

import React from 'react'
import { MotiText, MotiView } from 'moti'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'

// ─── Timing presets matching the web CSS keyframe demos ───────────────────────

export function useFadeIn(durationMs = 350) {
  const opacity = useSharedValue(0)
  const style   = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const play    = () => { opacity.value = withTiming(1, { duration: durationMs }) }
  const reset   = () => { opacity.value = 0 }
  return { style, play, reset }
}

export function useSlideUp(durationMs = 400) {
  const translateY = useSharedValue(24)
  const opacity    = useSharedValue(0)
  const style      = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))
  const play  = () => {
    translateY.value = withTiming(0, { duration: durationMs, easing: Easing.out(Easing.cubic) })
    opacity.value    = withTiming(1, { duration: durationMs })
  }
  const reset = () => { translateY.value = 24; opacity.value = 0 }
  return { style, play, reset }
}

export function useSpin() {
  const rotate = useSharedValue(0)
  const style  = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }))
  const play  = () => { rotate.value = withRepeat(withTiming(360, { duration: 1200, easing: Easing.linear }), -1) }
  const reset = () => { cancelAnimation(rotate); rotate.value = 0 }
  return { style, play, reset }
}

export function useBounce() {
  const translateY = useSharedValue(0)
  const style      = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))
  const play  = () => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(0,  { duration: 400, easing: Easing.in(Easing.quad)  }),
      ), -1
    )
  }
  const reset = () => { cancelAnimation(translateY); translateY.value = 0 }
  return { style, play, reset }
}

export function usePulse() {
  const scale   = useSharedValue(1)
  const opacity = useSharedValue(1)
  const style   = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))
  const play  = () => {
    scale.value   = withRepeat(withSequence(withTiming(0.9, { duration: 750 }), withTiming(1, { duration: 750 })), -1)
    opacity.value = withRepeat(withSequence(withTiming(0.4, { duration: 750 }), withTiming(1, { duration: 750 })), -1)
  }
  const reset = () => { cancelAnimation(scale); cancelAnimation(opacity); scale.value = 1; opacity.value = 1 }
  return { style, play, reset }
}

export function useShake() {
  const translateX = useSharedValue(0)
  const style      = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))
  const play  = () => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 60 }), withTiming(6, { duration: 60 }),
        withTiming(-6, { duration: 60 }), withTiming(6, { duration: 60 }),
        withTiming(0,  { duration: 60 }),
      ), -1
    )
  }
  const reset = () => { cancelAnimation(translateX); translateX.value = 0 }
  return { style, play, reset }
}

export function useScale(to = 1.3, durationMs = 350) {
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const play  = () => { scale.value = withSpring(to, { damping: 10, stiffness: 120 }) }
  const reset = () => { scale.value = withSpring(1) }
  return { style, play, reset }
}

// ─── Moti entrance preset (used in page mount) ───────────────────────────────

export const fadeUpPreset = {
  from:       { opacity: 0, translateY: 8 },
  animate:    { opacity: 1, translateY: 0 },
  exit:       { opacity: 0, translateY: -8 },
  transition: { type: 'timing' as const, duration: 350 },
}
