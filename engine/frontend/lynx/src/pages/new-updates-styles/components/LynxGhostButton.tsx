// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxGhostButton
// Source: @arkzen:native:components:lynx:* (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:08:04.974Z
// ============================================================

import React, { useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'
import '../../../arkzen/generated/new-updates-styles.lynx-styles.css'

export const LynxGhostButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <view
    bindtap={onPress}
    className="rounded-2xl py-4 px-6 items-center border border-neutral-200 w-full"
  >
    <text className="text-neutral-600 font-medium text-base">{label}</text>
  </view>
)
