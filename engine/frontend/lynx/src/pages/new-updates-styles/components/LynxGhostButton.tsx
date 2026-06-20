// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxGhostButton
// Source: @arkzen:native:components:lynx:* (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.503Z
// ============================================================

import React, { useState } from '@lynx-js/react'
import { Code, Layers, Palette, Zap } from 'lucide-react'

export const LynxGhostButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <button
    onClick={onPress}
    className="rounded-2xl py-4 px-6 text-neutral-600 font-medium text-base border border-neutral-200 bg-transparent cursor-pointer w-full"
  >
    {label}
  </button>
)
