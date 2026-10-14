// ============================================================
// ARKZEN GENERATED SCREEN — animation-lab/index
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
import { useFadeIn, useSlideUp, useSlideRight, useScaleBloom, useRotateIn, useElasticScale, useSpin, useBounce, usePulse, useShake, useFloat, useHeartbeat, useWiggle, useTimeline, useStaggerItems, usePressBounce, usePressColor, useHoverRotate, useScale, useEasingDemo, useCombinedTransform } from '../../arkzen/generated/animation-lab.native-animations'
import { DemoCardNative } from './components/DemoCardNative'
import { EasingSection } from './components/EasingSection'
import { EntranceSection } from './components/EntranceSection'
import { KeyframesSection } from './components/KeyframesSection'
import { LoopSection } from './components/LoopSection'
import { MotiSection } from './components/MotiSection'
import { PlayResetNative } from './components/PlayResetNative'
import { PressSection } from './components/PressSection'
import { SectionHeaderNative } from './components/SectionHeaderNative'
import { SpringSection } from './components/SpringSection'
import { StaggerSection } from './components/StaggerSection'
import { TimelineSection } from './components/TimelineSection'
import { TransformsSection } from './components/TransformsSection'
import { NAV_SECTIONS_NATIVE } from './components/constants'
import { useAnimLabStore } from './components/hooks'
import { nativeStyles } from './components/utils'

// User screen (from @arkzen:native:page:index)
/* @arkzen:resolved:import expo */
/* @arkzen:import:expo */const IndexPageExpo = () => {
  const { activeSection, setActiveSection } = useAnimLabStore()
  const [key, setKey] = useState(0)

  const renderSection = () => {
    switch (activeSection) {
      case 'entrance':   return <EntranceSection />
      case 'timeline':   return <TimelineSection />
      case 'stagger':    return <StaggerSection />
      case 'press':      return <PressSection />
      case 'moti':       return <MotiSection />
      case 'keyframes':  return <KeyframesSection />
      case 'loop':       return <LoopSection />
      case 'transforms': return <TransformsSection />
      case 'spring':     return <SpringSection />
      case 'easing':     return <EasingSection />
      default:           return <EntranceSection />
    }
  }

  return (
    <SafeAreaView style={nativeStyles.root}>
      <View style={nativeStyles.header}>
        <Text style={nativeStyles.headerTitle}>🎬 Animation Lab</Text>
        <Text style={nativeStyles.headerSub}>Reanimated · Moti · Spring · Easing</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={nativeStyles.navScroll}
        contentContainerStyle={nativeStyles.navScrollContent}
      >
        {NAV_SECTIONS_NATIVE.map(({ id, label, icon, color }) => {
          const active = activeSection === id
          return (
            <TouchableOpacity
              key={id}
              style={[nativeStyles.navTab, active && nativeStyles.navTabActive]}
              onPress={() => setActiveSection(id)}
              activeOpacity={0.7}
            >
              <Text style={nativeStyles.navTabIcon}>{icon}</Text>
              <Text style={[nativeStyles.navTabLabel, active && nativeStyles.navTabLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <MotiView
        key={activeSection + key}
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 220 }}
        style={nativeStyles.sectionScroll}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderSection()}
          <View style={nativeStyles.sectionBottomPad} />
        </ScrollView>
      </MotiView>
    </SafeAreaView>
  )
}

// Engine wrapper
export function ArkzenScreen_AnimationLab_Index() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('animation-lab')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ArkzenStatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <IndexPageExpo />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_AnimationLab_Index
