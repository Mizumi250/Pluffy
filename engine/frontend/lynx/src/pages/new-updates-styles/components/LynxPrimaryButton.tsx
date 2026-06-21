// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxPrimaryButton
// Source: @arkzen:native:components:lynx:* (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T02:50:31.627Z
// ============================================================

import { useState } from '@lynx-js/react'
import { Icon } from '../../../../arkzen/core/components/Icon'
import '../../../arkzen/generated/new-updates-styles.lynx-styles.css'

export const LynxPrimaryButton = ({
  label,
  onPress,
  disabled = false,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) => (
  <view
    bindtap={disabled ? undefined : onPress}
    className={`rounded-2xl py-4 px-6 items-center w-full ${disabled ? 'bg-blue-200' : 'bg-blue-600'}`}
  >
    <text className={`text-white font-semibold text-base tracking-wide ${disabled ? 'opacity-60' : ''}`}>
      {label}
    </text>
  </view>
)
