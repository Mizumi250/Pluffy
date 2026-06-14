// ============================================================
// ARKZEN GENERATED NATIVE ANIMATIONS — shan-shan
// Source: @arkzen:native:animation:rn
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T07:22:21.732Z
//
// Supported patterns:
//   Reanimated — useSharedValue, useAnimatedStyle, withTiming, withSpring,
//                withSequence, runOnUI, worklets, etc.
//   Moti       — transition presets, useDynamicAnimation, etc.
//   Both can coexist freely in this file.
// ============================================================

import React from 'react'

export function shanShanNativeAnimations() {
  // ── Marquee scroll ───────────────────────────────────────────────────────
  const marqueeX = useSharedValue(0)

  const startMarquee = (halfWidth: number) => {
    marqueeX.value = withRepeat(
      withTiming(-halfWidth, {
        duration: 22000,
        easing: Easing.linear,
      }),
      -1,
      false
    )
  }

  const marqueeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: marqueeX.value }],
  }))

  // ── Hero SHAN logo pulse ─────────────────────────────────────────────────
  const logoScale   = useSharedValue(0.88)
  const logoOpacity = useSharedValue(0)

  const revealLogo = () => {
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 500 }))
    logoScale.value   = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.4)) }))
  }

  const logoStyle = useAnimatedStyle(() => ({
    opacity:   logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))

  // ── Scroll indicator line bounce ─────────────────────────────────────────
  const scrollBounce = useSharedValue(0)

  const startScrollBounce = () => {
    scrollBounce.value = withRepeat(
      withSequence(
        withTiming(8,  { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0,  { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false
    )
  }

  const scrollBounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollBounce.value }],
  }))

  return {
    startMarquee, marqueeStyle,
    revealLogo, logoStyle,
    startScrollBounce, scrollBounceStyle,
  }
}
