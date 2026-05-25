// ============================================================
// ARKZEN GENERATED SCREEN — mij-tribute/index [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:index instead
// Generated: 2026-05-25T06:56:28.319Z
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
      <GuestLayout tatSlug="mij-tribute" dashboardRoute="/mij-tribute/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const IndexPage = () => {
  const [loaded, setLoaded] = useState(false)
  const [openProject, setOpenProject] = useState<number | null>(null)
  const [visionPanel, setVisionPanel] = useState(0)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loaded) return

    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo('.mij-brand-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '#brand', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      gsap.fromTo('.mij-join-btn',
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: '#joinus', start: 'top 85%', toggleActions: 'play none none reset' },
        }
      )

      gsap.fromTo('.mij-about-box',
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: '#about', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      gsap.fromTo('.mij-profile-content',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#profile', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      gsap.fromTo('.mij-hero-inner',
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out', delay: 1.3 }
      )
    }, pageRef)

    return () => ctx.revert()
  }, [loaded])

  return (
    <div ref={pageRef}>
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      <BurgerMenu />

      {/* ─── HERO ──────────────────────────────────── */}
      <section className="mij-kv">
        <DiagonalMask position="bottom" fill="#E63946" />
        <div className="mij-kv-inner">
          <div className="mij-hero-inner">
            <ShanLogo />
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 500, marginTop: 16, letterSpacing: '0.04em' }}>
              Designer · Document Specialist · Researcher
            </p>
          </div>
        </div>
      </section>

      {/* ─── ABOUT (vision carousel) ────────────────── */}
      <section id="vision" className="mij-section mij-vision">
        <div className="mij-section-inner">
          <div className="mij-vision-carousel">
            <AnimatePresence mode="wait">
              {visionPanel === 0 && (
                <motion.div
                  key="panel-0"
                  className="mij-vision-item"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <h2 className="mij-heading">ABOUT ME</h2>
                  <p className="mij-vision-quote">
                    "Clarity is the foundation of good design."
                  </p>
                  <p className="mij-text">
                    I create clean, purposeful designs and craft thorough, well-structured
                    documents and research. Whether it's visual design or deep-dive analysis,
                    I bring clarity and craft to every project.
                  </p>
                  <p className="mij-text">
                    I believe good design isn't just about aesthetics — it's about clarity.
                    Whether I'm crafting a visual identity, preparing a formal document,
                    or diving deep into research, my goal is always the same: make it
                    clear, make it purposeful, make it count.
                  </p>
                </motion.div>
              )}
              {visionPanel === 1 && (
                <motion.div
                  key="panel-1"
                  className="mij-vision-item"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <h2 className="mij-heading">PHILOSOPHY</h2>
                  <p className="mij-vision-quote">
                    Design with purpose, deliver with precision
                  </p>
                  <h2 className="mij-heading" style={{ marginTop: 24 }}>VALUES</h2>
                  <ol className="mij-values-list">
                    <li>Clarity over complexity</li>
                    <li>Every detail serves a purpose</li>
                    <li>Research before execution</li>
                    <li>Clean, professional deliverables</li>
                    <li>Client communication is everything</li>
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mij-vision-nav">
            {[0, 1].map((i) => (
              <i
                key={i}
                className={visionPanel === i ? 'active' : ''}
                onClick={() => setVisionPanel(i)}
              />
            ))}
          </div>
          <div className="mij-vision-logo">
            <img src="/tatemonos/mij-tribute/assets/images/shan5.jpg" alt="Shan" className="mij-vision-logo-img" />
          </div>
        </div>
      </section>

      {/* ─── SERVICES ──────────────────────────────── */}
      <section id="brand" className="mij-section mij-brands">
        <DiagonalMask position="top" fill="#E63946" />
        <DiagonalMask position="bottom" fill="#E63946" />
        {openProject !== null && (
          <button className="mij-brand-close" onClick={() => setOpenProject(null)} aria-label="Close all">
            <i /><i />
          </button>
        )}
        <div className="mij-section-inner">
          <h2 className="mij-section-title">SERVICES</h2>
          <div className="mij-brands-grid">
            {PROJECTS.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                isOpen={openProject === i}
                onToggle={() => setOpenProject(openProject === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SKILLS ────────────────────────────────── */}
      <section id="joinus" className="mij-section mij-joinus">
        <div className="mij-section-inner mij-joinus-inner">
          <a href="#" className="mij-join-btn">Graphic Design</a>
          <a href="#" className="mij-join-btn">Document Preparation</a>
          <a href="#" className="mij-join-btn">Research & Analysis</a>
          <a href="#" className="mij-join-btn">Presentation Design</a>
        </div>
        <DiagonalMask position="bottom" fill="#333" />
      </section>

      {/* ─── EXPERIENCE ────────────────────────────── */}
      <section id="about" className="mij-section mij-about">
        <div className="mij-section-inner">
          <div className="mij-about-grid">
            <div className="mij-about-box mij-about-visual">
              <img src="/tatemonos/mij-tribute/assets/images/shan5.jpg" alt="Shan portfolio" className="mij-about-img" />
            </div>
            <div className="mij-about-box">
              <table className="mij-table">
                <tbody>
                  {PERSONAL_INFO.map((row) => (
                    <tr key={row.label}>
                      <th>{row.label}</th>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ───────────────────────────────── */}
      <section id="profile" className="mij-section mij-profile">
        <DiagonalMask position="top" fill="#E63946" />
        <div className="mij-section-inner">
          <div className="mij-profile-content">
            <h2 className="mij-heading">Let's Work Together</h2>
            <p className="mij-profile-name">
              <strong>Shan Sabal Cezar</strong>
            </p>
            <p className="mij-text">Designer · Document Specialist · Researcher · Philippines</p>
            <ul className="mij-profile-list">
              <li>Graphic design for print and digital</li>
              <li>Professional document preparation and formatting</li>
              <li>Academic and market research with analysis</li>
              <li>Presentation design and slide deck creation</li>
            </ul>
            <p className="mij-text">
              Whether you need a clean report, a polished presentation, a striking poster,
              or thorough research — I deliver work that's clear, professional, and purposeful.
            </p>
            <p className="mij-text">
              <a href="https://www.facebook.com/shan.cezar.71" target="_blank" rel="noopener noreferrer"
                style={{ color: '#E63946', textDecoration: 'underline' }}>
                Find me on Facebook
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────── */}
      <footer className="mij-footer">
        <svg viewBox="0 0 200 40" width="160" className="mij-footer-logo">
          <text x="100" y="28" textAnchor="middle" fill="rgba(255,255,255,0.3)"
            fontSize="18" fontWeight="900" fontFamily="sans-serif">
            SHAN CEZAR
          </text>
        </svg>
        <p className="mij-footer-copy">&copy; 2026 Shan Sabal Cezar · All Rights Reserved</p>
      </footer>
    </div>
  )
}
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default IndexScreen
