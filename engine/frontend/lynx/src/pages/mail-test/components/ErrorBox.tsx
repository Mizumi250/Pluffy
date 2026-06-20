// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ErrorBox
// Source: @arkzen:native:components:lynx:* (mail-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:05.703Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { Icon } from '@sigx/lynx-icons'

// ── Error box ─────────────────────────────────────────────────
export const ErrorBox = ({ message }: { message: string }) => (
  <view className="flex-row items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
    <Icon set="lucide" name="x-circle" size={14} color="#ef4444" />
    <text className="text-xs text-red-600 flex-1">{message}</text>
  </view>
)

// ── Primary button ────────────────────────────────────────────
