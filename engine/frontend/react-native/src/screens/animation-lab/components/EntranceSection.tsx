// ARKZEN GENERATED — animation-lab/components/EntranceSection
// DO NOT EDIT

import React from 'react'
import { useBounce, useCombinedTransform, useEasingDemo, useElasticScale, useFadeIn, useFloat, useHeartbeat, useHoverRotate, usePressBounce, usePressColor, usePulse, useRotateIn, useScale, useScaleBloom, useShake, useSlideRight, useSlideUp, useSpin, useStaggerItems, useTimeline, useWiggle } from '../../../arkzen/generated/animation-lab.native-animations'
import { DemoCardNative } from './DemoCardNative'
import { PlayResetNative } from './PlayResetNative'
import { SectionHeaderNative } from './SectionHeaderNative'
import { nativeStyles } from './utils'
import { StyleSheet, Text, View } from 'react-native'
import { withSpring, withTiming } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'

export const EntranceSection = () => {
  const fadeIn = useFadeIn()
  const slideUp = useSlideUp()
  const slideR = useSlideRight()
  const bloom = useScaleBloom()
  const rotateIn = useRotateIn()
  const elastic = useElasticScale()

  const DEMOS = [
    { label: 'Fade In',      desc: 'withTiming opacity',          hook: fadeIn,  color: '#6366f1' },
    { label: 'Slide Up',     desc: 'withTiming translateY',       hook: slideUp, color: '#8b5cf6' },
    { label: 'Slide Right',  desc: 'withTiming translateX',       hook: slideR,  color: '#a855f7' },
    { label: 'Scale Bloom',  desc: 'withSpring scale from 0.3',   hook: bloom,   color: '#c084fc' },
    { label: 'Rotate In',    desc: 'withTiming -90° → 0°',        hook: rotateIn,color: '#d946ef' },
    { label: 'Elastic Scale',desc: 'withSpring scaleX from 0',    hook: elastic, color: '#e879f9' },
  ]

  return (
    <>
      <SectionHeaderNative icon="▶" title="Entrance Animations" subtitle="withTiming, withSpring entrance variants" color="#6366f1" />
      <View style={nativeStyles.demoGrid}>
        {DEMOS.map(({ label, desc, hook, color }) => (
          <DemoCardNative key={label} title={label} desc={desc}>
            <Animated.View style={[nativeStyles.animBox, { backgroundColor: color }, hook.style]}>
              <Text style={nativeStyles.animBoxLabel}>{label.split(' ')[0].toUpperCase()}</Text>
            </Animated.View>
            <PlayResetNative onPlay={hook.play} onReset={hook.reset} />
          </DemoCardNative>
        ))}
      </View>
    </>
  )
}
