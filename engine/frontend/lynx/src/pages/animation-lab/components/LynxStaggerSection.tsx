// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxStaggerSection
// Source: @arkzen:native:components:lynx:* (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.090Z
// ============================================================

import { type ReactNode, useEffect, useRef, useState } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'
import { LynxDemoCard } from './LynxDemoCard'
import { LynxSectionHeader } from './LynxSectionHeader'

// ─── STAGGER SECTION ──────────────────────────────────────────────────────────

export const LynxStaggerSection = () => {
  const [show, setShow] = useState(false)
  const itemsRef = useRef([])
  const LETTERS = 'ABCDEF'.split('')

  const runStagger = () => {
    if (show) {
      // Reset
      itemsRef.current.forEach(ref => animate(ref, { scale: 0, opacity: 0 }, { duration: 200, easing: 'ease-in' }))
      setTimeout(() => setShow(false), 300)
    } else {
      // Show with stagger
      setShow(true)
      itemsRef.current.forEach((ref, i) => {
        animate(ref, { scale: 1, opacity: 1 }, { duration: 400, delay: i * 100, easing: 'spring', bounce: 0.3 })
      })
    }
  }

  return (
    <>
      <LynxSectionHeader icon="⋮" title="Stagger" subtitle="Staggered reveal with spring" color="#8b5cf6" />
      <LynxDemoCard title="Stagger Items" desc="Elements appear one by one" full>
        <button className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-xs font-bold mb-3" onPress={runStagger}>
          {show ? 'Hide' : 'Stagger In'}
        </button>
        {show && (
          <div className="flex flex-row flex-wrap gap-2 justify-center">
            {LETTERS.map((w, i) => (
              <div key={w} ref={el => itemsRef.current[i] = el}
                   className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold scale-0 opacity-0"
                   style={{ transform: 'scale(0)', opacity: 0 }}>
                {w}
              </div>
            ))}
          </div>
        )}
      </LynxDemoCard>
    </>
  )
}

// ─── PRESS SECTION ────────────────────────────────────────────────────────────
