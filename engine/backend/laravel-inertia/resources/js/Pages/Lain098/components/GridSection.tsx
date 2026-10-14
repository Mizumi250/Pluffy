// ============================================================
// ARKZEN GENERATED COMPONENT — GridSection [React+Inertia]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T17:05:21.470Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── BLUE GRID SCRAPBOOK SECTION ────────────────────────────

export const GridSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.grid-el'),
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.08, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])

  return (
    <section className="grid-section" ref={ref}>
      <div className="grid-inner">
        <div className="grid-bg-line" />
        <div className="grid-bg-line-2" />
        
        <div className="grid-text-top grid-el">No one can get closer to each other</div>
        <div className="grid-text-center grid-el">
          没有人能够比<br />
          <span className="j-big">我们</span><br />
          接近 对方。
        </div>
        <div className="grid-text-bottom grid-el">
          就这样并肩躺在<br />一望无际麦田的中央
        </div>
        <div className="grid-text-tiny grid-el">
          直到再没有人能够<br />比我们更为接近对方
        </div>

        <div className="grid-img-vert grid-el"><img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80" alt="Tall forest" /></div>
        <div className="grid-img-sml grid-el"><img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80" alt="Grass" /></div>
        <div className="grid-img-sq grid-el"><img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80" alt="Sunset" /></div>
        <div className="grid-img-sq2 grid-el"><img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80" alt="Mountain" /></div>

        <div className="grid-swatches grid-el">
          <div className="g-swatch" style={{ background: '#1b3d5c' }} />
          <div className="g-swatch" style={{ background: '#4f8eb3' }} />
          <div className="g-swatch" style={{ background: '#7ec3e2' }} />
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER (NO SMALL SIGNATURE, BIG CENTER LOGO WITH MIZUMI) ─
