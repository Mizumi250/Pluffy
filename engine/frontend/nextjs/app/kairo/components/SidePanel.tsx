'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — SidePanel
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T06:51:35.081Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, buildSample, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { BookOpen, Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, Maximize, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
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
  const loadSample = useKairo((s: any) => s.loadSample)
  const placeSample = useKairo((s: any) => s.placeSample)
  const names = Object.keys(lib)
  const dragged = useRef(false)
  const begin = (e: React.PointerEvent, k: string, chip?: string, sample?: string) => {
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
        useKairo.setState({ drag: { k, chip, sample } })
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
        if (sample) placeSample(sample, x, y)
        else if (chip) stamp(chip, x, y)
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
  const tile = (k: string) => (
    <div
      key={k}
      role="button"
      tabIndex={0}
      className="kr-tilebtn"
      title={KR_NAME[k] + ': ' + KR_DESC[k]}
      onPointerDown={(e) => begin(e, k)}
      onClick={() => {
        if (!dragged.current) add(k)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          add(k)
        }
      }}
    >
      <PartTile kind={k} />
      <b>{KR_NAME[k]}</b>
    </div>
  )
  if (tab === 'ex')
    return (
      <aside className="kr-col kr-l">
        <Hd t="Examples" onHide={onHide} />
        <p style={{ margin: '0 0 12px', fontSize: 12, lineHeight: 1.45, color: 'var(--ink2)' }}>Click one to replace the board, or drag it onto the board to add it next to what you have.</p>
        {[
          ['adder', '4-bit adder', 'Flip the A and B switches. The lamps show the sum in binary, lowest bit on the left. The last lamp is the carry.'],
          ['counter', '4-bit counter', 'Four flip-flops count clock pulses in binary. Raise the speed to watch the high bits move.'],
          ['display', 'Counter with display', 'A 2-bit counter drives a 7-segment digit through a few gates. It counts 0 to 3.'],
          ['traffic', 'Traffic light', 'A 2-bit counter and three gates step through green, yellow and red. Red lasts two steps.'],
          ['fan', 'Fan and motor', 'Flip the switch to spin the fan. Hold the button to cut its power. The clock pulses the motor on and off.'],
        ].map(([k, t, d]) => (
          <div
            key={k}
            role="button"
            tabIndex={0}
            className="kr-card btn"
            onPointerDown={(e) => begin(e, 'sample', undefined, k)}
            onClick={() => {
              if (!dragged.current) loadSample(k)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                loadSample(k)
              }
            }}
          >
            <span className="kr-tile" style={{ background: '#cfe58a' }}><BookOpen size={18} /></span>
            <span><b>{t}</b><small>{d}</small></span>
          </div>
        ))}
      </aside>
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
          ['Pan', 'Right-drag, middle-drag, hold Space and drag, press W A S D, or use the key pad at the bottom right.'],
          ['Fit everything', 'Press F or the fit button in the bottom bar.'],
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
      {[['INPUTS', ['in', 'btn', 'clk', 'hi']], ['GATES', ['nand', 'and', 'or', 'buf', 'not', 'nor', 'xor', 'xnor']], ['MEMORY', ['dff']], ['OUTPUTS', ['out', 'bar', 'seg', 'tl']], ['ROBOTICS', ['fan', 'motor']]].map(([label, ks]: any) => (
        <div key={label}>
          <div className="kr-lbl"><span>{label}</span><span>{label === 'INPUTS' ? n + ' ON BOARD' : ''}</span></div>
          <div className="kr-grid">{ks.map((k: string) => tile(k))}</div>
        </div>
      ))}
    </aside>
  )
}
