// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StaggerReveal [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:44.260Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { Easing, default as RAnimated, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FadeIn } from './FadeIn'

// ─── STAGGER CONTAINER ────────────────────────────────────────────────────────

export const StaggerReveal = ({
  children,
  baseDelay = 0,
  stagger = 80,
}: {
  children: React.ReactNode[]
  baseDelay?: number
  stagger?: number
}) => (
  <>
    {React.Children.map(children, (child, i) => (
      <FadeIn key={i} delay={baseDelay + i * stagger}>
        {child}
      </FadeIn>
    ))}
  </>
)

// ─── BURGER / NAV ─────────────────────────────────────────────────────────────
