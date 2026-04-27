'use client'
// ARKZEN CUSTOM LAYOUT — app
// Generated from tatemono: jo-payroll

// FIX: Import AppLayout from the generated components directory (relative to
// the custom layout file at arkzen/core/layouts/custom/app.tsx).
// The old import `@/components/layout` was wrong — that path doesn't exist.
// AppLayout is generated into app/jo-payroll/components/_components.tsx,
// but custom layouts live at arkzen/core/layouts/custom/ so we cannot
// use a relative path to the app folder. The correct approach is to inline
// AppLayout in the layout block itself.

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, FileText, Database, Banknote, Building2, Landmark, Calendar } from 'lucide-react'

const APP_NAV_ITEMS = [
  { href: '/jo-payroll', label: 'Dashboard', icon: FileText },
  { href: '/jo-payroll/job-database', label: 'JO Database', icon: Database },
  { href: '/jo-payroll/cash-atm', label: 'Cash / ATM', icon: Banknote },
  { href: '/jo-payroll/sss-deductions', label: 'SSS', icon: Building2 },
  { href: '/jo-payroll/hdmf', label: 'HDMF', icon: Landmark },
  { href: '/jo-payroll/appointments', label: 'Appointments', icon: Calendar },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-neutral-100 flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <FileText size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">J.O Payroll</p>
              <p className="text-xs text-neutral-400 mt-0.5">Admin System</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {APP_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <button
                key={href}
                onClick={() => { router.push(href); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-violet-50 text-violet-700' : 'text-neutral-600 hover:bg-neutral-50'}`}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </nav>
        <div className="px-5 py-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">v1.0.0</p>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-neutral-100 flex items-center px-5 gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <Menu size={18} className="text-neutral-600" />
          </button>
          <div className="flex-1" />
          <div className="text-xs text-neutral-400 font-medium">
            {new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
