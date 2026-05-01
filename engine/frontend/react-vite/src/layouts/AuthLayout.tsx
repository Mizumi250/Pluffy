// ============================================================
// ARKZEN — AuthLayout (React+Vite)
// For protected pages — redirects to login if not authed
// ============================================================
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthLayout({ children, requireAuth }: AuthLayoutProps) {
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
      navigate(`/${tatName}/login`, { replace: true })
    } else {
      setChecked(true)
    }
  }, [requireAuth, navigate, location])

  if (requireAuth && !checked) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f5f5f0',
      }}>
        <div style={{ fontSize: '13px', color: '#aaa', fontFamily: 'system-ui' }}>
          Checking auth...
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
    </div>
  )
}