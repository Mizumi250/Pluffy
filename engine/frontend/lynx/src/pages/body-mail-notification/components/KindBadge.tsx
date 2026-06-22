// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — KindBadge
// Source: @arkzen:native:components:lynx:* (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T03:18:55.445Z
// ============================================================

import { useCallback, useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

// ── Kind badge ────────────────────────────────────────────────
export const KindBadge = ({ kind }: { kind: string }) => (
  <view className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${kind === 'mail' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
    <text className={`text-xs font-bold ${kind === 'mail' ? 'text-blue-700' : 'text-yellow-700'}`}>
      {kind === 'mail' ? '✉ MAIL' : '🔔 NOTIF'}
    </text>
  </view>
)

// ── Status dot ────────────────────────────────────────────────
