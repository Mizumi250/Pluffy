// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StatusBadge
// Source: @arkzen:native:components:lynx:* (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T07:06:47.557Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'

// ── Status badge ──────────────────────────────────────────────
export const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active:   { bg: 'bg-green-100',   text: 'text-green-700'   },
    pending:  { bg: 'bg-yellow-100',  text: 'text-yellow-700'  },
    archived: { bg: 'bg-neutral-100', text: 'text-neutral-500' },
  }[status] ?? { bg: 'bg-neutral-100', text: 'text-neutral-600' }

  return (
    <view className={`px-2 py-0.5 rounded-md ${styles.bg}`}>
      <text className={`text-xs font-medium ${styles.text}`}>{status}</text>
    </view>
  )
}

// ── Stat card ─────────────────────────────────────────────────
