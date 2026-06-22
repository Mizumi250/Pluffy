// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StatCard
// Source: @arkzen:native:components:lynx:* (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T00:05:28.804Z
// ============================================================

import { type ReactNode, useCallback, useEffect, useState } from '@lynx-js/react'
import { Icon } from '../../../../arkzen/core/components/Icon'

// ── Stat card ─────────────────────────────────────────────────
export const StatCard = ({
  label, value, icon, bg,
}: {
  label: string; value: string | number
  icon: ReactNode; bg: string
}) => (
  <view className={`flex-1 ${bg} rounded-2xl p-3.5 items-center gap-1.5`}>
    {icon}
    <text className="text-lg font-bold text-neutral-900">{value}</text>
    <text className="text-xs text-neutral-500 text-center">{label}</text>
  </view>
)

// ── Stock badge ───────────────────────────────────────────────
