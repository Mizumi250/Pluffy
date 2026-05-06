// ============================================================
// ARKZEN ADAPTER — Link (React+Vite stack)
// react-router-dom uses `to` prop instead of `href`.
// This wrapper accepts both so shared layouts and utils.tsx
// work without changes — it passes href, we map it to `to`.
// ============================================================
import { Link as RRLink } from 'react-router-dom'
import React from 'react'

type LinkProps = {
  href?:      string
  to?:        string
  className?: string
  children:   React.ReactNode
  [key: string]: unknown
}

export const Link: React.FC<LinkProps> = ({ href, to, ...props }) => (
  <RRLink to={(to ?? href) as string} {...props} />
)

// ArkzenLink: used by shared BaseLayout — maps href → react-router to
export const ArkzenLink: React.FC<LinkProps> = ({ href, to, ...props }) => (
  <RRLink to={(to ?? href) as string} {...props} />
)
