// ============================================================
// ARKZEN GENERATED LYNX ANIMATIONS — jo-payroll
// Source: @arkzen:native:animation:lynx
// DO NOT EDIT DIRECTLY.
// Generated: 2026-10-14T08:58:40.910Z
// ============================================================

import { useState, useEffect } from '@lynx-js/react'

// Lynx uses CSS transitions via style objects; no Reanimated equivalent.
// Use state-driven opacity + translateY for enter animations.
export const useFadeSlideIn = (delay = 0) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [])

  return {
    style: {
      opacity: visible ? 1 : 0,
      transform: [{ translateY: visible ? 0 : 16 }],
      transition: 'opacity 350ms ease-out, transform 350ms ease-out',
    },
  }
}
