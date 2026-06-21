// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — new-updates-styles
// Source: @arkzen:native:components:lynx:* (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:57.173Z
// ============================================================

import { useState } from '@lynx-js/react'
import Icon from '@sigx/lynx-icons-lucide'

export const getLynxIcon = (name: string, color: string) => {
  const colorMap: Record<string, string> = {
    blue: '#2563eb',
    purple: '#7c3aed',
    green: '#059669',
    orange: '#ea580c',
  }
  return <Icon set="lucide" name={name} size={24} color={colorMap[color] || '#000'} />
}
