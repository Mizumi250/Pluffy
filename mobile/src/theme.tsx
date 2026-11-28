// Tokens are Pluffy Studio's (gui/renderer/style.css): cream window, one coral accent, flat surfaces, rounded
// corners, depth from tone and never from shadows. Text colours below were checked for 4.5:1 against the
// surfaces they sit on (see ../scripts/contrast.mjs).
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AccessibilityInfo, Platform, useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type Pref = 'auto' | 'light' | 'dark'
export type Mode = 'light' | 'dark'

export const palette = {
  light: {
    ink: '#212121', bg: '#f3ebe9', surface: '#fbfbfd', chip: '#f3ebe9', chipPress: '#ebe0dd',
    primary: '#f99e9e', primaryPress: '#f58a8a', primarySoft: '#fde6e6', onPrimary: '#212121',
    muted: '#6c625f', faint: '#a69a96', line: '#ebe0dd',
    ok: '#25694b', warn: '#8a4b00', err: '#b02f2f', scrim: 'rgba(60,40,36,0.32)',
  },
  dark: {
    ink: '#f3e4e8', bg: '#1e171b', surface: '#2a2025', chip: '#382b31', chipPress: '#45323a',
    primary: '#f99e9e', primaryPress: '#fbb3b3', primarySoft: '#44292f', onPrimary: '#212121',
    muted: '#bfaab1', faint: '#85727a', line: '#382b31',
    ok: '#7fd4a8', warn: '#f2b765', err: '#ff8a8a', scrim: 'rgba(12,6,9,0.58)',
  },
}
export type Colors = typeof palette.light

// The output pane is always dark, like a terminal, so command colours stay readable in both themes.
export const term = { bg: '#231a1e', ink: '#f3e4e8', muted: '#b3a3a9', bar: '#2d2227' }

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 }
export const radius = { sm: 10, md: 14, lg: 22 }
export const mono = Platform.select({ ios: 'Menlo', default: 'monospace' }) as string

type Ctx = { c: Colors; mode: Mode; pref: Pref; setPref: (p: Pref) => void; display?: string; setDisplay: (f?: string) => void }
const ThemeCtx = createContext<Ctx>(null as unknown as Ctx)
export const useTheme = () => useContext(ThemeCtx)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme()
  const [pref, setPrefState] = useState<Pref>('auto')
  const [display, setDisplay] = useState<string | undefined>(undefined)
  useEffect(() => {
    AsyncStorage.getItem('pluffy.theme').then((v) => { if (v === 'light' || v === 'dark' || v === 'auto') setPrefState(v) }).catch(() => {})
  }, [])
  const setPref = (p: Pref) => { setPrefState(p); AsyncStorage.setItem('pluffy.theme', p).catch(() => {}) }
  const mode: Mode = pref === 'auto' ? (system === 'dark' ? 'dark' : 'light') : pref
  const value = useMemo(() => ({ c: palette[mode], mode, pref, setPref, display, setDisplay }), [mode, pref, display])
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useReduceMotion() {
  const [r, set] = useState(false)
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(set).catch(() => {})
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', set)
    return () => sub.remove()
  }, [])
  return r
}
