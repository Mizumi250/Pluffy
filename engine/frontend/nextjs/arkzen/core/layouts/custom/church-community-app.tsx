'use client'
// ARKZEN CUSTOM LAYOUT — church-community/app
// Generated from tatemono: church-community

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, Images, LayoutDashboard, Search, Bell, Sun, Moon, Plus } from 'lucide-react'
import { useAuthStore } from '@/arkzen/core/stores/authStore'

// ─── Palettes ────────────────────────────────────────────────────────────────
export const LIGHT = {
  bgGrad: 'linear-gradient(160deg,#e8ecf5 0%,#f2f4fc 50%,#e4e8f4 100%)',
  surface: 'rgba(255,255,255,0.92)', surfaceSolid: '#ffffff',
  border: 'rgba(220,224,240,0.8)', headerBg: 'rgba(255,255,255,0.88)', navBg: 'rgba(255,255,255,0.92)',
  textPrimary: '#0f0f1a', textSecond: '#4a5068', textMuted: '#8e98b8', textFaint: '#b8c0d8',
  purple: '#6c5ce7', purpleGrad: 'linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%)',
  shadow: '0 4px 24px rgba(80,90,140,0.10)', shadowPurp: '0 6px 20px rgba(108,92,231,0.28)',
  inputBg: 'rgba(240,242,248,0.95)', inputBorder: 'rgba(200,206,230,0.7)',
  skeletonA: 'rgba(200,208,230,0.5)', skeletonB: 'rgba(220,226,244,0.8)',
  heartColor: '#e84393',
}
export const DARK = {
  bgGrad: 'linear-gradient(160deg,#0d0d14 0%,#141420 50%,#0f0f1c 100%)',
  surface: 'rgba(255,255,255,0.055)', surfaceSolid: '#16162a',
  border: 'rgba(255,255,255,0.075)', headerBg: 'rgba(13,13,20,0.92)', navBg: 'rgba(16,16,26,0.96)',
  textPrimary: '#ebebff', textSecond: '#9090b0', textMuted: '#55557a', textFaint: '#333350',
  purple: '#a29bfe', purpleGrad: 'linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%)',
  shadow: '0 4px 24px rgba(0,0,0,0.45)', shadowPurp: '0 6px 20px rgba(108,92,231,0.38)',
  inputBg: 'rgba(255,255,255,0.045)', inputBorder: 'rgba(255,255,255,0.09)',
  skeletonA: 'rgba(255,255,255,0.035)', skeletonB: 'rgba(255,255,255,0.07)',
  heartColor: '#ff6b9d',
}

type T = typeof LIGHT
type ThemeCtx = { mode: 'light' | 'dark'; toggle: () => void; T: T }
const ThemeCtx = createContext<ThemeCtx>({ mode: 'light', toggle: () => {}, T: LIGHT })
export const useTheme = () => useContext(ThemeCtx)

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
  const [mode, setMode] = useState<'light'|'dark'>('light')

  useEffect(() => {
    const s = localStorage.getItem('gc-theme') as any
    if (s) setMode(s)
  }, [])

  const toggle = () => {
    const n = mode === 'light' ? 'dark' : 'light'
    setMode(n); localStorage.setItem('gc-theme', n)
  }
  const Tok = mode === 'dark' ? DARK : LIGHT

  const handleLogout = async () => { await logout(); router.push('/church-community/login') }

  return (
    <ThemeCtx.Provider value={{ mode, toggle, T: Tok }}>
      <div style={{ minHeight: '100vh', background: Tok.bgGrad, transition: 'background 0.35s' }}>

        {/* ── Header ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: Tok.headerBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${Tok.border}`, boxShadow: Tok.shadow, transition: 'background 0.35s',
        }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: Tok.purpleGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: Tok.shadowPurp, color: '#fff', fontSize: 15, fontWeight: 800 }}>✝</div>
              <span style={{ fontSize: 17, fontWeight: 800, color: Tok.textPrimary, letterSpacing: '-0.03em', fontFamily: 'Georgia, serif' }}>
                Grace<span style={{ color: Tok.purple }}>.</span>
              </span>
            </div>

            {/* Desktop nav */}
            <nav style={{ display: 'flex', gap: 2 }} className="hidden md:flex">
              {NAV.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
                return (
                  <button key={href} onClick={() => router.push(href)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                    borderRadius: 50, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: active ? Tok.purpleGrad : 'transparent',
                    color: active ? '#fff' : Tok.textMuted,
                    boxShadow: active ? Tok.shadowPurp : 'none', transition: 'all 0.2s',
                  }}>
                    <Icon size={14} />{label}
                  </button>
                )
              })}
            </nav>

            {/* Right icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {[{ icon: mode === 'dark' ? Sun : Moon, action: toggle }, { icon: Search, action: () => {} }, { icon: Bell, action: () => {} }].map(({ icon: Icon, action }, i) => (
                <button key={i} onClick={action} style={{
                  width: 34, height: 34, borderRadius: '50%', border: `1px solid ${Tok.border}`,
                  background: Tok.surface, color: Tok.textMuted, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                }}><Icon size={15} /></button>
              ))}
              <div onClick={handleLogout} title="Logout" style={{
                width: 34, height: 34, borderRadius: '50%', background: Tok.purpleGrad,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: Tok.shadowPurp,
              }}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</div>
            </div>
          </div>
        </header>

        {/* ── Mobile bottom nav ── */}
        <nav className="md:hidden" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          background: Tok.navBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderTop: `1px solid ${Tok.border}`, transition: 'background 0.35s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '9px 0 calc(9px + env(safe-area-inset-bottom, 0px))' }}>
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (href !== '/church-community' && pathname.startsWith(href))
              return (
                <button key={href} onClick={() => router.push(href)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 10px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: active ? Tok.purpleGrad : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? Tok.shadowPurp : 'none', transition: 'all 0.2s' }}>
                    <Icon size={18} style={{ color: active ? '#fff' : Tok.textFaint }} strokeWidth={active ? 2.5 : 1.8} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: active ? Tok.purple : Tok.textFaint, letterSpacing: '0.04em' }}>
                    {label.toUpperCase()}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

        <main style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 16px 100px' }}>
          {children}
        </main>
      </div>
    </ThemeCtx.Provider>
  )
}
