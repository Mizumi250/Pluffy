// ============================================================
// ARKZEN GENERATED NATIVE ANIMATIONS — animation-lab
// Source: @arkzen:native:animation:rn
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T06:25:06.748Z
//
// Supported patterns:
//   Reanimated — useSharedValue, useAnimatedStyle, withTiming, withSpring,
//                withSequence, runOnUI, worklets, etc.
//   Moti       — transition presets, useDynamicAnimation, etc.
//   Both can coexist freely in this file.
// ============================================================

import React from 'react'
import { MotiView } from 'moti'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'

// ─── PAGE MOUNT PRESET ────────────────────────────────────────────────────────
export const fadeUpPreset = {
  from:       { opacity: 0, translateY: 8 },
  animate:    { opacity: 1, translateY: 0 },
  exit:       { opacity: 0, translateY: -8 },
  transition: { type: 'timing' as const, duration: 350 },
}

// ─── REUSABLE PRIMITIVE HOOKS ─────────────────────────────────────────────────

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

export function useSlideRight() {
  const translateX = useSharedValue(60)
  const opacity    = useSharedValue(0)
  const style      = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }))
  const play  = () => {
    translateX.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    opacity.value    = withTiming(1, { duration: 500 })
  }
  const reset = () => { translateX.value = 60; opacity.value = 0 }
  return { style, play, reset }
}

export function useScaleBloom() {
  const scale   = useSharedValue(0.3)
  const opacity = useSharedValue(0)
  const style   = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))
  const play  = () => {
    scale.value   = withSpring(1, { damping: 8, stiffness: 200 })
    opacity.value = withTiming(1, { duration: 300 })
  }
  const reset = () => { scale.value = 0.3; opacity.value = 0 }
  return { style, play, reset }
}

export function useRotateIn() {
  const rotate  = useSharedValue(-90)
  const opacity = useSharedValue(0)
  const style   = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }))
  const play  = () => {
    rotate.value  = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    opacity.value = withTiming(1, { duration: 400 })
  }
  const reset = () => { rotate.value = -90; opacity.value = 0 }
  return { style, play, reset }
}

export function useElasticScale() {
  const scaleX  = useSharedValue(0)
  const opacity = useSharedValue(0)
  const style   = useAnimatedStyle(() => ({
    transform: [{ scaleX: scaleX.value }],
    opacity: opacity.value,
  }))
  const play  = () => {
    scaleX.value  = withSpring(1, { damping: 6, stiffness: 150 })
    opacity.value = withTiming(1, { duration: 300 })
  }
  const reset = () => { scaleX.value = 0; opacity.value = 0 }
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

export function useFloat() {
  const translateY = useSharedValue(0)
  const style      = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }))
  const play  = () => {
    translateY.value = withRepeat(
      withSequence(withTiming(-10, { duration: 1500 }), withTiming(0, { duration: 1500 })), -1
    )
  }
  const reset = () => { cancelAnimation(translateY); translateY.value = 0 }
  return { style, play, reset }
}

export function useHeartbeat() {
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const play  = () => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 140 }),
        withTiming(1,   { duration: 140 }),
        withTiming(1.15,{ duration: 140 }),
        withTiming(1,   { duration: 420 }),
      ), -1
    )
  }
  const reset = () => { cancelAnimation(scale); scale.value = 1 }
  return { style, play, reset }
}

export function useWiggle() {
  const rotate = useSharedValue(0)
  const style  = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }))
  const play  = () => {
    rotate.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 80 }), withTiming(10, { duration: 80 }),
        withTiming(-8,  { duration: 80 }), withTiming(8,  { duration: 80 }),
        withTiming(0,   { duration: 80 }),
      ), -1
    )
  }
  const reset = () => { cancelAnimation(rotate); rotate.value = 0 }
  return { style, play, reset }
}

export function useColorCycle() {
  // Animates a progress value 0→1 on repeat; JSX reads it and maps to color
  const progress = useSharedValue(0)
  const play  = () => { progress.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.linear }), -1) }
  const reset = () => { cancelAnimation(progress); progress.value = 0 }
  return { progress, play, reset }
}

export function useScale(to = 1.3) {
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const play  = () => { scale.value = withSpring(to, { damping: 10, stiffness: 120 }) }
  const reset = () => { scale.value = withSpring(1) }
  return { style, play, reset }
}

