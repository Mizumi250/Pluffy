'use client'
// ARKZEN CUSTOM LAYOUT — queue-flow/app
// Generated from tatemono: queue-flow

import React, { useState } from 'react'
import { LayoutGrid, Settings, Ticket, WifiOff } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/queue-flow',        icon: LayoutGrid, label: 'Display'  },
  { href: '/queue-flow/join',   icon: Ticket,     label: 'Join'     },
  { href: '/queue-flow/admin',  icon: Settings,   label: 'Admin'    },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router   = useRouter()
  const [online, setOnline] = React.useState(true)

  React.useEffect(() => {
    const on  = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    setOnline(navigator.onLine)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(165deg, #e8f2ff 0%, #d0e5ff 18%, #b8d4f8 36%, #a4c5f5 52%, #b0cef7 68%, #c4daff 84%, #daeeff 100%)' }}
    >
      {/* Offline banner */}
      {!online && (
        <div style={{ background: 'rgba(251,191,36,0.12)', borderBottom: '1px solid rgba(251,191,36,0.25)' }} className="px-4 py-2 flex items-center gap-2">
          <WifiOff size={13} style={{ color: '#d97706' }} />
          <span style={{ color: '#d97706' }} className="text-xs font-medium">Offline — data may be outdated</span>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 inset-x-0 px-4"
        style={{
          background: 'rgba(255,255,255,0.60)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 -4px 24px rgba(80,130,210,0.10)',
        }}
      >
        <div className="flex items-center justify-around max-w-sm mx-auto h-16">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? 'rgba(80,130,230,0.15)' : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  <Icon size={20} style={{ color: active ? '#3a6fd8' : '#8aabcf' }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#3a6fd8' : '#8aabcf', letterSpacing: '0.02em' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
