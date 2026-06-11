// ============================================================
// ARKZEN GENERATED SCREEN — animation-lab/index
// ============================================================

import React, { useCallback, useState } from 'react'
import { MotiView } from 'moti'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { fadeUpPreset, useFadeIn, useSlideUp, useSlideRight, useScaleBloom, useRotateIn, useElasticScale, useSpin, useBounce, usePulse, useShake, useFloat, useHeartbeat, useWiggle, useColorCycle, useScale, useTimeline, useStaggerItems, usePressBounce, usePressColor, useHoverRotate } from '../../arkzen/generated/animation-lab.native-animations'
import { s } from '../../arkzen/generated/animation-lab.native-styles'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'entrance',    label: 'Entrance',     icon: '▶', color: '#6366f1' },
  { id: 'timeline',    label: 'Timeline',     icon: '⏱', color: '#a78bfa' },
  { id: 'stagger',     label: 'Stagger',      icon: '⠿', color: '#f59e0b' },
  { id: 'press',       label: 'Press / Tap',  icon: '👆', color: '#0ea5e9' },
  { id: 'moti',        label: 'Moti Variants',icon: '✦', color: '#f59e0b' },
  { id: 'keyframes',   label: 'Keyframes',    icon: '◈', color: '#f43f5e' },
  { id: 'loop',        label: 'Loop / Repeat',icon: '⟳', color: '#10b981' },
  { id: 'transforms',  label: 'Transforms',   icon: '⬡', color: '#a855f7' },
  { id: 'spring',      label: 'Spring',       icon: '⟲', color: '#ec4899' },
  { id: 'easing',      label: 'Easing',       icon: '⇄', color: '#f97316' },
]

// ─── SHARED CARD COMPONENTS ───────────────────────────────────────────────────
const DemoCard = ({ title, desc, full = false, children }: {
  title: string; desc: string; full?: boolean; children: React.ReactNode
}) => (
  <View style={full ? s.demoCardFull : s.demoCard}>
    <View style={s.demoCardHeader}>
      <Text style={s.demoCardTitle}>{title}</Text>
      <Text style={s.demoCardDesc}>{desc}</Text>
    </View>
    <View style={s.demoCardStage}>{children}</View>
  </View>
)

const PlayReset = ({ onPlay, onReset }: { onPlay: () => void; onReset: () => void }) => (
  <View style={s.btnRow}>
    <TouchableOpacity style={s.playBtn} onPress={onPlay}>
      <Text style={s.playBtnLabel}>▶ Play</Text>
    </TouchableOpacity>
    <TouchableOpacity style={s.resetBtn} onPress={onReset}>
      <Text style={s.resetBtnLabel}>↺</Text>
    </TouchableOpacity>
  </View>
)

const SectionHeader = ({ icon, title, subtitle, color }: {
  icon: string; title: string; subtitle: string; color: string
}) => (
  <View style={s.sectionHeader}>
    <View style={[s.sectionHeaderIcon, { backgroundColor: `${color}22` }]}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.sectionHeaderTitle}>{title}</Text>
      <Text style={s.sectionHeaderSub}>{subtitle}</Text>
    </View>
  </View>
)

// ─── SECTION: ENTRANCE ────────────────────────────────────────────────────────
const EntranceSection = () => {
  const fadeIn   = useFadeIn()
  const slideUp  = useSlideUp()
  const slideR   = useSlideRight()
  const bloom    = useScaleBloom()
  const rotateIn = useRotateIn()
  const elastic  = useElasticScale()

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
      <SectionHeader icon="▶" title="Entrance Animations" subtitle="withTiming, withSpring entrance variants" color="#6366f1" />
      <View style={s.demoGrid}>
        {DEMOS.map(({ label, desc, hook, color }) => (
          <DemoCard key={label} title={label} desc={desc}>
            <Animated.View style={[s.animBox, { backgroundColor: color }, hook.style]}>
              <Text style={s.animBoxLabel}>{label.split(' ')[0].toUpperCase()}</Text>
            </Animated.View>
            <PlayReset onPlay={hook.play} onReset={hook.reset} />
          </DemoCard>
        ))}
      </View>
    </>
  )
}

