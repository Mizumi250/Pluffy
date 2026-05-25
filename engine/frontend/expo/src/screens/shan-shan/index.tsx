// ============================================================
// ARKZEN GENERATED SCREEN — shan-shan/index [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:index instead
// Generated: 2026-05-25T07:32:33.609Z
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
      <GuestLayout tatSlug="shan-shan" dashboardRoute="/shan-shan/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const IndexPage = () => {
  const [loaded, setLoaded]           = useState(false)
  const [visionPanel, setVisionPanel] = useState(0)
  const [openService, setOpenService] = useState<number | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // ── scroll animations (after loader) ──────────────────────────────────────
  useEffect(() => {
    if (!loaded) return

    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {

      // KV logo fade-in
      gsap.to('#kv-svg', {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1.5,
      })

      // Vision section slide-in
      gsap.fromTo('.vision-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '#vision', start: 'top 82%', toggleActions: 'play none none reset' },
        }
      )

      // Brand items stagger
      gsap.fromTo('.brand-item',
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '#brand', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      // Skills buttons
      gsap.fromTo('.btn-recruit',
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: '#joinus', start: 'top 85%', toggleActions: 'play none none reset' },
        }
      )

      // About boxes
      gsap.fromTo('#about .sec-box',
        { opacity: 0, x: -28 },
        {
          opacity: 1, x: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: '#about', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      // Profile
      gsap.fromTo('.profile-box',
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#profile', start: 'top 80%', toggleActions: 'play none none reset' },
        }
      )

      // Subtle mask parallax
      gsap.utils.toArray<HTMLElement>('.mask-top, .mask-bottom').forEach((el) => {
        gsap.to(el.querySelector('svg'), {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })

    }, pageRef)

    return () => ctx.revert()
  }, [loaded])

  return (
    <div ref={pageRef}>
      {/* LOADER */}
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      {/* BURGER */}
      <BurgerMenu />

      <div id="shan-wrapper">

        {/* ── HERO / KV ── */}
        <div className="sec" id="kv">
          <MaskBottom fill="#fff" />
          <div className="sec-inner">
            <div className="sec-inner-inner">

              {/* Left: photo */}
              <div className="kv-photo-half">
                <img
                  src="/tatemonos/shan-shan/assets/images/shan5.jpg"
                  alt="Shan"
                />
              </div>

              {/* Right: red panel with SHAN logo */}
              <div className="kv-text-half">
                <ShanHeroLogo />
                <span id="kv-svg-alt">
                  designer · document specialist · researcher
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* ── VISION ── */}
        <div className="sec" id="vision">
          <div className="sec-inner">
            <div className="sec-inner-inner">

              {/* Left: carousel */}
              <div className="sec-box">
                <div className="vision-carousel">
                  <AnimatePresence mode="wait">
                    {visionPanel === 0 && (
                      <motion.div
                        key="v0"
                        className="vision-item"
                        initial={{ opacity: 0, x: 36 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -36 }}
                        transition={{ duration: 0.32, ease: 'easeInOut' }}
                      >
                        <h2>ABOUT ME</h2>
                        <p>
                          "Clarity is the foundation of good design."
                        </p>
                        <p>
                          I create clean, purposeful designs and craft thorough,
                          well-structured documents and research. Whether it's visual
                          design or deep-dive analysis, I bring clarity and craft to
                          every project.
                        </p>
                        <p>
                          Good design isn't just about aesthetics — it's about
                          communication. Whether I'm crafting a visual identity,
                          preparing a formal document, or diving deep into research,
                          my goal is the same: make it clear, make it purposeful,
                          make it count.
                        </p>
                      </motion.div>
                    )}
                    {visionPanel === 1 && (
                      <motion.div
                        key="v1"
                        className="vision-item"
                        initial={{ opacity: 0, x: 36 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -36 }}
                        transition={{ duration: 0.32, ease: 'easeInOut' }}
                      >
                        <h2>PHILOSOPHY</h2>
                        <p>Design with purpose, deliver with precision</p>
                        <br />
                        <h2>VALUES</h2>
                        <ol className="list">
                          <li>① Clarity over complexity</li>
                          <li>② Every detail serves a purpose</li>
                          <li>③ Research before execution</li>
                          <li>④ Clean, professional deliverables</li>
                          <li>⑤ Client communication is everything</li>
                        </ol>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="vision-nav">
                  {[0, 1].map((i) => (
                    <i
                      key={i}
                      className={visionPanel === i ? 'active' : ''}
                      onClick={() => setVisionPanel(i)}
                    />
                  ))}
                </div>
              </div>

              {/* Right: photo */}
              <div className="sec-box">
                <img
                  src="/tatemonos/shan-shan/assets/images/shan5.jpg"
                  alt="Shan"
                />
              </div>

            </div>
          </div>
        </div>

        {/* ── BRAND / SERVICES ── */}
        <div className="sec" id="brand">
          <MaskTop fill="#fff" />
          <MaskBottom fill="#fff" />

          {openService !== null && (
            <div
              className="brand-close"
              onClick={() => setOpenService(null)}
              role="button"
              aria-label="Close"
            >
              <i /><i />
            </div>
          )}

          <div className="sec-inner">
            <div className="brand-inner">
              {SERVICES.map((svc, i) => (
                <BrandItem
                  key={svc.id}
                  service={svc}
                  isOpen={openService === i}
                  onToggle={() => setOpenService(openService === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── JOIN US / SKILLS ── */}
        <div className="sec" id="joinus">
          <div className="sec-inner">
            <a href="#brand" className="btn-recruit">Graphic Design</a>
            <a href="#brand" className="btn-recruit">Document Preparation</a>
            <a href="#brand" className="btn-recruit">Research &amp; Analysis</a>
            <a href="#brand" className="btn-recruit">Presentation Design</a>
          </div>
          <MaskBottom fill="#333" />
        </div>

        {/* ── ABOUT ── */}
        <div className="sec" id="about">
          <div className="sec-inner">
            <div className="sec-inner-inner">
              <div className="sec-box">
                <img
                  src="/tatemonos/shan-shan/assets/images/shan5.jpg"
                  alt="Shan Sabal Cezar"
                />
              </div>
              <div className="sec-box">
                <table className="info-table">
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
        </div>

        {/* ── PROFILE / CONTACT ── */}
        <div className="sec" id="profile">
          <MaskTop fill="#333" />
          <div className="sec-inner">
            <div className="sec-inner-inner">
              <div className="profile-box">
                <h2>代表者プロフィール</h2>
                <p><strong>Shan Sabal Cezar</strong></p>
                <p>Philippines · Designer · Document Specialist · Researcher</p>
                <ul className="list">
                  <li>Graphic design for print and digital media</li>
                  <li>Professional document preparation and formatting</li>
                  <li>Academic and market research with analysis</li>
                  <li>Presentation design and slide deck creation</li>
                </ul>
                <p>
                  Whether you need a clean report, a polished presentation,
                  a striking poster, or thorough research — I deliver work
                  that's clear, professional, and purposeful.
                </p>
                <p>
                  <a
                    href="https://www.facebook.com/shan.cezar.71"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook · @shan.cezar.71
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div id="shan-footer">
          <svg viewBox="0 0 220 40" width="180">
            <text
              x="110"
              y="28"
              textAnchor="middle"
              fill="rgba(255,255,255,0.28)"
              fontSize="16"
              fontWeight="900"
              fontFamily="'Roboto', sans-serif"
              letterSpacing="3"
            >
              SHAN CEZAR
            </text>
          </svg>
          <p>&copy; 2026 Shan Sabal Cezar &middot; All Rights Reserved</p>
        </div>

      </div>
    </div>
  )
}
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default IndexScreen
