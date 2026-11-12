// ============================================================
// ARKZEN GENERATED PAGE — frame-lab/index [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-11-12T01:55:46.688Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useNavigate } from 'react-router'

// ── Page component from @arkzen:page:index ─────────────────────────────
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

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_FrameLab_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animation is managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_FrameLab_Index
