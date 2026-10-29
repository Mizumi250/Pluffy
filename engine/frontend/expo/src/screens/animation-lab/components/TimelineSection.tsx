// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — TimelineSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:32:41.857Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTimeline } from '../../../arkzen/generated/animation-lab.native-animations'
import { nativeStyles } from './utils'
import { DemoCardNative } from './DemoCardNative'
import { SectionHeaderNative } from './SectionHeaderNative'

// ─── TIMELINE SECTION ─────────────────────────────────────────────────────────

export const TimelineSection = () => {
  const [playing, setPlaying] = useState(false)
  const tl = useTimeline(() => setPlaying(false))
  const BAR_WIDTHS = [70, 85, 55, 90]
  const BAR_COLORS = ['#8b5cf6', '#a78bfa', '#c084fc', '#d946ef']

  const handlePlay = () => {
    setPlaying(true)
    tl.reset()
    setTimeout(() => tl.play(), 50)
  }

  return (
    <>
      <SectionHeaderNative icon="⏱" title="Timeline Sequence" subtitle="Chained withDelay — sequential orchestration" color="#a78bfa" />
      <DemoCardNative title="Chained Timeline" desc="Multiple animations queued with withDelay" full>
        <View style={nativeStyles.btnRow}>
          <TouchableOpacity style={[nativeStyles.playBtn, playing && { opacity: 0.5 }]} onPress={handlePlay} disabled={playing}>
            <Play size={14} color="white" />
            <Text style={nativeStyles.playBtnLabel}>{playing ? 'Playing...' : 'Play Timeline'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={nativeStyles.resetBtn} onPress={() => { setPlaying(false); tl.reset() }}>
            <RotateCcw size={14} color="rgba(255,255,255,0.6)" />
            <Text style={nativeStyles.resetBtnLabel}>Reset</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[nativeStyles.tlStage, tl.bgStyle]}>
          <Animated.Text style={nativeStyles.tlTitle}>Timeline Magic ✨</Animated.Text>
          <Animated.View style={[nativeStyles.tlDotsRow, tl.dotsStyle]}>
            {['●','●','●','●','●'].map((d, i) => (
              <Text key={i} style={nativeStyles.tlDot}>{d}</Text>
            ))}
          </Animated.View>
          <View style={{ width: '100%' }}>
            {BAR_WIDTHS.map((w, i) => (
              <View key={i} style={nativeStyles.tlBarWrap}>
                <Animated.View style={[nativeStyles.tlBarFill, { backgroundColor: BAR_COLORS[i] }, tl.barStyles[i]]} />
              </View>
            ))}
          </View>
          <Animated.View style={[nativeStyles.tlBadge, tl.badgeStyle]}>
            <Text style={nativeStyles.tlBadgeLabel}>Complete!</Text>
          </Animated.View>
        </Animated.View>
      </DemoCardNative>
    </>
  )
}

// ─── STAGGER SECTION ──────────────────────────────────────────────────────────
