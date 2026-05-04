// ============================================================
// ARKZEN — AuthLayout (React+Inertia)
// For protected pages.
// NOTE: Auth is enforced server-side by Laravel middleware.
// This layout is purely presentational — it wraps the page
// in the authenticated shell (nav, sidebar, etc.)
// No client-side redirect needed — Laravel handles it.
// ============================================================
import React from 'react'
import { usePage, router, Link } from '@inertiajs/react'
import type { InertiaSharedProps } from '@/arkzen/generated/pages'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { auth } = usePage<InertiaSharedProps>().props

  function handleLogout() {
    // Inertia form submission for CSRF-safe logout
    router.post(`/api/${window.__ARKZEN_TATEMONO__ ?? 'app'}/auth/logout`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0' }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ fontWeight: 600, fontSize: '15px', color: '#1a1a1a' }}>
          Arkzen
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {auth?.user && (
            <span style={{ fontSize: '13px', color: '#666' }}>
              {auth.user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              fontSize: '13px',
              color: '#666',
              background: 'none',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '4px 12px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page content */}
      <main>
        {children}
      </main>
    </div>
  )
}

declare global {
  interface Window { __ARKZEN_TATEMONO__?: string }
}