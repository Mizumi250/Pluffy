'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — HeroSection
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:46.531Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BurstItem } from './types'
import { ArtCarousel } from './ArtCarousel'
import { HeroScript } from './HeroScript'

// ─── HERO SECTION (100vh STATIC, NO PINNING) ─────────────────

export const HeroSection = ({
  onPreview,
  orbitVisible,
  avatarVisible,
}: {
  onPreview: (index: number) => void
  orbitVisible: boolean
  avatarVisible: boolean
}) => {
  const heroRef = useRef<HTMLDivElement>(null)
  const bgCloudRef = useRef<HTMLDivElement>(null)
  const bgImgRef = useRef<HTMLImageElement>(null)

  // Very gentle zoom/fade out as you scroll past the hero.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!bgCloudRef.current || !bgImgRef.current || !heroRef.current) return

    const ctx = gsap.context(() => {
      // The "white cloud" overlay fades out revealing the sky
      gsap.to(bgCloudRef.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        }
      })

      // The background sky image gently zooms in
      gsap.to(bgImgRef.current, {
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        }
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="hero hero-ocean-bg" ref={heroRef}>
      
      {/* SKY BACKGROUND LAYER */}
      <div className="hero-bg-container">
        <div className="hero-bg-gradient" />
        <img 
          ref={bgImgRef}
          src="https://images.unsplash.com/photo-1505533321630-975218a5f66f?w=1920&q=80" 
          alt="Blue sky and clouds" 
          className="hero-bg-img" 
        />
        <div ref={bgCloudRef} className="hero-bg-cloud-overlay" />
      </div>

      {/* Script SVG */}
      <HeroScript />

      {/* Center Carousel */}
      <div className="hero-center">
        <div className={`hero-avatar-wrap ${avatarVisible ? 'avatar-visible' : 'avatar-hidden'}`}>
          <ArtCarousel onPreview={onPreview} orbitVisible={orbitVisible} />
        </div>
      </div>

      {/* Side text */}
      <div className={`hero-side-content ${avatarVisible ? 'side-visible' : 'side-hidden'}`}>
        <div className="hero-badge">Digital Artist</div>
        <p className="hero-preview muted">
          <span className="desktop">Click artwork to preview</span>
          <span className="mobile">Tap artwork to preview</span>
        </p>
        <p className="hero-tagline">Art for the <span>dreamers</span>, the <span>storytellers</span>, and the <span>wanderers</span> — illustrations that capture emotion in every stroke.</p>
      </div>
    </section>
  )
}

// ─── INTRO STRIP ──────────────────────────────────────────────
