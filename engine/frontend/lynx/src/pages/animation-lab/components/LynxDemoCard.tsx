// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxDemoCard
// Source: @arkzen:native:components:lynx:* (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.080Z
// ============================================================

import { type ReactNode, useEffect, useRef, useState } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'

// ─── DEMO CARD ─────────────────────────────────────────────────────────────────
export const LynxDemoCard = ({ title, desc, full = false, children }: {
  title: string; desc: string; full?: boolean; children: ReactNode
}) => (
  <div className={`${full ? 'mx-4 mb-3' : 'w-[46%] m-1'} bg-white/5 border border-white/10 rounded-xl overflow-hidden`}>
    <div className="px-3 py-2 border-b border-white/5">
      <div className="text-xs font-bold text-white/90">{title}</div>
      <div className="text-[10px] text-white/35">{desc}</div>
    </div>
    <div className="p-4 min-h-[70px] flex flex-col items-center justify-center gap-2">
      {children}
    </div>
  </div>
)

// ─── PLAY/RESET BUTTONS ───────────────────────────────────────────────────────
