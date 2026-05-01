// ============================================================
// ARKZEN — GuestLayout (React+Vite)
// For login/register pages — redirects to dashboard if already authed
// ============================================================
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface GuestLayoutProps {
  children: React.ReactNode
  guestOnly?: boolean
}

export function GuestLayout({ children, guestOnly }: GuestLayoutProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!guestOnly) return
    // Check if any auth cookie exists — if so redirect to dashboard
    const cookies = document.cookie.split(';').map(c => c.trim())
    const hasAuth = cookies.some(c => c.startsWith('arkzen-auth-'))
    if (hasAuth) {
      // Find which tatemono by cookie name
      const authCookie = cookies.find(c => c.startsWith('arkzen-auth-'))
      if (authCookie) {
        const tatName = authCookie.split('=')[0].replace('arkzen-auth-', '')
        navigate(`/${tatName}/dashboard`, { replace: true })
      }
    }
  }, [guestOnly, navigate])

  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
    </div>
  )
}