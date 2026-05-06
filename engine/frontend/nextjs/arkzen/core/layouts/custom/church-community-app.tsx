'use client'
// ARKZEN CUSTOM LAYOUT — church-community/app
// Generated from tatemono: church-community

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, Images, LayoutDashboard, LogOut, Search, Bell } from 'lucide-react'
import { useAuthStore } from '@/arkzen/core/stores/authStore'

const NAV = [
  { href: '/church-community',           icon: Home,            label: 'Feed' },
  { href: '/church-community/members',   icon: Users,           label: 'Members' },
  { href: '/church-community/inventory', icon: Images,          label: 'Gallery' },
  { href: '/church-community/admin',     icon: LayoutDashboard, label: 'Admin' },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push('/church-community/login')
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #c5d0de 0%, #d4dde8 50%, #bcc8d6 100%)' }}
    >
      {/* Desktop header */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 2px 20px rgba(100,120,160,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #7b6cf6, #a78bfa)' }}
              >
                <span className="text-white text-sm font-bold">✝</span>
              </div>
              <h1 className="text-lg font-bold" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
                Grace Community
              </h1>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
                return (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: active ? 'linear-gradient(135deg, #7b6cf6, #a78bfa)' : 'transparent',
                      color: active ? '#fff' : '#6b7db3',
                      boxShadow: active ? '0 4px 15px rgba(123,108,246,0.35)' : 'none',
                    }}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                )
              })}
            </nav>

            <div className="flex items-center gap-3">
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center transition"
                style={{ background: 'rgba(255,255,255,0.8)', color: '#8b9cc8' }}
              >
                <Search size={16} />
              </button>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.8)', color: '#8b9cc8' }}
              >
                <Bell size={16} />
              </button>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7b6cf6, #6ec6f5)' }}
                onClick={handleLogout}
                title="Logout"
              >
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 -4px 20px rgba(100,120,160,0.1)',
        }}
      >
        <div className="flex justify-around items-center py-3">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="flex flex-col items-center gap-1 transition"
              >
                <Icon
                  size={22}
                  style={{ color: active ? '#7b6cf6' : '#b0bcd4' }}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? '#7b6cf6' : '#b0bcd4' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}
