'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — PartTile
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T03:16:25.464Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
import { create } from 'zustand'
import { KR_TILE } from './constants'

export const PartTile = ({ kind }: { kind: string }) => {
  const I: any = { in: ToggleRight, clk: Timer, nand: Cpu, out: Lightbulb, chip: Package }[kind] || Package
  return <span className="kr-tile" style={{ background: KR_TILE[kind] }}><I size={18} /></span>
}
