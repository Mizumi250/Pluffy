// ============================================================
// ARKZEN — GuestLayout (React+Vite)
// For login/register pages — redirects to dashboard if already authed
// ============================================================
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface GuestLayoutProps {
  children: React.ReactNode
  redirectIfAuth?: boolean
  guestOnly?: boolean
  redirectTo?: string
  className?: string
}

export function GuestLayout({
  children,
  redirectIfAuth = false,
  guestOnly = false,
  redirectTo,
  className = '',
}: GuestLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const shouldGuard = redirectIfAuth || guestOnly

  useEffect(() => {
    if (!shouldGuard) return

    const cookies = document.cookie.split(';').map(c => c.trim())
    const hasAuth = cookies.some(c => c.startsWith('arkzen-auth-'))

    if (hasAuth) {
      const authCookie = cookies.find(c => c.startsWith('arkzen-auth-'))
      if (authCookie) {
        const tatName = authCookie.split('=')[0].replace('arkzen-auth-', '')
        const fallbackTatName = location.pathname.split('/').filter(Boolean)[0]
        const targetTatName = tatName || fallbackTatName
        const destination = redirectTo ?? (targetTatName ? `/${targetTatName}/dashboard` : '/dashboard')
        navigate(destination, { replace: true })
      }
    }
  }, [location.pathname, navigate, redirectTo, shouldGuard])

  return (
    <div className={className}>
      {children}
    </div>
  )
}
