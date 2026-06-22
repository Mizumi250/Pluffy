// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxBadge
// Source: @arkzen:native:components:lynx:* (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T05:22:15.045Z
// ============================================================

import { type ReactNode, useState } from '@lynx-js/react'
import { Icon } from '../../../../arkzen/core/components/Icon'
import '../../../arkzen/generated/new-updates-styles.lynx-styles.css'

export const LynxBadge = ({ label }: { label: string }) => (
  <view className="px-3 py-1 bg-blue-100 rounded-full self-start">
    <text className="text-xs font-semibold text-blue-600 tracking-wide">{label}</text>
  </view>
)
