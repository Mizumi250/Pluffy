// ============================================================
// ARKZEN — AuthLayout (React+Vite)
// For protected pages — redirects to login if not authed
// ============================================================
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  className?: string
}

export function AuthLayout({
  children,
  requireAuth = false,
  redirectTo,
  className = '',
}: AuthLayoutProps) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!requireAuth) { setChecked(true); return }

    const segments = location.pathname.split('/').filter(Boolean)
    const tatName  = segments[0]

    const cookies  = document.cookie.split(';').map(c => c.trim())
    const hasAuth  = cookies.some(c => c.startsWith(`arkzen-auth-${tatName}=`))

    if (!hasAuth) {
      const destination = redirectTo ?? (tatName ? `/${tatName}/login` : '/login')
      navigate(destination, { replace: true })
    } else {
      setChecked(true)
    }
  }, [location.pathname, navigate, redirectTo, requireAuth])

  if (requireAuth && !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-700 dark:border-neutral-700 dark:border-t-neutral-200 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}
