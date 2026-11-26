'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — PartTile
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:03:48.137Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, buildSample, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { BookOpen, Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, Maximize, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
import { create } from 'zustand'
import { KR_TILE } from './constants'

export const PartTile = ({ kind }: { kind: string }) => {
  const gl = (d: string, extra?: React.ReactNode) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {extra}
      <path d={d} />
    </svg>
  )
  const bub = (cx: number) => <circle cx={cx} cy="12" r="1.6" />
  const G: Record<string, React.ReactNode> = {
    and: gl('M5 5h6a7 7 0 0 1 0 14H5zM1 9h4M1 15h4M18 12h5'),
    nand: gl('M5 5h6a7 7 0 0 1 0 14H5zM1 9h4M1 15h4M21.2 12H23', bub(19.6)),
    or: gl('M4 5c5 0 10 2 14 7-4 5-9 7-14 7 3-5 3-9 0-14zM1 9h4M1 15h4M18 12h5'),
    nor: gl('M4 5c4.5 0 9 2 13 7-4 5-8.5 7-13 7 3-5 3-9 0-14zM1 9h4M1 15h4M20.6 12H23', bub(18.8)),
    xor: gl('M6 5c5 0 9 2 12 7-3 5-7 7-12 7 3-5 3-9 0-14zM2 5c3 5 3 9 0 14M1 9h3.6M1 15h3.6M18 12h5'),
    xnor: gl('M5 5c4.5 0 8.5 2 11 7-2.5 5-6.5 7-11 7 3-5 3-9 0-14zM1.5 5c3 5 3 9 0 14M1 9h3M1 15h3M19.4 12H23', bub(17.7)),
    not: gl('M5 5v14l11-7zM1 12h4M19.4 12H23', bub(17.7)),
    buf: gl('M5 5v14l13-7zM1 12h4M18 12h5'),
    fan: gl('M12 12c0-4 1-7 4-7 1 2 0 5-4 7zM12 12c4 0 7 1 7 4-2 1-5 0-7-4zM12 12c0 4-1 7-4 7-1-2 0-5 4-7zM12 12c-4 0-7-1-7-4 2-1 5 0 7 4z'),
    motor: gl('M12 8V5M12 19v-3M8 12H5M19 12h-3M9.2 9.2L7 7M17 17l-2.2-2.2M14.8 9.2L17 7M7 17l2.2-2.2', <circle cx="12" cy="12" r="3.5" />),
    tl: gl('M9 3h6a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', <><circle cx="12" cy="8" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="12" cy="16" r="1.3" /></>),
    bar: gl('M8 7h8M8 11h8M8 15h8M8 19h8', <rect x="5" y="3" width="14" height="18" rx="2" />),
    dff: gl('M4 15l3-2-3-2M9 8h1M14 8h1', <rect x="4" y="4" width="16" height="16" rx="2" />),
    seg: gl('M8 7h8M8 12h8M8 17h8', <rect x="5" y="3" width="14" height="18" rx="2" />),
    btn: gl('M12 9.4v0', <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.6" fill="currentColor" /></>),
    hi: gl('M9 8l3-3v14M8.5 19h7'),
    in: <ToggleRight size={18} />,
    clk: <Timer size={18} />,
    out: <Lightbulb size={18} />,
  }
  return <span className="kr-tile" style={{ background: KR_TILE[kind] }}>{G[kind] || <Package size={18} />}</span>
}
