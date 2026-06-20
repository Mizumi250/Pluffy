// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — new-updates-styles
// Source: @arkzen:native:components:lynx:* (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:08:04.786Z
// ============================================================

import React, { useState } from '@lynx-js/react'
import { Icon } from '@sigx/lynx-icons'

export const getLynxIcon = (name: string, color: string) => {
  const colorMap: Record<string, string> = {
    blue: '#2563eb',
    purple: '#7c3aed',
    green: '#059669',
    orange: '#ea580c',
  }
  return <Icon set="lucide" name={name} size={24} color={colorMap[color] || '#000'} />
}
