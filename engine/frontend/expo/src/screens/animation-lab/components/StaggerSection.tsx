// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — StaggerSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T06:15:34.240Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { useStaggerItems } from '../../../arkzen/generated/animation-lab.native-animations'
import { s } from '../../../arkzen/generated/animation-lab.native-styles'
import { COLORS_6 } from './COLORS_6'
import { COLORS_7 } from './COLORS_7'
import { DemoCard } from './DemoCard'
import { PlayReset } from './PlayReset'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: STAGGER ─────────────────────────────────────────────────────────
export const StaggerSection = () => {
  const linear  = useStaggerItems(6, 80)
  const center  = useStaggerItems(7, 70)
  const fromEnd = useStaggerItems(6, 60)
  const grid    = useStaggerItems(12, 50)

  const COLORS_6  = ['#f59e0b','#f97316','#ef4444','#ec4899','#a855f7','#6366f1']
  const COLORS_7  = ['#6366f1','#818cf8','#a5b4fc','#c4b5fd','#a5b4fc','#818cf8','#6366f1']
  const COLORS_E  = ['#10b981','#34d399','#6ee7b7','#a7f3d0','#6ee7b7','#34d399']
  const GRID_COLS = Array.from({ length: 12 }, (_, i) => `hsl(${i * 25}, 80%, 58%)`)

  return (
    <>
      <SectionHeader icon="⠿" title="Stagger Animations" subtitle="withDelay staggered arrays — linear, center, end, grid" color="#f59e0b" />
      <View style={s.demoGrid}>
        <DemoCard title="Linear" desc="stagger left-to-right">
          <View style={s.staggerRow}>
            {COLORS_6.map((c, i) => (
              <Animated.View key={i} style={[{ width: 28, height: 28, borderRadius: 6, backgroundColor: c }, linear.styles[i]]} />
            ))}
          </View>
          <PlayReset onPlay={linear.play} onReset={linear.reset} />
        </DemoCard>
        <DemoCard title="From Center" desc="stagger outward from middle">
          <View style={s.staggerRow}>
            {COLORS_7.map((c, i) => (
              <Animated.View key={i} style={[{ width: 24, height: 24, borderRadius: 6, backgroundColor: c }, center.styles[i]]} />
            ))}
          </View>
          <PlayReset onPlay={center.play} onReset={center.reset} />
        </DemoCard>
        <DemoCard title="From End" desc="stagger right-to-left">
          <View style={s.staggerRow}>
            {COLORS_E.map((c, i) => (
              <Animated.View key={i} style={[{ width: 28, height: 28, borderRadius: 6, backgroundColor: c }, fromEnd.styles[i]]} />
            ))}
          </View>
          <PlayReset onPlay={fromEnd.play} onReset={fromEnd.reset} />
        </DemoCard>
        <DemoCard title="Grid (3×4)" desc="2D grid stagger wave">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {GRID_COLS.map((c, i) => (
              <Animated.View key={i} style={[{ width: 24, height: 24, borderRadius: 5, backgroundColor: c }, grid.styles[i]]} />
            ))}
          </View>
          <PlayReset onPlay={grid.play} onReset={grid.reset} />
        </DemoCard>
      </View>
    </>
  )
}

// ─── SECTION: PRESS / TAP ─────────────────────────────────────────────────────
