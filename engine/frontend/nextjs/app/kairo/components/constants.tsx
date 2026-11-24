// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — kairo
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T03:16:25.455Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
import { create } from 'zustand'


export const KR_NAME: Record<string, string> = { in: 'Switch', clk: 'Clock', nand: 'NAND gate', out: 'Lamp', chip: 'Chip' }

export const KR_DESC: Record<string, string> = {
  in: 'An input you flip by clicking it.',
  clk: 'Swaps between 0 and 1 on its own while the board runs.',
  nand: 'Outputs 0 only when both inputs are 1.',
  out: 'Lights up when its input is 1.',
  chip: 'A saved circuit that works as one part.',
}

export const KR_TILE: Record<string, string> = { in: '#f6c1b0', clk: '#cfe58a', nand: '#b9e03c', out: '#f7cf3d', chip: '#86c1ea' }
