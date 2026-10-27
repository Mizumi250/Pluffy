'use client'
// ARKZEN CUSTOM LAYOUT — kotoba/shell
// Generated from tatemono: kotoba

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useArkzenPathname, useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, useAuthStore } from '@/arkzen/core/stores/authStore'
import { BarChart3, Bell, Compass, GraduationCap, Home, Layers, LogOut, MessageCircle, Newspaper, User, Users, X } from 'lucide-react'

const NAV = [
  { key: 'dashboard', label: 'Home', icon: Home, mobile: true },
  { key: 'feed', label: 'Community', icon: Newspaper, mobile: true },
  { key: 'learn', label: 'Learn', icon: GraduationCap, mobile: true },
  { key: 'review', label: 'Review', icon: Layers, mobile: false },
  { key: 'partners', label: 'Partners', icon: Compass, mobile: false },
  { key: 'chat', label: 'Messages', icon: MessageCircle, mobile: true },
  { key: 'circles', label: 'Circles', icon: Users, mobile: false },
  { key: 'progress', label: 'Progress', icon: BarChart3, mobile: false },
  { key: 'profile', label: 'Profile', icon: User, mobile: true },
]

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useArkzenRouter()
  const pathname = useArkzenPathname() ?? ''
  const { user, logout } = useAuthStore()
  const [alerts, setAlerts] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const [bell, setBell] = useState(false)
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: string }[]>([])
  const uid = (user as any)?.id as number | undefined

  const active = NAV.find(n => pathname.endsWith(`/kotoba/${n.key}`) || pathname.includes(`/kotoba/${n.key}/`))?.key ?? ''
  const go = (key: string) => router.push(`/kotoba/${key}`)

  const loadAlerts = useCallback(async () => {
    try {
      const res = await arkzenFetch('/api/kotoba/alerts')
      if (!res.ok) return
      const d = await res.json()
      setAlerts(d.data ?? []); setUnread(d.unread ?? 0)
    } catch { /* offline */ }
  }, [])

  useEffect(() => { if (uid) loadAlerts() }, [uid, loadAlerts])

  // Toasts (fed by window events from shared components)
  useEffect(() => {
    const h = (e: any) => {
      const id = Date.now() + Math.random()
      setToasts(t => [...t, { id, message: e.detail.message, kind: e.detail.kind }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
    }
    window.addEventListener('kotoba:toast', h)
    return () => window.removeEventListener('kotoba:toast', h)
  }, [])

  // Realtime: one Reverb socket per session, re-broadcast as window events
  const wsRef = useRef<WebSocket | null>(null)
  useEffect(() => {
    if (!uid) return
    let closed = false
    let retry = 0
    let timer: any
    const host = process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost'
    const port = process.env.NEXT_PUBLIC_REVERB_PORT ?? '8080'
    const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? 'arkzen-key'
    const schemeEnv = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'ws'
    const scheme = schemeEnv === 'https' || schemeEnv === 'wss' ? 'wss' : 'ws'
    const connect = () => {
      if (closed) return
      const ws = new WebSocket(`${scheme}://${host}:${port}/app/${key}?protocol=7&client=js&version=8.4.0`)
      wsRef.current = ws
      ws.onmessage = async (ev) => {
        let msg: any
        try { msg = JSON.parse(ev.data) } catch { return }
        if (msg.event === 'pusher:connection_established') {
          retry = 0
          const socketId = JSON.parse(msg.data).socket_id
          const channel = `private-kotoba.${uid}`
          try {
            const res = await arkzenFetch('/api/kotoba/auth/broadcasting/auth', { method: 'POST', body: JSON.stringify({ socket_id: socketId, channel_name: channel }) })
            if (!res.ok) return
            const auth = await res.json()
            ws.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel, auth: auth.auth } }))
          } catch { /* retry on reconnect */ }
        } else if (msg.event === 'pusher:ping') {
          ws.send(JSON.stringify({ event: 'pusher:pong', data: {} }))
        } else if (typeof msg.event === 'string' && msg.event.startsWith('kotoba.')) {
          let data: any = msg.data
          try { data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data } catch { /* keep raw */ }
          window.dispatchEvent(new CustomEvent('kotoba:rt', { detail: { event: msg.event, data } }))
          if (msg.event === 'kotoba.alert-created') {
            const a = data?.data ?? data
            setAlerts(list => [a, ...list]); setUnread(n => n + 1)
            window.dispatchEvent(new CustomEvent('kotoba:toast', { detail: { message: a?.text ?? 'New notification', kind: 'ok' } }))
          }
        }
      }
      ws.onclose = () => { if (closed) return; retry = Math.min(retry + 1, 6); timer = setTimeout(connect, 1000 * 2 ** retry) }
      ws.onerror = () => ws.close()
    }
    connect()
    return () => { closed = true; clearTimeout(timer); wsRef.current?.close() }
  }, [uid])

  const openBell = async () => {
    const next = !bell
    setBell(next)
    if (next && unread > 0) {
      try { await arkzenFetch('/api/kotoba/alerts/read', { method: 'POST', body: '{}' }); setUnread(0); setAlerts(l => l.map(a => ({ ...a, is_read: true }))) } catch { /* ignore */ }
    }
  }
  const signOut = async () => { try { await logout() } catch { /* ignore */ } router.push('/kotoba/login') }

  return (
    <div className="kt-shell">
      <aside className="kt-side" aria-label="Main navigation">
        <div className="kt-brand"><div className="kt-brand-mark">言</div>Kotoba</div>
        {NAV.map(n => (
          <button key={n.key} className={`kt-nav ${active === n.key ? 'active' : ''}`} aria-current={active === n.key ? 'page' : undefined} onClick={() => go(n.key)}>
            <n.icon size={20} />{n.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="kt-nav" onClick={openBell}><Bell size={20} />Notifications{unread > 0 && <span className="kt-badge">{unread}</span>}</button>
        <button className="kt-nav" onClick={signOut}><LogOut size={20} />Sign out</button>
      </aside>

      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <button className="kt-icon-btn kt-only-m" aria-label="Notifications" onClick={openBell} style={{ position: 'fixed', top: 14, right: 14, zIndex: 55, background: 'var(--kt-glass)', backdropFilter: 'blur(16px)' }}>
          <Bell size={18} />{unread > 0 && <span className="kt-badge" style={{ position: 'absolute', top: -4, right: -4 }}>{unread}</span>}
        </button>
        <main className="kt-main" key={pathname}>{children}</main>
      </div>

      <nav className="kt-tabbar" aria-label="Tabs">
        {NAV.filter(n => n.mobile).map(n => (
          <button key={n.key} className={`kt-tab ${active === n.key ? 'active' : ''}`} onClick={() => go(n.key)} aria-label={n.label}><n.icon size={22} />{n.label}</button>
        ))}
      </nav>

      {bell && (
        <div className="kt-sheet-back" onClick={() => setBell(false)}>
          <div className="kt-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label="Notifications">
            <div className="kt-grab" />
            <div className="kt-sheet-head"><h3>Notifications</h3><button className="kt-icon-btn" aria-label="Close" onClick={() => setBell(false)}><X size={18} /></button></div>
            {alerts.length === 0 && <p className="kt-sub" style={{ textAlign: 'center', padding: 24 }}>You are all caught up.</p>}
            <div className="kt-list">{alerts.map((a, i) => (
              <div key={a.id ?? i} className="kt-item" style={{ cursor: 'default', background: a.is_read ? undefined : 'rgba(10,132,255,0.08)' }}>
                <span style={{ fontSize: 20 }}>{a.kind === 'like' ? '❤️' : a.kind === 'follow' ? '👋' : a.kind === 'accepted' ? '✅' : a.kind === 'correction' ? '✏️' : '💬'}</span>
                <span style={{ fontSize: 15 }}>{a.text}</span>
              </div>
            ))}</div>
          </div>
        </div>
      )}

      <div className="kt-toasts" aria-live="polite">{toasts.map(t => <div key={t.id} className={`kt-toast ${t.kind === 'err' ? 'err' : ''}`}>{t.message}</div>)}</div>
    </div>
  )
}
