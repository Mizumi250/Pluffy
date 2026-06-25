// ============================================================
// ARKZEN GENERATED COMPONENT — LainCursor [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T13:56:58.493Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cursorRef, move, ref, ringRef } from './utils'

// ─── CURSOR ───────────────────────────────────────────────────────────────────

export const LainCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top  = e.clientY + 'px'
      }
      setTimeout(() => {
        if (ringRef.current) {
          ringRef.current.style.left = e.clientX + 'px'
          ringRef.current.style.top  = e.clientY + 'px'
        }
      }, 55)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <div ref={cursorRef} className="lain-cursor" />
      <div ref={ringRef}   className="lain-cursor-ring" />
    </>
  )
}

// ─── LOADER ───────────────────────────────────────────────────────────────────
