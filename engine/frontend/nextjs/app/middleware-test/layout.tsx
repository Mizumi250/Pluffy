// ============================================================
// ARKZEN GENERATED LAYOUT — middleware-test [Next.js]
// Auto-generated from @arkzen:meta:web — do not edit directly.
// ============================================================
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'middleware-test',
  description: 'Tests MiddlewareBuilder v7.0 body injection. Declares [requireJson] with real logic injected via @arkzen:middleware:requireJson DSL block. Also tests alias registration fix — previously requireJson was never registered as an alias so Laravel 500\'d at runtime.',
  openGraph: {
    type: 'website',
    title: 'middleware-test',
    description: 'Tests MiddlewareBuilder v7.0 body injection. Declares [requireJson] with real logic injected via @arkzen:middleware:requireJson DSL block. Also tests alias registration fix — previously requireJson was never registered as an alias so Laravel 500\'d at runtime.',
  },
}

export default function MiddlewareTestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
