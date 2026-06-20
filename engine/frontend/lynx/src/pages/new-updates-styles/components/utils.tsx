// ============================================================
// ARKZEN GENERATED LYNX UTILITY FUNCTIONS — new-updates-styles
// Source: @arkzen:native:components:lynx:* (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.499Z
// ============================================================

import React, { useState } from '@lynx-js/react'
import { Code, Layers, Palette, Zap } from 'lucide-react'

export const getLynxIcon = (name: string) => {
  switch (name) {
    case 'zap':     return <Zap size={24} />
    case 'code':    return <Code size={24} />
    case 'palette': return <Palette size={24} />
    case 'layers':  return <Layers size={24} />
    default:        return null
  }
}
