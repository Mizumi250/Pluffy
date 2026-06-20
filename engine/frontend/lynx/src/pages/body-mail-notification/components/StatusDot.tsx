// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — StatusDot
// Source: @arkzen:native:components:lynx:* (body-mail-notification)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:07:59.834Z
// ============================================================

import React, { useCallback, useEffect, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { Icon } from '@sigx/lynx-icons'

// ── Status dot ────────────────────────────────────────────────
export const StatusDot = ({ status }: { status: string }) => (
  <view className={`inline-block w-2 h-2 rounded-full mr-1.5 ${status === 'sent' ? 'bg-green-500' : 'bg-red-500'}`} />
)
