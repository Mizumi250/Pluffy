'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — SidePanel
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T03:16:25.478Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
import { create } from 'zustand'
import { KR_DESC, KR_NAME } from './constants'
import { useKairo } from './hooks'
import { Hd } from './Hd'
import { PartTile } from './PartTile'

export const SidePanel = ({ tab, onHide }: { tab: string; onHide: () => void }) => {
  const add = useKairo((s: any) => s.add)
  const stamp = useKairo((s: any) => s.stamp)
  const lib: Lib = useKairo((s: any) => s.lib)
  const n = useKairo((s: any) => s.parts.length)
  const exportChip = useKairo((s: any) => s.exportChip)
  const names = Object.keys(lib)
  const dragged = useRef(false)
  const begin = (e: React.PointerEvent, k: string, chip?: string) => {
    if (e.button !== 0) return
    const sx = e.clientX
    const sy = e.clientY
    let on = false
    const over = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null
      return !!el && !el.closest('.kr-col, .kr-rail, .kr-dock, .kr-open, .kr-orb')
    }
    const mv = (ev: PointerEvent) => {
      if (!on && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return
      if (!on) {
        on = true
        document.body.style.cursor = 'grabbing'
        useKairo.setState({ drag: { k, chip } })
      }
      useKairo.setState({ dragPos: over(ev.clientX, ev.clientY) ? [ev.clientX, ev.clientY] : null })
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', mv)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      if (!on) return
      document.body.style.cursor = ''
      const g = useKairo.getState().stage
      if (ev.type === 'pointerup' && g && over(ev.clientX, ev.clientY)) {
        const [x, y] = g.world(ev.clientX, ev.clientY)
        if (chip) stamp(chip, x, y)
        else add(k, undefined, x, y)
      }
      useKairo.setState({ drag: null, dragPos: null })
      dragged.current = true
      setTimeout(() => {
        dragged.current = false
      }, 50)
    }
    window.addEventListener('pointermove', mv)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }
  const card = (k: string, chip?: string) => (
    <div
      key={chip || k}
      role="button"
      tabIndex={0}
      className="kr-card btn"
      onPointerDown={(e) => begin(e, k, chip)}
      onClick={() => {
        if (dragged.current) return
        if (chip) stamp(chip)
        else add(k)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (chip) stamp(chip)
          else add(k)
        }
      }}
    >
      <PartTile kind={k} />
      <span>
        <b>{chip || KR_NAME[k]}</b>
        <small>{chip ? lib[chip].parts.length + ' parts, ' + lib[chip].wires.length + ' wires' : KR_DESC[k]}</small>
      </span>
      {chip && (
        <button
          className="kr-x"
          style={{ marginLeft: 'auto' }}
          title="Export chip"
          aria-label={'Export ' + chip}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            exportChip(chip)
          }}
        >
          <Download size={14} />
        </button>
      )}
    </div>
  )
  if (tab === 'help')
    return (
      <aside className="kr-col kr-l">
        <Hd t="How to" onHide={onHide} />
        {[
          ['Move a part', 'Drag it.'],
          ['Wire two parts', 'Drag from a dark green output pin to an input pin.'],
          ['Flip a switch', 'Click it.'],
          ['Orbit the board', 'Drag empty space, or use the orbit disc.'],
          ['Pan', 'Hold Space and drag, or Shift and middle-drag.'],
          ['Select several', 'Press V or the pointer button, then drag a box. Shift-drag works anytime.'],
          ['Add or remove one', 'Alt-click a part.'],
          ['Undo and redo', 'Ctrl+Z and Ctrl+Shift+Z.'],
          ['Drag from the list', 'Drag a part or chip onto the board.'],
          ['Export and import', 'Use Board file in the inspector. Each chip has its own export button.'],
          ['Select a whole chip', 'Click its colored outline or its name tag.'],
          ['Zoom', 'Scroll.'],
          ['Delete', 'Select, then press Delete.'],
        ].map(([t, d]) => (
          <div key={t} className="kr-card col"><b>{t}</b><small>{d}</small></div>
        ))}
      </aside>
    )
  if (tab === 'chips')
    return (
      <aside className="kr-col kr-l">
        <Hd t="Your chips" onHide={onHide} />
        {names.length === 0 && <div className="kr-card col"><small>Nothing yet. Build a circuit, name it on the right, and it shows up here.</small></div>}
        {names.map((c) => card('chip', c))}
      </aside>
    )
  return (
    <aside className="kr-col kr-l">
      <Hd t="Parts" onHide={onHide} />
      {card('in')}
      {card('clk')}
      <div className="kr-lbl"><span>GATES AND OUTPUTS</span><span>{n} ON BOARD</span></div>
      {card('nand')}
      {card('out')}
    </aside>
  )
}
