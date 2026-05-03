'use client'
// ARKZEN CUSTOM LAYOUT — queue-flow/app
// Generated from tatemono: queue-flow

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Ticket, Settings, Wifi, WifiOff } from 'lucide-react'

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
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col">
      {/* Offline banner */}
      {!online && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2">
          <WifiOff size={13} className="text-amber-400" />
          <span className="text-amber-400 text-xs font-medium">Offline — data may be outdated</span>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#0f0f1a]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 pb-safe">
        <div className="flex items-center justify-around max-w-sm mx-auto h-16">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
              >
                <Icon
                  size={20}
                  className={active ? 'text-violet-400' : 'text-white/30'}
                />
                <span className={`text-[10px] font-medium ${active ? 'text-violet-400' : 'text-white/30'}`}>
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
