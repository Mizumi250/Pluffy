'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — BoardView
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:42.072Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, buildSample, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { BookOpen, Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, Maximize, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
import { create } from 'zustand'
import { KR_NAME } from './constants'
import { useKairo, useLive } from './hooks'

export const BoardView = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  const st = useRef<any>(null)
  const [rect, setRect] = useState<any>(null)
  const [gone, setGone] = useState(false)
  const op = useRef<number[] | null>(null)
  const th = useRef<HTMLDivElement>(null)
  const hold = useRef<any>(null)
  const stop = () => {
    if (hold.current) clearInterval(hold.current)
    hold.current = null
  }
  const press = (dx: number, dy: number) => {
    stop()
    if (st.current) st.current.panBy(dx, dy)
    hold.current = setInterval(() => st.current && st.current.panBy(dx, dy), 16)
  }
  useEffect(() => stop, [])
  const parts: Part[] = useKairo((s: any) => s.parts)
  const tool = useKairo((s: any) => s.tool)
  const canU = useKairo((s: any) => s.past.length > 0)
  const canR = useKairo((s: any) => s.future.length > 0)
  const sel: number[] = useKairo((s: any) => s.sel)
  const groups = useMemo(() => {
    const m = new Map<number, string>()
    parts.forEach((q) => {
      if (q.g) m.set(q.g, q.gn || 'Group')
    })
    return Array.from(m, ([id, name]) => ({ id, name, c: '#' + gcol(name).toString(16).padStart(6, '0') }))
  }, [parts])
  const run = useKairo((s: any) => s.run)
  const speed = useKairo((s: any) => s.speed)
  const np = useKairo((s: any) => s.parts.length)
  const nw = useKairo((s: any) => s.wires.length)
  const fresh = np <= 4 && nw <= 3
  const t = useLive((s: any) => s.t)
  useEffect(() => {
    const g = new Stage(ref.current as HTMLCanvasElement, useKairo)
    let c = 0
    g.onMarquee = setRect
    g.onTick = (tk: number, vals: any, tg: any[]) => {
      const cur = useLive.getState()
      if (c++ % 3 === 0) useLive.setState({ t: tk, vals })
      if (tg.length || cur.tags.length) useLive.setState({ tags: tg })
    }
    g.tagHost = th.current
    st.current = g
    useKairo.setState({ stage: g })
    return () => {
      useKairo.setState({ stage: null })
      g.dispose()
    }
  }, [])
  const snap = (a: number, e: number) => st.current && st.current.snap(a, e)
  return (
    <section className="kr-board">
      <canvas ref={ref} tabIndex={0} aria-label="Circuit board. Drag a part to move it, drag from a pin to wire, right-drag to orbit, scroll to zoom." />
      <div className="kr-bh"><h2>Kairo board</h2><p>{np} parts, {nw} wires</p></div>
      <div className="kr-live"><i className={run ? 'on' : ''} />{run ? 'live' : 'paused'} <span>t {String(t).padStart(5, '0')}</span></div>
      <div
        className="kr-orb"
        aria-label="Orbit. Drag to rotate the board."
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          op.current = [e.clientX, e.clientY]
        }}
        onPointerMove={(e) => {
          if (!op.current || !st.current) return
          st.current.orbitBy(e.clientX - op.current[0], e.clientY - op.current[1])
          op.current = [e.clientX, e.clientY]
        }}
        onPointerUp={() => {
          op.current = null
        }}
      >
        <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" /><ellipse cx="32" cy="32" rx="30" ry="11" /><ellipse cx="32" cy="32" rx="11" ry="30" /></svg>
      </div>
      <div className="kr-tags" ref={th}>
        {sel.slice(0, 6).map((id) => {
          const q = parts.find((x) => x.id === id)
          return q ? <span key={'p' + id} data-t={'p:' + id} className="kr-tag kr-ptag">{(KR_NAME[q.kind] || q.kind).toUpperCase()}</span> : null
        })}
        {groups.map((g) => (
          <button key={'g' + g.id} data-t={'g:' + g.id} className="kr-gtag" style={{ borderColor: g.c }} onClick={() => useKairo.getState().selectGroup(g.id)}><i style={{ background: g.c }} />{g.name}</button>
        ))}
      </div>
      {rect && <div className="kr-marq" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />}
      {fresh && !gone && (
        <div className="kr-bubble">
          <span className="kr-tag">TRY THIS</span>
          <p>Click the switch. With it on, the lamp blinks with the clock through the NAND gate. With it off, the lamp stays lit. Open Examples on the left for bigger builds.</p>
          <button className="kr-pill lime" onClick={() => setGone(true)}>Got it</button>
        </div>
      )}
      <div className="kr-pad" role="group" aria-label="Pan the board">
        {[['', 0, 0, ''], ['W', 0, 12, 'Pan up'], ['F', 0, 0, 'Fit everything'], ['A', 12, 0, 'Pan left'], ['S', 0, -12, 'Pan down'], ['D', -12, 0, 'Pan right']].map(([k, dx, dy, t]: any, i) =>
          k === '' ? (
            <span key={i} />
          ) : k === 'F' ? (
            <button key={k} className="kr-key" title={t + ' (F)'} aria-label={t} onClick={() => st.current && st.current.fit()}>{k}</button>
          ) : (
            <button
              key={k}
              className="kr-key"
              title={t + ' (' + k + ')'}
              aria-label={t}
              onPointerDown={(e) => {
                e.preventDefault()
                press(dx, dy)
              }}
              onPointerUp={stop}
              onPointerLeave={stop}
              onPointerCancel={stop}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (st.current) st.current.panBy(dx * 6, dy * 6)
                }
              }}
            >
              {k}
            </button>
          ),
        )}
      </div>
      <div className="kr-dock">
        <button className="kr-pill dark" onClick={() => useKairo.setState({ run: !run })}>
          {run ? <Pause size={14} /> : <Play size={14} />}
          {run ? 'Pause' : 'Run'}
        </button>
        <button className="kr-pill" title="Simulation speed" aria-label="Simulation speed" onClick={() => useKairo.setState({ speed: speed >= 8 ? 1 : speed * 2 })}>{speed}x</button>
        <i className="kr-sep" />
        <button className="kr-pill" title="Undo (Ctrl+Z)" aria-label="Undo" disabled={!canU} onClick={() => useKairo.getState().undo()}><Undo2 size={14} /></button>
        <button className="kr-pill" title="Redo (Ctrl+Shift+Z)" aria-label="Redo" disabled={!canR} onClick={() => useKairo.getState().redo()}><Redo2 size={14} /></button>
        <button className={'kr-pill' + (tool === 'select' ? ' on' : '')} title="Select tool (V). Drag a box to select. Alt-click adds or removes one part." aria-label="Select tool" aria-pressed={tool === 'select'} onClick={() => useKairo.setState({ tool: tool === 'select' ? 'orbit' : 'select' })}><MousePointer2 size={14} /></button>
        <i className="kr-sep" />
        <button className="kr-pill" onClick={() => snap(Math.PI / 4, 0.6155)}>Iso</button>
        <button className="kr-pill" onClick={() => snap(st.current ? st.current.az : 0, 1.5)}>Top</button>
        <button className="kr-pill" aria-label="Rotate left" onClick={() => snap(st.current.az + Math.PI / 2, st.current.el)}><RotateCcw size={14} /></button>
        <button className="kr-pill" aria-label="Rotate right" onClick={() => snap(st.current.az - Math.PI / 2, st.current.el)}><RotateCw size={14} /></button>
        <button className="kr-pill" title="Fit all (F)" aria-label="Fit all" onClick={() => st.current && st.current.fit()}><Maximize size={14} /></button>
        <i className="kr-sep" />
        <button className="kr-pill" aria-label="Delete selection" onClick={() => useKairo.getState().remove()}><Trash2 size={14} /></button>
      </div>
    </section>
  )
}
