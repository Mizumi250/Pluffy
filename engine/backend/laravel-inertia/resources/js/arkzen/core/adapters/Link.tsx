// ============================================================
// ARKZEN ADAPTER — Link (React+Inertia stack)
// @inertiajs/react uses `href` natively — no prop remapping needed.
// This wrapper keeps the same interface as other stacks so shared
// layouts and utils.tsx work without changes.
// ============================================================
import { Link as InertiaLink } from '@inertiajs/react'
import React from 'react'

type LinkProps = {
  href?:      string
  to?:        string
  className?: string
  children:   React.ReactNode
  [key: string]: unknown
}

export const Link: React.FC<LinkProps> = ({ href, to, ...props }) => (
  <InertiaLink href={(href ?? to) as string} {...props} />
)

// ArkzenLink: used by shared BaseLayout — maps to prop → href for Inertia
export const ArkzenLink: React.FC<LinkProps> = ({ href, to, ...props }) => (
  <InertiaLink href={(href ?? to) as string} {...props} />
)
