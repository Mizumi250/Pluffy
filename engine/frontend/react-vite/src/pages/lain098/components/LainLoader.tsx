// ============================================================
// ARKZEN GENERATED COMPONENT — LainLoader [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.493Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { barRef, count, countRef, fallback, ref, screenRef, tl } from './utils'

// ─── LOADER ───────────────────────────────────────────────────────────────────

export const LainLoader = ({ onComplete }: { onComplete: () => void }) => {
  const screenRef = useRef<HTMLDivElement>(null)
  const barRef    = useRef<HTMLDivElement>(null)
  const countRef  = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const fallback = setTimeout(() => onComplete(), 3500)

    const tl = gsap.timeline({
      onComplete: () => { clearTimeout(fallback); onComplete() },
    })

    const count = { val: 0 }
    tl.to(count, {
      val: 100, duration: 1.8, ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.floor(count.val))
      },
    }, 0)
    tl.to(barRef.current, { scaleX: 1, duration: 1.8, ease: 'power2.inOut' }, 0)
    tl.to(screenRef.current, { opacity: 0, duration: 0.5, ease: 'power2.out' })

    return () => { clearTimeout(fallback); tl.kill() }
  }, [onComplete])

  return (
    <div ref={screenRef} id="lain-loader">
      <div className="lain-loader-wave">
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} className="lain-loader-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <div className="lain-loader-center">
        <div className="lain-loader-logo">lain<span>098_</span></div>
        <div className="lain-loader-bar-wrap">
          <div ref={barRef} className="lain-loader-bar" />
        </div>
        <div className="lain-loader-count"><span ref={countRef}>0</span><span className="lain-loader-pct">%</span></div>
      </div>
    </div>
  )
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
