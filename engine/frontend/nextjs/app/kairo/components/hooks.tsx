'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — kairo
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:40:33.582Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { Cpu, Lightbulb, Package, Pause, Play, ToggleRight, Trash2 } from 'lucide-react'
import { create } from 'zustand'
import type { KairoState } from './types'

export const useKairo = create<KairoState>((set, get) => ({
  parts: START.parts,
  wires: START.wires,
  sel: [],
  wsel: 0,
  run: true,
  speed: 2,
  lib: {},
  libVer: 0,
  nid: 10,
  view: [5, 1],
  msg: '',
  select: (sel: number[]) => set({ sel, wsel: 0 }),
  pickWire: (id: number) => set({ wsel: id, sel: [] }),
  setView: (view: number[]) => set({ view }),
  toggle: (id: number) => set({ parts: get().parts.map((p) => (p.id === id ? { ...p, on: !p.on } : p)) }),
  moveTo: (st: Record<number, number[]>, dx: number, dy: number) =>
    set({ parts: get().parts.map((p) => (st[p.id] ? { ...p, x: st[p.id][0] + dx, y: st[p.id][1] + dy } : p)) }),
  add: (kind: string, chip?: string) => {
    const s = get()
    const o = s.nid % 3
    set({ nid: s.nid + 1, sel: [s.nid], wsel: 0, parts: [...s.parts, { id: s.nid, kind, chip, x: s.view[0] + o, y: s.view[1] + o }] })
  },
  connect: (a: number[], b: number[]) => {
    const s = get()
    if (!s.parts.find((p) => p.id === a[0]) || !s.parts.find((p) => p.id === b[0])) return
    const rest = s.wires.filter((w) => !(w.to[0] === b[0] && w.to[1] === b[1]))
    set({ nid: s.nid + 1, wires: [...rest, { id: s.nid, from: [a[0], a[1]], to: [b[0], b[1]] }] })
  },
  remove: () => {
    const s = get()
    if (s.wsel) set({ wires: s.wires.filter((w) => w.id !== s.wsel), wsel: 0 })
    else if (s.sel.length)
      set({
        parts: s.parts.filter((p) => !s.sel.includes(p.id)),
        wires: s.wires.filter((w) => !s.sel.includes(w.from[0]) && !s.sel.includes(w.to[0])),
        sel: [],
      })
  },
  load: async () => {
    try {
      const r = await arkzenFetch('/api/kairo/chips?per_page=100')
      const d = await r.json()
      const lib: Lib = {}
      ;(d?.data ?? []).forEach((c: any) => {
        try {
          const b = JSON.parse(c.blueprint)
          if (b && b.parts && b.wires) lib[c.name] = b
        } catch (e) {}
      })
      set({ lib: { ...get().lib, ...lib }, libVer: get().libVer + 1 })
    } catch (e) {
      set({ msg: 'Could not reach the chip library. Chips you save will stay in this tab.' })
    }
  },
  save: async (raw: string) => {
    const s = get()
    const name = raw.trim()
    const pick = s.sel.length ? s.parts.filter((p) => s.sel.includes(p.id)) : s.parts
    const ids = new Set(pick.map((p) => p.id))
    const def = {
      parts: pick.map((p) => ({ id: p.id, kind: p.kind, x: p.x, y: p.y, chip: p.chip })),
      wires: s.wires.filter((w) => ids.has(w.from[0]) && ids.has(w.to[0])),
    }
    if (!name) return set({ msg: 'Give the chip a name first.' })
    if (!pick.some((p) => p.kind === 'in') || !pick.some((p) => p.kind === 'out'))
      return set({ msg: 'A chip needs at least one switch and one lamp. They become its input and output pins.' })
    set({ lib: { ...s.lib, [name]: def }, libVer: s.libVer + 1, msg: 'Saved ' + name + '. Add it from Your chips.' })
    try {
      await arkzenFetch('/api/kairo/chips', { method: 'POST', body: JSON.stringify({ name, author: 'guest', blueprint: JSON.stringify(def) }) })
    } catch (e) {}
  },
}))
