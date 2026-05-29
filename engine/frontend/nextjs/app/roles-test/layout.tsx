// ============================================================
// ARKZEN GENERATED LAYOUT — roles-test [Next.js]
// Auto-generated from @arkzen:meta:web — do not edit directly.
// ============================================================
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'roles-test',
  description: 'Tests role-based access control with real Sanctum auth. Two roles (admin, user), protected routes, role-gated UI. v2.1: middleware now declares [auth, role:admin] at the DSL level to exercise MiddlewareBuilder v6.0 scoped CheckRole generation.',
  openGraph: {
    type: 'website',
    title: 'roles-test',
    description: 'Tests role-based access control with real Sanctum auth. Two roles (admin, user), protected routes, role-gated UI. v2.1: middleware now declares [auth, role:admin] at the DSL level to exercise MiddlewareBuilder v6.0 scoped CheckRole generation.',
  },
}

export default function RolesTestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
