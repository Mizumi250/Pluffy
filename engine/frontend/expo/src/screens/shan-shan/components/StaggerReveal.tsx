// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StaggerReveal [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T12:12:38.176Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { FadeIn } from './FadeIn'

// ─── STAGGER CONTAINER ────────────────────────────────────────────────────────
// Wraps children and triggers FadeIn only when onLayout fires (scroll-into-view sim)

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