// ─── SECTION: TIMELINE ────────────────────────────────────────────────────────
const TimelineSection = () => {
  const [playing, setPlaying] = useState(false)
  const tl = useTimeline(() => setPlaying(false))
  const BAR_WIDTHS = [70, 85, 55, 90]
  const BAR_COLORS = ['#8b5cf6', '#a78bfa', '#c084fc', '#d946ef']

  const handlePlay = () => {
    setPlaying(true)
    tl.reset()
    // small delay so reset renders before play
    setTimeout(() => tl.play(), 50)
  }

  return (
    <>
      <SectionHeader icon="⏱" title="Timeline Sequence" subtitle="Chained withDelay — sequential orchestration" color="#a78bfa" />
      <DemoCard title="Chained Timeline" desc="Multiple animations queued with withDelay" full>
        <View style={s.btnRow}>
          <TouchableOpacity style={[s.playBtn, playing && { opacity: 0.5 }]} onPress={handlePlay} disabled={playing}>
            <Text style={s.playBtnLabel}>{playing ? '⏳ Playing...' : '▶ Play Timeline'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.resetBtn} onPress={() => { setPlaying(false); tl.reset() }}>
            <Text style={s.resetBtnLabel}>↺</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[s.tlStage, tl.bgStyle]}>
          <Animated.Text style={[s.tlTitle, tl.titleStyle]}>Timeline Magic ✨</Animated.Text>
          <Animated.View style={[s.tlDotsRow, tl.dotsStyle]}>
            {['●','●','●','●','●'].map((d, i) => (
              <Text key={i} style={s.tlDot}>{d}</Text>
            ))}
          </Animated.View>
          <View style={{ width: '100%', gap: 6 }}>
            {BAR_WIDTHS.map((w, i) => (
              <View key={i} style={s.tlBarWrap}>
                <Animated.View style={[s.tlBarFill, { backgroundColor: BAR_COLORS[i] }, tl.barStyles[i]]} />
              </View>
            ))}
          </View>
          <Animated.View style={[s.tlBadge, tl.badgeStyle]}>
            <Text style={s.tlBadgeLabel}>Complete!</Text>
          </Animated.View>
        </Animated.View>
      </DemoCard>
    </>
  )
}

// ─── SECTION: STAGGER ─────────────────────────────────────────────────────────
const StaggerSection = () => {
  const linear  = useStaggerItems(6, 80)
  const center  = useStaggerItems(7, 70)
  const fromEnd = useStaggerItems(6, 60)
  const grid    = useStaggerItems(12, 50)

  const COLORS_6  = ['#f59e0b','#f97316','#ef4444','#ec4899','#a855f7','#6366f1']
  const COLORS_7  = ['#6366f1','#818cf8','#a5b4fc','#c4b5fd','#a5b4fc','#818cf8','#6366f1']
  const COLORS_E  = ['#10b981','#34d399','#6ee7b7','#a7f3d0','#6ee7b7','#34d399']
  const GRID_COLS = Array.from({ length: 12 }, (_, i) => `hsl(${i * 25}, 80%, 58%)`)

  return (
    <>
      <SectionHeader icon="⠿" title="Stagger Animations" subtitle="withDelay staggered arrays — linear, center, end, grid" color="#f59e0b" />
      <View style={s.demoGrid}>
        <DemoCard title="Linear" desc="stagger left-to-right">
          <View style={s.staggerRow}>
            {COLORS_6.map((c, i) => (
              <Animated.View key={i} style={[{ width: 28, height: 28, borderRadius: 6, backgroundColor: c }, linear.styles[i]]} />
            ))}
          </View>
          <PlayReset onPlay={linear.play} onReset={linear.reset} />
        </DemoCard>
        <DemoCard title="From Center" desc="stagger outward from middle">
          <View style={s.staggerRow}>
            {COLORS_7.map((c, i) => (
              <Animated.View key={i} style={[{ width: 24, height: 24, borderRadius: 6, backgroundColor: c }, center.styles[i]]} />
            ))}
          </View>
          <PlayReset onPlay={center.play} onReset={center.reset} />
        </DemoCard>
        <DemoCard title="From End" desc="stagger right-to-left">
          <View style={s.staggerRow}>
            {COLORS_E.map((c, i) => (
              <Animated.View key={i} style={[{ width: 28, height: 28, borderRadius: 6, backgroundColor: c }, fromEnd.styles[i]]} />
            ))}
          </View>
          <PlayReset onPlay={fromEnd.play} onReset={fromEnd.reset} />
        </DemoCard>
        <DemoCard title="Grid (3×4)" desc="2D grid stagger wave">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {GRID_COLS.map((c, i) => (
              <Animated.View key={i} style={[{ width: 24, height: 24, borderRadius: 5, backgroundColor: c }, grid.styles[i]]} />
            ))}
          </View>
          <PlayReset onPlay={grid.play} onReset={grid.reset} />
        </DemoCard>
      </View>
    </>
  )
}

