// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxTransformsSection
// Source: @arkzen:native:components:lynx:* (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.097Z
// ============================================================

import { type ReactNode, useEffect, useRef, useState } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'
import { LynxDemoCard } from './LynxDemoCard'
import { LynxSectionHeader } from './LynxSectionHeader'

// ─── TRANSFORMS SECTION ──────────────────────────────────────────────────────

export const LynxTransformsSection = () => {
  const [transformed, setTransformed] = useState(false)
  const boxRef = useRef()

  const toggleTransform = () => {
    if (transformed) {
      animate(boxRef.current, { rotate: 0, scale: 1, y: 0 }, { duration: 300, easing: 'ease-in-out' })
      setTransformed(false)
    } else {
      animate(boxRef.current, { rotate: 45, scale: 1.2, y: -8 }, { duration: 400, easing: 'spring' })
      setTransformed(true)
    }
  }

  return (
    <>
      <LynxSectionHeader icon="⟳" title="Transforms" subtitle="Translate, rotate, scale" color="#10b981" />
      <LynxDemoCard title="Transform" desc="Tap to transform" full>
        <button onPress={toggleTransform}>
          <div ref={boxRef} className="w-16 h-16 rounded-xl bg-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold">⟳</span>
          </div>
        </button>
      </LynxDemoCard>
    </>
  )
}

// ─── SPRING SECTION ──────────────────────────────────────────────────────────
