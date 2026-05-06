// ============================================================
// ARKZEN ADAPTER — Link (Next.js stack)
// Wraps next/link as a named export so shared layouts and
// utils can import { ArkzenLink } from '@/arkzen/core/adapters/Link'
// uniformly across all stacks.
// ============================================================

import NextLink from 'next/link'
import React from 'react'

export { default as Link } from 'next/link'

// ArkzenLink: used by shared BaseLayout and any shared component
// that needs navigation links. Maps href → next/link.
export const ArkzenLink: React.FC<React.ComponentProps<typeof NextLink>> = (props) => {
  return <NextLink {...props} />
}
