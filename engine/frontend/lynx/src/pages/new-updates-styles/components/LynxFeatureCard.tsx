// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxFeatureCard
// Source: @arkzen:native:components:lynx:* (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T05:22:15.067Z
// ============================================================

import { type ReactNode, useState } from '@lynx-js/react'
import { Icon } from '../../../../arkzen/core/components/Icon'
import { LYNX_COLOR_MAP } from './constants'
import '../../../arkzen/generated/new-updates-styles.lynx-styles.css'
import type { LynxColor } from './types'

export const LynxFeatureCard = ({
  icon, title, description, color, onPress, expanded = false,
}: {
  icon: ReactNode
  title: string
  description: string
  color: LynxColor
  onPress?: () => void
  expanded?: boolean
}) => {
  const c = LYNX_COLOR_MAP[color]
  return (
    <view
      bindtap={onPress}
      className={`rounded-2xl border-2 p-5 mb-3 ${c.bg} ${c.border}`}
    >
      <view className="mb-2">{icon}</view>
      <text className={`font-bold text-base mb-1 ${c.text}`}>{title}</text>
      <text className={`text-sm leading-5 opacity-80 ${c.text}`}>{description}</text>
      {expanded && (
        <view className="mt-3 bg-white/60 rounded-xl p-3">
          <text className="text-xs text-neutral-500">Tap another card to explore more features.</text>
        </view>
      )}
    </view>
  )
}
