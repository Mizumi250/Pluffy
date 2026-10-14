// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxLoopSection
// Source: @arkzen:native:components:lynx:* (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.095Z
// ============================================================

import { type ReactNode, useEffect, useRef, useState } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'
import { LynxDemoCard } from './LynxDemoCard'
import { LynxSectionHeader } from './LynxSectionHeader'

// ─── LOOP SECTION ─────────────────────────────────────────────────────────────

export const LynxLoopSection = () => {
  const [spinning, setSpinning] = useState(false)
  const spinRef = useRef()

  const toggleSpin = () => {
    if (spinning) {
      animate(spinRef.current, { rotate: 0 }, { duration: 0, instant: true })
      setSpinning(false)
    } else {
      setSpinning(true)
      animate(spinRef.current, { rotate: 360 }, { duration: 2000, repeat: Infinity, easing: 'linear' })
    }
  }

  return (
    <>
      <LynxSectionHeader icon="∞" title="Loop" subtitle="Infinite rotate" color="#f59e0b" />
      <LynxDemoCard title="Spin" desc="Infinite rotation" full>
        <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold mb-3" onPress={toggleSpin}>
          {spinning ? 'Stop' : 'Spin'}
        </button>
        <div ref={spinRef} className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 flex items-center justify-center">
          <span className="text-xs text-amber-500 font-bold">∞</span>
        </div>
      </LynxDemoCard>
    </>
  )
}

// ─── TRANSFORMS SECTION ──────────────────────────────────────────────────────
