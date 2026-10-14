// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxSpringSection
// Source: @arkzen:native:components:lynx:* (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.099Z
// ============================================================

import { type ReactNode, useEffect, useRef, useState } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'
import { LynxDemoCard } from './LynxDemoCard'
import { LynxSectionHeader } from './LynxSectionHeader'

// ─── SPRING SECTION ──────────────────────────────────────────────────────────

export const LynxSpringSection = () => {
  const [big, setBig] = useState(false)
  const ballRef = useRef()

  const toggleSpring = () => {
    if (big) {
      animate(ballRef.current, { width: 48, height: 48 }, { duration: 500, easing: 'spring', damping: 15, stiffness: 200 })
      setBig(false)
    } else {
      animate(ballRef.current, { width: 96, height: 96 }, { duration: 500, easing: 'spring', damping: 10, stiffness: 150 })
      setBig(true)
    }
  }

  return (
    <>
      <LynxSectionHeader icon="⌇" title="Spring" subtitle="Spring physics" color="#3b82f6" />
      <LynxDemoCard title="Spring" desc="Tap to bounce" full>
        <button onPress={toggleSpring}>
          <div ref={ballRef} className="rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs w-12 h-12">
            {big ? '⌇' : ''}
          </div>
        </button>
      </LynxDemoCard>
    </>
  )
}

// ─── EASING SECTION ──────────────────────────────────────────────────────────
