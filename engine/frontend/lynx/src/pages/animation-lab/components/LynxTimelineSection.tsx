// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxTimelineSection
// Source: @arkzen:native:components:lynx:* (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.087Z
// ============================================================

import { type ReactNode, useEffect, useRef, useState } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'
import { LynxDemoCard } from './LynxDemoCard'
import { LynxSectionHeader } from './LynxSectionHeader'

// ─── TIMELINE SECTION ─────────────────────────────────────────────────────────

export const LynxTimelineSection = () => {
  const [step, setStep] = useState(0)
  const dotRefs = useRef([])

  const runTimeline = () => {
    setStep(0)
    // Reset all dots
    dotRefs.current.forEach((ref, i) => {
      animate(ref, { scale: 0, opacity: 0 }, { duration: 0, instant: true })
    })
    // Animate sequentially
    dotRefs.current.forEach((ref, i) => {
      animate(ref, { scale: 1, opacity: 1 }, { duration: 300, delay: i * 200, easing: 'spring' })
    })
    // Update step after all done
    setTimeout(() => setStep(5), dotRefs.current.length * 200 + 200)
  }

  return (
    <>
      <LynxSectionHeader icon="⏱" title="Timeline Sequence" subtitle="Sequential animation with delay" color="#a78bfa" />
      <LynxDemoCard title="Chained Timeline" desc="Sequential steps" full>
        <div className="flex flex-row gap-2 mb-3">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i}
                 ref={el => dotRefs.current[i] = el}
                 className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-purple-500 text-white scale-0 opacity-0`}
                 style={{ transform: 'scale(0)', opacity: 0 }}>
              {i + 1}
            </div>
          ))}
        </div>
        <div className="flex flex-row gap-2">
          <button className="px-4 py-2 rounded-lg bg-purple-500 text-white text-xs font-bold" onPress={runTimeline}>
            Play Timeline
          </button>
          <button className="px-3 py-2 rounded-lg bg-white/10 text-white/60 text-xs" onPress={() => { setStep(0); dotRefs.current.forEach(ref => animate(ref, { scale: 0, opacity: 0 }, { duration: 0, instant: true })) }}>
            Reset
          </button>
        </div>
      </LynxDemoCard>
    </>
  )
}

// ─── STAGGER SECTION ──────────────────────────────────────────────────────────
