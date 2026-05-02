'use client'
// ARKZEN CUSTOM LAYOUT — dtr-geofencing/app
// Generated from tatemono: dtr-geofencing

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarClock, LayoutDashboard, Settings, Menu, X } from 'lucide-react'

const NAV = [
  { href: '/dtr-geofencing',       label: 'Clock In/Out', icon: CalendarClock },
  { href: '/dtr-geofencing/admin', label: 'Admin',        icon: Settings },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <CalendarClock size={14} className="text-white/70" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white/90">DTR · Geofence</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === href
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            {open ? <X size={18} className="text-white/60" /> : <Menu size={18} className="text-white/60" />}
          </button>
        </div>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="absolute top-14 left-0 w-full bg-[#111] border-b border-white/[0.06] p-3 space-y-1" onClick={e => e.stopPropagation()}>
            {NAV.map(({ href, label, icon: Icon }) => (
              <button
                key={href}
                onClick={() => { router.push(href); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all text-left"
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-5 py-7">{children}</main>
    </div>
  )
}
