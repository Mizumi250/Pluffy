'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Parts
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:11:30.094Z
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

export const Parts = () => {
  const add = useKairo((s) => s.add)
  const lib = useKairo((s) => s.lib)
  const names = Object.keys(lib)
  const rows = [
    { k: 'in', t: 'Switch', d: 'An input you flip by clicking it.', I: ToggleRight, c: '#f2a08a' },
    { k: 'nand', t: 'NAND gate', d: 'Outputs 0 only when both inputs are 1.', I: Cpu, c: '#b9e03c' },
    { k: 'out', t: 'Lamp', d: 'Lights up when its input is 1.', I: Lightbulb, c: '#f7cf3d' },
  ]
  return (
    <aside className="kr-side">
      <header className="kr-brand">
        <h1>Kairo</h1>
        <p>Wire gates together, save the result as a chip, then use that chip as a part.</p>
      </header>
      <h2 className="kr-h">Parts</h2>
      {rows.map((r) => (
        <button key={r.k} className="kr-row" onClick={() => add(r.k)}>
          <span className="kr-sw" style={{ background: r.c }}><r.I size={18} /></span>
          <span><b>{r.t}</b><small>{r.d}</small></span>
        </button>
      ))}
      <h2 className="kr-h">Your chips</h2>
      {names.length === 0 && <p className="kr-note">Nothing yet. Build a circuit, name it on the right, and it shows up here.</p>}
      {names.map((n) => {
        const d = lib[n]
        const i = d.parts.filter((p) => p.kind === 'in').length
        const o = d.parts.filter((p) => p.kind === 'out').length
        return (
          <button key={n} className="kr-row" onClick={() => add('chip', n)}>
            <span className="kr-sw" style={{ background: '#86c1ea' }}><Package size={18} /></span>
            <span><b>{n}</b><small>{i} in, {o} out</small></span>
          </button>
        )
      })}
    </aside>
  )
}
