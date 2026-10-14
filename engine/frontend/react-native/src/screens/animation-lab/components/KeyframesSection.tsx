// ARKZEN GENERATED — animation-lab/components/KeyframesSection
// DO NOT EDIT

import React from 'react'
import { useBounce, useCombinedTransform, useEasingDemo, useElasticScale, useFadeIn, useFloat, useHeartbeat, useHoverRotate, usePressBounce, usePressColor, usePulse, useRotateIn, useScale, useScaleBloom, useShake, useSlideRight, useSlideUp, useSpin, useStaggerItems, useTimeline, useWiggle } from '../../../arkzen/generated/animation-lab.native-animations'
import { DemoCardNative } from './DemoCardNative'
import { PlayResetNative } from './PlayResetNative'
import { SectionHeaderNative } from './SectionHeaderNative'
import { nativeStyles } from './utils'
import { StyleSheet, Text, View } from 'react-native'
import { withSequence } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'

export const KeyframesSection = () => {
  const bounce = useBounce()
  const pulse = usePulse()
  const shake = useShake()
  const float = useFloat()
  const heart = useHeartbeat()
  const wiggle = useWiggle()

  return (
    <>
      <SectionHeaderNative icon="◈" title="Keyframe Sequences" subtitle="withSequence multi-step array animations" color="#f43f5e" />
      <View style={nativeStyles.demoGrid}>
        {[
          { label: 'Bounce',    desc: 'y: 0 → -20 → 0 loop',   hook: bounce, color: '#f43f5e' },
          { label: 'Pulse',     desc: 'scale+opacity oscillate', hook: pulse,  color: '#f97316' },
          { label: 'Shake',     desc: 'x: ±6px sequence fast',  hook: shake,  color: '#eab308' },
          { label: 'Float',     desc: 'y: 0 → -10 → 0 slow',   hook: float,  color: '#22c55e' },
          { label: 'Heartbeat', desc: 'double scale pulse',     hook: heart,  color: '#ec4899' },
          { label: 'Wiggle',    desc: 'rotate ±10deg sequence', hook: wiggle, color: '#a855f7' },
        ].map(({ label, desc, hook, color }) => (
          <DemoCardNative key={label} title={label} desc={desc}>
            <Animated.View style={[nativeStyles.animBox, { backgroundColor: color }, hook.style]}>
              <Text style={nativeStyles.animBoxLabel}>{label.toUpperCase()}</Text>
            </Animated.View>
            <PlayResetNative onPlay={hook.play} onReset={hook.reset} />
          </DemoCardNative>
        ))}
      </View>
    </>
  )
}