// ─── SECTION: PRESS / TAP ─────────────────────────────────────────────────────
const PressSection = () => {
  const bounce  = usePressBounce()
  const color   = usePressColor()
  const rotator = useHoverRotate()
  const ripple  = useScale(1.25)

  return (
    <>
      <SectionHeader icon="👆" title="Press / Tap Gestures" subtitle="onPressIn/Out driving Reanimated shared values" color="#0ea5e9" />
      <View style={s.demoGrid}>
        <DemoCard title="Scale Bounce" desc="withSpring on press in/out">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#0ea5e9' }, bounce.style]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPressIn={bounce.onPressIn}
              onPressOut={bounce.onPressOut}
              activeOpacity={1}
            >
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Hold me</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </DemoCard>
        <DemoCard title="Opacity Dim" desc="interpolate opacity on press">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#6366f1' }, color.style]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPressIn={color.onPressIn}
              onPressOut={color.onPressOut}
              activeOpacity={1}
            >
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Press</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </DemoCard>
        <DemoCard title="Icon Rotate" desc="360° spin on press-in">
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
        </DemoCard>
        <DemoCard title="Ripple Scale" desc="withSpring scale up on tap">
          <Animated.View style={[s.animCircle, { backgroundColor: '#10b981' }, ripple.style]}>
            <TouchableOpacity
              onPress={ripple.play}
              onLongPress={ripple.reset}
              activeOpacity={0.9}
              style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 10 }}>TAP</Text>
            </TouchableOpacity>
          </Animated.View>
        </DemoCard>
      </View>
    </>
  )
}

// ─── SECTION: MOTI VARIANTS ───────────────────────────────────────────────────
const MotiSection = () => {
  const [visible, setVisible] = useState(false)
  const [show1, setShow1]     = useState(true)
  const [show2, setShow2]     = useState(true)
  const [show3, setShow3]     = useState(true)

  return (
    <>
      <SectionHeader icon="✦" title="Moti Variants" subtitle="MotiView from/animate/exit — AnimatePresence equivalent" color="#f59e0b" />
      <DemoCard title="Stagger Children" desc="MotiView with stagger delay" full>
        <View style={s.btnRow}>
          <TouchableOpacity style={s.playBtn} onPress={() => setVisible(v => !v)}>
            <Text style={s.playBtnLabel}>{visible ? 'Hide' : 'Animate In'}</Text>
          </TouchableOpacity>
        </View>
        {visible && (
          <View style={[s.staggerRow, { marginTop: 12 }]}>
            {['Alpha','Beta','Gamma','Delta','Epsilon','Zeta'].map((w, i) => (
              <MotiView
                key={w}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', delay: i * 100, damping: 14 }}
                style={[s.animPill, { backgroundColor: '#f59e0b' }]}
              >
                <Text style={s.animPillLabel}>{w}</Text>
              </MotiView>
            ))}
          </View>
        )}
      </DemoCard>
      <View style={s.demoGrid}>
        <DemoCard title="Fade + Slide" desc="from x:-40 animate x:0">
          <View style={{ alignItems: 'center', minHeight: 60, justifyContent: 'center' }}>
            {show1 && (
              <MotiView
                from={{ opacity: 0, translateX: -40 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: 40 }}
                style={{ width: 80, height: 40, borderRadius: 8, backgroundColor: '#3b82f6' }}
              />
            )}
          </View>
          <TouchableOpacity style={s.playBtn} onPress={() => setShow1(v => !v)}>
            <Text style={s.playBtnLabel}>Toggle</Text>
          </TouchableOpacity>
        </DemoCard>
        <DemoCard title="Scale Bounce" desc="from scale:0 with spring">
          <View style={{ alignItems: 'center', minHeight: 60, justifyContent: 'center' }}>
            {show2 && (
              <MotiView
                from={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: '#10b981' }}
              />
            )}
          </View>
          <TouchableOpacity style={s.playBtn} onPress={() => setShow2(v => !v)}>
            <Text style={s.playBtnLabel}>Toggle</Text>
          </TouchableOpacity>
        </DemoCard>
        <DemoCard title="Rotate In" desc="from rotate:-180 with spring">
          <View style={{ alignItems: 'center', minHeight: 60, justifyContent: 'center' }}>
            {show3 && (
              <MotiView
                from={{ opacity: 0, rotate: '-180deg' }}
                animate={{ opacity: 1, rotate: '0deg' }}
                exit={{ opacity: 0, rotate: '180deg' }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: '#a855f7' }}
              />
            )}
          </View>
          <TouchableOpacity style={s.playBtn} onPress={() => setShow3(v => !v)}>
            <Text style={s.playBtnLabel}>Toggle</Text>
          </TouchableOpacity>
        </DemoCard>
        <DemoCard title="whileInView equiv." desc="MotiView animate on mount">
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            style={{ width: 100, height: 44, borderRadius: 10, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>In View!</Text>
          </MotiView>
        </DemoCard>
      </View>
    </>
  )
}

