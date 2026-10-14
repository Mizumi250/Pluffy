// ============================================================
// ARKZEN GENERATED COMPONENT — ContactSection [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T14:10:33.285Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SignatureLogo } from './SignatureLogo'

export const ContactSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.contact-el'),
      { opacity: 0, y: 30, filter: 'blur(6px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])
  return (
    <section id="contact" className="contact">
      <div className="contact-inner">
        <div className="contact-el contact-sig">
          <SignatureLogo />
          <div className="contact-sig-line" />
        </div>
        <h2 className="contact-el contact-title">Got an idea?<br /><em>Let's talk.</em></h2>
        <p className="contact-el contact-sub">Whether you want a commission, a collaboration, or just want to say hi — my DMs are always open.</p>
        <div className="contact-el contact-cards">
          <a href="https://www.instagram.com/lain098_" target="_blank" className="contact-card">
            <span className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="19.5" cy="4.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <strong>Instagram</strong>
            <span className="muted">@lain098_</span>
          </a>
          <a href="https://throne.com/lain098_" target="_blank" className="contact-card">
            <span className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l3-6 2 4 4-5 4 5 2-4 3 6v8H3z" /><path d="M5 19h14" />
              </svg>
            </span>
            <strong>Throne</strong>
            <span className="muted">throne.com/lain098_</span>
          </a>
        </div>
        <p className="contact-el contact-note muted">For commissions, please check my Throne page for current availability and pricing tiers.</p>
      </div>
    </section>
  )
};
