import React from 'react'
import { Pressable, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { NavProvider, Page, Tab, useNav } from './src/nav'
import { StoreProvider, useStore } from './src/store'
import { ThemeProvider, space, useTheme } from './src/theme'
import { Icon, T } from './src/ui'
import { Connect } from './src/screens/Connect'
import { Tasks } from './src/screens/Tasks'
import { TaskView } from './src/screens/TaskView'
import { Commands } from './src/screens/Commands'
import { FormScreen } from './src/screens/FormScreen'
import { Tatemonos } from './src/screens/Tatemonos'
import { Editor, TatemonoView } from './src/screens/TatemonoView'
import { Laptop } from './src/screens/Laptop'

const TABS: { k: Tab; label: string; icon: string }[] = [
  { k: 'tasks', label: 'Tasks', icon: 'list-checks' },
  { k: 'commands', label: 'Commands', icon: 'terminal' },
  { k: 'tatemonos', label: 'Tatemonos', icon: 'building-2' },
  { k: 'laptop', label: 'Laptop', icon: 'laptop' },
]

function TabBar() {
  const { c } = useTheme()
  const { tab, setTab } = useNav()
  const st = useStore()
  const insets = useSafeAreaInsets()
  const running = st.tasks.filter((t) => t.status === 'running').length
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line, paddingBottom: insets.bottom }}>
      {TABS.map((t) => {
        const on = tab === t.k
        const badge = t.k === 'tasks' && running > 0 ? running : 0
        return (
          <Pressable key={t.k} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={badge ? `${t.label}, ${badge} running` : t.label}
            onPress={() => setTab(t.k)} style={{ flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <View>
              <Icon name={t.icon} size={24} color={on ? c.ink : c.muted} strokeWidth={on ? 2.4 : 2} />
              {badge ? (
                <View style={{ position: 'absolute', top: -4, right: -10, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <T v="caption" style={{ fontSize: 12, lineHeight: 16, color: c.onPrimary, fontWeight: '700' }}>{badge}</T>
                </View>
              ) : null}
            </View>
            <T v="caption" style={{ fontSize: 12, lineHeight: 16, color: on ? c.ink : c.muted, fontWeight: on ? '700' : '500' }}>{t.label}</T>
            {on ? <View style={{ position: 'absolute', top: 0, width: 28, height: 3, borderRadius: 2, backgroundColor: c.primary }} /> : null}
          </Pressable>
        )
      })}
    </View>
  )
}

function Toast() {
  const { c } = useTheme()
  const { toast } = useStore()
  const insets = useSafeAreaInsets()
  if (!toast) return null
  return (
    <View pointerEvents="none" accessibilityLiveRegion="polite" style={{ position: 'absolute', left: space.md, right: space.md, bottom: insets.bottom + 72, alignItems: 'center' }}>
      <View style={{ backgroundColor: c.ink, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, maxWidth: 480 }}>
        <T style={{ color: c.bg }}>{toast}</T>
      </View>
    </View>
  )
}

function Shell() {
  const { c } = useTheme()
  const st = useStore()
  const nav = useNav()
  if (!st.ready) return <View style={{ flex: 1, backgroundColor: c.bg }} />
  if (st.connecting) return <Connect />
  const body = { tasks: <Tasks />, commands: <Commands />, tatemonos: <Tatemonos />, laptop: <Laptop /> }[nav.tab]
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1 }}>
        {body}
        {nav.stack.map((r, i) => (
          <Page key={i}>
            {r.k === 'task' ? <TaskView id={r.id} />
              : r.k === 'form' ? <FormScreen id={r.id} preset={r.preset} />
              : r.k === 'tatemono' ? <TatemonoView name={r.name} />
              : <Editor name={r.name} path={r.path} />}
          </Page>
        ))}
      </View>
      <TabBar />
      <Toast />
    </View>
  )
}

function Bar() { const { mode } = useTheme(); return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} /> }

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StoreProvider>
          <NavProvider>
            <Bar />
            <Shell />
          </NavProvider>
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
