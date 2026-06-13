// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — FadeIn [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T09:28:06.375Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'

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
// Wraps children and triggers FadeIn only when onLayout fires (scroll-into-view sim)
