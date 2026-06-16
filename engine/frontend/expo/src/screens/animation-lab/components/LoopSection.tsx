// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — LoopSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T11:23:21.901Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { useBounce, usePulse, useSpin } from '../../../arkzen/generated/animation-lab.native-animations'
import { s } from '../../../arkzen/generated/animation-lab.native-styles'
import { DemoCard } from './DemoCard'
import { PlayReset } from './PlayReset'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: LOOP / REPEAT ───────────────────────────────────────────────────
export const LoopSection = () => {
  const spin1    = useSpin()
  const pulse2   = usePulse()
  const wave0    = useBounce()
  const wave1    = useBounce()
  const wave2    = useBounce()
  const wave3    = useBounce()
  const wave4    = useBounce()
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
      <SectionHeader icon="⟳" title="Loop / Repeat" subtitle="withRepeat(-1) — infinite looping animations" color="#10b981" />
      <View style={s.demoGrid}>
        <DemoCard title="Spin (infinite)" desc="withRepeat(-1) Easing.linear">
          <Animated.View style={[s.animBox, { backgroundColor: '#6366f1' }, spin1.style]}>
            <Text style={s.animBoxLabel}>SPIN</Text>
          </Animated.View>
          <PlayReset onPlay={spin1.play} onReset={spin1.reset} />
        </DemoCard>
        <DemoCard title="Pulse (infinite)" desc="withRepeat(-1) scale+opacity">
          <Animated.View style={[s.animCircle, { backgroundColor: '#f43f5e' }, pulse2.style]} />
          <PlayReset onPlay={pulse2.play} onReset={pulse2.reset} />
        </DemoCard>
        <DemoCard title="Wave Bars" desc="5 bars staggered bounce loop" full>
          <View style={[s.waveRow, { justifyContent: 'center' }]}>
            {WAVE_HOOKS.map((h, i) => (
              <Animated.View
                key={i}
                style={[{ width: 10, height: 44, borderRadius: 5, backgroundColor: WAVE_COLORS[i] }, h.style]}
              />
            ))}
          </View>
          <View style={s.btnRow}>
            <TouchableOpacity style={s.playBtn} onPress={playWave}>
              <Text style={s.playBtnLabel}>▶ Wave</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.resetBtn} onPress={resetWave}>
              <Text style={s.resetBtnLabel}>↺</Text>
            </TouchableOpacity>
          </View>
        </DemoCard>
        <DemoCard title="Color Cycle (Moti)" desc="MotiView background array loop">
          <MotiView
            from={{ backgroundColor: '#f43f5e' }}
            animate={{ backgroundColor: ['#f43f5e','#f97316','#eab308','#22c55e','#0ea5e9','#a855f7','#f43f5e'] }}
            transition={{ loop: true, duration: 4000, type: 'timing' }}
            style={{ width: 72, height: 72, borderRadius: 12 }}
          />
        </DemoCard>
        <DemoCard title="Border Radius Morph" desc="shape morphs via MotiView loop">
          <MotiView
            animate={{ borderRadius: [12, 26, 6, 26, 12] }}
            transition={{ loop: true, duration: 2500, type: 'timing' }}
            style={{ width: 64, height: 64, backgroundColor: '#a855f7' }}
          />
        </DemoCard>
      </View>
    </>
  )
}

// ─── SECTION: TRANSFORMS ─────────────────────────────────────────────────────
