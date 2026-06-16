// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — SkillBar [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:13:45.861Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SCREEN_W } from './constants'
import { s } from '../../../arkzen/generated/shan-shan.native-styles'

// ─── SKILL BAR ────────────────────────────────────────────────────────────────

export const SkillBar = ({ name, pct, delay = 0 }: { name: string; pct: number; delay?: number }) => {
  const width = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  const reveal = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 400, delay,
        useNativeDriver: true,
      }),
      Animated.timing(width, {
        toValue: (SCREEN_W - 56) * (pct / 100),
        duration: 800, delay,
        useNativeDriver: false,
      }),
    ]).start()
  }, [])

  useEffect(() => { reveal() }, [])

  return (
    <Animated.View style={[s.skillRow, { opacity }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={s.skillName}>{name}</Text>
        <Text style={{ fontSize: 10, color: '#aaa', letterSpacing: 1 }}>{pct}%</Text>
      </View>
      <View style={s.skillBarBg}>
        <Animated.View style={[s.skillBarFill, { width }]} />
      </View>
    </Animated.View>
  )
}

// ─── CHAPTER COMPONENT ────────────────────────────────────────────────────────
