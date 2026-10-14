// ARKZEN GENERATED — animation-lab/components/PressSection
// DO NOT EDIT

import React from 'react'
import { useBounce, useCombinedTransform, useEasingDemo, useElasticScale, useFadeIn, useFloat, useHeartbeat, useHoverRotate, usePressBounce, usePressColor, usePulse, useRotateIn, useScale, useScaleBloom, useShake, useSlideRight, useSlideUp, useSpin, useStaggerItems, useTimeline, useWiggle } from '../../../arkzen/generated/animation-lab.native-animations'
import { DemoCardNative } from './DemoCardNative'
import { SectionHeaderNative } from './SectionHeaderNative'
import { nativeStyles } from './utils'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { interpolate, withSpring } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'

export const PressSection = () => {
  const bounce = usePressBounce()
  const color = usePressColor()
  const rotator = useHoverRotate()
  const ripple = useScale(1.25)

  return (
    <>
      <SectionHeaderNative icon="👆" title="Press / Tap Gestures" subtitle="onPressIn/Out driving Reanimated shared values" color="#0ea5e9" />
      <View style={nativeStyles.demoGrid}>
        <DemoCardNative title="Scale Bounce" desc="withSpring on press in/out">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#0ea5e9' }, bounce.style]}>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              onPressIn={bounce.onPressIn}
              onPressOut={bounce.onPressOut}
              activeOpacity={1}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Hold me</Text>
            </TouchableOpacity>
          </Animated.View>
        </DemoCardNative>
        <DemoCardNative title="Opacity Dim" desc="interpolate opacity on press">
          <Animated.View style={[nativeStyles.gestureTarget, { backgroundColor: '#6366f1' }, color.style]}>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              onPressIn={color.onPressIn}
              onPressOut={color.onPressOut}
              activeOpacity={1}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Press</Text>
            </TouchableOpacity>
          </Animated.View>
        </DemoCardNative>
        <DemoCardNative title="Icon Rotate" desc="360° spin on press-in">
          <Animated.View style={[{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(14,165,233,0.15)', alignItems: 'center', justifyContent: 'center' }, rotator.style]}>
            <TouchableOpacity
              onPressIn={rotator.onPressIn}
              onPressOut={rotator.onPressOut}
              activeOpacity={1}
              style={{ alignItems: 'center', justifyContent: 'center', width: 52, height: 52 }}
            >
              <Text style={{ fontSize: 24 }}>↻</Text>
            </TouchableOpacity>
          </Animated.View>
        </DemoCardNative>
        <DemoCardNative title="Ripple Scale" desc="withSpring scale up on tap">
          <Animated.View style={[nativeStyles.animCircle, { backgroundColor: '#10b981' }, ripple.style]}>
            <TouchableOpacity
              onPress={ripple.play}
              onLongPress={ripple.reset}
              activeOpacity={0.9}
              style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 10 }}>TAP</Text>
            </TouchableOpacity>
          </Animated.View>
        </DemoCardNative>
      </View>
    </>
  )
}
