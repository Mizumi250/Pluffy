'use client'
// ARKZEN CUSTOM LAYOUT — jo-payroll/app
// Generated from tatemono: jo-payroll

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/jo-payroll',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/jo-payroll/job-database', label: 'JO Database',  icon: Database        },
  { href: '/jo-payroll/cash-atm',     label: 'Cash / ATM',   icon: Banknote        },
  { href: '/jo-payroll/sss',          label: 'SSS',          icon: Building2       },
  { href: '/jo-payroll/hdmf',         label: 'HDMF',         icon: Landmark        },
  { href: '/jo-payroll/appointments', label: 'Appointments', icon: CalendarDays    },
  { href: '/jo-payroll/payslip',      label: 'Payslip',      icon: Banknote        },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname  = usePathname()
  const router    = useRouter()
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const currentLabel = NAV_ITEMS.find(n => n.href === pathname)?.label ?? 'J.O Payroll'

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        .nav-pill { transition: all 0.2s cubic-bezier(.4,0,.2,1); }
        .nav-pill:hover { transform: translateX(3px); }
        .nav-pill.active { transform: translateX(0); }
        .sidebar-glow { box-shadow: 4px 0 24px rgba(0,0,0,0.08); }
      `}</style>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-[72px] bg-neutral-900 flex flex-col
          sidebar-glow transition-all duration-300 lg:translate-x-0
          ${open ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-neutral-800 shrink-0">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
            <span className="text-neutral-900 font-['Syne',sans-serif] font-800 text-sm">J.</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <button
                key={href}
                onClick={() => { router.push(href); setOpen(false) }}
                title={label}
                className={`nav-pill w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium group relative
                  ${active
                    ? 'active bg-white text-neutral-900'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${open ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:hidden'}`}>
                  {label}
                </span>
                {/* Tooltip for collapsed state on desktop */}
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden lg:block z-50 border border-neutral-700">
                  {label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Bottom logout */}
        <div className="px-2 pb-4 shrink-0">
          <button
            className="nav-pill w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-neutral-500 hover:bg-neutral-800 hover:text-red-400 group relative"
            title="Logout"
          >
            <LogOut size={18} className="shrink-0" />
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden lg:block z-50 border border-neutral-700">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-neutral-100 flex items-center px-6 gap-4 shrink-0 shadow-sm">
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1">
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-widest">J.O. PAYROLL SYSTEM</p>
            <h1 className="text-sm font-semibold text-neutral-900 font-['Syne',sans-serif] -mt-0.5">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-neutral-100 transition-colors">
              <Bell size={18} className="text-neutral-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-semibold font-['Syne',sans-serif]">LGU</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {mounted ? children : null}
        </main>
      </div>
    </div>
  )
}
