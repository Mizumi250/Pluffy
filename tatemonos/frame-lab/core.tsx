/* @arkzen:meta
name: frame-lab
version: 1.0.0
description: Test bed for @arkzen:native:frame (expo, rn, lynx) and @arkzen:desktop:frame (electron, tauri). Two screens per target, each wrapped by that target's own frame.
auth: false
*/

/* @arkzen:meta:native
label: Frame Lab
description: Screens wrapped by per-target frames
expo:
  bundle_id: com.arkzen.framelab
  scheme: framelab
  version: 1.0.0
  orientation: portrait
*/

// ═════════════════════════════════════════════════════════════════════════════
// FRAMES
//
// A frame is the parent that wraps every screen of this tatemono on ONE target.
// Each target has its own block, written in that target's own language, and the
// body is yours: the engine writes it out verbatim.
//
//   @arkzen:native:frame:expo      TSX    -> app/frame-lab/_layout.tsx
//   @arkzen:native:frame:rn        TSX    -> screenOptions and/or Frame component
//   @arkzen:native:frame:lynx      TSX    -> Frame component (Lynx has no navigator)
//   @arkzen:desktop:frame:electron JS     -> main-process windowOptions / setup(ctx)
//   @arkzen:desktop:frame:tauri    Rust   -> pub fn frame(app) in the Tauri shell
//
// Delete any block and that target goes back to the engine default.
// ═════════════════════════════════════════════════════════════════════════════

/* @arkzen:native:frame:expo */
import React from 'react'
import { Tabs } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'

export default function FrameLabLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#ffffff',
          tabBarActiveTintColor: '#6366f1',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  )
}
/* @arkzen:native:frame:expo:end */

/* @arkzen:native:frame:rn */
import React from 'react'
import { StatusBar, Text, View } from 'react-native'

// Native header on every screen of this tatemono.
export const screenOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: '#0f172a' },
  headerTintColor: '#ffffff',
  title: 'Frame Lab',
}

// Wraps every screen of this tatemono. `children` is the screen.
export const Frame = ({ children }: { children?: React.ReactNode }) => (
  <View style={{ flex: 1, backgroundColor: '#fafaf9' }}>
    <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
    <View style={{ flex: 1 }}>{children}</View>
    <View style={{ paddingVertical: 8, alignItems: 'center', backgroundColor: '#0f172a' }}>
      <Text style={{ color: '#94a3b8', fontSize: 11 }}>frame-lab · @arkzen:native:frame:rn</Text>
    </View>
  </View>
)
/* @arkzen:native:frame:rn:end */

/* @arkzen:native:frame:lynx */
// Lynx has no navigator, so the frame is a component. It receives
// { module, page, children } and renders `children` (the screen) inside its chrome.
export const Frame = ({ module, page, children }: { module: string; page: string; children?: any }) => (
  <view style={{ height: '100%' }}>
    <view className="px-4 py-3 bg-slate-900">
      <text className="text-sm font-semibold text-white">Frame Lab</text>
      <text className="text-xs text-slate-400">{module + ' / ' + page}</text>
    </view>
    <view style={{ flex: 1 }}>{children}</view>
  </view>
)
/* @arkzen:native:frame:lynx:end */

/* @arkzen:desktop:frame:electron */
// Plain JavaScript (ESM) — runs in the Electron main process, not in the web app.
//   windowOptions  merged into the BrowserWindow options
//   setup(ctx)     runs once the web app has loaded; may return a teardown function
//   ctx.command(id, payload)  host -> web   (web: window.arkzenHost.onCommand)
//   ctx.onEvent(channel, fn)  web  -> host  (web: window.arkzenHost.emit)
export const windowOptions = {
  backgroundColor: '#0f172a',
  title: 'Frame Lab',
}

export function setup({ electron, win, command, onEvent }) {
  const { Menu } = electron

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'Frame Lab',
        submenu: [
          { label: 'New Note', accelerator: 'CmdOrCtrl+N', click: () => command('newNote') },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      { role: 'editMenu' },
      { role: 'viewMenu' },
    ]),
  )

  // The web app can retitle the window: window.arkzenHost.emit('title', 'Hello')
  const stopTitle = onEvent('title', (title) => win.setTitle(String(title)))

  return () => stopTitle()
}
/* @arkzen:desktop:frame:electron:end */

/* @arkzen:desktop:frame:tauri */
// Rust — compiled into the Tauri shell. In scope without importing:
//   tauri, Manager, Emitter, Error, and command(&AppHandle, "id", serde_json::Value)
// (command emits the "arkzen:command" event to the web app.)
pub fn frame(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {
    use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};

    let new_note = MenuItemBuilder::with_id("new_note", "New Note")
        .accelerator("CmdOrCtrl+N")
        .build(app)?;
    let file = SubmenuBuilder::new(app, "Frame Lab")
        .item(&new_note)
        .separator()
        .quit()
        .build()?;
    let menu = MenuBuilder::new(app).item(&file).build()?;
    app.set_menu(menu)?;

    let handle = app.handle().clone();
    app.on_menu_event(move |_app, event| {
        if event.id().as_ref() == "new_note" {
            command(&handle, "newNote", serde_json::Value::Null);
        }
    });

    if let Some(window) = app.get_webview_window("main") {
        window.set_title("Frame Lab")?;
    }
    Ok(())
}
/* @arkzen:desktop:frame:tauri:end */

// ═════════════════════════════════════════════════════════════════════════════
// SCREENS — Expo and bare React Native share these blocks
// ═════════════════════════════════════════════════════════════════════════════

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
/* @arkzen:import:rn:end */

