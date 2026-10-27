// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — SoundBars [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:37.276Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { Easing, default as RAnimated, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

// ─── SOUND BARS ───────────────────────────────────────────────────────────────

export const SoundBars = () => {
  const anims = useRef(
    Array.from({ length: 9 }, (_, i) => ({
      val: new Animated.Value(4),
      delay: i * 110,
    }))
  ).current

  useEffect(() => {
    anims.forEach(({ val, delay }) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 20, duration: 380, useNativeDriver: false }),
          Animated.timing(val, { toValue: 4,  duration: 380, useNativeDriver: false }),
        ])
      ).start()
    })
  }, [])

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 20 }}>
      {anims.map(({ val }, i) => (
        <Animated.View
          key={i}
          style={{
            width: 2,
            height: val,
            backgroundColor: '#CC0000',
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  )
}

// ─── FADE-IN WRAPPER ──────────────────────────────────────────────────────────
