// ============================================================
// ARKZEN ADAPTER — Link (Astro stack)
// arkzen/core/adapters/Link.tsx
//
// Wraps a plain <a> as ArkzenLink so shared layouts and
// components can import { ArkzenLink } from '@/arkzen/core/adapters/Link'
// uniformly across all stacks.
//
// In Astro, the correct primitive for navigation inside React
// islands is a plain anchor tag. Astro's View Transitions API
// handles smooth page transitions automatically when
// <ViewTransitions /> is added to the page shell.
// No framework-specific Link component is needed.
// ============================================================

import React from 'react'

interface ArkzenLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children?: React.ReactNode
}

// ArkzenLink — used by shared BaseLayout and any shared component.
export const ArkzenLink: React.FC<ArkzenLinkProps> = ({ href, children, ...rest }) => {
  return <a href={href} {...rest}>{children}</a>
}

// Named Link export — satisfies imports that do: import { Link } from '...'
export const Link = ArkzenLink