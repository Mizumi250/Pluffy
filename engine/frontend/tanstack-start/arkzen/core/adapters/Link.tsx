// ============================================================
// ARKZEN ADAPTER — Link (TanStack Start stack)
// TanStack Router uses <Link to="..."> from @tanstack/react-router.
// This wrapper accepts both `href` and `to` so shared layouts
// and utils.tsx work without changes across all stacks.
// ============================================================

import { Link as TSLink } from '@tanstack/react-router'
import React from 'react'

type LinkProps = {
  href?:      string
  to?:        string
  className?: string
  children:   React.ReactNode
  [key: string]: unknown
}

export const Link: React.FC<LinkProps> = ({ href, to, ...props }) => (
  <TSLink to={(to ?? href) as string} {...props} />
)

// ArkzenLink: used by shared BaseLayout — maps href → TanStack to
export const ArkzenLink: React.FC<LinkProps> = ({ href, to, ...props }) => (
  <TSLink to={(to ?? href) as string} {...props} />
)
