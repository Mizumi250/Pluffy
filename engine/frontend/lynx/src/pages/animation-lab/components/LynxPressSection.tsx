// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxPressSection
// Source: @arkzen:native:components:lynx:* (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.093Z
// ============================================================

import { type ReactNode, useEffect, useRef, useState } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'
import { LynxDemoCard } from './LynxDemoCard'
import { LynxSectionHeader } from './LynxSectionHeader'

// ─── PRESS SECTION ────────────────────────────────────────────────────────────

export const LynxPressSection = () => {
  const [pressed, setPressed] = useState(false)
  const [scale, setScale] = useState(1)

  const handlePress = () => {
    setPressed(true)
    animate(null, { scale: 1.2 }, { duration: 150, easing: 'spring', onComplete: () => {
      animate(null, { scale: 1 }, { duration: 150, easing: 'spring' })
      setPressed(false)
    } })
  }

  return (
    <>
      <LynxSectionHeader icon="⊙" title="Press Feedback" subtitle="Spring on tap" color="#ec4899" />
      <LynxDemoCard title="Press Me" desc="Spring scale on press" full>
        <button onPress={handlePress} className="w-24 h-24 rounded-2xl flex items-center justify-center bg-pink-500">
          <span className="text-3xl">👆</span>
        </button>
      </LynxDemoCard>
    </>
  )
}

// ─── LOOP SECTION ─────────────────────────────────────────────────────────────
