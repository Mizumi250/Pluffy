// ============================================================
// ARKZEN GENERATED SCREEN — animation-lab/index
// ============================================================

import React from 'react'
import { MotiView } from 'moti'
import { Text, TouchableOpacity, View, ScrollView } from 'react-native'
import Animated from 'react-native-reanimated'
import { useFadeIn, useSlideUp, useSpin, useBounce, usePulse, useShake, useScale, fadeUpPreset } from '../../arkzen/generated/animation-lab.native-animations'
import { s } from '../../arkzen/generated/animation-lab.native-styles'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)


// User screen (from @arkzen:native:page:index)
const AnimationLabNativePage = () => {
  const spin    = useSpin()
  const bounce  = useBounce()
  const pulse   = usePulse()
  const shake   = useShake()
  const fadeIn  = useFadeIn()
  const slideUp = useSlideUp()
  const scale   = useScale()

  const DEMOS = [
    { label: 'Spin',     desc: 'withRepeat + Easing.linear', hook: spin,    color: '#6366f1' },
    { label: 'Bounce',   desc: 'withSequence translateY',    hook: bounce,  color: '#f43f5e' },
    { label: 'Pulse',    desc: 'scale + opacity loop',       hook: pulse,   color: '#10b981' },
    { label: 'Shake',    desc: 'withSequence translateX',    hook: shake,   color: '#f59e0b' },
    { label: 'Fade In',  desc: 'withTiming opacity',         hook: fadeIn,  color: '#0ea5e9' },
    { label: 'Slide Up', desc: 'withTiming + opacity',       hook: slideUp, color: '#a855f7' },
    { label: 'Scale',    desc: 'withSpring scale',           hook: scale,   color: '#ec4899' },
  ]

  return (
    <MotiView {...fadeUpPreset} style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Animation Lab</Text>
          <Text style={s.headerSub}>Reanimated + Moti demos</Text>
        </View>

        <Text style={s.sectionTitle}>Primitives</Text>

        <View style={s.demoGrid}>
          {DEMOS.map(({ label, desc, hook, color }) => (
            <View key={label} style={s.demoCard}>
              <View style={s.demoCardHeader}>
                <Text style={s.demoCardTitle}>{label}</Text>
                <Text style={s.demoCardDesc}>{desc}</Text>
              </View>
              <View style={s.demoCardStage}>
                <Animated.View style={[s.animBox, { backgroundColor: color }, hook.style]}>
                  <Text style={s.animBoxLabel}>{label.toUpperCase()}</Text>
                </Animated.View>
                <TouchableOpacity style={s.playBtn} onPress={hook.play}>
                  <Text style={s.playBtnLabel}>▶ Play</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.resetBtn} onPress={hook.reset}>
                  <Text style={s.resetBtnLabel}>↺ Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </MotiView>
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
      <StatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AnimationLabNativePage />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_AnimationLab_Index
