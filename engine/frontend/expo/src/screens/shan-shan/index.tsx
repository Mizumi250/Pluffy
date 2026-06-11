// ============================================================
// ARKZEN GENERATED SCREEN — shan-shan/index
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { GuestLayout } from '@/layouts/GuestLayout'
import { shanShanNativeAnimations } from '../../arkzen/generated/shan-shan.native-animations'
import { s } from '../../arkzen/generated/shan-shan.native-styles'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    id: 'design',
    num: '01',
    coverLabel: 'Visual',
    tagline: 'GRAPHIC DESIGN',
    headline: 'Visual clarity,\nbold impressions.',
    desc: 'Visual design for print and digital — posters, flyers, social media graphics, brand materials. Clean layouts with bold typography that communicate clearly and leave an impression.',
    craft: 'Every layout starts from a single question: what should the eye land on first? From there, hierarchy, contrast, and rhythm carry the rest.',
    sound: 'FORM FOLLOWS FEELING',
    tags: ['Print Design', 'Social Graphics', 'Brand Identity', 'Typography'],
    img: require('../../../assets/tatemonos/shan-shan/images/shan1.jpg'),
    gallery: [
      require('../../../assets/tatemonos/shan-shan/images/shan1.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan2.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
    ],
    color: '#CC0000',
  },
  {
    id: 'docs',
    num: '02',
    coverLabel: 'Document',
    tagline: 'DOCUMENT PREPARATION',
    headline: 'Every page structured,\nevery detail polished.',
    desc: 'Professional document preparation — reports, proposals, templates, formatted deliverables. Every page structured, every section purposeful, every detail polished.',
    craft: 'A document is architecture in two dimensions. The margins, the headers, the flow from section to section — all of it is intentional.',
    sound: 'STRUCTURE IS THE STORY',
    tags: ['Reports', 'Proposals', 'Templates', 'Formatting'],
    img: require('../../../assets/tatemonos/shan-shan/images/shan2.jpg'),
    gallery: [
      require('../../../assets/tatemonos/shan-shan/images/shan2.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
    ],
    color: '#111111',
  },
  {
    id: 'research',
    num: '03',
    coverLabel: 'Research',
    tagline: 'RESEARCH & ANALYSIS',
    headline: 'Deep dives.\nActionable insights.',
    desc: 'Thorough research and analysis — academic papers, market studies, data gathering and synthesis. Deep dives that turn complex information into clear, actionable insights.',
    craft: "Good research isn't just gathering data — it's knowing which question to ask next, and having the patience to follow it all the way down.",
    sound: 'DEPTH BEFORE DELIVERY',
    tags: ['Academic Research', 'Market Studies', 'Data Synthesis', 'Analysis'],
    img: require('../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
    gallery: [
      require('../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan5.jpg'),
    ],
    color: '#8B0000',
  },
  {
    id: 'present',
    num: '04',
    coverLabel: 'Present',
    tagline: 'PRESENTATION DESIGN',
    headline: 'Stories told\none slide at a time.',
    desc: 'Clean, impactful slide decks — pitch presentations, school projects, business proposals. Every slide designed to support the story, not distract from it.',
    craft: 'A great presentation is a rhythm. Breath in: information. Breath out: space. Every slide knows exactly when to speak and when to let silence work.',
    sound: 'ONE SLIDE, ONE TRUTH',
    tags: ['Pitch Decks', 'School Projects', 'Business Proposals', 'Slide Design'],
    img: require('../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
    gallery: [
      require('../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan5.jpg'),
      require('../../../assets/tatemonos/shan-shan/images/shan1.jpg'),
    ],
    color: '#1a1a2e',
  },
]

const SKILLS = [
  { name: 'CANVA',               pct: 96 },
  { name: 'ADOBE ILLUSTRATOR',   pct: 85 },
  { name: 'PHOTOSHOP',           pct: 80 },
  { name: 'MICROSOFT WORD',      pct: 98 },
  { name: 'POWERPOINT',          pct: 94 },
  { name: 'GOOGLE SLIDES',       pct: 95 },
  { name: 'RESEARCH WRITING',    pct: 90 },
  { name: 'LAYOUT DESIGN',       pct: 88 },
  { name: 'TYPOGRAPHY',          pct: 84 },
]

const SKILLS_MARQUEE = [
  'Canva', '·', 'Adobe Illustrator', '·', 'Photoshop', '·',
  'Microsoft Word', '·', 'PowerPoint', '·', 'Google Slides', '·',
  'Google Docs', '·', 'Excel', '·', 'Research Writing', '·',
  'Layout Design', '·', 'Typography', '·', 'Brand Identity', '·',
]

const PERSONAL_INFO = [
  { label: 'NAME',    value: 'Shan Sabal Cezar' },
  { label: 'ROLE',    value: 'Designer · Document Specialist · Researcher' },
  { label: 'BASE',    value: 'Philippines' },
  { label: 'TOOLS',   value: 'Canva, Microsoft Office, Google Workspace, Adobe Suite' },
  { label: 'STATUS',  value: 'Open for freelance projects and collaborations' },
  { label: 'CONTACT', value: 'Facebook · @shan.cezar.71' },
]

const NAV_LINKS = [
  { label: "SHAN'S WORK", scrollTo: 'work' },
  { label: 'SKILLS',      scrollTo: 'skills' },
  { label: 'ABOUT',       scrollTo: 'about' },
  { label: 'CONTACT',     scrollTo: 'contact' },
]

// ─── LOADER ───────────────────────────────────────────────────────────────────

const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(0)
  const barWidth  = useRef(new Animated.Value(0)).current
  const barHeight = useRef(new Animated.Value(3)).current
  const opacity   = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Count 0→100
    let frame = 0
    const total = 60
    const timer = setInterval(() => {
      frame++
      setCount(Math.round((frame / total) * 100))
      if (frame >= total) clearInterval(timer)
    }, 23)

    // Bar sweep → expand → fade
    Animated.sequence([
      Animated.timing(barWidth, {
        toValue: SCREEN_W,
        duration: 1400,
        useNativeDriver: false,
      }),
      Animated.timing(barHeight, {
        toValue: SCREEN_H,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(() => onComplete())

    return () => clearInterval(timer)
  }, [])

  return (
    <Animated.View style={[s.loaderWrap, { opacity }]} pointerEvents="none">
      {/* Bar */}
      <Animated.View style={[s.loaderBar, { width: barWidth, height: barHeight }]} />
      {/* Count */}
      <Text style={s.loaderCount}>{count}</Text>
      <Text style={s.loaderLabel}>SHAN SABAL CEZAR</Text>
    </Animated.View>
  )
}

// ─── SOUND BARS ───────────────────────────────────────────────────────────────

const SoundBars = () => {
  const anims = useRef(
    Array.from({ length: 9 }, (_, i) => ({
      val: new Animated.Value(4),
      delay: i * 110,
    }))
  ).current

  useEffect(() => {
    anims.forEach(({ val, delay }) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 20, duration: 380, useNativeDriver: false }),
          Animated.timing(val, { toValue: 4,  duration: 380, useNativeDriver: false }),
        ])
      ).start()
    })
  }, [])

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 20 }}>
      {anims.map(({ val }, i) => (
        <Animated.View
          key={i}
          style={{
            width: 2,
            height: val,
            backgroundColor: '#CC0000',
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  )
}

// ─── FADE-IN WRAPPER ──────────────────────────────────────────────────────────

const FadeIn = ({
  children,
  delay = 0,
  from = 'bottom',
  distance = 28,
}: {
  children: React.ReactNode
  delay?: number
  from?: 'bottom' | 'left' | 'right' | 'none'
  distance?: number
}) => {
  const opacity = useRef(new Animated.Value(0)).current
  const translate = useRef(new Animated.Value(distance)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 640, delay,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0, duration: 640, delay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const transform =
    from === 'bottom' ? [{ translateY: translate }] :
    from === 'left'   ? [{ translateX: translate }] :
    from === 'right'  ? [{ translateX: Animated.multiply(translate, -1) }] :
    []

  return (
    <Animated.View style={{ opacity, transform }}>
      {children}
    </Animated.View>
  )
}

// ─── STAGGER CONTAINER ────────────────────────────────────────────────────────
// Wraps children and triggers FadeIn only when onLayout fires (scroll-into-view sim)

const StaggerReveal = ({
  children,
  baseDelay = 0,
  stagger = 80,
}: {
  children: React.ReactNode[]
  baseDelay?: number
  stagger?: number
}) => (
  <>
    {React.Children.map(children, (child, i) => (
      <FadeIn key={i} delay={baseDelay + i * stagger}>
        {child}
      </FadeIn>
    ))}
  </>
)

// ─── BURGER / NAV ─────────────────────────────────────────────────────────────

const BurgerNav = ({
  onNavigate,
  darkBg = false,
}: {
  onNavigate: (target: string) => void
  darkBg?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const navItemAnims   = useRef(NAV_LINKS.map(() => ({
    opacity:    new Animated.Value(0),
    translateX: new Animated.Value(-40),
  }))).current

  const openNav = () => {
    setOpen(true)
    Animated.timing(overlayOpacity, {
      toValue: 1, duration: 320,
      useNativeDriver: true,
    }).start(() => {
      NAV_LINKS.forEach((_, i) => {
        Animated.parallel([
          Animated.timing(navItemAnims[i].opacity, {
            toValue: 1, duration: 340, delay: i * 80,
            useNativeDriver: true,
          }),
          Animated.timing(navItemAnims[i].translateX, {
            toValue: 0, duration: 340, delay: i * 80,
            useNativeDriver: true,
          }),
        ]).start()
      })
    })
  }

  const closeNav = () => {
    navItemAnims.forEach(({ opacity: op, translateX: tx }) => {
      Animated.timing(op,  { toValue: 0, duration: 180, useNativeDriver: true }).start()
      Animated.timing(tx,  { toValue: -40, duration: 180, useNativeDriver: true }).start()
    })
    Animated.timing(overlayOpacity, {
      toValue: 0, duration: 300, delay: 120,
      useNativeDriver: true,
    }).start(() => {
      setOpen(false)
      navItemAnims.forEach(({ opacity: op, translateX: tx }) => {
        op.setValue(0); tx.setValue(-40)
      })
    })
  }

  const handleLink = (scrollTo: string) => {
    setActive(scrollTo)
    closeNav()
    setTimeout(() => {
      onNavigate(scrollTo)
      setActive(null)
    }, 340)
  }

  // Burger lines
  const line1Rotate    = useRef(new Animated.Value(0)).current
  const line2Opacity   = useRef(new Animated.Value(1)).current
  const line3Rotate    = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(line1Rotate,  { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(line2Opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(line3Rotate,  { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(line1Rotate,  { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(line2Opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(line3Rotate,  { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start()
    }
  }, [open])

  const lineColor = darkBg ? '#ffffff' : '#ffffff'

  return (
    <>
      {/* Burger button */}
      <TouchableOpacity
        style={s.burgerBtn}
        onPress={openNav}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Animated.View style={{
          height: 2, width: 28, backgroundColor: lineColor, borderRadius: 1,
          transform: [{
            rotate: line1Rotate.interpolate({ inputRange: [0,1], outputRange: ['0deg', '45deg'] }),
          }, {
            translateY: line1Rotate.interpolate({ inputRange: [0,1], outputRange: [0, 10] }),
          }],
        }} />
        <Animated.View style={{
          height: 2, width: 20, backgroundColor: lineColor, borderRadius: 1,
          opacity: line2Opacity,
        }} />
        <Animated.View style={{
          height: 2, width: 28, backgroundColor: lineColor, borderRadius: 1,
          transform: [{
            rotate: line3Rotate.interpolate({ inputRange: [0,1], outputRange: ['0deg', '-45deg'] }),
          }, {
            translateY: line3Rotate.interpolate({ inputRange: [0,1], outputRange: [0, -10] }),
          }],
        }} />
      </TouchableOpacity>

      {/* Full-screen nav overlay */}
      <Modal visible={open} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[s.navOverlay, { opacity: overlayOpacity }]}>
          {/* Close button */}
          <TouchableOpacity style={s.navCloseBtn} onPress={closeNav} activeOpacity={0.7}>
            <Text style={s.navCloseText}>×</Text>
          </TouchableOpacity>

          {/* Nav links */}
          <View style={{ width: '100%', gap: 4 }}>
            {NAV_LINKS.map((link, i) => (
              <Animated.View
                key={link.scrollTo}
                style={{
                  opacity: navItemAnims[i].opacity,
                  transform: [{ translateX: navItemAnims[i].translateX }],
                }}
              >
                <TouchableOpacity
                  onPress={() => handleLink(link.scrollTo)}
                  activeOpacity={0.7}
                >
                  <Text style={active === link.scrollTo ? s.navLinkTextActive : s.navLinkText}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Bottom micro info */}
          <View style={{ position: 'absolute', bottom: 48, left: 40 }}>
            <Text style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.2)' }}>
              SHAN SABAL CEZAR · PORTFOLIO
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  )
}

// ─── GALLERY STRIP ────────────────────────────────────────────────────────────

const GalleryStrip = ({ images }: { images: any[] }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ gap: 2, paddingHorizontal: 0 }}
  >
    {images.map((img, i) => (
      <Image
        key={i}
        source={img}
        style={{ width: SCREEN_W * 0.72, height: 200 }}
        resizeMode="cover"
      />
    ))}
  </ScrollView>
)

// ─── SKILL BAR ────────────────────────────────────────────────────────────────

const SkillBar = ({ name, pct, delay = 0 }: { name: string; pct: number; delay?: number }) => {
  const width = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  const reveal = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 400, delay,
        useNativeDriver: true,
      }),
      Animated.timing(width, {
        toValue: (SCREEN_W - 56) * (pct / 100),
        duration: 800, delay,
        useNativeDriver: false,
      }),
    ]).start()
  }, [])

  useEffect(() => { reveal() }, [])

  return (
    <Animated.View style={[s.skillRow, { opacity }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={s.skillName}>{name}</Text>
        <Text style={{ fontSize: 10, color: '#aaa', letterSpacing: 1 }}>{pct}%</Text>
      </View>
      <View style={s.skillBarBg}>
        <Animated.View style={[s.skillBarFill, { width }]} />
      </View>
    </Animated.View>
  )
}

// ─── CHAPTER COMPONENT ────────────────────────────────────────────────────────

const Chapter = ({
  chapter,
  index,
  onWorkPress,
}: {
  chapter: typeof CHAPTERS[0]
  index: number
  onWorkPress: () => void
}) => {
  const coverScale   = useRef(new Animated.Value(1)).current
  const bodyOpacity  = useRef(new Animated.Value(0)).current
  const bodyTranslate = useRef(new Animated.Value(32)).current
  const [revealed, setRevealed] = useState(false)

  const revealBody = useCallback(() => {
    if (revealed) return
    setRevealed(true)
    Animated.parallel([
      Animated.timing(bodyOpacity, {
        toValue: 1, duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(bodyTranslate, {
        toValue: 0, duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [revealed])

  // Subtle cover scale pulse on mount
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(coverScale, { toValue: 1.04, duration: 6000, useNativeDriver: true }),
        Animated.timing(coverScale, { toValue: 1.00, duration: 6000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const nextChapter = CHAPTERS[index + 1]

  return (
    <View
      style={s.chapterWrap}
      onLayout={revealBody}
    >
      {/* ── Cover image ── */}
      <View style={{ overflow: 'hidden', height: 260 }}>
        <Animated.Image
          source={chapter.img}
          style={[s.chapterCoverImg, { transform: [{ scale: coverScale }] }]}
          resizeMode="cover"
        />
        <View style={s.chapterCoverOverlay} />

        {/* Num watermark */}
        <View style={{ position: 'absolute', bottom: 8, right: 16 }}>
          <Text style={s.chapterCoverNum}>{chapter.num}</Text>
        </View>

        {/* Chapter label badge */}
        <View style={[s.chapterCoverBadge]}>
          <View style={s.redPill}>
            <Text style={s.redPillText}>[{chapter.coverLabel.toUpperCase()}]</Text>
          </View>
        </View>

        {/* Bottom cover label */}
        <View style={s.chapterCoverLabel}>
          <Text style={s.chapterCoverLabelText}>[{chapter.num}] [CHAPTER]</Text>
        </View>
      </View>

      {/* ── Chapter body (animated in) ── */}
      <Animated.View style={{ opacity: bodyOpacity, transform: [{ translateY: bodyTranslate }] }}>

        {/* Header */}
        <View style={s.chapterBody}>
          <Text style={s.chapterTagline}>{chapter.tagline}</Text>
          <Text style={s.chapterTitle}>{chapter.coverLabel.toUpperCase()}</Text>
          <Text style={s.chapterHeadline}>{chapter.headline}</Text>
          <Text style={s.chapterDesc}>{chapter.desc}</Text>

          {/* Tags row */}
          <View style={s.chapterTagsWrap}>
            {chapter.tags.map((tag) => (
              <View key={tag} style={s.tagPill}>
                <Text style={s.tagPillText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.chapterDivider} />

        {/* Gallery strip */}
        <View style={{ marginVertical: 2 }}>
          <GalleryStrip images={chapter.gallery} />
        </View>

        <View style={s.chapterDivider} />

        {/* Craft quote */}
        <View style={s.chapterCraftWrap}>
          <Text style={s.chapterCraftLabel}>[MY APPROACH]</Text>
          <Text style={s.chapterCraftText}>{chapter.craft}</Text>
        </View>

        <View style={s.chapterDivider} />

        {/* Sound strip */}
        <View style={s.chapterSoundStrip}>
          <Text style={s.chapterSoundLabel}>THE SOUND WITHIN</Text>
          <Text style={s.chapterSoundTitle}>{chapter.sound}</Text>
          <SoundBars />
        </View>

        {/* Outro */}
        <View style={s.chapterOutroWrap}>
          <Text style={s.chapterOutroDesc}>{chapter.desc.slice(0, 90)}…</Text>

          <TouchableOpacity style={s.ctaButton} onPress={onWorkPress} activeOpacity={0.8}>
            <Text style={s.ctaButtonText}>LET'S WORK</Text>
          </TouchableOpacity>

          {nextChapter && (
            <>
              <Text style={s.chapterNextLabel}>NEXT CHAPTER</Text>
              <Text style={s.chapterNextTitle}>{nextChapter.coverLabel.toUpperCase()} →</Text>
            </>
          )}
        </View>

      </Animated.View>
    </View>
  )
}

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
