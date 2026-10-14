// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxPlayReset
// Source: @arkzen:native:components:lynx:* (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.082Z
// ============================================================

import { type ReactNode, useEffect, useRef, useState } from '@lynx-js/react'
import { animate, useMotionValueRef } from '@lynx-js/motion'

// ─── PLAY/RESET BUTTONS ───────────────────────────────────────────────────────
export const LynxPlayReset = ({ onPlay, onReset }: { onPlay: () => void; onReset: () => void }) => (
  <div className="flex flex-row gap-2 items-center justify-center mt-2">
    <button className="flex flex-row items-center gap-1 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold text-xs" onPress={onPlay}>
      <span>▶</span> Play
    </button>
    <button className="flex flex-row items-center gap-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white/60 text-xs" onPress={onReset}>
      <span>↺</span> Reset
    </button>
  </div>
)

// ─── ENTRANCE SECTION ────────────────────────────────────────────────────────
