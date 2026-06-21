// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — RoleBadge
// Source: @arkzen:native:components:lynx:* (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T12:05:09.730Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

// ── Role badge ────────────────────────────────────────────────
export const RoleBadge = ({ role }: { role: string }) => (
  <view className={`px-2.5 py-1 rounded-full ${role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
    <text className={`text-xs font-bold ${role === 'admin' ? 'text-purple-700' : 'text-blue-700'}`}>
      {role}
    </text>
  </view>
)
