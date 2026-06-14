// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — TransformsSection [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T04:19:48.393Z
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { useElasticScale, useRotateIn, useScaleBloom, useSlideUp } from '../../../arkzen/generated/animation-lab.native-animations'
import { s } from '../../../arkzen/generated/animation-lab.native-styles'
import { CombinedTransformDemo } from './CombinedTransformDemo'
import { DemoCard } from './DemoCard'
import { PlayReset } from './PlayReset'
import { SectionHeader } from './SectionHeader'

// ─── SECTION: TRANSFORMS ─────────────────────────────────────────────────────
export const TransformsSection = () => {
  const translate = useSlideUp()
  const scaleAnim = useScaleBloom()
  const rotAnim   = useRotateIn()
  const elastic2  = useElasticScale()

  return (
    <>
      <SectionHeader icon="⬡" title="Transform Variants" subtitle="translate, rotate, scale, skew, combined — tap to trigger" color="#a855f7" />
      <View style={s.demoGrid}>
        <DemoCard title="translateY" desc="withTiming y: 24 → 0">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#a855f7' }, translate.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12, lineHeight: 56 }}>Y</Text>
          </Animated.View>
          <PlayReset onPlay={translate.play} onReset={translate.reset} />
        </DemoCard>
        <DemoCard title="scale" desc="withSpring scale 0.3→1">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#8b5cf6' }, scaleAnim.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12, lineHeight: 56 }}>S</Text>
          </Animated.View>
          <PlayReset onPlay={scaleAnim.play} onReset={scaleAnim.reset} />
        </DemoCard>
        <DemoCard title="rotate" desc="withTiming -90°→0°">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#6366f1' }, rotAnim.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12, lineHeight: 56 }}>R</Text>
          </Animated.View>
          <PlayReset onPlay={rotAnim.play} onReset={rotAnim.reset} />
        </DemoCard>
        <DemoCard title="scaleX elastic" desc="withSpring scaleX 0→1">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#c084fc' }, elastic2.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12, lineHeight: 56 }}>sX</Text>
          </Animated.View>
          <PlayReset onPlay={elastic2.play} onReset={elastic2.reset} />
        </DemoCard>
        <DemoCard title="Combined" desc="slide + scale + rotate together" full>
          <CombinedTransformDemo />
        </DemoCard>
      </View>
    </>
  )
}
