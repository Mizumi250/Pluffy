// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — kairo
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:03:48.121Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, buildSample, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { BookOpen, Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, Maximize, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
import { create } from 'zustand'


export const KR_NAME: Record<string, string> = { in: 'Switch', btn: 'Button', clk: 'Clock', hi: 'High', nand: 'NAND', and: 'AND', or: 'OR', not: 'NOT', nor: 'NOR', xor: 'XOR', xnor: 'XNOR', buf: 'Buffer', dff: 'D flip-flop', out: 'Lamp', bar: 'LED bar', seg: '7-segment', tl: 'Traffic light', fan: 'Fan', motor: 'Motor', chip: 'Chip' }

export const KR_DESC: Record<string, string> = {
  in: 'An input you flip by clicking it.',
  btn: 'An input that is 1 only while you hold it down.',
  clk: 'Swaps between 0 and 1 on its own while the board runs.',
  hi: 'Always outputs 1.',
  nand: 'Outputs 0 only when both inputs are 1.',
  and: 'Outputs 1 only when both inputs are 1.',
  or: 'Outputs 1 when at least one input is 1.',
  not: 'Flips its input.',
  buf: 'Passes its input through, one tick later.',
  bar: 'Four inputs light four bars, top to bottom.',
  tl: 'Three inputs light red, yellow and green, top to bottom.',
  fan: 'Spins up while its input is 1 and slows down when it is 0.',
  motor: 'Turns a gear while its input is 1.',
  nor: 'Outputs 1 only when both inputs are 0.',
  xor: 'Outputs 1 when the inputs differ.',
  xnor: 'Outputs 1 when the inputs match.',
  dff: 'Copies D to Q on the rising edge of CK. NQ is the opposite of Q.',
  out: 'Lights up when its input is 1.',
  seg: 'Seven inputs, a to g from the top, light the segments of one digit.',
  chip: 'A saved circuit that works as one part.',
}

export const KR_TILE: Record<string, string> = { in: '#f6c1b0', btn: '#f2a08a', clk: '#cfe58a', hi: '#d7e87a', nand: '#b9e03c', and: '#a7d8f0', or: '#f7d28a', not: '#f4b6c2', nor: '#f2a08a', xor: '#9fe0c9', xnor: '#e6d27a', dff: '#86c1ea', out: '#f7cf3d', seg: '#cfd8c4', buf: '#d5dcc8', bar: '#cfe58a', tl: '#f4b6c2', fan: '#a7d8f0', motor: '#e6d27a', chip: '#86c1ea' }
