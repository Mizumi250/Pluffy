// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxSectionHeader
// Source: @arkzen:native:components:lynx:* (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.078Z
// ============================================================

import { type ReactNode, useEffect, useRef, useState } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export const LynxSectionHeader = ({
  icon, title, subtitle, color
}: {
  icon: string; title: string; subtitle: string; color: string
}) => (
  <div className="flex flex-row items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl mx-4 mb-3">
    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}22` }}>
      <span className="text-base">{icon}</span>
    </div>
    <div className="flex-1">
      <div className="text-sm font-extrabold text-white">{title}</div>
      <div className="text-xs text-white/40">{subtitle}</div>
    </div>
  </div>
)

// ─── DEMO CARD ─────────────────────────────────────────────────────────────────
