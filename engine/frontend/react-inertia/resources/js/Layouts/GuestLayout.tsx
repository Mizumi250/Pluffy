// ============================================================
// ARKZEN — GuestLayout (React+Inertia)
// For login/register pages.
// NOTE: If user is already authenticated, Laravel middleware
// redirects them away before this page even renders.
// This layout is purely presentational.
// ============================================================
import React from 'react'

interface GuestLayoutProps {
  children: React.ReactNode
}

export function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f5f0 0%, #e8e8e2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 16px' }}>
        {children}
      </div>
    </div>
  )
}