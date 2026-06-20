// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ErrorBox
// Source: @arkzen:native:components:lynx:* (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:07:59.827Z
// ============================================================

import React, { useCallback, useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { Icon } from '@sigx/lynx-icons'

// ── Error box ─────────────────────────────────────────────────
export const ErrorBox = ({ message }: { message: string }) => (
  <view className="p-3 bg-red-50 border border-red-100 rounded-xl">
    <text className="text-xs text-red-600">{message}</text>
  </view>
)

// ── Primary button ────────────────────────────────────────────
