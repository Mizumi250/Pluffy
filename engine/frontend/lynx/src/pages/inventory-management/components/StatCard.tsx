// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StatCard
// Source: @arkzen:native:components:lynx:* (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:04.215Z
// ============================================================

import { useCallback, useEffect, useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'

// ── Stat card ─────────────────────────────────────────────────
export const StatCard = ({
  label, value, icon, bg,
}: {
  label: string; value: string | number
  icon: React.ReactNode; bg: string
}) => (
  <view className={`flex-1 ${bg} rounded-2xl p-3.5 items-center gap-1.5`}>
    {icon}
    <text className="text-lg font-bold text-neutral-900">{value}</text>
    <text className="text-xs text-neutral-500 text-center">{label}</text>
  </view>
)

// ── Stock badge ───────────────────────────────────────────────
