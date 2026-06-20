// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxFeatureCard
// Source: @arkzen:native:components:lynx:* (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.505Z
// ============================================================

import React, { useState } from '@lynx-js/react'
import { Code, Layers, Palette, Zap } from 'lucide-react'
import { LYNX_COLOR_MAP } from './constants'
import type { LynxColor } from './types'

export const LynxFeatureCard = ({
  icon, title, description, color, onClick, expanded = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: LynxColor
  onClick?: () => void
  expanded?: boolean
}) => {
  const c = LYNX_COLOR_MAP[color]
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border-2 p-5 mb-3 cursor-pointer ${c.bg} ${c.border}`}
    >
      <div className="mb-2 text-2xl">{icon}</div>
      <div className={`font-bold text-base mb-1 ${c.text}`}>{title}</div>
      <div className={`text-sm leading-5 opacity-80 ${c.text}`}>{description}</div>
      {expanded && (
        <div className="mt-3 bg-white/60 rounded-xl p-3">
          <span className="text-xs text-neutral-500">Tap another card to explore more features.</span>
        </div>
      )}
    </div>
  )
}
