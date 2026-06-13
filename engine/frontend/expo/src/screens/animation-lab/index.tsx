// ============================================================
// ARKZEN GENERATED SCREEN — animation-lab/index
// ============================================================

import React, { useCallback, useState } from 'react'
import { fadeUpPreset, useFadeIn, useSlideUp, useSlideRight, useScaleBloom, useRotateIn, useElasticScale, useSpin, useBounce, usePulse, useShake, useFloat, useHeartbeat, useWiggle, useColorCycle, useScale, useTimeline, useStaggerItems, usePressBounce, usePressColor, useHoverRotate } from '../../arkzen/generated/animation-lab.native-animations'
import { s } from '../../arkzen/generated/animation-lab.native-styles'
import { COLORS_6 } from './components/COLORS_6'
import { COLORS_7 } from './components/COLORS_7'
import { CombinedTransformDemo } from './components/CombinedTransformDemo'
import { DemoCard } from './components/DemoCard'
import { EasingSection } from './components/EasingSection'
import { EntranceSection } from './components/EntranceSection'
import { KeyframesSection } from './components/KeyframesSection'
import { LoopSection } from './components/LoopSection'
import { MotiSection } from './components/MotiSection'
import { PlayReset } from './components/PlayReset'
import { PressSection } from './components/PressSection'
import { SectionHeader } from './components/SectionHeader'
import { SpringSection } from './components/SpringSection'
import { StaggerSection } from './components/StaggerSection'
import { TimelineSection } from './components/TimelineSection'
import { TransformsSection } from './components/TransformsSection'
import { NAV_SECTIONS } from './components/constants'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:index)
const AnimationLabNativePage = () => {
  const [activeSection, setActiveSection] = useState('entrance')

  const renderSection = useCallback(() => {
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
  }, [activeSection])

  const activeNav = NAV_SECTIONS.find(n => n.id === activeSection)

  return (
    <MotiView {...fadeUpPreset} style={s.root}>
      {/* ── Top header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>🎬 Animation Lab</Text>
        <Text style={s.headerSub}>Reanimated · Moti · Spring · Easing</Text>
      </View>

      {/* ── Horizontal nav tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.navScroll}
        contentContainerStyle={s.navScrollContent}
      >
        {NAV_SECTIONS.map(({ id, label, icon, color }) => {
          const active = activeSection === id
          return (
            <TouchableOpacity
              key={id}
              style={[s.navTab, active && s.navTabActive, active && { borderBottomColor: color }]}
              onPress={() => setActiveSection(id)}
              activeOpacity={0.7}
            >
              <Text style={s.navTabIcon}>{icon}</Text>
              <Text style={[s.navTabLabel, active && s.navTabLabelActive]}>{label}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* ── Section content ── */}
      <MotiView
        key={activeSection}
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 220 }}
        style={s.sectionScroll}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderSection()}
          <View style={s.sectionBottomPad} />
        </ScrollView>
      </MotiView>
    </MotiView>
  )
}

// Engine wrapper
export function ArkzenScreen_AnimationLab_Index() {
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
