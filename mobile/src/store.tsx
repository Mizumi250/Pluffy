// App state: which laptops this phone is paired with, whether the active one can be reached right now,
// and the lists that come from it. Tokens live in the phone's secure storage, never in plain storage.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import * as Device from 'expo-device'
import { api, ApiError, Conn, Info, Menu, TaskBrief, normalizeAddress } from './api'

export type Laptop = { id: string; name: string; base: string; display: string }
export type Link = 'checking' | 'online' | 'offline' | 'auth'

type Store = {
  ready: boolean
  laptops: Laptop[]
  active: Laptop | null
  conn: Conn | null
  link: Link
  info: Info | null
  latency: number | null
  menu: Menu | null
  lists: { tatemonos: string[]; projects: string[] } | null
  tasks: TaskBrief[]
  connecting: boolean
  toast: string
  openConnect: () => void
  closeConnect: () => void
  pair: (address: string, pin: string) => Promise<void>
  select: (id: string) => Promise<void>
  forget: (id: string) => Promise<void>
  refresh: () => Promise<void>
  refreshLists: () => Promise<void>
  pingNow: () => Promise<{ ok: boolean; ms?: number; message?: string }>
  say: (msg: string) => void
}

const Ctx = createContext<Store>(null as unknown as Store)
export const useStore = () => useContext(Ctx)

const tokenKey = (id: string) => `pluffy.token.${id}`
const J = <T,>(s: string | null, d: T): T => { try { return s ? (JSON.parse(s) as T) : d } catch { return d } }

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [laptops, setLaptops] = useState<Laptop[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [link, setLink] = useState<Link>('checking')
  const [info, setInfo] = useState<Info | null>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [lists, setLists] = useState<{ tatemonos: string[]; projects: string[] } | null>(null)
  const [tasks, setTasks] = useState<TaskBrief[]>([])
  const [connecting, setConnecting] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const active = useMemo(() => laptops.find((l) => l.id === activeId) ?? null, [laptops, activeId])
  const conn = useMemo<Conn | null>(() => (active && token ? { base: active.base, token } : null), [active, token])

  const say = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3500)
  }, [])

  const saveLaptops = (list: Laptop[], id: string | null) => {
    AsyncStorage.setItem('pluffy.laptops', JSON.stringify(list)).catch(() => {})
    if (id) AsyncStorage.setItem('pluffy.active', id).catch(() => {}); else AsyncStorage.removeItem('pluffy.active').catch(() => {})
  }

  // ---- load what was saved last time ----
  useEffect(() => {
    (async () => {
      try {
        const [l, a] = await Promise.all([AsyncStorage.getItem('pluffy.laptops'), AsyncStorage.getItem('pluffy.active')])
        const list = J<Laptop[]>(l, [])
        setLaptops(list)
        const id = a && list.some((x) => x.id === a) ? a : null
        if (id) {
          setActiveId(id)
          setToken(await SecureStore.getItemAsync(tokenKey(id)))
          const cached = await AsyncStorage.getItem(`pluffy.menu.${id}`)
          if (cached) setMenu(J<Menu | null>(cached, null))
        }
      } catch { /* start fresh */ }
      setReady(true)
    })()
  }, [])

  // ---- is the laptop there? every 4 seconds while the app is open ----
  const connRef = useRef<Conn | null>(null); connRef.current = conn
  const tick = useCallback(async () => {
    const c = connRef.current
    if (!c) return
    const t0 = Date.now()
    try {
      const [st, tk] = await Promise.all([api.state(c), api.tasks(c)])
      if (connRef.current !== c) return
      setLatency(Date.now() - t0); setInfo(st); setTasks(tk.tasks); setLink('online')
    } catch (e) {
      if (connRef.current !== c) return
      setLink(e instanceof ApiError && e.kind === 'auth' ? 'auth' : 'offline')
    }
  }, [])

  useEffect(() => {
    if (!conn) { setLink('checking'); setInfo(null); setTasks([]); return }
    setLink('checking'); tick()
    const iv = setInterval(() => { if (AppState.currentState === 'active') tick() }, 4000)
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') tick() })
    return () => { clearInterval(iv); sub.remove() }
  }, [conn, tick])

  const refreshLists = useCallback(async () => {
    const c = connRef.current; if (!c) return
    try { setLists(await api.lists(c)) } catch { /* keep the old list */ }
  }, [])

  // fetch the menu once the laptop is reachable, keep a copy so the cards still show offline
  useEffect(() => {
    if (link !== 'online' || !conn || !active) return
    api.menu(conn).then((m) => { setMenu(m); AsyncStorage.setItem(`pluffy.menu.${active.id}`, JSON.stringify(m)).catch(() => {}) }).catch(() => {})
    refreshLists()
  }, [link === 'online', active?.id])

  const pair = useCallback(async (address: string, pin: string) => {
    const n = normalizeAddress(address)
    if (!n) throw new ApiError('That address does not look right. Use the one the laptop prints, like 192.168.1.20:7471.', 0, 'http')
    const hello = await api.ping(n.base)
    const name = Device.deviceName || Device.modelName || (Platform.OS === 'ios' ? 'iPhone' : 'Android phone')
    const r = await api.pair(n.base, pin.replace(/\s/g, ''), name, Platform.OS)
    try { await SecureStore.setItemAsync(tokenKey(r.id), r.token) } catch { throw new ApiError('Paired, but this phone could not save the pairing securely.', 0, 'http') }
    const laptop: Laptop = { id: r.id, name: hello.name || r.name, base: n.base, display: n.display }
    setLaptops((prev) => {
      const next = [...prev.filter((x) => x.base !== laptop.base), laptop]
      saveLaptops(next, laptop.id); return next
    })
    setMenu(null); setLists(null)
    setActiveId(laptop.id); setToken(r.token); setConnecting(false)
    say(`Paired with ${laptop.name}`)
  }, [say])

  const select = useCallback(async (id: string) => {
    const t = await SecureStore.getItemAsync(tokenKey(id))
    if (!t) { say('This laptop needs to be paired again.'); return }
    setMenu(J<Menu | null>(await AsyncStorage.getItem(`pluffy.menu.${id}`), null)); setLists(null)
    setActiveId(id); setToken(t); setConnecting(false)
    setLaptops((p) => { saveLaptops(p, id); return p })
  }, [say])

  const forget = useCallback(async (id: string) => {
    try { await SecureStore.deleteItemAsync(tokenKey(id)) } catch { /* already gone */ }
    AsyncStorage.removeItem(`pluffy.menu.${id}`).catch(() => {})
    setLaptops((prev) => {
      const next = prev.filter((x) => x.id !== id)
      saveLaptops(next, id === activeId ? null : activeId); return next
    })
    if (id === activeId) { setActiveId(null); setToken(null); setMenu(null); setLists(null) }
  }, [activeId])

  const pingNow = useCallback(async () => {
    if (!active) return { ok: false, message: 'No laptop selected.' }
    const t0 = Date.now()
    try { await api.ping(active.base, 5000); const ms = Date.now() - t0; setLatency(ms); tick(); return { ok: true, ms } }
    catch (e: any) { setLink('offline'); return { ok: false, message: e.message as string } }
  }, [active, tick])

  const value: Store = {
    ready, laptops, active, conn, link, info, latency, menu, lists, tasks, connecting: connecting || (ready && !active), toast,
    openConnect: () => setConnecting(true), closeConnect: () => setConnecting(false),
    pair, select, forget, refresh: tick, refreshLists, pingNow, say,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
