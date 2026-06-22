// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ErrorBox
// Source: @arkzen:native:components:lynx:* (roles-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T07:06:52.063Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'

// ── Error box ─────────────────────────────────────────────────
export const ErrorBox = ({ message }: { message: string }) => (
  <view className="p-3 bg-red-50 border border-red-100 rounded-xl">
    <text className="text-xs text-red-600">{message}</text>
  </view>
)

// ── Primary button ─────────────────────────────────────────────
