// ARKZEN GENERATED — animation-lab/components/TransformsSection
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

export const TransformsSection = () => {
  const translate = useSlideUp()
  const scaleAnim = useScaleBloom()
  const rotAnim = useRotateIn()
  const elastic2 = useElasticScale()
  const combined = useCombinedTransform()

  return (
    <>
      <SectionHeaderNative icon="⬡" title="Transform Variants" subtitle="translate, rotate, scale, skew, combined — tap to trigger" color="#a855f7" />
      <View style={nativeStyles.demoGrid}>
        <DemoCardNative title="translateY" desc="withTiming y: 24 → 0">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#a855f7' }, translate.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12 }}>Y</Text>
          </Animated.View>
          <PlayResetNative onPlay={translate.play} onReset={translate.reset} />
        </DemoCardNative>
        <DemoCardNative title="scale" desc="withSpring scale 0.3→1">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#8b5cf6' }, scaleAnim.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12 }}>S</Text>
          </Animated.View>
          <PlayResetNative onPlay={scaleAnim.play} onReset={scaleAnim.reset} />
        </DemoCardNative>
        <DemoCardNative title="rotate" desc="withTiming -90°→0°">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#6366f1' }, rotAnim.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12 }}>R</Text>
          </Animated.View>
          <PlayResetNative onPlay={rotAnim.play} onReset={rotAnim.reset} />
        </DemoCardNative>
        <DemoCardNative title="scaleX elastic" desc="withSpring scaleX 0→1">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#c084fc' }, elastic2.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12 }}>sX</Text>
          </Animated.View>
          <PlayResetNative onPlay={elastic2.play} onReset={elastic2.reset} />
        </DemoCardNative>
        <DemoCardNative title="Combined" desc="slide + scale + rotate together" full>
          <View style={{ alignItems: 'center' }}>
            <Animated.View style={[{ width: 80, height: 50, borderRadius: 10, backgroundColor: '#ec4899', alignItems: 'center', justifyContent: 'center' }, combined.style]}>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Combined</Text>
            </Animated.View>
            <PlayResetNative onPlay={combined.play} onReset={combined.reset} />
          </View>
        </DemoCardNative>
      </View>
    </>
  )
}
