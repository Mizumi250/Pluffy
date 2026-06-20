// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — RoleBadge
// Source: @arkzen:native:components:lynx:* (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.991Z
// ============================================================

import React from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import React, { useEffect, useState } from 'react'

// ── Role badge ────────────────────────────────────────────────
export const RoleBadge = ({ role }: { role: string }) => (
  <div className={`px-2.5 py-1 rounded-full inline-block text-xs font-bold ${
    role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
  }`}>
    {role}
  </div>
)