// ─── SECTION: KEYFRAMES ───────────────────────────────────────────────────────
const KeyframesSection = () => {
  const bounce   = useBounce()
  const pulse    = usePulse()
  const shake    = useShake()
  const float    = useFloat()
  const heart    = useHeartbeat()
  const wiggle   = useWiggle()

  return (
    <>
      <SectionHeader icon="◈" title="Keyframe Sequences" subtitle="withSequence multi-step array animations" color="#f43f5e" />
      <View style={s.demoGrid}>
        {[
          { label: 'Bounce',    desc: 'y: 0 → -20 → 0 loop',   hook: bounce, color: '#f43f5e' },
          { label: 'Pulse',     desc: 'scale+opacity oscillate', hook: pulse,  color: '#f97316' },
          { label: 'Shake',     desc: 'x: ±6px sequence fast',  hook: shake,  color: '#eab308' },
          { label: 'Float',     desc: 'y: 0 → -10 → 0 slow',   hook: float,  color: '#22c55e' },
          { label: 'Heartbeat', desc: 'double scale pulse',     hook: heart,  color: '#ec4899' },
          { label: 'Wiggle',    desc: 'rotate ±10deg sequence', hook: wiggle, color: '#a855f7' },
        ].map(({ label, desc, hook, color }) => (
          <DemoCard key={label} title={label} desc={desc}>
            <Animated.View style={[s.animBox, { backgroundColor: color }, hook.style]}>
              <Text style={s.animBoxLabel}>{label.toUpperCase()}</Text>
            </Animated.View>
            <PlayReset onPlay={hook.play} onReset={hook.reset} />
          </DemoCard>
        ))}
      </View>
    </>
  )
}

