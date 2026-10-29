'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — AboutSection
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:42.889Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BurstItem } from './types'

// ─── ABOUT ────────────────────────────────────────────────────

export const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.about-el'),
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      }
    )
    gsap.to(ref.current.querySelector('.about-bg-text') as HTMLElement, {
      yPercent: -15, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }, [])
  return (
    <section id="about" className="about">
      <div className="about-bg-text" aria-hidden>LAIN</div>
      <div className="about-inner">
        <div className="about-img-col about-el">
          <div className="about-img-frame">
            <img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80" alt="Lain working" />
          </div>
          <div className="about-img-tag about-el"><span className="vertical-text">DIGITAL ARTIST · 2021</span></div>
          <div className="about-float-small about-float1">✦</div>
          <div className="about-float-small about-float2">◈</div>
        </div>
        <div className="about-text-col">
          <span className="about-el section-eyebrow">About</span>
          <h2 className="about-el about-title">The art of Sonic and Visual <span>Storytelling</span></h2>
          <p className="about-el about-p">I'm a digital artist whose work focuses on anime-style illustrations — fanart, original characters, chibi, and short animations. I enjoy creating unique characters and bringing ideas to life through art.</p>
          <p className="about-el about-p">My style lives in soft colours, expressive eyes, and the quiet in-between moments — the kind of art that feels like a warm afternoon.</p>
          <p className="about-el about-p">Behind each piece is a meticulous process — from initial sketch to final render. I craft each work to connect emotionally and aesthetically.</p>
          <div className="about-el about-tags">
            {['Anime Illustration', 'Fanart', 'Original Characters', 'Chibi', 'Short Animation', 'Character Design'].map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <div className="about-el about-links">
            <a href="https://www.instagram.com/lain098_" target="_blank" className="btn-dark">Instagram</a>
            <a href="https://throne.com/lain098_" target="_blank" className="btn-ghost">Throne Wishlist</a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CONTACT ──────────────────────────────────────────────────
