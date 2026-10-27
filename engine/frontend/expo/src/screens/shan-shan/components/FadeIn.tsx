// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — FadeIn [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:37.285Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { Easing, default as RAnimated, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

// ─── FADE-IN WRAPPER ──────────────────────────────────────────────────────────

export const FadeIn = ({
  children,
  delay = 0,
  from = 'bottom',
  distance = 28,
}: {
  children: React.ReactNode
  delay?: number
  from?: 'bottom' | 'left' | 'right' | 'none'
  distance?: number
}) => {
  const opacity = useRef(new Animated.Value(0)).current
  const translate = useRef(new Animated.Value(distance)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 640, delay,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0, duration: 640, delay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const transform =
    from === 'bottom' ? [{ translateY: translate }] :
    from === 'left'   ? [{ translateX: translate }] :
    from === 'right'  ? [{ translateX: Animated.multiply(translate, -1) }] :
    []

  return (
    <Animated.View style={{ opacity, transform }}>
      {children}
    </Animated.View>
  )
}

// ─── STAGGER CONTAINER ────────────────────────────────────────────────────────
