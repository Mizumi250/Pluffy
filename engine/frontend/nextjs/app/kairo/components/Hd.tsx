'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Hd
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T03:16:25.473Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
import { create } from 'zustand'

export const Hd = ({ t, onHide }: { t: string; onHide: () => void }) => (
  <div className="kr-hd">
    <h1 className="kr-ttl">{t}</h1>
    <button className="kr-x" aria-label="Hide panel" onClick={onHide}><ChevronLeft size={16} /></button>
  </div>
)
