'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — kairo
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-25T01:29:24.886Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, buildSample, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { BookOpen, Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, Maximize, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
import { create } from 'zustand'

export const useLive = create<any>(() => ({ t: 0, vals: {}, tags: [] }))

export const useKairo = create<any>((set, get) => ({
  parts: START.parts,
  wires: START.wires,
  sel: [],
  wsel: 0,
  run: true,
  speed: 2,
  lib: { 'full-adder': buildSample('fulladder') },
  libVer: 0,
  nid: 10,
  view: [5, 1],
  msg: '',
  past: [],
  future: [],
  tool: 'orbit',
  drag: null,
  dragPos: null,
  stage: null,
  ui: { l: 336, r: 296 },
  select: (sel: number[]) => set({ sel, wsel: 0 }),
  pickWire: (id: number) => set({ wsel: id, sel: [] }),
  setView: (view: number[]) => set({ view }),
  mark: () => {
    const s = get()
    set({ past: [...s.past.slice(-99), { parts: s.parts, wires: s.wires }], future: [] })
  },
  undo: () => {
    const s = get()
    const p = s.past[s.past.length - 1]
    if (!p) return
    const on = new Map<number, any>(s.parts.map((q: Part) => [q.id, q.on]))
    set({ past: s.past.slice(0, -1), future: [...s.future, { parts: s.parts, wires: s.wires }], parts: p.parts.map((q: Part) => ({ ...q, on: on.get(q.id) })), wires: p.wires, sel: [], wsel: 0 })
  },
  redo: () => {
    const s = get()
    const f = s.future[s.future.length - 1]
    if (!f) return
    const on = new Map<number, any>(s.parts.map((q: Part) => [q.id, q.on]))
    set({ future: s.future.slice(0, -1), past: [...s.past, { parts: s.parts, wires: s.wires }], parts: f.parts.map((q: Part) => ({ ...q, on: on.get(q.id) })), wires: f.wires, sel: [], wsel: 0 })
  },
  toggle: (id: number) => set({ parts: get().parts.map((p: Part) => (p.id === id ? { ...p, on: !p.on } : p)) }),
  hold: (id: number, on: boolean) => set({ parts: get().parts.map((p: Part) => (p.id === id ? { ...p, on } : p)) }),
  moveTo: (st: Record<number, number[]>, dx: number, dy: number) =>
    set({ parts: get().parts.map((p: Part) => (st[p.id] ? { ...p, x: st[p.id][0] + dx, y: st[p.id][1] + dy } : p)) }),
  add: (kind: string, chip?: string, x?: number, y?: number) => {
    get().mark()
    const s = get()
    const o = s.nid % 3
    set({ nid: s.nid + 1, sel: [s.nid], wsel: 0, parts: [...s.parts, { id: s.nid, kind, chip, x: x ?? s.view[0] + o, y: y ?? s.view[1] + o }] })
  },
  download: (name: string, data: any) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  },
  exportBoard: () => {
    const s = get()
    const clean = (p: Part) => ({ id: p.id, kind: p.kind, x: p.x, y: p.y, chip: p.chip, on: p.on, g: p.g, gn: p.gn })
    get().download('kairo-board.json', { format: 'kairo-board', version: 1, parts: s.parts.map(clean), wires: s.wires, lib: s.lib })
    set({ msg: 'Exported kairo-board.json.' })
  },
  exportChip: (name: string) => {
    const d = get().lib[name]
    if (!d) return
    get().download('kairo-chip-' + name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.json', { format: 'kairo-chip', version: 1, name, parts: d.parts, wires: d.wires })
    set({ msg: 'Exported ' + name + '.' })
  },
  importFile: (text: string) => {
    let d: any
    try {
      d = JSON.parse(text)
    } catch (e) {
      return set({ msg: 'That file is not valid JSON.' })
    }
    const okp = (a: any) => Array.isArray(a) && a.every((p: any) => p && p.id > 0 && p.id < 131072 && ['in', 'out', 'nand', 'clk', 'chip', 'btn', 'hi', 'and', 'or', 'not', 'nor', 'xor', 'xnor', 'dff', 'seg', 'buf', 'bar', 'tl', 'fan', 'motor'].includes(p.kind) && typeof p.x === 'number' && typeof p.y === 'number')
    const okw = (a: any) => Array.isArray(a) && a.every((w: any) => w && typeof w.id === 'number' && Array.isArray(w.from) && Array.isArray(w.to))
    if (!d || !okp(d.parts) || !okw(d.wires)) return set({ msg: 'That does not look like a Kairo file.' })
    const s = get()
    const parts = d.parts.map((p: Part) => ({ id: p.id, kind: p.kind, x: p.x, y: p.y, chip: p.chip, on: !!p.on, g: p.g, gn: p.gn }))
    if (d.format === 'kairo-chip' && d.name) {
      set({ lib: { ...s.lib, [d.name]: { parts, wires: d.wires } }, libVer: s.libVer + 1, msg: 'Added ' + d.name + ' to Your chips.' })
      return
    }
    const lib: Lib = {}
    Object.entries(d.lib || {}).forEach(([k, v]: any) => {
      if (v && okp(v.parts) && okw(v.wires)) lib[k] = { parts: v.parts, wires: v.wires }
    })
    const top = Math.max(s.nid, ...parts.map((p: Part) => Math.max(p.id, p.g || 0)), ...d.wires.map((w: Wire) => w.id))
    get().mark()
    set({ parts, wires: d.wires, sel: [], wsel: 0, lib: { ...s.lib, ...lib }, libVer: s.libVer + 1, nid: top + 1, msg: 'Imported ' + parts.length + ' parts.' })
    setTimeout(() => {
      const g = get().stage
      if (g) g.fit()
    }, 0)
  },
  placeSample: (key: string, ox?: number, oy?: number) => {
    const d = buildSample(key)
    const s = get()
    const title: Record<string, string> = { adder: '4-bit adder', counter: '4-bit counter', display: 'Counter with display', traffic: 'Traffic light', fan: 'Fan and motor', fulladder: 'Full adder' }
    const mx = Math.min(...d.parts.map((p: Part) => p.x))
    const my = Math.min(...d.parts.map((p: Part) => p.y))
    let n = s.nid
    const solo = d.parts.some((p: Part) => p.g) ? 0 : n++
    const map: Record<number, number> = {}
    const gm: Record<number, number> = {}
    const np = d.parts.map((p: Part) => {
      const id = n++
      map[p.id] = id
      if (p.g && !gm[p.g]) gm[p.g] = n++
      const g = p.g ? gm[p.g] : solo
      return { id, kind: p.kind, x: p.x - mx + (ox ?? s.view[0]), y: p.y - my + (oy ?? s.view[1]), on: p.on, g: g || undefined, gn: g ? p.gn || title[key] : undefined }
    })
    const nw = d.wires.map((w: Wire) => ({ id: n++, from: [map[w.from[0]], w.from[1]], to: [map[w.to[0]], w.to[1]] }))
    get().mark()
    set({ nid: n, sel: np.map((p: Part) => p.id), wsel: 0, parts: [...s.parts, ...np], wires: [...s.wires, ...nw] })
  },
  loadSample: (name: string) => {
    const d = buildSample(name)
    const s = get()
    get().mark()
    const top = Math.max(...d.parts.map((p: Part) => Math.max(p.id, p.g || 0)), ...d.wires.map((w: Wire) => w.id))
    set({ parts: d.parts, wires: d.wires, sel: [], wsel: 0, nid: Math.max(s.nid, top + 1), msg: '' })
    setTimeout(() => {
      const g = get().stage
      if (g) g.fit()
    }, 0)
  },
  connect: (a: number[], b: number[]) => {
    const s = get()
    if (!s.parts.find((p: Part) => p.id === a[0]) || !s.parts.find((p: Part) => p.id === b[0])) return
    get().mark()
    const rest = s.wires.filter((w: Wire) => !(w.to[0] === b[0] && w.to[1] === b[1]))
    set({ nid: s.nid + 1, wires: [...rest, { id: s.nid, from: [a[0], a[1]], to: [b[0], b[1]] }] })
  },
  remove: () => {
    const s = get()
    if (!s.wsel && !s.sel.length) return
    get().mark()
    if (s.wsel) set({ wires: s.wires.filter((w: Wire) => w.id !== s.wsel), wsel: 0 })
    else if (s.sel.length)
      set({
        parts: s.parts.filter((p: Part) => !s.sel.includes(p.id)),
        wires: s.wires.filter((w: Wire) => !s.sel.includes(w.from[0]) && !s.sel.includes(w.to[0])),
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
      set({ msg: 'Could not reach the chip library. Chips you save stay in this tab.' })
    }
  },
  save: async (raw: string) => {
    const s = get()
    const name = raw.trim()
    const pick = s.sel.length ? s.parts.filter((p: Part) => s.sel.includes(p.id)) : s.parts
    if (!name) return set({ msg: 'Give the chip a name first.' })
    if (!pick.length) return set({ msg: 'Place at least one part first.' })
    get().mark()
    const ids = new Set(pick.map((p: Part) => p.id))
    const def = {
      parts: pick.map((p: Part) => ({ id: p.id, kind: p.kind, x: p.x, y: p.y, chip: p.chip })),
      wires: s.wires.filter((w: Wire) => ids.has(w.from[0]) && ids.has(w.to[0])),
    }
    set({
      nid: s.nid + 1,
      lib: { ...s.lib, [name]: def },
      libVer: s.libVer + 1,
      sel: pick.map((p: Part) => p.id),
      parts: s.parts.map((p: Part) => (ids.has(p.id) ? { ...p, g: s.nid, gn: name } : p)),
      msg: 'Saved ' + name + '. Add copies from Your chips.',
    })
    try {
      await arkzenFetch('/api/kairo/chips', { method: 'POST', body: JSON.stringify({ name, author: 'guest', blueprint: JSON.stringify(def) }) })
    } catch (e) {}
  },
  stamp: (name: string, ox?: number, oy?: number) => {
    const s = get()
    const d = s.lib[name]
    if (!d || !d.parts.length) return
    const mx = Math.min(...d.parts.map((p: Part) => p.x))
    const my = Math.min(...d.parts.map((p: Part) => p.y))
    let n = s.nid
    const gid = n++
    const map: Record<number, number> = {}
    const np = d.parts.map((p: Part) => {
      map[p.id] = n
      return { id: n++, kind: p.kind, chip: p.chip, x: p.x - mx + (ox ?? s.view[0]), y: p.y - my + (oy ?? s.view[1]), g: gid, gn: name }
    })
    const nw = d.wires.filter((w: Wire) => map[w.from[0]] && map[w.to[0]]).map((w: Wire) => ({ id: n++, from: [map[w.from[0]], w.from[1]], to: [map[w.to[0]], w.to[1]] }))
    get().mark()
    set({ nid: n, sel: np.map((p: Part) => p.id), wsel: 0, parts: [...s.parts, ...np], wires: [...s.wires, ...nw] })
  },
  ungroup: () => {
    const s = get()
    get().mark()
    set({ parts: s.parts.map((p: Part) => (s.sel.includes(p.id) ? { ...p, g: undefined, gn: undefined } : p)) })
  },
  selectGroup: (g: number) => set({ sel: get().parts.filter((p: Part) => p.g === g).map((p: Part) => p.id), wsel: 0 }),
}))
