// ARKZEN GENERATED — animation-lab/components/TimelineSection
// DO NOT EDIT

import React, { useState } from 'react'
import { useBounce, useCombinedTransform, useEasingDemo, useElasticScale, useFadeIn, useFloat, useHeartbeat, useHoverRotate, usePressBounce, usePressColor, usePulse, useRotateIn, useScale, useScaleBloom, useShake, useSlideRight, useSlideUp, useSpin, useStaggerItems, useTimeline, useWiggle } from '../../../arkzen/generated/animation-lab.native-animations'
import { DemoCardNative } from './DemoCardNative'
import { SectionHeaderNative } from './SectionHeaderNative'
import { nativeStyles } from './utils'
import { Play, RotateCcw } from 'lucide-react-native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { withDelay } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'

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
