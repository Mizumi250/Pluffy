// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — TimelineSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T16:01:52.544Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { useTimeline } from '../../../arkzen/generated/animation-lab.native-animations'
import { s } from '../../../arkzen/generated/animation-lab.native-styles'
import { DemoCard } from './DemoCard'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: TIMELINE ────────────────────────────────────────────────────────
export const TimelineSection = () => {
  const [playing, setPlaying] = useState(false)
  const tl = useTimeline(() => setPlaying(false))
  const BAR_WIDTHS = [70, 85, 55, 90]
  const BAR_COLORS = ['#8b5cf6', '#a78bfa', '#c084fc', '#d946ef']

  const handlePlay = () => {
    setPlaying(true)
    tl.reset()
    // small delay so reset renders before play
    setTimeout(() => tl.play(), 50)
  }

  return (
    <>
      <SectionHeader icon="⏱" title="Timeline Sequence" subtitle="Chained withDelay — sequential orchestration" color="#a78bfa" />
      <DemoCard title="Chained Timeline" desc="Multiple animations queued with withDelay" full>
        <View style={s.btnRow}>
          <TouchableOpacity style={[s.playBtn, playing && { opacity: 0.5 }]} onPress={handlePlay} disabled={playing}>
            <Text style={s.playBtnLabel}>{playing ? '⏳ Playing...' : '▶ Play Timeline'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.resetBtn} onPress={() => { setPlaying(false); tl.reset() }}>
            <Text style={s.resetBtnLabel}>↺</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[s.tlStage, tl.bgStyle]}>
          <Animated.Text style={[s.tlTitle, tl.titleStyle]}>Timeline Magic ✨</Animated.Text>
          <Animated.View style={[s.tlDotsRow, tl.dotsStyle]}>
            {['●','●','●','●','●'].map((d, i) => (
              <Text key={i} style={s.tlDot}>{d}</Text>
            ))}
          </Animated.View>
          <View style={{ width: '100%', gap: 6 }}>
            {BAR_WIDTHS.map((w, i) => (
              <View key={i} style={s.tlBarWrap}>
                <Animated.View style={[s.tlBarFill, { backgroundColor: BAR_COLORS[i] }, tl.barStyles[i]]} />
              </View>
            ))}
          </View>
          <Animated.View style={[s.tlBadge, tl.badgeStyle]}>
            <Text style={s.tlBadgeLabel}>Complete!</Text>
          </Animated.View>
        </Animated.View>
      </DemoCard>
    </>
  )
}

// ─── SECTION: STAGGER ─────────────────────────────────────────────────────────
