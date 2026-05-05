// ============================================================
// ARKZEN ADAPTER — Link (React+Vite stack)
// react-router-dom uses `to` prop instead of `href`.
// This wrapper accepts both so shared utils.tsx (Breadcrumb)
// works without changes — it passes href, we map it to `to`.
// ============================================================
import { Link as RRLink } from 'react-router-dom'
import React from 'react'

export const Link: React.FC<{
  href?:      string
  to?:        string
  className?: string
  children:   React.ReactNode
}> = ({ href, to, ...props }) => (
  <RRLink to={(to ?? href) as string} {...props} />
)
