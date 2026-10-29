// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — MotiSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:32:41.862Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { nativeStyles } from './utils'
import { DemoCardNative } from './DemoCardNative'
import { SectionHeaderNative } from './SectionHeaderNative'

// ─── MOTI SECTION ─────────────────────────────────────────────────────────────

export const MotiSection = () => {
  const [visible, setVisible] = useState(false)
  const [show1, setShow1] = useState(true)
  const [show2, setShow2] = useState(true)
  const [show3, setShow3] = useState(true)

  return (
    <>
      <SectionHeaderNative icon="✦" title="Moti Variants" subtitle="MotiView from/animate/exit — AnimatePresence equivalent" color="#f59e0b" />
      <DemoCardNative title="Stagger Children" desc="MotiView with stagger delay" full>
        <View style={nativeStyles.btnRow}>
          <TouchableOpacity style={nativeStyles.playBtn} onPress={() => setVisible(v => !v)}>
            <Text style={nativeStyles.playBtnLabel}>{visible ? 'Hide' : 'Animate In'}</Text>
          </TouchableOpacity>
        </View>
        {visible && (
          <View style={[nativeStyles.staggerRow, { marginTop: 12 }]}>
            {['Alpha','Beta','Gamma','Delta','Epsilon','Zeta'].map((w, i) => (
              <MotiView
                key={w}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  opacity: { type: 'spring', delay: i * 100, damping: 14 },
                  translateY: { type: 'spring', delay: i * 100, damping: 14 },
                }}
                style={[nativeStyles.animPill, { backgroundColor: '#f59e0b' }]}
              >
                <Text style={nativeStyles.animPillLabel}>{w}</Text>
              </MotiView>
            ))}
          </View>
        )}
      </DemoCardNative>
      <View style={nativeStyles.demoGrid}>
        <DemoCardNative title="Fade + Slide" desc="from x:-40 animate x:0">
          <View style={{ alignItems: 'center', minHeight: 60, justifyContent: 'center' }}>
            {show1 && (
              <MotiView
                from={{ opacity: 0, translateX: -40 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: 40 }}
                style={{ width: 80, height: 40, borderRadius: 8, backgroundColor: '#3b82f6' }}
              />
            )}
          </View>
          <TouchableOpacity style={nativeStyles.playBtn} onPress={() => setShow1(v => !v)}>
            <Text style={nativeStyles.playBtnLabel}>Toggle</Text>
          </TouchableOpacity>
        </DemoCardNative>
        <DemoCardNative title="Scale Bounce" desc="from scale:0 with spring">
          <View style={{ alignItems: 'center', minHeight: 60, justifyContent: 'center' }}>
            {show2 && (
              <MotiView
                from={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  opacity: { type: 'spring', stiffness: 400, damping: 20 },
                  scale: { type: 'spring', stiffness: 400, damping: 20 },
                }}
                style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: '#10b981' }}
              />
            )}
          </View>
          <TouchableOpacity style={nativeStyles.playBtn} onPress={() => setShow2(v => !v)}>
            <Text style={nativeStyles.playBtnLabel}>Toggle</Text>
          </TouchableOpacity>
        </DemoCardNative>
        <DemoCardNative title="Rotate In" desc="from rotate:-180 with spring">
          <View style={{ alignItems: 'center', minHeight: 60, justifyContent: 'center' }}>
            {show3 && (
              <MotiView
                from={{ opacity: 0, rotate: '-180deg' }}
                animate={{ opacity: 1, rotate: '0deg' }}
                exit={{ opacity: 0, rotate: '180deg' }}
                transition={{
                  opacity: { type: 'spring', stiffness: 200 },
                  rotate: { type: 'spring', stiffness: 200 },
                }}
                style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: '#a855f7' }}
              />
            )}
          </View>
          <TouchableOpacity style={nativeStyles.playBtn} onPress={() => setShow3(v => !v)}>
            <Text style={nativeStyles.playBtnLabel}>Toggle</Text>
          </TouchableOpacity>
        </DemoCardNative>
        <DemoCardNative title="whileInView equiv." desc="MotiView animate on mount">
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              opacity: { type: 'spring', stiffness: 200, damping: 18 },
              scale: { type: 'spring', stiffness: 200, damping: 18 },
            }}
            style={{ width: 100, height: 44, borderRadius: 10, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>In View!</Text>
          </MotiView>
        </DemoCardNative>
      </View>
    </>
  )
}

// ─── KEYFRAMES SECTION ────────────────────────────────────────────────────────
