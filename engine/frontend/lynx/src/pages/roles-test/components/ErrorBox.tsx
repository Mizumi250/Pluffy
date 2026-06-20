// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ErrorBox
// Source: @arkzen:native:components:lynx:* (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.987Z
// ============================================================

import React from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import React, { useEffect, useState } from 'react'

// ── Error box ─────────────────────────────────────────────────
export const ErrorBox = ({ message }: { message: string }) => (
  <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
    <p className="text-xs text-red-600">{message}</p>
  </div>
)

// ── Primary button ─────────────────────────────────────────────
