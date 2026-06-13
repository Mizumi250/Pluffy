// ============================================================
// ARKZEN GENERATED SCREEN — shan-shan/index
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { GuestLayout } from '@/layouts/GuestLayout'
import { shanShanNativeAnimations } from '../../arkzen/generated/shan-shan.native-animations'
import { s } from '../../arkzen/generated/shan-shan.native-styles'
import { BurgerNav } from './components/BurgerNav'
import { Chapter } from './components/Chapter'
import { FadeIn } from './components/FadeIn'
import { GalleryStrip } from './components/GalleryStrip'
import { Loader } from './components/Loader'
import { SkillBar } from './components/SkillBar'
import { SoundBars } from './components/SoundBars'
import { StaggerReveal } from './components/StaggerReveal'
import { CHAPTERS, PERSONAL_INFO, SKILLS, SKILLS_MARQUEE } from './components/constants'
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const scrollRef = useRef<ScrollView>(null)
  const [loaded,  setLoaded]  = useState(false)
  const [marqueeWidth, setMarqueeWidth] = useState(0)

  // Section ref Y positions for nav scroll
  const sectionY = useRef<Record<string, number>>({
    work: 0, skills: 0, about: 0, contact: 0,
  }).current

  const handleNavigate = useCallback((target: string) => {
    const y = sectionY[target] ?? 0
    scrollRef.current?.scrollTo({ y, animated: true })
  }, [])

  const handleContactPress = useCallback(() => {
    scrollRef.current?.scrollTo({ y: sectionY['contact'] ?? 9999, animated: true })
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#CC0000" />

      {/* Loader */}
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      {/* Burger (absolute over everything) */}
      <BurgerNav onNavigate={handleNavigate} darkBg={false} />

      <ScrollView
        ref={scrollRef}
        style={s.screen}
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >

        {/* ── HERO ── */}
        <View style={s.heroWrap}>
          <FadeIn delay={300}>
            <Text style={s.heroEyebrow}>DESIGNER · DOCUMENT SPECIALIST · RESEARCHER</Text>
          </FadeIn>

          {/* Shan photo half */}
          <FadeIn delay={200} from="none">
            <Image
              source={require('../../../assets/tatemonos/shan-shan/images/shan5.jpg')}
              style={{ width: '100%', height: 280, marginBottom: 28 }}
              resizeMode="cover"
            />
          </FadeIn>

          <FadeIn delay={400}>
            <Text style={s.heroLogo}>SHAN.</Text>
          </FadeIn>

          <FadeIn delay={520}>
            <Text style={s.heroSubtitle}>Shan Sabal Cezar</Text>
          </FadeIn>

          <FadeIn delay={640}>
            <View style={s.heroScrollHint}>
              <View style={s.heroScrollLine} />
              <Text style={s.heroScrollText}>SCROLL</Text>
            </View>
          </FadeIn>

          {/* Watermark */}
          <Text style={s.heroWatermark} aria-hidden="true">SHAN</Text>
        </View>

        {/* ── INTRO ── */}
        <View style={s.introWrap}>
          <FadeIn>
            <Text style={s.introPre}>[Intro]</Text>
          </FadeIn>
          <FadeIn delay={80}>
            <Text style={s.introTitle}>The Invisible{'\n'}Echo</Text>
          </FadeIn>
          <FadeIn delay={160}>
            <Text style={s.introAbstract}>
              Before the gesture, there is an idea. Before the design, a purpose.
              Shan gathers these invisible intentions and transforms them into work
              that speaks clearly, lingers beautifully.
            </Text>
          </FadeIn>
          <FadeIn delay={240}>
            <Text style={s.introCaption}>An invitation to build something worth remembering.</Text>
          </FadeIn>
        </View>

        {/* ── SKILLS MARQUEE STRIP ── */}
        <View
          style={s.marqueeWrap}
          onLayout={(e) => setMarqueeWidth(e.nativeEvent.layout.width)}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
          >
            {[...SKILLS_MARQUEE, ...SKILLS_MARQUEE, ...SKILLS_MARQUEE].map((skill, i) => (
              <Text key={i} style={s.marqueeItem}>{skill}</Text>
            ))}
          </ScrollView>
        </View>

        {/* ── CHAPTERS SECTION ── */}
        <View
          onLayout={(e) => { sectionY['work'] = e.nativeEvent.layout.y }}
        >
          <View style={s.chapterSectionHeader}>
            <FadeIn>
              <Text style={s.chapterSectionEyebrow}>[Work]</Text>
            </FadeIn>
            <FadeIn delay={80}>
              <Text style={s.chapterSectionTitle}>What I Do.</Text>
            </FadeIn>
          </View>

          {CHAPTERS.map((chapter, index) => (
            <Chapter
              key={chapter.id}
              chapter={chapter}
              index={index}
              onWorkPress={handleContactPress}
            />
          ))}
        </View>

        {/* ── SKILLS ── */}
        <View
          style={s.skillsSection}
          onLayout={(e) => { sectionY['skills'] = e.nativeEvent.layout.y }}
        >
          <FadeIn>
            <Text style={s.sectionLabel}>[Skills]</Text>
          </FadeIn>
          <FadeIn delay={80}>
            <Text style={s.skillsTitle}>Tools of{'\n'}the Trade.</Text>
          </FadeIn>
          <FadeIn delay={160}>
            <Text style={s.skillsSub}>PROFICIENCY · 2026</Text>
          </FadeIn>

          <View style={{ marginTop: 8 }}>
            {SKILLS.map((skill, i) => (
              <SkillBar key={skill.name} name={skill.name} pct={skill.pct} delay={i * 80} />
            ))}
          </View>
        </View>

        {/* ── ABOUT ── */}
        <View
          style={s.aboutWrap}
          onLayout={(e) => { sectionY['about'] = e.nativeEvent.layout.y }}
        >
          <FadeIn from="none">
            <Image
              source={require('../../../assets/tatemonos/shan-shan/images/shan5.jpg')}
              style={s.aboutPhoto}
              resizeMode="cover"
            />
          </FadeIn>

          <View style={s.aboutBody}>
            <FadeIn>
              <Text style={s.sectionLabelLight}>[About Me]</Text>
            </FadeIn>
            <FadeIn delay={80}>
              <Text style={s.aboutName}>Shan{'\n'}Sabal{'\n'}Cezar</Text>
            </FadeIn>

            {/* Info rows */}
            {PERSONAL_INFO.map((row, i) => (
              <FadeIn key={row.label} delay={i * 60}>
                <View style={s.aboutInfoRow}>
                  <Text style={s.infoLabel}>{row.label}</Text>
                  <Text style={s.infoValue}>{row.value}</Text>
                </View>
                <View style={s.dividerDark} />
              </FadeIn>
            ))}

            {/* About CTA */}
            <View style={{ marginTop: 36, gap: 12 }}>
              <FadeIn delay={360}>
                <TouchableOpacity
                  style={s.ctaButton}
                  onPress={handleContactPress}
                  activeOpacity={0.8}
                >
                  <Text style={s.ctaButtonText}>LET'S WORK TOGETHER</Text>
                </TouchableOpacity>
              </FadeIn>
              <FadeIn delay={440}>
                <TouchableOpacity
                  style={s.outlineButtonLight}
                  onPress={() => Linking.openURL('https://www.facebook.com/shan.cezar.71')}
                  activeOpacity={0.8}
                >
                  <Text style={s.outlineButtonLightText}>FOLLOW ON FACEBOOK</Text>
                </TouchableOpacity>
              </FadeIn>
            </View>
          </View>
        </View>

        {/* ── CONTACT ── */}
        <View
          style={s.contactWrap}
          onLayout={(e) => { sectionY['contact'] = e.nativeEvent.layout.y }}
        >
          <FadeIn>
            <Text style={s.sectionLabel}>[Contact]</Text>
          </FadeIn>
          <FadeIn delay={80}>
            <Text style={s.contactHeadline}>
              From Five,{'\n'}Everything{'\n'}Begins.
            </Text>
          </FadeIn>

          <FadeIn delay={160}>
            <TouchableOpacity
              style={[s.ctaButton, { width: '100%' }]}
              onPress={() => Linking.openURL('https://www.facebook.com/shan.cezar.71')}
              activeOpacity={0.8}
            >
              <Text style={s.ctaButtonText}>FACEBOOK</Text>
            </TouchableOpacity>
          </FadeIn>

          <View style={{ height: 12 }} />

          <FadeIn delay={240}>
            <TouchableOpacity
              style={[s.outlineButton, { width: '100%' }]}
              onPress={() => Linking.openURL('mailto:shan@example.com')}
              activeOpacity={0.8}
            >
              <Text style={s.outlineButtonText}>EMAIL</Text>
            </TouchableOpacity>
          </FadeIn>

          <Text style={s.contactWatermark}>SHAN</Text>
        </View>

        {/* ── FOOTER ── */}
        <View style={s.footerWrap}>
          <Text style={s.footerLogo}>SHAN.</Text>
          <View style={s.dividerDark} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 8, flexWrap: 'wrap' }}>
            <TouchableOpacity
              style={s.footerSocialBtn}
              onPress={() => Linking.openURL('https://www.facebook.com/shan.cezar.71')}
              activeOpacity={0.7}
            >
              <Text style={s.footerSocialText}>FACEBOOK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.footerSocialBtn}
              onPress={() => Linking.openURL('mailto:shan@example.com')}
              activeOpacity={0.7}
            >
              <Text style={s.footerSocialText}>EMAIL</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.footerCopy}>© 2026 SHAN SABAL CEZAR · ALL RIGHTS RESERVED</Text>
        </View>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_ShanShan_Index() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('shan-shan')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <GuestLayout tatSlug="shan-shan" dashboardRoute="/shan-shan/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <IndexScreen />
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_ShanShan_Index
