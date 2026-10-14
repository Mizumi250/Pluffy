// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxEntranceSection
// Source: @arkzen:native:components:lynx:* (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.084Z
// ============================================================

import { type ReactNode, useEffect, useRef, useState } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'
import { LynxDemoCard } from './LynxDemoCard'
import { LynxPlayReset } from './LynxPlayReset'
import { LynxSectionHeader } from './LynxSectionHeader'

// ─── ENTRANCE SECTION ────────────────────────────────────────────────────────

export const LynxEntranceSection = () => {
  const box1Ref = useMotionValueRef()
  const box2Ref = useMotionValueRef()
  const box3Ref = useMotionValueRef()
  const [show, setShow] = useState(false)

  const runEntrance = () => {
    if (!show) {
      // Reset first
      animate(box1Ref.current, { opacity: 1, y: 0 }, { duration: 0, instant: true })
      animate(box2Ref.current, { opacity: 1, scaleX: 1 }, { duration: 0, instant: true })
      animate(box3Ref.current, { opacity: 1, x: 0 }, { duration: 0, instant: true })
      setShow(true)
      // Then animate them
      animate(box1Ref.current, { opacity: 1, y: 0 }, { duration: 800, easing: [0.34, 1.56, 0.64, 1] })
      animate(box2Ref.current, { opacity: 1, scaleX: 1 }, { duration: 700, delay: 100, easing: [0.34, 1.56, 0.64, 1] })
      animate(box3Ref.current, { opacity: 1, x: 0 }, { duration: 600, delay: 200, easing: 'ease-out' })
    } else {
      // Reset
      animate(box1Ref.current, { opacity: 0, y: 30 }, { duration: 300, easing: 'ease-in' })
      animate(box2Ref.current, { opacity: 0, scaleX: 0 }, { duration: 300, easing: 'ease-in' })
      animate(box3Ref.current, { opacity: 0, x: 40 }, { duration: 300, easing: 'ease-in' })
      setTimeout(() => setShow(false), 400)
    }
  }

  return (
    <>
      <LynxSectionHeader icon="▶" title="Entrance Animations" subtitle="with @lynx-js/motion" color="#6366f1" />
      <div className="flex flex-row flex-wrap px-3">
        <LynxDemoCard title="Fade In" desc="opacity 0→1">
          <div ref={box1Ref} className="w-12 h-8 rounded-lg bg-indigo-500 opacity-0" />
          <LynxPlayReset onPlay={runEntrance} onReset={runEntrance} />
        </LynxDemoCard>
        <LynxDemoCard title="Scale X" desc="scaleX 0→1">
          <div ref={box2Ref} className="w-12 h-8 rounded-lg bg-purple-500 scale-x-0" />
          <LynxPlayReset onPlay={runEntrance} onReset={runEntrance} />
        </LynxDemoCard>
        <LynxDemoCard title="Slide Right" desc="x 40→0">
          <div ref={box3Ref} className="w-12 h-8 rounded-lg bg-pink-500 opacity-0" style={{ transform: 'translateX(40px)' }} />
          <LynxPlayReset onPlay={runEntrance} onReset={runEntrance} />
        </LynxDemoCard>
      </div>
    </>
  )
}

// ─── TIMELINE SECTION ─────────────────────────────────────────────────────────
