// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — SearchBar
// Source: @arkzen:native:components:lynx:* (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T15:23:55.711Z
// ============================================================

import { useCallback, useEffect, useMemo, useState } from '@lynx-js/react'
import { Icon } from 'sigx/lynx-icons-lucide'
import { TabRow } from './TabRow'

// ── SearchBar ────────────────────────────────────────────────

export const SearchBar = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <view className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5" style={{ gap: 8 }}>
    <Icon set="lucide" name="search" size={14} color="#9ca3af" />
    <input
      value={value}
      bindinput={e => onChange(e.detail.value)}
      placeholder={placeholder ?? 'Search…'}
      className="flex-1 text-[13px] text-gray-900"
    />
  </view>
)

// ── TabRow ───────────────────────────────────────────────────
