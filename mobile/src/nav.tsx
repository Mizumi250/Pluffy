// A small navigator: four tabs, and pages that slide over them. Android back and an edge swipe on iOS both pop.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, BackHandler, PanResponder, Platform, StyleSheet, View } from 'react-native'
import { useTheme, useReduceMotion } from './theme'

export type Tab = 'tasks' | 'commands' | 'tatemonos' | 'laptop'
export type Route =
  | { k: 'task'; id: string }
  | { k: 'form'; id: string; preset?: Record<string, unknown> }
  | { k: 'tatemono'; name: string }
  | { k: 'editor'; name: string; path: string }

type Nav = {
  tab: Tab; setTab: (t: Tab) => void
  stack: Route[]; push: (r: Route) => void; replace: (r: Route) => void; pop: () => void; popForce: () => void
  setGuard: (fn: (() => boolean) | null) => void
}
const Ctx = createContext<Nav>(null as unknown as Nav)
export const useNav = () => useContext(Ctx)

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<Tab>('tasks')
  const [stack, setStack] = useState<Route[]>([])
  const guard = useRef<(() => boolean) | null>(null)
  const stackRef = useRef(stack); stackRef.current = stack
  const tabRef = useRef(tab); tabRef.current = tab

  const push = useCallback((r: Route) => setStack((s) => [...s, r]), [])
  const replace = useCallback((r: Route) => setStack((s) => [...s.slice(0, -1), r]), [])
  const popForce = useCallback(() => { guard.current = null; setStack((s) => s.slice(0, -1)) }, [])
  const pop = useCallback(() => { if (guard.current && !guard.current()) return; popForce() }, [popForce])
  const setGuard = useCallback((fn: (() => boolean) | null) => { guard.current = fn }, [])

  useEffect(() => {
    if (Platform.OS !== 'android') return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stackRef.current.length) { pop(); return true }
      if (tabRef.current !== 'tasks') { setTab('tasks'); return true }
      return false
    })
    return () => sub.remove()
  }, [pop])

  const value = useMemo(() => ({ tab, setTab, stack, push, replace, pop, popForce, setGuard }), [tab, stack, push, replace, pop, popForce, setGuard])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// Slides in from the right; dragging from the left edge pops it.
export function Page({ children }: { children: React.ReactNode }) {
  const { c } = useTheme()
  const { pop } = useNav()
  const reduce = useReduceMotion()
  const x = useRef(new Animated.Value(reduce ? 0 : 36)).current
  const o = useRef(new Animated.Value(reduce ? 1 : 0)).current
  useEffect(() => {
    if (reduce) return
    Animated.parallel([
      Animated.timing(x, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(o, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start()
  }, [])
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_e, g) => g.x0 < 24 && g.dx > 12 && Math.abs(g.dy) < Math.abs(g.dx),
    onPanResponderMove: (_e, g) => { if (g.dx > 0) x.setValue(g.dx) },
    onPanResponderRelease: (_e, g) => {
      if (g.dx > 90 || g.vx > 0.8) pop()
      Animated.timing(x, { toValue: 0, duration: 160, useNativeDriver: true }).start()
    },
    onPanResponderTerminate: () => Animated.timing(x, { toValue: 0, duration: 160, useNativeDriver: true }).start(),
  }), [pop])
  return (
    <Animated.View {...pan.panHandlers} style={[StyleSheet.absoluteFill, { backgroundColor: c.bg, opacity: o, transform: [{ translateX: x }] }]}>
      {children}
    </Animated.View>
  )
}
