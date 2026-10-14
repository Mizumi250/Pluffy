// ARKZEN GENERATED — animation-lab/components/EasingSection
// DO NOT EDIT

import React from 'react'
import { useBounce, useCombinedTransform, useEasingDemo, useElasticScale, useFadeIn, useFloat, useHeartbeat, useHoverRotate, usePressBounce, usePressColor, usePulse, useRotateIn, useScale, useScaleBloom, useShake, useSlideRight, useSlideUp, useSpin, useStaggerItems, useTimeline, useWiggle } from '../../../arkzen/generated/animation-lab.native-animations'
import { DemoCardNative } from './DemoCardNative'
import { PlayResetNative } from './PlayResetNative'
import { SectionHeaderNative } from './SectionHeaderNative'
import { nativeStyles } from './utils'
import { StyleSheet, Text, View } from 'react-native'
import { Easing, withTiming } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'

export const EasingSection = () => {
  const demos = [
    useEasingDemo(Easing.linear),
    useEasingDemo(Easing.ease),
    useEasingDemo(Easing.in(Easing.quad)),
    useEasingDemo(Easing.out(Easing.quad)),
    useEasingDemo(Easing.inOut(Easing.quad)),
    useEasingDemo(Easing.out(Easing.back(2.5))),
    useEasingDemo(Easing.out(Easing.elastic(1))),
    useEasingDemo(Easing.out(Easing.bounce)),
  ]

  const LABELS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'back.out', 'elastic', 'bounce']
  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d946ef', '#ec4899', '#f43f5e', '#f97316']

  return (
    <>
      <SectionHeaderNative icon="⇄" title="Easing Functions" subtitle="withTiming easing variants — slide right to compare" color="#f97316" />
      <View style={nativeStyles.demoGrid}>
        {demos.map(({ style, play, reset }, i) => (
          <DemoCardNative key={LABELS[i]} title={LABELS[i]} desc="withTiming 700ms">
            <Animated.View style={[nativeStyles.animBox, { backgroundColor: COLORS[i] }, style]}>
              <Text style={nativeStyles.animBoxLabel}>{LABELS[i].split('.')[0].toUpperCase()}</Text>
            </Animated.View>
            <PlayResetNative onPlay={play} onReset={reset} />
          </DemoCardNative>
        ))}
      </View>
    </>
  )
}
