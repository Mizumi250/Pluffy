// ============================================================
// ARKZEN ADAPTER — Link (React+Inertia stack)
// Inertia's Link uses `href` like Next.js so this is a
// thin wrapper that also accepts `to` for consistency.
// ============================================================
import { Link as InertiaLink } from '@inertiajs/react'
import React from 'react'

export const Link: React.FC<{
  href?:      string
  to?:        string
  className?: string
  children:   React.ReactNode
}> = ({ href, to, ...props }) => (
  <InertiaLink href={(href ?? to) as string} {...props} />
)