// ─── SECTION: LOOP / REPEAT ───────────────────────────────────────────────────
const LoopSection = () => {
  const spin1    = useSpin()
  const pulse2   = usePulse()
  const wave0    = useBounce()
  const wave1    = useBounce()
  const wave2    = useBounce()
  const wave3    = useBounce()
  const wave4    = useBounce()
  const [waveOn, setWaveOn] = useState(false)

  const WAVE_HOOKS = [wave0, wave1, wave2, wave3, wave4]
  const WAVE_COLORS = ['#0ea5e9','#38bdf8','#7dd3fc','#bae6fd','#e0f2fe']

  const playWave = () => {
    setWaveOn(true)
    WAVE_HOOKS.forEach((h, i) => setTimeout(() => h.play(), i * 120))
  }
  const resetWave = () => {
    setWaveOn(false)
    WAVE_HOOKS.forEach(h => h.reset())
  }

  return (
    <>
      <SectionHeader icon="⟳" title="Loop / Repeat" subtitle="withRepeat(-1) — infinite looping animations" color="#10b981" />
      <View style={s.demoGrid}>
        <DemoCard title="Spin (infinite)" desc="withRepeat(-1) Easing.linear">
          <Animated.View style={[s.animBox, { backgroundColor: '#6366f1' }, spin1.style]}>
            <Text style={s.animBoxLabel}>SPIN</Text>
          </Animated.View>
          <PlayReset onPlay={spin1.play} onReset={spin1.reset} />
        </DemoCard>
        <DemoCard title="Pulse (infinite)" desc="withRepeat(-1) scale+opacity">
          <Animated.View style={[s.animCircle, { backgroundColor: '#f43f5e' }, pulse2.style]} />
          <PlayReset onPlay={pulse2.play} onReset={pulse2.reset} />
        </DemoCard>
        <DemoCard title="Wave Bars" desc="5 bars staggered bounce loop" full>
          <View style={[s.waveRow, { justifyContent: 'center' }]}>
            {WAVE_HOOKS.map((h, i) => (
              <Animated.View
                key={i}
                style={[{ width: 10, height: 44, borderRadius: 5, backgroundColor: WAVE_COLORS[i] }, h.style]}
              />
            ))}
          </View>
          <View style={s.btnRow}>
            <TouchableOpacity style={s.playBtn} onPress={playWave}>
              <Text style={s.playBtnLabel}>▶ Wave</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.resetBtn} onPress={resetWave}>
              <Text style={s.resetBtnLabel}>↺</Text>
            </TouchableOpacity>
          </View>
        </DemoCard>
        <DemoCard title="Color Cycle (Moti)" desc="MotiView background array loop">
          <MotiView
            from={{ backgroundColor: '#f43f5e' }}
            animate={{ backgroundColor: ['#f43f5e','#f97316','#eab308','#22c55e','#0ea5e9','#a855f7','#f43f5e'] }}
            transition={{ loop: true, duration: 4000, type: 'timing' }}
            style={{ width: 72, height: 72, borderRadius: 12 }}
          />
        </DemoCard>
        <DemoCard title="Border Radius Morph" desc="shape morphs via MotiView loop">
          <MotiView
            animate={{ borderRadius: [12, 26, 6, 26, 12] }}
            transition={{ loop: true, duration: 2500, type: 'timing' }}
            style={{ width: 64, height: 64, backgroundColor: '#a855f7' }}
          />
        </DemoCard>
      </View>
    </>
  )
}

// ─── SECTION: TRANSFORMS ─────────────────────────────────────────────────────
const TransformsSection = () => {
  const translate = useSlideUp()
  const scaleAnim = useScaleBloom()
  const rotAnim   = useRotateIn()
  const elastic2  = useElasticScale()

  return (
    <>
      <SectionHeader icon="⬡" title="Transform Variants" subtitle="translate, rotate, scale, skew, combined — tap to trigger" color="#a855f7" />
      <View style={s.demoGrid}>
        <DemoCard title="translateY" desc="withTiming y: 24 → 0">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#a855f7' }, translate.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12, lineHeight: 56 }}>Y</Text>
          </Animated.View>
          <PlayReset onPlay={translate.play} onReset={translate.reset} />
        </DemoCard>
        <DemoCard title="scale" desc="withSpring scale 0.3→1">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#8b5cf6' }, scaleAnim.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12, lineHeight: 56 }}>S</Text>
          </Animated.View>
          <PlayReset onPlay={scaleAnim.play} onReset={scaleAnim.reset} />
        </DemoCard>
        <DemoCard title="rotate" desc="withTiming -90°→0°">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#6366f1' }, rotAnim.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12, lineHeight: 56 }}>R</Text>
          </Animated.View>
          <PlayReset onPlay={rotAnim.play} onReset={rotAnim.reset} />
        </DemoCard>
        <DemoCard title="scaleX elastic" desc="withSpring scaleX 0→1">
          <Animated.View style={[s.gestureTarget, { backgroundColor: '#c084fc' }, elastic2.style]}>
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center', fontSize: 12, lineHeight: 56 }}>sX</Text>
          </Animated.View>
          <PlayReset onPlay={elastic2.play} onReset={elastic2.reset} />
        </DemoCard>
        <DemoCard title="Combined" desc="slide + scale + rotate together" full>
          <CombinedTransformDemo />
        </DemoCard>
      </View>
    </>
  )
}

const CombinedTransformDemo = () => {
  const sv  = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    opacity:   sv.value,
    transform: [
      { translateY: (1 - sv.value) * 30 },
      { scale:      0.4 + sv.value * 0.6 },
      { rotate:     `${(1 - sv.value) * -45}deg` },
    ],
  }))
  const play  = () => { sv.value = withSpring(1, { damping: 10, stiffness: 120 }) }
  const reset = () => { sv.value = 0 }
  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={[{ width: 80, height: 50, borderRadius: 10, backgroundColor: '#ec4899', alignItems: 'center', justifyContent: 'center' }, style]}>
        <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Combined</Text>
      </Animated.View>
      <PlayReset onPlay={play} onReset={reset} />
    </View>
  )
}

