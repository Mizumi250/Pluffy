'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — BoardView
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:11:30.098Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { Cpu, Lightbulb, Package, Pause, Play, ToggleRight, Trash2 } from 'lucide-react'
import { create } from 'zustand'
import { useKairo } from './hooks'
import type { KairoState } from './types'

export const BoardView = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  const [rect, setRect] = useState<any>(null)
  const run = useKairo((s) => s.run)
  const speed = useKairo((s) => s.speed)
  const fresh = useKairo((s) => s.parts.length <= 4 && s.wires.length <= 3)
  useEffect(() => {
    const st = new Stage(ref.current as HTMLCanvasElement, useKairo)
    st.onMarquee = setRect
    return () => st.dispose()
  }, [])
  return (
    <section className="kr-board">
      <canvas ref={ref} tabIndex={0} aria-label="Circuit board. Drag a part to move it, drag from a pin to wire, scroll to zoom, hold space and drag to pan." />
      {rect && <div className="kr-marq" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />}
      {fresh && <p className="kr-hint">Drag from a dark green output pin to an input pin to wire two parts. Click a switch to flip it. Scroll to zoom, hold space and drag to pan.</p>}
      <div className="kr-bar">
        <button className="kr-btn" onClick={() => useKairo.setState({ run: !run })}>
          {run ? <Pause size={18} /> : <Play size={18} />}
          {run ? 'Pause' : 'Run'}
        </button>
        {[1, 2, 4, 8].map((n) => (
          <button key={n} className={'kr-seg' + (speed === n ? ' on' : '')} aria-pressed={speed === n} onClick={() => useKairo.setState({ speed: n })}>
            {n}x
          </button>
        ))}
      </div>
    </section>
  )
}
