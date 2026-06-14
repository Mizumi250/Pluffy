// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — PressSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T04:19:48.386Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { useHoverRotate, usePressBounce, usePressColor, useScale } from '../../../arkzen/generated/animation-lab.native-animations'
import { s } from '../../../arkzen/generated/animation-lab.native-styles'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: PRESS / TAP ─────────────────────────────────────────────────────
export const PressSection = () => {
  const bounce  = usePressBounce()
  const color   = usePressColor()
  const rotator = useHoverRotate()
  const ripple  = useScale(1.25)

  return (
    <>
      <SectionHeader icon="👆" title="Press / Tap Gestures" subtitle="onPressIn/Out driving Reanimated shared values" color="#0ea5e9" />
      <View style={s.demoGrid}>
        <DemoCard title="Scale Bounce" desc="withSpring on press in/out">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#0ea5e9' }, bounce.style]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPressIn={bounce.onPressIn}
              onPressOut={bounce.onPressOut}
              activeOpacity={1}
            >
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Hold me</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </DemoCard>
        <DemoCard title="Opacity Dim" desc="interpolate opacity on press">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#6366f1' }, color.style]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPressIn={color.onPressIn}
              onPressOut={color.onPressOut}
              activeOpacity={1}
            >
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Press</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </DemoCard>
        <DemoCard title="Icon Rotate" desc="360° spin on press-in">
          <Animated.View style={[{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(14,165,233,0.15)', alignItems: 'center', justifyContent: 'center' }, rotator.style]}>
            <TouchableOpacity
              onPressIn={rotator.onPressIn}
              onPressOut={rotator.onPressOut}
              activeOpacity={1}
              style={{ alignItems: 'center', justifyContent: 'center', width: 52, height: 52 }}
            >
              <Text style={{ fontSize: 24 }}>↻</Text>
            </TouchableOpacity>
          </Animated.View>
        </DemoCard>
        <DemoCard title="Ripple Scale" desc="withSpring scale up on tap">
          <Animated.View style={[s.animCircle, { backgroundColor: '#10b981' }, ripple.style]}>
            <TouchableOpacity
              onPress={ripple.play}
              onLongPress={ripple.reset}
              activeOpacity={0.9}
              style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 10 }}>TAP</Text>
            </TouchableOpacity>
          </Animated.View>
        </DemoCard>
      </View>
    </>
  )
}

// ─── SECTION: MOTI VARIANTS ───────────────────────────────────────────────────
