'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — KairoApp
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T03:16:25.494Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
import { create } from 'zustand'
import { useKairo } from './hooks'
import { BoardView } from './BoardView'
import { Inspector } from './Inspector'
import { Rail } from './Rail'
import { SidePanel } from './SidePanel'

export const KairoApp = () => {
  const [tab, setTab] = useState('parts')
  const [lo, setLo] = useState(true)
  const [ro, setRo] = useState(true)
  const load = useKairo((s: any) => s.load)
  useEffect(() => {
    load()
  }, [load])
  const pick = (k: string) => {
    if (k === tab && lo) setLo(false)
    else {
      setTab(k)
      setLo(true)
    }
  }
  return (
    <div className="kr-root">
      <div className="kr-win">
        <BoardView />
        <Rail tab={tab} open={lo} pick={pick} />
        {lo && <SidePanel tab={tab} onHide={() => setLo(false)} />}
        {ro ? (
          <Inspector onHide={() => setRo(false)} />
        ) : (
          <button className="kr-x kr-open" aria-label="Show inspector" onClick={() => setRo(true)}><ChevronLeft size={16} /></button>
        )}
      </div>
    </div>
  )
}