export const FrameCard = ({ title, body }: { title: string; body: string }) => (
  <View className="bg-white rounded-2xl p-5 border border-neutral-100 mb-3">
    <Text className="text-sm font-semibold text-neutral-800 mb-1">{title}</Text>
    <Text className="text-sm text-neutral-500 leading-5">{body}</Text>
  </View>
)

export const FrameCounter = () => {
  const [count, setCount] = useState(0)
  return (
    <View className="bg-white rounded-2xl border border-neutral-100 p-6 items-center">
      <Text className="text-xs text-neutral-400 uppercase tracking-widest mb-2">State check</Text>
      <Text className="text-5xl font-bold text-indigo-500 mb-4">{count}</Text>
      <TouchableOpacity
        onPress={() => setCount(c => c + 1)}
        className="rounded-2xl py-3 px-6 bg-indigo-500 items-center"
      >
        <Text className="text-white font-semibold">+1</Text>
      </TouchableOpacity>
    </View>
  )
}

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:index */

const IndexScreen = () => (
  <View className="flex-1 bg-neutral-50 px-6 pt-6">
    <Text className="text-3xl font-bold text-neutral-900 mb-2">Frame Lab</Text>
    <Text className="text-sm text-neutral-500 mb-6 leading-6">
      This screen has no header, tab bar or status bar of its own. Everything around it comes from
      the frame block for this target.
    </Text>
    <FrameCard
      title="Who draws the chrome?"
      body="Expo: app/frame-lab/_layout.tsx. React Native: screenOptions + Frame. Both come from this tatemono's frame blocks."
    />
    <FrameCounter />
  </View>
)

/* @arkzen:native:page:index:end */

/* @arkzen:native:page:settings */

const SettingsScreen = () => (
  <View className="flex-1 bg-neutral-50 px-6 pt-6">
    <Text className="text-3xl font-bold text-neutral-900 mb-2">Settings</Text>
    <FrameCard
      title="Second screen"
      body="On Expo this is the second tab. Remove the native:frame:expo block and the tab bar disappears; the screens keep working."
    />
  </View>
)

/* @arkzen:native:page:settings:end */

// ═════════════════════════════════════════════════════════════════════════════
// SCREENS — Lynx
// ═════════════════════════════════════════════════════════════════════════════

/* @arkzen:native:components:lynx:shared */

import { useState } from '@lynx-js/react'

const FrameCard = ({ title, body }: { title: string; body: string }) => (
  <view className="bg-white rounded-2xl p-5 border border-neutral-100 mb-3">
    <text className="text-sm font-semibold text-neutral-800 mb-1">{title}</text>
    <text className="text-sm text-neutral-500 leading-5">{body}</text>
  </view>
)

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:index */

const IndexLynxScreen = () => {
  const [count, setCount] = useState(0)
  return (
    <view className="flex-1 bg-neutral-50 px-6 pt-6">
      <text className="text-3xl font-bold text-neutral-900 mb-2">Frame Lab</text>
      <FrameCard
        title="Who draws the chrome?"
        body="The Frame component from @arkzen:native:frame:lynx wraps this screen."
      />
      <view
        bindtap={() => setCount(c => c + 1)}
        className="rounded-2xl py-3 px-6 bg-indigo-500 items-center"
      >
        <text className="text-white font-semibold">{`Taps: ${count}`}</text>
      </view>
    </view>
  )
}

/* @arkzen:native:page:lynx:index:end */

/* @arkzen:native:page:lynx:settings */

const SettingsLynxScreen = () => (
  <view className="flex-1 bg-neutral-50 px-6 pt-6">
    <text className="text-3xl font-bold text-neutral-900 mb-2">Settings</text>
    <FrameCard title="Second screen" body="Also wrapped by the Lynx frame." />
  </view>
)

/* @arkzen:native:page:lynx:settings:end */

// ═════════════════════════════════════════════════════════════════════════════
// WEB — what the Electron and Tauri windows show. The web stacks themselves
// do not use frames; this page only listens for commands from the desktop host.
// ═════════════════════════════════════════════════════════════════════════════

/* @arkzen:web:page:index */

'use client'

import React, { useEffect, useState } from 'react'

const IndexPage = () => {
  const [notes, setNotes] = useState<string[]>([])
  const [host, setHost] = useState('web (no desktop host)')

  useEffect(() => {
    const w = window as any
    const onCommand = (id: string) => {
      if (id === 'newNote') setNotes(n => [...n, 'Note ' + (n.length + 1)])
    }

    // Electron: preload bridge, only present when a frame:electron block exists.
    if (w.arkzenHost?.onCommand) {
      setHost('electron')
      return w.arkzenHost.onCommand(onCommand)
    }

    // Tauri: the host emits "arkzen:command" { id, payload }. The global event API
    // exists only if tauri.conf.json sets app.withGlobalTauri (off by default);
    // otherwise listen with @tauri-apps/api/event instead.
    if (w.__TAURI__?.event?.listen) {
      setHost('tauri')
      let stop: (() => void) | undefined
      w.__TAURI__.event.listen('arkzen:command', (e: any) => onCommand(e.payload?.id)).then((u: () => void) => { stop = u })
      return () => stop?.()
    }
  }, [])

  return (
    <div className="p-8 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-black text-neutral-800">Frame Lab</h1>
      <p className="text-sm text-neutral-500">Host: <code>{host}</code>. Use File → New Note in the desktop window.</p>
      <ul className="space-y-1">
        {notes.map(n => <li key={n} className="text-sm text-neutral-700">{n}</li>)}
      </ul>
    </div>
  )
}

/* @arkzen:web:page:index:end */
