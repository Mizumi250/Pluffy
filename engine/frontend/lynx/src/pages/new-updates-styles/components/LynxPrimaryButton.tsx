// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxPrimaryButton
// Source: @arkzen:native:components:lynx:* (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.503Z
// ============================================================

import React, { useState } from '@lynx-js/react'
import { Code, Layers, Palette, Zap } from 'lucide-react'

export const LynxPrimaryButton = ({
  label, onPress, disabled = false,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) => (
  <button
    onClick={onPress}
    disabled={disabled}
    className={`rounded-2xl py-4 px-6 text-white font-semibold text-base tracking-wide border-none cursor-pointer w-full ${
      disabled ? 'bg-blue-200' : 'bg-blue-600'
    }`}
  >
    {label}
  </button>
)
