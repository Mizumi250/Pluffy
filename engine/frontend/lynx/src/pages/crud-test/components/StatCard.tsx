// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StatCard
// Source: @arkzen:native:components:lynx:* (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T00:05:28.077Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'
import type { Item } from './types'

// ── Stat card ─────────────────────────────────────────────────
export const StatCard = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <view className="flex-1 bg-white rounded-2xl border border-neutral-100 p-3 items-center">
    <text className={`text-xl font-bold ${accent}`}>{value}</text>
    <text className="text-xs text-neutral-400 mt-0.5">{label}</text>
  </view>
)

// ── Item row ──────────────────────────────────────────────────
