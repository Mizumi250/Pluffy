// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — TabRow
// Source: @arkzen:native:components:lynx:* (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:55.648Z
// ============================================================

import { useCallback, useEffect, useMemo, useState } from '@lynx-js/react'
import { Icon } from 'sigx/lynx-icons-lucide'

// ── TabRow ───────────────────────────────────────────────────

export const TabRow = ({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) => (
  <view className="flex-row flex-wrap" style={{ gap: 4 }}>
    {tabs.map(t => (
      <view
        key={t}
        bindtap={() => onChange(t)}
        className={`rounded-lg px-3 py-1.5 ${active === t ? 'bg-[#171717]' : 'bg-transparent'}`}
      >
        <text className={`text-xs font-semibold ${active === t ? 'text-white' : 'text-gray-400'}`}>{t}</text>
      </view>
    ))}
  </view>
)