// ─── TIMELINE HOOK ────────────────────────────────────────────────────────────
export function useTimeline(onComplete?: () => void) {
  const bgOpacity   = useSharedValue(0)
  const titleY      = useSharedValue(30)
  const titleOp     = useSharedValue(0)
  const dotsScale   = useSharedValue(0)
  const bar1        = useSharedValue(0)
  const bar2        = useSharedValue(0)
  const bar3        = useSharedValue(0)
  const bar4        = useSharedValue(0)
  const badgeOp     = useSharedValue(0)
  const badgeScale  = useSharedValue(0.5)

  const bgStyle     = useAnimatedStyle(() => ({ opacity: bgOpacity.value }))
  const titleStyle  = useAnimatedStyle(() => ({ opacity: titleOp.value, transform: [{ translateY: titleY.value }] }))
  const dotsStyle   = useAnimatedStyle(() => ({ transform: [{ scale: dotsScale.value }] }))
  const bar1Style   = useAnimatedStyle(() => ({ width: `${bar1.value * 100}%` as any }))
  const bar2Style   = useAnimatedStyle(() => ({ width: `${bar2.value * 100}%` as any }))
  const bar3Style   = useAnimatedStyle(() => ({ width: `${bar3.value * 100}%` as any }))
  const bar4Style   = useAnimatedStyle(() => ({ width: `${bar4.value * 100}%` as any }))
  const badgeStyle  = useAnimatedStyle(() => ({ opacity: badgeOp.value, transform: [{ scale: badgeScale.value }] }))

  const barStyles = [bar1Style, bar2Style, bar3Style, bar4Style]

  const play = () => {
    bgOpacity.value  = withTiming(1, { duration: 400 })
    titleOp.value    = withDelay(450, withTiming(1, { duration: 400 }))
    titleY.value     = withDelay(450, withSpring(0, { damping: 14 }))
    dotsScale.value  = withDelay(700, withSpring(1, { damping: 8, stiffness: 200 }))
    bar1.value       = withDelay(900, withTiming(0.70, { duration: 500 }))
    bar2.value       = withDelay(1050, withTiming(0.85, { duration: 500 }))
    bar3.value       = withDelay(1200, withTiming(0.55, { duration: 500 }))
    bar4.value       = withDelay(1350, withTiming(0.90, { duration: 500 }))
    badgeOp.value    = withDelay(1900, withTiming(1, { duration: 400 }))
    badgeScale.value = withDelay(1900, withSpring(1, { damping: 8, stiffness: 150 }))
    if (onComplete) {
      badgeOp.value  = withDelay(1900, withTiming(1, { duration: 400 }, (finished) => {
        if (finished) runOnJS(onComplete)()
      }))
    }
  }

  const reset = () => {
    bgOpacity.value = 0; titleY.value = 30; titleOp.value = 0
    dotsScale.value = 0; bar1.value = 0; bar2.value = 0; bar3.value = 0; bar4.value = 0
    badgeOp.value = 0; badgeScale.value = 0.5
  }

  return { bgStyle, titleStyle, dotsStyle, barStyles, badgeStyle, play, reset }
}

// ─── STAGGER HOOK ─────────────────────────────────────────────────────────────
export function useStaggerItems(count: number, delayPerItem = 80) {
  const values = Array.from({ length: count }, () => ({
    op: useSharedValue(0),
    y:  useSharedValue(20),
  }))
  const styles = values.map(v => useAnimatedStyle(() => ({
    opacity: v.op.value,
    transform: [{ translateY: v.y.value }],
  })))
  const play = () => {
    values.forEach((v, i) => {
      v.op.value = withDelay(i * delayPerItem, withTiming(1, { duration: 350 }))
      v.y.value  = withDelay(i * delayPerItem, withSpring(0, { damping: 14 }))
    })
  }
  const reset = () => { values.forEach(v => { v.op.value = 0; v.y.value = 20 }) }
  return { styles, play, reset }
}

// ─── GESTURE PRESS HOOKS ──────────────────────────────────────────────────────
export function usePressBounce() {
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const onPressIn  = () => { scale.value = withSpring(0.92, { damping: 10 }) }
  const onPressOut = () => { scale.value = withSpring(1,    { damping: 10 }) }
  return { style, onPressIn, onPressOut }
}

export function usePressColor() {
  const progress = useSharedValue(0)
  const style    = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0.6], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.95], Extrapolation.CLAMP) }],
  }))
  const onPressIn  = () => { progress.value = withTiming(1, { duration: 100 }) }
  const onPressOut = () => { progress.value = withTiming(0, { duration: 200 }) }
  return { style, onPressIn, onPressOut }
}

export function useHoverRotate() {
  const rotate = useSharedValue(0)
  const style  = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }))
  const onPressIn  = () => { rotate.value = withTiming(360, { duration: 600 }) }
  const onPressOut = () => { rotate.value = withTiming(0,   { duration: 0   }) }
  return { style, onPressIn, onPressOut }
}
