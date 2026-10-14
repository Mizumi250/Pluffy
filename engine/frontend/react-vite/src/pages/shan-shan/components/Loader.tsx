// ============================================================
// ARKZEN GENERATED COMPONENT — Loader [React+Vite]
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T14:10:34.043Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const barRef    = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const countRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fallback = setTimeout(() => onComplete(), 3000)

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(fallback)
        onComplete()
      },
    })

    let count = { val: 0 }
    tl.to(count, {
      val: 100,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = Math.floor(count.val) + ''
      },
    }, 0)

    tl.to(barRef.current, {
      width: '100%',
      duration: 1.4,
      ease: 'power2.inOut',
    }, 0)

    .to(barRef.current, {
      height: '100vh',
      duration: 0.4,
      ease: 'power3.in',
    })

    .to(screenRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    })

    return () => {
      clearTimeout(fallback)
      tl.kill()
    }
  }, [onComplete])

  return (
    <div ref={screenRef} id="shan-loader">
      <div ref={barRef} id="shan-loader-bar" />
      <div id="shan-loader-count" ref={countRef}>0</div>
      <div id="shan-loader-label">SHAN SABAL CEZAR</div>
    </div>
  )
};