// ─── SECTION: SPRING ──────────────────────────────────────────────────────────
const SpringSection = () => {
  const makeSpring = (damping: number, stiffness: number) => {
    const sv    = useSharedValue(0)
    const style = useAnimatedStyle(() => ({ transform: [{ translateX: sv.value }] }))
    const play  = () => { sv.value = withSpring(80, { damping, stiffness }) }
    const reset = () => { sv.value = withSpring(0, { damping: 20, stiffness: 200 }) }
    return { style, play, reset }
  }

  const springConfigs = [
    { label: 'Bouncy',   desc: 'damping:4 stiffness:200',  d: 4,  k: 200, color: '#ec4899' },
    { label: 'Snappy',   desc: 'damping:10 stiffness:400', d: 10, k: 400, color: '#f97316' },
    { label: 'Wobbly',   desc: 'damping:2 stiffness:80',   d: 2,  k: 80,  color: '#a855f7' },
    { label: 'Stiff',    desc: 'damping:20 stiffness:300', d: 20, k: 300, color: '#0ea5e9' },
    { label: 'Slow',     desc: 'damping:15 stiffness:40',  d: 15, k: 40,  color: '#10b981' },
    { label: 'Elastic',  desc: 'damping:6 stiffness:150',  d: 6,  k: 150, color: '#6366f1' },
  ]

  const springs = springConfigs.map(c => makeSpring(c.d, c.k))

  return (
    <>
      <SectionHeader icon="⟲" title="Spring Physics" subtitle="withSpring — damping and stiffness variants" color="#ec4899" />
      <View style={s.demoGrid}>
        {springConfigs.map(({ label, desc, color }, i) => (
          <DemoCard key={label} title={label} desc={desc}>
            <Animated.View style={[s.animBox, { backgroundColor: color }, springs[i].style]}>
              <Text style={s.animBoxLabel}>{label.toUpperCase()}</Text>
            </Animated.View>
            <PlayReset onPlay={springs[i].play} onReset={springs[i].reset} />
          </DemoCard>
        ))}
      </View>
    </>
  )
}

// ─── SECTION: EASING ──────────────────────────────────────────────────────────
const EasingSection = () => {
  const makeEasingDemo = (easingFn: any, label: string, color: string) => {
    const sv    = useSharedValue(0)
    const style = useAnimatedStyle(() => ({ transform: [{ translateX: sv.value }] }))
    const play  = () => { sv.value = withTiming(80, { duration: 700, easing: easingFn }) }
    const reset = () => { sv.value = 0 }
    return { style, play, reset, label, color }
  }

  const demos = [
    makeEasingDemo(Easing.linear,            'linear',      '#6366f1'),
    makeEasingDemo(Easing.ease,              'ease',        '#8b5cf6'),
    makeEasingDemo(Easing.in(Easing.quad),   'ease-in',     '#a855f7'),
    makeEasingDemo(Easing.out(Easing.quad),  'ease-out',    '#c084fc'),
    makeEasingDemo(Easing.inOut(Easing.quad),'ease-in-out', '#d946ef'),
    makeEasingDemo(Easing.out(Easing.back(2.5)), 'back.out','#ec4899'),
    makeEasingDemo(Easing.out(Easing.elastic(1)),'elastic', '#f43f5e'),
    makeEasingDemo(Easing.out(Easing.bounce),    'bounce',  '#f97316'),
  ]

  return (
    <>
      <SectionHeader icon="⇄" title="Easing Functions" subtitle="withTiming easing variants — slide right to compare" color="#f97316" />
      <View style={s.demoGrid}>
        {demos.map(({ style, play, reset, label, color }) => (
          <DemoCard key={label} title={label} desc="withTiming 700ms">
            <Animated.View style={[s.animBox, { backgroundColor: color }, style]}>
              <Text style={s.animBoxLabel}>{label.split('.')[0].toUpperCase()}</Text>
            </Animated.View>
            <PlayReset onPlay={play} onReset={reset} />
          </DemoCard>
        ))}
      </View>
    </>
  )
}

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
