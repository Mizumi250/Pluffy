// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxEasingSection
// Source: @arkzen:native:components:lynx:* (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.101Z
// ============================================================

import { type ReactNode, useEffect, useRef, useState } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'
import { LynxDemoCard } from './LynxDemoCard'
import { LynxSectionHeader } from './LynxSectionHeader'

// ─── EASING SECTION ──────────────────────────────────────────────────────────

export const LynxEasingSection = () => {
  const barRefs = useRef([])
  const easings = ['linear', 'ease-in', 'ease-out', 'ease-in-out']

  const runEasingDemo = () => {
    barRefs.current.forEach((ref, i) => {
      animate(ref, { width: '100%' }, {
        duration: 800,
        easing: easings[i] === 'linear' ? 'linear' :
                easings[i] === 'ease-in' ? [0.42, 0, 1, 1] :
                easings[i] === 'ease-out' ? [0, 0, 0.58, 1] :
                [0.42, 0, 0.58, 1],
        onComplete: () => {
          setTimeout(() => animate(ref, { width: '50%' }, { duration: 300, easing: 'ease-in' }), 500)
        }
      })
    })
  }

  return (
    <>
      <LynxSectionHeader icon="⌗" title="Easing" subtitle="Transition curves" color="#ef4444" />
      <div className="flex flex-row flex-wrap px-3">
        {easings.map((e, i) => (
          <LynxDemoCard key={e} title={e} desc="Tap to run">
            <div className="w-24 h-3 rounded-full bg-red-200 overflow-hidden">
              <div ref={el => barRefs.current[i] = el} className="h-full bg-red-500 w-1/2" />
            </div>
            <button className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded" onPress={runEasingDemo}>Run</button>
          </LynxDemoCard>
        ))}
      </div>
    </>
  )
}
