// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — LoopSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:32:41.866Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBounce, usePulse, useSpin } from '../../../arkzen/generated/animation-lab.native-animations'
import { nativeStyles } from './utils'
import { DemoCardNative } from './DemoCardNative'
import { PlayResetNative } from './PlayResetNative'
import { SectionHeaderNative } from './SectionHeaderNative'

// ─── LOOP SECTION ─────────────────────────────────────────────────────────────

export const LoopSection = () => {
  const spin1 = useSpin()
  const pulse2 = usePulse()
  const wave0 = useBounce()
  const wave1 = useBounce()
  const wave2 = useBounce()
  const wave3 = useBounce()
  const wave4 = useBounce()
  const [waveOn, setWaveOn] = useState(false)

  const WAVE_HOOKS = [wave0, wave1, wave2, wave3, wave4]
  const WAVE_COLORS = ['#0ea5e9','#38bdf8','#7dd3fc','#bae6fd','#e0f2fe']

  const playWave = () => {
    setWaveOn(true)
    WAVE_HOOKS.forEach((h, i) => setTimeout(() => h.play(), i * 120))
  }
  const resetWave = () => {
    setWaveOn(false)
    WAVE_HOOKS.forEach(h => h.reset())
  }

  return (
    <>
      <SectionHeaderNative icon="⟳" title="Loop / Repeat" subtitle="withRepeat(-1) — infinite looping animations" color="#10b981" />
      <View style={nativeStyles.demoGrid}>
        <DemoCardNative title="Spin (infinite)" desc="withRepeat(-1) Easing.linear">
          <Animated.View style={[nativeStyles.animBox, { backgroundColor: '#6366f1' }, spin1.style]}>
            <Text style={nativeStyles.animBoxLabel}>SPIN</Text>
          </Animated.View>
          <PlayResetNative onPlay={spin1.play} onReset={spin1.reset} />
        </DemoCardNative>
        <DemoCardNative title="Pulse (infinite)" desc="withRepeat(-1) scale+opacity">
          <Animated.View style={[nativeStyles.animCircle, { backgroundColor: '#f43f5e' }, pulse2.style]} />
          <PlayResetNative onPlay={pulse2.play} onReset={pulse2.reset} />
        </DemoCardNative>
        <DemoCardNative title="Wave Bars" desc="5 bars staggered bounce loop" full>
          <View style={[nativeStyles.waveRow, { justifyContent: 'center' }]}>
            {WAVE_HOOKS.map((h, i) => (
              <Animated.View
                key={i}
                style={[{ width: 10, height: 44, borderRadius: 5, backgroundColor: WAVE_COLORS[i] }, h.style]}
              />
            ))}
          </View>
          <View style={nativeStyles.btnRow}>
            <TouchableOpacity style={nativeStyles.playBtn} onPress={playWave}>
              <Play size={14} color="white" />
              <Text style={nativeStyles.playBtnLabel}>Wave</Text>
            </TouchableOpacity>
            <TouchableOpacity style={nativeStyles.resetBtn} onPress={resetWave}>
              <RotateCcw size={14} color="rgba(255,255,255,0.6)" />
              <Text style={nativeStyles.resetBtnLabel}>Reset</Text>
            </TouchableOpacity>
          </View>
        </DemoCardNative>
        <DemoCardNative title="Color Cycle (Moti)" desc="MotiView background array loop">
          <MotiView
            from={{ backgroundColor: '#f43f5e' }}
            animate={{ backgroundColor: ['#f43f5e','#f97316','#eab308','#22c55e','#0ea5e9','#a855f7','#f43f5e'] }}
            transition={{
              backgroundColor: { loop: true, duration: 4000, type: 'timing' },
            }}
            style={{ width: 72, height: 72, borderRadius: 12 }}
          />
        </DemoCardNative>
        <DemoCardNative title="Border Radius Morph" desc="shape morphs via MotiView loop">
          <MotiView
            animate={{ borderRadius: [12, 26, 6, 26, 12] }}
            transition={{
              borderRadius: { loop: true, duration: 2500, type: 'timing' },
            }}
            style={{ width: 64, height: 64, backgroundColor: '#a855f7' }}
          />
        </DemoCardNative>
      </View>
    </>
  )
}

// ─── TRANSFORMS SECTION ───────────────────────────────────────────────────────
