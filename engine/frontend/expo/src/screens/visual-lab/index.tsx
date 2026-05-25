// ============================================================
// ARKZEN GENERATED SCREEN — visual-lab/index [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:index instead
// Generated: 2026-05-25T02:23:02.027Z
// ============================================================

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GuestLayout } from '@/layouts/GuestLayout'

export function IndexScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <GuestLayout tatSlug="visual-lab" dashboardRoute="/visual-lab/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const IndexPage = () => {
  const { activeSection, setActiveSection } = useVisualLabStore()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = visualLabAnimations(pageRef)
    return cleanup
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'three-r3f':    return <ThreeR3FSection />
      case 'babylonjs':    return <BabylonSection />
      case 'playcanvas':   return <PlayCanvasSection />
      case 'ogl':          return <OGLSection />
      case 'pixi':         return <PixiSection />
      case 'konva':        return <KonvaSection />
      case 'fabric':       return <FabricSection />
      case 'p5':           return <P5Section />
      case 'regl':         return <REGLSection />
      case 'twgl':         return <TWGLSection />
      case 'phaser':       return <PhaserSection />
      case 'matter':       return <MatterSection />
      case 'rapier':       return <RapierSection />
      case 'particles':    return <ParticlesSection />
      case 'proton':       return <ParticlesSection />
      case 'lottie':       return <LottieLazySection />
      case 'confetti':     return <UXSection />
      case 'typed':        return <TextFXSection />
      case 'troika':       return <TextFXSection />
      case 'splitting':    return <TextFXSection />
      case 'rough':        return <TextFXSection />
      case 'vanilla-tilt': return <UXSection />
      case 'lenis':        return <UXSection />
      case 'curtains':     return <CurtainsSection />
      case 'shaders':      return <ShadersSection />
      case 'script-dsl':   return <ScriptDSLSection />
      case 'html-canvas':  return <HTMLCanvasSection />
      default:             return <ThreeR3FSection />
    }
  }

  // Group nav items
  const groups = [...new Set(NAV_SECTIONS.map(s => s.group))]

  return (
    <div ref={pageRef} className="vl-root">
      {/* Sidebar */}
      <aside className="vl-sidebar">
        <div className="vl-logo">
          <h1>🔬 Visual Lab</h1>
          <p>All graphics packages · Script DSL · HTML-in-Canvas</p>
        </div>
        {groups.map(group => (
          <div key={group}>
            <div className="vl-nav-group">{group}</div>
            {NAV_SECTIONS.filter(s => s.group === group).map(s => (
              <div
                key={s.id}
                className={`vl-nav-item ${activeSection === s.id ? 'active' : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span style={{ fontSize: 13 }}>{s.icon}</span>
                {s.label}
              </div>
            ))}
          </div>
        ))}
      </aside>

      {/* Content */}
      <main className="vl-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default IndexScreen
