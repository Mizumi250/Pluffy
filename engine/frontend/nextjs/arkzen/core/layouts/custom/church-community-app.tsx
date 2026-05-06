'use client'
// ARKZEN CUSTOM LAYOUT — church-community/app
// Generated from tatemono: church-community

'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, FolderImage, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/arkzen/core/stores/authStore'

const NAV = [
  { href: '/church-community',           icon: Home,           label: 'Feed' },
  { href: '/church-community/members',   icon: Users,          label: 'Members' },
  { href: '/church-community/inventory', icon: FolderImage,    label: 'Inventory' },
  { href: '/church-community/admin',     icon: LayoutDashboard,label: 'Admin' },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/church-community/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white">
      {/* Desktop header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">✝</span>
              </div>
              <h1 className="text-xl font-semibold text-amber-900 tracking-tight">Grace Community Church</h1>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
                return (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      active
                        ? 'bg-amber-100 text-amber-800 shadow-sm'
                        : 'text-amber-600 hover:bg-amber-50 hover:text-amber-800'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                )
              })}
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-sm text-amber-600 hidden sm:inline">{user?.name ?? 'Admin'}</span>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 text-amber-700 hover:bg-amber-50 transition"
              >
                <LogOut size={14} /> Logout
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-amber-100"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-amber-100 z-40">
        <div className="flex justify-around items-center py-2">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
            return (
              <button
                key={href}
                onClick={() => { router.push(href); setMobileMenuOpen(false) }}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-full transition ${
                  active ? 'text-amber-700' : 'text-amber-400'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        {children}
      </main>
    </div>
  )
}
