// ============================================================
// ARKZEN ENGINE — SHARED BLANK LAYOUT v1.0
// Zero wrapper. Complete freedom.
// Use for landing pages, awwwards-level designs, full canvas.
// No router dependency — safe for all stacks.
// ============================================================

import React from 'react'

export interface BlankLayoutProps {
  children: React.ReactNode
  auth?:    boolean
}

export const BlankLayout: React.FC<BlankLayoutProps> = ({ children }) => {
  return <>{children}</>
}
