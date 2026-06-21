// ============================================================
// ARKZEN GENERATED UTILITIES — new-updates-styles
// Source: @arkzen:components (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T12:05:14.954Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Layers, Menu, Palette, X, Zap } from 'lucide-react'
import Link from 'next/link'

export const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    zap:     <Zap size={32} />,
    code:    <Code size={32} />,
    palette: <Palette size={32} />,
    layers:  <Layers size={32} />,
  }
  return icons[iconName] || null
}
