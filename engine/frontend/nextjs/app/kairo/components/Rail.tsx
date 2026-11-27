'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Rail
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T10:14:50.347Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, buildSample, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { BookOpen, Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, Maximize, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
import { create } from 'zustand'

export const Rail = ({ tab, open, pick }: any) => (
  <nav className="kr-rail" aria-label="Sections">
    <svg className="kr-logo" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#b9e03c" />
      <path d="M7 9h9a7 7 0 0 1 0 14H7z" fill="#14180f" />
      <circle cx="25.6" cy="16" r="2.3" fill="#14180f" />
    </svg>
    {[['parts', Layers, 'Parts'], ['chips', Package, 'Your chips'], ['ex', BookOpen, 'Examples'], ['help', Info, 'How to']].map(([k, I, t]: any) => (
      <button key={k} className={'kr-rb' + (tab === k && open ? ' on' : '')} aria-label={t} aria-pressed={tab === k && open} onClick={() => pick(k)}>
        <I size={18} />
      </button>
    ))}
  </nav>
)
