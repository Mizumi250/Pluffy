// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxBadge
// Source: @arkzen:native:components:lynx:* (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:08:04.793Z
// ============================================================

import React, { useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'
import '../../../arkzen/generated/new-updates-styles.lynx-styles.css'

export const LynxBadge = ({ label }: { label: string }) => (
  <view className="px-3 py-1 bg-blue-100 rounded-full self-start">
    <text className="text-xs font-semibold text-blue-600 tracking-wide">{label}</text>
  </view>
)
