// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StatCard
// Source: @arkzen:native:components:lynx:* (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T03:18:58.197Z
// ============================================================

import { useCallback, useEffect, useMemo, useState } from '@lynx-js/react'
import { Icon } from '../../../../arkzen/core/components/Icon'
import { WorkerRow } from './WorkerRow'

// ── StatCard ─────────────────────────────────────────────────

export const StatCard = ({ value, label, color = '#111827', bg = '#ffffff', borderColor = '#e5e7eb' }: {
  value: string | number
  label: string
  color?: string
  bg?: string
  borderColor?: string
}) => (
  <view className="flex-1 rounded-2xl border p-3.5" style={{ backgroundColor: bg, borderColor }}>
    <text className="text-[22px] font-bold" style={{ color }}>{value}</text>
    <text className="text-[11px] text-gray-400 font-medium" style={{ marginTop: 2 }}>{label}</text>
  </view>
)

// ── WorkerRow ────────────────────────────────────────────────
