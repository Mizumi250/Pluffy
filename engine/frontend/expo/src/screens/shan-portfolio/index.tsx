// ============================================================
// ARKZEN GENERATED SCREEN — shan-portfolio/index [Expo]
// Layout: guest | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:index instead
// Generated: 2026-05-25T06:56:29.610Z
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
      <GuestLayout tatSlug="shan-portfolio" dashboardRoute="/shan-portfolio/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const IndexPage = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = shanPortfolioAnimations(pageRef)
    return cleanup
  }, [])

  return (
    <div ref={pageRef}>
      {/* Nav */}
      <nav className="shan-nav">
        <div className="shan-nav-inner">
          <div className="shan-nav-logo">shan<span>.</span></div>
          <div className="shan-nav-links">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* Hero */}
      <section className="shan-hero">
        <div className="shan-hero-content">
          <div className="shan-hero-badge">
            <Star size={14} />
            Available for projects
          </div>
          <h1 className="shan-hero-title">
            Shan Sabal Cezar
          </h1>
          <p className="shan-hero-subtitle">
            Designer · Document Specialist · Researcher
          </p>
          <a href="#contact" className="shan-hero-cta">
            <Mail size={18} />
            Get in touch
          </a>
        </div>
        <div className="shan-scroll-hint">
          <span>Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* About */}
      <section id="about" className="shan-section">
        <div className="shan-section-header">
          <p className="shan-section-label">About</p>
          <h2 className="shan-section-title">Who I am</h2>
        </div>
        <div className="shan-about-grid">
          <div>
            <p className="shan-about-text">{PROFILE.bio}</p>
            <p className="shan-about-text">
              I believe good design isn't just about aesthetics — it's about clarity.
              Whether I'm crafting a visual identity, preparing a formal document,
              or diving deep into research, my goal is always the same: make it
              clear, make it purposeful, make it count.
            </p>
          </div>
          <div className="shan-about-info">
            <div className="shan-info-item">
              <div className="shan-info-icon" style={{ background: 'rgba(108,99,255,0.08)' }}>
                <Layers size={20} style={{ color: '#6C63FF' }} />
              </div>
              <div>
                <p className="shan-info-label">Specialization</p>
                <p className="shan-info-value">Design · Documents · Research</p>
              </div>
            </div>
            <div className="shan-info-item">
              <div className="shan-info-icon" style={{ background: 'rgba(46,196,182,0.08)' }}>
                <Globe size={20} style={{ color: '#2EC4B6' }} />
              </div>
              <div>
                <p className="shan-info-label">Based in</p>
                <p className="shan-info-value">{PROFILE.location}</p>
              </div>
            </div>
            <div className="shan-info-item">
              <div className="shan-info-icon" style={{ background: 'rgba(230,57,70,0.08)' }}>
                <BookOpen size={20} style={{ color: '#E63946' }} />
              </div>
              <div>
                <p className="shan-info-label">Focus</p>
                <p className="shan-info-value">Clean, purposeful deliverables</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="shan-section">
        <div className="shan-section-header">
          <p className="shan-section-label">Services</p>
          <h2 className="shan-section-title">What I do</h2>
        </div>
        <div className="shan-services-grid">
          {SERVICES.map((service, i) => (
            <div key={service.title} className="shan-service-card">
              <div className="shan-service-icon" style={{ background: `${service.color}12` }}>
                <service.icon size={24} style={{ color: service.color }} />
              </div>
              <h3 className="shan-service-title">{service.title}</h3>
              <p className="shan-service-desc">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="shan-section">
        <div className="shan-section-header">
          <p className="shan-section-label">Skills</p>
          <h2 className="shan-section-title">What I'm good at</h2>
        </div>
        <div className="shan-skills-grid">
          {SKILLS.map((skill, i) => (
            <SkillBar key={skill.name} {...skill} index={i} />
          ))}
        </div>
      </section>

      {/* Work */}
      <section id="work" className="shan-section">
        <div className="shan-section-header">
          <p className="shan-section-label">Work</p>
          <h2 className="shan-section-title">Selected projects</h2>
        </div>
        <div className="shan-projects-grid">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="shan-section">
        <div className="shan-section-header">
          <p className="shan-section-label">Contact</p>
          <h2 className="shan-section-title">Let's work together</h2>
        </div>
        <div className="shan-contact-grid">
          <div className="shan-contact-info">
            <a href={`mailto:${PROFILE.email}`} className="shan-contact-card">
              <div className="shan-contact-icon" style={{ background: 'rgba(108,99,255,0.08)' }}>
                <Mail size={20} style={{ color: '#6C63FF' }} />
              </div>
              <div>
                <p className="shan-contact-label">Email</p>
                <p className="shan-contact-value">{PROFILE.email}</p>
              </div>
            </a>
            <a href={PROFILE.facebook} target="_blank" rel="noopener noreferrer" className="shan-contact-card">
              <div className="shan-contact-icon" style={{ background: 'rgba(46,196,182,0.08)' }}>
                <ExternalLink size={20} style={{ color: '#2EC4B6' }} />
              </div>
              <div>
                <p className="shan-contact-label">Facebook</p>
                <p className="shan-contact-value">Shan Cezar</p>
              </div>
            </a>
            <div className="shan-contact-card">
              <div className="shan-contact-icon" style={{ background: 'rgba(230,57,70,0.08)' }}>
                <Globe size={20} style={{ color: '#E63946' }} />
              </div>
              <div>
                <p className="shan-contact-label">Location</p>
                <p className="shan-contact-value">{PROFILE.location}</p>
              </div>
            </div>
          </div>
          <form className="shan-contact-form" onSubmit={(e) => e.preventDefault()}>
            <input className="shan-input" type="text" placeholder="Your name" />
            <input className="shan-input" type="email" placeholder="Your email" />
            <textarea className="shan-input shan-textarea" placeholder="Your message" />
            <button type="submit" className="shan-submit">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="shan-footer">
        <p className="shan-footer-text">
          Built by <span>Shan Sabal Cezar</span> · Designer · Document Specialist · Researcher
        </p>
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
